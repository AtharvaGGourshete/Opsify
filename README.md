# Opsify

Opsify is an early full-stack app scaffold for repository analysis.

## Current Setup

- `frontend/`: Next.js 16 app using React 19, Tailwind CSS 4, ESLint, and NextAuth.
- `backend/`: Express 5 API using CORS, dotenv, simple-git, ignore, and Repomix.
- Backend repository analysis endpoint:
  - `GET /api/health`
  - `POST /api/repositories/analyze`
- GitHub auth is wired in the frontend through NextAuth.
- Frontend routes currently include `/` and `/dashboard`.
- AWS files exist under `backend/deployment/aws/`:
  - `bootstrap.yml` creates a GitHub Actions OIDC role.
  - `template.yml` defines a minimal AWS SAM Lambda test endpoint at `GET /test`.

## Backend

```bash
cd backend
npm install
npm run dev
```

The backend runs on `http://localhost:5000` by default.

`POST /api/repositories/analyze` expects:

```json
{
  "url": "https://github.com/owner/repo"
}
```

It clones the GitHub repository, scans files, detects languages/packages/frameworks/apps/databases/infrastructure, generates Repomix context, then returns a repository profile.

## AWS Deployment

`backend/deployment/aws/template.yml` is currently a minimal SAM template, separate from the Express API. It deploys `backend/deployment/aws/src/app.js` as a Node.js 22 Lambda that returns:

```json
{
  "message": "Opsify AWS SAM deployment works!"
}
```

## Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:3000` by default.

Current frontend routes:

- `/`: GitHub sign-in and signed-in user summary.
- `/dashboard`: repository analysis dashboard. It accepts a GitHub repository URL, calls `http://localhost:5000/api/repositories/analyze`, and displays repository overview stats, detected applications, languages, dependencies, infrastructure/CI detection, evidence, and raw Repomix context with copy support.

Required auth environment variables:

```bash
AUTH_GITHUB_ID=
AUTH_GITHUB_SECRET=
AUTH_SECRET=
```

## Start Cloudflare tunnel
```
cloudflared tunnel --url http://localhost:5000
```

## Known Gaps

- No root workspace scripts yet.
- No database or persistence layer.
- No automated tests configured.
- Frontend backend URL is hardcoded to `http://localhost:5000` in the dashboard.
- Frontend metadata and README are still mostly default scaffold content.
- AWS SAM deployment currently only covers a test Lambda, not the full backend API.

## Risky Command (Use only to truncate tables) - Strictly for testing purpose
```
TRUNCATE TABLE
    public.scan_evidence,
    public.infrastructure_files,
    public.scan_infrastructure,
    public.scan_databases,
    public.package_dependencies,
    public.scan_packages,
    public.applications,
    public.scan_languages,
    public.scan_files,
    public.repository_scans,
    public.repositories
RESTART IDENTITY
CASCADE;
```