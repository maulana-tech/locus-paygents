# OpenClaw (Locus) Deployment Guide

This document outlines the steps to set up and deploy the **PayGentic** simulation to the **OpenClaw (Locus)** platform.

## 1. Prerequisites

Before you begin, ensure you have:
- A Locus API Key (starts with `claw_...`).
- A connected GitHub account (if deploying from source) via [Integrations](https://beta.buildwithlocus.com/integrations).
- Sufficient credits in your Locus workspace ($1.00 minimum for new accounts).

## 2. Infrastructure Requirements

OpenClaw has strict requirements for containerized services:
- **Port**: The application MUST listen on port `8080`.
- **Architecture**: Containers must be compatible with `linux/arm64` (AWS Graviton).
- **Health Checks**: The app must respond with HTTP 200 on `/` (default).

## 3. Configuration Setup

### 3.1 Vite Config (`vite.config.ts`)
Ensure your Vite configuration handles the OpenClaw port and host:

```typescript
export default defineConfig({
  // ... existing config
  server: {
    port: 8080,
    host: true, // Required for container access
  },
  preview: {
    port: 8080,
    host: true,
  }
});
```

### 3.2 Locus Configuration (`.locusbuild`)
Create a `.locusbuild` file in your root directory to automate the setup:

```json
{
  "services": {
    "paygent-sim": {
      "path": ".",
      "port": 8080,
      "healthCheck": "/",
      "env": {
        "NODE_ENV": "production",
        "LOCUS_API_KEY": "${{LOCUS_API_KEY}}"
      }
    }
  }
}
```

## 4. Deployment Workflow

### Step 1: Authentication
Obtain your JWT token using your API key:
```bash
TOKEN=$(curl -s -X POST https://beta-api.buildwithlocus.com/v1/auth/token \
  -H "Content-Type: application/json" \
  -d '{"apiKey": "claw_your_key_here"}')
```

### Step 2: Create & Deploy
The fastest way to deploy is using the `from-repo` endpoint, which auto-detects your `.locusbuild` file:

```bash
curl -s -X POST https://beta-api.buildwithlocus.com/v1/projects/from-repo \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "paygents-sim",
    "repo": "your-org/paygents",
    "branch": "main"
  }'
```

### Step 3: Monitor Status
Poll the deployment status until it reaches `healthy`:

```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://beta-api.buildwithlocus.com/v1/deployments/deploy_xyz" | jq -r '.status'
```

## 5. Common Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| **402** | Insufficient credits | Top up at `https://mpp.buildwithlocus.com` |
| **503** | Service discovery lag | Wait 60 seconds after the deployment is `healthy`. |
| **401** | Token expired | Re-authenticate to get a fresh JWT. |

---

## 6. OpenClaw Skill Integration

"Skills" in the OpenClaw ecosystem are autonomous capabilities that agents can discover and consume. Your application can both **provide** and **use** skills.

### 6.1 Providing Skills
To make your application's features discoverable by other agents, you should provide a metadata endpoint:

1. **Endpoint**: Create an `EXE /api/wrapped/md` (or similar) endpoint.
2. **Format**: Return a Markdown or JSON representation of your skills.
3. **Registration**: Once your service is `healthy` on OpenClaw, it is automatically available for discovery if it follows the skill naming conventions.

### 6.2 Using Ecosystem Skills
The PayGentic simulation is already pre-configured to consume standard skills from the Locus Wrapped API index. 

| Skill ID | Purpose | Integration File |
|----------|---------|------------------|
| `firecrawl/scrape` | Web Data Extraction | `Simulation.tsx` |
| `exa/search` | Real-time Web Search | `Simulation.tsx` |
| `openai/chat` | AI Inference / Logic | `Simulation.tsx` |
| `checkout` | USDC Payment Processing | `checkout.md` guide |

### 6.3 Registering Custom Skills
To register a new skill for your project:
1. Define the skill logic in your backend.
2. Update the `.locusbuild` file to include the skill definition under the `services` block.
3. Use the **Locus MCP (Model Context Protocol)** to allow LLMs to query your skills dynamically.

```typescript
// Example: Querying a skill via MCP
const mcpClient = new LocusMCPClient({
  url: "https://mcp.paywithlocus.com/mcp",
  apiKey: process.env.LOCUS_API_KEY
});
```

---
*Last Updated: April 2026*
