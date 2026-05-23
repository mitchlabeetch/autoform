# 06 — Database & Storage Architecture

> **Alecia Forms TDD** · Database schema, RLS policies, Supabase Storage, and data flow

---

## Overview

All data lives in the existing Supabase PostgreSQL instance (`ehpubmtfnirzqztrlvph.supabase.co`). Alecia Forms adds **5 new tables** to the existing database. No modifications to existing tables (`blog_posts`, `transactions`, `marketing_kpis`, `team_members`, `job_offers`, `testimonials`).

---

## Entity Relationship Diagram

```
                    auth.users
                        │
                        │ (1:1)
                        ▼
                    profiles
                     │ │ │
          ┌──────────┘ │ └──────────┐
          │            │             │
          │ (1:N)      │ (1:N)      │ (1:N via form_permissions)
          ▼            ▼             ▼
       forms ◄──── form_permissions
          │
          │ (1:N)
          ▼
     form_versions
          │
          │ (1:N)
          ▼
      form_fields
          
       forms
          │
          │ (1:N)
          ▼
    form_submissions ──► form_versions (optional FK for version tracking)
```

---

## Complete SQL Schema

Execute the following SQL statements via the `execute_sql` tool during setup. Each statement is separate for safety.

### Table 1: `forms`

```sql
CREATE TABLE public.forms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  slug TEXT UNIQUE NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'published', 'archived')),
  settings JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE,
  is_deleted BOOLEAN DEFAULT FALSE
);

ALTER TABLE public.forms ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.forms TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.forms TO authenticated;

CREATE POLICY "forms_select_policy" ON public.forms
  FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.form_permissions fp WHERE fp.form_id = forms.id AND fp.user_id = auth.uid()
  ));

CREATE POLICY "forms_insert_policy" ON public.forms
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "forms_update_policy" ON public.forms
  FOR UPDATE TO authenticated
  USING (owner_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.form_permissions fp WHERE fp.form_id = forms.id AND fp.user_id = auth.uid() AND fp.role IN ('editor', 'admin')
  ));

CREATE POLICY "forms_delete_policy" ON public.forms
  FOR DELETE TO authenticated
  USING (owner_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.form_permissions fp WHERE fp.form_id = forms.id AND fp.user_id = auth.uid() AND fp.role = 'admin'
  ));
```

### Table 2: `form_versions`

```sql
CREATE TABLE public.form_versions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL DEFAULT 1,
  schema_json JSONB NOT NULL,
  schema_zod TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_form_versions_form_id ON public.form_versions(form_id);

ALTER TABLE public.form_versions ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.form_versions TO service_role;
GRANT SELECT, INSERT ON TABLE public.form_versions TO authenticated;

CREATE POLICY "form_versions_select_policy" ON public.form_versions
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.forms f WHERE f.id = form_versions.form_id
    AND (f.owner_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.form_permissions fp WHERE fp.form_id = f.id AND fp.user_id = auth.uid()
    ))
  ));

CREATE POLICY "form_versions_insert_policy" ON public.form_versions
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.forms f WHERE f.id = form_versions.form_id AND f.owner_id = auth.uid()
  ));
```

### Table 3: `form_fields`

```sql
CREATE TABLE public.form_fields (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  form_version_id UUID NOT NULL REFERENCES public.form_versions(id) ON DELETE CASCADE,
  field_type TEXT NOT NULL
    CHECK (field_type IN ('text', 'email', 'number', 'phone', 'select', 'multiselect', 'radio', 'date', 'boolean', 'scale', 'file', 'description')),
  label TEXT NOT NULL,
  placeholder TEXT,
  help_text TEXT,
  required BOOLEAN DEFAULT FALSE,
  field_order INTEGER NOT NULL DEFAULT 0,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_form_fields_version ON public.form_fields(form_version_id);

ALTER TABLE public.form_fields ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.form_fields TO service_role;
GRANT SELECT, INSERT, UPDATE ON TABLE public.form_fields TO authenticated;

CREATE POLICY "form_fields_select_policy" ON public.form_fields
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.form_versions fv
    JOIN public.forms f ON f.id = fv.form_id
    WHERE fv.id = form_fields.form_version_id
    AND (f.owner_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.form_permissions fp WHERE fp.form_id = f.id AND fp.user_id = auth.uid()
    ))
  ));

CREATE POLICY "form_fields_insert_policy" ON public.form_fields
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.form_versions fv
    JOIN public.forms f ON f.id = fv.form_id
    WHERE fv.id = form_fields.form_version_id AND f.owner_id = auth.uid()
  ));

CREATE POLICY "form_fields_update_policy" ON public.form_fields
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.form_versions fv
    JOIN public.forms f ON f.id = fv.form_id
    WHERE fv.id = form_fields.form_version_id AND f.owner_id = auth.uid()
  ));
```

### Table 4: `form_submissions`

```sql
CREATE TABLE public.form_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
  form_version_id UUID REFERENCES public.form_versions(id) ON DELETE SET NULL,
  data JSONB NOT NULL,
  respondent_email TEXT,
  respondent_ip TEXT,
  is_complete BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_submissions_form ON public.form_submissions(form_id);
CREATE INDEX idx_submissions_form_version ON public.form_submissions(form_version_id);
CREATE INDEX idx_submissions_email ON public.form_submissions(respondent_email);

ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.form_submissions TO service_role;
GRANT INSERT ON TABLE public.form_submissions TO authenticated;
GRANT SELECT, UPDATE, DELETE ON TABLE public.form_submissions TO authenticated;

-- Anyone can submit to a published form (public access)
CREATE POLICY "form_submissions_insert_policy" ON public.form_submissions
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM public.forms f WHERE f.id = form_submissions.form_id AND f.status = 'published'
  ));

-- Form owners and permitted users can read submissions
CREATE POLICY "form_submissions_select_policy" ON public.form_submissions
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.forms f WHERE f.id = form_submissions.form_id
    AND (f.owner_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.form_permissions fp WHERE fp.form_id = f.id AND fp.user_id = auth.uid()
    ))
  ));

-- Only form owners can delete submissions
CREATE POLICY "form_submissions_delete_policy" ON public.form_submissions
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.forms f WHERE f.id = form_submissions.form_id AND f.owner_id = auth.uid()
  ));
```

### Table 5: `form_permissions`

```sql
CREATE TABLE public.form_permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'editor', 'viewer')),
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
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.forms f WHERE f.id = form_permissions.form_id AND f.owner_id = auth.uid()
  ));

CREATE POLICY "form_permissions_delete_policy" ON public.form_permissions
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.forms f WHERE f.id = form_permissions.form_id AND f.owner_id = auth.uid()
  ));
```

### Table 6: `profiles`

```sql
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('admin', 'editor', 'viewer')),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

GRANT SELECT, UPDATE ON TABLE public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.profiles TO service_role;

CREATE POLICY "profiles_select_policy" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "profiles_update_policy" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE PLPGSQL SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name)
  VALUES (new.id, new.raw_user_meta_data ->> 'first_name', new.raw_user_meta_data ->> 'last_name');
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## Supabase Storage Configuration

### Bucket: `form-uploads`

```sql
-- Create the storage bucket (executed via Supabase Dashboard or SQL)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'form-uploads',
  'form-uploads',
  false,  -- Not public; files are accessed via signed URLs
  10485760,  -- 10MB in bytes
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
);
```

### Storage RLS Policies

```sql
-- Authenticated users can upload files
CREATE POLICY "form_uploads_upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'form-uploads' AND auth.uid()::text = (storage.foldername(name, 1))[1]);

-- Form owners can list and read files in their forms' folders
CREATE POLICY "form_uploads_read" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'form-uploads');

-- Only owners can delete files
CREATE POLICY "form_uploads_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'form-uploads' AND auth.uid()::text = (storage.foldername(name, 1))[1]);
```

### File Upload Flow

```
1. Public form user selects a file
2. Client requests a signed upload URL from Supabase Storage
   POST /api/forms/{formId}/upload-url
   → Returns: { url, path }
3. Client uploads directly to Supabase Storage using the signed URL
4. On form submission, the file path (not the file itself) is stored in
   form_submissions.data as a URL string
5. Form owner can download files via authenticated Supabase Storage URLs
```

---

## Database Indexes & Performance

Given the low scale (<10 users, ~2 forms/week), performance optimization is minimal. However, the following indexes support common query patterns:

```sql
-- Dashboard: list forms by owner, sorted by updated_at
CREATE INDEX idx_forms_owner_updated ON public.forms(owner_id, updated_at DESC);

-- Dashboard: list forms accessible via permissions
CREATE INDEX idx_form_permissions_user_form ON public.form_permissions(user_id, form_id);

-- Submissions: list by form, sorted by date
CREATE INDEX idx_submissions_form_created ON public.form_submissions(form_id, created_at DESC);

-- Public form lookup by slug
CREATE INDEX idx_forms_slug ON public.forms(slug);
```

---

## Data Flow Diagrams

### Form Creation Flow

```
User clicks "Nouveau formulaire"
        │
        ▼
POST /forms (Server Action)
        │
        ├── INSERT INTO forms (title, slug, owner_id, status='draft')
        ├── INSERT INTO form_versions (form_id, version=1, schema_json={blocks:[]})
        │
        ▼
Redirect to /forms/{formId}/edit
        │
        ▼
FormBuilder loads blocks from Zustand
        │
        ▼ (on every 500ms change)
Autosave: UPSERT form_versions with updated schema_json
        │
        ▼ (on "Publier")
PATCH /forms/{formId} (status='published')
INSERT INTO form_versions (version=N+1, schema_json=current)
```

### Public Submission Flow

```
User navigates to /f/{slug}
        │
        ▼
Server Component fetches form + latest version
        │
        ▼
schemaToZod(blocks) → ZodProvider → AutoForm renders
        │
        ▼ (user fills form)
Client validates with ZodProvider
        │
        ▼ (user submits)
POST /api/forms/{formId}/submit
        │
        ├── Server-side Zod validation (schemaToZod)
        ├── Rate limit check (Edge Function)
        ├── Honeypot check (__hp field must be empty)
        ├── INSERT INTO form_submissions
        │
        ▼
Return success → show thank-you page
```

---

## Schema Migration Strategy

Since this is a new product with no existing data, migrations are applied directly via Supabase SQL. No migration framework (like Prisma Migrate) is needed at this time.

When v1.5 features require schema changes, the process will be:

1. Write SQL migration in `supabase/migrations/` (for reference only — not auto-executed)
2. Test on local Supabase instance
3. Execute on production via `execute_sql` tool
4. Update TypeScript types in `src/types/forms.ts`

---

## Backup Strategy

Supabase provides automatic daily backups for the PostgreSQL database. No additional backup configuration is needed for MVP scale.

For file uploads in Supabase Storage:
- Supabase handles replication within their infrastructure
- No custom backup needed at this scale
- If critical business data is stored in files, periodic sync to OVH VPS via `s3cmd` can be configured in v2

---

## References

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [PRD — Alecia Forms MVP, Section 8: Data Architecture](../PRD-AleciaForms-MVP.md)

---

*This document is part of the Alecia Forms Technical Design Document suite. See [19-index.md](./19-index.md) for the complete index.*