import { Handler } from "@netlify/functions";
import { RiotService } from "./lib/riot.service";
import { BlobsService } from "./lib/blobs.service";
import { Snapshot } from "./lib/types";

const blobsService = new BlobsService();

// Queue ID for Ranked Solo/Duo
const RANKED_SOLO_QUEUE_ID = 420;

// Simple in-memory lock to prevent concurrent processing
let isProcessing = false;
let lastProcessingStart = 0;
const PROCESSING_TIMEOUT = 120000; // 2 minutes max

export const handler: Handler = async (event, context) => {
    const START_DATE = process.env.START_DATE || '2025-12-16T00:00:00-03:00';
    const GAME_NAME = process.env.RIOT_GAME_NAME || 'JOVEN RICO';
    const TAG_LINE = process.env.RIOT_TAG_LINE || 'GNZ';
    const CHAMPION_FILTER = process.env.CHAMPION_FILTER || 'LeeSin';

    const reset = event.queryStringParameters?.reset === 'true';
    const now = Date.now();

    console.log(`🚀 Snapshot handler - Game: ${GAME_NAME}#${TAG_LINE}, Filter: ${CHAMPION_FILTER}, Start: ${START_DATE}${reset ? ' [RESET]' : ''}`);

    try {
        // Handle Reset
        if (reset) {
            console.log("🧹 Resetting state...");
            isProcessing = false;
            await blobsService.saveState({
                matchCache: {},
                processedMatchIds: [],
                lastProcessedMatchTime: 0,
                deathsTotal: 0
            });
            await blobsService.saveSnapshot({
                deathsTotal: 0,
                absTotal: 0,
                dayNumber: 1,
                rank: { tier: 'UNRANKED', division: '', lp: 0 },
                lastMatches: [],
                generatedAt: 0,
                stale: false
            });
            return {
                statusCode: 200,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: "State reset successfully" })
            };
        }

        // Check if already processing (with timeout safety)
        if (isProcessing && (now - lastProcessingStart) < PROCESSING_TIMEOUT) {
            console.log("⏳ Another request is processing, returning cached snapshot...");
            const cached = await blobsService.getLastSnapshot();
            if (cached) {
                return {
                    statusCode: 200,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...cached, stale: true })
                };
            }
        }

        // Check cache first (30s TTL)
        const lastSnapshot = await blobsService.getLastSnapshot();
        if (lastSnapshot && (now - lastSnapshot.generatedAt) < 30000) {
            console.log(`📦 Returning cached snapshot (${Math.round((now - lastSnapshot.generatedAt) / 1000)}s old)`);
            return {
                statusCode: 200,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(lastSnapshot)
            };
        }

        // Set processing lock
        isProcessing = true;
        lastProcessingStart = now;

        const riotService = new RiotService(process.env.RIOT_API_KEY || '');

        // Get account & Rank
        const account = await riotService.getAccount(GAME_NAME, TAG_LINE);

        let rankEntry: any = null;
        try {
            rankEntry = await riotService.getRankByPuuid(account.puuid);
        } catch (err) {
            console.warn("⚠️ Failed to fetch rank:", err);
        }

        // Get ONLY SoloQ matches since START_DATE (filtered at API level = much fewer results)
        const challengeStartEpoch = Math.floor(new Date(START_DATE).getTime() / 1000);
        const matchIds = await riotService.getMatchIds(account.puuid, challengeStartEpoch, 100, RANKED_SOLO_QUEUE_ID);
        console.log(`📊 Found ${matchIds.length} SoloQ match IDs from API`);

        // Load State (Cache of match details)
        const state = await blobsService.getState();
        const matchCache = state.matchCache || {};

        // Identify missing matches
        const missingMatchIds = matchIds.filter(id => !matchCache[id]);
        console.log(`🔍 ${missingMatchIds.length} new matches to fetch details for.`);

        // Fetch details for MISSING matches only
        // Batch size 20 = safe for Riot's rate limit (20 req/sec for dev keys)
        const BATCH_SIZE = 20;
        const matchesToFetch = missingMatchIds.slice(0, BATCH_SIZE);

        if (missingMatchIds.length > BATCH_SIZE) {
            console.log(`⚠️ Only fetching first ${BATCH_SIZE} of ${missingMatchIds.length} missing matches to avoid rate limits`);
        }

        let matchesFetched = 0;
        for (const matchId of matchesToFetch) {
            try {
                const details = await riotService.getMatchDetails(matchId);
                const participant = details.info.participants.find(p => p.puuid === account.puuid);

                if (participant) {
                    matchCache[matchId] = {
                        matchId: matchId,
                        queueId: details.info.queueId,
                        championName: participant.championName,
                        deaths: participant.deaths,
                        win: participant.win,
                        gameEndTimestamp: details.info.gameEndTimestamp
                    };
                    matchesFetched++;
                    console.log(`📥 Cached ${matchId} (${participant.championName})`);
                }
            } catch (e: any) {
                if (e?.response?.status === 429) {
                    console.warn(`⚠️ Rate limited, stopping batch fetch`);
                    break;
                }
                console.error(`❌ Failed to fetch match ${matchId}`, e?.message || e);
            }
        }

        // Always save state if we fetched anything
        if (matchesFetched > 0) {
            console.log(`💾 Saving ${matchesFetched} new matches to cache.`);
            state.matchCache = matchCache;
            await blobsService.saveState(state);
        }

        // Recalculate Totals from Cache
        let totalDeaths = 0;
        let validMatchesCount = 0;
        const processedMatches: any[] = [];

        for (const matchId of matchIds) {
            const match = matchCache[matchId];
            if (!match) continue;

            // Filter: SoloQ only
            if (match.queueId !== RANKED_SOLO_QUEUE_ID) continue;

            // Filter: Champion (case insensitive)
            if (match.championName.toLowerCase() !== CHAMPION_FILTER.toLowerCase()) continue;

            validMatchesCount++;
            totalDeaths += match.deaths;

            processedMatches.push({
                matchId: match.matchId,
                deaths: match.deaths,
                result: match.win ? 'win' : 'loss',
                champion: match.championName,
                timestamp: match.gameEndTimestamp
            });
        }

        console.log(`🎯 Total: ${validMatchesCount} ${CHAMPION_FILTER} SoloQ games, ${totalDeaths} deaths`);

        // Check if we still have missing matches (for UI feedback)
        const stillMissing = matchIds.filter(id => !matchCache[id]).length;
        if (stillMissing > 0) {
            console.log(`📊 Still ${stillMissing} matches pending (will fetch on next request)`);
        }

        const lastMatches = processedMatches
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 5);

        const dayNumber = Math.ceil((now - new Date(START_DATE).getTime()) / (1000 * 60 * 60 * 24));

        const snapshot: Snapshot = {
            deathsTotal: totalDeaths,
            absTotal: totalDeaths * 5,
            dayNumber: Math.max(1, dayNumber),
            rank: {
                tier: rankEntry?.tier || "UNRANKED",
                division: rankEntry?.rank || "",
                lp: rankEntry?.leaguePoints || 0
            },
            lastMatches: lastMatches,
            generatedAt: Date.now(),
            stale: stillMissing > 0 // Mark as stale if we're still catching up
        };

        await blobsService.saveSnapshot(snapshot);

        // Release lock
        isProcessing = false;

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(snapshot)
        };

    } catch (error: any) {
        console.error("❌ Snapshot generation error:", error?.message || error);
        isProcessing = false;

        const fallback = await blobsService.getLastSnapshot();
        if (fallback) {
            return {
                statusCode: 200,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...fallback, stale: true })
            };
        }

        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to generate snapshot" })
        };
    }
};