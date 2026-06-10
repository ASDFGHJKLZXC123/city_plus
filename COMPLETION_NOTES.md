# Completion Notes

Status: **Complete.** Moved from `Unfinished/` to `Finished/` on 2026-06-09.

This file previously tracked the project as incomplete. All listed gaps have been resolved; the record below documents what was fixed and the one manual step left.

## What was wrong (and is now fixed)

Earlier audits found four air-quality gaps that had been fixed in the working tree but never committed, plus two undocumented gaps in the other layers. All are now resolved:

- **Air-quality fallback key mismatch** — already fixed previously (`server/data/airQualityFallback.js` strips the `,STATE,US` suffix before matching fixtures).
- **WebSocket hard-coded to San Francisco** — already fixed previously (per-connection `SET_CITY` with coordinates).
- **OpenAQ v2 (HTTP 410)** — already migrated to `v3/locations` (coordinate + radius search) in `server/routes/airQuality.js` and `server/websocket/liveUpdates.js`.
- **Weather + transit showed San Francisco for every other city** (the main remaining bug). Both routes looked up fixtures by the raw comma-formatted query and only had San Francisco + Austin fixtures, so with no `OPENWEATHER_KEY` every non-SF city silently showed SF data. Fixed: both now strip the suffix and fall back to **city-centered, deterministically-synthesised** fixtures for any city not in the curated tables.
- **Air-quality AQI hard-coded to `0`** in the v3 mapping (heatmap rendered colorless). Fixed: a shared mapper (`server/data/openaq.js`) converts measured PM2.5 to AQI via EPA breakpoints, and flags stations with no reading as `estimated` with a deterministic coordinate-derived value so the heatmap still renders.

## What changed

New: `server/data/synthetic.js` (deterministic per-coordinate generators + `pm25ToAqi`), `server/data/openaq.js` (shared v3 mapper), `server/data/weatherFallback.js`, `server/data/transitFallback.js`.

Modified: `server/routes/airQuality.js`, `weather.js`, `transit.js`, `server/websocket/liveUpdates.js` (pass lat/lon, strip suffixes, drop the `aqi:0` hard-code), and `README.md` (accurate Data Notes).

New tests: `weatherFallback.test.js`, `transitFallback.test.js`, `weatherRoute.test.js`, `openaq.test.js`, plus a coordinate-generation case in `airQualityFallback.test.js` and an `estimated`/range assertion in `airQualityRoute.test.js`. These cover the previously-invisible comma-suffix regression.

## Verified

- Server tests: **33 pass** (was 13). Client tests: **8 pass**.
- Runtime check (no API keys): `Denver,CO,US` returns Denver-centered weather, transit, and colored air-quality data on all three endpoints; curated cities (SF, Austin, Seattle, Chicago) still return their hand-authored fixtures.
- Client production build was not re-run here — this sandbox is Linux and `node_modules` holds the macOS esbuild binary; the client source is unchanged from its last passing build.

## Manual step left for you

- **Commit the changes.** The sandbox could not write to `.git` (locked/read-only), so the working tree has all the fixes uncommitted. From the project folder: `git add -A && git commit`.

## Optional cleanups (harmless, not blocking)

- `client/src/components/common/Button.jsx` is unused (no imports).
- `client/public/index.html` duplicates the real Vite entry `client/index.html`.
- The location autocomplete lives in `client/src/components/Sidebar/TimeFilter.jsx` (misleading name).
- `server/package.json` `dev` runs plain `node app.js` (no watch/reload).

(These couldn't be deleted from the sandbox — the mount blocks file deletion — so they're left for you to remove if you want.)
