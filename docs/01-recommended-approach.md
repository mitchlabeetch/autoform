# 01 — Recommended Approach

> **Alecia Forms TDD** · Recommended architecture and alternatives analysis

---

## Executive Summary

Alecia Forms will be built as a **separate Next.js 16 App Router application** (`apps/forms`) within the existing Turborepo monorepo. It leverages the `@autoform/*` packages as its form rendering engine and Supabase as its sole backend service. The application deploys as an independent Docker container on the existing Coolify-managed OVH VPS, accessible at `forms.alecia.fr`.

This approach was selected over three alternatives after rigorous evaluation against the project's constraints: ASAP timeline, sub-10-user scale, €60/mo budget, and the mandate for premium UX quality.

---

## Selected Approach: Full-Stack Next.js 16 Monorepo App

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        OVH VPS (France)                            │
│                        Coolify Orchestrator                        │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │  apps/website │  │  apps/docs   │  │  apps/forms (NEW)        │  │
│  │  Next.js 15   │  │  Next.js 15  │  │  Next.js 16 App Router   │  │
│  │  alecia.fr    │  │  docs.alecia  │  │  forms.alecia.fr          │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────────┘  │
│         │                  │                      │                  │
│         └──────────────────┴──────────────────────┘                  │
│                            │                                         │
│                   ┌────────▼────────┐                                │
│                   │  Turborepo       │                                │
│                   │  npm workspaces  │                                │
│                   └────────┬────────┘                                │
│                            │                                         │
│         ┌──────────────────┼──────────────────┐                     │
│         │                  │                   │                     │
│  ┌──────▼──────┐  ┌───────▼───────┐  ┌───────▼────────┐           │
│  │ @autoform/  │  │ @autoform/     │  │ @autoform/      │           │
│  │ react       │  │ shadcn         │  │ zod             │           │
│  └─────────────┘  └───────────────┘  └────────────────┘           │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                      Supabase (ehpubmtfnirzqztrlvph)        │   │
│  │  ┌─────────┐  ┌──────────┐  ┌───────────┐  ┌───────────┐  │   │
│  │  │ Auth     │  │ Database │  │ Storage    │  │ Edge Fn    │  │   │
│  │  │ (.alecia │  │ (Postgres│  │ (File      │  │ (Rate      │  │   │
│  │  │  .fr)    │  │  + RLS)  │  │  uploads) │  │  limiting) │  │   │
│  │  └─────────┘  └──────────┘  └───────────┘  └───────────┘  │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │              Gitea (Self-Hosted Git)                         │   │
│  │  Webhook on push → Coolify auto-deploy                      │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### Why This Approach Wins

| Criterion | Score (1-5) | Notes |
|---|---|---|
| **Speed to MVP** | 5 | Reuses `@autoform/*`; no new backend infra; Turborepo caches shared builds |
| **UX Quality** | 5 | Full control over SSR, client hydration, and Alecia Design System |
| **Security (GDPR)** | 5 | Data stays in OVH France; Supabase RLS; no third-party data processors |
| **Cost** | 5 | $0 additional — uses existing VPS, existing Supabase free tier |
| **Maintainability** | 4 | Monorepo sharing; one codebase to update; familiar patterns |
| **Scalability** | 3 | Single container is sufficient for <10 users; horizontal scaling requires v2 work |
| **Sovereignty** | 5 | Entire stack self-hosted; no US cloud dependency |

---

## Alternative Approaches Evaluated

### Alternative A: Route Within `apps/web`

**Description**: Add `/forms/*` routes directly to the existing `apps/web` Next.js 15 application.

| Pro | Con |
|---|---|
| No new app scaffolding needed | Different Next.js major version (15 vs 16) |
| Shares layout and auth directly | Bloats the website bundle with form builder JS |
| Single deployment | Tight coupling — a builder bug could take down the main site |
| Simpler Coolify config | `apps/web` uses MUI components; Forms uses shadcn/ui — conflicting CSS |

**Verdict**: Rejected. The bundle bloat, version conflict (we want Next.js 16 for Forms), and CSS framework collision make this impractical. A form builder's drag-and-drop state management doesn't belong in the main website's JavaScript bundle.

---

### Alternative B: Standalone Repository (Outside Monorepo)

**Description**: Create a completely separate Git repository for Alecia Forms, not connected to the Turborepo workspace.

| Pro | Con |
|---|---|
| Complete isolation | Cannot reuse `@autoform/*` packages without npm publish + versioning |
| Independent deployment lifecycle | Duplicated Tailwind config, design tokens, and UI components |
| Simper mental model for new devs | No shared build caching (Turborepo remote cache) |
| | Must maintain two separate Supabase client configs |
| | Higher long-term maintenance cost |

**Verdict**: Rejected. The `@autoform/*` packages are the core differentiator — they're the reason this form builder can be built ASAP. Duplicating or publishing them to npm just for this app adds unnecessary complexity and drift risk. The monorepo approach lets us import packages via workspace links with zero publish overhead.

---

### Alternative C: Remix + SQLite (Litepad Approach)

**Description**: A lightweight alternative using Remix (or Hono) with a local SQLite database instead of Supabase.

| Pro | Con |
|---|---|
| Even faster cold start | No auth system — would need to build one from scratch |
| No external DB dependency | No real-time capabilities for v2 |
| Simpler deployment (single binary) | No row-level security — must implement in application layer |
| | File upload handling requires custom implementation |
| | No dashboard for database inspection (vs. Supabase Studio) |
| | Not aligned with existing Alecia infrastructure |

**Verdict**: Rejected. Supabase is already provisioned, already handles auth for the Alecia Suite, and already provides RLS, storage, and Edge Functions. Building a parallel stack would double the operational surface area for no meaningful gain at this scale.

---

### Alternative D: Low-Code Platform (Retool / Appsmith / Budibase)

**Description**: Use an open-source low-code platform (Budibase is self-hostable) and customize it with the Alecia design system.

| Pro | Con |
|---|---|
| Instant builder UI out of the box | No control over UX — cannot achieve Sovereign Premiumism look |
| No code needed for basic CRUD | Custom Docker deployment on Coolify is complex for Budibase |
| Built-in auth and database | Vendor lock-in to that platform's extensibility model |
| | Would still need to integrate `@autoform/*` rendering — conflicts with platform's own form system |
| | GDPR compliance varies by platform |

**Verdict**: Rejected. The entire point of building Alecia Forms is a premium, sovereign, branded experience. Low-code platforms produce generic-looking tools that cannot match the Alecia Design System. Additionally, the `@autoform/*` rendering pipeline would conflict with their built-in form engines.

---

## Decision Matrix Summary

| Approach | Speed | UX | Cost | Sovereignty | Maintainability | **Total** |
|---|---|---|---|---|---|---|
| **Selected: Monorepo Next.js 16 App** | 5 | 5 | 5 | 5 | 4 | **24/25** |
| A: Route in `apps/web` | 5 | 3 | 5 | 5 | 3 | 21 |
| B: Standalone Repo | 2 | 5 | 4 | 5 | 2 | 18 |
| C: Remix + SQLite | 3 | 3 | 5 | 4 | 3 | 18 |
| D: Low-Code Platform | 5 | 1 | 3 | 2 | 2 | 13 |

---

## Key Architectural Decisions

### AD-1: Form Schema as JSONB + Runtime Zod Generation

The form builder produces a **JSON schema** stored in `form_versions.schema_json`. At render time, a converter (`schemaToZod()`) transforms this JSON into a live `z.ZodType` that feeds `@autoform/shadcn`'s `AutoForm` component. This architecture gives us:

- **Design-time flexibility**: The builder can produce any combination of blocks without code changes
- **Runtime type safety**: Zod validates every submission server-side
- **Versioning**: Every publish creates an immutable `form_version`, so live forms never break from edits
- **Auditability**: Schema JSONB is queryable in Supabase for analytics

### AD-2: Server Components for Public Forms, Client Components for Builder

The public form page (`/f/[formId]`) is a **Next.js Server Component** that fetches the form configuration from Supabase and renders it with zero client JavaScript (except the form itself). This delivers sub-1s FCP and SEO benefits.

The form builder (`/forms/[formId]/edit`) is a **Client Component** heavy page using Zustand for drag-and-drop state management, `@dnd-kit` for interactions, and Framer Motion for transitions.

### AD-3: Single Supabase Instance, Shared Auth

Both `apps/website` and `apps/forms` share the same Supabase project (`ehpubmtfnirzqztrph.supabase.co`). Session cookies are scoped to `.alecia.fr` so a user authenticated on the main site is automatically authenticated on the forms app. No separate login required.

### AD-4: Stateless Builder, Autosave via Debounced API Calls

The builder uses Zustand for local state (block order, selected block, drag state). Changes are saved to Supabase via debounced PATCH requests (500ms after last change). No WebSocket or real-time sync needed — the scale (<10 users, rare concurrent edits) makes this unnecessary.

### AD-5: Coolify Container per App

Each app in the monorepo (`website`, `docs`, `forms`) gets its own Coolify service. This provides:
- Independent deployment and rollback
- Isolated failure domains
- Separate logging and monitoring
- Independent scaling (if needed in v2)

---

## Risk Mitigation

| Risk | Mitigation |
|---|---|
| `@autoform/*` API changes break Forms | Pin package versions in `apps/forms/package.json`; monorepo ensures compatibility |
| Next.js 16 breaking changes affect existing apps | `apps/forms` is a new app — no legacy migration; other apps stay on Next.js 15 |
| Single Coolify env = no staging | Vitest + Playwright run locally before push; Coolify instant rollback via previous container image |
| Builder state loss on browser crash | 500ms debounced autosave to Supabase; restore from last saved version on reload |
| File upload abuse (spam, large files) | Supabase Storage bucket policies (10MB/file, 50MB/submission); Edge Function for MIME validation |
| Public form bot submissions | Rate limiting via Edge Function (10/IP/hour) + honeypot field |

---

## References

- [PRD — Alecia Forms MVP](../PRD-AleciaForms-MVP.md)
- [Next.js 16 Upgrade Guide](https://nextjs.org/docs/app/guides/upgrading/version-16)
- [Turborepo Monorepo Documentation](https://turbo.build/repo/docs)
- [Supabase Auth SSO Configuration](https://supabase.com/docs/guides/auth)
- [Coolify Deployment Documentation](https://coolify.io/docs)

---

*This document is part of the Alecia Forms Technical Design Document suite. See [19-index.md](./19-index.md) for the complete index.*