// src/app/models/snapshot.model.ts

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
