# Camululis Tracker 🐱✨

Fullstack tracker for the "Deaths = Abs" challenge. Built with Angular 17+ and Netlify Functions.

## Features
- **Real-time Tracking:** Polls Riot API every 30s (via backend proxy) to count deaths.
- **Persistent Stats:** Uses Netlify Blobs to store total deaths across deploys and execution contexts.
- **OBS Optimized:** Transparent background, smooth 60fps animations, stable layout.
- **Rate Limit Smart:** Implements token bucket compliance and aggressive caching.

## Setup Local

1. **Install Dependencies:**
   ```bash
   npm install
   ```
   
2. **Configure Environment:**
   Copy `.env.example` (or use provided `.env`) and set your `RIOT_API_KEY`.
   
   ```env
   RIOT_API_KEY=RGAPI-xxxxxxxx
   RIOT_GAME_NAME=JOVEN RICO
   RIOT_TAG_LINE=GNZ
   START_DATE=2025-12-16T00:00:00-03:00
   ```

3. **Run Development Server:**
   ```bash
   npx netlify dev
   ```
   Access overlay at `http://localhost:8888`.

## OBS Configuration
1. Add **Browser Source**.
2. URL: `https://your-site.netlify.app/overlay` (or localhost if testing).
3. Width: `1920`, Height: `1080` (or custom to fit widget).
4. Check "Refresh browser when scene becomes active" (optional within 30s cache).
5. **Key:** Enable "Shutdown source when not visible" if you want to save API calls, but keeping it alive ensures continuous tracking.

## Troubleshooting

### Rate Limits (429)
The backend automatically handles 429s by retrying or serving stale data. Check Netlify Function logs for `Rate limit hit`.

### Data not updating
- Check `START_DATE` timezone.
- Check if summoner has played RANKED SOLO 5x5 matches since start date.
- Verify Riot API Key is not expired.
