# Locus Skill Architecture: PayGentic Integration

This document explains how the PayGentic simulation integrates with the **OpenClaw (Locus)** Skill ecosystem. It covers both the internal simulation logic and the external interaction with the Locus PaaS.

## 1. Skill Concept

In the Locus ecosystem, a **Skill** is a performant, autonomous utility exposed via a **Wrapped API**. 
- **Internal Skills**: Actions that agents within the simulation performing (e.g., "Web Scraping" at Floor 2, Booth A1).
- **External Skills**: The actual infrastructure calls made to the Locus platform (e.g., calling `https://api.paywithlocus.com/api/wrapped/firecrawl/scrape`).

## 2. Dynamic Skill Discovery

The simulation utilizes **Locus Service Discovery** to bridge the virtual office environment with real-world APIs.

### The discovery flow:
1. **Refresh**: The simulation calls the Locus Metadata index (`GET /api/wrapped/md`).
2. **Map**: Each returned service is mapped to a `ServiceProviderAgent`.
3. **Spawn**: The simulation spawns a virtual agent at a specific "Booth" in the Corporate HQ (Floor 2).
4. **Interact**: Procurement agents "walk" to these booths to trigger the real Locus Wrapped API calls.

## 3. Registering Your Web App as a Skill Provider

You can expose the PayGentic simulation itself as a "Monitoring" or "Visualization" skill for other agents.

### Step 1: Define Metadata
Create a file or endpoint that describes your service:
```json
{
  "name": "paygents-simulation",
  "capabilities": ["economy-monitoring", "real-time-usdc-visualization"],
  "endpoints": {
    "view-stats": "/api/stats",
    "trigger-event": "/api/simulate/event"
  }
}
```

### Step 2: Locus PaaS Hook
In your `.locusbuild` file, ensure your service is labeled correctly so the Locus index picks it up as a skill:

```json
{
  "services": {
    "web": {
      "labels": { "locus.type": "skill-provider" }
    }
  }
}
```

## 4. Agent Skill Invocation (A2A)

The core "Skill" interaction in our simulation follows the **A2A (Agent-to-Agent)** pattern:

1. **Procurement Agent** receives a task (e.g., "Research market").
2. **Skill Lookup**: The agent queries the local `LocusCatalogManager` for a "Search" skill.
3. **Execution**: The agent navigates to the **Exa Search Booth**, initiates a handshake, and executes the `exa/search` skill via the Locus API key (`claw_...`).

## 5. Model Context Protocol (MCP)

To allow external LLMs (like Claude or GPT) to interact with the simulation, you should implement the **Locus MCP Client**. This allows handles the "translation" between natural language and your simulation's skills.

> [!TIP]
> Use the [Locus MCP Documentation](file:///Users/em/web/paygents/.opencode/skills.md#locus-mcp-integration) in your project root for implementation details.

---
*Created: April 2026*
