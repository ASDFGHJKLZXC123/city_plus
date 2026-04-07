# CityPulse

CityPulse is a React and Express geospatial dashboard for exploring live urban signals on an interactive map. The app combines Deck.gl layers, Mapbox rendering, sidebar controls, charts, and backend proxy routes for air quality, weather, and transit-style location data.

## Features

- Interactive Mapbox + Deck.gl map
- Toggleable air quality, weather, and transit layers
- Autocomplete location search with disambiguated U.S. city suggestions
- Automatic map recentering when a new location is selected
- Sidebar weather summary and air quality trend chart
- Express API proxy and WebSocket updates
- Fallback air-quality fixtures when the legacy OpenAQ v2 endpoint returns `410 Gone`
- Jest coverage for core client UI and server middleware

## Tech Stack

- React 18
- Vite
- Redux Toolkit
- Deck.gl
- Mapbox GL
- Recharts
- Express
- Axios
- WebSocket (`ws`)
- Jest + React Testing Library
- Docker Compose
- GitHub Actions

## Requirements

- Node.js 18 or newer
- npm 8 or newer

`npm 6` does not support this repo’s workspace setup correctly and will recurse on commands like `npm run dev:client`.

## Project Structure

- [client](/Users/f8fq/WebstormProjects/city+/client): React app, Redux store, map components, sidebar UI, tests
- [server](/Users/f8fq/WebstormProjects/city+/server): Express API, cache middleware, websocket updates, tests
- [docker-compose.yml](/Users/f8fq/WebstormProjects/city+/docker-compose.yml): Local container orchestration
- [.github/workflows/ci.yml](/Users/f8fq/WebstormProjects/city+/.github/workflows/ci.yml): CI pipeline

## Local Setup

1. Confirm your toolchain:

```bash
node -v
npm -v
```

2. Install dependencies from the repo root:

```bash
npm install
```

3. Fill in the environment files:

- [client/.env.local](/Users/f8fq/WebstormProjects/city+/client/.env.local)
- [server/.env](/Users/f8fq/WebstormProjects/city+/server/.env)

Example values:

```env
# client/.env.local
VITE_MAPBOX_TOKEN=your_mapbox_token
VITE_API_BASE_URL=http://localhost:4000/api
```

```env
# server/.env
OPENWEATHER_KEY=your_openweather_key
OPENAQ_KEY=optional_key
PORT=4000
```

4. Start the API server:

```bash
npm run dev:server
```

5. In a second terminal, start the client:

```bash
npm run dev:client
```

6. Open `http://localhost:5173`

## Available Scripts

From the repo root:

- `npm run dev:client`
- `npm run dev:server`
- `npm run build`
- `npm run test`

Direct workspace commands:

- `npm run test --workspace client`
- `npm run test --workspace server`
- `npm run build --workspace client`

## How Location Search Works

- The sidebar includes a text box with a suggestion dropdown.
- Users can type a city or state fragment.
- The dropdown shows specific location options such as `Portland, Oregon, USA` and `Portland, Maine, USA`.
- Selecting a suggestion updates the query sent to the backend and recenters the map to that location.

## Data Notes

- Weather data is requested through the backend proxy.
- Transit data currently uses local fixture data.
- Air-quality requests currently fall back to fixture data when OpenAQ `v2` returns `410 Gone`. This keeps the UI usable, but a future migration to a current air-quality source is still needed.

## Testing

Run:

```bash
npm run test --workspace client
npm run test --workspace server
```

Current verified checks:

- client test suite passes
- server test suite passes
- client production build passes

## Docker

Docker files are included for both services plus [docker-compose.yml](/Users/f8fq/WebstormProjects/city+/docker-compose.yml).

```bash
docker compose up --build
```

Use Docker when you want both services started together in containers. For local debugging, the npm workflow is usually simpler.

## Architecture

- The client renders the dashboard, manages UI state in Redux, and builds Deck.gl layers from API responses.
- The server exposes `/api/weather`, `/api/air-quality`, and `/api/transit`.
- The WebSocket server pushes air-quality updates to the client.
- The map view recenters based on the selected location and then refines to the returned dataset coordinates.

## CI

The GitHub Actions workflow runs client and server tests on pushes and pull requests to `main`.
