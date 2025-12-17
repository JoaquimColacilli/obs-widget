import axios, { AxiosInstance } from 'axios';
import NodeCache from 'node-cache';
import { RiotAccount, RiotSummoner, MatchInfo } from './types';

export class RiotService {
    private api: AxiosInstance;
    private cache: NodeCache;

    constructor(apiKey: string) {
        this.cache = new NodeCache({ stdTTL: 60 });
        this.api = axios.create({
            headers: {
                'X-Riot-Token': apiKey
            }
        });

        // Add interceptor for 429 handling
        this.api.interceptors.response.use(
            response => response,
            async error => {
                if (error.response && error.response.status === 429) {
                    const retryAfter = parseInt(error.response.headers['retry-after'] || '5', 10);
                    console.warn(`Rate limit hit. Retrying after ${retryAfter}s`);
                    await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
                    return this.api.request(error.config);
                }
                return Promise.reject(error);
            }
        );
    }

    async getAccount(gameName: string, tagLine: string): Promise<RiotAccount> {
        // Cache account lookup for a long time as PUUID doesn't change often
        const cacheKey = `account-${gameName}-${tagLine}`;
        const cached = this.cache.get<RiotAccount>(cacheKey);
        if (cached) return cached;

        const region = process.env.RIOT_REGION_ROUTING || 'americas';

        // Decode first to handle any pre-encoded values from .env, then re-encode properly
        const decodedGameName = decodeURIComponent(gameName);
        const decodedTagLine = decodeURIComponent(tagLine);

        const url = `https://${region}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(decodedGameName)}/${encodeURIComponent(decodedTagLine)}`;
        console.log(`🎮 Fetching account: ${decodedGameName}#${decodedTagLine}`);

        const response = await this.api.get<RiotAccount>(url);

        this.cache.set(cacheKey, response.data, 3600 * 24); // 24h cache
        return response.data;
    }

    async getSummoner(puuid: string): Promise<RiotSummoner> {
        const platform = process.env.RIOT_REGION_PLATFORM || 'la1';
        const cacheKey = `summoner-${platform}-${puuid}`;
        const cached = this.cache.get<RiotSummoner>(cacheKey);
        if (cached) {
            console.log(`📦 Cache hit for summoner ${puuid}`);
            return cached;
        }

        const url = `https://${platform}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`;
        console.log(`🔍 Fetching summoner from: ${url}`);

        const response = await this.api.get<RiotSummoner>(url);
        console.log(`✅ Got summoner data:`, JSON.stringify(response.data));

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
            console.log(`📦 Cache hit for rank (puuid) ${puuid}`);
            return cached;
        }

        const url = `https://${platform}.api.riotgames.com/lol/league/v4/entries/by-puuid/${puuid}`;
        console.log(`🏆 Fetching rank by PUUID from: ${url}`);

        const response = await this.api.get<any[]>(url);
        const soloQEntry = response.data.find((entry: any) => entry.queueType === 'RANKED_SOLO_5x5') || null;

        if (soloQEntry) {
            console.log(`✅ Got rank: ${soloQEntry.tier} ${soloQEntry.rank} ${soloQEntry.leaguePoints}LP`);
            this.cache.set(cacheKey, soloQEntry, 300); // Cache for 5 minutes
        } else {
            console.log(`⚠️ No RANKED_SOLO_5x5 entry found for puuid`);
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
        const params: any = {
            startTime,
            count
        };

        // Filter by queue type (420 = Ranked Solo/Duo)
        if (queue) {
            params.queue = queue;
        }

        const response = await this.api.get<string[]>(
            `https://${region}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids`,
            { params }
        );
        return response.data;
    }

    async getMatchDetails(matchId: string): Promise<MatchInfo> {
        // Cache match details aggressively
        const cached = this.cache.get<MatchInfo>(`match-${matchId}`);
        if (cached) return cached;

        const region = process.env.RIOT_REGION_ROUTING || 'americas';
        const response = await this.api.get<MatchInfo>(
            `https://${region}.api.riotgames.com/lol/match/v5/matches/${matchId}`
        );

        this.cache.set(`match-${matchId}`, response.data, 3600);
        return response.data;
    }
}