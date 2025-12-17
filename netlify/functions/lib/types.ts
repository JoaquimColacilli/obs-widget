export interface Snapshot {
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
        result: 'win' | 'loss';
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
