# 16 — UI/UX Overview

> **Alecia Forms TDD** · User personas, UX goals, and design documentation

---

## User Personas

### Marie — M&A Associate (Primary)

| Attribute | Detail |
|---|---|
| **Age** | 28-35 |
| **Role** | Junior to mid-level M&A advisor |
| **Tech Level** | Uses Notion, Airtable, Typeform daily; comfortable with SaaS tools |
| **Goal** | Create professional client-facing forms quickly without developer help |
| **Frustration** | Current process involves Word docs, email threads, and manual data entry |
| **Key Metric** | Time from "I need a form" to "form is live" under 15 minutes |

**Marie's Journey**: She opens `forms.alecia.fr`, logs in with her Alecia credentials, clicks "Nouveau formulaire", adds blocks by clicking type icons, configures labels and options, previews the form, and clicks "Publier". She copies the link and sends it to her client. 15 minutes total.

### Thomas — Managing Partner (Secondary)

| Attribute | Detail |
|---|---|
| **Age** | 45-55 |
| **Role** | Senior partner, oversees 5-8 advisors |
| **Tech Level** | Uses email and LinkedIn; has staff handle tools |
| **Goal** | See who created which forms, review submission analytics, ensure data governance |
| **Frustration** | No visibility into what data is being collected externally |
| **Key Metric** | Can see submission counts per form without asking anyone |

**Thomas's Journey**: He receives an email notification (v1.5), logs in, sees the dashboard with submission badges, clicks a form, reviews submissions in a table, and exports to CSV for his analysis.

### External Respondent (Anonymous)

| Attribute | Detail |
|---|---|
| **Device** | 60% mobile, 40% desktop |
| **Attention Span** | Low — wants to complete quickly and move on |
| **Goal** | Fill out the form accurately and submit |
| **Frustration** | Confusing layouts, no progress indication, unclear requirements |
| **Key Metric** | >70% completion rate (start to submit) |

---

## UX Goals

| Goal | Measurement | Target |
|---|---|---|
| **Speed to create** | Time from login to published form | ≤15 minutes for 5-field form |
| **Intuitive builder** | No documentation needed for basic usage | 0 help page visits for core flow |
| **Trustworthy public forms** | Visual quality perceived as "premium" | Alecia brand consistency score |
| **High completion rate** | % of started forms that are submitted | ≥70% |
| **French-first UX** | All production UI strings in French | 0 English strings in prod |
| **Accessible** | WCAG 2.1 AA compliance | Lighthouse Accessibility ≥95 |

---

## Information Architecture

```
forms.alecia.fr
├── /login                          → Auth page (Supabase Auth)
├── /dashboard                      → Form list + stats
├── /forms/new                      → Create form (title → builder)
├── /forms/[formId]/edit            → Form builder (3-panel layout)
├── /forms/[formId]/submissions     → Submission viewer (table + detail)
├── /forms/[formId]/settings        → Settings, permissions, deploy, delete
├── /f/[formId]                     → Public form (SSR, no auth)
└── /f/[formId]/merci               → Thank-you page (no auth)
```

---

## Page-by-Page UX Specs

### 1. Login Page (`/login`)

**Layout**: Centered card on Off-White background, Playfair Display heading, Supabase Auth form with French labels.

**Flow**: Enter email/password → redirect to `/dashboard` on success.

**Validation**: Inline error messages in French ("Email invalide", "Mot de passe incorrect").

**Design tokens**: `bg-background`, `shadow-navy-xl`, `text-gradient-alecia` heading.

### 2. Dashboard (`/dashboard`)

**Layout**: Full-width container (max-w-7xl), page title with "Nouveau formulaire" CTA button, grid of FormCards.

**Components**:
- Page title: `text-4xl font-bold text-gradient-alecia`
- CTA button: `.btn-gold`
- FormCard grid: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`
- Search bar: `bg-input rounded-lg` with Lucide Search icon
- Status filter: Badge group (Tous, Brouillon, Publié, Archivé)
- Empty state: Centered text + CTA

**Interactions**:
- Card hover: `.card-hover` (6px lift, navy shadow)
- Dropdown menu: DropdownMenu with Edit, Submissions, Copy Link, Duplicate, Delete
- Delete: AlertDialog with confirmation ("Supprimer ce formulaire ? Cette action est irréversible.")

### 3. Form Builder (`/forms/[formId]/edit`)

**Layout**: Three-panel layout — BlockPalette (280px left), Canvas (flex center), ConfigPanel (360px right when active).

**Components** (see docs/04 and docs/05 for full details):
- BlockPalette: Scrollable list of 12 block type buttons with icons
- Canvas: Vertical stack of BlockCards with drag handles
- ConfigPanel: Context-sensitive configuration for selected block
- Preview toggle: Switch between desktop and mobile preview

**Interactions**:
- Click palette item → add block at bottom
- Drag handle → reorder blocks
- Click block → select, open config panel
- Delete block → confirmation modal
- Ctrl+N → add block (keyboard shortcut)
- 500ms autosave with status indicator

### 4. Public Form (`/f/[formId]`)

**Layout**: Max-w-2xl centered Card with `shadow-navy-lg`, Playfair heading, Alecia-branded footer.

**Components**:
- Form heading: `text-2xl font-bold text-gradient-alecia`
- Field labels: `text-sm font-medium text-foreground`
- Required asterisk: `text-destructive`
- Input fields: shadcn/ui Input/Select/Checkbox/Radio styled with Alecia tokens
- Submit button: `.btn-gold`
- Honeypot field: `sr-only` hidden input
- Footer: `text-xs text-muted-foreground` — "Propulsé par Alecia Forms"

**Validation**: Inline error messages below each field (Zod error messages in French).

**Success**: Redirect to `/f/[formId]/merci` with customizable thank-you message.

### 5. Submissions Page (`/forms/[formId]/submissions`)

**Layout**: Full-width table with TanStack Table, sidebar with submission count stats.

**Components**:
- Card header: Form title + submission count
- Table: TanStack Table v8 with sorting, filtering, pagination
- Row expansion: Click to see full JSON payload
- Actions: Export CSV, Delete individual submission
- Empty state: "Aucune réponse pour l'instant"

### 6. Settings Page (`/forms/[formId]/settings`)

**Layout**: Two-column layout — settings sections on left, danger zone on right.

**Sections**:
- General: Title, description, accent color
- Deploy: Publish/Unpublish toggle, copy link button
- Permissions: Add collaborator by email, role dropdown (Admin, Éditeur, Lecteur)
- Danger zone: Archive, Delete (with double confirmation)

---

## Interaction States

### Button States (Alecia .btn-gold)

| State | Visual |
|---|---|
| Default | `bg-gradient-135deg from-midnight to-corporate text-white font-semibold` |
| Hover | `shadow-navy-xl translate-y-[-1.5px]` |
| Active | `scale-[0.975]` |
| Focus | `outline-3 outline-offset-2 outline-blue-mid` |
| Disabled | `opacity-50 pointer-events-none` |
| Loading | Spinner icon + greyed text |

### Form Card States

| State | Visual |
|---|---|
| Default | `bg-card border-transparent shadow-navy-sm` |
| Hover | `card-hover` — translate-y-[-6px] shadow-navy-lg border-accent/40 |
| Selected | `border-accent border-[3px] shadow-navy-md bg-accent/5` |

### Builder Block States

| State | Visual |
|---|---|
| Default | `bg-card border-border shadow-navy-sm` |
| Hover | `border-border shadow-navy-md` |
| Selected | `border-accent border-[3px] shadow-navy-md bg-accent/5` |
| Dragging | `rotate-[3deg] scale-[1.03] shadow-navy-lg opacity-90` |
| Drop target | `border-2 border-dashed border-accent bg-accent/10` |

---

## French UI Glossary

All production strings in French. Key translations:

| English | French |
|---|---|
| Dashboard | Tableau de bord |
| My forms | Mes formulaires |
| New form | Nouveau formulaire |
| Form builder | Créateur de formulaires |
| Draft | Brouillon |
| Published | Publié |
| Archived | Archivé |
| Responses | Réponses |
| Settings | Paramètres |
| Permissions | Permissions |
| Share | Partager |
| Required | Requis |
| Optional | Facultatif |
| Submit | Soumettre |
| Save | Enregistrer |
| Delete | Supprimer |
| Cancel | Annuler |
| Copy link | Copier le lien |
| Duplicate | Dupliquer |
| Add a field | Ajouter un champ |
| Preview | Aperçu |
| Thank you | Merci |
| No responses yet | Aucune réponse pour l'instant |
| Saving... | Enregistrement... |
| Last saved at | Dernière sauvegarde à |

---

## Recommended Image Generation

For the following UI elements, consider generating custom illustrations using AI image tools:

1. **Empty dashboard state**: A minimalist illustration of a form with a plus icon, in Alecia blue tones
2. **Thank-you page**: A subtle checkmark or envelope illustration in corporate blue
3. **Error state**: A gentle warning illustration (not a harsh X) in Alecia red accent
4. **Loading state for public forms**: A spinning Alecia logo or subtle dots animation

Prompt suggestions:
- "Minimal flat illustration of a document form with blue accent gradients, corporate premium style, clean white background"
- "Subtle envelope with checkmark illustration in deep navy blue, professional M&A style, white background"
- "Warning illustration in red accent (#b80c09), minimal and professional, white background"

---

## References

- [Alecia Design System Specification](../AI_RULES.md)
- [PRD — Alecia Forms MVP, Section 5: Component Spec Blueprints](../PRD-AleciaForms-MVP.md)
- [WCAG 2.1 AA Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [docs/05-design-implementation.md](./05-design-implementation.md)

---

*This document is part of the Alecia Forms Technical Design Document suite. See [19-index.md](./19-index.md) for the complete index.*