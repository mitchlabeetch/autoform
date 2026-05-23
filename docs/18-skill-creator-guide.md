# 18 — Skill Creator Guide

> **Alecia Forms TDD** · Comprehensive information for creating project-specific AI skills and agents

---

## Purpose

This document provides all the context an AI agent (Dyad, Codex CLI, or custom GPT) needs to effectively contribute to the Alecia Forms project. It includes project conventions, architectural patterns, and code generation templates.

---

## Project Identity

| Attribute | Value |
|---|---|
| **Product Name** | Alecia Forms |
| **Repository** | Monorepo at `/path/to/autoform-monorepo` |
| **Main App** | `apps/forms` (Next.js 16, App Router) |
| **Design System** | Alecia Design System (see `AI_RULES.md`) |
| **Language** | TypeScript (strict mode) |
| **UI Language** | French (all production user-facing strings) |
| **Comments** | English (code comments and documentation) |
| **Database** | Supabase PostgreSQL (`ehpubmtfnirzqztrlvph.supabase.co`) |
| **Auth** | Supabase Auth with `.alecia.fr` cookie domain |

---

## Key Architectural Rules

### 1. Never Hardcode Colors

```typescript
// ❌ NEVER
<div className="bg-[#061a40]">

// ✅ ALWAYS
<div className="bg-primary">
<div className="text-graph-alecia">
<div className="shadow-navy-md">
```

### 2. Never Hardcode Spacing

```typescript
// ❌ NEVER
<div className="p-5 mt-7 gap-3">

// ✅ ALWAYS (8pt grid: p-4, p-8, mt-4, mt-8, gap-4, gap-8)
<div className="p-4 mt-8 gap-4">
```

### 3. Always Use Alecia Typography Scale

```typescript
// ❌ NEVER
<h1 className="text-6xl font-black">

// ✅ ALWAYS
<h1 className="text-4xl md:text-5xl font-bold font-serif">  // Playfair Display
<h2 className="text-2xl md:text-3xl font-semibold">            // Bierstadt
<span className="text-3xl font-semibold font-outfit tabular-nums">  // Outfit for KPIs
```

### 4. French-First UI Strings

```typescript
// ❌ NEVER
<button>Submit</button>

// ✅ ALWAYS
<button>Soumettre</button>
<p className="text-sm text-muted-foreground">Mis à jour le {date}</p>
```

### 5. Use @autoform/* for Form Rendering

```typescript
// ❌ NEVER — manually constructing form fields
<input type="text" {...register("name")} />

// ✅ ALWAYS — using the AutoForm engine
import { AutoForm } from "@autoform/shadcn";
import { ZodProvider } from "@autoform/zod";

const schema = z.object({ name: z.string().min(1, "Le nom est requis") });
const provider = new ZodProvider(schema);

<AutoForm schema={provider} onSubmit={handleSubmit} withSubmit />
```

### 6. Use Server Components by Default

```typescript
// ✅ Default: Server Component (no "use client")
export default async function DashboardPage() {
  const supabase = await createAuthenticatedClient();
  const { data } = await supabase.from("forms").select("*");
  return <FormList initialForms={data} />;
}

// ❌ Only use "use client" when necessary (event handlers, hooks, browser APIs)
"use client";
export function FormBuilder() { /* Zustand, dnd, etc. */ }
```

### 7. Always Use `createAuthenticatedClient()` for Protected Routes

```typescript
// ❌ NEVER — browser client in Server Components
import { supabase } from "@/integrations/supabase/client";

// ✅ ALWAYS — server client in Server Components
import { createAuthenticatedClient } from "@/integrations/supabase/server";
const supabase = await createAuthenticatedClient();
```

### 8. Accessibility Checklist for Every Component

- Focus rings: `focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring`
- Icons: `aria-hidden="true"` if decorative, `aria-label` if interactive
- Skip link: Present on every page
- Screen reader announcements for dynamic content
- `prefers-reduced-motion` respected

---

## Code Generation Templates

### Server Component Page Template

```typescript
// src/app/(dashboard)/[route]/page.tsx
import { createAuthenticatedClient } from "@/integrations/supabase/server";
import { notFound } from "next/navigation";

export default async function PageName({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createAuthenticatedClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return notFound();

  const { data } = await supabase.from("table").select("*").eq("id", id).single();
  if (!data) return notFound();

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-semibold text-gradient-alecia">
        Titre de la page
      </h1>
      {/* Content */}
    </div>
  );
}
```

### Client Component Template

```typescript
"use client";
import { useState } from "react";

export function ComponentName() {
  const [state, setState] = useState(null);

  return (
    <div className="p-4 bg-card rounded-xl border shadow-navy-sm card-hover">
      {/* Content */}
    </div>
  );
}
```

### TanStack Query Hook Template

```typescript
// src/hooks/use-forms.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useForms() {
  return useQuery({
    queryKey: ["forms"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("forms")
        .select("*")
        .eq("is_deleted", false)
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateForm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (title: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("forms")
        .insert({ title, owner_id: user!.id, status: "draft" })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["forms"] }),
  });
}
```

### Zustand Store Template

```typescript
// src/stores/[name]-store.ts
import { create } from "zustand";

interface [Name]State {
  // State
  isLoading: boolean;
  // Actions
  setLoading: (loading: boolean) => void;
}

export const use[Name]Store = create<[Name]State>((set) => ({
  isLoading: false,
  setLoading: (loading) => set({ isLoading: loading }),
}));
```

---

## Supabase Query Patterns

### Always use RLS-compatible queries

```typescript
// ✅ Authenticated client (respects RLS)
const supabase = await createAuthenticatedClient();

// ✅ For public form pages (no auth, but RLS still applies)
const supabase = createServerClient();

// ❌ NEVER use service role client in browser code
// Service role bypasses ALL RLS policies
```

### Common queries

```typescript
// Fetch forms accessible to current user
const { data } = await supabase
  .from("forms")
  .select("*, form_permissions!inner(role)")
  .or(`owner_id.eq.${userId},form_permissions.user_id.eq.${userId}`)
  .eq("is_deleted", false);

// Fetch submissions for a form
const { data } = await supabase
  .from("form_submissions")
  .select("*")
  .eq("form_id", formId)
  .order("created_at", { ascending: false })
  .range(0, 49); // Pagination: first 50
```

---

## File Naming Conventions

| Type | Pattern | Example |
|---|---|---|
| Page | `page.tsx` | `app/(dashboard)/dashboard/page.tsx` |
| Layout | `layout.tsx` | `app/(auth)/layout.tsx` |
| Component | PascalCase | `FormBuilder.tsx` |
| Hook | camelCase with `use-` prefix | `use-forms.ts` |
| Store | camelCase with `-store` suffix | `form-builder-store.ts` |
| Type file | kebab-case | `block-types.ts` |
| Server action | kebab-case | `create-form.ts` |
| API route | `route.ts` | `app/api/forms/[formId]/submit/route.ts` |

---

## When Generating Code for This Project

1. **Always check existing files first** — Read the relevant `apps/forms/src/` files before generating new ones
2. **Follow the patterns** — If a hook uses TanStack Query, all hooks should use TanStack Query
3. **Use the established imports** — Supabase client from `@/integrations/supabase/client`, not a new path
4. **All UI strings in French** — Comment them in English if ambiguous
5. **Use Alecia Design tokens** — Reference `AI_RULES.md` for color, typography, and spacing guidelines
6. **Respect RLS** — Every Supabase query must respect Row Level Security
7. **Test assertions in French** — Error messages visible to users must be in French
8. **Server Components by default** — Only use "use client" when hooks or browser APIs are needed

---

## References

- [AI_RULES.md](../AI_RULES.md) — Alecia Design System specification
- [PRD — Alecia Forms MVP](../PRD-AleciaForms-MVP.md)
- [docs/02-tech-stack.md](./02-tech-stack.md)
- [docs/04-feature-implementation.md](./04-feature-implementation.md)
- [docs/05-design-implementation.md](./05-design-implementation.md)

---

*This document is part of the Alecia Forms Technical Design Document suite. See [19-index.md](./19-index.md) for the complete index.*