# 17 — Business Justification

> **Alecia Forms TDD** · Market positioning, competitive advantages, and go-to-market strategy

---

## Market Positioning

### The Problem

M&A advisory firms collect sensitive client data through:
- **Word documents** emailed back and forth (no validation, no tracking)
- **Google Forms** (generic, not branded, US-hosted — GDPR concerns)
- **Typeform/Jotform** (subscription costs, no self-hosting, limited customization)
- **PDF forms** (no submission tracking, manual data entry)

None of these solutions meet the **Sovereign Premiumism** standard of a high-end M&A advisory firm.

### The Solution

Alecia Forms is a **sovereign, self-hosted, premium form builder** that:
- Lives on your own infrastructure (OVH VPS, France)
- Matches your brand identity (Alecia Design System)
- Integrates with your existing auth system (Supabase)
- Produces forms at `forms.alecia.fr` that feel like a native product

---

## Competitive Analysis

| Feature | Alecia Forms | Typeform | Jotform | Tally | Budibase |
|---|---|---|---|---|---|
| **Self-hosted** | ✅ OVH VPS | ❌ Cloud only | ❌ Cloud only | ❌ Cloud only | ✅ Self-hosted |
| **GDPR compliant** | ✅ France-hosted | ⚠️ EU option | ⚠️ EU option | ✅ EU-based | ✅ Self-hosted |
| **Custom branding** | ✅ Full Alecia DS | ⚠️ Limited | ⚠️ Limited | ⚠️ Limited | ⚠️ Partial |
| **M&A specific UX** | ✅ French, premium | ❌ Generic | ❌ Generic | ❌ Generic | ❌ Generic |
| **Cost** | €0/mo incremental | €25-83/mo | €34-99/mo | €0-29/mo | €0 (self-hosted) |
| **Data sovereignty** | ✅ Full control | ❌ US-hosted | ❌ US-hosted | ✅ NL-hosted | ✅ Full control |
| **Form rendering engine** | @autoform/Zod | Proprietary | Proprietary | Proprietary | Proprietary |
| **Integration with suite** | ✅ Auth + DB shared | ❌ Standalone | ❌ Standalone | ❌ Standalone | ⚠️ Partial |

### Key Differentiators

1. **Sovereignty**: Data never leaves your OVH VPS in France. No US cloud dependency.
2. **Brand Cohesion**: Forms look and feel like Alecia products — navy shadows, Playfair headings, metallic blue buttons.
3. **Zero incremental cost**: Already paying for VPS and Supabase.
4. **Monorepo integration**: Uses `@autoform/*` packages, shares auth, and shares database with the entire Alecia Suite.
5. **French-first**: All UI strings in French. No "Submit" buttons — "Soumettre."

---

## Go-to-Market Strategy

### Phase 1: Internal Alpha (Weeks 1-2 Post-Launch)

**Target**: 5 internal advisors at Alecia Partners

**Actions**:
- Demo at Monday meeting
- Create 3 pre-built templates (NDA Request, Due Diligence Questionnaire, Client Intake)
- Gather feedback via a dedicated #alecia-forms Slack/Teams channel

**Success Criteria**: 5+ forms created, 10+ external submissions received

### Phase 2: Internal Beta (Weeks 3-4)

**Target**: All Alecia Partners staff (8-10 users)

**Actions**:
- Open to all staff with optional 15-minute onboarding session
- Implement top 3 requested features from alpha feedback
- Add email notifications for new submissions (Microsoft SMTP integration)

**Success Criteria**: 15+ forms created, 50+ external submissions

### Phase 3: Selective External Launch (Months 2-3)

**Target**: Invite 2-3 trusted client organizations to use forms.alecia.fr

**Actions**:
- Create a "managed" onboarding: Alecia staff create forms on behalf of clients
- Monitor performance and UX feedback
- Prepare for multi-organization support (v2)

**Success Criteria**: 2+ external organizations, 100+ total submissions

---

## Name & Slogan Exploration

### Product Name: **Alecia Forms**

Already established in the PRD. Clean, consistent, professional.

### Slogan Options

| Slogan | Tone | French Translation |
|---|---|---|
| "Forms that mean business." | Assertive, M&A-focused | "Des formulaires qui comptent." |
| "Collect with confidence." | Trust-oriented | "Collectez en toute confiance." |
| "Sovereign data collection." | Premium, security-focused | "Collecte de données souveraine." |
| "Premium forms for premium deals." | Brand-aligned | "Des formulaires premium pour des deals premium." |

**Recommendation**: **"Des formulaires qui comptent."** — It's punchy, French-first, and implies that the data collected matters (fitting for M&A).

---

## Revenue Model (Future — v2+)

While Alecia Forms is currently an internal tool, the architecture supports future monetization:

| Model | Description | Timeline |
|---|---|---|
| **Internal cost center** | Zero additional cost — included in Alecia Suite | MVP |
| **Per-seat licensing** | Charge client organizations per advisor seat | v2 |
| **Form volume pricing** | Tier by submissions per month (free up to 100, paid beyond) | v2 |
| **White-label** | Offer branded form builder to other M&A firms | v3 |

---

## ROI Calculation

### Time Saved

| Activity | Before (Manual) | After (Alecia Forms) | Time Saved per Form |
|---|---|---|---|
| Creating a form | 30 min (Word template) | 15 min (builder) | 15 min |
| Sending to client | 5 min (email) | 1 min (link) | 4 min |
| Collecting responses | 15 min (manual entry) | 0 min (auto-collected) | 15 min |
| Analyzing data | 20 min (spreadsheet) | 5 min (CSV export) | 15 min |
| **Total per form** | **70 min** | **21 min** | **49 min** |

For 8 advisors creating ~2 forms/week each:
- **Weekly time saved**: 8 × 2 × 49 min = **13.1 hours/week**
- **Annual time saved**: 13.1 × 52 = **681 hours/year**
- **At typical M&A billing rates** (€300-500/hr): **€204,000 - €340,500/year in reclaimed productivity**

### Cost

- **Additional monthly cost**: €0 (uses existing infrastructure)
- **Development investment**: ~128 hours (16 days)
- **ROI**: Pays for itself within the first week of use

---

## References

- [PRD — Alecia Forms MVP](../PRD-AleciaForms-MVP.md)
- [Alecia Design System Specification](../AI_RULES.md)

---

*This document is part of the Alecia Forms Technical Design Document suite. See [19-index.md](./19-index.md) for the complete index.*