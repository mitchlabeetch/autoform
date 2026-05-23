# 13 — Caveats & Attention Points

> **Alecia Forms TDD** · Potential pitfalls and critical considerations

---

## Critical Pitfalls

### 1. @autoform/* Package API Compatibility

**Risk**: The `@autoform/*` packages in the monorepo may have undocumented API quirks or version constraints that could break when integrated into a new Next.js 16 app.

**Mitigation**:
- Pin `@autoform/*` versions in `apps/forms/package.json` using `workspace:*`
- Test the `ZodProvider` → `AutoForm` rendering pipeline immediately after kickoff
- If breaking changes occur, fork the package into `packages/forms-adapter` and modify locally

### 2. Next.js 16 Migration Gotchas

**Risk**: Next.js 16 introduces `proxy.ts` replacing `middleware.ts`, and `use cache` as a new directive. Existing middleware patterns won't work.

**Mitigation**:
- Use `middleware.ts` for now — Next.js 16 still supports it (just deprecated in favor of `proxy`)
- Add `use cache` only on public form pages (they're static-ish data)
- Refer to the Next.js 16 upgrade guide for the exact migration steps
- **Test the auth redirect flow before deploying** — cookie domain `.alecia.fr` must work across both `alecia.fr` and `forms.alecia.fr`

### 3. Supabase RLS Misconfiguration

**Risk**: The most common and dangerous security issue. If RLS policies are wrong, users can read, modify, or delete data belonging to other users. This has happened in the existing `transactions` and `blog_posts` tables (RLS is currently disabled on them).

**Mitigation**:
- Every new table MUST have `ENABLE ROW LEVEL SECURITY`
- Every policy MUST include `TO authenticated` (never implicit)
- Every SELECT/INSERT/UPDATE/DELETE MUST be explicitly granted
- Test each policy with different user roles: owner, editor, viewer, anonymous
- Consider writing integration tests that verify RLS enforcement

### 4. Zod Schema Generation Edge Cases

**Risk**: The `schemaToZod()` converter may produce invalid Zod schemas for edge cases (e.g., empty options array in select, scale with min=max, file URL validation).

**Mitigation**:
- Write comprehensive unit tests for every block type in `schema-to-zod.ts`
- Add runtime validation: before rendering a form, catch Zod schema errors and show a friendly builder warning
- Block configuration panel should prevent invalid configs (e.g., require at least 2 options for select/radio)
- `description` block type must be skipped (it's not a question, just static text)

### 5. Drag-and-Drop Accessibility

**Risk**: `@dnd-kit` drag interactions are inherently difficult for keyboard and screen reader users.

**Mitigation**:
- Implement keyboard reorder: `Ctrl+Up` and `Ctrl+Down` to move selected block
- Add `aria-roledescription="sortable item"` to each block
- Add `aria-label` to drag handles: `"Glisser pour réordonner: {block label}"`
- Use `ScreenReaderAnnouncer` component for block add/remove/reorder events
- Test with a screen reader (VoiceOver on macOS or NVDA on Windows)

### 6. Autosave Race Conditions

**Risk**: Multiple rapid edits could cause race conditions in the autosave mechanism, leading to lost changes or version conflicts.

**Mitigation**:
- Debounce autosave at 500ms (not less)
- Use Supabase's `UPDATE ... SET schema_json = $1 WHERE id = $2 AND updated_at < $3` pattern to avoid overwriting newer saves
- Show a "Enregistrement..." indicator during saves
- Show "Dernière sauvegarde à 14:32" after successful save
- On browser crash/restart, restore from last saved version (check `lastSavedAt`)

### 7. Public Form Bot Spam

**Risk**: Public forms at `/f/[slug]` are accessible to anyone, including bots that could submit spam.

**Mitigation**:
- **Honeypot field**: Add a hidden `__hp` field to public forms. If filled, silently reject the submission (don't return an error that teaches bots)
- **Rate limiting**: Supabase Edge Function checks IP-based submit frequency (10/IP/form/hour)
- **CAPTCHA** (v1.5): Add Cloudflare Turnstile (privacy-friendly, free)
- **Email deduplication** (optional per form): If the form has an email field, prevent duplicate submissions from the same email

### 8. Coolify Single Environment Risk

**Risk**: No staging environment means a broken build goes directly to production.

**Mitigation**:
- **Local testing before push**: Run `npm run build` && `npm run type-check` locally
- **Playwright E2E tests**: Run critical path tests locally before pushing
- **Coolify instant rollback**: If deployed build fails, rollback to previous container image in <30 seconds
- **Feature flags in Supabase config**: Store feature flags in a `config` table; toggle features without redeploying

---

## UX Watch-Points

### 1. Builder State Loss

The form builder is a complex client-side state machine. Users will accidentally:
- Close the browser without saving
- Navigate away from the builder
- Experience a browser crash

**Mitigation**: `beforeunload` event listener warns users of unsaved changes. Autosave every 500ms minimizes data loss to at most 0.5 seconds.

### 2. Mobile Builder Usability

The block-based builder is inherently complex on small screens. Even with responsive adaptation:
- Drag-and-drop is difficult on touch screens
- The 3-panel layout doesn't fit on mobile
- Block configuration requires scrolling through many options

**Mitigation**: Mobile builder uses a simplified layout (horizontal palette, full-width canvas, bottom sheet config). Consider a "mobile-first" simplified builder experience in v1.5.

### 3. Form Version Immutability

When a form is published and someone submits to it, the `form_version_id` in `form_submissions` links the submission to the exact schema used. If the owner edits and republishes the form, a new version is created. This is correct, but:
- Submissions made to version 1 will always reference version 1's schema
- If version 1's schema is somehow corrupted, those submissions may become unreadable

**Mitigation**: `schema_json` in `form_versions` must NEVER be updated after creation. Only INSERT, never UPDATE. Use a new row for each version.

---

## Technical Debt to Monitor

| Item | Status | Action by |
|---|---|---|
| `middleware.ts` → `proxy.ts` migration | Deprecation in Next.js 16 | v1.5 |
| Auth cookie domain sharing across subdomains | Untested on prod | Launch day |
| File upload virus scanning | Not in v1 (relies on Supabase built-in) | v1.5 |
| Email notifications (Microsoft SMTP) | Not in v1 | v1.5 |
| Form templates (NDA, Due Diligence) | Not in v1 | v1.5 |
| Conditional visibility | Not in v1 | v2 |
| Multi-step forms | Not in v1 | v2 |
| Public API | Not in v1 | v2 |
| Dark mode on public forms | Not in v1 | v1.5 |
| Staging environment | Not in v1 | v1.5 |

---

## GDPR Considerations

Even though data responsibility rests with the form creator, the platform must support GDPR compliance:

- **Data residency**: OVH VPS is in France, Supabase data in EU ✅
- **Right to erasure**: Form owners can delete individual submissions; admins can delete all data for a user
- **Consent**: Public forms should include a consent checkbox (configurable per form) in v1.5
- **Data retention**: No automatic deletion policy in v1; v1.5 should add configurable retention periods per form
- **Cookie consent**: If analytics are added (Plausible), implement a cookie banner. Until then, no cookies beyond auth session → no banner needed
- **Privacy policy**: Link in footer of every public form (`/f/[slug]`) pointing to alecia.fr/privacy

---

*This document is part of the Alecia Forms Technical Design Document suite. See [19-index.md](./19-index.md) for the complete index.*