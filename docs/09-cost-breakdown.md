# 09 — Cost Breakdown

> **Alecia Forms TDD** · Monthly and one-time cost analysis

---

## Monthly Costs

| Item | Cost | Notes |
|---|---|---|
| OVH VPS (24GB RAM) | €60/mo (already paid) | Existing Alecia infrastructure; no additional cost |
| Supabase Free Tier | €0 | 500MB database, 1GB storage, 50K monthly active users — far exceeds MVP needs |
| Domain `forms.alecia.fr` | €0 | Subdomain of existing `alecia.fr` — no additional cost |
| SSL Certificate | €0 | Let's Encrypt via Coolify — auto-renewed |
| **Total Monthly Additional** | **€0** | Alecia Forms adds zero incremental cost |

## One-Time Costs

| Item | Cost | Notes |
|---|---|---|
| DNS Configuration | €0 | Subdomain CNAME in existing OVH zone |
| Coolify Application Setup | €0 | Self-hosted, existing instance |
| Database Migration Execution | €0 | Run via Supabase SQL editor |
| SSL Certificate Setup | €0 | Coolify handles automatically |
| **Total One-Time** | **€0** | |

---

## Cost Scaling Projections

### Current Scale (MVP)

| Metric | Value | Supabase Free Tier Limit | Utilization |
|---|---|---|---|
| Database size | ~10MB estimated | 500MB | 2% |
| Storage | ~100MB estimated | 1GB | 10% |
| Monthly active users | <10 | 50,000 | <0.02% |
| API requests/month | ~2,000 | Unlimited (with rate limits) | Negligible |
| Edge Function invocations | ~500/month | 500,000 | 0.1% |

### Scale to 100 Users (v1.5)

| Item | Cost | Notes |
|---|---|---|
| OVH VPS | €60/mo (same) | 24GB RAM can handle 100+ concurrent forms |
| Supabase Free Tier | €0 | Still within free limits |
| **Additional Cost** | **€0** | |

### Scale to 1,000 Users (v2)

| Item | Cost | Notes |
|---|---|---|
| OVH VPS | €60/mo (same) | May need vertical scaling to 48GB RAM |
| Supabase Pro | €25/mo | Required for: 8GB DB, 100GB storage, daily backups |
| Plausible Analytics | €0 (self-hosted) | Add to existing Coolify setup |
| **Additional Cost** | **€25/mo** | |

### Scale to 10,000+ Users (v3)

| Item | Cost | Notes |
|---|---|---|
| OVH VPS (upgraded) | ~€100/mo | 48-64GB RAM |
| Supabase Pro | €25/mo | |
| Monitoring (Plausible self-hosted) | €0 | |
| **Additional Cost** | **€65/mo (incremental)** | |

---

## Cost Comparison with Alternatives

| Alternative | Monthly Cost | Notes |
|---|---|---|
| **Alecia Forms (self-hosted)** | **€0 incremental** | Uses existing VPS + free Supabase |
| Typeform | €25-83/mo | 100-1,000 responses; no self-hosting; US-based |
| Jotform | €34-99/mo | 1,000-10,000 responses; US-based; GDPR concerns |
| Formstack | €50-200/mo | Enterprise pricing; not self-hosted |
| Tally | €0-29/mo | 500-unlimited responses; EU-based; limited customization |
| Budibase (self-hosted) | €0 | Open source; but cannot match Alecia Design System |

**Alecia Forms wins on cost, sovereignty, and brand consistency.**

---

## ROI Analysis

### Time Investment

| Phase | Duration | Effort |
|---|---|---|
| Foundation (Auth + Schema Engine) | 4 days | Full-time development |
| Builder UX | 6 days | Full-time development |
| Dashboard + Submissions | 4 days | Full-time development |
| Polish + Testing | 2 days | Full-time development |
| **Total** | **16 days** | ~128 hours |

### Value Delivered

- **Replaces**: Manual Word document forms + email collection (estimated 2+ hours/week per advisor)
- **For 8 advisors**: ~16 hours/week recovered = ~€3,200/week at typical M&A billing rates
- **Break-even**: <1 day of saved time
- **Annual value**: ~€166,400 in recovered productivity

---

## References

- [Supabase Pricing](https://supabase.com/pricing)
- [OVH VPS Pricing](https://www.ovhcloud.com/en/vps/)
- [PRD — Alecia Forms MVP](../PRD-AleciaForms-MVP.md)

---

*This document is part of the Alecia Forms Technical Design Document suite. See [19-index.md](./19-index.md) for the complete index.*