# PayGentic

Autonomous AI agent economy simulation powered by [Locus Payment Infrastructure](https://beta.paywithlocus.com). Watch AI agents transact USDC in real-time through a 3D isometric environment.

**Live Demo**: [paygents.vercel.app](https://paygents.vercel.app/simulation)

## What It Does

PayGentic simulates an economy where AI agents autonomously buy and sell services using USDC on Base. When you trigger skills through OpenClaw (e.g. "create an agent email inbox"), the Locus API processes the payment and PayGentic visualizes the transaction in real-time — agent walks to a booth, beam animation fires, USDC coin floats up, balance updates.

### Agent Types

- **Consumer (B2C)** — Handles customer-facing checkouts
- **Provider (B2B)** — Sells services, receives instant settlement
- **Procurement** — Surveys market, buys services autonomously
- **Treasury** — Monitors budgets, rebalances, detects anomalies

### x402 Skills (Pay-per-call)

Agents can call these endpoints via Locus, each deducting USDC from the wallet:

| Skill | Endpoint | Cost |
|-------|----------|------|
| AgentMail Create Inbox | `/api/x402/agentmail-create-inbox` | ~$2.00 |
| AgentMail Send Email | `/api/x402/agentmail-send-message` | ~$0.01 |
| Laso Finance Auth | `/api/x402/laso-auth` | ~$0.001 |
| Laso Virtual Card | `/api/x402/laso-get-card` | dynamic |

Plus 50+ Wrapped API providers (OpenAI, Claude, Gemini, Brave Search, Firecrawl, etc.)

## Tech Stack

- **Frontend**: React 19 + Vite + Tailwind CSS 4
- **3D/Animation**: Three.js (react-three-fiber), Motion (framer-motion), Lenis
- **Payments**: Locus Payment Infrastructure (x402 + Wrapped APIs)
- **Deploy**: Vercel (with serverless API proxy for CORS)

## Architecture

```
Browser (React SPA)
  ├── /api/locus proxy → Locus API (beta-api.paywithlocus.com)
  ├── Polling (5s) → detect new x402/pay transactions
  └── Event → agent walks to booth → beam → USDC coin → success toast
```

Key files:
- `src/pages/Simulation.tsx` — 3D simulation with agent AI loop + event processing
- `src/config/locus-config.ts` — Locus API client, OpenClaw polling listener
- `src/lib/locus-api.ts` — Typed API helpers + x402 skill catalog
- `api/locus/index.js` — Vercel serverless proxy (bypasses CORS)

## Getting Started

```bash
pnpm install
pnpm run dev        # http://localhost:8080
pnpm run build      # tsc && vite build
```

### Environment Variables

Set in `.env.local`:

```
VITE_LOCUS_API_KEY=claw_...     # Required — get from Locus dashboard
VITE_LOCUS_ENV=beta             # beta (default) or production
```

## Deployment

### Vercel (current)

Connected to GitHub repo — auto-deploys on push to `main`.

```bash
npx vercel --prod
```

Env vars `VITE_LOCUS_API_KEY` and `VITE_LOCUS_ENV` must be set in Vercel dashboard.

### Docker

```bash
docker build --build-arg VITE_LOCUS_API_KEY=claw_... -t paygents .
docker run -p 8080:8080 paygents
```

## Team

| Name | Role |
|------|------|
| Lana | Lead Developer |
| Catur | Fullstack Developer |
| You? | Contributor |

## License

© 2026 PayGentic. All rights reserved.
