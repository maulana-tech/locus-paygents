/**
 * PAYWITHLOCUS Integration Configuration
 * Based on AGENT.MD Section 6.1
 */

export const locusConfig = {
  environments: {
    production: {
      baseUrl: "https://api.paywithlocus.com",
      apiVersion: "v1"
    },
    beta: {
      baseUrl: "https://beta.paywithlocus.com",
      signupCode: "BETA-ACCESS-DOCS"
    }
  },
  
  agentProfiles: {
    consumer: {
      walletType: "subwallet",
      initialAllowance: 500,
      maxTransaction: 50,
      approvalThreshold: 25
    },
    provider: {
      walletType: "merchant",
      payoutAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e" // Example settlement address
    },
    treasury: {
      walletType: "master",
      canRebalance: true,
      auditInterval: 300000 // 5 minutes
    }
  },
  
  wrappedApis: [
    { id: "firecrawl/scrape", name: "Web Scraping", basePrice: 0.01 },
    { id: "exa/search", name: "AI Search", basePrice: 0.03 },
    { id: "openai/chat", name: "Content Generation", basePrice: 0.05 },
    { id: "tasks/create", name: "Human Task", basePrice: 5.00 }
  ]
};

export type LocusEnv = keyof typeof locusConfig.environments;
export type AgentProfile = keyof typeof locusConfig.agentProfiles;
