# QR Code + URL Shortener

High-performance URL shortening service with QR code generation, built on edge computing and modern TypeScript.

## Architecture

```
┌─────────────┐
│  Next.js 16 │  User creates short URL + QR code
│  (Port 3000)│
└──────┬──────┘
       │ /api/* → proxy
       ↓
┌─────────────┐
│  Fastify 5  │  URL shortening + QR orchestration
│  (Port 3001)│
└──────┬──────┘
       │
       ├─→ PostgreSQL (persistent storage)
       ├─→ Upstash Redis (24hr cache, edge-compatible)
       └─→ QR Service (external Java microservice)

┌──────────────────┐
│ Cloudflare Worker│  User clicks short URL
│   (Global Edge)  │
└──────┬───────────┘
       │
       ├─→ Redis (cache hit → instant redirect)
       └─→ API (cache miss → resolve → cache → redirect)
```

## Tech Stack

- **Next.js 16.0.4** - React 19, App Router, Turbopack
- **Fastify 5.0.0** - High-performance API server
- **PostgreSQL** - Persistent storage (Supabase/Neon compatible)
- **Upstash Redis** - Serverless cache with REST API
- **Cloudflare Workers** - Global edge redirector
- **TypeScript 5.6** - End-to-end type safety

## Repository Structure

```
apps/
├── api/          Fastify API service
│   ├── src/
│   └── migrations/
├── web/          Next.js frontend
│   └── app/
└── worker/       Cloudflare Worker redirector
    └── src/
```

## Quick Start

```bash
# Install dependencies
npm install

# Configure API
cd apps/api
cp .env.example .env
# Edit .env with your DATABASE_URL, REDIS_URL, REDIS_TOKEN

# Run migrations
npm run migrate:up

# Start API
npm run dev

# In another terminal, start web
cd apps/web
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## API Endpoints

- `POST /api/shorten` - Create short URL with QR code
- `GET /api/resolve/:code` - Resolve short code to long URL
- `POST /api/analytics/hit` - Record click event

## Key Design Decisions

See [DESIGN.md](DESIGN.md) for detailed system design rationale.

## Database Schema

See [DATABASE.md](DATABASE.md) for schema documentation.

## Environment Variables

### API (.env)
```env
DATABASE_URL=postgresql://user:pass@host:5432/db
PUBLIC_BASE_URL=http://localhost:3001
REDIS_URL=https://xxx.upstash.io
REDIS_TOKEN=xxx
QR_SERVICE_URL=http://qr-service:8080  # Optional
REDIS_TTL_SECONDS=86400
```

### Worker (wrangler secrets)
```bash
wrangler secret put UPSTASH_REDIS_REST_URL
wrangler secret put UPSTASH_REDIS_REST_TOKEN
wrangler secret put API_BASE_URL
```

## License

MIT
