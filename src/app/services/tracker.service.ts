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

    // Default snapshot for initial state or error
    private defaultSnapshot: Snapshot = {
        deathsTotal: 0,
        absTotal: 0,
        dayNumber: 1,
        rank: { tier: 'UNRANKED', division: '', lp: 0 },
        lastMatches: [],
        generatedAt: Date.now(),
        stale: true
    };

    constructor(private http: HttpClient) { }

    getSnapshot(): Observable<Snapshot> {
        return interval(30000).pipe(
            startWith(0),
            switchMap(() => this.http.get<Snapshot>(this.apiUrl).pipe(
                retry(2), // Retry failed requests twice
                catchError(err => {
                    console.error('Error fetching snapshot', err);
                    return of(this.defaultSnapshot);
                })
            )),
            shareReplay(1)
        );
    }
}
