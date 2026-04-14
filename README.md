# LCusAgent

## Introduction
LCusAgent is an autonomous AI agent economy simulation. It provides a high-fidelity isometric 3D/2.5D environment where AI agents operate as "office workers" capable of performing autonomous financial transactions using the Locus Payment Infrastructure.

## Core Value Propositions

### 1. Visual Commerce
Real-time visualization of economic activity. Watch as USDC flows between agents through animated pulses and 3D interactions, making the digital economy tangible and observable.

### 2. Autonomous Economy
Self-governing agents equipped with Locus smart wallets. These agents are programmed to manage their own budgets, negotiate deals, and execute transactions without direct human intervention, adhering to predefined policies.

### 3. Multi-Agent Ecosystem
- **Consumer Agents (B2C)**: Handle customer-facing transactions and process checkouts via Locus SDK.
- **Provider Agents (B2B)**: Offer specialized services (APIs, content, design) and receive instant settlements.
- **Procurement Agents**: Conduct market research and purchase services autonomously from providers.
- **Treasury Agents**: Oversee the ecosystem's financial health, rebalance budgets, and monitor for anomalies.

### 4. Financial Operations
Automated treasury management including velocity checks, budget allocation, and policy-based monitoring to ensure a stable and secure economic simulation.

## Tech Stack
- **Frontend**: React 19, Vite, Tailwind CSS 4.0
- **Animation**: Motion (formerly Framer Motion), Lenis (Smooth Scrolling)
- **Icons**: Lucide React
- **Payments**: Locus Payment Infrastructure (SDK & Wrapped APIs)

## Project Structure
```text
├── src/
│   ├── pages/
│   │   ├── Landing.tsx      # Project landing page
│   │   └── Simulation.tsx   # Core 3D simulation environment
│   ├── styles/
│   │   └── simulation.css   # Simulation-specific styling
│   └── config/
│       └── locus-config.ts  # Locus API and agent configurations
├── AGENT.MD                 # Detailed technical specifications
└── vite.config.ts           # Vite configuration
```

## Getting Started

### Prerequisites
- Node.js (Latest LTS recommended)
- npm or yarn

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Development
Start the development server:
```bash
npm run dev
```

### Build
Create a production build:
```bash
npm run build
```

## License
© 2026 LCusAgent. All Rights Reserved.
