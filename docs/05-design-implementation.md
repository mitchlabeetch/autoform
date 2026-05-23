# 05 — Design Implementation

> **Alecia Forms TDD** · Design system and UI/UX implementation details

---

## Design Philosophy: Sovereign Premiumism

Alecia Forms inherits the full Alecia Design System. Every pixel must convey **transactional trust, precision, and modern polish** appropriate for M&A advisory. The form builder and public forms are the primary user-facing surfaces — they must feel premium without being ostentatious.

---

## Typography Implementation

### Font Loading

```typescript
// src/app/layout.tsx
import { Bierstadt, Playfair_Display, Outfit } from "next/font/google";

const bierstadt = Bierstadt({
  subsets: ["latin"],
  variable: "--font-bierstadt",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${bierstadt.variable} ${playfair.variable} ${outfit.variable}`}>
      <body className="font-sans antialiased bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
```

### Typography Scale Application

| Context | Tailwind Classes | Font Family |
|---|---|---|
| Page Title (H1) | `text-4xl md:text-5xl font-bold` font-serif | Playfair Display |
| Section Title (H2) | `text-2xl md:text-3xl font-semibold` | Bierstadt |
| Card Title (H3) | `text-xl font-medium` | Bierstadt |
| Sub-header (H4) | `text-lg font-medium` | Bierstadt |
| Body (P) | `text-base` | Bierstadt |
| KPIs / Numbers | `text-3xl font-semibold font-outfit tabular-nums` | Outfit |
| Meta Description | `text-sm text-muted-foreground` | Bierstadt |
| Fine Print | `text-xs text-muted-foreground/80` | Bierstadt |

---

## Color System Implementation

All colors reference CSS custom properties defined in `globals.css` (see 03-project-setup.md). **Never hardcode hex values** in components.

### Semantic Color Usage in Forms

```typescript
// NEVER do this:
<div className="bg-[#061a40] text-white">

// ALWAYS do this:
<div className="bg-primary text-primary-foreground">

// For form-specific accents:
<div className="bg-accent text-accent-foreground border border-accent/20">

// For destructuve actions:
<button className="bg-destructive text-destructive-foreground hover:bg-destructive/90">

// For muted info:
<p className="text-muted-foreground">
```

### Dark Mode Toggle

```typescript
// src/components/forms/shared/theme-toggle.tsx
"use client";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const stored = localStorage.getItem("alecia-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setTheme(stored ?? (prefersDark ? "dark" : "light"));
  }, []);

  function toggle() {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("alecia-theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  }

  return (
    <button onClick={toggle} className="p-2 rounded-lg hover:bg-secondary" aria-label="Basculer le thème">
      {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
    </button>
  );
}
```

---

## Component Blueprints

### Builder Block Card

Every block in the builder canvas follows this visual pattern:

```
┌──────────────────────────────────────────────────────────────┐
│  [Type Icon]  Nom complet                          [⋮] [×]   │
│  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  │
│  Champ texte · Requis · Maximum 255 caractères               │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  Entrez votre nom...                                    │ │
│  └──────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘

States:
- Default: bg-card, border-transparent, shadow-navy-sm
- Hover: border-border, hover:shadow-navy-md
- Selected: border-accent (3px), shadow-navy-md, bg-accent/5
- Drag overlay: transform rotate(3deg) scale(1.03), shadow-navy-lg
```

```typescript
// Block card states in Tailwind:
const blockCardClasses = cn(
  "rounded-xl border p-4 transition-all duration-200 cursor-pointer",
  isSelected
    ? "border-accent border-[3px] shadow-navy-md bg-accent/5"
    : "border-transparent hover:border-border hover:shadow-navy-md",
  "group"
);
```

### Block Palette Item

```
┌────────────────────────────┐
│  [Icon]  Champ texte       │
│          Texte court ou long│
└────────────────────────────┘

Hover: bg-secondary, shadow-navy-sm, translate-y-[-2px]
```

```typescript
// src/components/forms/builder/BlockPalette.tsx
"use client";
import { BLOCK_TYPE_CONFIG, type BlockType } from "@/types/blocks";
import { useFormBuilderStore } from "@/stores/form-builder-store";
import { Type, Mail, Hash, Phone, ChevronDown, CheckSquare, CircleDot, Calendar, ToggleLeft, BarChart3, Paperclip, AlignLeft } from "lucide-react";

const iconMap: Record<BlockType, React.ComponentType<{ className?: string }>> = {
  text: Type, email: Mail, number: Hash, phone: Phone,
  select: ChevronDown, multiselect: CheckSquare, radio: CircleDot, date: Calendar,
  boolean: ToggleLeft, scale: BarChart3, file: Paperclip, description: AlignLeft,
};

export function BlockPalette() {
  const addBlock = useFormBuilderStore((s) => s.addBlock);

  return (
    <aside className="w-[280px] border-r bg-secondary/30 p-4 overflow-y-auto">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
        Types de champ
      </h2>
      <div className="space-y-2">
        {(Object.entries(BLOCK_TYPE_CONFIG) as [BlockType, typeof BLOCK_TYPE_CONFIG[BlockType]][]).map(
          ([type, config]) => {
            const Icon = iconMap[type];
            return (
              <button
                key={type}
                onClick={() => addBlock(type)}
                className="w-full flex items-center gap-3 p-3 rounded-lg border border-transparent
                           hover:bg-secondary hover:border-border hover:shadow-navy-sm
                           hover:-translate-y-0.5 transition-all duration-200 text-left"
              >
                <Icon className="h-5 w-5 text-accent shrink-0" />
                <div>
                  <p className="text-sm font-medium">{config.label}</p>
                  <p className="text-xs text-muted-foreground">{config.description}</p>
                </div>
              </button>
            );
          }
        )}
      </div>
    </aside>
  );
}
```

### Public Form Page Layout

The public form page is the most critical UX surface. It must feel **trustworthy, calm, and effortless**.

```
┌────────────────────────────────────────────────────────────────────┐
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │                                                              │ │
│  │  [Alecia Logo — 32px]                                       │ │
│  │                                                              │ │
│  │  Formulaire de Due Diligence                                │ │
│  │  Veuillez remplir les informations suivantes.                │ │
│  │                                                              │ │
│  │  ─────────────────────────────────────────────────────────  │ │
│  │                                                              │ │
│  │  Nom complet *                                               │ │
│  │  [__________________________________________________________] │ │
│  │  Entrez votre nom complet                                    │ │
│  │                                                              │ │
│  │  Adresse email professionnelle *                             │ │
│  │  [__________________________________________________________] │ │
│  │                                                              │ │
│  │  Secteur d'activité                                         │ │
│  │  [▼ Sélectionnez une option                              ] │ │
│  │                                                              │ │
│  │  Niveau de satisfaction *                                    │ │
│  │  ○ 1  ○ 2  ○ 3  ○ 4  ○ 5                                   │ │
│  │  Très insatisfait               Très satisfait              │ │
│  │                                                              │ │
│  │  ─────────────────────────────────────────────────────────  │ │
│  │                                                              │ │
│  │  [        Soumettre         ]                                │ │
│  │                                                              │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  Propulsé par Alecia Forms                                        │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

Key design rules for public forms:
- Max width `max-w-2xl` (672px) — keeps line length readable
- `Card` wrapper with `shadow-navy-lg`
- Section dividers: `Separator` component between logical groups
- Submit button uses `.btn-gold` class (metallic blue gradient)
- Footer: `text-xs text-muted-foreground` centered, "Propulsé par Alecia Forms"
- Background: `bg-background` (Off White in light, Midnight Blue in dark)

### Dashboard Card Grid

```
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  Formulaire NDA   │  │  Due Diligence   │  │  Client Intake   │
│  Brouillon        │  │  Publié           │  │  Archivé         │
│                   │  │                   │  │                   │
│  12 réponses      │  │  47 réponses      │  │  3 réponses      │
│  Mis à jour hier  │  │  Mis à jour 3j    │  │  Mis à jour 2m   │
│                   │  │                   │  │                   │
│  [⋮]              │  │  [⋮]              │  │  [⋮]              │
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

Cards use `card-hover` class for the Alecia 6px float + navy shadow interaction.

---

## Motion & Animation

### Framer Motion Patterns

All animations respect `prefers-reduced-motion`.

```typescript
// src/lib/animations.ts
import type { Variants } from "framer-motion";

export const useReducedMotion = () => {
  const { reducedMotion } = useMotionPreferences();
  return reducedMotion;
};

// Block enter animation
export const blockEnter: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 25 } },
  exit: { opacity: 0, y: -10, scale: 0.95, transition: { duration: 0.15 } },
};

// Card hover effect (complements CSS .card-hover for non-Framer contexts)
export const cardHover = {
  rest: { y: 0, boxShadow: "0 1px 2px 0 rgba(6, 26, 64, 0.05)" },
  hover: { y: -6, boxShadow: "0 16px 48px rgba(6, 26, 64, 0.15)", transition: { type: "spring", stiffness: 400, damping: 30 } },
};

// Sidebar panel slide
export const panelSlide: Variants = {
  closed: { x: 360, opacity: 0 },
  open: { x: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 30 } },
};

// Page transition
export const pageTransition: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};
```

### Drag Interaction Spec

Per Alecia Design System Section 5.5:
- **Activation**: 150ms delay OR 5px pointer displacement
- **Drag overlay**: Clone of block card rotated 3°, scaled 1.03, shadow-navy-lg
- **Drop zone**: Highlighted with `border-2 border-accent` + `bg-accent/10`
- **Cancel**: Escape key or pointer leaves container → snap back with spring animation

```typescript
// Drag overlay component
<DragOverlay>
  {draggedBlock && (
    <div className="rotate-[3deg] scale-[1.03] shadow-navy-lg rounded-xl bg-card border-accent border-2 p-4 opacity-90">
      <BlockCard block={draggedBlock} isSelected={false} onSelect={() => {}} />
    </div>
  )}
</DragOverlay>
```

---

## Accessibility (WCAG 2.1 AA)

### Focus Management

```css
/* Already in globals.css — reiterating for emphasis */
*:focus-visible {
  outline: 3px solid var(--alecia-blue-mid);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}
.dark *:focus-visible {
  outline-color: var(--alecia-blue-light);
  box-shadow: 0 0 0 4px rgba(116, 154, 199, 0.3);
}
```

### Skip Link

```typescript
// Every page must include:
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-primary focus:text-primary-foreground focus:px-6 focus:py-3 focus:rounded-lg focus:shadow-2xl"
>
  Aller au contenu principal
</a>
```

### Screen Reader Announcements

```typescript
// src/components/forms/shared/ScreenReaderAnnouncer.tsx
export function ScreenReaderAnnouncer({ message }: { message: string }) {
  return (
    <div className="sr-only" aria-live="assertive" aria-atomic="true">
      {message}
    </div>
  );
}

// Usage in builder:
// When block is added: <ScreenReaderAnnouncer message="Champ texte ajouté" />
// When block is deleted: <ScreenReaderAnnouncer message="Champ supprimé" />
// When block is reordered: <ScreenReaderAnnouncer message="Champ déplacé en position 3" />
```

### Keyboard Navigation in Builder

| Action | Key |
|---|---|
| Select next block | `ArrowDown` |
| Select previous block | `ArrowUp` |
| Move selected block up | `Ctrl + ArrowUp` |
| Move selected block down | `Ctrl + ArrowDown` |
| Delete selected block | `Delete` / `Backspace` |
| Open block config | `Enter` |
| Close block config | `Escape` |
| Add new block | `Ctrl + N` |

---

## Responsive Breakpoints

| Breakpoint | Width | Layout |
|---|---|---|
| Mobile | < 768px | Single column; palette becomes bottom sheet; config panel becomes modal |
| Tablet | 768px–1024px | Palette collapses to icons; config panel slides over |
| Desktop | > 1024px | Full 3-panel layout (280px + flex + 360px) |

### Mobile Builder Adaptation

On mobile (< 768px), the builder switches to a simplified layout:

1. **Palette**: Horizontal scrollable strip of icon-only buttons at the top
2. **Canvas**: Full-width vertical list of blocks
3. **Config**: Bottom sheet (ActionSheet pattern) that slides up when a block is selected
4. **Preview**: Full-screen overlay with close button

```typescript
// Responsive layout detection
const isMobile = useMediaQuery("(max-width: 768px)");

// Conditional rendering
{isMobile ? <MobileBlockPalette /> : <BlockPalette />}
{isMobile ? (
  <ActionSheet open={!!selectedBlockId} onClose={() => selectBlock(null)}>
    <BlockConfigPanel blockId={selectedBlockId} />
  </ActionSheet>
) : (
  selectedBlockId && <BlockConfigPanel blockId={selectedBlockId} />
)}
```

---

## Print Styles

Public forms support clean printing for PDF export:

```css
@media print {
  body { background: white !important; color: black !important; }
  aside, nav, header nav, footer, button, .block-palette,
  .block-config-panel, .preview-toggle { display: none !important; }
  main, .flex-1 { width: 100% !important; max-width: 100% !important; padding: 0 !important; }
  * { box-shadow: none !important; text-shadow: none !important; }
  h1, h2, h3 { page-break-after: avoid !important; page-break-inside: avoid !important; }
}
```

---

## Icon Mapping

Every block type has a consistent Lucide icon:

| Block Type | Lucide Icon | Accessibility Label |
|---|---|---|
| text | `Type` | "Champ texte" |
| email | `Mail` | "Courriel" |
| number | `Hash` | "Numéro" |
| phone | `Phone` | "Téléphone" |
| select | `ChevronDown` | "Menu déroulant" |
| multiselect | `CheckSquare` | "Choix multiple" |
| radio | `CircleDot` | "Choix unique" |
| date | `Calendar` | "Date" |
| boolean | `ToggleLeft` | "Oui / Non" |
| scale | `BarChart3` | "Échelle" |
| file | `Paperclip` | "Fichier" |
| description | `AlignLeft` | "Texte descriptif" |

Every icon usage includes either:
- `aria-hidden="true"` if purely decorative (e.g., block palette icons alongside text labels)
- An `aria-label` if it's the only indicator (e.g., icon-only mobile palette buttons)

---

## References

- [Alecia Design System Specification](../AI_RULES.md) (Sections 1-9)
- [PRD — Alecia Forms MVP](../PRD-AleciaForms-MVP.md)
- [Framer Motion Documentation](https://www.framer.com/motion/)
- [WCAG 2.1 AA Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [@dnd-kit Accessibility Guide](https://docs.dndkit.com/introduction/getting-started#accessibility)

---

*This document is part of the Alecia Forms Technical Design Document suite. See [19-index.md](./19-index.md) for the complete index.*