import { Injectable } from '@angular/core';
import { Snapshot, Rank, Match } from '../models/snapshot.model';

// Hard-coded challenge start date key - must match .env START_DATE
const CHALLENGE_START_DATE_KEY = '2025-12-16';

export interface OverlayState {
    prevTodayDeaths: number;
    prevLp: number;
    prevTier: string;
    prevDivision: string;
    prevLastMatchId: string | null;
    streakType: 'W' | 'L' | null;
    streakCount: number;
    date: string;
    startDateKey: string;
    initialized: boolean;
}

export interface OverlayDeltas {
    deltaDeaths: number;
    lpDelta: number;
    showLpTrend: boolean;
    lpTrendText: string;
    showRankChange: boolean;
    rankChangeText: string;
    rankChangeDirection: 'up' | 'down' | null;
    shouldShowAbsToast: boolean;
    absToastAmount: number;
    showStreak: boolean;
    streakType: 'W' | 'L' | null;
    streakCount: number;
    streakText: string;
}

@Injectable({
    providedIn: 'root'
})
export class OverlayStateService {
    private readonly MAX_LP_DELTA = 200;

    constructor() { }

    private getStorageKey(overlayId: string): string {
        return `overlay_state_${overlayId}`;
    }

    private getTodayDate(): string {
        const now = new Date();
        return now.toISOString().split('T')[0];
    }

    private loadState(overlayId: string): OverlayState | null {
        try {
            const stored = localStorage.getItem(this.getStorageKey(overlayId));
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (e) {
            console.error('Error loading overlay state:', e);
        }
        return null;
    }

    private saveState(overlayId: string, state: OverlayState): void {
        try {
            localStorage.setItem(this.getStorageKey(overlayId), JSON.stringify(state));
        } catch (e) {
            console.error('Error saving overlay state:', e);
        }
    }

    private getLatestMatch(snapshot: Snapshot): Match | null {
        if (snapshot.lastMatches && snapshot.lastMatches.length > 0) {
            const sorted = [...snapshot.lastMatches].sort((a, b) => b.timestamp - a.timestamp);
            return sorted[0];
        }
        return null;
    }

    /**
     * Calculate streak from matches - counts consecutive wins or losses
     * from the most recent match backwards
     */
    private calculateStreakFromMatches(matches: Match[]): { streakType: 'W' | 'L' | null; streakCount: number } {
        if (!matches || matches.length === 0) {
            return { streakType: null, streakCount: 0 };
        }

        // Sort by timestamp descending (most recent first)
        const sorted = [...matches].sort((a, b) => b.timestamp - a.timestamp);

        // Skip any leading remakes to find the first real result
        let startIdx = 0;
        while (startIdx < sorted.length && sorted[startIdx].result === 'remake') {
            startIdx++;
        }

        // If all matches are remakes, no streak
        if (startIdx >= sorted.length) {
            return { streakType: null, streakCount: 0 };
        }

        // Get the result of the first non-remake match
        const firstResult = sorted[startIdx].result === 'win' ? 'W' : 'L';
        let streakCount = 0;

        // Count consecutive matches with the same result
        // A remake breaks the streak!
        for (let i = startIdx; i < sorted.length; i++) {
            const match = sorted[i];

            // Remake breaks the streak
            if (match.result === 'remake') {
                break;
            }

            const result = match.result === 'win' ? 'W' : 'L';
            if (result === firstResult) {
                streakCount++;
            } else {
                break;
            }
        }

        return { streakType: firstResult, streakCount };
    }

    private createDefaultState(snapshot: Snapshot, latestMatchId: string | null): OverlayState {
        // Calculate initial streak from existing matches
        const { streakType, streakCount } = this.calculateStreakFromMatches(snapshot.lastMatches);

        return {
            prevTodayDeaths: snapshot.todayDeaths,
            prevLp: snapshot.rank.lp,
            prevTier: snapshot.rank.tier,
            prevDivision: snapshot.rank.division,
            prevLastMatchId: latestMatchId,
            streakType,
            streakCount,
            date: this.getTodayDate(),
            startDateKey: CHALLENGE_START_DATE_KEY,
            initialized: false
        };
    }

    processSnapshot(overlayId: string, snapshot: Snapshot): OverlayDeltas {
        const today = this.getTodayDate();
        let state = this.loadState(overlayId);

        const latestMatch = this.getLatestMatch(snapshot);
        const latestMatchId = latestMatch ? latestMatch.matchId : null;

        // Initialize state if not exists
        if (!state) {
            state = this.createDefaultState(snapshot, latestMatchId);
            this.saveState(overlayId, state);

            // Return with streak info on first load (but no toasts)
            const { streakType, streakCount } = this.calculateStreakFromMatches(snapshot.lastMatches);
            return {
                ...this.emptyDeltas(),
                showStreak: streakCount > 0,
                streakType,
                streakCount,
                streakText: streakCount > 0 ? `${streakType}: ${streakCount}` : ''
            };
        }

        // Check if startDateKey changed (new challenge started)
        if (state.startDateKey !== CHALLENGE_START_DATE_KEY) {
            console.log(`[Overlay ${overlayId}] Challenge startDateKey changed, resetting streak`);
            state = this.createDefaultState(snapshot, latestMatchId);
            this.saveState(overlayId, state);
            return this.emptyDeltas();
        }

        // Migrate old state
        if (!state.startDateKey) {
            state.startDateKey = CHALLENGE_START_DATE_KEY;
        }
        if (state.initialized === undefined) {
            state.initialized = false;
        }

        // Check for daily reset
        if (state.date !== today) {
            state.date = today;
            state.prevTodayDeaths = 0;
        }

        // Calculate death delta for Toasts
        const deltaDeaths = snapshot.todayDeaths - state.prevTodayDeaths;
        const shouldShowAbsToast = state.initialized && deltaDeaths > 0;
        const absToastAmount = deltaDeaths * 5;

        if (!state.initialized) {
            state.initialized = true;
        }

        // ===== MATCH CHANGE DETECTION =====
        const hasNewMatch = latestMatchId !== null &&
            state.prevLastMatchId !== null &&
            latestMatchId !== state.prevLastMatchId;

        if (state.prevLastMatchId === null && latestMatchId !== null) {
            state.prevLastMatchId = latestMatchId;
        }

        // --- STREAK LOGIC ---
        // ALWAYS recalculate streak from lastMatches to ensure accuracy
        // This handles the case where backend data changed (e.g., remakes filtered out)
        const calculatedStreak = this.calculateStreakFromMatches(snapshot.lastMatches);
        state.streakType = calculatedStreak.streakType;
        state.streakCount = calculatedStreak.streakCount;

        // Update tracked match ID if new match detected
        if (hasNewMatch) {
            state.prevLastMatchId = latestMatchId;
        }

        // Build Streak Text
        let streakText = '';
        let showStreak = false;
        if (state.streakType && state.streakCount > 0) {
            streakText = `${state.streakType}: ${state.streakCount}`;
            showStreak = true;
        }

        // --- LP TREND LOGIC ---
        let lpDelta = snapshot.rank.lp - state.prevLp;
        let showLpTrend = false;
        let lpTrendText = '';

        if (hasNewMatch && Math.abs(lpDelta) > 0 && Math.abs(lpDelta) <= this.MAX_LP_DELTA) {
            showLpTrend = true;
            if (lpDelta > 0) {
                lpTrendText = `+${lpDelta} LP ↑`;
            } else {
                lpTrendText = `${lpDelta} LP ↓`;
            }
        }

        // --- RANK CHANGE LOGIC ---
        let showRankChange = false;
        let rankChangeText = '';
        let rankChangeDirection: 'up' | 'down' | null = null;

        if (hasNewMatch) {
            const tierChanged = snapshot.rank.tier !== state.prevTier;
            const divisionChanged = snapshot.rank.division !== state.prevDivision;

            if (tierChanged || divisionChanged) {
                const tierOrder = ['IRON', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'EMERALD', 'DIAMOND', 'MASTER', 'GRANDMASTER', 'CHALLENGER'];
                const prevTierIndex = tierOrder.indexOf(state.prevTier.toUpperCase());
                const currTierIndex = tierOrder.indexOf(snapshot.rank.tier.toUpperCase());

                if (currTierIndex > prevTierIndex) {
                    showRankChange = true;
                    rankChangeText = 'RANK UP ↑';
                    rankChangeDirection = 'up';
                } else if (currTierIndex < prevTierIndex) {
                    showRankChange = true;
                    rankChangeText = 'RANK DOWN ↓';
                    rankChangeDirection = 'down';
                } else if (divisionChanged) {
                    const divOrder = ['IV', 'III', 'II', 'I'];
                    const prevDivIndex = divOrder.indexOf(state.prevDivision);
                    const currDivIndex = divOrder.indexOf(snapshot.rank.division);

                    if (currDivIndex > prevDivIndex) {
                        showRankChange = true;
                        rankChangeText = 'RANK UP ↑';
                        rankChangeDirection = 'up';
                    } else if (currDivIndex < prevDivIndex) {
                        showRankChange = true;
                        rankChangeText = 'RANK DOWN ↓';
                        rankChangeDirection = 'down';
                    }
                }
            }
        }

        state.prevTodayDeaths = snapshot.todayDeaths;
        state.prevLp = snapshot.rank.lp;
        state.prevTier = snapshot.rank.tier;
        state.prevDivision = snapshot.rank.division;

        this.saveState(overlayId, state);

        return {
            deltaDeaths,
            lpDelta,
            showLpTrend,
            lpTrendText,
            showRankChange,
            rankChangeText,
            rankChangeDirection,
            shouldShowAbsToast,
            absToastAmount,
            showStreak,
            streakType: state.streakType,
            streakCount: state.streakCount,
            streakText
        };
    }

    private emptyDeltas(): OverlayDeltas {
        return {
            deltaDeaths: 0,
            lpDelta: 0,
            showLpTrend: false,
            lpTrendText: '',
            showRankChange: false,
            rankChangeText: '',
            rankChangeDirection: null,
            shouldShowAbsToast: false,
            absToastAmount: 0,
            showStreak: false,
            streakType: null,
            streakCount: 0,
            streakText: ''
        };
    }

    getStreakDisplay(overlayId: string): string {
        const state = this.loadState(overlayId);
        if (!state || !state.streakType || state.streakCount === 0) {
            return '';
        }
        return `Streak: ${state.streakType}${state.streakCount}`;
    }
}