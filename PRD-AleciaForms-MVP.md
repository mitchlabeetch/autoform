# 📋 PRD — Alecia Forms MVP

> *Product Requirements Document*
> **Version**: 1.0.0 · **Date**: 2025-07-10
> **Status**: Draft · **Author**: Alecia Partners Product Team

---

## 1. Product Overview

| Field | Detail |
|---|---|
| **Product Name** | Alecia Forms |
| **Tagline** | *Créez des formulaires d'exception, sans écrire une ligne de code.* |
| **Type** | SaaS Form Builder (Micro-Frontend of the Alecia Suite) |
| **Domain** | `forms.alecia.fr` |
| **Launch Goal** | 10 forms created within the first 2 weeks by internal advisors; 50 external form submissions within the first month |
| **Repository Context** | Built on the existing `@autoform/*` monorepo (React 19 + Next.js 15 App Router + shadcn/ui + Zod + Supabase) |

---

## 2. Vision Statement

Alecia Forms empowers M&A advisors and non-technical business users at Alecia Partners to **design, deploy, and manage professional data-collection forms** — NDA requests, due-diligence questionnaires, client intake surveys, deal pipeline inputs — without any developer involvement. Every form lives at a deterministic public URL (`forms.alecia.fr/<form-id>`), and every response flows securely into Supabase with full RLS protection.

The tool leverages the existing **`@autoform/react`** and **`@autoform/shadcn`** packages as the rendering engine, extending them with a visual block-based builder that outputs serialized Zod schemas stored in Supabase. The result is a sovereign, self-hosted form system that reflects the **Sovereign Premiumism** design language of the Alecia Suite.

---

## 3. User Personas

### 3.1 Primary Persona: **Marie — M&A Associate**

| Attribute | Detail |
|---|---|
| **Role** | M&A Associate / Advisor |
| **Tech Level** | Vibe-coder — comfortable with Notion, Airtable, Typeform; no code experience |
| **Goals** | Quickly create client-facing intake forms (NDAs, questionnaires) that look professional and trustworthy |
| **Pain Points** | Current process: manually emails Word documents, tracks responses in spreadsheets, has no audit trail, spends 2+ hours/week on formatting |
| **Key Quote** | *"I need a form that looks as premium as our brand — not a Google Form with a logo slapped on it."* |

### 3.2 Secondary Persona: **Thomas — Managing Partner**

| Attribute | Detail |
|---|---|
| **Role** | Managing Partner / Administrator |
| **Tech Level** | Business user, minimal technical skills |
| **Goals** | Control who can create forms, review submission analytics, ensure data governance compliance |
| **Pain Points** | No visibility into what data is being collected externally, no centralized form management |
| **Key Quote** | *"I need to know exactly what information we're asking clients to share and where it goes."* |

### 3.3 Tertiary Persona: **External Respondent — Client or Prospect**

| Attribute | Detail |
|---|---|
| **Role** | Client, Prospective Seller, Legal Counsel |
| **Tech Level** | Any — may be on mobile, desktop, varying browsers |
| **Goals** | Complete a form quickly and confidently, receive confirmation |
| **Pain Points** | Clunky forms, no progress indicators, unclear if submission succeeded |
| **Key Quote** | *"I just want to fill this out and get back to my day."* |

---

## 4. User Journey

### 4.1 Marie Creates a Form (Builder Journey)

```
1. Marie navigates to forms.alecia.fr
2. She authenticates via Supabase Auth (Alecia SSO / email)
3. Dashboard loads → she sees "Nouveau formulaire" button
4. She clicks it → enters a title & selects a template or starts blank
5. Block-based builder opens with a live preview panel
6. She drags/adds blocks: "Champ texte", "Choix unique", "Sélecteur de date", etc.
7. She configures each block: label, placeholder, required, validation rules
8. She adjusts branding: accent color toggle, logo display, thank-you message
9. She clicks "Publier" → form goes live at forms.alecia.fr/f/aB3xK9
10. She copies the link and sends it to her client
```

### 4.2 External Respondent Fills the Form (Public Journey)

```
1. Client receives link: forms.alecia.fr/f/aB3xK9
2. Branded form page loads with Alecia design language
3. Client fills blocks sequentially or skipping as allowed
4. Progressive validation highlights errors inline
5. On submit → success screen with personalized message
6. Optional: auto-confirmation email (v2)
```

### 4.3 Marie Reviews Submissions (Dashboard Journey)

```
1. Marie returns to forms.alecia.fr/dashboard
2. She sees submission count badges on each form card
3. She clicks a form → sees tabular + card view of submissions
4. She can export to CSV, view individual responses
5. She can delete or archive submissions
```

---

## 5. MVP Feature Specification

### 5.1 MUST HAVE (v1 — Launch)

#### F1 · Authentication & Authorization
- Supabase Auth integration (email + password; magic-link in v2)
- Existing `auth.users` + `profiles` table architecture
- Role-based access: `admin` (full control), `editor` (create/edit forms), `viewer` (read submissions only)
- Session persistence with refresh tokens

#### F2 · Form Dashboard
- List all forms the user has access to (owned or shared)
- Cards showing: form title, status (draft/published/archived), submission count, last modified date
- Quick actions: Edit, Preview, Copy Link, Delete
- Search and filter (by status, date range)
- Empty state with CTA to create first form

#### F3 · Block-Based Form Builder
- **Canvas**: Central editing area with vertical block stack
- **Sidebar Palette**: Draggable block types
  - `Champ texte` (short text / paragraph)
  - `Email`
  - `Numéro` (number with min/max/step)
  - `Téléphone`
  - `Choix unique` (radio buttons)
  - `Choix multiple` (checkboxes)
  - `Menu déroulant` (select)
  - `Date` (date picker)
  - `Oui / Non` (boolean toggle)
  - `Fichier` (file upload — Supabase Storage)
  - `Échelle` (Likert scale 1-5 or 1-10)
  - `Classement` (ranking — v2)
  - `Texte descriptif` (static text block, not a question)
- **Block Configuration Panel**: Right-side panel when a block is selected
  - Label / question text (rich text in v2, plain text in v1)
  - Placeholder text
  - Required toggle
  - Validation rules (min/max, pattern, custom error message)
  - Conditional visibility: "Show this block if [block X] = [value]" (v2)
- **Drag & Drop**: Reorder blocks via `@dnd-kit` with visual feedback (3° rotation + shadow-navy-lg)
- **Live Preview**: Split or toggle view showing real-time rendered form using `@autoform/shadcn`

#### F4 · Schema Serialization & Storage
- Form builder state serializes to a **Zod schema JSON representation** stored in Supabase
- Two storage formats:
  - `schema_json` (JSONB): The canonical block configuration (portable, version-independent)
  - `schema_zod` (TEXT): Generated Zod schema string for server-side validation
- Every save creates an immutable version snapshot (`form_versions` table)
- Publishing a form freezes the active schema version

#### F5 · Form Deployment & Public Rendering
- Every form gets a deterministic slug: `forms.alecia.fr/f/<short-id>`
- Public route: `/f/[formId]` — Server Component fetching form config from Supabase
- Rendering: `@autoform/shadcn` AutoForm component instantiated dynamically from stored schema
- Custom theming applied: Alecia Design System tokens, form-level accent color override
- Responsive: mobile-first, works on all viewport sizes
- Accessibility: WCAG 2.1 AA labels, focus management, screen reader announcements

#### F6 · Submission Collection & Storage
- Form submissions stored in `form_submissions` table (JSONB payload)
- Server-side validation: Zod schema validates every submission before storage
- Rate limiting: max 10 submissions per IP per form per hour (Supabase Edge Function)
- Success confirmation screen (customizable thank-you message per form)
- Duplicate detection: optional "one submission per email" mode

#### F7 · Submission Management
- Tabular view of submissions per form
- Individual submission detail view
- Export to CSV
- Delete individual submissions
- Basic analytics: submission count over time, completion rate

#### F8 · Form Management
- **Edit**: Modify blocks, reorder, add/remove
- **Publish / Unpublish**: Toggle form live status
- **Archive**: Soft-delete (removed from dashboard, data preserved)
- **Delete**: Hard-delete form + all submissions (confirmation modal required)
- **Duplicate**: Clone a form as a new draft
- **Permissions**: Share form with other authenticated users (owner, editor, viewer roles)

### 5.2 NICE TO HAVE (v1.5 — Post-Launch Quick Wins)

| ID | Feature | Description |
|---|---|---|
| N1 | Form Templates | Pre-built templates: NDA Request, Due Diligence Questionnaire, Client Intake, Deal Pipeline Input |
| N2 | Conditional Logic | Show/hide blocks based on previous answers |
| N3 | Email Notifications | Notify form owner on new submission |
| N4 | Custom Thank-You Page | Redirect or custom message after submission |
| N5 | File Upload Progress Bar | Visual upload progress with Supabase Storage |
| N6 | Form Analytics Dashboard | Charts: submissions over time, completion rate, drop-off points |
| N7 | Multi-Step Forms | Break long forms into paginated steps with progress indicator |
| N8 | Webhook Integrations | POST submissions to external services (Slack, Notion, etc.) |
| N9 | Dark Mode | Full dark mode on public form pages per Alecia Design System |

### 5.3 NOT IN MVP (v2+)

| ID | Feature | Reason |
|---|---|---|
| X1 | Payment Collection | Requires Stripe integration — too complex for v1 |
| X2 | eSignature Integration | DocuSeal integration planned for v2 |
| X3 | Multi-language Forms | Per-block i18n — significant UX complexity |
| X4 | Advanced Conditional Logic | Complex branching, skip logic — requires dedicated engine |
| X5 | Public API | REST API for programmatic form creation — premature |
| X6 | Form Versioning Diff | Visual diff between form versions — nice-to-have |
| X7 | PDF Export of Submissions | Requires server-side PDF generation (Stirling-PDF integration for v2) |
| X8 | Magic Link Auth | Easy Supabase feature but not critical for v1 internal launch |
| X9 | Collaborative Real-time Editing | Requires WebSocket/CRDT infrastructure |
| X10 | Custom Domain per Form | DNS configuration management — v2 |

---

## 6. Success Metrics

| Metric | Target | Measurement |
|---|---|---|
| **Form Creation Rate** | ≥ 10 forms created by internal team within 2 weeks of launch | Supabase query on `forms` table |
| **Submission Volume** | ≥ 50 external submissions within first month | Count of `form_submissions` rows |
| **Completion Rate** | ≥ 70% of started forms are fully submitted | Ratio of partial → complete submissions |
| **Time to Create** | ≤ 15 minutes from blank form to published form | Timestamp diff: `created_at` → `first_published_at` |
| **User Satisfaction** | ≥ 4.0/5.0 internal CSAT survey at 1 month | Manual survey post-launch |

---

## 7. Design Direction

### 7.1 Visual Identity

Alecia Forms follows the **Sovereign Premiumism** design system exactly:

- **Color System**: Full Alecia dual-theme token system (Light + Dark)
- **Typography**: Bierstadt (body/inputs), Playfair Display (section headings), Outfit (numbers/stats)
- **Shadows**: Navy-tinted drop shadows (`shadow-navy-*`) — no generic gray shadows
- **Interactive Cards**: Flat at rest, 6px float + navy shadow on hover (`.card-hover`)
- **Buttons**: Metallic blue `.btn-gold` primary actions, outlined secondary
- **Focus Rings**: WCAG 2.1 AA compliant `focus-visible` outlines

### 7.2 Builder UX Principles

| Principle | Implementation |
|---|---|
| **Immediate Feedback** | Every drag, click, and keystroke updates the live preview in real-time |
| **Progressive Disclosure** | Basic configuration shown first; advanced validation/rules behind a "Plus d'options" accordion |
| **French-First UI** | All labels, placeholders, error messages, and UI copy in French |
| **Undo Safety** | Every destructive action (delete block, delete submission) requires modal confirmation |
| **Keyboard Navigation** | Full keyboard operability for the builder (accessibility requirement) |

### 7.3 Block Type Visual Spec

Each block in the builder palette and canvas follows a consistent card pattern:

```
┌──────────────────────────────────────────────────────────┐
│  [Type Icon]  Champ texte                    [⋮] [×]     │
│  ─────────────────────────────────────────────────────── │
│  Label: "Nom complet"                                    │
│  Placeholder: "Entrez votre nom..."                      │
│  Requis: [toggle]                                        │
└──────────────────────────────────────────────────────────┘
```

- Type icon maps to `lucide-react` icons (e.g., `Type` for text, `Mail` for email, `Calendar` for date)
- `[⋮]` drag handle for reorder; `[×]` for delete (with confirmation)
- Selected block displays `border-accent` + `shadow-navy-md`
- Unselected blocks show `border-transparent` transitioning to `border-border` on hover

### 7.4 Public Form Page Layout

```
┌────────────────────────────────────────────────────────────┐
│  [Alecia Logo]                                             │
│  ───────────────────────────────────────────────────────── │
│                                                            │
│  Formulaire de Due Diligence                               │
│  Veuillez remplir les informations suivantes.              │
│                                                            │
│  ┌─ Question 1 ──────────────────────────────────────────┐ │
│  │  Nom complet *                                       │ │
│  │  [_____________________________________________]      │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                            │
│  ┌─ Question 2 ──────────────────────────────────────────┐ │
│  │  Adresse email *                                     │ │
│  │  [_____________________________________________]      │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                            │
│  ┌──────────────────┐                                      │
│  │  ○ Option A       │                                      │
│  │  ● Option B       │                                      │
│  │  ○ Option C       │                                      │
│  └──────────────────┘                                      │
│                                                            │
│  [   Soumettre   ]                                        │
│                                                            │
│  ───────────────────────────────────────────────────────── │
│  Propulsé par Alecia Forms                                │
└────────────────────────────────────────────────────────────┘
```

---

## 8. Data Architecture

### 8.1 Entity Relationship Overview

```
auth.users ─────────────────┐
       │                    │
       ▼                    │
  profiles                  │
       │                    │
       ▼                    │
  forms ◄──────────────────┤ form_permissions
       │                    │
       ├── form_versions    │
       │                    │
       ▼                    │
  form_submissions          │
                            │
  form_field_types ◄────────┘ (enum lookup)
```

### 8.2 Database Schema

#### `forms` Table

```sql
CREATE TABLE public.forms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  slug TEXT UNIQUE NOT NULL,                    -- short URL slug
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'draft'          -- 'draft' | 'published' | 'archived'
    CHECK (status IN ('draft', 'published', 'archived')),
  settings JSONB NOT NULL DEFAULT '{}',          -- accent_color, thank_you_message, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE,
  is_deleted BOOLEAN DEFAULT FALSE
);

-- Enable RLS
ALTER TABLE public.forms ENABLE ROW LEVEL SECURITY;

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.forms TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.forms TO authenticated;

-- Policies
CREATE POLICY "forms_select_policy" ON public.forms
  FOR SELECT TO authenticated
  USING (
    owner_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.form_permissions fp
      WHERE fp.form_id = forms.id AND fp.user_id = auth.uid()
    )
  );

CREATE POLICY "forms_insert_policy" ON public.forms
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "forms_update_policy" ON public.forms
  FOR UPDATE TO authenticated
  USING (
    owner_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.form_permissions fp
      WHERE fp.form_id = forms.id AND fp.user_id = auth.uid() AND fp.role IN ('editor', 'admin')
    )
  );

CREATE POLICY "forms_delete_policy" ON public.forms
  FOR DELETE TO authenticated
  USING (
    owner_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.form_permissions fp
      WHERE fp.form_id = forms.id AND fp.user_id = auth.uid() AND fp.role = 'admin'
    )
  );
```

#### `form_versions` Table

```sql
CREATE TABLE public.form_versions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL DEFAULT 1,
  schema_json JSONB NOT NULL,      -- canonical block configuration
  schema_zod TEXT,                 -- generated Zod schema string (optional)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_form_versions_form_id ON public.form_versions(form_id);

ALTER TABLE public.form_versions ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.form_versions TO service_role;
GRANT SELECT, INSERT ON TABLE public.form_versions TO authenticated;

CREATE POLICY "form_versions_select_policy" ON public.form_versions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.forms f
      WHERE f.id = form_versions.form_id
      AND (f.owner_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.form_permissions fp WHERE fp.form_id = f.id AND fp.user_id = auth.uid()
      ))
    )
  );

CREATE POLICY "form_versions_insert_policy" ON public.form_versions
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.forms f
      WHERE f.id = form_versions.form_id AND f.owner_id = auth.uid()
    )
  );
```

#### `form_fields` Table

```sql
CREATE TABLE public.form_fields (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  form_version_id UUID NOT NULL REFERENCES public.form_versions(id) ON DELETE CASCADE,
  field_type TEXT NOT NULL                        -- 'text' | 'email' | 'number' | 'phone' | 'select' | 'multiselect' | 'radio' | 'date' | 'boolean' | 'scale' | 'file' | 'description'
    CHECK (field_type IN ('text', 'email', 'number', 'phone', 'select', 'multiselect', 'radio', 'date', 'boolean', 'scale', 'file', 'description')),
  label TEXT NOT NULL,
  placeholder TEXT,
  help_text TEXT,
  required BOOLEAN DEFAULT FALSE,
  field_order INTEGER NOT NULL DEFAULT 0,
  config JSONB DEFAULT '{}',                     -- type-specific config: options for select, min/max for number, scale_range, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_form_fields_version ON public.form_fields(form_version_id);

ALTER TABLE public.form_fields ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.form_fields TO service_role;
GRANT SELECT, INSERT, UPDATE ON TABLE public.form_fields TO authenticated;

CREATE POLICY "form_fields_select_policy" ON public.form_fields
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.form_versions fv
      JOIN public.forms f ON f.id = fv.form_id
      WHERE fv.id = form_fields.form_version_id
      AND (f.owner_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.form_permissions fp WHERE fp.form_id = f.id AND fp.user_id = auth.uid()
      ))
    )
  );

CREATE POLICY "form_fields_insert_policy" ON public.form_fields
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.form_versions fv
      JOIN public.forms f ON f.id = fv.form_id
      WHERE fv.id = form_fields.form_version_id AND f.owner_id = auth.uid()
    )
  );

CREATE POLICY "form_fields_update_policy" ON public.form_fields
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.form_versions fv
      JOIN public.forms f ON f.id = fv.form_id
      WHERE fv.id = form_fields.form_version_id AND f.owner_id = auth.uid()
    )
  );
```

#### `form_submissions` Table

```sql
CREATE TABLE public.form_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
  form_version_id UUID REFERENCES public.form_versions(id) ON DELETE SET NULL,
  data JSONB NOT NULL,                           -- { field_id: value, ... }
  respondent_email TEXT,                          -- optional email for dedup + contact
  respondent_ip TEXT,                             -- for rate-limiting
  is_complete BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_submissions_form ON public.form_submissions(form_id);
CREATE INDEX idx_submissions_form_version ON public.form_submissions(form_version_id);

ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.form_submissions TO service_role;
GRANT INSERT ON TABLE public.form_submissions TO authenticated;
GRANT SELECT, UPDATE, DELETE ON TABLE public.form_submissions TO authenticated;

-- Anyone (including anonymous) can submit to a published form
CREATE POLICY "form_submissions_insert_policy" ON public.form_submissions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.forms f
      WHERE f.id = form_submissions.form_id AND f.status = 'published'
    )
  );

-- Form owners and permitted users can read submissions
CREATE POLICY "form_submissions_select_policy" ON public.form_submissions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.forms f
      WHERE f.id = form_submissions.form_id
      AND (f.owner_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.form_permissions fp WHERE fp.form_id = f.id AND fp.user_id = auth.uid()
      ))
    )
  );

CREATE POLICY "form_submissions_delete_policy" ON public.form_submissions
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.forms f
      WHERE f.id = form_submissions.form_id AND f.owner_id = auth.uid()
    )
  );
```

#### `form_permissions` Table

```sql
CREATE TABLE public.form_permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'viewer'              -- 'admin' | 'editor' | 'viewer'
    CHECK (role IN ('admin', 'editor', 'viewer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(form_id, user_id)
);

CREATE INDEX idx_form_permissions_form ON public.form_permissions(form_id);
CREATE INDEX idx_form_permissions_user ON public.form_permissions(user_id);

ALTER TABLE public.form_permissions ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.form_permissions TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.form_permissions TO authenticated;

CREATE POLICY "form_permissions_select_policy" ON public.form_permissions
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.forms f WHERE f.id = form_permissions.form_id AND f.owner_id = auth.uid()
  ));

CREATE POLICY "form_permissions_insert_policy" ON public.form_permissions
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.forms f
      WHERE f.id = form_permissions.form_id AND f.owner_id = auth.uid()
    )
  );

CREATE POLICY "form_permissions_delete_policy" ON public.form_permissions
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.forms f
      WHERE f.id = form_permissions.form_id AND f.owner_id = auth.uid()
    )
  );
```

#### `profiles` Table (extends existing auth.users)

```sql
-- If profiles table doesn't exist yet, create it:
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'editor'               -- 'admin' | 'editor' | 'viewer'
    CHECK (role IN ('admin', 'editor', 'viewer')),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure RLS and grants
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

GRANT SELECT, UPDATE ON TABLE public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.profiles TO service_role;

CREATE POLICY "profiles_select_policy" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "profiles_update_policy" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);
```

### 8.3 Schema JSON Format (`schema_json`)

The `schema_json` stored in `form_versions` follows this structure:

```json
{
  "version": 1,
  "blocks": [
    {
      "id": "blk_01",
      "type": "text",
      "label": "Nom complet",
      "placeholder": "Entrez votre nom...",
      "required": true,
      "order": 0,
      "config": {
        "multiline": false,
        "maxLength": 255,
        "validationMessage": "Le nom est requis"
      }
    },
    {
      "id": "blk_02",
      "type": "email",
      "label": "Adresse email professionnelle",
      "required": true,
      "order": 1,
      "config": {}
    },
    {
      "id": "blk_03",
      "type": "select",
      "label": "Secteur d'activité",
      "required": false,
      "order": 2,
      "config": {
        "options": [
          { "value": "tech", "label": "Technologie" },
          { "value": "finance", "label": "Finance" },
          { "value": "sante", "label": "Santé" },
          { "value": "autre", "label": "Autre" }
        ]
      }
    },
    {
      "id": "blk_04",
      "type": "scale",
      "label": "Niveau de satisfaction",
      "required": true,
      "order": 3,
      "config": {
        "min": 1,
        "max": 5,
        "labels": {
          "1": "Très insatisfait",
          "5": "Très satisfait"
        }
      }
    }
  ],
  "settings": {
    "submitLabel": "Soumettre",
    "thankYouMessage": "Merci pour votre réponse. Nous reviendrons vers vous sous 48h.",
    "accentColor": "#163e64",
    "showProgressBar": true
  }
}
```

---

## 9. Technical Architecture

### 9.1 Application Structure

```
apps/web/                              # Next.js 15 App Router
├── app/
│   ├── (auth)/                        # Auth group route
│   │   ├── login/page.tsx             # Supabase Auth login
│   │   └── layout.tsx                 # Auth layout (centered, minimal)
│   ├── (dashboard)/                   # Authenticated group route
│   │   ├── layout.tsx                 # Dashboard shell (sidebar + glass nav)
│   │   ├── dashboard/page.tsx         # Form list / dashboard home
│   │   ├── forms/
│   │   │   ├── new/page.tsx            # Create new form (template picker)
│   │   │   └── [formId]/
│   │   │       ├── edit/page.tsx       # Form builder (block editor)
│   │   │       ├── submissions/page.tsx # Submission viewer
│   │   │       └── settings/page.tsx   # Permissions, deploy, delete
│   ├── f/
│   │   └── [formId]/page.tsx           # Public form rendering
│   └── api/
│       └── forms/
│           └── [formId]/
│               └── submit/route.ts     # POST submission endpoint
├── components/
│   ├── auth/                          # Auth components
│   │   ├── LoginForm.tsx
│   │   ├── SessionProvider.tsx
│   │   └── AuthGuard.tsx
│   ├── forms/
│   │   ├── builder/
│   │   │   ├── FormBuilder.tsx         # Main builder canvas
│   │   │   ├── BlockPalette.tsx        # Left sidebar: block type list
│   │   │   ├── BlockEditor.tsx         # Center: selected block config
│   │   │   ├── BlockCard.tsx           # Single block card in canvas
│   │   │   ├── BlockConfigPanel.tsx    # Right panel: field settings
│   │   │   └── LivePreview.tsx         # Real-time form preview
│   │   ├── dashboard/
│   │   │   ├── FormCard.tsx            # Dashboard form card
│   │   │   ├── FormList.tsx            # Filterable form grid
│   │   │   └── SubmissionTable.tsx     # Submission data table
│   │   ├── public/
│   │   │   └── PublicFormRenderer.tsx  # Renders form for end users
│   │   └── shared/
│   │       ├── block-types.ts          # Block type definitions
│   │       └── schema-serializer.ts    # JSONB ↔ Zod schema conversion
│   └── ui/                            # shadcn/ui components (existing)
├── lib/
│   ├── supabase/
│   │   ├── client.ts                  # Browser Supabase client
│   │   ├── server.ts                  # Server-side Supabase client
│   │   └── middleware.ts              # Auth middleware
│   ├── forms/
│   │   ├── schema-to-zod.ts           # Convert schema_json → Zod schema
│   │   ├── zod-to-schema.ts           # (future) Import Zod → schema_json
│   │   └── types.ts                   # TypeScript types for form entities
│   └── utils.ts                       # Utility functions
└── middleware.ts                       # Next.js middleware (auth redirects)
```

### 9.2 Key Technical Decisions

| Decision | Choice | Rationale |
|---|---|---|
| **Schema Format** | JSONB in `form_versions` + generated Zod | JSONB is queryable and portable; Zod provides runtime validation |
| **Form Rendering** | `@autoform/shadcn` + `@autoform/react` + `@autoform/zod` | Leverages existing monorepo packages; consistent with Alecia UI |
| **State Management** | React Server Components + `useState` in builder | No need for global state lib; RSC for data, local state for builder UI |
| **Drag & Drop** | `@dnd-kit/core` + `@dnd-kit/sortable` | Alecia Design System spec already mandates @dnd-kit |
| **Routing** | Next.js 15 App Router with route groups | Clean separation of auth/dashboard/public contexts |
| **Public Forms** | `/f/[formId]` Server Component | SSR for SEO, fast initial load, no auth required |
| **Submission API** | Next.js Route Handler `/api/forms/[formId]/submit` | Server-side Zod validation before Supabase insert |
| **Auth** | Supabase Auth with middleware redirects | Consistent with existing Alecia infrastructure |

### 9.3 Schema-to-Zod Conversion Engine

The core innovation of Alecia Forms is the bridge between the visual builder (which outputs JSONB) and the runtime form (which consumes Zod). The `schema-to-zod.ts` module handles this:

```
schema_json (JSONB)  ──►  schemaToZod()  ──►  z.ZodObject  ──►  @autoform/react AutoForm
                                                      └──►  validateSchema() on submission
```

Each block type maps to a Zod primitive:

| Block Type | Zod Type | Notes |
|---|---|---|
| `text` | `z.string()` + optional `.min()`, `.max()` | `.min(1)` if required |
| `email` | `z.string().email()` | Built-in email validation |
| `number` | `z.number()` + optional `.min()`, `.max()`, `.step()` | |
| `phone` | `z.string().regex()` | French phone pattern |
| `select` | `z.enum([...])` | Options from `config.options` |
| `multiselect` | `z.array(z.enum([...]))` | Multi-select checkboxes |
| `radio` | `z.enum([...])` | Same as select, different UI |
| `date` | `z.coerce.date()` | Date picker integration |
| `boolean` | `z.boolean()` | Toggle / checkbox |
| `scale` | `z.number().min().max()` | Likert scale |
| `file` | `z.string()` (URL) | File stored in Supabase Storage |
| `description` | *(skipped)* | Static text, not a field |

### 9.4 Performance Requirements

| Metric | Target |
|---|---|
| Dashboard first contentful paint | < 1.5s |
| Public form page load (SSR) | < 1.0s |
| Builder block reorder latency | < 100ms (optimistic UI) |
| Form submission response | < 500ms |
| Lighthouse Accessibility score | ≥ 95 |
| Lighthouse Performance score | ≥ 90 |

---

## 10. Internationalization

All user-facing strings in Alecia Forms are **French-first**:

| English Concept | French UI Label |
|---|---|
| Form | Formulaire |
| Form Builder | Créateur de formulaires |
| Dashboard | Tableau de bord |
| Submission | Réponse |
| Draft | Brouillon |
| Published | Publié |
| Archived | Archivé |
| Required | Requis |
| Optional | Facultatif |
| Submit | Soumettre |
| Save | Enregistrer |
| Delete | Supprimer |
| Cancel | Annuler |
| Block types | Types de champ |
| Text field | Champ texte |
| Email | Courriel |
| Number | Numéro |
| Phone | Téléphone |
| Select | Menu déroulant |
| Multi-select | Choix multiple |
| Radio | Choix unique |
| Date | Date |
| Boolean (Yes/No) | Oui / Non |
| Scale | Échelle |
| File upload | Fichier |
| Description block | Texte descriptif |
| Preview | Aperçu |
| Settings | Paramètres |
| Permissions | Permissions |
| Share | Partager |

---

## 11. Accessibility (A11Y) Checklist

Per the Alecia Design System WCAG 2.1 AA requirements:

- [ ] All form fields have visible `<label>` elements linked via `htmlFor`
- [ ] Focus rings follow `focus-visible` pattern (navy in light, light-blue in dark)
- [ ] Color contrast ratios meet 4.5:1 for normal text, 3:1 for large text
- [ ] All interactive elements are keyboard-navigable (Tab, Enter, Escape, Arrow keys)
- [ ] Drag-and-drop blocks support keyboard reorder (Ctrl+Up/Down)
- [ ] Screen reader announcements for dynamic content (block add, delete, reorder)
- [ ] Skip-to-main-content link on every page
- [ ] `aria-live="polite"` regions for form submission status
- [ ] `prefers-reduced-motion` disables all transitions (per Alecia spec)
- [ ] Form errors are announced via `aria-live="assertive"` regions
- [ ] Print stylesheet hides navigation and interactive controls

---

## 12. Budget & Constraints

| Constraint | Detail |
|---|---|
| **Infrastructure** | Self-hosted on OVH VPS (Alecia's existing sovereign infrastructure) |
| **Database** | Supabase PostgreSQL (existing instance — `ehpubmtfnirzqztrlvph.supabase.co`) |
| **Auth** | Supabase Auth (existing — email + password) |
| **File Storage** | Supabase Storage for file upload blocks |
| **Domain** | `forms.alecia.fr` (subdomain of existing `alecia.fr`) |
| **Platform** | Next.js 15 — can be deployed as a micro-frontend alongside `apps/website` |
| **Browser Support** | Modern evergreen browsers (Chrome, Firefox, Safari, Edge — latest 2 versions) |
| **Mobile** | Responsive — must work on iOS Safari and Android Chrome |
| **Cost Target** | $0 additional infrastructure cost (uses existing Supabase free tier and OVH VPS) |

---

## 13. Launch Strategy

### Phase 1: Internal Alpha (Week 1-2)
- Deploy to `forms.alecia.fr` with basic auth
- 5 internal advisors create 5+ forms each
- Collect feedback on builder UX, form rendering, and submission flow
- Fix critical bugs and accessibility issues

### Phase 2: Internal Beta (Week 3-4)
- Open to all Alecia Partners staff
- Implement top 3 requested improvements
- Add form templates (NDA, Due Diligence, Client Intake)
- Submission analytics dashboard

### Phase 3: Public Launch (Week 5-6)
- Publish external forms for client/prospect use
- Monitor submission volume and completion rates
- Iterate on thank-you page, email notifications (N3)

---

## 14. Definition of Done

A feature is **Done** when:

1. ✅ Code is merged to `main` and deployed to `forms.alecia.fr`
2. ✅ All TypeScript types pass (`pnpm type-check` clean)
3. ✅ All RLS policies are tested (owner can CRUD, others restricted appropriately)
4. ✅ French UI strings are used throughout (no English labels in production)
5. ✅ WCAG 2.1 AA focus rings and contrast are verified manually
6. ✅ Mobile responsive layout tested on 375px (iPhone SE) and 1440px (desktop)
7. ✅ Navy-tinted shadows applied (no generic gray shadows)
8. ✅ Alecia typography scale respected (Bierstadt body, Playfair headings, Outfit numbers)
9. ✅ Submission data correctly stored and retrievable in Supabase
10. ✅ Public form page SSR renders under 1.0s FCP

---

## 15. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **Zod runtime generation complexity** | Medium | High | Use a well-tested `schemaToZod()` mapper with comprehensive unit tests for each block type |
| **Dnd-kit accessibility gaps** | Low | Medium | Add keyboard reorder shortcuts and announce via `aria-live` |
| **Supabase RLS misconfiguration** | Medium | Critical | Write integration tests for each policy; audit before launch |
| **Public form bot spam** | High | Medium | Rate-limit submissions (10/IP/hour) and add honeypot field |
| **Large form performance** | Low | Medium | Lazy-render blocks below fold; paginate submissions table server-side |
| **Design system consistency drift** | Medium | Medium | Use shared Alecia theme tokens; weekly visual QA |

---

## 16. Open Questions

| # | Question | Owner | Status |
|---|---|---|---|
| 1 | Should `forms.alecia.fr` be a separate Next.js app or a route within the existing `apps/web`? | Dev Team | **Pending** — leaning toward separate app for isolation |
| 2 | Should form slugs be user-customizable or auto-generated? | Product | **Pending** — v1: auto-generated 8-character slugs |
| 3 | Max file upload size for file blocks? | Infra | **Pending** — propose 10MB per file, 50MB total per submission |
| 4 | Email notifications on new submissions — in v1 or v1.5? | Product | **Decided** — v1.5 (N3) |
| 5 | Should we support form embedding (iframe) in v1? | Product | **Pending** — v2 feature |
| 6 | Analytics tracking: Plausible integration or custom Supabase queries? | Dev Team | **Decided** — custom Supabase queries for v1, Plausible integration v2 |

---

*This PRD was generated for the Alecia Forms MVP project. It is a living document and should be updated as requirements evolve during development.*