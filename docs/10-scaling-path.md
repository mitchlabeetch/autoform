# 10 — Scaling Path

> **Alecia Forms TDD** · Long-term scaling strategy and roadmap

---

## Current Scale Reality

Alecia Forms serves <10 users creating ~2 forms per week. This is a precision internal tool, not a high-traffic platform. The scaling path is therefore measured — the system must be **reliable and polished**, not horizontally scalable.

However, the architecture must not paint into a corner. Each scaling phase below addresses a realistic growth trigger.

---

## Phase 1: MVP (Current → Launch)

**Target**: <10 users, ~2 forms/week, <100 submissions/month

| Layer | Setup | Capacity |
|---|---|---|
| Compute | Single Coolify container on OVH VPS (24GB RAM) | ~1,000 concurrent visitors |
| Database | Supabase Free Tier (500MB) | ~50K rows before care needed |
| Storage | Supabase Storage (1GB free) | ~100 file uploads |
| Auth | Supabase Auth (50K MAU) | Unlimited for 10 users |

**No scaling actions needed.** Focus entirely on UX polish and reliability.

---

## Phase 2: Growing Adoption (v1.5 — 3-6 months post-launch)

**Trigger**: 20+ registered users, 10+ active forms, 500+ submissions/month

### Database Optimization

```sql
-- Add materialized view for dashboard counts
CREATE MATERIALIZED VIEW public.form_dashboard_counts AS
SELECT
  f.id AS form_id,
  f.title,
  f.status,
  COUNT(DISTINCT fs.id) AS submission_count,
  MAX(fs.created_at) AS last_submission_at
FROM public.forms f
LEFT JOIN public.form_submissions fs ON fs.form_id = f.id
WHERE f.is_deleted = false
GROUP BY f.id, f.title, f.status;

-- Refresh policy (set up Supabase cron or Edge Function)
REFRESH MATERIALIZED VIEW CONCURRENTLY public.form_dashboard_counts;
```

### Caching Strategy

- **Next.js `use cache`** (v16 feature): Cache public form pages for 60 seconds
- **TanStack Query staleTime**: Set `staleTime: 30_000` for dashboard queries (30s before refetch)
- **Supabase Realtime**: Not needed at this scale — polling every 30s is sufficient

### Email Notifications

- Integrate Microsoft SMTP (alecia.fr Exchange) for:
  - New submission notifications to form owners
  - Submission confirmation to respondents (optional)
- Use Supabase Edge Function triggered by `form_submissions` insert

---

## Phase 3: External Adoption (v2 — 6-12 months)

**Trigger**: External users, 100+ active forms, 5,000+ submissions/month

### Horizontal Scaling

- Add a second Coolify container for load balancing (no code changes needed)
- Or: Upgrade VPS to 48GB RAM (OVH allows vertical scaling with zero downtime)

### Database Scaling

- Upgrade to **Supabase Pro** (€25/mo) for:
  - 8GB database (from 500MB)
  - Daily backups
  - Point-in-time recovery
  - More Edge Function invocations

### Performance Optimizations

- **CDN**: Add Cloudflare in front of Coolify for static asset caching (CSS, JS, images)
- **Pagination**: TanStack Table server-side pagination for submissions (10,000+ rows)
- **Debounced saves**: Increase autosave debounce from 500ms to 1000ms to reduce DB writes
- **Cold start optimization**: Pre-warm Coolify container with a health check cron every 5 minutes

### Security Enhancements

- **Rate limiting**: Move from Supabase Edge Function to an in-app middleware rate limiter (Redis-backed if needed)
- **CAPTCHA**: Add Turnstile (Cloudflare) or hCaptcha to public forms for bot prevention
- **Audit logging**: Track all admin actions (create, publish, delete) in an `audit_logs` table

---

## Phase 4: Multi-Tenant / SaaS (v3 — 12+ months)

**Trigger**: External organizations want to use Alecia Forms with their own branding

### Architecture Changes

- **Organization model**: Add `organizations` table with `org_id` on all forms
- **Multi-tenancy**: RLS policies updated to scope by `org_id`
- **Custom domains**: Each org gets `forms.{org-slug}.alecia.fr` or CNAME their domain
- **Billing**: Stripe integration for per-org subscriptions

### Infrastructure

- **Separate databases**: One Supabase project per organization (isolation)
- **Or**: Row-level multi-tenancy** with `org_id` (simpler, less isolation)
- **Horizontal pod autoscaling**: Coolify supports Docker Swarm for auto-scaling containers

---

## Scaling Decision Matrix

| Trigger | Action | Cost | Phase |
|---|---|---|---|
| Dashboard queries slow (>2s) | Add materialized view | €0 | v1.5 |
| Form page FCP > 1.5s | Add `use cache` + CDN | €0 (Cloudflare free) | v1.5 |
| Supabase storage > 1GB | Upgrade to Pro | €25/mo | v2 |
| Database > 500MB | Upgrade to Pro | €25/mo | v2 |
| Single container overloaded | Add second container or upgrade VPS | €0-40/mo | v2 |
| External org requests | Add multi-tenancy model | Development time | v3 |
| Custom domain requests | CNAME support + DNS automation | €0 (infrastructure) | v3 |

---

## References

- [PRD — Alecia Forms MVP](../PRD-AleciaForms-MVP.md)
- [Supabase Pricing & Limits](https://supabase.com/pricing)
- [Coolify Scaling Documentation](https://coolify.io/docs)

---

*This document is part of the Alecia Forms Technical Design Document suite. See [19-index.md](./19-index.md) for the complete index.*