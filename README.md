# Fragrance Commerce Platform

Full-stack e-commerce platform with a Next.js storefront, ASP.NET Core 8 REST API, and PostgreSQL database.

## Stack

- **Frontend**: Next.js (App Router), deployed on Vercel
- **API**: ASP.NET Core 8 Web API (`backend/FragranceCommerce.Api`)
- **Database**: PostgreSQL 16 (EF Core / Npgsql)
- **Media**: Cloudinary image uploads
- **Auth**: JWT bearer tokens

## Local Development

### Database + API (Docker)

```bash
cp .env.example .env   # fill in Cloudinary keys
docker compose up -d postgres backend
```

The API runs on `http://localhost:5203`, Swagger at `http://localhost:5203/swagger`.

### Frontend

```bash
cd frontend/fragrance-commerce-web
npm install
npm run dev
```

`src/services/api.ts` points to `http://localhost:5203/api` by default. Override with `NEXT_PUBLIC_API_BASE_URL`.

## Free Hosting (Render + Neon)

The API and database are hosted for free. The frontend stays on Vercel.

### 1. Create the Neon database

1. Sign up at [neon.tech](https://neon.tech) and create a project (free plan).
2. Open **Connection Details** → copy the connection string, e.g.:
   `postgresql://user:password@ep-xxxx.us-east-2.aws.neon.tech/neondb?sslmode=require`
3. Convert it to the EF Core format (this project uses `Host=...;Database=...;Username=...;Password=...;SSL Mode=Require`).

### 2. Deploy the API to Render

1. Push this repo to GitHub.
2. In [Render](https://dashboard.render.com), go to **New → Blueprint** and select the repo.
3. Render reads `render.yaml` and creates the `fragrance-api` web service. For each `sync: false` variable, enter a value:
   - `ConnectionStrings__DefaultConnection` — your Neon EF Core connection string
   - `Jwt__Key` — a long random secret (32+ chars), used only as a local-dev fallback. **Not used when `Jwt__PrivateKeyPem` is set.**
   - `Jwt__PrivateKeyPem` — **base64-encoded PKCS#8 RSA private key** (recommended, enables RS256 asymmetric signing). Generate with `openssl genrsa 2048` / `openssl pkcs8 -topk8`, then base64-encode the PEM text (no newlines). When set, tokens are signed with RS256 and `Jwt__Key` is ignored. When unset, the API falls back to HS256 with `Jwt__Key` (fine for local dev).
   - `Jwt__Issuer` — `luxuria-auth`
   - `Jwt__Audience` — `luxuria-web`
   - `CloudinarySettings__CloudName` / `ApiKey` / `ApiSecret`
   - `CORS__AllowedOrigins` — comma-separated, e.g. `https://fragrance-commerce-platform.vercel.app`
4. Deploy. Render builds the Dockerfile, runs `MigrateAsync` + the data seeder on startup, and gives you a URL like `https://fragrance-api.onrender.com`.

Notes for the free plan:

- The service sleeps after ~15 minutes of inactivity; the first request after idle takes ~1 min to wake up.
- Secrets live in Render's dashboard environment variables, never in the repo.

### 3. Point Vercel at the API

In Vercel → your project → **Settings → Environment Variables**, set:

- `NEXT_PUBLIC_API_BASE_URL` = `https://fragrance-api.onrender.com/api`
- `NEXT_PUBLIC_SITE_URL` = your Vercel URL

Re-deploy the frontend. The API CORS policy only allows the origins listed in `CORS__AllowedOrigins`, so add both the Vercel URL (for the live site) and any local preview origin.

### Troubleshooting

- **CORS errors in the browser**: confirm the exact origin (no trailing slash) is in `CORS__AllowedOrigins`.
- **API cold start**: Render free tier wakes on demand; first hit after sleep is slow but then responsive.
- **DB migration**: applied automatically on each deploy via `context.Database.MigrateAsync()` in `Program.cs`.

### Hardening notes (security assessment)

- **Kestrel `Server` header** is suppressed (`AddServerHeader = false`). Headers like `x-render-origin-server`, `Server: cloudflare`, `rndr-id`, `CF-RAY` (API) and `Server: Vercel`, `X-Nextjs-*`, `X-Vercel-*` (frontend) are injected by the Render/Cloudflare/Vercel platforms and **cannot** be removed from application code.
- **Frontend `Access-Control-Allow-Origin: *`** is injected by Vercel's CDN on all responses and is **not** removable from application code (verified: not overridable via `next.config.ts` `headers()` or middleware; not listed in Vercel's system headers). It is benign here: the header never applies to credentialed requests, and the frontend only serves public content — the API enforces its own strict CORS via `CORS__AllowedOrigins`. Strip it only by placing a proxy (e.g. Cloudflare) in front of the Vercel domain with a response-header transform rule.
- **JWT**: tokens are signed with **RS256** when `Jwt__PrivateKeyPem` is set (asymmetric; recommended for production). The API falls back to HS256 with `Jwt__Key` for local dev only.
- **Auth session**: the JWT is delivered as an `HttpOnly` cookie (`authToken`) and read via `GET /Auth/me`; it never touches `localStorage`. Log out through `POST /Auth/logout`.
- **Rate limiting**: `/Auth/login`, `/Auth/register` (10 req / 5 min / IP) and `/Cart/apply-coupon` (20 req / 10 min / IP) return `429` when exceeded.
