# Deployment Guide

How to deploy the SSCRM system to Neon (DB), Fly.io (Backend), and Vercel (Frontend).

---

## 1. Database (Neon) 🐘

1.  **Create a Project** in Neon Console.
2.  **Get the Connection String** (Pooled connection recommended).
    *   Format: `postgres://user:pass@ep-xyz.region.aws.neon.tech/neondb`
3.  **Note the credentials**:
    *   Host: `ep-xyz...neon.tech`
    *   Database: `neondb`
    *   User: `...`
    *   Password: `...`

> **Note:** The `application.yml` is already configured to append `?sslmode=require` when you set `DB_SSL_MODE` environment variable.

---

## 2. Backend (Fly.io) 🪁

The `fly.toml` is already generated.

### Initial Setup
1.  Install `flyctl` and login.
2.  Navigate to project root:
    ```bash
    cd /path/to/crm-system
    ```
3.  Launch the app (if not already created):
    ```bash
    fly launch --no-deploy
    ```
    *   Select "Yes" to copy configuration if asked.
    *   Use the existing `fly.toml`.

### Set Secrets (Production Credentials)
Run this command to set all secrets at once:

```bash
fly secrets set \
  DB_HOST=ep-xyz.region.aws.neon.tech \
  DB_NAME=neondb \
  DB_USER=neondb_owner \
  DB_PASSWORD=your_neon_password \
  DB_SSL_MODE="?sslmode=require" \
  JWT_SECRET=your_production_jwt_secret_key \
  CORS_ALLOWED_ORIGINS=https://your-vercel-app.vercel.app,http://localhost:5173
```

### Deploy
```bash
fly deploy
```

Flyway will automatically run migrations on startup. Check logs to confirm:
```bash
fly logs
```

---

## 3. Frontend (Vercel) ▲

1.  **Import Project** in Vercel.
    *   Root Directory: `crm-customer-portal`
    *   Framework Preset: Vite
2.  **Environment Variables**:
    Add the following variable in the Vercel Project Settings:

    | Name | Value |
    |---|---|
    | `VITE_API_URL` | `https://your-fly-app.fly.dev/api` |

3.  **Deploy**:
    *   Push to main branch or click "Deploy" in Vercel.

---

## 4. Verification ✅

1.  Open your Vercel URL (e.g., `https://crm-customer-portal.vercel.app`).
2.  Register a new user (admin user `admin` won't assume frontend roles by default, creating a new AGENT/CUSTOMER is best).
3.  Check Network tab — requests should go to `https://your-fly-app.fly.dev/api/...`.
