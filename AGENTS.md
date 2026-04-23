# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Commands

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start
```

There are no linting scripts or test suites configured.

## Architecture

**Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4

### Routing

Uses Next.js App Router with two route groups:
- `app/(auth)/` — Login, register, pre-register pages. Minimal layout, no header.
- `app/(pages)/` — Protected pages (dashboard, companies, teams). Wraps all routes with the `Header` component.

Dynamic route: `app/(pages)/companies/[id]/` for individual company detail pages.

### API Layer

All backend communication goes through a centralized Axios instance at [services/api.ts](services/api.ts):
- Base URL from `NEXT_PUBLIC_API_JAVA` env var (Java backend)
- Request interceptor automatically attaches the Bearer token read from cookies
- Response interceptor redirects to `/login` on 401

Auth tokens are stored as HTTP-only cookies, managed via Next.js Server Actions in [services/cookies.ts](services/cookies.ts). The `verifyConnected()` helper in [app/utils/verifyConnected.ts](app/utils/verifyConnected.ts) is used to gate protected pages.

### State & Data Fetching

No global state library. Pages fetch data in `useEffect` hooks and hold it in local `useState`. `useMemo` is used for derived/filtered data (e.g., company search filtering).

### Components

- `app/components/` — Feature components (StatCard, MovementCard, CompanyCard, etc.)
- `app/components/ui/` — Base UI primitives (Input, Label, CustomSelect)
- Each component lives in its own directory with a `.tsx` file

### Styling

Tailwind CSS v4 via PostCSS. Custom design tokens (color palette, font) are defined as CSS variables in [app/globals.css](app/globals.css). The font is **Plus Jakarta Sans**. Avoid hardcoding hex colors — use the CSS variables defined in `globals.css`.

### TypeScript

Type definitions are centralized in `app/types/`. Path alias `@/*` maps to the project root.

### Language

The UI is in Brazilian Portuguese. Keep labels, messages, and user-facing strings in PT-BR.