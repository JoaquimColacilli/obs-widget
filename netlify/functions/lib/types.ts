export interface Snapshot {
    // Per-account stats
    accountDeaths: number;
    accountAbs: number;
    // Today's stats (current day only)
    todayDeaths: number;
    todayAbs: number;
    // Combined totals (all 3 accounts)
    totalDeaths: number;
    totalAbs: number;
    // Legacy fields (kept for backwards compatibility)
    deathsTotal: number;
    absTotal: number;
    dayNumber: number;
    rank: {
        tier: string;      // "GOLD", "PLATINUM", "UNRANKED", etc
        division: string;  // "II", "IV", "" si unranked
        lp: number;       // League Points
    };
    lastMatches: Array<{
        matchId: string;
        deaths: number;
        result: 'win' | 'loss' | 'remake';
        champion: string;
        timestamp: number;
    }>;
    generatedAt: number;  // Timestamp de cuándo se generó
    stale?: boolean;      // true si es data cacheada por error de Riot API
}

export interface CachedMatch {
    matchId: string;
    queueId: number;
    championName: string;
    deaths: number;
    win: boolean;
    gameEndTimestamp: number;
    gameDuration?: number;  // Game duration in milliseconds
    isRemake?: boolean;     // true if game was shorter than 5 minutes
}

export interface TrackerState {
    matchCache: Record<string, CachedMatch>;
    processedMatchIds: string[]; // Legacy, kept for compatibility
    lastProcessedMatchTime: number;
    deathsTotal: number; // Legacy, kept for compatibility but recalculated now
}
export interface RiotAccount {
    puuid: string;
    gameName: string;
    tagLine: string;
}

export interface RiotSummoner {
    id: string; // Encrypted summoner ID
    accountId: string;
    puuid: string;
    name: string;
    profileIconId: number;
    revisionDate: number;
    summonerLevel: number;
}

export interface MatchInfo {
    metadata: {
        matchId: string;
        participants: string[];
    };
    info: {
        gameCreation: number;
        gameDuration: number;
        gameEndTimestamp: number;
        queueId: number;
        participants: Participant[];
    }
}

export interface Participant {
    puuid: string;
    championName: string;
    deaths: number;
    win: boolean;
}
