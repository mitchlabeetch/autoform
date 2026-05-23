# 12 — Success Checklist

> **Alecia Forms TDD** · Launch and post-launch success criteria

---

## Pre-Launch Checklist

### Authentication & Security

- [ ] Supabase Auth configured with `.alecia.fr` cookie domain
- [ ] `middleware.ts` (or `proxy.ts` for Next.js 16) protects dashboard routes
- [ ] All 6 database tables created with correct RLS policies
- [ ] `handle_new_user` trigger creates profiles on signup
- [ ] Storage bucket `form-uploads` created with correct policies (10MB limit, MIME type restrictions)
- [ ] Rate limiting Edge Function deployed and tested
- [ ] Honeypot field added to public forms (bot detection)
- [ ] SQL injection tested (all inputs go through Supabase parameterized queries)
- [ ] XSS tested (all form data sanitized in rendering)
- [ ] CSRF protection verified (Next.js built-in CSRF token handling)

### Functionality

- [ ] User can sign up and log in via Supabase Auth
- [ ] User can create a new form (title + initial draft)
- [ ] Block-based builder renders all 12 block types correctly
- [ ] Drag-and-drop reordering works with @dnd-kit
- [ ] Autosave saves form_versions every 500ms after changes
- [ ] Schema-to-Zod converter produces valid Zod schemas for all block types
- [ ] Public form page at `/f/[slug]` renders correctly
- [ ] Public form submits data and stores in `form_submissions`
- [ ] Zod validation rejects invalid data server-side
- [ ] Thank-you page displays after successful submission
- [ ] Dashboard lists all forms accessible to the current user
- [ ] Submission viewer shows data in a table with sorting and filtering
- [ ] CSV export works for submissions
- [ ] Form permissions (admin, editor, viewer) enforced correctly
- [ ] Form can be published, unpublished, archived, and soft-deleted
- [ ] Form duplication creates a copy as a new draft

### Design & Accessibility

- [ ] All Alecia color tokens applied (no hardcoded hex values)
- [ ] Navy shadows used (no gray shadows)
- [ ] Typography scale followed (Playfair for H1, Bierstadt for body, Outfit for numbers)
- [ ] 8pt spacing grid respected
- [ ] `.btn-gold` applied to primary action buttons
- [ ] `.card-hover` applied to dashboard form cards
- [ ] `focus-visible` rings display on keyboard navigation (light and dark mode)
- [ ] Skip-to-main-content link present on every page
- [ ] All icons have `aria-hidden="true"` or `aria-label`
- [ ] `prefers-reduced-motion` disables all transitions
- [ ] Mobile responsive layout works on 375px (iPhone SE) and 1440px (desktop)
- [ ] Dark mode toggles correctly with localStorage persistence
- [ ] Print stylesheet hides nav, buttons, and footer on public forms

### Performance

- [ ] Dashboard first contentful paint < 1.5 seconds
- [ ] Public form page FCP < 1.0 seconds (SSR)
- [ ] Builder block reorder latency < 100ms (optimistic UI)
- [ ] Form submission API response < 500ms
- [ ] Lighthouse Accessibility score ≥ 95
- [ ] Lighthouse Performance score ≥ 90

### Deployment

- [ ] `apps/forms` builds successfully: `npm run build`
- [ ] Type checking passes: `npm run type-check`
- [ ] Linting passes: `npm run lint`
- [ ] Coolify deploys to `forms.alecia.fr` successfully
- [ ] SSL certificate is valid and auto-renewing
- [ ] DNS resolves `forms.alecia.fr` to the correct IP
- [ ] Environment variables set in Coolify (not `.env.local` on production)
- [ ] Gitea webhook triggers Coolify auto-deploy on `main` push
- [ ] Rollback tested (redeploy previous container image)

---

## Launch-Day Checklist

- [ ] Final smoke test on production URL
- [ ] Create first test form as admin user
- [ ] Submit a test response as anonymous user
- [ ] Verify submission appears in dashboard
- [ ] Delete test submission
- [ ] Test login/logout flow
- [ ] Test dark mode toggle
- [ ] Test on mobile browser (iOS Safari + Android Chrome)
- [ ] Monitor Coolify logs for errors in first 30 minutes

---

## Post-Launch Monitoring (Week 1)

| Metric | Target | Monitoring Method |
|---|---|---|
| Uptime | > 99.5% | Coolify health checks |
| Error rate | < 1% of requests | Coolify container logs |
| Average form creation time | < 15 min from blank to published | User feedback |
| Submission success rate | > 95% | `form_submissions` count vs. API logs |
| Page load (public forms) | < 1.5s FCP | Manual Lighthouse test |
| Lighthouse accessibility | > 95 | Lighthouse CI or manual |

---

## 30-Day Success Criteria (from PRD)

| Metric | Target | Measurement |
|---|---|---|
| Forms created | ≥ 10 | `SELECT COUNT(*) FROM forms WHERE is_deleted = false` |
| External submissions | ≥ 50 | `SELECT COUNT(*) FROM form_submissions` |
| Completion rate | ≥ 70% | Ratio of partial → complete submissions |
| Time to create form | ≤ 15 min | `published_at - created_at` for first 10 forms |
| User satisfaction | ≥ 4.0/5.0 | Internal CSAT survey at 30 days |

---

## Definition of Done (Per Feature)

Each feature is **Done** when:

1. ✅ Code merged to `main` and deployed to `forms.alecia.fr`
2. ✅ TypeScript types pass (`npm run type-check`)
3. ✅ All RLS policies tested (owner can CRUD, others blocked per role)
4. ✅ French UI strings used throughout (no English in production)
5. ✅ WCAG 2.1 AA: `focus-visible` rings, contrast ratios, `aria-labels`
6. ✅ Mobile responsive tested on 375px and 1440px
7. ✅ Navy-tinted shadows applied (no generic gray shadows)
8. ✅ Alecia typography scale respected
9. ✅ Submission data correctly stored and retrievable in Supabase
10. ✅ Public form page renders in <1.0s FCP

---

*This document is part of the Alecia Forms Technical Design Document suite. See [19-index.md](./19-index.md) for the complete index.*