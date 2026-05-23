# 08 — Deployment Plan

> **Alecia Forms TDD** · Step-by-step deployment to Coolify on OVH VPS

---

## Infrastructure Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     OVH VPS (France)                             │
│                     24GB RAM                                      │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Coolify (Docker Orchestrator)          │   │
│  │                                                           │   │
│  │  ┌────────────────┐  ┌────────────────┐                  │   │
│  │  │ alecia.fr       │  │ docs.alecia.fr  │                  │   │
│  │  │ (apps/website)  │  │ (apps/docs)      │                  │   │
│  │  │ Port: 3000      │  │ Port: 3002       │                  │   │
│  │  └────────────────┘  └────────────────┘                  │   │
│  │                                                           │   │
│  │  ┌────────────────────────────────────────────────────┐   │   │
│  │  │ forms.alecia.fr (NEW)                              │   │   │
│  │  │ (apps/forms)                                        │   │   │
│  │  │ Port: 3001                                           │   │   │
│  │  │ Next.js 16 · Turbopack · Node 20 Alpine             │   │   │
│  │  └────────────────────────────────────────────────────┘   │   │
│  │                                                           │   │
│  │  ┌────────────────────────────────────────────────────┐   │   │
│  │  │ Gitea (Self-hosted Git)                             │   │   │
│  │  │ Webhook: push → Coolify auto-deploy                 │   │   │
│  │  └────────────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Supabase (External: ehpubmtfnirzqztrlvph.supabase.co)   │   │
│  │ Auth · PostgreSQL · Storage · Edge Functions             │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Deployment Step-by-Step

### Step 1: DNS Configuration

In the OVH DNS zone for `alecia.fr`, add:

```
forms  CNAME  coolify-server-domain  TTL 300
```

Or if using a dedicated IP:

```
forms  A  [VPS_IP]  TTL 300
```

### Step 2: Coolify Application Setup

1. Log into Coolify dashboard
2. **Add New Resource** → Application
3. **Git Repository**: Connect to the self-hosted Gitea monorepo
4. **Branch**: `main`
5. **Build Pack**: Nixpacks
6. **Base Directory**: `/`
7. **Build Command**: `cd apps/forms && npm run build`
8. **Start Command**: `cd apps/forms && npm run start`
9. **Port**: `3001`
10. **Environment Variables**:

```
NEXT_PUBLIC_SUPABASE_URL=https://ehpubmtfnirzqztrlvph.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=[set-in-coolify-env]
NEXT_PUBLIC_APP_URL=https://forms.alecia.fr
NODE_ENV=production
```

11. **Domain**: `forms.alecia.fr`
12. **SSL**: Enable Let's Encrypt (Coolify auto-renews)

### Step 3: Gitea Webhook Configuration

1. In Gitea, navigate to the monorepo repository settings
2. **Webhooks** → Add Webhook
3. **Type**: Gitea
4. **URL**: Copy from Coolify application settings (deployment webhook URL)
5. **Trigger on**: Push events to `main` branch
6. **Active**: Yes

### Step 4: First Deployment

```bash
# From local machine, push the scaffold to trigger deployment
cd /path/to/autoform-monorepo
git add apps/forms/
git commit -m "feat: scaffold Alecia Forms — Next.js 16 + @autoform/* + Supabase"
git push origin main
```

This push triggers the Gitea webhook → Coolify pulls the code → builds the Docker image → deploys to `forms.alecia.fr`.

### Step 5: Database Setup

Execute the SQL from `docs/06-database-storage.md` via the Supabase SQL editor or `execute_sql` tool, in order:

1. `forms` table + policies
2. `form_versions` table + policies
3. `form_fields` table + policies
4. `form_submissions` table + policies
5. `form_permissions` table + policies
6. `profiles` table (if not already exists) + trigger
7. Storage bucket `form-uploads` + policies

### Step 6: Verify Deployment

```bash
# Check that the app responds
curl -I https://forms.alecia.fr
# Expected: 200 or 302 (redirect to /login)

# Check health endpoint (if configured)
curl https://forms.alecia.fr/api/health
# Expected: {"status": "ok"}

# Check database tables exist
codex "List all tables in the public schema and verify forms, form_versions, form_fields, form_submissions, form_permissions exist with RLS enabled"
```

---

## Deployment Flow Diagram

```
Developer → git push origin main
                │
                ▼
          Gitea Repository
                │
                │ (webhook payload)
                ▼
          Coolify Server
                │
                ├── Pull latest code
                ├── npm install (Turborepo cache)
                ├── cd apps/forms && npm run build
                ├── Build Docker image (Node 20 Alpine)
                ├── Stop old container
                ├── Start new container on port 3001
                │
                ▼
          forms.alecia.fr
          (Let's Encrypt SSL auto-renew)
```

---

## Rollback Strategy

If a deployment breaks:

### Option 1: Coolify Instant Rollback
1. Open Coolify dashboard → `forms.alecia.fr` application
2. Click **Deployments** → Find the last working deployment
3. Click **Redeploy** → The previous successful Docker image is redeployed
4. **Estimated downtime**: 10-30 seconds

### Option 2: Git Revert
```bash
# Revert the problematic commit
git revert HEAD
git push origin main
# This triggers a new deployment with the previous code
```

### Option 3: Manual Container Rollback
```bash
# SSH into the VPS
ssh user@ovh-vps

# Find the previous container image
docker images | grep forms

# Stop current container and start previous image
docker stop forms-alecia-fr
docker run -d --name forms-alecia-fr -p 3001:3000 [previous-image-id]
```

---

## Environment Management

### Single Environment (Production Only)

Given the ASAP timeline and <10 users, we use a single environment:

| Environment | URL | Database | Purpose |
|---|---|---|---|
| Production | forms.alecia.fr | Supabase (production) | Live app |

### Mitigating Risk Without Staging

| Risk | Mitigation |
|---|---|
| Broken build deployed | Coolify build fails → no deployment; local `npm run build` before push |
| Database migration breaks data | Create new tables only (no altering existing for MVP); test local with Supabase CLI |
| Feature breaks existing behavior | Vitest + Playwright run locally before push; manual testing on local dev server |
| Public form page broken | SSR is resilient; client errors are caught by React error boundaries |

### Future: Staging Environment (v1.5)

When introducing staging, add:
- `staging.forms.alecia.fr` as a second Coolify service
- A second Supabase project (or a separate schema) for staging data
- Deployment triggered from a `staging` branch instead of `main`

---

## Monitoring & Logging

### Basic Monitoring (MVP)

| What | How |
|---|---|
| Application logs | Coolify container logs (accessible via dashboard) |
| Server resource usage | Coolify built-in monitoring (CPU, RAM, Disk) |
| Uptime | Coolify health checks every 60 seconds |
| Deploys | Gitea webhook logs + Coolify deployment history |
| Form submissions | `SELECT COUNT(*) FROM form_submissions` query |

### Enhanced Monitoring (v1.5+)

- Plausible Analytics integration for page views
- Supabase Dashboard for database metrics
- Custom alerts (submission count anomalies, error rate spikes)

---

## Supabase Edge Functions

### Rate Limiting Edge Function

Create `supabase/functions/rate-limit/index.ts`:

```typescript
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://forms.alecia.fr",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const clientIp = req.headers.get("x-forwarded-for") || "unknown";
  const formId = new URL(req.url).searchParams.get("form_id");

  if (!formId) {
    return new Response(JSON.stringify({ error: "form_id required" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Rate limit: 10 submissions per IP per form per hour
  // Implementation uses Supabase Redis or in-memory store
  // For MVP, a simple check against recent submissions
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL"),
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
  );

  const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
  const { count } = await supabase
    .from("form_submissions")
    .select("*", { count: "exact", head: true })
    .eq("form_id", formId)
    .eq("respondent_ip", clientIp)
    .gte("created_at", oneHourAgo);

  const allowed = (count ?? 0) < 10;

  return new Response(JSON.stringify({ allowed, remaining: 10 - (count ?? 0) }), {
    status: allowed ? 200 : 429,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
```

---

## References

- [Coolify Documentation](https://coolify.io/docs)
- [Next.js 16 Deployment](https://nextjs.org/docs/app/building-your-application/deploying)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [PRD — Alecia Forms MVP](../PRD-AleciaForms-MVP.md)

---

*This document is part of the Alecia Forms Technical Design Document suite. See [19-index.md](./19-index.md) for the complete index.*