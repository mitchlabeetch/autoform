# 07 — AI Assistance Strategy

> **Alecia Forms TDD** · AI coding workflows, Codex CLI automation, and Dyad development patterns

---

## Development AI: Dyad

Dyad is the primary development tool for building Alecia Forms. Here's how to use it effectively for this project.

### How to Structure Dyad Prompts

**Pattern 1: Component Implementation**
```
Create [ComponentName] in apps/forms/src/components/forms/[path].

Requirements:
- Use shadcn/ui components (Card, Button, Input, etc.)
- Follow Alecia Design System tokens (--background, --accent, etc.)
- All strings in French
- Respect the 8pt spacing grid (p-4, p-8, gap-4, etc.)
- Use navy shadows (shadow-navy-sm/md/lg)
- Include card-hover animation where appropriate
- WCAG 2.1 AA: focus-visible outlines, aria-labels on icons
```

**Pattern 2: Hook / Store Implementation**
```
Create a Zustand store for [feature] in apps/forms/src/stores/[name]-store.ts.

State shape:
- [field]: [type] — [description]
  
Actions:
- [actionName]: [params] → [description]

Follow the pattern established in src/stores/form-builder-store.ts.
```

**Pattern 3: Server Component / API Route**
```
Create a Next.js 16 Server Component at apps/forms/src/app/[path]/page.tsx.

Requirements:
- Use createAuthenticatedClient() for authenticated queries
- Use createServerClient() for public queries
- TypeScript types from src/types/forms.ts
- French error messages
- notFound() for 404 cases
- Revalidate with 'use cache' where appropriate (Next.js 16)
```

**Pattern 4: Schema-to-Zod Converter Update**
```
Update apps/forms/src/lib/forms/schema-to-zod.ts to handle the [blockType] block type.

The config for this block type is: [config shape]
The Zod schema should be: [expected Zod schema]

Follow the pattern established by the existing switch cases.
Add unit test in apps/forms/src/lib/forms/schema-to-zod.test.ts.
```

### Dyad Workflow Tips

1. **Always reference the TDD docs**: "Per docs/04-feature-implementation.md, the FormBuilder uses..."
2. **Point to existing code**: "Follow the pattern in src/components/forms/dashboard/FormCard.tsx"
3. **Specify Alecia tokens explicitly**: "Use bg-primary, text-foreground, shadow-navy-md"
4. **Request French strings explicitly**: "All user-facing strings must be in French"
5. **After generation, run type checks**: Use `run_type_checks` to verify

---

## Runtime AI: Codex CLI

Codex CLI is used for operational tasks on the Coolify-hosted infrastructure. These are triggered manually or via Gitea webhooks.

### Useful Codex CLI Commands

```bash
# Database operations
codex "Connect to the Alecia Supabase instance and verify all 6 form tables exist with correct RLS policies"

codex "Run a query on the forms table to count total forms by status (draft, published, archived)"

codex "Check that the handle_new_user trigger exists in auth.users"

# Deployment operations
codex "Check the Coolify deployment status for forms.alecia.fr and report last 10 log lines"

codex "If the forms.alecia.fr deployment is failing, rollback to the previous container image"

# Monitoring
codex "Check the OVH VPS resource usage (CPU, RAM, disk) and report if any are above 80%"

codex "List all Docker containers running on Coolify and their status"

# Data operations
codex "Export all form_submissions for form_id XYZ as a CSV file"

codex "Delete all form_submissions created before 2025-01-01 for GDPR cleanup"
```

### Codex Automation Scripts

Create these as shell scripts in `scripts/`:

```bash
# scripts/db-verify.sh
#!/bin/bash
echo "Verifying Alecia Forms database tables..."
codex "Verify that the following tables exist with RLS enabled: forms, form_versions, form_fields, form_submissions, form_permissions, profiles. Report any missing tables or disabled RLS."
```

```bash
# scripts/deploy-check.sh
#!/bin/bash
echo "Checking forms.alecia.fr deployment..."
codex "Check Coolify deployment health for forms.alecia.fr. Verify: 1) Container is running, 2) SSL cert is valid, 3) /f/test-form returns 404 (expected). Report any issues."
```

---

## AI-Assisted Debugging Patterns

### When Forms Don't Render

1. **Check the schema JSON**: Open Supabase Dashboard → `form_versions` → inspect `schema_json`
2. **Validate the Zod conversion**: Add a console log in `schemaToZod()` to print the generated schema
3. **Check the browser console**: AutoForm errors surface as React warnings
4. **Ask Dyad**: "The form at /f/[slug] renders blank. The schema_json is [paste JSON]. The generated Zod schema is [paste output]. What's wrong?"

### When Submissions Fail

1. **Check the API route**: Look for validation errors in server logs
2. **Check Supabase RLS**: The `form_submissions_insert_policy` requires `f.status = 'published'`
3. **Check rate limiting**: The Edge Function may be blocking
4. **Ask Dyad**: "Form submissions return 403. The form status is [status]. The RLS policy is [policy]. Why is this failing?"

### When Drag-and-Drop Is Janky

1. **Check sensors**: Ensure `@dnd-kit` PointerSensor has `activationConstraint: { distance: 5 }`
2. **Check mobile**: Touch sensors may need `TouchSensor` with `activationConstraint: { delay: 150 }`
3. **Check animations**: Verify Framer Motion `useReducedMotion()` isn't disabling everything
4. **Ask Dyad**: "Block drag-and-drop in FormBuilder is laggy on mobile. Current sensor config: [paste]. How can I optimize?"

---

## Prompt Templates for Common Tasks

### Adding a New Block Type

```
I need to add a new block type "[typeName]" to the Alecia Forms builder.

Block config shape: { [config fields] }
French label: "[frenchLabel]"
French description: "[frenchDescription]"
Icon from lucide-react: [IconName]

Files to update:
1. src/types/blocks.ts — add type to BlockType union and BLOCK_TYPE_CONFIG
2. src/lib/forms/schema-to-zod.ts — add case to switch statement
3. src/components/forms/builder/BlockPalette.tsx — add icon import
4. src/components/forms/builder/BlockConfigPanel.tsx — add configuration UI
5. src/lib/forms/schema-serializer.ts — add serialization logic

Use Alecia Design tokens. All user-facing strings in French.
```

### Creating a New Page Route

```
Create a Next.js 16 page at apps/forms/src/app/[route]/page.tsx.

This is a [Server/Client] Component.
Data source: Supabase table [tableName]
Auth required: [Yes/No — if yes, use createAuthenticatedClient]

Layout: Use [layout pattern — dashboard/centered/public]
Components: List the shadcn/ui components to use
Typography: [H1/H2/H3] using Alecia scale
All strings in French.
```

### Creating a TanStack Query Hook

```
Create a TanStack Query v5 hook at apps/forms/src/hooks/use-[name].ts.

Operation: [CRUD operation]
Table: [Supabase table name]
Filters: [list filters]
Auth: [Does the user need to be authenticated?]
Optimistic update: [Yes/No — describe expected behavior]

Follow the pattern from an existing hook in src/hooks/.
Use the Supabase client from src/integrations/supabase/client.ts.
```

---

## References

- [Dyad Documentation](https://docs.dyad.sh)
- [OpenAI Codex CLI](https://github.com/openai/codex)
- [PRD — Alecia Forms MVP](../PRD-AleciaForms-MVP.md)

---

*This document is part of the Alecia Forms Technical Design Document suite. See [19-index.md](./19-index.md) for the complete index.*