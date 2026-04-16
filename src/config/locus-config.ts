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

/** Mount a listener that polls Locus APIs for new transactions and emits
 *  OpenClawEvent for each newly detected transaction (pay + x402). */
export const startOpenClawListener = (
  onTransaction: (event: OpenClawEvent) => void
): (() => void) => {
  let seenIds = new Set<string>();
  let alive = true;

  // Also expose mock trigger for Dev Panel
  (window as typeof window & { triggerMockTransaction?: (e: OpenClawEvent) => void })
    .triggerMockTransaction = onTransaction;

  const poll = async () => {
    if (!alive) return;

    try {
      const useProxy = window.location.hostname !== 'localhost';

      const fetchLocus = async (path: string) => {
        if (useProxy) {
          return fetch(`/api/locus?path=${encodeURIComponent(path)}`).then(r => r.json());
        }
        return fetch(`${locusConfig.baseUrl}${path}`, {
          headers: {
            'Authorization': `Bearer ${locusConfig.apiKey}`,
            'Content-Type': 'application/json',
          },
        }).then(r => r.json());
      };

      // Poll x402 transactions
      const x402Json = await fetchLocus('/api/x402/transactions?limit=20');
      if (x402Json.success && x402Json.data?.transactions) {
        for (const tx of x402Json.data.transactions) {
          if (!seenIds.has(tx.id)) {
            seenIds.add(tx.id);
            onTransaction({
              id: tx.id,
              buyerId: 'locus-wallet',
              providerId: mapEndpointToBooth(tx.endpoint),
              skillId: tx.endpoint,
              amount: parseFloat(tx.amount_usdc || '0'),
              status: tx.status === 'CONFIRMED' ? 'SUCCESS' : 'FAILED',
              timestamp: new Date(tx.created_at).getTime(),
            });
          }
        }
      }

      // Poll pay transactions
      const payJson = await fetchLocus('/api/pay/transactions?limit=20');
      if (payJson.success && payJson.data?.transactions) {
        for (const tx of payJson.data.transactions) {
          if (!seenIds.has(tx.id) && tx.status === 'CONFIRMED') {
            seenIds.add(tx.id);
            onTransaction({
              id: tx.id,
              buyerId: 'locus-wallet',
              providerId: 'A1',
              skillId: tx.memo || 'transfer',
              amount: parseFloat(tx.amount || '0'),
              status: 'SUCCESS',
              timestamp: new Date(tx.created_at).getTime(),
            });
          }
        }
      }
    } catch {
      // silently ignore — will retry next cycle
    }
  };

  // Initial fetch to populate seenIds so we only emit NEW transactions
  poll().then(() => {
    if (!alive) return;
    const interval = setInterval(poll, 5000);
    // Store interval for cleanup
    (startOpenClawListener as typeof startOpenClawListener & { _interval?: ReturnType<typeof setInterval> })._interval = interval;
  });

  return () => {
    alive = false;
    delete (window as typeof window & { triggerMockTransaction?: (e: OpenClawEvent) => void })
      .triggerMockTransaction;
    const stored = (startOpenClawListener as typeof startOpenClawListener & { _interval?: ReturnType<typeof setInterval> })._interval;
    if (stored) clearInterval(stored);
  };
};

function mapEndpointToBooth(endpoint: string): string {
  if (endpoint.includes('agentmail-create-inbox')) return 'A1';
  if (endpoint.includes('agentmail-send-message')) return 'A2';
  if (endpoint.includes('agentmail-list-inboxes')) return 'A1';
  if (endpoint.includes('agentmail-list-messages')) return 'A1';
  if (endpoint.includes('agentmail-get-message')) return 'A1';
  if (endpoint.includes('agentmail-reply')) return 'A2';
  if (endpoint.includes('laso-get-card')) return 'B1';
  if (endpoint.includes('laso-auth')) return 'B2';
  if (endpoint.includes('laso')) return 'B1';
  return 'A1';
}

export const locusConfig = {
  apiKey: import.meta.env.VITE_LOCUS_API_KEY as string,
  environment: (import.meta.env.VITE_LOCUS_ENV || 'beta') as LocusEnv,
  baseUrl: 'https://beta-api.paywithlocus.com',

  /** In production, all Locus API calls go through /api/locus proxy to avoid CORS.
   *  In dev (localhost), calls go directly to Locus API. */
  get apiBase(): string {
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
      return '/api/locus';
    }
    return this.baseUrl;
  },

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

/** Locus API client helper — uses proxy in production, direct in dev */
export async function locusRequest<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const useProxy = typeof window !== 'undefined' && window.location.hostname !== 'localhost';
  const url = useProxy
    ? `${locusConfig.apiBase}?path=${encodeURIComponent(path)}`
    : `${locusConfig.baseUrl}${path}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (!useProxy) {
    headers['Authorization'] = `Bearer ${locusConfig.apiKey}`;
  }

  const res = await fetch(url, { ...options, headers });
  const json = await res.json();

  if (!res.ok || json.success === false) {
    throw Object.assign(
      new Error(json.message || `Locus API error ${res.status}`),
      { status: res.status, code: json.error }
    );
  }

  return json.data as T;
}

export type LocusEnv = 'production' | 'beta';
export type AgentProfile = 'consumer' | 'provider' | 'treasury';
