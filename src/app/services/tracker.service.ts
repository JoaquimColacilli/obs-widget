import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, interval, of, timer } from 'rxjs';
import { startWith, switchMap, shareReplay, catchError, retry, map } from 'rxjs/operators';
import { Snapshot } from '../models/snapshot.model';

@Injectable({
    providedIn: 'root'
})
export class TrackerService {
    private apiUrl = '/api/snapshot';
    private snapshotCache: Map<string, Observable<Snapshot>> = new Map();

    // Default snapshot for initial state or error
    private defaultSnapshot: Snapshot = {
        accountDeaths: 0,
        accountAbs: 0,
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

    private static accountStats: { [key: string]: { deaths: number, abs: number } } = {};

    constructor(private http: HttpClient) { }

    getSnapshot(account: string = 'account1'): Observable<Snapshot> {
        // Return cached observable if exists for this account
        if (this.snapshotCache.has(account)) {
            return this.snapshotCache.get(account)!;
        }

        const url = `${this.apiUrl}?account=${account}`;
        const snapshot$ = interval(30000).pipe(
            startWith(0),
            switchMap(() => this.http.get<Snapshot>(url).pipe(
                retry(2),
                catchError(err => {
                    console.error(`Error fetching snapshot for ${account}`, err);
                    return of(this.defaultSnapshot);
                })
            )),
            map(snapshot => {
                // Update client-side store
                if (snapshot.accountDeaths !== undefined) {
                    TrackerService.accountStats[account] = { deaths: snapshot.accountDeaths, abs: snapshot.accountAbs };
                }

                // Calculate total from known accounts in this session
                let clientTotalDeaths = 0;
                let clientTotalAbs = 0;
                Object.values(TrackerService.accountStats).forEach(stats => {
                    clientTotalDeaths += stats.deaths;
                    clientTotalAbs += stats.abs;
                });

                // Use the higher total to ensure consistency (fixes cold start race conditions)
                return {
                    ...snapshot,
                    totalDeaths: Math.max(snapshot.totalDeaths, clientTotalDeaths),
                    totalAbs: Math.max(snapshot.totalAbs, clientTotalAbs)
                };
            }),
            shareReplay(1)
        );

        this.snapshotCache.set(account, snapshot$);
        return snapshot$;
    }
}

