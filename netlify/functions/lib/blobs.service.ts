import { getStore } from "@netlify/blobs";
import { Snapshot, TrackerState } from "./types";

// In-memory fallback for local development
const memoryStore: Map<string, any> = new Map();

export class BlobsService {
    private store: any;
    private useMemory: boolean;

    constructor() {
        // Check if we have Netlify credentials for Blobs
        const hasBlobsCredentials = process.env.NETLIFY_SITE_ID && process.env.NETLIFY_AUTH_TOKEN;

        this.useMemory = !hasBlobsCredentials;

        if (!this.useMemory) {
            try {
                this.store = getStore({
                    name: "camululis-tracker",
                    siteID: process.env.NETLIFY_SITE_ID,
                    token: process.env.NETLIFY_AUTH_TOKEN,
                });
            } catch (e) {
                console.warn("Failed to initialize Netlify Blobs, using in-memory storage");
                this.useMemory = true;
            }
        }

        if (this.useMemory) {
            console.log("📦 Using in-memory storage (local dev mode)");
        }
    }

    async getState(accountKey: string = 'account1'): Promise<TrackerState> {
        const key = `tracker-state-${accountKey}`;
        const defaultState: TrackerState = {
            matchCache: {},
            processedMatchIds: [], // Legacy
            lastProcessedMatchTime: 0,
            deathsTotal: 0
        };

        if (this.useMemory) {
            return memoryStore.get(key) || defaultState;
        }

        const data = await this.store.get(key, { type: "json" });
        return (data as TrackerState) || defaultState;
    }

    async saveState(state: TrackerState, accountKey: string = 'account1'): Promise<void> {
        const key = `tracker-state-${accountKey}`;
        if (this.useMemory) {
            memoryStore.set(key, state);
            return;
        }
        await this.store.setJSON(key, state);
    }

    async getLastSnapshot(accountKey: string = 'account1'): Promise<Snapshot | null> {
        const key = `last-snapshot-${accountKey}`;
        if (this.useMemory) {
            return memoryStore.get(key) || null;
        }
        const data = await this.store.get(key, { type: "json" });
        return (data as Snapshot) || null;
    }

    async saveSnapshot(snapshot: Snapshot, accountKey: string = 'account1'): Promise<void> {
        const key = `last-snapshot-${accountKey}`;
        if (this.useMemory) {
            memoryStore.set(key, snapshot);
            return;
        }
        await this.store.setJSON(key, snapshot);
    }
}
