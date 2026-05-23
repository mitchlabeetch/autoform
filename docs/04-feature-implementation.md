# 04 — Feature Implementation Guide

> **Alecia Forms TDD** · Implementation guide for every PRD feature

---

## Implementation Priority Order

Features are implemented in dependency order. Each feature includes: file paths, component architecture, data flow, and key code patterns.

```
Phase 1 — Foundation (Days 1-4)
  F1. Auth → F2. Schema Engine → F5. Public Rendering
Phase 2 — Builder (Days 5-10)
  F3. Form Builder (block palette, drag, config, preview)
Phase 3 — Dashboard & Management (Days 11-14)
  F2. Dashboard → F6. Submission → F7. Submissions Mgmt → F8. Form Management
Phase 4 — Polish (Days 15-16)
  Alecia Design tokens, animations, a11y, testing
```

---

## F1 · Authentication & Authorization

### Architecture

```
Browser → proxy.ts (Next.js 16) → /dashboard routes (authenticated)
                               → /f/* routes (public, no auth)
                               → /api/forms/*/submit (public, rate-limited)
```

### Files

| File | Purpose |
|---|---|
| `src/middleware.ts` | Next.js 16 middleware (or proxy.ts) protecting dashboard routes |
| `src/integrations/supabase/client.ts` | Browser Supabase client |
| `src/integrations/supabase/server.ts` | Server Supabase client (service role + authenticated) |
| `src/components/auth/SessionProvider.tsx` | React context providing auth state |
| `src/components/auth/LoginForm.tsx` | Login page UI |
| `src/components/auth/AuthGuard.tsx` | Client component redirecting unauthenticated users |
| `src/app/(auth)/layout.tsx` | Centered layout for login |
| `src/app/(auth)/login/page.tsx` | Login page |
| `src/app/(dashboard)/layout.tsx` | Authenticated layout with sidebar nav |

### Implementation Details

**SessionProvider.tsx** wraps the dashboard layout and listens to auth state changes:

```typescript
// src/components/auth/SessionProvider.tsx
"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

type AuthContext = {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthCtx = createContext<AuthContext>({
  user: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthCtx);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <AuthCtx.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthCtx.Provider>
  );
}
```

**middleware.ts** (Next.js 16 proxy):

```typescript
// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_COOKIE = "sb-ehpubmtfnirzqztrlvph-auth-token";
const DASHBOARD_PREFIX = "/dashboard";
const FORMS_PREFIX = "/forms";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasAuth = request.cookies.has(AUTH_COOKIE);

  // Public routes: form rendering and submission
  if (pathname.startsWith("/f/") || pathname.startsWith("/api/forms/")) {
    return NextResponse.next();
  }

  // Auth routes: redirect to dashboard if already logged in
  if (pathname === "/login" && hasAuth) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Protected routes: redirect to login if not authenticated
  if (
    (pathname.startsWith(DASHBOARD_PREFIX) || pathname.startsWith(FORMS_PREFIX)) &&
    !hasAuth
  ) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/forms/:path*", "/login", "/f/:path*", "/api/forms/:path*"],
};
```

**Login page** uses Supabase Auth UI with Alecia theming:

```typescript
// src/app/(auth)/login/page.tsx
"use client";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-gradient-alecia mb-8 text-center">
          Alecia Forms
        </h1>
        <Auth
          supabaseClient={supabase}
          providers={[]}
          appearance={{ theme: ThemeSupa }}
          theme="light"
          localization={{
            variables: {
              sign_in: {
                email_label: "Adresse email",
                password_label: "Mot de passe",
                button_label: "Se connecter",
                loading_button_label: "Connexion en cours...",
                social_provider_text: "Se connecter avec {{provider}}",
                link_text: "Déjà un compte ? Connectez-vous",
              },
              sign_up: {
                email_label: "Adresse email",
                password_label: "Créer un mot de passe",
                button_label: "Créer un compte",
                loading_button_label: "Création en cours...",
                link_text: "Pas encore de compte ? Inscrivez-vous",
              },
            },
          }}
        />
      </div>
    </div>
  );
}
```

---

## F2 · Form Dashboard

### Files

| File | Purpose |
|---|---|
| `src/app/(dashboard)/dashboard/page.tsx` | Dashboard home (Server Component) |
| `src/components/forms/dashboard/FormList.tsx` | Client component: filterable grid |
| `src/components/forms/dashboard/FormCard.tsx` | Card component per form |
| `src/hooks/use-forms.ts` | TanStack Query hook for forms list |

### Implementation Details

**Dashboard page** (Server Component fetching initial data):

```typescript
// src/app/(dashboard)/dashboard/page.tsx
import { createAuthenticatedClient } from "@/integrations/supabase/server";
import { FormList } from "@/components/forms/dashboard/FormList";

export default async function DashboardPage() {
  const supabase = await createAuthenticatedClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data: forms } = await supabase
    .from("forms")
    .select("id, title, slug, status, created_at, updated_at, published_at")
    .or(`owner_id.eq.${user.id},form_permissions.user_id.eq.${user.id}`)
    .eq("is_deleted", false)
    .order("updated_at", { ascending: false });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gradient-alecia">
            Mes formulaires
          </h1>
          <p className="text-muted-foreground mt-1">
            Créez, gérez et partagez vos formulaires professionnels
          </p>
        </div>
        <a
          href="/forms/new"
          className="btn-gold px-6 py-3 rounded-lg inline-flex items-center gap-2"
        >
          Nouveau formulaire
        </a>
      </div>
      <FormList initialForms={forms ?? []} userId={user.id} />
    </div>
  );
}
```

**FormCard** implements the Alecia `.card-hover` spec:

```typescript
// src/components/forms/dashboard/FormCard.tsx
"use client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Copy, Link, Trash2, BarChart3 } from "lucide-react";

type FormCardProps = {
  id: string;
  title: string;
  slug: string;
  status: "draft" | "published" | "archived";
  submissionCount: number;
  updatedAt: string;
  onCopyLink: (slug: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
};

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  draft: { label: "Brouillon", variant: "secondary" },
  published: { label: "Publié", variant: "default" },
  archived: { label: "Archivé", variant: "outline" },
};

export function FormCard({ id, title, slug, status, submissionCount, updatedAt, onCopyLink, onDuplicate, onDelete }: FormCardProps) {
  const { label, variant } = statusLabels[status];
  return (
    <Card className="card-hover group">
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div className="space-y-1 flex-1">
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Mis à jour le {new Date(updatedAt).toLocaleDateString("fr-FR")}
          </CardDescription>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger className="opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => window.location.href = `/forms/${id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" /> Modifier
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => window.location.href = `/forms/${id}/submissions`}>
              <BarChart3 className="mr-2 h-4 w-4" /> Réponses ({submissionCount})
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onCopyLink(slug)}>
              <Link className="mr-2 h-4 w-4" /> Copier le lien
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDuplicate(id)}>
              <Copy className="mr-2 h-4 w-4" /> Dupliquer
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" onClick={() => onDelete(id)}>
              <Trash2 className="mr-2 h-4 w-4" /> Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="flex items-center gap-3">
        <Badge variant={variant}>{label}</Badge>
        <span className="text-sm text-muted-foreground">
          {submissionCount} réponse{submissionCount !== 1 ? "s" : ""}
        </span>
      </CardContent>
    </Card>
  );
}
```

---

## F3 · Block-Based Form Builder

### Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                     FORM BUILDER (Client Component)                      │
│                                                                          │
│  ┌──────────────┐  ┌──────────────────────┐  ┌──────────────────────┐  │
│  │  BlockPalette  │  │  FormBuilder Canvas   │  │  BlockConfigPanel    │  │
│  │  (Left 280px) │  │  (Center flexible)    │  │  (Right 360px)       │  │
│  │               │  │                        │  │                       │  │
│  │  + Texte      │  │  ┌──── Block 1 ─────┐│  │  Label: [____]       │  │
│  │  + Email      │  │  │  Nom complet  *    ││  │  Required: [toggle]  │  │
│  │  + Numéro     │  │  │  [___________]     ││  │  Placeholder: [___]  │  │
│  │  + Téléphone  │  │  └────────────────────┘│  │  Help text: [____]   │  │
│  │  + Sélecteur  │  │  ┌──── Block 2 ─────┐│  │  Validation: [...]    │  │
│  │  + ...        │  │  │  Email  *           ││  │                       │  │
│  │               │  │  │  [___________]     ││  │                       │  │
│  │               │  │  └────────────────────┘│  │                       │  │
│  └──────────────┘  └──────────────────────┘  └──────────────────────┘  │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐    │
│  │  LivePreview (Toggle: Desktop / Mobile)                          │    │
│  │  Renders @autoform/shadcn AutoForm with current block config     │    │
│  └──────────────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────────────┘
```

### Zustand Store

```typescript
// src/stores/form-builder-store.ts
import { create } from "zustand";
import type { FormBlock } from "@/types/blocks";

interface FormBuilderState {
  // Blocks
  blocks: FormBlock[];
  selectedBlockId: string | null;
  
  // Drag state
  isDragging: boolean;
  draggedBlockId: string | null;
  
  // UI state
  previewMode: "desktop" | "mobile";
  isDirty: boolean;
  lastSavedAt: Date | null;
  isSaving: boolean;
  
  // Actions
  addBlock: (type: FormBlock["type"], index?: number) => void;
  removeBlock: (id: string) => void;
  moveBlock: (fromIndex: number, toIndex: number) => void;
  updateBlock: (id: string, updates: Partial<FormBlock>) => void;
  selectBlock: (id: string | null) => void;
  setPreviewMode: (mode: "desktop" | "mobile") => void;
  markSaved: () => void;
  setSaving: (saving: boolean) => void;
  loadBlocks: (blocks: FormBlock[]) => void;
}

export const useFormBuilderStore = create<FormBuilderState>((set) => ({
  blocks: [],
  selectedBlockId: null,
  isDragging: false,
  draggedBlockId: null,
  previewMode: "desktop",
  isDirty: false,
  lastSavedAt: null,
  isSaving: false,

  addBlock: (type, index) =>
    set((state) => {
      const newBlock = createDefaultBlock(type);
      const blocks = [...state.blocks];
      const insertAt = index ?? blocks.length;
      blocks.splice(insertAt, 0, newBlock);
      return { blocks, selectedBlockId: newBlock.id, isDirty: true };
    }),

  removeBlock: (id) =>
    set((state) => ({
      blocks: state.blocks.filter((b) => b.id !== id),
      selectedBlockId: state.selectedBlockId === id ? null : state.selectedBlockId,
      isDirty: true,
    })),

  moveBlock: (fromIndex, toIndex) =>
    set((state) => {
      const blocks = [...state.blocks];
      const [moved] = blocks.splice(fromIndex, 1);
      blocks.splice(toIndex, 0, moved);
      return { blocks, isDirty: true };
    }),

  updateBlock: (id, updates) =>
    set((state) => ({
      blocks: state.blocks.map((b) => (b.id === id ? { ...b, ...updates } : b)),
      isDirty: true,
    })),

  selectBlock: (id) => set({ selectedBlockId: id }),
  setPreviewMode: (mode) => set({ previewMode: mode }),
  markSaved: () => set({ isDirty: false, lastSavedAt: new Date() }),
  setSaving: (saving) => set({ isSaving: saving }),
  loadBlocks: (blocks) => set({ blocks, isDirty: false }),
}));
```

### Block Types Definition

```typescript
// src/types/blocks.ts
export type BlockType =
  | "text"
  | "email"
  | "number"
  | "phone"
  | "select"
  | "multiselect"
  | "radio"
  | "date"
  | "boolean"
  | "scale"
  | "file"
  | "description";

export interface SelectOption {
  value: string;
  label: string;
}

export interface FormBlock {
  id: string;
  type: BlockType;
  label: string;
  placeholder?: string;
  helpText?: string;
  required: boolean;
  order: number;
  config: Record<string, unknown>;
  // Type-specific config expansions:
  // text: { multiline: boolean; maxLength?: number; minLength?: number }
  // number: { min?: number; max?: number; step?: number }
  // select/multiselect/radio: { options: SelectOption[] }
  // scale: { min: number; max: number; labels?: Record<number, string> }
  // file: { accept?: string[]; maxSize?: number }
  // description: { content: string } (no validation, not a question)
}

export const BLOCK_TYPE_CONFIG: Record<
  BlockType,
  { label: string; icon: string; description: string }
> = {
  text: { label: "Champ texte", icon: "Type", description: "Texte court ou long" },
  email: { label: "Courriel", icon: "Mail", description: "Adresse email validée" },
  number: { label: "Numéro", icon: "Hash", description: "Nombre avec min/max" },
  phone: { label: "Téléphone", icon: "Phone", description: "Numéro de téléphone" },
  select: { label: "Menu déroulant", icon: "ChevronDown", description: "Sélection unique" },
  multiselect: { label: "Choix multiple", icon: "CheckSquare", description: "Plusieurs sélections" },
  radio: { label: "Choix unique", icon: "CircleDot", description: "Boutons radio" },
  date: { label: "Date", icon: "Calendar", description: "Sélecteur de date" },
  boolean: { label: "Oui / Non", icon: "ToggleLeft", description: "Bascule oui/non" },
  scale: { label: "Échelle", icon: "BarChart3", description: "Note de 1 à N" },
  file: { label: "Fichier", icon: "Paperclip", description: "Upload de fichier" },
  description: { label: "Texte descriptif", icon: "AlignLeft", description: "Texte statique" },
};
```

### FormBuilder Component

```typescript
// src/components/forms/builder/FormBuilder.tsx
"use client";
import { DndContext, DragOverlay, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useFormBuilderStore } from "@/stores/form-builder-store";
import { BlockPalette } from "./BlockPalette";
import { BlockCard } from "./BlockCard";
import { BlockConfigPanel } from "./BlockConfigPanel";
import { LivePreview } from "./LivePreview";

export function FormBuilder({ formId }: { formId: string }) {
  const { blocks, selectedBlockId, moveBlock, selectBlock } = useFormBuilderStore();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const fromIndex = blocks.findIndex((b) => b.id === active.id);
    const toIndex = blocks.findIndex((b) => b.id === over.id);
    moveBlock(fromIndex, toIndex);
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="flex h-screen bg-background">
        {/* Left: Block Palette (280px) */}
        <BlockPalette />

        {/* Center: Canvas (flex-1) */}
        <main className="flex-1 overflow-y-auto p-8">
          <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
            <div className="max-w-2xl mx-auto space-y-4">
              {blocks.map((block) => (
                <BlockCard
                  key={block.id}
                  block={block}
                  isSelected={block.id === selectedBlockId}
                  onSelect={() => selectBlock(block.id)}
                />
              ))}
              {blocks.length === 0 && (
                <div className="text-center py-16 text-muted-foreground">
                  <p className="text-lg mb-2">Aucun champ pour l'instant</p>
                  <p className="text-sm">Ajoutez des champs depuis le panneau de gauche</p>
                </div>
              )}
            </div>
          </SortableContext>
        </main>

        {/* Right: Config Panel (360px) */}
        {selectedBlockId && <BlockConfigPanel blockId={selectedBlockId} />}
      </div>

      {/* Toggle Preview */}
      <LivePreview />
    </DndContext>
  );
}
```

### Autosave Hook

```typescript
// src/hooks/use-autosave.ts
import { useEffect, useRef } from "react";
import { useFormBuilderStore } from "@/stores/form-builder-store";

export function useAutosave(formId: string, intervalMs = 500) {
  const { blocks, isDirty, isSaving, markSaved, setSaving } = useFormBuilderStore();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const supabase = useSupabase(); // from auth context

  useEffect(() => {
    if (!isDirty || isSaving) return;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(async () => {
      setSaving(true);
      try {
        const { error } = await supabase
          .from("form_versions")
          .insert({
            form_id: formId,
            schema_json: { version: 1, blocks, settings: {} },
          });
        if (!error) markSaved();
      } finally {
        setSaving(false);
      }
    }, intervalMs);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [blocks, isDirty, isSaving]);
}
```

---

## F4 · Schema Serialization & Storage

### The `schemaToZod` Engine

This is the core innovation. It converts the builder's JSON block configuration into a live Zod schema that `@autoform/zod`'s `ZodProvider` can consume.

```typescript
// src/lib/forms/schema-to-zod.ts
import { z } from "zod/v3";
import type { FormBlock, SelectOption } from "@/types/blocks";

export function schemaToZod(blocks: FormBlock[]): z.ZodObject<Record<string, z.ZodTypeAny>> {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const block of blocks) {
    if (block.type === "description") continue; // static text, not a field

    let fieldSchema: z.ZodTypeAny;

    switch (block.type) {
      case "text": {
        let schema = z.string();
        const config = block.config as { multiline?: boolean; maxLength?: number; minLength?: number };
        if (config.minLength) schema = schema.min(config.minLength, `Minimum ${config.minLength} caractères`);
        if (config.maxLength) schema = schema.max(config.maxLength, `Maximum ${config.maxLength} caractères`);
        if (block.required) schema = schema.min(1, `${block.label} est requis`);
        else schema = schema.optional().or(z.literal(""));
        fieldSchema = schema;
        break;
      }

      case "email": {
        let schema = z.string();
        if (block.required) schema = schema.min(1, `${block.label} est requis`);
        schema = schema.email("Adresse email invalide");
        if (!block.required) schema = schema.optional().or(z.literal(""));
        fieldSchema = schema;
        break;
      }

      case "number": {
        let schema = z.number();
        const config = block.config as { min?: number; max?: number };
        if (config.min !== undefined) schema = schema.min(config.min);
        if (config.max !== undefined) schema = schema.max(config.max);
        if (!block.required) schema = schema.optional();
        fieldSchema = schema;
        break;
      }

      case "phone": {
        let schema = z.string().regex(
          /^(\+33|0)[1-9](\d{2}){4}$/,
          "Numéro de téléphone français invalide"
        );
        if (block.required) schema = schema.min(1, `${block.label} est requis`);
        else schema = schema.optional().or(z.literal(""));
        fieldSchema = schema;
        break;
      }

      case "select":
      case "radio": {
        const config = block.config as { options: SelectOption[] };
        const values = config.options.map((o) => o.value) as [string, ...string[]];
        fieldSchema = z.enum(values);
        if (!block.required) fieldSchema = fieldSchema.optional();
        break;
      }

      case "multiselect": {
        const config = block.config as { options: SelectOption[] };
        const values = config.options.map((o) => o.value) as [string, ...string[]];
        fieldSchema = z.array(z.enum(values));
        if (!block.required) fieldSchema = fieldSchema.optional();
        break;
      }

      case "date": {
        fieldSchema = block.required ? z.coerce.date() : z.coerce.date().optional();
        break;
      }

      case "boolean": {
        fieldSchema = z.boolean();
        if (!block.required) fieldSchema = fieldSchema.optional();
        break;
      }

      case "scale": {
        const config = block.config as { min: number; max: number };
        fieldSchema = z.number().min(config.min).max(config.max);
        if (!block.required) fieldSchema = fieldSchema.optional();
        break;
      }

      case "file": {
        fieldSchema = z.string().url("URL de fichier invalide");
        if (!block.required) fieldSchema = fieldSchema.optional();
        break;
      }

      default:
        continue;
    }

    shape[block.id] = fieldSchema;
  }

  return z.object(shape);
}
```

---

## F5 · Form Deployment & Public Rendering

### Route Structure

```typescript
// src/app/f/[formId]/page.tsx (Server Component)
import { createServerClient } from "@/integrations/supabase/server";
import { PublicFormRenderer } from "@/components/forms/public/PublicFormRenderer";
import { notFound } from "next/navigation";

export default async function PublicFormPage({ params }: { params: Promise<{ formId: string }> }) {
  const { formId } = await params;
  const supabase = createServerClient();

  const { data: form } = await supabase
    .from("forms")
    .select("id, title, description, slug, settings, form_versions!inner(schema_json)")
    .eq("slug", formId)
    .eq("status", "published")
    .eq("is_deleted", false)
    .order("version_number", { referencedTable: "form_versions", ascending: false })
    .limit(1, { referencedTable: "form_versions" })
    .single();

  if (!form) notFound();

  const latestVersion = form.form_versions[0];
  if (!latestVersion) notFound();

  return <PublicFormRenderer form={form} schemaJson={latestVersion.schema_json} />;
}
```

### PublicFormRenderer

```typescript
// src/components/forms/public/PublicFormRenderer.tsx
"use client";
import { useMemo } from "react";
import { AutoForm } from "@autoform/shadcn";
import { ZodProvider } from "@autoform/zod";
import { schemaToZod } from "@/lib/forms/schema-serializer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

type PublicFormRendererProps = {
  form: {
    id: string;
    title: string;
    description: string | null;
    settings: Record<string, unknown>;
  };
  schemaJson: { blocks: FormBlock[]; settings: Record<string, unknown> };
};

export function PublicFormRenderer({ form, schemaJson }: PublicFormRendererProps) {
  const schema = useMemo(() => schemaToZod(schemaJson.blocks), [schemaJson.blocks]);
  const provider = useMemo(() => new ZodProvider(schema), [schema]);

  async function handleSubmit(data: Record<string, unknown>) {
    const response = await fetch(`/api/forms/${form.id}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      // Show success message
      window.location.href = `/f/${form.id}/merci`;
    } else {
      const error = await response.json();
      alert(error.message || "Erreur lors de la soumission");
    }
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-navy-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gradient-alecia">
              {form.title}
            </CardTitle>
            {form.description && (
              <CardDescription className="text-muted-foreground">
                {form.description}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <AutoForm
              schema={provider}
              onSubmit={handleSubmit}
              withSubmit
            />
          </CardContent>
        </Card>
        <p className="text-center text-xs text-muted-foreground mt-8">
          Propulsé par <span className="font-semibold text-alecia-midnight">Alecia Forms</span>
        </p>
      </div>
    </div>
  );
}
```

### Submission API Route

```typescript
// src/app/api/forms/[formId]/submit/route.ts
import { createServerClient } from "@/integrations/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { schemaToZod } from "@/lib/forms/schema-serializer";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  const { formId } = await params;
  const body = await request.json();

  // 1. Verify form exists and is published
  const supabase = createServerClient();
  const { data: form } = await supabase
    .from("forms")
    .select("id, status, is_deleted")
    .eq("id", formId)
    .single();

  if (!form || form.status !== "published" || form.is_deleted) {
    return NextResponse.json({ error: "Formulaire introuvable" }, { status: 404 });
  }

  // 2. Get latest schema version
  const { data: version } = await supabase
    .from("form_versions")
    .select("id, schema_json")
    .eq("form_id", formId)
    .order("version_number", { ascending: false })
    .limit(1)
    .single();

  if (!version) {
    return NextResponse.json({ error: "Version introuvable" }, { status: 404 });
  }

  // 3. Validate with Zod
  const schema = schemaToZod(version.schema_json.blocks);
  const result = schema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Données invalides", details: result.error.flatten() },
      { status: 400 }
    );
  }

  // 4. Insert submission
  const { error } = await supabase.from("form_submissions").insert({
    form_id: formId,
    form_version_id: version.id,
    data: result.data,
    respondent_email: body.email || null,
    respondent_ip: request.headers.get("x-forwarded-for") || "unknown",
    is_complete: true,
  });

  if (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
```

---

## F6 · Submission Collection & Storage

Handled by the API route above. Additional considerations:

- **Rate limiting**: Supabase Edge Function at `/functions/v1/rate-limit` checks IP-based submit frequency (10/IP/form/hour)
- **Honeypot field**: Add a hidden `__hp` field to the public form; reject submissions where `__hp` is non-empty
- **Success page**: `/f/[formId]/merci` with customizable thank-you message from `form.settings.thankYouMessage`

---

## F7 · Submission Management

### Page: `/forms/[formId]/submissions`

- TanStack Table v8 for the data grid
- Columns: respondent_email, created_at, is_complete, with expandable row for full JSON data
- Actions: Export CSV, Delete individual submission
- Filtering: date range, completion status

### CSV Export Endpoint

```typescript
// src/app/api/forms/[formId]/export/route.ts
// Generates CSV from form_submissions, flattening JSONB data into columns
```

---

## F8 · Form Management

All CRUD operations map to TanStack Query mutations:

| Action | Method | Supabase Method |
|---|---|---|
| Create form | `useCreateForm()` | `supabase.from("forms").insert()` + initial `form_versions` row |
| Edit form | `useUpdateForm()` | `supabase.from("forms").update()` + new `form_versions` row on publish |
| Publish form | `usePublishForm()` | `supabase.from("forms").update({ status: "published" })` |
| Unpublish form | `useUnpublishForm()` | `supabase.from("forms").update({ status: "draft" })` |
| Archive form | `useArchiveForm()` | `supabase.from("forms").update({ status: "archived" })` |
| Delete form | `useDeleteForm()` | `supabase.from("forms").update({ is_deleted: true })` (soft delete) |
| Duplicate form | `useDuplicateForm()` | Copy form + latest version with new ID and slug |
| Share form (permissions) | `useShareForm()` | `supabase.from("form_permissions").insert()` |

---

## References

- [PRD — Alecia Forms MVP](../PRD-AleciaForms-MVP.md)
- [@autoform/react Documentation](../../packages/react/README.md)
- [@autoform/shadcn Documentation](../../packages/shadcn/README.md)
- [Zustand Documentation](https://zustand.docs.pmnd.rs/)
- [@dnd-kit Documentation](https://docs.dndkit.com/)
- [TanStack Query v5](https://tanstack.com/query/latest)

---

*This document is part of the Alecia Forms Technical Design Document suite. See [19-index.md](./19-index.md) for the complete index.*