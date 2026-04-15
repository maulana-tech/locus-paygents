/**
 * PAYWITHLOCUS Integration Configuration
 * Environment: Beta (claw_dev_ key)
 * API Base: https://beta-api.paywithlocus.com
 */

// --- OpenClaw Event Model ---
export interface OpenClawEvent {
  id: string;
  buyerId: string;     // agent ID in simulation (e.g. 'c1', 'i1')
  providerId: string;  // booth ID or agent ID (e.g. 'B1', 'A2')
  skillId: string;     // e.g. 'openai/chat'
  amount: number;      // USDC amount
  status: 'SUCCESS' | 'FAILED';
  timestamp: number;
}

/** Mount a listener for incoming OpenClaw transaction events.
 *  Currently exposes window.triggerMockTransaction for the Dev Panel.
 *  Replace the TODO block with real WebSocket / API polling for production. */
export const startOpenClawListener = (
  onTransaction: (event: OpenClawEvent) => void
): (() => void) => {
  // TODO: Replace with real WebSocket / API Polling
  // const interval = setInterval(() =>
  //   fetch('/api/locus/events').then(r => r.json()).then(onTransaction), 5000);

  (window as typeof window & { triggerMockTransaction?: (e: OpenClawEvent) => void })
    .triggerMockTransaction = onTransaction;

  return () => {
    delete (window as typeof window & { triggerMockTransaction?: (e: OpenClawEvent) => void })
      .triggerMockTransaction;
  };
};

export const locusConfig = {
  apiKey: import.meta.env.VITE_LOCUS_API_KEY as string,
  environment: (import.meta.env.VITE_LOCUS_ENV || 'beta') as LocusEnv,
  baseUrl: import.meta.env.VITE_LOCUS_BASE_URL || 'https://beta-api.paywithlocus.com',

  environments: {
    production: {
      baseUrl: "https://api.paywithlocus.com",
      apiVersion: "v1"
    },
    beta: {
      baseUrl: "https://beta-api.paywithlocus.com",
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
      payoutAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
    },
    treasury: {
      walletType: "master",
      canRebalance: true,
      auditInterval: 300000 // 5 minutes
    }
  },

  // Real x402 skills available on beta.paywithlocus.com (sourced 2026-04-15)
  wrappedApis: [
    { id: "agentmail/create-inbox", name: "Agent Email",    basePrice: 0.01 },
    { id: "agentmail/send-message", name: "Send Email",     basePrice: 0.02 },
    { id: "agentmail/list-inboxes", name: "List Inboxes",  basePrice: 0.005 },
    { id: "laso/auth",              name: "Finance Auth",   basePrice: 0.01 },
    { id: "laso/get-card",          name: "Virtual Card",   basePrice: 0.05 },
  ],

  // Core API endpoints
  endpoints: {
    balance:      '/api/pay/balance',
    send:         '/api/pay/send',
    transactions: '/api/pay/transactions',
    wrappedIndex: '/wapi/index.md',
    x402Catalog:  '/api/x402/endpoints/md',
    feedback:     '/api/feedback',
    checkoutPay:  (sessionId: string) => `/api/checkout/agent/pay/${sessionId}`,
    checkoutPoll: (txId: string) => `/api/checkout/agent/payments/${txId}`,
  }
};

/** Locus API client helper — always sends Bearer token to beta-api */
export async function locusRequest<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${locusConfig.baseUrl}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${locusConfig.apiKey}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const json = await res.json();

  if (!res.ok || json.success === false) {
    throw Object.assign(
      new Error(json.message || `Locus API error ${res.status}`),
      { status: res.status, code: json.error }
    );
  }

  return json.data as T;
}

export type LocusEnv = keyof typeof locusConfig.environments;
export type AgentProfile = keyof typeof locusConfig.agentProfiles;
