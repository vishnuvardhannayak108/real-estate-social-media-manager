# Real Estate Automation

Full-stack real estate operations dashboard with:

- Next.js admin app (auth, dashboard, upload, leads, chats, bookings, payments, logs)
- Express + TypeScript backend for secured API and webhook ingestion
- Supabase as the primary data store/auth provider
- n8n webhook forwarding for workflow automation

## Tech Stack

- Frontend: Next.js (App Router), React, TypeScript, Tailwind CSS
- Backend: Express, TypeScript, Zod, Helmet, CORS, rate limiting
- Data/Auth: Supabase
- Integrations: n8n, Meta webhooks, Calendly webhooks, payment webhooks

## Repository Structure

```text
.
|- app/                   # Next.js app routes and API routes
|- components/            # UI and feature components
|- lib/                   # Shared utilities and Supabase clients
|- backend/               # Express backend service
|  |- src/
|  |- Dockerfile
|  \- package.json
\- README.md
```

## Prerequisites

- Node.js 18+
- npm 9+
- Supabase project with required tables
- (Optional) n8n instance for workflow execution

## 1) Environment Variables

Copy the template files, then fill in real values.

```bash
# from repo root
cp .env.example .env.local
cp backend/.env.example backend/.env
```

### Frontend env file

Create .env.local in the project root:

```bash
# Required
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
N8N_WEBHOOK_BASE_URL=http://localhost:5678

# Optional
NEXT_PUBLIC_APP_NAME=Real Estate AI
```

### Backend env file

Create backend/.env:

```bash
PORT=3001
NODE_ENV=development
FRONTEND_ORIGIN=http://localhost:3000

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

N8N_WEBHOOK_BASE_URL=http://localhost:5678
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/xxx/yyy/zzz

API_SECRET_KEY=replace-with-a-strong-secret

META_WEBHOOK_SECRET=replace-me
META_VERIFY_TOKEN=replace-me
CALENDLY_WEBHOOK_SECRET=replace-me
RAZORPAY_WEBHOOK_SECRET=replace-me
STRIPE_WEBHOOK_SECRET=replace-me
```

## 2) Install Dependencies

From repo root (frontend):

```bash
npm install
```

From backend folder:

```bash
cd backend
npm install
```

## 3) Run Locally

Use two terminals.

### Terminal 1: Frontend

```bash
# from repo root
npm run dev
```

App runs at http://localhost:3000

### Terminal 2: Backend

```bash
cd backend
npm run dev
```

Backend runs at http://localhost:3001

Health check:

```bash
curl http://localhost:3001/health
```

## 4) How to Use After Setup

Follow this daily workflow after both frontend and backend are running:

1. Open http://localhost:3000 and sign in.
2. Use Dashboard to monitor lead counts, bookings, and revenue trends.
3. Use Upload to submit video URL, caption, hashtags, and target platforms.
4. Use Posts to track publishing state (PENDING, POSTED, FAILED).
5. Use Leads CRM to filter/search leads and update statuses.
6. Use Chat Monitor to review lead conversations in near real time.
7. Use Bookings and Payments to monitor conversion activity.
8. Use Logs to inspect system events and troubleshooting signals.

### Common Usage Scenarios

#### Publish a New Marketing Video

1. Go to /upload.
2. Enter video URL, caption, hashtags, and select platforms.
3. Submit the form to forward payload to n8n.
4. Verify progress in /posts.

#### Work Leads in CRM

1. Go to /leads.
2. Filter by status or search by Instagram ID/location.
3. Open a lead and update qualification fields and status.
4. Review related conversations from /chats for context.

#### Monitor Performance

1. Check /dashboard for KPIs.
2. Validate booking volume in /bookings.
3. Confirm paid transactions in /payments.
4. Investigate anomalies in /logs.

### Backend API Usage (Optional)

Use backend APIs for internal integrations or automation scripts.

1. Send Authorization header: Bearer <API_SECRET_KEY>
2. Call endpoints like /api/leads, /api/stats, /api/upload.
3. Use webhook routes only for provider callbacks (Meta/Calendly/Payments).

### Smoke Test Checklist

1. Frontend loads at http://localhost:3000.
2. Backend health returns success at http://localhost:3001/health.
3. Dashboard stats render without 500 errors.
4. Upload request is accepted and forwarded.
5. Leads list loads and status update succeeds.

## 5) First-Time Usage Walkthrough

1. Open http://localhost:3000
2. Sign in using a valid Supabase Auth user.
3. Land on Dashboard and verify cards/charts load.
4. Go to Upload and submit a content payload to trigger n8n webhook forwarding.
5. Open Leads CRM and test status updates.
6. Open Chats/Bookings/Payments/Logs pages and verify Supabase data renders.

## Main App Routes

- /login
- /dashboard
- /upload
- /posts
- /leads
- /chats
- /bookings
- /payments
- /logs

## Next.js API Routes (inside app)

- GET, PATCH /api/leads
- GET /api/leads/:id/chats
- GET /api/stats
- POST /api/upload

## Backend API Endpoints

- GET /health
- POST /api/upload
- GET /api/leads
- PATCH /api/leads/:id
- GET /api/leads/:id/chats
- GET /api/stats
- GET /api/webhooks/meta (verification)
- POST /api/webhooks/meta
- POST /api/webhooks/calendly
- POST /api/webhooks/payments

Protected backend routes require:

- Authorization: Bearer <API_SECRET_KEY>

## Build for Production

Frontend:

```bash
# from repo root
npm run build
npm run start
```

Backend:

```bash
cd backend
npm run build
npm run start
```

## Backend Docker (Optional)

```bash
cd backend
npm run build
docker build -t real-estate-ai-backend .
docker run --env-file .env -p 3001:3001 real-estate-ai-backend
```

## Troubleshooting

- Missing Supabase env vars: app fails at runtime when creating clients.
- 401 from backend routes: verify Authorization bearer token matches API_SECRET_KEY.
- Upload endpoint returns N8N error: check N8N_WEBHOOK_BASE_URL and webhook path availability.
- CORS errors on backend: verify FRONTEND_ORIGIN is set to your frontend URL.

## Notes

- Middleware enforces auth redirect behavior for protected dashboard routes.
- Webhook endpoints use raw request body where required for HMAC validation.
- Keep service role keys server-side only; never expose them in client-side code.
