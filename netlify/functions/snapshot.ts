import { Handler } from "@netlify/functions";
import { RiotService } from "./lib/riot.service";
import { BlobsService } from "./lib/blobs.service";
import { Snapshot } from "./lib/types";

const blobsService = new BlobsService();

// Queue ID for Ranked Solo/Duo
const RANKED_SOLO_QUEUE_ID = 420;

// Minimum game duration to count (5 minutes in milliseconds)
// Games shorter than this are remakes and shouldn't count for streak
const MIN_GAME_DURATION_MS = 5 * 60 * 1000;

// Account configurations
const ACCOUNTS: Record<string, { gameName: string; tagLine: string }> = {
    account1: { gameName: 'yunara literal', tagLine: 'abs' },
    account2: { gameName: 'lamej0r', tagLine: 'LAS' },
    account3: { gameName: 'waos', tagLine: 'kmu' },
};

// Simple in-memory lock to prevent concurrent processing
const processingLocks: Record<string, { isProcessing: boolean; lastStart: number }> = {};
const PROCESSING_TIMEOUT = 120000; // 2 minutes max

// Helper to get deaths for an account (from saved snapshot)
async function getAccountDeaths(accountKey: string): Promise<number> {
    const accountConfig = ACCOUNTS[accountKey];
    if (!accountConfig) return 0;

    try {
        const snapshot = await blobsService.getLastSnapshot(accountKey);
        if (snapshot && snapshot.accountDeaths !== undefined) {
            return snapshot.accountDeaths;
        }
        return 0;
    } catch (e) {
        console.warn(`⚠️ Failed to get deaths for ${accountKey}:`, e);
        return 0;
    }
}

export const handler: Handler = async (event, context) => {
    const START_DATE = process.env.START_DATE || '2025-12-16T00:00:00-03:00';
    const CHAMPION_FILTER = process.env.CHAMPION_FILTER || 'Yunara';

    // Get account from query param (default to account1)
    const accountKey = event.queryStringParameters?.account || 'account1';
    const accountConfig = ACCOUNTS[accountKey] || ACCOUNTS['account1'];
    const GAME_NAME = accountConfig.gameName;
    const TAG_LINE = accountConfig.tagLine;

    const reset = event.queryStringParameters?.reset === 'true';
    const now = Date.now();

    console.log(`🚀 Snapshot handler - Account: ${accountKey} (${GAME_NAME}#${TAG_LINE}), Filter: ${CHAMPION_FILTER}${reset ? ' [RESET]' : ''}`);

    // Initialize lock for this account
    if (!processingLocks[accountKey]) {
        processingLocks[accountKey] = { isProcessing: false, lastStart: 0 };
    }
    const lock = processingLocks[accountKey];

    try {
        // Handle Reset
        if (reset) {
            console.log(`🧹 Resetting state for ${accountKey}...`);
            lock.isProcessing = false;
            await blobsService.saveState({
                matchCache: {},
                processedMatchIds: [],
                lastProcessedMatchTime: 0,
                deathsTotal: 0
            }, accountKey);
            await blobsService.saveSnapshot({
                accountDeaths: 0,
                accountAbs: 0,
                todayDeaths: 0,
                todayAbs: 0,
                totalDeaths: 0,
                totalAbs: 0,
                deathsTotal: 0,
                absTotal: 0,
                dayNumber: 1,
                rank: { tier: 'UNRANKED', division: '', lp: 0, wins: 0, losses: 0 },
                lastMatches: [],
                generatedAt: 0,
                stale: false
            }, accountKey);
            return {
                statusCode: 200,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: `State reset for ${accountKey}` })
            };
        }

        // Check if already processing (with timeout safety)
        if (lock.isProcessing && (now - lock.lastStart) < PROCESSING_TIMEOUT) {
            console.log(`⏳ Account ${accountKey} is processing, returning cached snapshot...`);
            const cached = await blobsService.getLastSnapshot(accountKey);
            if (cached) {
                let totalDeaths = cached.accountDeaths;
                for (const otherAccountKey of Object.keys(ACCOUNTS)) {
                    if (otherAccountKey !== accountKey) {
                        const otherDeaths = await getAccountDeaths(otherAccountKey);
                        totalDeaths += otherDeaths;
                    }
                }
                const totalAbs = totalDeaths * 5;

                return {
                    statusCode: 200,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...cached, stale: true, totalDeaths, totalAbs })
                };
            }
        }

        // Check cache first (30s TTL)
        const lastSnapshot = await blobsService.getLastSnapshot(accountKey);
        if (lastSnapshot && (now - lastSnapshot.generatedAt) < 30000) {
            console.log(`📦 Returning cached snapshot for ${accountKey} (${Math.round((now - lastSnapshot.generatedAt) / 1000)}s old)`);

            let totalDeaths = lastSnapshot.accountDeaths;
            for (const otherAccountKey of Object.keys(ACCOUNTS)) {
                if (otherAccountKey !== accountKey) {
                    const otherDeaths = await getAccountDeaths(otherAccountKey);
                    totalDeaths += otherDeaths;
                }
            }
            const totalAbs = totalDeaths * 5;

            return {
                statusCode: 200,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...lastSnapshot,
                    totalDeaths,
                    totalAbs
                })
            };
        }

        // Set processing lock
        lock.isProcessing = true;
        lock.lastStart = now;

        const riotService = new RiotService(process.env.RIOT_API_KEY || '');

        // Get account & Rank
        const account = await riotService.getAccount(GAME_NAME, TAG_LINE);

        let rankEntry: any = null;
        try {
            rankEntry = await riotService.getRankByPuuid(account.puuid);
            if (rankEntry) {
                const wins = rankEntry.wins || 0;
                const losses = rankEntry.losses || 0;
                const wr = wins + losses > 0 ? Math.round((wins / (wins + losses)) * 100) : 0;
                console.log(`📊 Rank data for ${accountKey}: ${wins}W ${losses}L = ${wr}% WR`);
            }
        } catch (err) {
            console.warn("⚠️ Failed to fetch rank:", err);
        }

        // Get ONLY SoloQ matches since START_DATE
        const challengeStartEpoch = Math.floor(new Date(START_DATE).getTime() / 1000);
        const matchIds = await riotService.getMatchIds(account.puuid, challengeStartEpoch, 100, RANKED_SOLO_QUEUE_ID);
        console.log(`📊 Found ${matchIds.length} SoloQ match IDs for ${accountKey}`);

        // Load State (Cache of match details)
        const state = await blobsService.getState(accountKey);
        const matchCache = state.matchCache || {};

        // Identify missing matches
        const missingMatchIds = matchIds.filter(id => !matchCache[id]);
        console.log(`🔍 ${missingMatchIds.length} new matches to fetch for ${accountKey}`);

        // Fetch details for MISSING matches only
        const BATCH_SIZE = 20;
        const matchesToFetch = missingMatchIds.slice(0, BATCH_SIZE);

        let matchesFetched = 0;
        for (const matchId of matchesToFetch) {
            try {
                const details = await riotService.getMatchDetails(matchId);
                const participant = details.info.participants.find(p => p.puuid === account.puuid);

                if (participant) {
                    // Calculate game duration in milliseconds
                    const gameDuration = details.info.gameDuration * 1000; // API returns seconds
                    const isRemake = gameDuration < MIN_GAME_DURATION_MS;

                    matchCache[matchId] = {
                        matchId: matchId,
                        queueId: details.info.queueId,
                        championName: participant.championName,
                        deaths: participant.deaths,
                        win: participant.win,
                        gameEndTimestamp: details.info.gameEndTimestamp,
                        gameDuration: gameDuration,
                        isRemake: isRemake
                    };
                    matchesFetched++;
                    console.log(`📥 Cached ${matchId} (${participant.championName})${isRemake ? ' [REMAKE]' : ''}`);
                }
            } catch (e: any) {
                if (e?.response?.status === 429) {
                    console.warn(`⚠️ Rate limited, stopping batch fetch`);
                    break;
                }
                console.error(`❌ Failed to fetch match ${matchId}`, e?.message || e);
            }
        }

        // Save state if we fetched anything
        if (matchesFetched > 0) {
            console.log(`💾 Saving ${matchesFetched} new matches for ${accountKey}`);
            state.matchCache = matchCache;
            await blobsService.saveState(state, accountKey);
        }

        // Calculate start of today (midnight in local timezone)
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayStartEpoch = todayStart.getTime();

        // Calculate account deaths
        let accountDeaths = 0;
        let todayDeaths = 0;
        let validMatchesCount = 0;
        const processedMatches: any[] = [];

        for (const matchId of matchIds) {
            const match = matchCache[matchId];
            if (!match) continue;
            if (match.queueId !== RANKED_SOLO_QUEUE_ID) continue;
            if (match.championName.toLowerCase() !== CHAMPION_FILTER.toLowerCase()) continue;

            validMatchesCount++;

            // Count deaths even from remakes (they still died)
            accountDeaths += match.deaths;

            // Check if match ended today
            if (match.gameEndTimestamp >= todayStartEpoch) {
                todayDeaths += match.deaths;
            }

            // Check if this match is a remake
            const isRemake = match.isRemake || (match.gameDuration && match.gameDuration < MIN_GAME_DURATION_MS);

            // Include ALL matches in lastMatches - remakes get 'remake' result which breaks streak
            let result: 'win' | 'loss' | 'remake';
            if (isRemake) {
                result = 'remake';
                console.log(`🔄 Match ${matchId} marked as remake (will break streak)`);
            } else {
                result = match.win ? 'win' : 'loss';
            }

            processedMatches.push({
                matchId: match.matchId,
                deaths: match.deaths,
                result,
                champion: match.championName,
                timestamp: match.gameEndTimestamp
            });
        }

        console.log(`🎯 Account ${accountKey}: ${validMatchesCount} ${CHAMPION_FILTER} games, ${accountDeaths} deaths, ${processedMatches.length} valid for streak`);

        // Calculate COMBINED total from all 3 accounts
        let totalDeaths = accountDeaths;
        for (const otherAccountKey of Object.keys(ACCOUNTS)) {
            if (otherAccountKey !== accountKey) {
                const otherDeaths = await getAccountDeaths(otherAccountKey);
                totalDeaths += otherDeaths;
                console.log(`📊 ${otherAccountKey} contributed ${otherDeaths} deaths to total`);
            }
        }

        const accountAbs = accountDeaths * 5;
        const totalAbs = totalDeaths * 5;
        const todayAbs = todayDeaths * 5;

        const stillMissing = matchIds.filter(id => !matchCache[id]).length;

        // Sort by timestamp descending and take last 10 for better streak accuracy
        const lastMatches = processedMatches
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 10);

        const dayNumber = Math.ceil((now - new Date(START_DATE).getTime()) / (1000 * 60 * 60 * 24));

        const snapshot: Snapshot = {
            accountDeaths,
            accountAbs,
            todayDeaths,
            todayAbs,
            totalDeaths,
            totalAbs,
            deathsTotal: accountDeaths,
            absTotal: accountAbs,
            dayNumber: Math.max(1, dayNumber),
            rank: {
                tier: rankEntry?.tier || "UNRANKED",
                division: rankEntry?.rank || "",
                lp: rankEntry?.leaguePoints || 0,
                wins: rankEntry?.wins || 0,
                losses: rankEntry?.losses || 0
            },
            lastMatches: lastMatches,
            generatedAt: Date.now(),
            stale: stillMissing > 0
        };

        await blobsService.saveSnapshot(snapshot, accountKey);

        // Release lock
        lock.isProcessing = false;

        console.log(`✅ Snapshot generated for ${accountKey}: ${accountDeaths}/${totalDeaths} deaths, ${accountAbs}/${totalAbs} abs`);

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(snapshot)
        };

    } catch (error: any) {
        console.error(`❌ Snapshot error for ${accountKey}:`, error?.message || error);
        lock.isProcessing = false;

        const fallback = await blobsService.getLastSnapshot(accountKey);
        if (fallback) {
            let totalDeaths = fallback.accountDeaths;
            for (const otherAccountKey of Object.keys(ACCOUNTS)) {
                if (otherAccountKey !== accountKey) {
                    try {
                        const otherDeaths = await getAccountDeaths(otherAccountKey);
                        totalDeaths += otherDeaths;
                    } catch { /* ignore errors in fallback */ }
                }
            }
            const totalAbs = totalDeaths * 5;

            return {
                statusCode: 200,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...fallback, stale: true, totalDeaths, totalAbs })
            };
        }

        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to generate snapshot" })
        };
    }
};