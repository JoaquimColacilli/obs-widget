import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, timer } from 'rxjs';
import { catchError, shareReplay, switchMap } from 'rxjs/operators';
import { Snapshot } from '../models/snapshot.model';

@Injectable({ providedIn: 'root' })
export class TrackerService {
    private apiUrl = '/api/snapshot';

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
        rank: { tier: 'UNRANKED', division: '', lp: 0, wins: 0, losses: 0 },
        lastMatches: [],
        generatedAt: Date.now(),
        stale: true
    };

    private streams = new Map<string, Observable<Snapshot>>();

    constructor(private http: HttpClient) { }

    private fetchSingleSnapshot(account: string): Observable<Snapshot> {
        const url = `${this.apiUrl}?account=${account}`;
        return this.http.get<Snapshot>(url).pipe(
            catchError(err => {
                console.error(`Error fetching snapshot for ${account}`, err);
                return of({ ...this.defaultSnapshot, stale: true });
            })
        );
    }

    getSnapshot(account: string = 'account1'): Observable<Snapshot> {
        if (!this.streams.has(account)) {
            const stream = timer(0, 30000).pipe(
                switchMap(() => this.fetchSingleSnapshot(account)),
                shareReplay({ bufferSize: 1, refCount: true })
            );
            this.streams.set(account, stream);
        }
        return this.streams.get(account)!;
    }
}