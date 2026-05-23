# 03 — Project Setup

> **Alecia Forms TDD** · Comprehensive project setup checklist and initialization guide

---

## Prerequisites

Before starting, ensure the following are available on the development machine:

| Requirement | Version | Verification Command |
|---|---|---|
| Node.js | 20.9+ | `node --version` |
| npm | 10+ | `npm --version` |
| Git | 2.40+ | `git --version` |
| Docker | 24+ | `docker --version` |
| Supabase CLI | Latest | `supabase --version` |

---

## Step 1: Create the App Skeleton

From the monorepo root, scaffold `apps/forms` as a Next.js 16 application:

```bash
# Navigate to the monorepo root
cd /path/to/autoform-monorepo

# Create the Next.js 16 app (use the canary channel for v16)
npx create-next-app@latest apps/forms \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --use-npm \
  --turbopack

# Verify the Next.js version
cd apps/forms && npx next --version
# Should output 16.x
```

If the above pull next 15, manually upgrade:

```bash
cd apps/forms
npm install next@latest react@latest react-dom@latest
```

---

## Step 2: Wire Workspace Dependencies

Edit `apps/forms/package.json` to add monorepo workspace dependencies:

```json
{
  "name": "@alecia/forms",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "test": "vitest",
    "test:e2e": "playwright test"
  },
  "dependencies": {
    "@autoform/core": "workspace:*",
    "@autoform/react": "workspace:*",
    "@autoform/shadcn": "workspace:*",
    "@autoform/zod": "workspace:*",
    "@dnd-kit/core": "^6.3.1",
    "@dnd-kit/sortable": "^10.0.0",
    "@dnd-kit/utilities": "^3.2.2",
    "@supabase/supabase-js": "^2.49.0",
    "@tanstack/react-query": "^5.0.0",
    "@tanstack/react-table": "^8.20.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "framer-motion": "^12.0.0",
    "lucide-react": "^0.469.0",
    "next": "^16.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "tailwind-merge": "^3.0.0",
    "zod": "^3.24.0",
    "zustand": "^5.0.0"
  },
  "devDependencies": {
    "@autoform/eslint-config": "workspace:*",
    "@autoform/typescript-config": "workspace:*",
    "@playwright/test": "^1.50.0",
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "typescript": "^5.7.0",
    "vitest": "^3.0.0"
  }
}
```

Install dependencies:

```bash
# From monorepo root
npm install
```

---

## Step 3: Configure Turborepo

Edit `turbo.json` at the monorepo root to include the new app:

```jsonc
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "type-check": {
      "dependsOn": ["^build"]
    },
    "test": {
      "dependsOn": ["^build"]
    }
  }
}
```

No changes needed — the existing `turbo.json` already defines the task pipeline, and Turborepo will automatically detect `apps/forms` as a workspace member.

---

## Step 4: Configure TypeScript

Copy or extend the monorepo TypeScript config:

```jsonc
// apps/forms/tsconfig.json
{
  "extends": "@autoform/typescript-config/nextjs.json",
  "compilerOptions": {
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

---

## Step 5: Configure Tailwind CSS v4

Create `apps/forms/src/app/globals.css`:

```css
@import "tailwindcss";

/* ==========================
   Alecia Design System Tokens
   ========================== */

:root {
  /* Core Palette */
  --alecia-blue-midnight: #061a40;
  --alecia-blue-corporate: #163e64;
  --alecia-blue-mid: #4370a7;
  --alecia-blue-light: #749ac7;
  --alecia-blue-pale: #bfd7ea;
  --alecia-blue-ice: #e3f2fd;
  --alecia-red-accent: #b80c09;
  --alecia-grey-titanium: #6f7a8f;
  --alecia-grey-steel: #aab1be;
  --alecia-grey-chrome: #c8ccd5;
  --alecia-grey-cloud: #e6e8ec;
  --alecia-off-white: #fafafc;

  /* Semantic Mapping — Light Mode */
  --background: var(--alecia-off-white);
  --background-secondary: var(--alecia-grey-cloud);
  --foreground: var(--alecia-blue-midnight);
  --foreground-muted: #334155;
  --foreground-faint: #64748b;
  --accent: var(--alecia-blue-midnight);
  --accent-light: var(--alecia-blue-light);
  --border: var(--alecia-grey-chrome);
  --input: var(--alecia-grey-cloud);
  --ring: var(--alecia-blue-mid);
  --card: #ffffff;
  --card-foreground: var(--alecia-blue-midnight);
  --primary: var(--alecia-blue-midnight);
  --primary-foreground: var(--alecia-off-white);
  --secondary: var(--alecia-grey-cloud);
  --secondary-foreground: var(--alecia-blue-midnight);
  --muted: var(--alecia-grey-cloud);
  --muted-foreground: var(--alecia-grey-titanium);
  --destructive: var(--alecia-red-accent);
  --destructive-foreground: var(--alecia-off-white);
  --radius: 0.625rem;
}

.dark {
  --background: var(--alecia-blue-midnight);
  --background-secondary: var(--alecia-blue-corporate);
  --foreground: var(--alecia-off-white);
  --foreground-muted: var(--alecia-grey-chrome);
  --accent: var(--alecia-blue-mid);
  --accent-light: var(--alecia-blue-light);
  --border: var(--alecia-blue-mid);
  --input: var(--alecia-blue-corporate);
  --ring: var(--alecia-blue-light);
  --card: var(--alecia-blue-midnight);
  --card-foreground: var(--alecia-off-white);
  --primary: var(--alecia-off-white);
  --primary-foreground: var(--alecia-blue-midnight);
  --muted: var(--alecia-blue-corporate);
  --muted-foreground: var(--alecia-grey-chrome);
  --destructive: var(--alecia-red-accent);
  --destructive-foreground: var(--alecia-off-white);
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-bierstadt), sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, monospace;

  --color-alecia-midnight: var(--alecia-blue-midnight);
  --color-alecia-corporate: var(--alecia-blue-corporate);
  --color-alecia-mid-blue: var(--alecia-blue-mid);
  --color-alecia-light-blue: var(--alecia-blue-light);
  --color-alecia-sky: var(--alecia-blue-pale);
  --color-alecia-ice: var(--alecia-blue-ice);
  --color-alecia-red: var(--alecia-red-accent);
  --color-alecia-titanium: var(--alecia-grey-titanium);
  --color-alecia-steel: var(--alecia-grey-steel);
  --color-alecia-chrome: var(--alecia-grey-chrome);
  --color-alecia-cloud: var(--alecia-grey-cloud);

  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
}

/* Navy Shadows */
.shadow-navy-sm { box-shadow: 0 1px 2px 0 rgba(6, 26, 64, 0.05); }
.shadow-navy-md { box-shadow: 0 4px 6px -1px rgba(6, 26, 64, 0.1), 0 2px 4px -1px rgba(6, 26, 64, 0.06); }
.shadow-navy-lg { box-shadow: 0 10px 15px -3px rgba(6, 26, 64, 0.1), 0 4px 6px -2px rgba(6, 26, 64, 0.05); }
.shadow-navy-xl { box-shadow: 0 20px 25px -5px rgba(6, 26, 64, 0.1), 0 10px 10px -5px rgba(6, 26, 64, 0.04); }

/* Card Hover */
.card-hover {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform, box-shadow, border-color;
}
.card-hover:hover {
  transform: translateY(-6px);
  box-shadow: 0 16px 48px rgba(6, 26, 64, 0.15);
  border-color: rgba(6, 26, 64, 0.4);
}
.dark .card-hover:hover {
  box-shadow: 0 16px 48px rgba(6, 26, 64, 0.50);
  border-color: var(--accent);
}

/* Typographic Gradient */
.text-gradient-alecia {
  background: linear-gradient(135deg, #061a40 0%, #163e64 40%, #4370a7 75%, #749ac7 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  padding-bottom: 0.15em;
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## Step 6: Configure Next.js 16

Create `apps/forms/next.config.mjs`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.js 16 uses Turbopack by default for dev
  // Custom webpack config is not needed (Turbopack handles it)
  
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },

  // Experimental features for Next.js 16
  experimental: {
    // React Compiler is enabled by default in Next.js 16
    // use cache is available without experimental flag
  },

  // Redirect root to dashboard when authenticated
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dashboard',
        permanent: false,
        has: [
          {
            type: 'cookie',
            key: 'sb-ehpubmtfnirzqztrlvph-auth-token',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

---

## Step 7: Set Up Supabase Client

Create `apps/forms/src/integrations/supabase/client.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://ehpubmtfnirzqztrlvph.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVocHVibXRmbmlyenF6dHJsdnBoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzMzQyMDksImV4cCI6MjA5NDkxMDIwOX0.VKSxqm2jZ0COeyZPXzsbTHDxa5TCroaQu-j4WfRD6IA";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    cookieOptions: {
      domain: '.alecia.fr',
    },
  },
});
```

Create `apps/forms/src/integrations/supabase/server.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const SUPABASE_URL = "https://ehpubmtfnirzqztrlvph.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export function createServerClient() {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function createAuthenticatedClient() {
  const cookieStore = await cookies();
  const token = cookieStore.get('sb-ehpubmtfnirzqztrlvph-auth-token');
  
  const client = createClient(SUPABASE_URL, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  if (token) {
    client.auth.setSession({
      access_token: token.value,
      refresh_token: '',
    });
  }

  return client;
}
```

Create `apps/forms/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://ehpubmtfnirzqztrlvph.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVocHVibXRmbmlyenF6dHJsdnBoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzMzQyMDksImV4cCI6MjA5NDkxMDIwOX0.VKSxqm2jZ0COeyZPXzsbTHDxa5TCroaQu-j4WfRD6IA
SUPABASE_SERVICE_ROLE_KEY=<set-on-coolify-environment>
NEXT_PUBLIC_APP_URL=https://forms.alecia.fr
```

---

## Step 8: Set Up shadcn/ui

Initialize shadcn/ui in the new app:

```bash
cd apps/forms
npx shadcn@latest init

# When prompted:
# Style: New York
# Base color: Zinc (we'll override with Alecia tokens)
# CSS variables: Yes
# Tailwind CSS: v4
# Components alias: @/components
# Utils alias: @/lib/utils
```

Then install the required components:

```bash
npx shadcn@latest add button card input label select textarea dialog sheet dropdown-menu toast badge separator skeleton switch checkbox radio-group calendar popover command table tabs avatar alert-dialog tooltip scroll-area
```

---

## Step 9: Create Directory Structure

```bash
cd apps/forms/src

# Create directory structure
mkdir -p app/(auth)/login
mkdir -p app/(dashboard)/dashboard
mkdir -p app/(dashboard)/forms/new
mkdir -p app/(dashboard)/forms/[formId]/edit
mkdir -p app/(dashboard)/forms/[formId]/submissions
mkdir -p app/(dashboard)/forms/[formId]/settings
mkdir -p app/f/[formId]
mkdir -p app/api/forms/[formId]/submit

mkdir -p components/auth
mkdir -p components/forms/builder
mkdir -p components/forms/dashboard
mkdir -p components/forms/public
mkdir -p components/forms/shared

mkdir -p lib/supabase
mkdir -p lib/forms
mkdir -p lib/utils

mkdir -p stores
mkdir -p types
mkdir -p hooks

# Create placeholder files
touch app/(auth)/login/page.tsx
touch app/(auth)/layout.tsx
touch app/(dashboard)/layout.tsx
touch app/(dashboard)/dashboard/page.tsx
touch app/(dashboard)/forms/new/page.tsx
touch app/(dashboard)/forms/[formId]/edit/page.tsx
touch app/(dashboard)/forms/[formId]/submissions/page.tsx
touch app/(dashboard)/forms/[formId]/settings/page.tsx
touch app/f/[formId]/page.tsx
touch app/api/forms/[formId]/submit/route.ts

touch components/forms/builder/FormBuilder.tsx
touch components/forms/builder/BlockPalette.tsx
touch components/forms/builder/BlockCard.tsx
touch components/forms/builder/BlockConfigPanel.tsx
touch components/forms/builder/LivePreview.tsx
touch components/forms/dashboard/FormCard.tsx
touch components/forms/dashboard/FormList.tsx
touch components/forms/dashboard/SubmissionTable.tsx
touch components/forms/public/PublicFormRenderer.tsx
touch components/forms/shared/block-types.ts
touch components/forms/shared/schema-serializer.ts

touch lib/supabase/client.ts
touch lib/supabase/server.ts
touch lib/forms/schema-to-zod.ts
touch lib/forms/types.ts

touch stores/form-builder-store.ts
touch stores/ui-store.ts

touch types/forms.ts
touch types/blocks.ts

touch middleware.ts
```

---

## Step 10: Configure Vitest

Create `apps/forms/vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

Create `apps/forms/src/test-setup.ts`:

```typescript
import '@testing-library/jest-dom';
```

---

## Step 11: Configure Playwright

Create `apps/forms/playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3001',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 14'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3001',
    reuseExistingServer: !process.env.CI,
  },
});
```

Create `apps/forms/e2e/` directory and add a smoke test:

```typescript
// e2e/smoke.spec.ts
import { test, expect } from '@playwright/test';

test('public form page loads', async ({ page }) => {
  // This test will be filled in once forms exist
  await page.goto('/');
  await expect(page.locator('body')).toBeVisible();
});
```

---

## Step 12: Configure ESLint

Create `apps/forms/.eslintrc.json`:

```json
{
  "extends": ["@autoform/eslint-config/next.js"]
}
```

---

## Step 13: Set Up Coolify Deployment

On the Coolify dashboard:

1. **Add new resource** → Application → From Git Repository
2. **Repository**: Point to the Gitea monorepo URL
3. **Build pack**: Nixpacks (auto-detects Next.js)
4. **Build command**: `cd apps/forms && npm run build`
5. **Start command**: `cd apps/forms && npm run start`
6. **Port**: 3001 (separate from `apps/website` on 3000)
7. **Environment variables**: Copy `.env.local` values as Coolify env vars
8. **Domain**: `forms.alecia.fr` → Enable Let's Encrypt SSL
9. **Webhook**: Copy the deployment webhook URL → Add to Gitea repository webhooks (push to `main`)

---

## Step 14: Verify Workspace Integrity

```bash
# From monorepo root
npx turbo build --filter=@alecia/forms
npx turbo type-check --filter=@alecia/forms
npx turbo lint --filter=@alecia/forms
```

All three should pass with zero errors before proceeding to feature development.

---

## Step 15: Initial Git Commit

```bash
cd apps/forms
git add .
git commit -m "feat: scaffold apps/forms — Next.js 16 + Alecia Design System + @autoform/* workspace deps"
git push origin main
```

Pushing to `main` on Gitea will trigger the Coolify webhook and deploy the initial scaffold to `forms.alecia.fr`.

---

## Post-Setup Verification Checklist

- [ ] `npm run dev` starts without errors on `localhost:3001`
- [ ] `npm run build` completes successfully
- [ ] `npm run type-check` passes with zero errors
- [ ] `npm run lint` passes
- [ ] Supabase client connects (check in browser console)
- [ ] Coolify deployment succeeds (green status at `forms.alecia.fr`)
- [ ] `https://forms.alecia.fr` returns a Next.js page (even if it's just a placeholder)
- [ ] Turborepo cache correctly accelerates second build (`>>> FULL TURBO` in output)
- [ ] `@autoform/*` packages are importable from `apps/forms/src`

---

## References

- [Next.js 16 Upgrade Guide](https://nextjs.org/docs/app/guides/upgrading/version-16)
- [Turborepo Monorepo Setup](https://turbo.build/repo/docs)
- [Supabase Auth SSO](https://supabase.com/docs/guides/auth)
- [Coolify Deployment Docs](https://coolify.io/docs)
- [shadcn/ui Installation](https://ui.shadcn.com/docs/installation/next)

---

*This document is part of the Alecia Forms Technical Design Document suite. See [19-index.md](./19-index.md) for the complete index.*