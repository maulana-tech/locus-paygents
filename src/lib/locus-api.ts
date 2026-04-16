/**
 * Locus Pay API helpers
 * Base: https://beta-api.paywithlocus.com
 */
import { locusConfig, locusRequest } from '../config/locus-config';

// --- Response types ---

export interface LocusBalance {
  wallet_address: string;
  chain: string;
  usdc_balance: string;
  allowance: string | null;
  max_transaction_size: string | null;
}

export interface LocusTransaction {
  id: string;
  from_address: string;
  to_address: string;
  amount: string;
  memo: string | null;
  status: string;
  created_at: string;
}

export interface LocusTransactionsResponse {
  transactions: LocusTransaction[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    has_more: boolean;
  };
}

export interface X402Transaction {
  id: string;
  endpoint: string;
  amount_usdc: string;
  status: string;
  created_at: string;
  request_params: Record<string, unknown> | null;
  response_status: number | null;
}

export interface X402TransactionsResponse {
  transactions: X402Transaction[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    has_more: boolean;
  };
}

// --- API calls ---

export const fetchBalance = (): Promise<LocusBalance> =>
  locusRequest<LocusBalance>(locusConfig.endpoints.balance);

export const fetchTransactions = (): Promise<LocusTransactionsResponse> =>
  locusRequest<LocusTransactionsResponse>(locusConfig.endpoints.transactions);

export const fetchX402Transactions = (limit = 50): Promise<X402TransactionsResponse> =>
  locusRequest<X402TransactionsResponse>(`/api/x402/transactions?limit=${limit}`);

/**
 * Call a pay-per-use x402 skill endpoint.
 * USDC is deducted automatically from the Locus wallet.
 * Throws with { status: 402 } when wallet has insufficient balance.
 */
export const callX402Skill = (
  x402Path: string,
  params: Record<string, unknown> = {}
): Promise<unknown> =>
  locusRequest(x402Path, {
    method: 'POST',
    body: JSON.stringify(params),
  });

// --- x402 Skill catalog (sourced from GET /api/x402/endpoints/md, 2026-04-15) ---

export interface X402Skill {
  id: string;
  name: string;
  group: string;
  description: string;
  endpoint: string; // path, e.g. '/api/x402/agentmail-create-inbox'
  basePrice: number;
}

export const X402_SKILLS: X402Skill[] = [
  {
    id: 'agentmail/create-inbox',
    name: 'Create Inbox',
    group: 'AgentMail',
    description: 'Create a new email inbox for your agent.',
    endpoint: '/api/x402/agentmail-create-inbox',
    basePrice: 0.01,
  },
  {
    id: 'agentmail/send-message',
    name: 'Send Email',
    group: 'AgentMail',
    description: 'Send an email from an agent inbox.',
    endpoint: '/api/x402/agentmail-send-message',
    basePrice: 0.02,
  },
  {
    id: 'agentmail/list-inboxes',
    name: 'List Inboxes',
    group: 'AgentMail',
    description: 'List all email inboxes owned by this agent.',
    endpoint: '/api/x402/agentmail-list-inboxes',
    basePrice: 0.005,
  },
  {
    id: 'laso/auth',
    name: 'Laso Auth',
    group: 'Laso Finance',
    description: 'Authenticate with Laso Finance for virtual card access.',
    endpoint: '/api/x402/laso-auth',
    basePrice: 0.01,
  },
  {
    id: 'laso/get-card',
    name: 'Virtual Card',
    group: 'Laso Finance',
    description: 'Provision a prepaid virtual debit card loaded with USD.',
    endpoint: '/api/x402/laso-get-card',
    basePrice: 0.05,
  },
];

/** Look up an x402 skill by its service ID */
export const findX402Skill = (serviceId: string): X402Skill | undefined =>
  X402_SKILLS.find(s => s.id === serviceId);
