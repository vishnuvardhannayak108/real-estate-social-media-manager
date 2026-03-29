# Real Estate AI Backend API

Production-ready Express.js + TypeScript backend for the Real Estate AI Lead Generation system.

## Stack

- Node.js 18+
- Express.js
- TypeScript
- Supabase (`@supabase/supabase-js`)
- Zod validation
- Helmet, CORS, Morgan, express-rate-limit
- HMAC verification with Node `crypto`

## Project Structure

src/
  index.ts
  config/env.ts
  middleware/
  routes/
  routes/webhooks/
  services/
  types/
  utils/

## Setup

1. Copy environment file:

```bash
cp .env.example .env
```

2. Fill all required env values.

3. Install dependencies:

```bash
npm install
```

4. Run in development:

```bash
npm run dev
```

## Build and Run

```bash
npm run build
npm run start
```

## API Endpoints

- `GET /health`
- `POST /api/upload`
- `GET /api/leads`
- `PATCH /api/leads/:id`
- `GET /api/leads/:id/chats`
- `GET /api/stats`
- `GET /api/webhooks/meta`
- `POST /api/webhooks/meta`
- `POST /api/webhooks/calendly`
- `POST /api/webhooks/payments`

## Security Notes

- Webhooks use `express.raw()` before JSON parsing for signature verification.
- HMAC uses timing-safe comparison.
- API routes use bearer token authentication (`API_SECRET_KEY`).
- Security headers via Helmet and strict CORS frontend origin allow-list.

## Docker Deployment

Build your app first so `dist/` exists:

```bash
npm run build
```

Then build and run Docker image:

```bash
docker build -t real-estate-ai-backend .
docker run --env-file .env -p 3001:3001 real-estate-ai-backend
```
