# 19 — Index: Alecia Forms TDD

> **Technical Design Document Suite** · Complete cross-referenced index

---

## Document Overview

This Technical Design Document suite defines **HOW** to build Alecia Forms — a French-first, sovereign, no-code form builder for M&A advisory professionals. It complements the [PRD](../PRD-AleciaForms-MVP.md), which defines **WHAT** to build.

**Product**: Alecia Forms — `forms.alecia.fr`
**Stack**: Next.js 16 · React 19 · TypeScript · Tailwind v4 · shadcn/ui · @autoform/* · Zustand · TanStack Query · @dnd-kit · Framer Motion · Supabase
**Deployment**: Coolify on OVH VPS (24GB RAM, France) · €0 incremental cost

---

## File Index

| # | File | Contents | When to Read |
|---|---|---|---|
| 01 | [recommended-approach.md](./01-recommended-approach.md) | Architecture decision, alternatives comparison (monorepo Next.js 16 vs. 4 alternatives), key architectural decisions (AD-1 through AD-5) | Before starting development |
| 02 | [tech-stack.md](./02-tech-stack.md) | Complete technology choices (Next.js 16, Zustand, TanStack Query, etc.), version matrix, dependency map, package list | Before setting up the project |
| 03 | [project-setup.md](./03-project-setup.md) | Step-by-step scaffolding (15 steps), directory structure, Tailwind config, Supabase client setup, Coolify deployment config, verification checklist | Day 1 of development |
| 04 | [feature-implementation.md](./04-feature-implementation.md) | Implementation guide for all 8 PRD features: Auth, Dashboard, Builder, Schema Engine, Public Rendering, Submissions, Submission Mgmt, Form Management | During development — refer to specific features as you build them |
| 05 | [design-implementation.md](./05-design-implementation.md) | Alecia Design System implementation: typography, colors, block card spec, public form layout, Framer Motion animations, @dnd-kit drag spec, a11y, responsive, print styles | During UI development |
| 06 | [database-storage.md](./06-database-storage.md) | Complete SQL schema (6 tables with RLS policies), Supabase Storage config, indexes, data flow diagrams, migration strategy | Before creating database tables |
| 07 | [ai-assistance.md](./07-ai-assistance.md) | Dyad prompt patterns, Codex CLI commands, debugging templates, prompt templates for common tasks | When using AI tools during development |
| 08 | [deployment-plan.md](./08-deployment-plan.md) | Coolify deployment steps, DNS config, environment variables, webhook setup, rollback strategy, single-env justification | Before deploying |
| 09 | [cost-breakdown.md](./09-cost-breakdown.md) | Monthly costs (€0 incremental), one-time costs (€0), scaling projections (v1 through v3), ROI analysis (€204K-340K/year saved) | For budget approval |
| 10 | [scaling-path.md](./10-scaling-path.md) | Scaling from <10 users to 10K+: database optimization, caching, CDN, horizontal scaling, multi-tenancy | When planning v1.5+ |
| 11 | [learning-resources.md](./11-learning-resources.md) | Curated learning materials for Next.js 16, React 19, Supabase, Zustand, TanStack Query, @dnd-kit, Framer Motion, Tailwind v4, WCAG 2.1 | Before starting development |
| 12 | [success-checklist.md](./12-success-checklist.md) | Pre-launch checklist (security, functionality, design, performance, deployment), launch-day checklist, 30-day success criteria, Definition of Done | Before and after launch |
| 13 | [caveats-attention.md](./13-caveats-attention.md) | Critical pitfalls: @autoform compatibility, Next.js 16 migration, RLS misconfiguration, Zod edge cases, drag-and-drop a11y, autosave race conditions, bot spam, single-env risk | Before development and during review |
| 14 | [dev-roadmap.md](./14-dev-roadmap.md) | 16-day development timeline: Phase 1 (Foundation), Phase 2 (Builder), Phase 3 (Dashboard), Phase 4 (Polish & Launch) | For project planning and daily standups |
| 15 | [backend-overview.md](./15-backend-overview.md) | API route handlers, Server Actions, database query patterns, rate limiting Edge Function, complete data flow diagram | When building backend features |
| 16 | [uiux-overview.md](./16-uiux-overview.md) | User personas (Marie, Thomas, External Respondent), UX goals, information architecture, page-by-page specs, interaction states, French UI glossary, image generation prompts | When designing and building UI |
| 17 | [business-justification.md](./17-business-justification.md) | Market positioning, competitive analysis (vs. Typeform, Jotform, Tally, Budibase), go-to-market strategy, name/slogan ideas, ROI calculation (€204K-340K/year) | For stakeholder buy-in |
| 18 | [skill-creator-guide.md](./18-skill-creator-guide.md) | 8 architectural rules, code generation templates (Server Component, Client Component, TanStack Query hook, Zustand store), Supabase query patterns, file naming conventions | When prompting AI tools or onboarding new developers |

---

## Cross-Reference Map

### By Topic

| Topic | Primary Doc | Supporting Docs |
|---|---|---|
| Authentication flow | 04-feature-implementation | 06-database-storage, 08-deployment-plan |
| Builder drag-and-drop | 04-feature-implementation, 05-design-implementation | 13-caveats-attention |
| Database schema | 06-database-storage | 15-backend-overview |
| Deployment | 08-deployment-plan | 03-project-setup |
| Design system tokens | 05-design-implementation | 02-tech-stack, AI_RULES.md |
| French strings | 16-uiux-overview | 18-skill-creator-guide |
| RLS policies | 06-database-storage | 12-success-checklist, 13-caveats-attention |
| Schema-to-Zod engine | 04-feature-implementation | 02-tech-stack |
| Cost analysis | 09-cost-breakdown | 17-business-justification |
| Testing | 12-success-checklist | 03-project-setup |
| AI tool usage | 07-ai-assistance | 18-skill-creator-guide |
| Mobile responsive | 05-design-implementation | 16-uiux-overview |

### By Phase

| Phase | Docs to Reference |
|---|---|
| **Day 1-2**: Project setup & auth | 03-project-setup, 04-feature-implementation (F1), 06-database-storage |
| **Day 3-4**: Schema engine & public rendering | 04-feature-implementation (F4, F5), 02-tech-stack |
| **Day 5-10**: Builder | 04-feature-implementation (F3), 05-design-implementation, 13-caveats-attention |
| **Day 11-14**: Dashboard & management | 04-feature-implementation (F2, F6-F8), 15-backend-overview |
| **Day 15-16**: Polish & launch | 12-success-checklist, 08-deployment-plan |

---

## Update Instructions

This TDD is a living document. To update:

1. **Minor corrections** (typos, broken links): Edit directly in the affected file
2. **Architecture changes** (new library, different pattern): Update the primary doc AND all cross-references
3. **New features** (v1.5 additions): Create a new section in the relevant doc (e.g., `04-feature-implementation.md` § F9)
4. **Major re-architecture**: Create a new version (e.g., `02-tech-stack-v2.md`) and update this index

### Change Log

| Date | Change | Author |
|---|---|---|
| 2025-07-10 | Initial TDD creation (all 19 files) | Dyad AI |
| — | — | — |

---

*This document is part of the Alecia Forms Technical Design Document suite. Start here, then navigate to the specific file you need.*