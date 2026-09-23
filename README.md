# WeatherGPT

WeatherGPT is a weather, disaster alert, AI chat, and agriculture advisory app.

This project has two parts:

- `frontend/` - React + Vite website that users open in the browser.
- `backend/` - Node + Express API that handles login, signup, AI chat, weather context, and SQLite database.

## Quick Start

Install dependencies:

```bash
npm run install:all
```

Run frontend and backend together:

```bash
npm run dev
```

Local URLs:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- Backend health check: `http://localhost:5000/api/health`

## Project Flow

1. User opens the Vite frontend.
2. Frontend detects user location after browser permission.
3. Frontend sends chat/auth/weather requests to the backend.
4. Backend fetches live weather from Open-Meteo.
5. Backend asks the AI service for a response using live weather context.
6. Frontend displays the answer, weather card, alerts, maps, and agriculture advice.

## Important Files

### Backend

- `backend/index.js`
  Main backend file. It contains:
  - server setup
  - CORS setup
  - SQLite database setup
  - register/login/profile routes
  - live weather helper functions
  - AI chat route
  - fallback AI response

- `backend/package.json`
  Backend dependencies and scripts.

- `backend/database.sqlite`
  Local SQLite database file.

### Frontend

- `frontend/src/App.tsx`
  Main route setup. Add new pages here.

- `frontend/src/components/layout/Layout.tsx`
  Sidebar, top navbar, location label, user initials, and logout button.

- `frontend/src/contexts/LocationContext.tsx`
  Detects GPS location, converts it to city/state, and stores it for all pages.

- `frontend/src/services/weatherService.ts`
  Fetches dashboard weather from Open-Meteo.

- `frontend/src/services/aiService.ts`
  Sends chat questions to backend and decides whether to show weather or alert cards.

- `frontend/src/pages/AiChat.tsx`
  Main WeatherGPT chat screen with text, voice, language selector, and answer cards.

- `frontend/src/pages/Dashboard.tsx`
  Current weather and hourly forecast.

- `frontend/src/pages/AgricultureIntelligence.tsx`
  Crop selector, crop stage selector, irrigation source, and farming advisory.

- `frontend/src/pages/AlertCenter.tsx`
  Weather alert cards.

- `frontend/src/pages/LiveMap.tsx`
  Live map page.

## Where To Change Common Things

Add a new page:

1. Create a file in `frontend/src/pages/`.
2. Import it in `frontend/src/App.tsx`.
3. Add a route in `App.tsx`.
4. Add sidebar item in `frontend/src/components/layout/Layout.tsx`.

Change backend API URL in production:

- Vercel environment variable:

```txt
VITE_API_URL=https://your-render-backend.onrender.com
```

Allow frontend on backend:

- Render environment variable:

```txt
CORS_ORIGIN=https://your-vercel-frontend.vercel.app
```

Add more crop options:

- Edit `cropGroups` in `frontend/src/pages/AgricultureIntelligence.tsx`.

Add more crop stages:

- Edit `cropStages` in `frontend/src/pages/AgricultureIntelligence.tsx`.

Add more weather keywords for chat cards:

- Edit `weatherKeywords` in `frontend/src/services/aiService.ts`.

Add more weather condition labels:

- Edit `getWeatherCondition` in:
  - `backend/index.js`
  - `frontend/src/services/weatherService.ts`

## Deployment

### Backend on Render

Root directory:

```txt
backend
```

Build command:

```bash
npm install
```

Start command:

```bash
npm start
```

Environment variable:

```txt
CORS_ORIGIN=https://your-vercel-frontend.vercel.app
```

### Frontend on Vercel

Root directory:

```txt
frontend
```

Build command:

```bash
npm run build
```

Output directory:

```txt
dist
```

Environment variable:

```txt
VITE_API_URL=https://your-render-backend.onrender.com
```

After adding or changing environment variables, redeploy the service.

## Notes For Beginners

- Do not commit `node_modules/`. It is ignored by `.gitignore`.
- Run `npm run build` inside `frontend/` after frontend changes.
- Run `node --check index.js` inside `backend/` after backend changes.
- If location does not update, allow location permission in the browser and click the location button again.
- If AI fails, backend sends a safe fallback response so users still get useful weather guidance.
