import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import { locusConfig } from '../config/locus-config';
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
}

interface Beam {
  id: string;
  fromPos: { x: number; y: number };
  toPos: { x: number; y: number };
}

// --- Config ---
const GRID_SIZE = 10;
const TILE_SIZE = 64;
const BOOTHS = [
  { id: 'A1', x: 2, y: 2, service: 'firecrawl/scrape', name: 'Firecrawl Booth' },
  { id: 'A2', x: 2, y: 6, service: 'exa/search', name: 'Exa Search Booth' },
  { id: 'B1', x: 7, y: 2, service: 'openai/chat', name: 'OpenAI Booth' },
  { id: 'B2', x: 7, y: 7, service: 'tasks/create', name: 'Task Booth' },
];

// --- Helper Functions ---
const isoToScreen = (x: number, y: number) => {
  const left = (x - y) * (TILE_SIZE / 2);
  const top = (x + y) * (TILE_SIZE / 4);
  return { left: `calc(50% + ${left}px)`, top: `calc(50% + ${top}px)` };
};

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
      transition={{ duration: 1.5, ease: "linear" }}
      style={{ zIndex: 20, transform: 'translate(-50%, -85%)' }}
    >
      {/* Dynamic Status Ring */}
      <div className={`status-ring ${statusClass}`} />
      
      {/* Intent Bubble */}
      <AnimatePresence>
        {agent.target && agent.role === 'PROCUREMENT' && (
          <motion.div 
            initial={{ scale: 0, y: 10, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0, y: 10, opacity: 0 }}
            className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] p-1 rounded-full shadow-xl z-30 flex items-center gap-1 px-2 py-0.5 whitespace-nowrap"
          >
            <span className="text-[8px] font-bold">RESEARCHING</span> 🔍
          </motion.div>
        )}
        {agent.status === 'WORKING' && agent.skills.length > 0 && Math.random() < 0.3 && (
            <motion.div 
              initial={{ scale: 0, y: 10, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0, y: 10, opacity: 0 }}
              className="absolute -top-12 left-1/2 -translate-x-1/2 bg-primary text-black text-[10px] p-1 rounded-full shadow-xl z-30 flex items-center gap-1 px-2 py-0.5 whitespace-nowrap"
            >
              <Zap size={8} /> <span className="text-[7px] font-bold uppercase">{skillMetadata[agent.skills[0]]?.title || "Skill"}</span>
            </motion.div>
        )}
        {agent.status === 'TRANSACTING' && (
          <motion.div 
            initial={{ scale: 0, y: 10, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] p-1 rounded-full shadow-xl z-30"
          >
            {agent.role === 'PROCUREMENT' ? '💰' : '🤝'}
          </motion.div>
        )}
        {agent.status === 'ERROR' && (
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-12 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[10px] p-1 rounded-full shadow-xl z-30"
          >
            🚫
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Character Visual - 3D Sprite */}
      <div className={`agent-character-sprite ${getRoleClass(agent.role)} relative`}>
        {/* Floating Tag */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex flex-col items-center">
          <div className="whitespace-nowrap bg-black/80 backdrop-blur-md px-2 py-0.5 rounded text-[8px] font-bold border border-white/10 uppercase tracking-tighter text-white">
            {agent.name}
          </div>
          <div className="text-[9px] font-mono text-primary font-bold bg-black/40 px-1 rounded mt-0.5">
            {agent.balance.toFixed(2)}
          </div>
        </div>

        {/* Mode Indicator Accessory */}
        {agent.status === 'PENDING' && (
          <div className="absolute -right-2 top-0 bg-purple-600 text-white p-1 rounded-full animate-pulse shadow-lg">
            <Activity size={10} />
          </div>
        )}
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
  const [mode, setMode] = useState<SimulationMode>('INDIVIDUAL');
  const [currentFloor, setCurrentFloor] = useState(1);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [beams, setBeams] = useState<Beam[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);

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
    const aiInterval = setInterval(() => {
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
    }, 1000);
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

  const handleTransaction = useCallback((buyer: Agent, seller: Agent, amount: number, service: string) => {
    console.log(`Starting transaction: ${buyer.name} -> ${seller.name} (${amount} USDC)`);
    
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
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[#0a0d14]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,212,255,0.05),transparent)] pointer-events-none" />

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
          <div className="flex bg-black/40 rounded-full p-1 border border-white/10">
            <button 
              onClick={() => setMode('INDIVIDUAL')}
              className={`px-4 py-1.5 rounded-full text-[10px] font-bold transition-all flex items-center gap-2 ${mode === 'INDIVIDUAL' ? 'bg-primary text-black' : 'text-white/40 hover:text-white'}`}
            >
              <User size={12} /> INDIVIDUAL
            </button>
            <button 
              onClick={() => setMode('COMPANY')}
              className={`px-4 py-1.5 rounded-full text-[10px] font-bold transition-all flex items-center gap-2 ${mode === 'COMPANY' ? 'bg-primary text-black' : 'text-white/40 hover:text-white'}`}
            >
              <Building2 size={12} /> COMPANY
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
                <div key={tx.id} className="text-[10px] font-mono flex items-center gap-2 p-2 bg-white/5 border border-white/5 rounded">
                  <span className="text-primary">{tx.from}</span>
                  <ArrowRight size={8} />
                  <span className="text-white/60">{tx.to}</span>
                  <span className="ml-auto text-secondary font-bold">+{tx.amount}</span>
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

      {/* --- SIMULATION STAGE --- */}
      <div className="w-full h-full flex items-center justify-center overflow-hidden">
        <div className="relative">
          {/* Isometric Diamond Grid */}
          <div className="relative">
            {Array.from({ length: GRID_SIZE }).map((_, i) => 
              Array.from({ length: GRID_SIZE }).map((_, j) => {
                const { left, top } = isoToScreen(i, j);
                return (
                  <div 
                    key={`${i}-${j}`}
                    className="absolute border-[0.5px] border-white/10"
                    style={{
                      width: TILE_SIZE,
                      height: TILE_SIZE / 2,
                      left, top,
                      transform: 'translate(-50%, -50%)',
                      clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                      background: 'rgba(255,255,255,0.02)'
                    }}
                  />
                );
              })
            )}
          </div>

          {/* Transaction Beams */}
          <AnimatePresence>
            {beams.map(beam => {
              const from = isoToScreen(beam.fromPos.x, beam.fromPos.y);
              const to = isoToScreen(beam.toPos.x, beam.toPos.y);
              
              // Simplified line calculation between isometric points
              return (
                <motion.div 
                  key={beam.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="transaction-beam"
                  style={{
                    left: from.left,
                    top: from.top,
                    width: '150px', // Visual approximation
                    transform: `rotateZ(-30deg) translate(20px, -10px)`, // Iso adjustment
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

          {/* Booth Labels */}
          {currentFloor === 2 && BOOTHS.map(booth => {
            const { left, top } = isoToScreen(booth.x, booth.y);
            return (
              <div 
                key={booth.id} 
                className="absolute pointer-events-none flex flex-col items-center"
                style={{ left, top, transform: 'translate(-50%, -150%)', zIndex: 10 }}
              >
                <div className="bg-primary/20 border border-primary/40 px-2 py-0.5 rounded text-[8px] font-bold text-primary uppercase">
                  Booth {booth.id}
                </div>
                <div className="text-[7px] text-white/40 mt-0.5">{booth.name}</div>
              </div>
            );
          })}
          
          {/* Visual Floor Indicators */}
          <div className="absolute top-[350px] left-1/2 -translate-x-1/2 text-center pointer-events-none">
            <h2 className="text-8xl font-black tracking-tighter italic uppercase text-white/[0.03] select-none">
              {mode === 'INDIVIDUAL' ? "Freelance Swarm" : (
                currentFloor === 1 ? "Lobby" : currentFloor === 2 ? "Marketplace" : "Financial Ops"
              )}
            </h2>
          </div>
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
    </div>
  );
}
