# Tech Stack

- Monorepo managed with **npm workspaces** and **Turborepo**.
- Main app lives in **`apps/web`**.
- Frontend framework is **Next.js 15** using the **App Router** (`app/` directory).
- UI is built with **React 19** and **TypeScript**.
- Styling uses **Tailwind CSS v4**.
- Forms are powered by the internal **`@autoform/*`** packages from `packages/`.
- The repo includes multiple UI adapters: **shadcn/ui, MUI, Ant Design-style adapter, Mantine, and Chakra UI**.
- Schema validation libraries available in the repo are **Zod, Yup, and Joi**.
- Shared package-level standards come from the internal **`@autoform/eslint-config`** and **`@autoform/typescript-config`** packages.

# Library Rules

- Use **Next.js App Router** for application structure: routes, layouts, metadata, and page entrypoints belong in `apps/web/app`.
- Use **React + TypeScript** for all components and app logic. Do not add plain JavaScript files for new app code.
- Use **Tailwind CSS** for layout, spacing, sizing, and one-off visual styling.
- Use **shadcn/ui** as the default choice for new reusable app UI when a neutral component library is needed.
- Use **MUI, Mantine, Chakra, or Ant-based components** only when working on examples, demos, or framework-specific adapter showcases. Do not mix multiple UI systems in the same feature unless the feature is explicitly a comparison/demo page.
- Use **`@autoform/*` packages** whenever building or demonstrating schema-driven forms. Choose the adapter that matches the UI library used on that page.
- Prefer **Zod** for new schemas and examples. Use **Yup** or **Joi** only when maintaining or demonstrating those specific integrations.
- Put app-specific reusable components in **`apps/web/components`**.
- Put shared framework-agnostic logic in the appropriate **`packages/*`** workspace package instead of duplicating it in the app.
- Reuse the repo's existing **ESLint** and **TypeScript config** packages instead of introducing new parallel linting or TS setups.
