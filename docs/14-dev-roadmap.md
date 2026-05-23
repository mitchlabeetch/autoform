# 14 — Development Roadmap

> **Alecia Forms TDD** · Detailed development timeline with milestones

---

## Phase Overview

```
Phase 1: Foundation (Days 1-4)
Phase 2: Builder (Days 5-10)
Phase 3: Dashboard & Management (Days 11-14)
Phase 4: Polish & Launch (Days 15-16)

Total: 16 working days (~3.2 weeks at 5 days/week)
```

---

## Phase 1: Foundation (Days 1-4)

### Day 1: Project Scaffold & Auth

**Morning (4h)**
- [ ] Create `apps/forms` with Next.js 16 template
- [ ] Configure Tailwind v4 with Alecia Design System tokens in `globals.css`
- [ ] Set up `package.json` with all workspace dependencies
- [ ] Install shadcn/ui and required components
- [ ] Create Supabase client files (`client.ts`, `server.ts`)
- [ ] Configure `.env.local` with Supabase credentials

**Afternoon (4h)**
- [ ] Create `middleware.ts` with auth protection for dashboard routes
- [ ] Create `SessionProvider.tsx` with auth state context
- [ ] Create `LoginForm.tsx` with French-localized Supabase Auth UI
- [ ] Create `(auth)/layout.tsx` and `(auth)/login/page.tsx`
- [ ] Create `(dashboard)/layout.tsx` with sidebar navigation
- [ ] Test: Sign up → Login → Redirect to dashboard → Logout

### Day 2: Database Setup & Types

**Morning (4h)**
- [ ] Execute all SQL migration statements from `docs/06-database-storage.md`
- [ ] Verify RLS policies with different user roles (admin, editor, viewer)
- [ ] Verify `handle_new_user` trigger creates profiles correctly
- [ ] Create Supabase Storage bucket `form-uploads` with policies
- [ ] Create TypeScript types in `src/types/forms.ts`

**Afternoon (4h)**
- [ ] Create `src/lib/forms/schema-to-zod.ts` with all 12 block type conversions
- [ ] Write unit tests for `schemaToZod()` with Vitest (one test per block type)
- [ ] Create `src/lib/forms/types.ts` with `FormBlock`, `BlockType`, `SelectOption`
- [ ] Create `src/lib/forms/schema-serializer.ts` for JSONB ↔ FormBlock conversion
- [ ] Test: Verify Zod schema generation for complex scenarios (nested selects, required/optional mixing)

### Day 3: Public Form Rendering

**Morning (4h)**
- [ ] Create `src/app/f/[formId]/page.tsx` Server Component
- [ ] Create `PublicFormRenderer.tsx` Client Component
- [ ] Integrate `@autoform/shadcn` + `@autoform/zod` for dynamic form rendering
- [ ] Style public form page per Alecia Design System (Card, shadow-navy-lg, btn-gold)
- [ ] Create thank-you page `/f/[formId]/merci`

**Afternoon (4h)**
- [ ] Create `src/app/api/forms/[formId]/submit/route.ts`
- [ ] Implement server-side Zod validation in the submit route
- [ ] Implement honeypot field check (`__hp`)
- [ ] Test: Create a form in Supabase directly, render it at `/f/[slug]`, submit data, verify in database

### Day 4: Public Form Polish & Auth Edge Cases

**Morning (4h)**
- [ ] Add responsive layout (mobile-first) for public forms
- [ ] Add dark mode support for public forms
- [ ] Add Alecia footer ("Propulsé par Alecia Forms")
- [ ] Add skip-to-content link for accessibility
- [ ] Test public form on iPhone SE (375px) and desktop (1440px)

**Afternoon (4h)**
- [ ] Test auth flow end-to-end: signup → email verification → login → dashboard → create form → publish → submit → view response
- [ ] Test RLS edge cases: user A cannot see user B's forms; viewer cannot edit
- [ ] Test form 404: navigate to `/f/nonexistent-slug` → shows 404
- [ ] Add error boundaries for public form page

---

## Phase 2: Form Builder (Days 5-10)

### Day 5: Builder Scaffold & Block Palette

**Morning (4h)**
- [ ] Create `src/stores/form-builder-store.ts` (Zustand)
- [ ] Create `src/components/forms/builder/FormBuilder.tsx` main layout (3-panel)
- [ ] Create `BlockPalette.tsx` with all 12 block types and icons
- [ ] Implement "add block" action in Zustand store (`addBlock(type, index)`)

**Afternoon (4h)**
- [ ] Create `BlockCard.tsx` with Alecia design (card-hover, navy shadows)
- [ ] Implement block selection state in Zustand
- [ ] Style block cards: default, hover, selected, drag states
- [ ] Test: Click palette items → blocks appear in canvas

### Day 6: Drag & Drop

**Morning (4h)**
- [ ] Integrate `@dnd-kit/core` + `@dnd-kit/sortable` into FormBuilder
- [ ] Implement `SortableContext` for block reordering
- [ ] Add DragOverlay with 3° rotation + scale(1.03) + shadow-navy-lg
- [ ] Implement 150ms activation delay and 5px pointer displacement

**Afternoon (4h)**
- [ ] Add keyboard reorder support (Ctrl+Up/Down)
- [ ] Add aria-roledescription and aria-label to sortable items
- [ ] Add ScreenReaderAnnouncer for add/remove/reorder events
- [ ] Test: Drag blocks to reorder, verify Zustand state updates

### Day 7: Block Configuration Panel

**Morning (4h)**
- [ ] Create `BlockConfigPanel.tsx` (right panel, 360px)
- [ ] Implement label input, placeholder input, required toggle
- [ ] Implement help text input
- [ ] Add block-specific configuration (options for select/radio, min/max for scale, etc.)

**Afternoon (4h)**
- [ ] Implement "Plus d'options" accordion for advanced settings
- [ ] Implement block delete with confirmation modal
- [ ] Implement block duplicate action
- [ ] Style config panel with Alecia tokens (bg-secondary, border-border, etc.)

### Day 8: Live Preview

**Morning (4h)**
- [ ] Create `LivePreview.tsx` component
- [ ] Connect preview to Zustand store (read `blocks` state)
- [ ] Generate Zod schema from current blocks using `schemaToZod()`
- [ ] Render with `@autoform/shadcn` AutoForm component

**Afternoon (4h)**
- [ ] Implement desktop/mobile preview toggle
- [ ] Add loading state when schema regenerates
- [ ] Handle preview errors gracefully (show warning instead of crash)
- [ ] Test: Add blocks → see them in preview → edit → see changes live

### Day 9: Autosave & Data Flow

**Morning (4h)**
- [ ] Create `useAutosave` hook with 500ms debounce
- [ ] Implement save indicator in builder header ("Enregistrement...", "Enregistré à 14:32")
- [ ] Create TanStack Query mutations: `useCreateForm`, `useUpdateForm`, `usePublishForm`
- [ ] Implement form creation flow: "Nouveau formulaire" → draft → edit → publish

**Afternoon (4h)**
- [ ] Implement form version creation on publish
- [ ] Add `beforeunload` warning for unsaved changes
- [ ] Implement brave browser restore (reload from last saved version)
- [ ] Test: Create form → add blocks → autosave → close browser → reopen → verify state restored

### Day 10: Builder Polish

**Morning (4h)**
- [ ] Add Framer Motion animations (block enter/exit, panel slide, preview toggle)
- [ ] Implement `prefers-reduced-motion` detection
- [ ] Add empty state for builder ("Aucun champ pour l'instant")
- [ ] Add builder navigation breadcrumbs

**Afternoon (4h)**
- [ ] Responsive builder for mobile (horizontal palette, bottom sheet config)
- [ ] Test full builder flow on iPhone SE and desktop
- [ ] Fix any drag-and-drop issues on touch devices
- [ ] Accessibility audit: Tab through all builder interactions

---

## Phase 3: Dashboard & Management (Days 11-14)

### Day 11: Dashboard Home

**Morning (4h)**
- [ ] Create `DashboardPage` with form grid
- [ ] Create `FormCard.tsx` with card-hover, status badge, action dropdown
- [ ] Implement "Nouveau formulaire" CTA button
- [ ] Add search and filter (by status: draft/published/archived)

**Afternoon (4h)**
- [ ] Implement TanStack Query hooks: `useForms`, `useCreateForm`, `useDeleteForm`, `useDuplicateForm`
- [ ] Create form creation flow: button → modal (title input) → redirect to builder
- [ ] Add empty state for dashboard ("Créez votre premier formulaire")
- [ ] Test: Create form → see it on dashboard → copy link → delete → duplicate

### Day 12: Submission Viewer

**Morning (4h)**
- [ ] Create `SubmissionsPage` at `/forms/[formId]/submissions`
- [ ] Implement TanStack Table v8 with columns: email, date, completion status
- [ ] Add row expansion for full JSON data view
- [ ] Style table with Alecia tokens (header bg-background-secondary, navy borders)

**Afternoon (4h)**
- [ ] Add date range filtering
- [ ] Add completion status filter
- [ ] Implement CSV export endpoint and download button
- [ ] Implement individual submission delete with confirmation modal

### Day 13: Form Settings & Permissions

**Morning (4h)**
- [ ] Create `SettingsPage` at `/forms/[formId]/settings`
- [ ] Implement publish/unpublish toggle
- [ ] Implement archive action
- [ ] Implement permanent delete with double confirmation

**Afternoon (4h)**
- [ ] Implement share/permissions UI: email input → role select → add
- [ ] Create `useShareForm` mutation
- [ ] List current collaborators with role badges
- [ ] Remove collaborator action
- [ ] Test: Share form → other user sees it on dashboard → change role → verify permissions

### Day 14: Integration & Edge Cases

**Morning (4h)**
- [ ] End-to-end test: Create form → add 5 blocks → publish → submit as anonymous → view submission → export CSV
- [ ] Test all block types individually in public form
- [ ] Test mobile responsive on 3 viewports: 375px, 768px, 1440px
- [ ] Test dark mode on all pages

**Afternoon (4h)**
- [ ] Fix bugs found during testing
- [ ] Add error boundaries on all pages
- [ ] Add loading skeletons on all data-fetching pages
- [ ] Verify all French strings (no English in production)

---

## Phase 4: Polish & Launch (Days 15-16)

### Day 15: Testing & Performance

**Morning (4h)**
- [ ] Write Vitest tests for `schemaToZod()` (all 12 block types)
- [ ] Write Vitest tests for Zustand store (add, remove, move, update blocks)
- [ ] Write Playwright E2E test: full form creation → submission lifecycle

**Afternoon (4h)**
- [ ] Run Lighthouse on public form page (target: Performance ≥90, Accessibility ≥95)
- [ ] Run Lighthouse on dashboard (target: Performance ≥85, Accessibility ≥95)
- [ ] Optimize: lazy load builder components, reduce bundle size
- [ ] Test `npm run build` passes with zero warnings
- [ ] Test `npm run type-check` passes with zero errors

### Day 16: Deployment & Launch

**Morning (4h)**
- [ ] Configure Coolify application for `forms.alecia.fr`
- [ ] Set environment variables in Coolify
- [ ] Push to `main` → trigger Gitea webhook → Coolify auto-deploy
- [ ] Verify deployment: `https://forms.alecia.fr` responds
- [ ] Verify SSL certificate is valid

**Afternoon (4h)**
- [ ] Production smoke test: signup → login → create form → publish → submit → view submission
- [ ] Verify auth cookie domain (`*.alecia.fr`)
- [ ] Monitor Coolify logs for first 30 minutes
- [ ] Share `forms.alecia.fr` with team for internal alpha
- [ ] Document any immediate issues in Gitea

---

## Post-Launch (Days 17+)

| Day | Task |
|---|---|
| 17-18 | Monitor production logs; fix any P0/P1 bugs |
| 19-21 | Onboard first 5 internal alpha users |
| 22-28 | Collect feedback; implement top 3 improvements |
| 29-30 | Prepare for internal beta (all Alecia staff) |

---

*This document is part of the Alecia Forms Technical Design Document suite. See [19-index.md](./19-index.md) for the complete index.*