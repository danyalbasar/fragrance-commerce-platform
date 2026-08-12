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
   - `Jwt__Key` — a long random secret (32+ chars). Use the same value in all environments.
   - `Jwt__Issuer` — `FragranceCommerceApi`
   - `Jwt__Audience` — `FragranceCommerceClient`
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
