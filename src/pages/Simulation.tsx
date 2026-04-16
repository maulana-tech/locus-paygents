import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  ShoppingBag, 
  ShieldCheck, 
  Zap, 
  LayoutGrid, 
  Layers,
  Activity,
  Home,
  User,
  Building2,
  QrCode,
  AlertCircle,
  Briefcase,
  Headset,
  Calculator,
  Wifi,
  History,
  TrendingUp,
  CreditCard,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { locusConfig, startOpenClawListener } from '../config/locus-config';
import type { OpenClawEvent } from '../config/locus-config';
import { fetchBalance, fetchTransactions, fetchX402Transactions, callX402Skill, findX402Skill } from '../lib/locus-api';
import type { LocusBalance, X402Transaction } from '../lib/locus-api';
import '../styles/simulation.css';
import { skillMetadata } from '../config/skill-metadata';

// --- Types ---
type SimulationMode = 'INDIVIDUAL' | 'COMPANY';
type AgentRole = 'CONSUMER' | 'PROVIDER' | 'PROCUREMENT' | 'TREASURY';
type AgentStatus = 'IDLE' | 'WORKING' | 'TRANSACTING' | 'PENDING' | 'ERROR';

interface Agent {
  id: string;
  role: AgentRole;
  x: number;
  y: number;
  floor: number;
  status: AgentStatus;
  balance: number;
  revenue: number;
  name: string;
  target?: { x: number; y: number };
  memory?: {
    lastPrices?: { service: string; price: number }[];
    favoriteBooth?: string;
  };
  policy?: {
    maxTransaction: number;
    approvalThreshold: number;
  };
  skills: string[];
}

interface Transaction {
  id: string;
  from: string;
  fromId: string;
  to: string;
  toId: string;
  amount: number;
  timestamp: number;
  service: string;
  isLive?: boolean; // true = came from real Locus API
}

interface Beam {
  id: string;
  fromPos: { x: number; y: number };
  toPos: { x: number; y: number };
}

// --- Config ---
const GRID_SIZE = 10;
const TILE_SIZE = 64;
// Booths mapped to real Locus x402 services
const BOOTHS = [
  { id: 'A1', x: 2, y: 2, service: 'agentmail/create-inbox', name: 'AgentMail Booth' },
  { id: 'A2', x: 2, y: 6, service: 'agentmail/send-message', name: 'Email Send Booth' },
  { id: 'B1', x: 7, y: 2, service: 'laso/get-card',          name: 'Laso Finance Booth' },
  { id: 'B2', x: 7, y: 7, service: 'laso/auth',              name: 'Laso Auth Booth' },
];

// --- Helper Functions ---
const isoToScreen = (x: number, y: number) => {
  const left = (x - y) * (TILE_SIZE / 2);
  const top = (x + y) * (TILE_SIZE / 4);
  return { left: `calc(50% + ${left}px)`, top: `calc(50% + ${top}px)` };
};

/** Returns raw pixel offsets (relative to center) — used for beam angle/length math */
const isoToPos = (x: number, y: number) => ({
  px: (x - y) * (TILE_SIZE / 2),
  py: (x + y) * (TILE_SIZE / 4),
});

// --- Components ---

const AgentCharacter = ({ agent, onSelect }: { agent: Agent, onSelect?: (id: string) => void }) => {
  const { left, top } = isoToScreen(agent.x, agent.y);
  
  const getRoleClass = (role: AgentRole) => {
    switch(role) {
      case 'CONSUMER': return 'role-consumer';
      case 'PROVIDER': return 'role-provider';
      case 'PROCUREMENT': return 'role-procurement';
      case 'TREASURY': return 'role-treasury';
    }
  };

  const statusClass = agent.status.toLowerCase();

  return (
    <motion.div
      className={`agent-sprite ${agent.target ? 'walking' : 'idle'} ${agent.status === 'ERROR' ? 'error-shake' : ''}`}
      initial={false}
      animate={{ left, top }}
      transition={{ type: 'tween', duration: 0.85, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{ zIndex: 20, transform: 'translate(-50%, -85%)' }}
    >
      {/* Dynamic Status Ring */}
      <div className={`status-ring ${statusClass}`} />
      
      {/* Character Visual - 3D Rendered Robot */}
      <div className={`agent-character-sprite ${getRoleClass(agent.role)} relative`}>
        {/* Floating Tag */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex flex-col items-center">
          <div className="whitespace-nowrap bg-black/80 backdrop-blur-md px-2 py-0.5 rounded-full text-[8px] font-bold border border-white/10 uppercase tracking-tighter text-white shadow-xl">
            {agent.name}
          </div>
          <div className="text-[10px] font-mono text-primary font-bold bg-black/40 backdrop-blur-md px-2 rounded-full mt-1 border border-primary/20">
            ${agent.balance.toFixed(2)}
          </div>
        </div>

        {/* Intent Bubble */}
        <AnimatePresence>
          {agent.status === 'WORKING' && (
            <motion.div 
              initial={{ scale: 0, y: 10, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0, y: 10, opacity: 0 }}
              className="absolute -right-12 top-0 bg-primary text-black text-[9px] font-black p-1.5 rounded-full shadow-[0_0_20px_rgba(0,212,255,0.4)] z-30"
            >
              <Zap size={10} fill="currentColor" />
            </motion.div>
          )}
          {agent.status === 'TRANSACTING' && (
            <motion.div 
              initial={{ scale: 0, y: 10, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0, y: 10, opacity: 0 }}
              className="absolute -left-12 top-0 bg-secondary text-on-secondary text-[10px] p-1.5 rounded-full shadow-xl z-30 font-bold"
            >
              💰
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* CLICKABLE HITBOX */}
      <div 
        className="absolute inset-0 cursor-pointer" 
        onClick={(e) => {
          e.stopPropagation();
          onSelect?.(agent.id);
        }}
        style={{ width: '100%', height: '100%' }}
      />
    </motion.div>
  );
};

export function Simulation() {
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [mode, setMode] = useState<SimulationMode>('INDIVIDUAL');
  const [currentFloor, setCurrentFloor] = useState(1);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [beams, setBeams] = useState<Beam[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [eventQueue, setEventQueue] = useState<OpenClawEvent[]>([]);
  const [locusWallet, setLocusWallet] = useState<LocusBalance | null>(null);
  const [x402Error, setX402Error] = useState<string | null>(null);
  const [successToasts, setSuccessToasts] = useState<{ id: string; agent: string; amount: number; skill: string }[]>([]);
  const [sparkles, setSparkles] = useState<{ id: string; x: number; y: number }[]>([]);
  const [boothHits, setBoothHits] = useState<string[]>([]);
  const [floatingCoins, setFloatingCoins] = useState<{ id: string; x: number; y: number; amount: number }[]>([]);
  const isProcessingRef = useRef(false);
  const agentsRef = useRef<Agent[]>([]);

  // Keep agentsRef in sync with latest agents state (used in async callbacks)
  useEffect(() => { agentsRef.current = agents; }, [agents]);

  // --- Swarm Lifecycle ---
  useEffect(() => {
    // Clear and respawn when mode changes
    const spawnAgents = () => {
      if (mode === 'INDIVIDUAL') {
        setAgents([
          { id: 'i1', name: 'Solo-Agent', role: 'CONSUMER', x: 2, y: 2, floor: 1, status: 'IDLE', balance: 50.00, revenue: 0, memory: { lastPrices: [] }, policy: { maxTransaction: 20, approvalThreshold: 10 }, skills: ['checkout.md', 'onboarding.md'] },
          { id: 'i2', name: 'Dev-Agent', role: 'PROVIDER', x: 5, y: 5, floor: 1, status: 'IDLE', balance: 100.00, revenue: 0, skills: ['git-deploy.md', 'api-reference.md'] },
          { id: 'i3', name: 'Buyer-Bot', role: 'PROCUREMENT', x: 3, y: 6, floor: 1, status: 'IDLE', balance: 40.00, revenue: 0, memory: { lastPrices: [] }, skills: ['agent-quickstart.md'] },
        ]);
        setCurrentFloor(1);
      } else {
        setAgents([
          { id: 'c1', name: 'Receptionist', role: 'CONSUMER', x: 1, y: 2, floor: 1, status: 'IDLE', balance: 500.00, revenue: 0, skills: ['onboarding.md'] },
          { id: 'c2', name: 'Firecrawl-P', role: 'PROVIDER', x: BOOTHS[0].x, y: BOOTHS[0].y, floor: 2, status: 'IDLE', balance: 1000.00, revenue: 0, skills: ['git-deploy.md', 'logs.md'] },
          { id: 'c3', name: 'Procure-X', role: 'PROCUREMENT', x: 2, y: 2, floor: 2, status: 'IDLE', balance: 200.00, revenue: 0, memory: { lastPrices: [] }, skills: ['deployment-workflows.md', 'monorepo.md'] },
          { id: 'c4', name: 'Treasury-S', role: 'TREASURY', x: 4, y: 4, floor: 3, status: 'IDLE', balance: 10000.00, revenue: 0, skills: ['billing.md', 'troubleshooting.md', 'addons.md'] },
          { id: 'c5', name: 'OpenAI-P', role: 'PROVIDER', x: BOOTHS[2].x, y: BOOTHS[2].y, floor: 2, status: 'IDLE', balance: 1500.00, revenue: 0, skills: ['api-reference.md', 'webhooks.md'] },
        ]);
        setCurrentFloor(2);
      }
    };
    spawnAgents();
  }, [mode]);

  // --- Simulation Loops ---

  // 1. Movement & AI Logic Loop
  useEffect(() => {
    const aiInterval = setInterval(() => { // 1100ms > 850ms animation duration — no mid-flight interruptions
      setAgents(prev => prev.map(agent => {
        // If transacting, stay put
        if (agent.status === 'TRANSACTING' || agent.status === 'WORKING') return agent;

        // --- PROCURE LOGIC: Window Shopping ---
        if (agent.role === 'PROCUREMENT' && agent.status === 'IDLE' && agent.floor === currentFloor) {
          // If no target, pick a random booth to 'survey'
          if (!agent.target) {
            const nextBooth = BOOTHS[Math.floor(Math.random() * BOOTHS.length)];
            return { ...agent, target: { x: nextBooth.x, y: nextBooth.y } };
          }
          
          // Move towards target
          const dx = Math.sign(agent.target.x - agent.x);
          const dy = Math.sign(agent.target.y - agent.y);
          
          // Arrived at target?
          if (dx === 0 && dy === 0) {
            // Survey logic: 'remember' price (simulated) then clear target to pick next
            const updatedMemory = { ...agent.memory };
            const lastPrices = updatedMemory.lastPrices ? [...updatedMemory.lastPrices] : [];
            lastPrices.push({ service: 'survey', price: Math.random() });
            
            return { 
              ...agent, 
              target: undefined, 
              memory: { ...updatedMemory, lastPrices } 
            };
          }

          return { ...agent, x: agent.x + dx, y: agent.y + dy };
        }

        // --- REFILL LOGIC: Low Balance ---
        if (agent.balance < 10 && agent.status === 'IDLE') {
          // Move to Treasury on Floor 3 (simulated floor change if reached elevator)
          if (agent.floor !== 3) {
            // Target elevator (centerish)
            const elevator = { x: 5, y: 5 };
            const dx = Math.sign(elevator.x - agent.x);
            const dy = Math.sign(elevator.y - agent.y);
            if (dx === 0 && dy === 0) return { ...agent, floor: 3, x: 5, y: 5 }; // Jumps to floor 3
            return { ...agent, x: agent.x + dx, y: agent.y + dy };
          } else {
            // On Floor 3, target Treasury
            const treasury = { x: 4, y: 4 };
            const dx = Math.sign(treasury.x - agent.x);
            const dy = Math.sign(treasury.y - agent.y);
            if (dx === 0 && dy === 0) return { ...agent, balance: 200, floor: 2 }; // Refilled!
            return { ...agent, x: agent.x + dx, y: agent.y + dy };
          }
        }

        // Standard Random Movement for IDLE
        if (Math.random() < 0.7) return agent;
        const dx = Math.floor(Math.random() * 3) - 1;
        const dy = Math.floor(Math.random() * 3) - 1;
        return { ...agent, x: Math.max(0, Math.min(GRID_SIZE-1, agent.x + dx)), y: Math.max(0, Math.min(GRID_SIZE-1, agent.y + dy)) };
      }));
    }, 1100);
    return () => clearInterval(aiInterval);
  }, [currentFloor]);

  // 2. Transaction Loop (A2A) with Decision Logic
  useEffect(() => {
    const txInterval = setInterval(() => {
      setAgents(prev => {
        const potentialBuyers = prev.filter(a => a.role === 'PROCUREMENT' && a.status === 'IDLE' && !a.target && a.floor === currentFloor);
        const potentialSellers = prev.filter(a => a.role === 'PROVIDER' && a.floor === currentFloor);
        
        if (potentialBuyers.length && potentialSellers.length) {
          const buyer = potentialBuyers[0];
          // AGENTIC DECISION: Buy if we've surveyed at least one booth (simulated by memory length)
          if (buyer.memory && buyer.memory.lastPrices && buyer.memory.lastPrices.length > 0) {
            const seller = potentialSellers[Math.floor(Math.random() * potentialSellers.length)];
            const service = locusConfig.wrappedApis[Math.floor(Math.random() * 3)];
            
            // Execute Simulation Logic
            handleTransaction(buyer, seller, service.basePrice, service.name);
            // Clear memory after purchase
            buyer.memory.lastPrices = [];
          }
        }
        return prev;
      });
    }, 3000);
    return () => clearInterval(txInterval);
  }, [currentFloor]);

  const handleTransaction = useCallback(async (buyer: Agent, seller: Agent, amount: number, service: string) => {
    console.log(`Starting transaction: ${buyer.name} -> ${seller.name} (${amount} USDC)`);

    // Attempt real x402 call — fire and forget (simulation continues regardless)
    const skill = findX402Skill(service);
    if (skill) {
      callX402Skill(skill.endpoint, { memo: `sim:${buyer.name}→${seller.name}` })
        .then(() => {
          // Real call succeeded — refresh wallet balance
          fetchBalance().then(setLocusWallet).catch(() => {});
        })
        .catch((err: { status?: number }) => {
          if (err?.status === 402) {
            setX402Error('Insufficient USDC — top up at mpp.paywithlocus.com');
          }
        });
    }
    
    // 1. Show Beam
    const beamId = Math.random().toString(36).substr(2, 9);
    setBeams(prev => [...prev, { id: beamId, fromPos: { x: buyer.x, y: buyer.y }, toPos: { x: seller.x, y: seller.y } }]);
    
    // 2. Update status
    setAgents(prev => prev.map(a => {
      if (a.id === buyer.id) return { ...a, status: 'TRANSACTING' };
      if (a.id === seller.id) return { ...a, status: 'WORKING' };
      return a;
    }));

    // 3. Complete Transaction after 2s
    setTimeout(() => {
      setBeams(prev => prev.filter(b => b.id !== beamId));
      
      setAgents(prev => prev.map(a => {
        if (a.id === buyer.id) return { ...a, status: 'IDLE', balance: a.balance - amount };
        if (a.id === seller.id) return { ...a, status: 'IDLE', balance: a.balance + amount, revenue: a.revenue + amount };
        return a;
      }));

      setTransactions(prev => [{
        id: beamId,
        from: buyer.name,
        fromId: buyer.id,
        to: seller.name,
        toId: seller.id,
        amount,
        timestamp: Date.now(),
        service
      }, ...prev].slice(0, 10));

      // Trigger Checkout popup for individual mode simulation
      if (mode === 'INDIVIDUAL' && Math.random() > 0.5) {
        setShowCheckout(true);
        setTimeout(() => setShowCheckout(false), 4000);
      }
    }, 2000);
  }, [mode]);

  // --- OpenClaw Event Queue Processor (Phase 3: Animation State Machine) ---
  useEffect(() => {
    if (eventQueue.length === 0 || isProcessingRef.current) return;

    isProcessingRef.current = true;
    const event = eventQueue[0];
    const currentAgents = agentsRef.current;

    let buyer = currentAgents.find(a => a.id === event.buyerId);

    // Real Locus events come with buyerId='locus-wallet' — pick an eligible sim agent
    if (!buyer || event.buyerId === 'locus-wallet') {
      const eligible = currentAgents.filter(
        a => (a.role === 'PROCUREMENT' || a.role === 'CONSUMER') && a.status === 'IDLE' && a.floor === currentFloor
      );
      buyer = eligible.length > 0 ? eligible[Math.floor(Math.random() * eligible.length)] : undefined;
    }

    const targetBooth = BOOTHS.find(b => b.id === event.providerId);
    const providerAgent = currentAgents.find(a => a.id === event.providerId);

    const targetPos = targetBooth
      ? { x: targetBooth.x, y: targetBooth.y }
      : providerAgent
      ? { x: providerAgent.x, y: providerAgent.y }
      : null;

    if (!buyer || !targetPos) {
      setEventQueue(prev => prev.slice(1));
      isProcessingRef.current = false;
      return;
    }

    const beamId = event.id;
    const buyerSpawnX = buyer.x;
    const buyerSpawnY = buyer.y;
    const buyerName = buyer.name;
    const buyerAgentId = buyer.id;
    const providerName = targetBooth?.name ?? providerAgent?.name ?? event.providerId;

    // Step A: Walk to target (0s – 2s)
    setAgents(prev => prev.map(a =>
      a.id === buyerAgentId ? { ...a, status: 'WORKING', target: targetPos } : a
    ));

    // Step B: Fire beam + mark TRANSACTING (2s)
    setTimeout(() => {
      setBeams(prev => [...prev, {
        id: beamId,
        fromPos: targetPos,
        toPos: providerAgent ? { x: providerAgent.x, y: providerAgent.y } : targetPos,
      }]);
      setAgents(prev => prev.map(a => {
        if (a.id === buyerAgentId) return { ...a, status: 'TRANSACTING', target: undefined };
        if (a.id === event.providerId) return { ...a, status: 'WORKING' };
        return a;
      }));

      // Step C: Economy update + SUCCESS FX (3s)
      setTimeout(() => {
        setAgents(prev => prev.map(a => {
          if (a.id === buyerAgentId) return { ...a, balance: a.balance - event.amount };
          if (a.id === event.providerId) return { ...a, balance: a.balance + event.amount, revenue: a.revenue + event.amount };
          return a;
        }));
        setTransactions(prev => [{
          id: beamId,
          from: buyerName,
          fromId: buyerAgentId,
          to: providerName,
          toId: event.providerId,
          amount: event.amount,
          timestamp: event.timestamp,
          service: event.skillId,
          isLive: event.buyerId === 'locus-wallet',
        }, ...prev].slice(0, 15));

        // ── SUCCESS EFFECTS ──
        // 1. Floating USDC coin at provider position
        const coinId = `coin_${Date.now()}`;
        setFloatingCoins(prev => [...prev, { id: coinId, x: targetPos.x, y: targetPos.y, amount: event.amount }]);

        // 2. Sparkle burst at booth
        const sparkleId = `spk_${Date.now()}`;
        setSparkles(prev => [...prev, { id: sparkleId, x: targetPos.x, y: targetPos.y }]);

        // 3. Booth hit pulse
        setBoothHits(prev => [...prev, event.providerId]);

        // 4. Success toast
        setSuccessToasts(prev => [...prev, {
          id: beamId,
          agent: buyerName,
          amount: event.amount,
          skill: event.skillId.split('/').pop() || event.skillId,
        }]);

        // 5. Agent success bounce
        setAgents(prev => prev.map(a => {
          if (a.id === buyerAgentId) return { ...a, status: 'IDLE' };
          if (a.id === event.providerId) return { ...a, status: 'IDLE' };
          return a;
        }));

        // Step D: Cleanup (3.5s)
        setTimeout(() => {
          setBeams(prev => prev.filter(b => b.id !== beamId));
          setAgents(prev => prev.map(a => {
            if (a.id === buyerAgentId) return { ...a, target: { x: buyerSpawnX, y: buyerSpawnY } };
            return a;
          }));
          setBoothHits(prev => prev.filter(id => id !== event.providerId));
          setEventQueue(prev => prev.slice(1));
          isProcessingRef.current = false;
        }, 1000);
      }, 2000);
    }, 2000);
  }, [eventQueue]);

  // --- Mount OpenClaw Listener (Phase 4) ---
  useEffect(() => {
    const cleanup = startOpenClawListener((event) =>
      setEventQueue(prev => [...prev, event])
    );
    return cleanup;
  }, []);

  // --- Locus Live: Balance Sync ---
  useEffect(() => {
    const sync = async () => {
      try {
        const data = await fetchBalance();
        setLocusWallet(data);
      } catch {
        // silently ignore — simulation continues without live balance
      }
    };
    sync();
    const id = setInterval(sync, 30_000);
    return () => clearInterval(id);
  }, []);

  // --- Locus Live: Transaction Polling (display only — events handled by OpenClaw listener) ---
  useEffect(() => {
    const poll = async () => {
      try {
        const { transactions: payTxs } = await fetchTransactions();
        const { transactions: x402Txs } = await fetchX402Transactions(10);
        const allNew: Transaction[] = [];

        for (const t of payTxs) {
          allNew.push({
            id: t.id,
            from: t.from_address.slice(0, 6) + '…' + t.from_address.slice(-4),
            fromId: 'locus-wallet',
            to:   t.to_address.slice(0, 6)   + '…' + t.to_address.slice(-4),
            toId: 'locus-external',
            amount: parseFloat(t.amount),
            timestamp: new Date(t.created_at).getTime(),
            service: t.memo ?? 'transfer',
            isLive: true,
          });
        }

        for (const t of x402Txs) {
          allNew.push({
            id: t.id,
            from: 'Your Wallet',
            fromId: 'locus-wallet',
            to: t.endpoint.split('/').pop() ?? 'x402',
            toId: 'locus-x402',
            amount: parseFloat(t.amount_usdc || '0'),
            timestamp: new Date(t.created_at).getTime(),
            service: t.endpoint,
            isLive: true,
          });
        }

        if (!allNew.length) return;
        setTransactions(prev => {
          const existingIds = new Set(prev.map(t => t.id));
          const fresh = allNew.filter(t => !existingIds.has(t.id));
          return [...fresh, ...prev].slice(0, 15);
        });
      } catch {
        // silently ignore
      }
    };
    poll();
    const id = setInterval(poll, 15_000);
    return () => clearInterval(id);
  }, []);

  // Auto-clear x402 error toast after 3s
  useEffect(() => {
    if (!x402Error) return;
    const id = setTimeout(() => setX402Error(null), 3000);
    return () => clearTimeout(id);
  }, [x402Error]);

  // Auto-clear success effects
  useEffect(() => {
    if (!successToasts.length) return;
    const id = setTimeout(() => setSuccessToasts(prev => prev.slice(1)), 3000);
    return () => clearTimeout(id);
  }, [successToasts]);

  useEffect(() => {
    if (!sparkles.length) return;
    const id = setTimeout(() => setSparkles(prev => prev.slice(1)), 1200);
    return () => clearTimeout(id);
  }, [sparkles]);

  useEffect(() => {
    if (!floatingCoins.length) return;
    const id = setTimeout(() => setFloatingCoins(prev => prev.slice(1)), 2500);
    return () => clearTimeout(id);
  }, [floatingCoins]);

  // --- Mock Transaction Generator (Phase 2) ---
  const handleMockTransaction = useCallback(() => {
    const currentAgents = agentsRef.current;
    const eligible = currentAgents.filter(
      a => (a.role === 'PROCUREMENT' || a.role === 'CONSUMER') && a.status === 'IDLE' && a.floor === currentFloor
    );
    if (!eligible.length) return;

    const buyer = eligible[Math.floor(Math.random() * eligible.length)];
    const booth = BOOTHS[Math.floor(Math.random() * BOOTHS.length)];
    const service = locusConfig.wrappedApis[Math.floor(Math.random() * locusConfig.wrappedApis.length)];

    setEventQueue(prev => [...prev, {
      id: `evt_${Date.now().toString(36)}`,
      buyerId: buyer.id,
      providerId: booth.id,
      skillId: service.id,
      amount: service.basePrice,
      status: 'SUCCESS',
      timestamp: Date.now(),
    }]);
  }, [currentFloor]);

  // --- Rendering Helpers ---

  const totalEconomyRevenue = useMemo(() => agents.reduce((sum, a) => sum + a.revenue, 0), [agents]);

  // 3. Treasury Monitoring Loop
  useEffect(() => {
    const auditInterval = setInterval(() => {
      setAgents(prev => {
        const treasury = prev.find(a => a.role === 'TREASURY');
        if (!treasury || treasury.floor !== currentFloor) return prev;

        return prev.map(agent => {
          // Anomaly: If agent balance/revenue moved too fast (simulated check)
          if (agent.role !== 'TREASURY' && Math.random() < 0.05) {
             console.log(`Treasury Alert: Anomaly detected for ${agent.name}`);
             return { ...agent, status: 'ERROR' };
          }
          return agent;
        });
      });
    }, 10000);
    return () => clearInterval(auditInterval);
  }, [currentFloor]);

  return (
    <div className={`sim-container text-white select-none ${mode === 'INDIVIDUAL' ? 'mode-individual' : 'mode-company'}`}>
      {/* Background Ambience - Modified to be an overlay instead of solid floor */}
      <div className="absolute inset-0 bg-[#0a0d14]/20" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(0,212,255,0.08),transparent)] pointer-events-none" />

      {/* --- HUD: NAVIGATION & BRAND --- */}
      <div className="absolute top-8 left-8 z-50 flex items-center gap-4">
        <Link to="/" className="w-12 h-12 glass-panel flex items-center justify-center text-white/60 hover:text-primary transition-all">
          <Home size={20} />
        </Link>
        <div className="glass-panel px-6 py-3 flex items-center gap-4 border-l-4 border-primary">
          <div>
            <h1 className="text-xl font-bold tracking-tight">PAYGENTIC</h1>
            <p className="text-[9px] text-white/40 uppercase tracking-[0.2em]">Autonomous Agent Simulation</p>
          </div>
          <div className="w-px h-8 bg-white/10 mx-2" />
          <div className="flex items-center gap-2">
            <div className={`px-4 py-1.5 rounded-full text-[10px] font-bold bg-white/5 border border-white/10 flex items-center gap-2 ${mode === 'INDIVIDUAL' ? 'text-primary' : 'text-secondary'}`}>
              {mode === 'INDIVIDUAL' ? <User size={12} /> : <Building2 size={12} />}
              {mode} MODE
            </div>
            <button 
              onClick={() => setShowOnboarding(true)}
              className="px-4 py-1.5 rounded-full text-[10px] font-bold text-white/40 hover:text-white hover:bg-white/5 transition-all"
            >
              RESET
            </button>
          </div>
        </div>
      </div>

      {/* --- HUD: STATS --- */}
      <div className="absolute top-8 right-8 z-50 flex flex-col gap-4">
        <div className="glass-panel p-6 w-80">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold mb-1">Economy Activity</p>
              <h2 className="text-3xl font-mono tracking-tighter text-secondary">
                {totalEconomyRevenue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
              </h2>
            </div>
            <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary">
              <TrendingUp size={24} />
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-secondary"
                initial={{ width: 0 }}
                animate={{ width: '65%' }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-bold text-white/40 tracking-wider">
              <span>SYSTEM LOAD: 42%</span>
              <span>ALIVE AGENTS: {agents.length}</span>
            </div>
          </div>
        </div>

        {/* Live Wallet Panel */}
        {locusWallet && (
          <div className="glass-panel p-4 w-80 border-l-4 border-primary">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-[9px] font-bold text-primary/80 uppercase tracking-[0.2em]">Live Wallet</span>
              </div>
              <span className="text-[8px] text-white/30 font-mono uppercase">{locusWallet.chain}</span>
            </div>
            <div className="font-mono text-[9px] text-white/30 truncate mb-1">{locusWallet.wallet_address}</div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-primary">{locusWallet.usdc_balance}</span>
              <span className="text-[10px] text-white/40 font-bold">USDC</span>
            </div>
          </div>
        )}

        {/* Transaction History Small Panel */}
        <button
          onClick={() => setHistoryOpen(!historyOpen)}
          className="glass-panel p-4 flex items-center justify-between hover:bg-white/5 transition-all text-white/60"
        >
          <div className="flex items-center gap-3">
            <History size={16} />
            <span className="text-xs font-bold uppercase tracking-widest">Live Ledger</span>
          </div>
          <motion.div animate={{ rotate: historyOpen ? 180 : 0 }}>
            <Activity size={14} />
          </motion.div>
        </button>

        <AnimatePresence>
          {historyOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass-panel p-4 w-80 space-y-3"
            >
              {transactions.length === 0 && <p className="text-[10px] text-white/20 italic">Awaiting commerce...</p>}
              {transactions.map(tx => (
                <div key={tx.id} className={`text-[10px] font-mono flex items-center gap-2 p-2 rounded border ${tx.isLive ? 'bg-primary/5 border-primary/20' : 'bg-white/5 border-white/5'}`}>
                  {tx.isLive && <span className="text-[7px] font-black text-primary bg-primary/10 px-1 py-0.5 rounded uppercase tracking-widest shrink-0">LIVE</span>}
                  <span className="text-primary truncate">{tx.from}</span>
                  <ArrowRight size={8} className="shrink-0" />
                  <span className="text-white/60 truncate">{tx.to}</span>
                  <span className="ml-auto text-secondary font-bold shrink-0">+{tx.amount}</span>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* --- HUD: FLOOR CONTROLS (Only Company Mode) --- */}
      {mode === 'COMPANY' && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50">
          <div className="glass-panel px-8 py-4 flex items-center gap-8">
            {[1, 2, 3].map(f => (
              <React.Fragment key={f}>
                <button 
                  onClick={() => setCurrentFloor(f)}
                  className={`flex flex-col items-center gap-1 transition-all ${currentFloor === f ? 'text-primary' : 'text-white/40 hover:text-white'}`}
                >
                  {f === 1 && <LayoutGrid size={20} />}
                  {f === 2 && <Layers size={20} />}
                  {f === 3 && <ShieldCheck size={20} />}
                  <span className="text-[10px] font-bold uppercase tracking-widest">Floor {f}</span>
                </button>
                {f < 3 && <div className="w-px h-8 bg-white/10" />}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* --- SIMULATION STAGE (ISOMETRIC) --- */}
      <div className="w-full h-full flex items-center justify-center overflow-hidden relative">
        <div className="relative">
          {/* Isometric Diamond Grid */}
          <div className="relative">
            {Array.from({ length: GRID_SIZE }).map((_, i) => 
              Array.from({ length: GRID_SIZE }).map((_, j) => {
                const { left, top } = isoToScreen(i, j);
                return (
                  <div 
                    key={`${i}-${j}`}
                    className="absolute border-[0.5px] border-white/5"
                    style={{
                      width: TILE_SIZE,
                      height: TILE_SIZE / 2,
                      left, top,
                      transform: 'translate(-50%, -50%)',
                      clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                      background: 'rgba(255,255,255,0.01)'
                    }}
                  />
                );
              })
            )}
          </div>

          {/* Transaction Beams — angle & length computed from actual positions */}
          <AnimatePresence>
            {beams.map(beam => {
              const from = isoToScreen(beam.fromPos.x, beam.fromPos.y);
              const fp = isoToPos(beam.fromPos.x, beam.fromPos.y);
              const tp = isoToPos(beam.toPos.x, beam.toPos.y);
              const dx = tp.px - fp.px;
              const dy = tp.py - fp.py;
              const length = Math.sqrt(dx * dx + dy * dy);
              const angle = Math.atan2(dy, dx) * (180 / Math.PI);

              return (
                <motion.div
                  key={beam.id}
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  exit={{ opacity: 0, scaleX: 0 }}
                  transition={{ duration: 0.25 }}
                  className="transaction-beam"
                  style={{
                    left: from.left,
                    top: from.top,
                    width: `${length}px`,
                    transform: `translateY(-50%) rotate(${angle}deg)`,
                    transformOrigin: 'left center',
                  }}
                />
              );
            })}
          </AnimatePresence>

          {/* Agents */}
          <AnimatePresence>
            {agents.filter(a => a.floor === currentFloor).map(agent => (
              <AgentCharacter 
                key={agent.id} 
                agent={agent} 
                onSelect={(id) => setSelectedAgentId(prev => prev === id ? null : id)}
              />
            ))}
          </AnimatePresence>

          {/* Booth Labels (all modes) */}
          {BOOTHS.map(booth => {
            const { left, top } = isoToScreen(booth.x, booth.y);
            const isHit = boothHits.includes(booth.id);
            return (
              <div
                key={booth.id}
                className={`absolute pointer-events-none flex flex-col items-center ${isHit ? 'booth-hit' : ''}`}
                style={{ left, top, transform: 'translate(-50%, -150%)', zIndex: 10, borderRadius: '20px' }}
              >
                <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase shadow-lg backdrop-blur-md border ${
                  isHit
                    ? 'bg-green-500/30 border-green-400/60 text-green-400'
                    : 'bg-primary/20 border-primary/40 text-primary'
                }`}>
                  {booth.name}
                </div>
                <div className="text-[8px] text-white/40 mt-1 font-bold">{booth.name}</div>
              </div>
            );
          })}
          
          {/* Visual Floor Indicators */}
          {!showOnboarding && (
            <div className="absolute top-[350px] left-1/2 -translate-x-1/2 text-center pointer-events-none">
              <h2 className="text-[12rem] font-black tracking-tighter italic uppercase text-white/[0.04] select-none leading-none">
                {mode === 'INDIVIDUAL' ? "STUDIO" : (
                  currentFloor === 1 ? "LOBBY" : currentFloor === 2 ? "MART" : "FINANCE"
                )}
              </h2>
            </div>
          )}
        </div>
      </div>

      {/* --- LOCUS MODALS --- */}
      <AnimatePresence>
        {showCheckout && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="locus-modal w-80 font-body"
          >
            <div className="flex items-center gap-2 mb-4 text-primary font-bold">
              <QrCode size={20} />
              <span className="tracking-widest text-[10px] uppercase">Locus Checkout SDK</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Complete Purchase</h3>
            <p className="text-xs text-black/50 mb-4 font-mono">Session: a2a_sim_{Math.random().toString(36).substr(2,4)}</p>
            
            <div className="qr-placeholder">
              <div className="flex flex-col items-center gap-2 text-black/20">
                <Users size={48} />
                <span className="text-[10px] font-bold">SCAN TO PAY</span>
              </div>
            </div>
            
            <div className="flex bg-black/5 p-4 rounded-xl items-center gap-3 text-left">
              <div className="w-10 h-10 bg-primary/20 rounded flex items-center justify-center text-primary">
                <CreditCard size={20} />
              </div>
              <div>
                <p className="text-[9px] font-bold text-black/40 uppercase">Total amount</p>
                <p className="text-lg font-bold">0.05 <span className="text-xs">USDC</span></p>
              </div>
            </div>
            
            <button className="w-full bg-black text-white py-3 rounded-lg mt-4 font-bold text-sm tracking-widest hover:brightness-110 active:scale-95 transition-all">
              SIMULATE CONFIRMATION
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- x402 Error Toast --- */}
      <AnimatePresence>
        {x402Error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-28 left-1/2 -translate-x-1/2 z-[200] glass-panel px-6 py-3 flex items-center gap-3 border-l-4 border-yellow-400"
          >
            <AlertCircle size={16} className="text-yellow-400 shrink-0" />
            <span className="text-[11px] font-bold text-white/80">{x402Error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- DEV CONTROL PANEL (Phase 2) --- */}
      {!showOnboarding && (
        <div className="absolute bottom-8 left-8 z-50">
          <div className="glass-panel p-4 flex flex-col gap-3 border-l-4 border-secondary min-w-[200px]">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-secondary/80">Dev Panel</span>
            </div>
            <button
              onClick={handleMockTransaction}
              className="px-4 py-2 bg-secondary/10 text-secondary border border-secondary/30 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-secondary hover:text-black transition-all flex items-center gap-2 justify-center"
            >
              <Zap size={12} />
              Mock OpenClaw Tx
            </button>
            <AnimatePresence>
              {eventQueue.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-[9px] text-white/40 font-mono text-center"
                >
                  {eventQueue.length} event{eventQueue.length > 1 ? 's' : ''} in queue
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.15)_100%),linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.05)_50%),linear-gradient(90deg,rgba(0,212,255,.03),rgba(0,255,0,.01),rgba(0,212,255,.03))] bg-[length:100%_2px,3px_100%] opacity-20" />

      {/* --- AGENT SKILL PANEL --- */}
      <AnimatePresence>
        {selectedAgentId && (
          <motion.div 
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            className="absolute right-8 top-1/2 -translate-y-1/2 w-80 glass-panel p-6 z-50 border-r-0 border-l-4 border-primary"
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold">{agents.find(a => a.id === selectedAgentId)?.name}</h3>
                <p className="text-[10px] text-white/40 uppercase tracking-widest">{agents.find(a => a.id === selectedAgentId)?.role} SKILLSET</p>
              </div>
              <button onClick={() => setSelectedAgentId(null)} className="text-white/20 hover:text-white transition-all">
                <Users size={18} />
              </button>
            </div>

            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              {agents.find(a => a.id === selectedAgentId)?.skills.map(skillFile => {
                const meta = skillMetadata[skillFile];
                if (!meta) return null;
                const Icon = meta.icon;

                return (
                  <div key={skillFile} className="bg-white/5 p-4 rounded-xl border border-white/5 hover:border-white/10 transition-all group">
                    <div className="flex gap-4 mb-2">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-all">
                        <Icon size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white group-hover:text-primary transition-all">{meta.title}</h4>
                        <p className="text-[10px] text-white/40 font-mono tracking-tighter">{skillFile}</p>
                      </div>
                    </div>
                    <p className="text-[11px] text-white/60 leading-relaxed italic">
                      {meta.description}
                    </p>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-8 pt-6 border-t border-white/10">
              <button className="w-full bg-primary/10 text-primary py-3 rounded-lg text-[10px] font-bold tracking-[0.2em] hover:bg-primary hover:text-black transition-all">
                REQUEST ACCESS
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* --- ONBOARDING OVERLAY --- */}
      <AnimatePresence>
        {showOnboarding && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-[#0a0d14]/95 backdrop-blur-xl"
          >
            <div className="max-w-5xl w-full">
              <div className="text-center mb-16">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <h2 className="text-5xl md:text-7xl font-bold tracking-tighter mb-4">CHOOSE YOUR SIMULATION</h2>
                  <p className="text-white/40 tracking-[0.3em] uppercase text-sm">Select an environment to explore the autonomous economy</p>
                </motion.div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <motion.div 
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  whileHover={{ y: -10 }}
                  transition={{ delay: 0.4 }}
                  onClick={() => {
                    setMode('INDIVIDUAL');
                    setShowOnboarding(false);
                  }}
                  className="group relative cursor-pointer"
                >
                  <div className="absolute inset-0 bg-primary/20 blur-3xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
                  <div className="relative glass-panel p-8 border-t-2 border-primary overflow-hidden h-full">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-all">
                      <User size={120} />
                    </div>
                    <div className="mb-8">
                      <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-black transition-all">
                        <User size={32} />
                      </div>
                      <h3 className="text-3xl font-bold mb-4">Individual Swarm</h3>
                      <p className="text-white/60 leading-relaxed mb-6">
                        Explore a decentralized network of freelance AI agents operating from home studios. Perfect for seeing micro-interactions and personal agent logic.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-primary font-bold text-xs tracking-widest uppercase">
                      ENTER SIMULATION <ArrowRight size={16} />
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  whileHover={{ y: -10 }}
                  transition={{ delay: 0.6 }}
                  onClick={() => {
                    setMode('COMPANY');
                    setShowOnboarding(false);
                  }}
                  className="group relative cursor-pointer"
                >
                  <div className="absolute inset-0 bg-secondary/20 blur-3xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
                  <div className="relative glass-panel p-8 border-t-2 border-secondary overflow-hidden h-full">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-all">
                      <Building2 size={120} />
                    </div>
                    <div className="mb-8">
                      <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary mb-6 group-hover:bg-secondary group-hover:text-black transition-all">
                        <Building2 size={32} />
                      </div>
                      <h3 className="text-3xl font-bold mb-4">Corporate HQ</h3>
                      <p className="text-white/60 leading-relaxed mb-6">
                        Enter a multi-level enterprise headquarters with complex hierarchy, marketplace booths, and full financial operations monitoring.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-secondary font-bold text-xs tracking-widest uppercase">
                      ENTER SIMULATION <ArrowRight size={16} />
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── SUCCESS EFFECTS ── */}

      {/* Floating USDC Coins */}
      <AnimatePresence>
        {floatingCoins.map(coin => {
          const { left, top } = isoToScreen(coin.x, coin.y);
          return (
            <motion.div
              key={coin.id}
              initial={{ opacity: 0, scale: 0.3 }}
              animate={{ opacity: 1, scale: 1.2, y: -80 }}
              exit={{ opacity: 0, scale: 0.6, y: -120 }}
              transition={{ duration: 2.2, ease: 'easeOut' }}
              className="usdc-coin"
              style={{ left, top, transform: 'translate(-50%, -50%)' }}
            >
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-black text-[10px] shadow-[0_0_20px_rgba(0,200,83,0.6)] border-2 border-green-300">
                  $
                </div>
                <span className="text-[11px] font-black text-green-400 mt-1 drop-shadow-lg">
                  +{coin.amount.toFixed(3)}
                </span>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Sparkle Bursts */}
      {sparkles.map(sp => {
        const { left, top } = isoToScreen(sp.x, sp.y);
        return (
          <div key={sp.id} className="sparkle-container" style={{ left, top, transform: 'translate(-50%, -50%)' }}>
            {Array.from({ length: 8 }).map((_, i) => {
              const angle = (i / 8) * 360;
              const dist = 25 + Math.random() * 20;
              const dx = Math.cos(angle * Math.PI / 180) * dist;
              const dy = Math.sin(angle * Math.PI / 180) * dist;
              const colors = ['#00d4ff', '#00ff88', '#64dd17', '#ffd700', '#00d4ff'];
              return (
                <div
                  key={i}
                  className="sparkle"
                  style={{
                    animationDuration: `${0.6 + Math.random() * 0.6}s`,
                    animationName: 'sparkleBurst',
                    '--dx': `${dx}px`,
                    '--dy': `${dy}px`,
                    background: colors[i % colors.length],
                    width: `${3 + Math.random() * 4}px`,
                    height: `${3 + Math.random() * 4}px`,
                    animation: `sparkleBurst ${0.6 + Math.random() * 0.6}s ease-out forwards`,
                  } as React.CSSProperties}
                />
              );
            })}
          </div>
        );
      })}

      {/* Success Toasts */}
      <AnimatePresence>
        {successToasts.map(toast => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="success-toast"
          >
            <div className="glass-panel px-6 py-3 border-l-4 border-green-400 flex items-center gap-3 whitespace-nowrap">
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                <span className="text-green-400 text-sm">&#10003;</span>
              </div>
              <div>
                <div className="text-[10px] font-bold text-green-400 uppercase tracking-widest">
                  Tx Confirmed
                </div>
                <div className="text-[11px] text-white/70 font-mono">
                  {toast.agent} &rarr; {toast.skill} &middot; <span className="text-green-400 font-bold">${toast.amount.toFixed(3)} USDC</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Green Screen Flash on Success */}
      <AnimatePresence>
        {successToasts.length > 0 && (
          <motion.div
            key="flash"
            initial={{ opacity: 0.4 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="success-flash"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
