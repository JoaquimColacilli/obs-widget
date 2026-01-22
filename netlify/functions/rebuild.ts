// netlify/functions/rebuild.ts
// Endpoint para reconstruir el cache de partidas desde cero
// Uso: GET /api/rebuild?account=account1&secret=TU_SECRET

import { Handler } from "@netlify/functions";
import { RiotService } from "./lib/riot.service";
import { BlobsService } from "./lib/blobs.service";

// Queue ID for Ranked Solo/Duo
const RANKED_SOLO_QUEUE_ID = 420;

// Minimum game duration to count (5 minutes in milliseconds)
const MIN_GAME_DURATION_MS = 5 * 60 * 1000;

// Account configurations
const ACCOUNTS: Record<string, { gameName: string; tagLine: string }> = {
    account1: { gameName: "yunara literal", tagLine: "abs" },
    account2: { gameName: "lamej0r", tagLine: "LAS" },
    account3: { gameName: "waos", tagLine: "kmu" },
};

// Delay helper
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const handler: Handler = async (event, context) => {
    const blobsService = new BlobsService();

    const START_DATE = process.env.START_DATE || "2025-12-16T00:00:00-03:00";
    const CHAMPION_FILTER = process.env.CHAMPION_FILTER || "Yunara";
    const REBUILD_SECRET = process.env.REBUILD_SECRET || "camululis2025";

    // Validate secret (basic protection)
    const providedSecret = event.queryStringParameters?.secret;
    if (providedSecret !== REBUILD_SECRET) {
        return {
            statusCode: 401,
            body: JSON.stringify({ error: "Invalid or missing secret. Use ?secret=YOUR_SECRET" }),
        };
    }

    // Get account from query param
    const accountKey = event.queryStringParameters?.account || "account1";
    const accountConfig = ACCOUNTS[accountKey];

    if (!accountConfig) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: `Invalid account: ${accountKey}. Valid: account1, account2, account3` }),
        };
    }

    const GAME_NAME = accountConfig.gameName;
    const TAG_LINE = accountConfig.tagLine;

    console.log(`🔄 REBUILD started for ${accountKey} (${GAME_NAME}#${TAG_LINE})`);
    console.log(`📅 Fetching all matches since ${START_DATE}`);

    try {
        const riotApiKey = process.env.RIOT_API_KEY || "";
        const riotService = new RiotService(riotApiKey);

        // Get account PUUID
        const account = await riotService.getAccount(GAME_NAME, TAG_LINE);
        console.log(`✅ Got PUUID: ${account.puuid}`);

        // Get ALL SoloQ match IDs since START_DATE
        const challengeStartEpoch = Math.floor(new Date(START_DATE).getTime() / 1000);
        const matchIds = await riotService.getMatchIds(account.puuid, challengeStartEpoch, 100, RANKED_SOLO_QUEUE_ID);
        console.log(`📊 Found ${matchIds.length} SoloQ matches since ${START_DATE}`);

        // Load existing state
        const state = await blobsService.getState(accountKey);
        const matchCache = state.matchCache || {};

        // Identify ALL missing matches
        const missingMatchIds = matchIds.filter((id) => !matchCache[id]);
        console.log(`🔍 ${missingMatchIds.length} matches need to be fetched`);

        if (missingMatchIds.length === 0) {
            return {
                statusCode: 200,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: "Cache is already complete",
                    totalMatches: matchIds.length,
                    cachedMatches: Object.keys(matchCache).length,
                }),
            };
        }

        // Fetch ALL missing matches with intelligent rate limiting
        // Riot Dev Key: 20 requests/second, 100 requests/2 minutes
        // We'll do batches of 15 with 1.5s delay between each to stay safe
        const BATCH_SIZE = 15;
        const DELAY_BETWEEN_REQUESTS = 1500; // 1.5 seconds
        const DELAY_BETWEEN_BATCHES = 10000; // 10 seconds every batch

        let fetchedCount = 0;
        let errorCount = 0;
        const startTime = Date.now();

        for (let i = 0; i < missingMatchIds.length; i++) {
            const matchId = missingMatchIds[i];

            // Check remaining time (leave 10s buffer for saving)
            if (context.getRemainingTimeInMillis && context.getRemainingTimeInMillis() < 15000) {
                console.warn(`⏳ Time limit approaching, stopping at ${fetchedCount}/${missingMatchIds.length}`);
                break;
            }

            try {
                const details = await riotService.getMatchDetails(matchId);
                const participant = details.info.participants.find((p: any) => p.puuid === account.puuid);

                if (participant) {
                    const gameDuration = details.info.gameDuration * 1000;
                    const isRemake = gameDuration < MIN_GAME_DURATION_MS;

                    matchCache[matchId] = {
                        matchId: matchId,
                        queueId: details.info.queueId,
                        championName: participant.championName,
                        deaths: participant.deaths,
                        win: participant.win,
                        gameEndTimestamp: details.info.gameEndTimestamp,
                        gameDuration: gameDuration,
                        isRemake: isRemake,
                    };

                    fetchedCount++;

                    // Log progress every 10 matches
                    if (fetchedCount % 10 === 0) {
                        console.log(`📥 Progress: ${fetchedCount}/${missingMatchIds.length} (${participant.championName}, ${participant.deaths} deaths)`);
                    }
                }

                // Delay between requests
                await delay(DELAY_BETWEEN_REQUESTS);

                // Extra delay every BATCH_SIZE requests
                if ((i + 1) % BATCH_SIZE === 0 && i + 1 < missingMatchIds.length) {
                    console.log(`⏸️ Batch complete, waiting ${DELAY_BETWEEN_BATCHES / 1000}s...`);
                    await delay(DELAY_BETWEEN_BATCHES);
                }

            } catch (e: any) {
                errorCount++;
                const isRateLimitError = e?.message?.includes("Rate limit exceeded") || e?.response?.status === 429;

                if (isRateLimitError) {
                    console.warn(`⚠️ Rate limited at ${fetchedCount}/${missingMatchIds.length}, waiting 30s...`);
                    await delay(30000); // Wait 30 seconds on rate limit
                    i--; // Retry this match
                } else {
                    console.error(`❌ Failed to fetch ${matchId}: ${e?.message || e}`);
                    if (errorCount > 10) {
                        console.error(`❌ Too many errors, stopping rebuild`);
                        break;
                    }
                }
            }
        }

        // Save updated state
        state.matchCache = matchCache;
        await blobsService.saveState(state, accountKey);
        console.log(`💾 Saved ${fetchedCount} new matches to cache`);

        // Calculate stats from updated cache
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayStartEpoch = todayStart.getTime();

        let accountDeaths = 0;
        let todayDeaths = 0;
        let yunaraGamesCount = 0;

        for (const matchId of matchIds) {
            const match = matchCache[matchId];
            if (!match) continue;
            if (match.queueId !== RANKED_SOLO_QUEUE_ID) continue;
            if (match.championName.toLowerCase() !== CHAMPION_FILTER.toLowerCase()) continue;

            yunaraGamesCount++;
            accountDeaths += match.deaths;

            if (match.gameEndTimestamp >= todayStartEpoch) {
                todayDeaths += match.deaths;
            }
        }

        // Update snapshot with correct values
        const now = Date.now();
        const dayNumber = Math.ceil((now - new Date(START_DATE).getTime()) / (1000 * 60 * 60 * 24));

        // Get rank
        let rankEntry: any = null;
        try {
            rankEntry = await riotService.getRankByPuuid(account.puuid);
        } catch (err) {
            console.warn("⚠️ Failed to fetch rank:", err);
        }

        // Build lastMatches for streak calculation
        const processedMatches: any[] = [];
        for (const matchId of matchIds) {
            const match = matchCache[matchId];
            if (!match) continue;
            if (match.queueId !== RANKED_SOLO_QUEUE_ID) continue;
            if (match.championName.toLowerCase() !== CHAMPION_FILTER.toLowerCase()) continue;

            const isRemake = match.isRemake || (match.gameDuration && match.gameDuration < MIN_GAME_DURATION_MS);
            let result: "win" | "loss" | "remake";
            if (isRemake) {
                result = "remake";
            } else {
                result = match.win ? "win" : "loss";
            }

            processedMatches.push({
                matchId: match.matchId,
                deaths: match.deaths,
                result,
                champion: match.championName,
                timestamp: match.gameEndTimestamp,
            });
        }

        const lastMatches = processedMatches.sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);

        const snapshot = {
            accountDeaths,
            accountAbs: accountDeaths * 5,
            todayDeaths,
            todayAbs: todayDeaths * 5,
            totalDeaths: accountDeaths, // Will be recalculated by normal snapshot
            totalAbs: accountDeaths * 5,
            deathsTotal: accountDeaths,
            absTotal: accountDeaths * 5,
            dayNumber: Math.max(1, dayNumber),
            rank: {
                tier: rankEntry?.tier || "UNRANKED",
                division: rankEntry?.rank || "",
                lp: rankEntry?.leaguePoints || 0,
                wins: rankEntry?.wins || 0,
                losses: rankEntry?.losses || 0,
            },
            lastMatches: lastMatches,
            generatedAt: Date.now(),
            stale: false,
        };

        await blobsService.saveSnapshot(snapshot, accountKey);

        const elapsedSeconds = Math.round((Date.now() - startTime) / 1000);
        const stillMissing = missingMatchIds.length - fetchedCount;

        console.log(`✅ REBUILD complete for ${accountKey}`);
        console.log(`   📊 ${yunaraGamesCount} ${CHAMPION_FILTER} games found`);
        console.log(`   💀 ${accountDeaths} total deaths (${todayDeaths} today)`);
        console.log(`   🏋️ ${accountDeaths * 5} total abs`);
        console.log(`   ⏱️ Completed in ${elapsedSeconds}s`);

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                success: true,
                account: accountKey,
                matchesFetched: fetchedCount,
                matchesStillMissing: stillMissing,
                totalMatchesInPeriod: matchIds.length,
                cachedMatchesNow: Object.keys(matchCache).length,
                stats: {
                    yunaraGames: yunaraGamesCount,
                    totalDeaths: accountDeaths,
                    todayDeaths: todayDeaths,
                    totalAbs: accountDeaths * 5,
                },
                elapsedSeconds,
                message: stillMissing > 0
                    ? `Partial rebuild. Call again to fetch remaining ${stillMissing} matches.`
                    : "Full rebuild complete!",
            }),
        };

    } catch (error: any) {
        console.error(`❌ REBUILD error for ${accountKey}:`, error?.message || error);

        return {
            statusCode: 500,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                error: "Rebuild failed",
                details: error?.message || "Unknown error",
            }),
        };
    }
};
