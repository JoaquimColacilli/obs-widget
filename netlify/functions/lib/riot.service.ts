import axios, { AxiosInstance } from 'axios';
import NodeCache from 'node-cache';
import { RiotAccount, RiotSummoner, MatchInfo } from './types';

export class RiotService {
    private api: AxiosInstance;
    private cache: NodeCache;
    private requestCount: number = 0;
    private lastRequestTime: number = 0;

    constructor(apiKey: string) {
        // Cache with longer TTL for stability
        this.cache = new NodeCache({ 
            stdTTL: 120,  // 2 minutes default
            checkperiod: 60 
        });
        
        this.api = axios.create({
            headers: {
                'X-Riot-Token': apiKey
            },
            timeout: 10000 // 10 second timeout
        });

        // Add interceptor for 429 handling with smarter retry logic
        this.api.interceptors.response.use(
            response => {
                this.requestCount++;
                this.lastRequestTime = Date.now();
                return response;
            },
            async error => {
                if (error.response && error.response.status === 429) {
                    const retryAfter = parseInt(error.response.headers['retry-after'] || '5', 10);

                    // For serverless functions, we can't wait too long
                    if (retryAfter > 10) {
                        console.warn(`🛑 Rate limit too long (${retryAfter}s). Aborting request to prevent timeout.`);
                        return Promise.reject(new Error(`Rate limit exceeded (${retryAfter}s wait required)`));
                    }

                    console.warn(`⏱️ Rate limit hit. Waiting ${retryAfter}s before retry...`);
                    await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
                    
                    // Retry the request
                    return this.api.request(error.config);
                }
                
                // Log other errors for debugging
                if (error.response) {
                    console.error(`🚨 API Error ${error.response.status}: ${error.response.statusText}`);
                } else if (error.code === 'ECONNABORTED') {
                    console.error(`🚨 Request timeout`);
                }
                
                return Promise.reject(error);
            }
        );
    }

    async getAccount(gameName: string, tagLine: string): Promise<RiotAccount> {
        // Cache account lookup for a long time as PUUID doesn't change often
        const cacheKey = `account-${gameName}-${tagLine}`;
        const cached = this.cache.get<RiotAccount>(cacheKey);
        if (cached) {
            console.log(`📦 Cache hit for account ${gameName}#${tagLine}`);
            return cached;
        }

        const region = process.env.RIOT_REGION_ROUTING || 'americas';

        // Decode first to handle any pre-encoded values from .env, then re-encode properly
        const decodedGameName = decodeURIComponent(gameName);
        const decodedTagLine = decodeURIComponent(tagLine);

        const url = `https://${region}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(decodedGameName)}/${encodeURIComponent(decodedTagLine)}`;
        console.log(`🎮 Fetching account: ${decodedGameName}#${decodedTagLine}`);

        const response = await this.api.get<RiotAccount>(url);

        // Cache for 24 hours - PUUID never changes
        this.cache.set(cacheKey, response.data, 3600 * 24);
        return response.data;
    }

    async getSummoner(puuid: string): Promise<RiotSummoner> {
        const platform = process.env.RIOT_REGION_PLATFORM || 'la1';
        const cacheKey = `summoner-${platform}-${puuid}`;
        const cached = this.cache.get<RiotSummoner>(cacheKey);
        if (cached) {
            console.log(`📦 Cache hit for summoner ${puuid.substring(0, 8)}...`);
            return cached;
        }

        const url = `https://${platform}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`;
        console.log(`🔍 Fetching summoner...`);

        const response = await this.api.get<RiotSummoner>(url);

        this.cache.set(cacheKey, response.data, 3600);
        return response.data;
    }

    /**
     * Get rank using PUUID directly via league-v4/entries/by-puuid endpoint
     * This is the newer endpoint that doesn't require summonerId
     */
    async getRankByPuuid(puuid: string) {
        const platform = process.env.RIOT_REGION_PLATFORM || 'la1';
        const cacheKey = `rank-puuid-${platform}-${puuid}`;
        const cached = this.cache.get<any>(cacheKey);
        if (cached) {
            console.log(`📦 Cache hit for rank`);
            return cached;
        }

        const url = `https://${platform}.api.riotgames.com/lol/league/v4/entries/by-puuid/${puuid}`;
        console.log(`🏆 Fetching rank by PUUID...`);

        const response = await this.api.get<any[]>(url);
        const soloQEntry = response.data.find((entry: any) => entry.queueType === 'RANKED_SOLO_5x5') || null;

        if (soloQEntry) {
            console.log(`✅ Got rank: ${soloQEntry.tier} ${soloQEntry.rank} ${soloQEntry.leaguePoints}LP (${soloQEntry.wins}W/${soloQEntry.losses}L)`);
            // Cache for 5 minutes - rank can change after each game
            this.cache.set(cacheKey, soloQEntry, 300);
        } else {
            console.log(`⚠️ No RANKED_SOLO_5x5 entry found`);
        }

        return soloQEntry;
    }

    /**
     * @deprecated Use getRankByPuuid instead - summonerId is no longer reliably returned by summoner-v4
     */
    async getRank(summonerId: string) {
        const platform = process.env.RIOT_REGION_PLATFORM || 'la1';
        const response = await this.api.get<any[]>(
            `https://${platform}.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerId}`
        );
        return response.data.find((entry: any) => entry.queueType === 'RANKED_SOLO_5x5') || null;
    }

    async getMatchIds(puuid: string, startTime: number, count = 100, queue?: number): Promise<string[]> {
        const region = process.env.RIOT_REGION_ROUTING || 'americas';
        
        // Cache key includes all params
        const cacheKey = `matchids-${puuid}-${startTime}-${count}-${queue || 'all'}`;
        const cached = this.cache.get<string[]>(cacheKey);
        if (cached) {
            console.log(`📦 Cache hit for match IDs (${cached.length} matches)`);
            return cached;
        }

        const params: any = {
            startTime,
            count
        };

        // Filter by queue type (420 = Ranked Solo/Duo)
        if (queue) {
            params.queue = queue;
        }

        const url = `https://${region}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids`;
        console.log(`📋 Fetching match IDs (since ${new Date(startTime * 1000).toISOString()})...`);

        const response = await this.api.get<string[]>(url, { params });
        
        console.log(`📋 Got ${response.data.length} match IDs`);
        
        // Cache for 2 minutes - new matches appear frequently during play sessions
        this.cache.set(cacheKey, response.data, 120);
        return response.data;
    }

    async getMatchDetails(matchId: string): Promise<MatchInfo> {
        // Cache match details aggressively - match data never changes
        const cacheKey = `match-${matchId}`;
        const cached = this.cache.get<MatchInfo>(cacheKey);
        if (cached) {
            return cached;
        }

        const region = process.env.RIOT_REGION_ROUTING || 'americas';
        const url = `https://${region}.api.riotgames.com/lol/match/v5/matches/${matchId}`;

        const response = await this.api.get<MatchInfo>(url);

        // Cache for 1 hour (match data is immutable)
        this.cache.set(cacheKey, response.data, 3600);
        return response.data;
    }

    // Utility method to check current rate limit status
    getStats() {
        return {
            requestCount: this.requestCount,
            lastRequestTime: this.lastRequestTime,
            cacheStats: this.cache.getStats()
        };
    }
}
