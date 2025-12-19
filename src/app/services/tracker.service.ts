import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, interval, forkJoin, of } from 'rxjs';
import { map, switchMap, catchError, tap, startWith, distinctUntilChanged } from 'rxjs/operators';
import { Snapshot } from '../models/snapshot.model';

@Injectable({
    providedIn: 'root'
})
export class TrackerService {
    private apiUrl = '/api/snapshot';

    // All accounts we track
    private readonly accounts = ['account1', 'account2', 'account3'];

    // Single source of truth for all account data
    private allAccountsData$ = new BehaviorSubject<Record<string, Snapshot>>({});

    // Track if initial load is complete
    private initialized = false;

    private defaultSnapshot: Snapshot = {
        accountDeaths: 0,
        accountAbs: 0,
        todayDeaths: 0,
        todayAbs: 0,
        totalDeaths: 0,
        totalAbs: 0,
        deathsTotal: 0,
        absTotal: 0,
        dayNumber: 1,
        rank: { tier: 'UNRANKED', division: '', lp: 0 },
        lastMatches: [],
        generatedAt: Date.now(),
        stale: true
    };

    constructor(private http: HttpClient) {
        // Start polling all accounts together
        this.startPolling();
    }

    /**
     * Fetch a single account's snapshot from the API
     */
    private fetchSingleSnapshot(account: string): Observable<Snapshot> {
        const url = `${this.apiUrl}?account=${account}`;
        return this.http.get<Snapshot>(url).pipe(
            catchError(err => {
                console.error(`Error fetching snapshot for ${account}`, err);
                return of({ ...this.defaultSnapshot, stale: true });
            })
        );
    }

    /**
     * Fetch ALL accounts in parallel and update shared state
     */
    private fetchAllAccounts(): Observable<Record<string, Snapshot>> {
        const requests: Record<string, Observable<Snapshot>> = {};
        this.accounts.forEach(acc => {
            requests[acc] = this.fetchSingleSnapshot(acc);
        });

        return forkJoin(requests).pipe(
            tap(results => {
                console.log('📊 All accounts fetched:', Object.keys(results).map(k =>
                    `${k}: ${results[k].accountDeaths} deaths`
                ).join(', '));

                // Update the shared state
                this.allAccountsData$.next(results);
                this.initialized = true;
            })
        );
    }

    /**
     * Start polling all accounts every 30 seconds
     */
    private startPolling(): void {
        interval(30000).pipe(
            startWith(0), // Fetch immediately on start
            switchMap(() => this.fetchAllAccounts())
        ).subscribe();
    }

    /**
     * Calculate combined totals from all accounts
     */
    private calculateTotals(allData: Record<string, Snapshot>): { totalDeaths: number, totalAbs: number } {
        let totalDeaths = 0;
        let totalAbs = 0;

        Object.values(allData).forEach(snapshot => {
            if (snapshot && snapshot.accountDeaths !== undefined) {
                totalDeaths += snapshot.accountDeaths || 0;
                totalAbs += snapshot.accountAbs || 0;
            }
        });

        return { totalDeaths, totalAbs };
    }

    /**
     * Get snapshot for a specific account with CORRECT totals
     * Totals are calculated client-side from ALL accounts' data
     */
    getSnapshot(account: string = 'account1'): Observable<Snapshot> {
        return this.allAccountsData$.pipe(
            map(allData => {
                const snapshot = allData[account];

                // If no data yet, return default
                if (!snapshot) {
                    return this.defaultSnapshot;
                }

                // Calculate COMBINED totals from ALL accounts
                const { totalDeaths, totalAbs } = this.calculateTotals(allData);

                // Return snapshot with correct totals
                return {
                    ...snapshot,
                    totalDeaths,
                    totalAbs
                };
            }),
            // Only emit when values actually change (prevents unnecessary re-renders)
            distinctUntilChanged((prev, curr) =>
                prev.accountDeaths === curr.accountDeaths &&
                prev.totalDeaths === curr.totalDeaths &&
                prev.generatedAt === curr.generatedAt
            )
        );
    }

    /**
     * Force refresh all accounts (useful for manual refresh button)
     */
    refreshAll(): Observable<Record<string, Snapshot>> {
        return this.fetchAllAccounts();
    }

    /**
     * Check if initial data load is complete
     */
    isInitialized(): boolean {
        return this.initialized;
    }
}