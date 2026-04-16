# AGENTS.md

## Commands

- `pnpm install` — install deps (uses pnpm, not npm/yarn)
- `pnpm run dev` — dev server on port 3000
- `pnpm run build` — runs `tsc && vite build` (typecheck then build)

No test runner, linter, or formatter is configured.

## Architecture

React 19 + Vite + Tailwind CSS 4 + Three.js (react-three-fiber) SPA. No backend — all Locus API calls go directly from the browser.

- **Entry**: `src/main.tsx` → `src/App.tsx` (react-router: `/` → Landing, `/simulation` → Simulation)
- **Pages**: `src/pages/Landing.tsx`, `src/pages/Simulation.tsx`
- **Config**: `src/config/locus-config.ts` (API client, env vars, agent profiles, endpoint map), `src/config/skill-metadata.ts` (Locus docs skill registry for UI)
- **Lib**: `src/lib/locus-api.ts` (typed API helpers — `fetchBalance`, `fetchTransactions`, `callX402Skill`, plus the x402 skill catalog)
- **Styles**: `src/styles/index.css`, `src/styles/simulation.css`
- **Path alias**: `@/*` → `src/*` (configured in both `tsconfig.json` and `vite.config.ts`)
- `src/components/` — currently empty

## Environment Variables

The app reads these Vite env vars (set in `.env.local` or at deploy time):

- `VITE_LOCUS_API_KEY` — Locus API key (`claw_...`). Required for all Locus API calls.
- `VITE_LOCUS_ENV` — `beta` (default) or `production`
- `VITE_LOCUS_BASE_URL` — overrides the API base URL

## Locus Integration

The skill catalog has migrated from wrapped APIs to **x402 pay-per-use endpoints**. The hardcoded catalog lives in `src/lib/locus-api.ts` (`X402_SKILLS` array) and `src/config/locus-config.ts` (`wrappedApis`). Current skills: AgentMail (inbox, send, list) and Laso Finance (auth, virtual card).

Transaction events currently use a mock listener via `window.triggerMockTransaction` — see `startOpenClawListener` in `locus-config.ts`.

## Spec Docs

- `AGENT.MD` — product design spec (agent behaviors, UI/UX, transaction flows). Not a developer instruction file.
- `OPENCLAW_SETUP.md` — Locus PaaS deployment (requires port 8080, `linux/arm64`, health check on `/`)
- `SKILL_ARCHITECTURE.md` — how the simulation maps to Locus Skills and x402 APIs

## Notes

- `push.sh` — convenience script: auto-commits per-file with conventional commit types, then pushes.
- Tailwind 4 uses the Vite plugin (`@tailwindcss/vite`), not a `tailwind.config.*` file.
- `vite.config.ts` uses `path`/`__dirname` but `@types/node` is not installed — this causes harmless LSP errors.
