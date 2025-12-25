export interface Rank {
    tier: string;
    division: string;
    lp: number;
    wins: number;     // Season wins from Riot API
    losses: number;   // Season losses from Riot API
}

export interface Match {
    matchId: string;
    deaths: number;
    result: 'win' | 'loss' | 'remake';  // remake breaks streak
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
    // Legacy fields
    deathsTotal: number;
    absTotal: number;
    dayNumber: number;
    rank: Rank;
    lastMatches: Match[];
    generatedAt: number;
    stale?: boolean;
}

