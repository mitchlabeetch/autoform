# 02 — Tech Stack

> **Alecia Forms TDD** · Complete technology choices with detailed justifications

---

## Stack Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     ALECIA FORMS TECH STACK                      │
├────────────────┬────────────────────────────────────────────────┤
│ Layer          │ Technology                                       │
├────────────────┼────────────────────────────────────────────────┤
│ Framework      │ Next.js 16 (App Router, Turbopack)             │
│ Language       │ TypeScript 5.7+                                  │
│ React          │ React 19                                         │
│ Styling        │ Tailwind CSS v4                                  │
│ UI Components  │ shadcn/ui + @autoform/shadcn                    │
│ Form Engine    │ @autoform/react + @autoform/zod (v3)            │
│ Validation     │ Zod v3                                           │
│ State (Client) │ Zustand v5                                       │
│ Data Fetching  │ TanStack Query v5                                │
│ DnD            │ @dnd-kit/core + @dnd-kit/sortable                │
│ Animation      │ Framer Motion v12                                │
│ Tables         │ TanStack Table v8                                │
│ Icons          │ Lucide React                                     │
│ Database       │ Supabase PostgreSQL                              │
│ Auth           │ Supabase Auth                                    │
│ Storage        │ Supabase Storage                                 │
│ Edge Functions │ Supabase Edge Functions (Deno)                   │
│ Email          │ Microsoft SMTP (alecia.fr Exchange)             │
│ Build          │ Turborepo (monorepo)                            │
│ Deploy         │ Coolify (Docker) on OVH VPS                     │
│ Git            │ Self-hosted Gitea                                │
│ Testing        │ Vitest + Playwright                              │
│ Linting        │ ESLint (@autoform/eslint-config)                │
│ AI Dev         │ Dyad                                             │
│ AI Runtime     │ Codex CLI                                        │
└────────────────┴────────────────────────────────────────────────┘
```

---

## Layer-by-Layer Justification

### 1. Framework: Next.js 16 (App Router)

| Attribute | Detail |
|---|---|
| **Version** | 16.2+ (latest stable as of July 2026) |
| **Why not 15?** | CVE-2025-66478 (CVSS 10.0 RCE) in RSC protocol; 16 includes Turbopack default, React Compiler, `use cache`, DevTools MCP |
| **Why not Remix?** | Requires new patterns; team already invested in Next.js App Router via monorepo |
| **Why not Astro?** | Primarily static/content; form builder needs rich client interactivity |
| **Key feature for Forms** | Server Components for public form pages (zero JS until hydration); Turbopack for fast builder HMR |

**Breaking changes from 15 to account for:**
- `middleware.ts` → `proxy.ts` convention (Next.js 16)
- `experimental.turbo` → `turbopack` config key
- Node.js 20.9+ required (VPS runs 20.x already)
- React Compiler enabled by default — may require memoization audit
- `use cache` replaces implicit fetch caching

### 2. Language: TypeScript 5.7+

| Attribute | Detail |
|---|---|
| **Why** | Type safety for schema-to-Zod converter, form field type definitions, and RLS policy type generation |
| **Config** | Uses `@autoform/typescript-config` from monorepo (`packages/typescript-config/nextjs.json`) |
| **Strict mode** | `strict: true` — no implicit any, no unchecked index access |

### 3. React 19

| Attribute | Detail |
|---|---|
| **Why** | Required by Next.js 16; provides `useActionState`, `useOptimistic`, Server Components |
| **Key features used** | `use()` for server data, `useActionState` for form submissions, `Suspense` streaming for public forms |

### 4. Styling: Tailwind CSS v4

| Attribute | Detail |
|---|---|
| **Why** | Already in monorepo; required by Alecia Design System tokens |
| **v4 specifics** | CSS `@theme` syntax (not `tailwind.config.ts`); uses `@import "tailwindcss"` entry point |
| **Custom tokens** | All Alecia color tokens, typography fonts, navy shadows, and card-hover utilities defined in `globals.css` under `@theme inline` |

### 5. UI Components: shadcn/ui + @autoform/shadcn

| Attribute | Detail |
|---|---|
| **shadcn/ui** | Base component library — Button, Card, Dialog, Input, Label, Select, etc. Consistent with Alecia Design System (CVA variants, navy shadows) |
| **@autoform/shadcn** | AutoForm component that renders Zod schemas as forms. The core rendering engine for public form pages |
| **@autoform/react** | Headless form logic (validation, field rendering, form context) |
| **@autoform/zod** | Zod v3 schema provider that parses Zod schemas for AutoForm and validates submissions |

**How they work together:**
```
Zod Schema → ZodProvider.parseSchema() → ParsedSchema → AutoForm (react) → shadcn UI Components → Rendered Form
```

The form builder reverses this flow:
```
Builder Block JSON → schemaToZod() → z.ZodObject → ZodProvider → AutoForm (preview)
```

### 6. Validation: Zod v3

| Attribute | Detail |
|---|---|
| **Why v3, not v4?** | `@autoform/zod` currently supports v3; v4 support exists (`@autoform/zod` v4 branch) but is less tested |
| **Runtime usage** | Form validation on submit (client + server), schema generation from builder block configs |
| **Type inference** | `z.infer<typeof schema>` provides TypeScript types for form data |

### 7. State Management: Zustand v5

| Attribute | Detail |
|---|---|
| **Why not Redux?** | Overkill for <10 users; Zustand is 1KB, no boilerplate |
| **Why not Context only?** | Form builder has complex inter-component state (selected block, drag state, preview mode) that would cause excessive re-renders with Context |
| **Why not Jotai/Recoil?** | Zustand's flat store model is easier to debug and persist; atoms add unnecessary abstraction for a single-page builder |
| **Store slices** | `useFormBuilderStore` — blocks, ordering, selection, drag state; `useUIStore` — sidebar panels, preview mode, theme |

**Store shape:**
```typescript
interface FormBuilderState {
  blocks: FormBlock[];
  selectedBlockId: string | null;
  dragState: { isDragging: boolean; draggedBlockId: string | null };
  previewMode: 'desktop' | 'mobile';
  isDirty: boolean;
  lastSavedAt: Date | null;
}
```

### 8. Data Fetching: TanStack Query v5

| Attribute | Detail |
|---|---|
| **Why not SWR?** | TanStack Query v5 has superior mutation handling, optimistic updates, and invalidation — critical for submission deletion and form updates |
| **Why not raw fetch?** | Form dashboard needs caching, refetching on window focus, and pagination for submissions table |
| **Key queries** | `useForms()`, `useForm(id)`, `useSubmissions(formId)`, `useFormVersions(formId)` |
| **Key mutations** | `useCreateForm()`, `useUpdateForm()`, `usePublishForm()`, `useDeleteSubmission()` |

### 9. Drag & Drop: @dnd-kit

| Attribute | Detail |
|---|---|
| **Why @dnd-kit?** | Already specified in Alecia Design System (Section 5.5); accessible, performant, touch-compatible |
| **Packages** | `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` |
| **Configuration** | 150ms activation delay, 5px pointer displacement; 3° rotation + scale(1.03) + shadow-navy-lg overlay |
| **Keyboard support** | Ctrl+Up/Down for reorder (accessibility requirement) |

### 10. Animation: Framer Motion v12

| Attribute | Detail |
|---|---|
| **Why** | Required for card-hover effects, block reorder animations, and panel transitions specified in Alecia Design System |
| **Key animations** | Block enter/exit (spring), sidebar slide, preview mode toggle, submission card reveal |
| **`prefers-reduced-motion`** | All Framer Motion animations will be wrapped in `useReducedMotion()` check per Alecia A11Y spec Section 7.4 |

### 11. Data Tables: TanStack Table v8

| Attribute | Detail |
|---|---|
| **Why** | Submission viewer needs sorting, filtering, pagination; TanStack Table is headless (works with shadcn styling) |
| **Used in** | `/forms/[formId]/submissions` page |
| **Features** | Column sorting, text search, date filtering, CSV export |

### 12. Icons: Lucide React

| Attribute | Detail |
|---|---|
| **Why** | Already bundled with shadcn/ui; tree-shakeable; consistent icon style across Alecia Suite |
| **Block type icons** | `Type` (text), `Mail` (email), `Hash` (number), `Phone` (phone), `ChevronDown` (select), `CheckSquare` (multiselect), `CircleDot` (radio), `Calendar` (date), `ToggleLeft` (boolean), `BarChart3` (scale), `Paperclip` (file), `AlignLeft` (description) |

### 13. Database: Supabase PostgreSQL

| Attribute | Detail |
|---|---|
| **Instance** | `ehpubmtfnirzqztrlvph.supabase.co` (existing) |
| **Tables** | `forms`, `form_versions`, `form_fields`, `form_submissions`, `form_permissions`, `profiles` (new); existing tables untouched |
| **RLS** | Every table has Row Level Security enabled per Alecia security requirements |
| **Extensions** | `uuid-ossp` (gen_random_uuid), `pgcrypto` (if needed) |

### 14. Auth: Supabase Auth

| Attribute | Detail |
|---|---|
| **Flow** | Email + password login; session JWT scoped to `.alecia.fr` |
| **SSO** | Same auth instance across `apps/website` and `apps/forms`; cookie domain sharing |
| **Middleware** | Next.js 16 `proxy.ts` (replaces `middleware.ts`) protects dashboard routes; public `/f/*` routes are unauthenticated |

### 15. Storage: Supabase Storage

| Attribute | Detail |
|---|---|
| **Bucket** | `form-uploads` — one bucket for all file upload fields |
| **Policies** | Authenticated users can upload; public respondents can upload via signed URLs; only form owners can list/delete |
| **Limits** | 10MB per file, 50MB per submission |
| **Virus scanning** | Edge Function scans uploads on creation (v1.5 — for v1, rely on Supabase's built-in scanning) |

### 16. Email: Microsoft SMTP (alecia.fr)

| Attribute | Detail |
|---|---|
| **Why not Resend?** | Alecia already has Microsoft Exchange handling alecia.fr SMTP; no need for another email provider |
| **How** | Supabase Edge Function sends email via Microsoft SMTP (authenticated) for: form submission confirmations (v1.5), form share invitations |
| **v1 scope** | Email sending is v1.5; v1 does not send automated emails |

### 17. Build: Turborepo

| Attribute | Detail |
|---|---|
| **Config** | `turbo.json` at monorepo root (already exists) |
| **Pipeline** | `build`, `dev`, `lint`, `type-check` — with caching for `@autoform/*` packages |
| **Workspace links** | `apps/forms` imports `@autoform/react`, `@autoform/shadcn`, `@autoform/zod`, `@autoform/core` via `workspace:*` protocol |

### 18. Deploy: Coolify + Docker

| Attribute | Detail |
|---|---|
| **How** | Coolify pulls from Gitea on `main` branch push; builds Docker image; deploys to `forms.alecia.fr` |
| **Container** | Node.js 20 Alpine; `next start` production server |
| **Domain** | `forms.alecia.fr` with Coolify-managed Let's Encrypt SSL |
| **Rollback** | Coolify stores previous container image; one-click rollback |

### 19. Testing: Vitest + Playwright

| Attribute | Detail |
|---|---|
| **Vitest** | Unit tests for `schemaToZod()` converter, Zustand stores, utility functions |
| **Playwright** | E2E tests for critical flows: form creation, block management, public form submission, auth redirect |
| **CI** | Run locally pre-push (no CI pipeline — Gitea webhook triggers deploy, not test runs) |

### 20. AI Tooling

| Tool | Role |
|---|---|
| **Dyad** | Primary development assistant — feature implementation, debugging, refactoring |
| **Codex CLI** | Runtime automation — database migrations, deployment scripts, infrastructure tasks on Coolify |

---

## Package Dependency Map

```
apps/forms/
├── next@16
├── react@19, react-dom@19
├── typescript@5.7+
├── tailwindcss@4
├── @autoform/react        (workspace:*)
├── @autoform/shadcn        (workspace:*)
├── @autoform/zod           (workspace:*)
├── @autoform/core          (workspace:*)
├── @supabase/supabase-js@2
├── zustand@5
├── @tanstack/react-query@5
├── @tanstack/react-table@8
├── @dnd-kit/core
├── @dnd-kit/sortable
├── @dnd-kit/utilities
├── framer-motion@12
├── lucide-react
├── zod@3
├── class-variance-authority
├── clsx, tailwind-merge
├── vitest
├── @playwright/test
└── @autoform/eslint-config  (workspace:*)
```

---

## Version Compatibility Matrix

| Package | Version | Requires |
|---|---|---|
| Next.js | 16.2+ | Node.js 20.9+, React 19 |
| React | 19.x | — |
| TypeScript | 5.7+ | — |
| Tailwind CSS | 4.x | PostCSS 8+ |
| @autoform/* | latest workspace | React 19, Zod 3 |
| @supabase/supabase-js | 2.x | — |
| Zustand | 5.x | React 18+ |
| TanStack Query | 5.x | React 18+ |
| @dnd-kit/core | 6.x | React 18+ |
| Framer Motion | 12.x | React 18+ |

---

## References

- [Next.js 16 Documentation](https://nextjs.org/docs)
- [Supabase JavaScript Client v2](https://supabase.com/docs/reference/javascript/introduction)
- [Zustand v5 Documentation](https://zustand.docs.pmnd.rs/)
- [TanStack Query v5](https://tanstack.com/query/latest)
- [TanStack Table v8](https://tanstack.com/table/latest)
- [@dnd-kit Documentation](https://docs.dndkit.com/)
- [Framer Motion v12](https://www.framer.com/motion/)
- [PRD — Alecia Forms MVP](../PRD-AleciaForms-MVP.md)

---

*This document is part of the Alecia Forms Technical Design Document suite. See [19-index.md](./19-index.md) for the complete index.*