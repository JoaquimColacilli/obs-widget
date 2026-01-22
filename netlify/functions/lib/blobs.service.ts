// netlify/functions/lib/blobs.service.ts

import { getStore } from "@netlify/blobs";
import { Snapshot, TrackerState } from "./types";

type StoreLike = {
    get: (key: string, opts?: { type?: "json" | "text" }) => Promise<any>;
    setJSON: (key: string, value: any) => Promise<void>;
};

export class BlobsService {
    private store: StoreLike | null = null;

    // Fallback local (dev) memory
    private memStates = new Map<string, TrackerState>();
    private memSnapshots = new Map<string, Snapshot>();

    constructor() {
        // In Netlify production, NETLIFY_BLOBS_CONTEXT is the correct signal.
        // In local dev, you can optionally use NETLIFY_SITE_ID + NETLIFY_AUTH_TOKEN.
        const hasBlobsContext = !!process.env.NETLIFY_BLOBS_CONTEXT;
        const hasLegacyCreds = !!process.env.NETLIFY_SITE_ID && !!process.env.NETLIFY_AUTH_TOKEN;

        try {
            if (hasBlobsContext) {
                this.store = getStore({ name: "camululis-tracker" }) as unknown as StoreLike;
                console.log("📦 Using Netlify Blobs (production)");
                return;
            }

            if (hasLegacyCreds) {
                this.store = getStore({
                    name: "camululis-tracker",
                    siteID: process.env.NETLIFY_SITE_ID,
                    token: process.env.NETLIFY_AUTH_TOKEN,
                }) as unknown as StoreLike;
                console.log("📦 Using Netlify Blobs (legacy credentials)");
                return;
            }

            console.log("📦 Using in-memory storage (local dev mode)");
            this.store = null;
        } catch (e) {
            console.warn("⚠️ Failed to initialize Netlify Blobs, using in-memory storage:", e);
            this.store = null;
        }
    }

    async getState(accountKey: string = "account1"): Promise<TrackerState> {
        const key = `tracker-state-${accountKey}`;
        const defaultState: TrackerState = {
            matchCache: {},
            processedMatchIds: [],
            lastProcessedMatchTime: 0,
            deathsTotal: 0,
        };

        if (!this.store) {
            return this.memStates.get(key) || defaultState;
        }

        try {
            const data = await this.store.get(key, { type: "json" });
            if (data) {
                // Validate that matchCache exists and is an object
                if (!data.matchCache || typeof data.matchCache !== 'object') {
                    console.warn(`⚠️ Invalid matchCache for ${accountKey}, resetting to empty`);
                    data.matchCache = {};
                }
                console.log(`📦 Loaded state for ${accountKey}: ${Object.keys(data.matchCache).length} cached matches`);
                return data as TrackerState;
            }
        } catch (e) {
            console.warn(`⚠️ Failed to load state for ${accountKey}:`, e);
        }

        return defaultState;
    }

    async saveState(state: TrackerState, accountKey: string = "account1"): Promise<void> {
        const key = `tracker-state-${accountKey}`;

        if (!this.store) {
            this.memStates.set(key, state);
            console.log(`💾 Saved state to memory for ${accountKey}: ${Object.keys(state.matchCache).length} cached matches`);
            return;
        }

        try {
            await this.store.setJSON(key, state);
            console.log(`💾 Saved state to blobs for ${accountKey}: ${Object.keys(state.matchCache).length} cached matches`);
        } catch (e) {
            console.error(`❌ Failed to save state for ${accountKey}:`, e);
            throw e;
        }
    }

    async getLastSnapshot(accountKey: string = "account1"): Promise<Snapshot | null> {
        const key = `last-snapshot-${accountKey}`;

        if (!this.store) {
            return this.memSnapshots.get(key) || null;
        }

        try {
            const data = await this.store.get(key, { type: "json" });
            if (data) {
                console.log(`📦 Loaded snapshot for ${accountKey}: ${data.accountDeaths} deaths`);
                return data as Snapshot;
            }
        } catch (e) {
            console.warn(`⚠️ Failed to load snapshot for ${accountKey}:`, e);
        }

        return null;
    }

    async saveSnapshot(snapshot: Snapshot, accountKey: string = "account1"): Promise<void> {
        const key = `last-snapshot-${accountKey}`;

        if (!this.store) {
            this.memSnapshots.set(key, snapshot);
            console.log(`💾 Saved snapshot to memory for ${accountKey}`);
            return;
        }

        try {
            await this.store.setJSON(key, snapshot);
            console.log(`💾 Saved snapshot to blobs for ${accountKey}`);
        } catch (e) {
            console.error(`❌ Failed to save snapshot for ${accountKey}:`, e);
            throw e;
        }
    }

    // Debug method to inspect storage
    async debugStorage(accountKey: string = "account1"): Promise<{
        hasStore: boolean;
        stateMatchCount: number;
        snapshotDeaths: number | null;
    }> {
        const state = await this.getState(accountKey);
        const snapshot = await this.getLastSnapshot(accountKey);

        return {
            hasStore: this.store !== null,
            stateMatchCount: Object.keys(state.matchCache).length,
            snapshotDeaths: snapshot?.accountDeaths ?? null,
        };
    }
}
