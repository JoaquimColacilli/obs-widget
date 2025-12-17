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

    async getState(): Promise<TrackerState> {
        const defaultState: TrackerState = {
            matchCache: {},
            processedMatchIds: [], // Legacy
            lastProcessedMatchTime: 0,
            deathsTotal: 0
        };

        if (this.useMemory) {
            return memoryStore.get("tracker-state") || defaultState;
        }

        const data = await this.store.get("tracker-state", { type: "json" });
        return (data as TrackerState) || defaultState;
    }

    async saveState(state: TrackerState): Promise<void> {
        if (this.useMemory) {
            memoryStore.set("tracker-state", state);
            return;
        }
        await this.store.setJSON("tracker-state", state);
    }

    async getLastSnapshot(): Promise<Snapshot | null> {
        if (this.useMemory) {
            return memoryStore.get("last-snapshot") || null;
        }
        const data = await this.store.get("last-snapshot", { type: "json" });
        return (data as Snapshot) || null;
    }

    async saveSnapshot(snapshot: Snapshot): Promise<void> {
        if (this.useMemory) {
            memoryStore.set("last-snapshot", snapshot);
            return;
        }
        await this.store.setJSON("last-snapshot", snapshot);
    }
}
