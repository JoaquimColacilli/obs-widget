export interface Rank {
    tier: string;
    division: string;
    lp: number;
}

export interface Match {
    matchId: string;
    deaths: number;
    result: 'win' | 'loss';
    champion: string;
    timestamp: number;
}

export interface Snapshot {
    deathsTotal: number;
    absTotal: number;
    dayNumber: number;
    rank: Rank;
    lastMatches: Match[];
    generatedAt: number;
    stale?: boolean;
}
