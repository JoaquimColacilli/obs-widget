// netlify/functions/lib/types.ts

export interface RiotAccount {
    puuid: string;
    gameName: string;
    tagLine: string;
}

export interface RiotSummoner {
    id: string;
    accountId: string;
    puuid: string;
    profileIconId: number;
    revisionDate: number;
    summonerLevel: number;
}

export interface MatchParticipant {
    puuid: string;
    championName: string;
    deaths: number;
    kills: number;
    assists: number;
    win: boolean;
    teamId: number;
}

export interface MatchInfo {
    info: {
        gameId: number;
        queueId: number;
        gameDuration: number; // Duration in seconds
        gameEndTimestamp: number;
        participants: MatchParticipant[];
    };
}

export interface CachedMatch {
    matchId: string;
    queueId: number;
    championName: string;
    deaths: number;
    win: boolean;
    gameEndTimestamp: number;
    gameDuration?: number; // Duration in milliseconds (converted from API)
    isRemake?: boolean;
}

export interface TrackerState {
    matchCache: Record<string, CachedMatch>;
    processedMatchIds: string[];
    lastProcessedMatchTime: number;
    deathsTotal: number;
}

export interface Rank {
    tier: string;
    division: string;
    lp: number;
    wins: number;
    losses: number;
}

export interface Match {
    matchId: string;
    deaths: number;
    result: 'win' | 'loss' | 'remake';
    champion: string;
    timestamp: number;
}

export interface Snapshot {
    // Per-account stats
    accountDeaths: number;
    accountAbs: number;
    // Today's stats (current day only)
    todayDeaths: number;
    todayAbs: number;
    // Combined totals (all accounts)
    totalDeaths: number;
    totalAbs: number;
    // Legacy fields (kept for backwards compatibility)
    deathsTotal: number;
    absTotal: number;
    // Challenge info
    dayNumber: number;
    rank: Rank;
    lastMatches: Match[];
    generatedAt: number;
    stale?: boolean;
}
