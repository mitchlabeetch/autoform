# 11 — Learning Resources

> **Alecia Forms TDD** · Curated learning materials for the chosen tech stack

---

## Essential Resources by Technology

### Next.js 16 (App Router)

| Resource | Type | Priority | Link |
|---|---|---|---|
| Next.js 16 Upgrade Guide | Docs | 🔴 Must-read | https://nextjs.org/docs/app/guides/upgrading/version-16 |
| Next.js App Router Fundamentals | Docs | 🔴 Must-read | https://nextjs.org/docs/app |
| `use cache` in Next.js 16 | Blog | 🟡 Important | https://nextjs.org/blog/next-16 |
| React Server Components Deep Dive | Article | 🟡 Important | https://nextjs.org/docs/app/building-your-application/rendering/server-components |
| Next.js 16 Proxy (replacing middleware) | Docs | 🔴 Must-read | https://nextjs.org/docs/app/guides/upgrading/version-16 |

### React 19

| Resource | Type | Priority | Link |
|---|---|---|---|
| React 19 New Features | Blog | 🟡 Important | https://react.dev/blog/2024/12/05/react-19 |
| `useActionState` API | Docs | 🔴 Must-read | https://react.dev/reference/react/useActionState |
| React Compiler Overview | Docs | 🟢 Reference | https://react.dev/learn/react-compiler |

### Supabase

| Resource | Type | Priority | Link |
|---|---|---|---|
| Supabase Auth with Next.js | Guide | 🔴 Must-read | https://supabase.com/docs/guides/auth/auth-helpers/nextjs |
| Row Level Security Guide | Docs | 🔴 Must-read | https://supabase.com/docs/guides/auth/row-level-security |
| Supabase Storage Guide | Docs | 🟡 Important | https://supabase.com/docs/guides/storage |
| Edge Functions with Deno | Docs | 🟡 Important | https://supabase.com/docs/guides/functions |
| Supabase JavaScript Client v2 | Reference | 🔴 Must-read | https://supabase.com/docs/reference/javascript/introduction |

### Zod

| Resource | Type | Priority | Link |
|---|---|---|---|
| Zod Documentation | Docs | 🔴 Must-read | https://zod.dev |
| Schema Composition | Docs | 🟡 Important | https://zod.dev/?id=recursive-types |
| Error Handling | Docs | 🟡 Important | https://zod.dev/?id=error-handling |

### @autoform/*

| Resource | Type | Priority | Link |
|---|---|---|---|
| @autoform/react README | Docs | 🔴 Must-read | `packages/react/README.md` |
| @autoform/shadcn README | Docs | 🔴 Must-read | `packages/shadcn/README.md` |
| @autoform/zod README | Docs | 🔴 Must-read | `packages/zod/README.md` |
| @autoform/core Source | Code | 🟡 Important | `packages/core/src/` |

### Zustand

| Resource | Type | Priority | Link |
|---|---|---|---|
| Zustand v5 Documentation | Docs | 🔴 Must-read | https://zustand.docs.pmnd.rs/ |
| TypeScript Usage | Guide | 🟡 Important | https://zustand.docs.pmnd.rs/guides/typescript |
| Persist Middleware | Docs | 🟢 Reference | https://zustand.docs.pmnd.rs/middlewares/persist |

### TanStack Query v5

| Resource | Type | Priority | Link |
|---|---|---|---|
| TanStack Query v5 Overview | Docs | 🔴 Must-read | https://tanstack.com/query/latest |
| Queries & Mutations | Guide | 🔴 Must-read | https://tanstack.com/query/latest/docs/react/guides/queries |
| Optimistic Updates | Guide | 🟡 Important | https://tanstack.com/query/latest/docs/react/guides/optimistic-updates |
| SSR with Next.js | Guide | 🟡 Important | https://tanstack.com/query/latest/docs/react/guides/ssr |

### @dnd-kit

| Resource | Type | Priority | Link |
|---|---|---|---|
| @dnd-kit Core Docs | Docs | 🔴 Must-read | https://docs.dndkit.com/core |
| Sortable Preset | Docs | 🔴 Must-read | https://docs.dndkit.com/presets/sortable |
| Accessibility Guide | Guide | 🟡 Important | https://docs.dndkit.com/guides/accessibility |

### Framer Motion

| Resource | Type | Priority | Link |
|---|---|---|---|
| Framer Motion Documentation | Docs | 🟡 Important | https://www.framer.com/motion/ |
| Reduced Motion | Guide | 🔴 Must-read | https://www.framer.com/motion/guide/reduced-motion/ |
| Layout Animations | Guide | 🟢 Reference | https://www.framer.com/motion/guide/layout-animations/ |

### Tailwind CSS v4

| Resource | Type | Priority | Link |
|---|---|---|---|
| Tailwind v4 Upgrade Guide | Docs | 🔴 Must-read | https://tailwindcss.com/docs/upgrade-guide |
| `@theme` Directive | Docs | 🔴 Must-read | https://tailwindcss.com/docs/theme |
| CSS Custom Properties | Docs | 🟡 Important | https://tailwindcss.com/docs/customizing-colors |

---

## Design System Learning

### Alecia Design System

| Resource | Location | Priority |
|---|---|---|
| Full Specification | `AI_RULES.md` in project root | 🔴 Must-read |
| Color Token Reference | `docs/05-design-implementation.md` | 🔴 Must-read |
| Navy Shadow Utilities | `AI_RULES.md` Section 4.1 | 🟡 Important |
| Card Hover Pattern | `AI_RULES.md` Section 4.5 | 🔴 Must-read |
| Typography Scale | `AI_RULES.md` Section 3.2 | 🔴 Must-read |

### WCAG 2.1 AA

| Resource | Type | Link |
|---|---|---|
| WCAG 2.1 Quick Reference | Reference | https://www.w3.org/WAI/WCAG21/quickref/ |
| Focus Visible Guidelines | Guide | https://www.w3.org/WAI/WCAG21/Understanding/focus-visible.html |
| Screen Reader Testing | Guide | https://www.w3.org/WAI/test-evaluate/preliminary/#screen-readers |

---

## French Localization

Since all UI strings must be in French:

| Resource | Type | Link |
|---|---|---|
| French Locale for date-fns | Docs | https://date-fns.org/docs/Locale |
| French Number Formatting | MDN | https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat |
| French Typographic Rules (Espaces insécables) | Reference | https://en.wikipedia.org/wiki/Space_(punctuation)#In_French |

---

## Recommended Learning Order

For an "in-between" developer using Dyad for implementation:

1. **Week 1, Day 1-2**: Next.js 16 App Router fundamentals + React 19 features
2. **Week 1, Day 3-4**: Supabase Auth + RLS deep dive
3. **Week 1, Day 5**: @autoform/react + @autoform/shadcn + @autoform/zod internals
4. **Week 2, Day 1-2**: Zustand store patterns + TanStack Query mutations
5. **Week 2, Day 3-4**: @dnd-kit sortable + Framer Motion reduced motion
6. **Week 2, Day 5**: Tailwind v4 + Alecia Design System tokens
7. **Week 3**: Begin building, referencing TDD docs throughout

---

*This document is part of the Alecia Forms Technical Design Document suite. See [19-index.md](./19-index.md) for the complete index.*