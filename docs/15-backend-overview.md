# 15 — Backend Overview

> **Alecia Forms TDD** · API endpoints, database architecture, and server-side logic

---

## API Architecture

Alecia Forms uses a hybrid approach:
- **Server Components** for read-heavy pages (dashboard, submission viewer, public form)
- **Server Actions** for data mutations (create, update, delete forms)
- **API Route Handlers** for public-facing endpoints (form submission, rate limiting)

---

## Route Structure

### Authenticated Routes (Protected by Middleware)

| Route | Method | Component | Purpose |
|---|---|---|---|
| `/dashboard` | GET | `DashboardPage` (RSC) | List all accessible forms |
| `/forms/new` | GET | `NewFormPage` (RSC) | Create new form dialog |
| `/forms/[formId]/edit` | GET | `FormBuilderPage` (RSC) | Block-based form builder |
| `/forms/[formId]/submissions` | GET | `SubmissionsPage` (RSC) | View submissions table |
| `/forms/[formId]/settings` | GET | `SettingsPage` (RSC) | Form settings & permissions |

### Public Routes (No Auth)

| Route | Method | Component | Purpose |
|---|---|---|---|
| `/f/[formId]` | GET | `PublicFormPage` (RSC) | Render published form |
| `/f/[formId]/merci` | GET | `ThankYouPage` (RSC) | Post-submission thank you |
| `/api/forms/[formId]/submit` | POST | Route Handler | Submit form data |

### Authentication Routes

| Route | Method | Component | Purpose |
|---|---|---|---|
| `/login` | GET | `LoginPage` | Supabase Auth login form |

---

## API Route Handlers

### POST `/api/forms/[formId]/submit`

**Purpose**: Receive and validate public form submissions

**Request**:
```json
{
  "__hp": "",
  "blk_01": "Jean Dupont",
  "blk_02": "jean@example.com",
  "blk_03": "tech",
  "blk_04": 4
}
```

**Response (200)**:
```json
{
  "success": true,
  "submissionId": "uuid"
}
```

**Response (400)** — Validation error:
```json
{
  "error": "Données invalides",
  "details": {
    "fieldErrors": {
      "blk_02": ["Adresse email invalide"]
    }
  }
}
```

**Response (404)** — Form not found or not published:
```json
{
  "error": "Formulaire introuvable"
}
```

**Response (429)** — Rate limited:
```json
{
  "error": "Trop de soumissions. Veuillez réessayer dans une heure.",
  "retryAfter": 3600
}
```

**Processing flow**:
1. Verify form exists and `status = 'published'`
2. Check honeypot field (`__hp` must be empty)
3. Check rate limit (10 submissions per IP per form per hour)
4. Fetch latest `form_version` schema
5. Generate Zod schema from `schema_json`
6. Validate request body with Zod
7. Insert into `form_submissions`
8. Return success response

### POST `/api/forms/[formId]/upload-url`

**Purpose**: Generate a signed upload URL for file fields

**Request**:
```json
{
  "fileName": "rapport-financier.pdf",
  "contentType": "application/pdf",
  "fileSize": 5242880
}
```

**Response (200)**:
```json
{
  "url": "https://ehpubmtfnirzqztrlvph.supabase.co/storage/v1/object/upload/form-uploads/...",
  "path": "form-uploads/blk_01/uuid.pdf",
  "publicUrl": null
}
```

---

## Server Actions

### `createForm`

```typescript
// src/lib/actions/create-form.ts
"use server";
import { createAuthenticatedClient } from "@/integrations/supabase/server";

export async function createForm(title: string) {
  const supabase = await createAuthenticatedClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  const slug = generateSlug(); // 8-character random string
  
  const { data: form, error } = await supabase
    .from("forms")
    .insert({ title, slug, owner_id: user.id, status: "draft" })
    .select()
    .single();
  if (error) throw error;

  // Create initial version with empty schema
  await supabase.from("form_versions").insert({
    form_id: form.id,
    version_number: 1,
    schema_json: { version: 1, blocks: [], settings: {} },
  });

  return form;
}
```

### `publishForm`

```typescript
// src/lib/actions/publish-form.ts
"use server";
export async function publishForm(formId: string, schemaJson: SchemaJson) {
  const supabase = await createAuthenticatedClient();
  // ... auth check ...
  
  // Create new version
  const { data: latestVersion } = await supabase
    .from("form_versions")
    .select("version_number")
    .eq("form_id", formId)
    .order("version_number", { ascending: false })
    .limit(1)
    .single();

  await supabase.from("form_versions").insert({
    form_id: formId,
    version_number: (latestVersion?.version_number ?? 0) + 1,
    schema_json: schemaJson,
  });

  // Update form status
  await supabase
    .from("forms")
    .update({ status: "published", published_at: new Date().toISOString() })
    .eq("id", formId);
}
```

### `deleteForm` (Soft Delete)

```typescript
// src/lib/actions/delete-form.ts
"use server";
export async function deleteForm(formId: string) {
  const supabase = await createAuthenticatedClient();
  // ... auth + ownership check ...
  
  await supabase
    .from("forms")
    .update({ is_deleted: true })
    .eq("id", formId);
}
```

---

## Database Query Patterns

### Dashboard: List Accessible Forms

```sql
SELECT f.id, f.title, f.slug, f.status, f.created_at, f.updated_at, f.published_at,
  (SELECT COUNT(*) FROM form_submissions fs WHERE fs.form_id = f.id) AS submission_count
FROM forms f
LEFT JOIN form_permissions fp ON fp.form_id = f.id AND fp.user_id = :userId
WHERE (f.owner_id = :userId OR fp.user_id = :userId)
  AND f.is_deleted = false
ORDER BY f.updated_at DESC;
```

### Public Form: Fetch Published Form with Latest Version

```sql
SELECT f.*, fv.id AS version_id, fv.schema_json
FROM forms f
JOIN form_versions fv ON fv.form_id = f.id
WHERE f.slug = :slug
  AND f.status = 'published'
  AND f.is_deleted = false
ORDER BY fv.version_number DESC
LIMIT 1;
```

### Submission Export: Flatten JSONB to CSV

```sql
SELECT 
  fs.id,
  fs.respondent_email,
  fs.created_at,
  fs.data->>'blk_01' AS "nom_complet",
  fs.data->>'blk_02' AS "email",
  fs.data->>'blk_03' AS "secteur",
  fs.data->>'blk_04' AS "satisfaction"
FROM form_submissions fs
WHERE fs.form_id = :formId
ORDER BY fs.created_at DESC;
```

---

## Rate Limiting Edge Function

Deployed at `supabase/functions/rate-limit/index.ts`:

```typescript
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://forms.alecia.fr",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const clientIp = req.headers.get("x-forwarded-for") || "unknown";
  const formId = new URL(req.url).searchParams.get("form_id");
  if (!formId) {
    return new Response(JSON.stringify({ error: "form_id required" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
  const { count } = await supabase
    .from("form_submissions")
    .select("*", { count: "exact", head: true })
    .eq("form_id", formId)
    .eq("respondent_ip", clientIp)
    .gte("created_at", oneHourAgo);

  const allowed = (count ?? 0) < 10;
  return new Response(
    JSON.stringify({ allowed, remaining: Math.max(0, 10 - (count ?? 0)) }),
    { status: allowed ? 200 : 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
```

---

## Data Flow Diagram

```
┌─────────────┐    ┌─────────────┐    ┌──────────────────────────┐
│   Browser   │    │   Builder   │    │       Supabase           │
│   (Public)  │    │   (Authed)  │    │                           │
└──────┬──────┘    └──────┬──────┘    └────────────┬─────────────┘
       │                  │                          │
       │ GET /f/[slug]    │ GET /dashboard           │
       │ (RSC)            │ (RSC)                     │
       │──────────────────│──────────────────────────│
       │                  │                          │
       │  AutoForm render │  FormCard grid           │
       │  (client)        │  (client)                │
       │                  │                          │
       │                  │  Builder state (Zustand)  │
       │                  │  ↕ autosave 500ms        │
       │                  │─────────────────────────►│
       │                  │  UPSERT form_versions     │
       │                  │                          │
       │ POST /api/forms/[id]/submit                │
       │────────────────────────────────────────────►│
       │  Validate (Zod) │  INSERT form_submissions │
       │                  │                          │
       │  Thank you page  │                          │
       │◄─────────────────│                          │
       │                  │                          │
       │                  │  GET /forms/[id]/edit     │
       │                  │─────────────────────────►│
       │                  │  Fetch form + version     │
       │                  │  Populate Zustand store   │
```

---

## References

- [Next.js 16 Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions)
- [Next.js 16 Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [PRD — Alecia Forms MVP](../PRD-AleciaForms-MVP.md)

---

*This document is part of the Alecia Forms Technical Design Document suite. See [19-index.md](./19-index.md) for the complete index.*