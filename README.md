# LoL Stats Overlay for OBS

Real-time League of Legends stats overlay for streaming. Built with Angular 19 and Netlify Functions.

## Features

- **Multi-Account Support**: Track up to 3 accounts simultaneously with independent stats
- **9 Overlay Styles**: 3 visual themes (horizontal, vertical, grid) × 3 account themes
- **Real-time Stats**: Deaths, daily stats, LP, rank, win/loss streak, season winrate
- **Animated Carousel**: Alternates between streak display and winrate with conditional icons
- **OBS Optimized**: Transparent background, smooth animations, copyable URLs
- **Riot API Integration**: Automatic polling every 30s with rate limit handling
- **Persistent Storage**: Stats saved via Netlify Blobs across deploys

## Tech Stack

- **Frontend**: Angular 19, Lucide Icons, RxJS
- **Backend**: Netlify Functions (serverless)
- **Storage**: Netlify Blobs
- **API**: Riot Games API (League of Legends)

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create `.env` file:
```env
RIOT_API_KEY=RGAPI-xxxxxxxx
START_DATE=2025-12-16T00:00:00-03:00
CHAMPION_FILTER=Yunara
RIOT_REGION_PLATFORM=la1
RIOT_REGION_ROUTING=americas
```

### 3. Configure Accounts
Edit `netlify/functions/snapshot.ts`:
```typescript
const ACCOUNTS = {
    account1: { gameName: 'SummonerName1', tagLine: 'TAG1' },
    account2: { gameName: 'SummonerName2', tagLine: 'TAG2' },
    account3: { gameName: 'SummonerName3', tagLine: 'TAG3' },
};
```

### 4. Run Development Server
```bash
npx netlify dev
```
Access at `http://localhost:8888`

## Overlay URLs

| Account | Style 1 | Style 2 | Style 3 |
|---------|---------|---------|---------|
| Account 1 | `/overlay/style-1` | `/overlay/style-2` | `/overlay/style-3` |
| Account 2 | `/overlay/lamej0r/style-1` | `/overlay/lamej0r/style-2` | `/overlay/lamej0r/style-3` |
| Account 3 | `/overlay/waos/style-1` | `/overlay/waos/style-2` | `/overlay/waos/style-3` |

## OBS Configuration

1. Add **Browser Source**
2. URL: `https://your-site.netlify.app/overlay/style-1`
3. Width: `400-600` (adjust to fit)
4. Height: `100-300` (adjust to style)
5. ✓ Enable "Shutdown source when not visible" to save API calls

## API Endpoints

- `GET /api/snapshot?account=account1` - Get stats for specific account
- `GET /api/snapshot?account=account1&reset=true` - Reset account stats

## Deployment

```bash
npm run build
netlify deploy --prod --dir=dist/camululis-tracker/browser
```

## Troubleshooting

### Rate Limits (429)
Backend automatically retries with exponential backoff and serves cached data.

### Stats Not Updating
- Verify `START_DATE` timezone matches your region
- Check if account has played ranked matches since start date
- Confirm Riot API key is valid and not expired
- Check Netlify Function logs for errors

### Winrate Discrepancy
Winrate is fetched directly from Riot API (`/lol/league/v4/entries`) and may have a few minutes delay compared to third-party sites like OP.GG.

## License

MIT
