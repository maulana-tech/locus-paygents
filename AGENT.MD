## 1. EXECUTIVE SUMMARY

Sistem simulasi ekonomi agent-agent dimana AI Agents beroperasi sebagai "pekerja kantoran" dalam environment isometric 3D/2.5D, mampu melakukan transaksi finansial autonomous menggunakan Locus Payment Infrastructure. Agents dapat saling membeli/menjual services, melayani consumer-facing transactions, dan menangani operasi finansial bisnis real.

### Core Value Proposition
- **Visual Commerce**: Transaksi USDC terlihat mengalir antar agent dalam real-time
- **Autonomous Economy**: Self-governing agents dengan Locus smart wallets
- **Triple Capability**: B2C (consumer), B2B (agent-to-agent), dan Financial Operations dalam satu ekosistem

---

## 2. UI/UX DESIGN SPECIFICATIONS (ISOMETRIC)

### 2.1 Visual Style Guide
```
Perspective: 30° isometric (2:1 pixel ratio)
Grid System: 64x32 pixel tiles (isometric diamond)
Z-Index Layering: Floor (0) → Furniture (1) → Agents (2) → UI (3) → Effects (4)

Color Palette:
  - Background: #1a1f2e (Dark navy office)
  - Floor Grid: #2d3748 dengan subtle grid pattern
  - Agents by Role:
    * Consumer: Cyan #00d4ff (headset icon)
    * Provider: Gold #ffd700 (WiFi icon)
    * Procurement: Magenta #ff00ff (briefcase icon)
    * Treasury: Emerald #00c853 (calculator icon)
  - Transaction Lines: Animated USDC green pulse #00c853 → #64dd17
  - Alert/Error: Red #ff5252 dengan exclamation bounce
  - UI Panels: Glassmorphism rgba(255,255,255,0.1) + backdrop-blur(10px)
```

### 2.2 Environment Layout (Isometric Office Building)
```
[FLOOR 3] Financial Operations (Rooftop Access)
├── Treasury Desk (Master Wallet Control)
├── Compliance Station (Policy Monitoring)
├── Trading Floor (High-frequency Microtransactions)
└── Elevator to Floor 2

[FLOOR 2] B2B Marketplace (Open Floor Plan)
├── API Provider Booths:
│   ├── Firecrawl Booth (Web Scraping) - Booth A1
│   ├── Exa Search Booth - Booth A2
│   ├── OpenAI Inference Booth - Booth B1
│   └── Custom Service Booths - Booth B2-C4
├── Negotiation Tables (Agent-to-Agent Deals)
├── Contract Signing Stations
└── Elevator to Floor 1

[FLOOR 1] Consumer Services (Lobby)
├── Reception Desk (Onboarding/Help)
├── Kiosk Terminals (Self-service)
├── Consumer Agents Desks (Customer Facing)
├── Checkout Counters (Locus Payment Terminals)
└── Waiting Area (Simulated Customers)

[BASEMENT] System Core (Invisible Layer)
├── Locus API Integration Hub
├── Transaction Ledger
└── Agent Spawn Points
```

### 2.3 Agent Visual Representation
- **Sprite Size**: 48x48px isometric dengan 8-directional movement
- **Animation States**:
  - *Idle*: Breathing effect (scale 1.0 → 1.05 loop 2s)
  - *Walk*: 4-frame cycle (0.2s per frame) dengan bobbing motion
  - *Transact*: Glow pulse effect + floating USDC coin animation
  - *Error*: Red shake animation + exclamation mark popup
  - *Approval Pending*: Purple pulsating ring + hourglass icon

- **Status Indicators** (Ring di bawah sprite):
  - 💚 Solid Green: Available/Idle
  - 💛 Solid Yellow: Working/Processing
  - 💙 Pulsing Blue: In Transaction
  - 💜 Pulsing Purple: Waiting Human Approval
  - ❤️ Red Flash: Error/Blocked

- **Role Accessories**:
  - Headset = Consumer Service
  - Briefcase = Procurement/B2B
  - WiFi Symbol = API Provider
  - Calculator = Treasury/Financial

---

## 3. AGENT ARCHITECTURE & BEHAVIOR

### 3.1 Agent Class: ConsumerAgent (B2C)
```yaml
agent_id: consumer_agent_{uuid}
role: consumer_facing
sprite_variant: headset_cyan
location_preference: Floor 1 (Kiosk Area)

wallet_config:
  type: locus_subwallet
  api_key: claw_prod_xxx
  allowance: 500 USDC/day
  max_transaction: 50 USDC
  approval_threshold: 25 USDC

capabilities:
  - browse_catalog:
      endpoint: GET /api/wrapped/md
      behavior: Query available services dari providers
  - process_checkout:
      sdk: locus-checkout-sdk
      behavior: Generate QR code untuk customer payments
  - customer_support:
      behavior: Handle refunds via Locus API
  - escalate_approval:
      trigger: transaction > 25 USDC
      action: Generate approval_url, notify human dashboard

behavioral_logic:
  patrol_pattern:
    - Move random dalam radius 5 tiles dari assigned desk
    - Approach "customer" NPCs (simulated)
    - Return to desk setiap 30s idle
  
  transaction_flow:
    - Detect customer proximity (< 2 tiles)
    - Play "greet" animation
    - Calculate service bundle cost
    - Display QR Code (visual popup)
    - Wait payment confirmation (polling)
    - On success: Play "success" animation, deliver service
    - On 202: Change state to APPROVAL_PENDING

visual_states:
  idle: breathing + occasional "look around"
  serving: headset glow + typing animation
  processing: screen glow effect di depan agent
```

### 3.2 Agent Class: ServiceProviderAgent (B2B Seller)
```yaml
agent_id: provider_agent_{uuid}
role: service_seller
sprite_variant: wifi_gold
location_preference: Floor 2 (Assigned Booth)

inventory:
  services:
    - id: firecrawl_scrape
      name: Web Scraping
      price: 0.01 USDC
      endpoint: /api/wrapped/firecrawl/scrape
      icon: 🕷️
      stock: unlimited
      
    - id: exa_search
      name: AI Search
      price: 0.03 USDC
      endpoint: /api/wrapped/exa/search
      icon: 🔍
      
    - id: gpt4_summarize
      name: Content Generation
      price: 0.05 USDC
      endpoint: /api/wrapped/openai/chat
      icon: ✍️

wallet_config:
  type: locus_merchant
  settlement: instant_to_wallet
  payout_address: "0x..."

capabilities:
  - broadcast_inventory:
      behavior: Publish available services ke message bus setiap 10s
      visual: Floating price tags muncul di atas booth
  - fulfill_service:
      behavior: Execute API call setelah pembayaran confirmed
      visual: Progress bar muncul di atas agent (1-2s)
  - dynamic_pricing:
      behavior: Adjust price based on demand (±20%)
      trigger: High queue length atau low inventory time

behavioral_logic:
  stationary: true (tetap di booth)
  interaction_radius: 3 tiles
  queue_management:
    - Max 3 buyers dalam antrian
    - Queue visualized sebagai dots di depan booth
    - Process FIFO (First In First Out)

revenue_tracking:
  - Real-time revenue counter di atas booth
  - Daily target progress bar
  - "Top Seller" badge jika revenue > threshold
```

### 3.3 Agent Class: ProcurementAgent (B2B Buyer)
```yaml
agent_id: procurement_agent_{uuid}
role: procurement_specialist
sprite_variant: briefcase_magenta
location_preference: Mobile (Floor 2)

wallet_config:
  type: locus_subwallet
  bulk_discount_threshold: 100 USDC
  vendor_whitelist: ["provider_firecrawl", "provider_exa"]

capabilities:
  - market_research:
      behavior: Compare prices antar providers (visit 3+ booths)
      visual: Comparison chart popup sementara
  - bulk_negotiate:
      behavior: Request volume discount untuk qty > 10
      visual: Handshake animation dengan provider
  - quality_verify:
      behavior: Test service sebelum bulk purchase
  - escrow_management:
      behavior: Gunakan Locus approval flow untuk large purchases

behavioral_logic:
  wander_pattern:
    - Random walk di Floor 2 dengan speed 2 tiles/sec
    - Stop di setiap provider booth untuk 3s (window shopping)
    - Compare prices, pilih best value
  
  purchase_decision_tree:
    - IF single_item: Buy immediately (if < threshold)
    - IF bulk: Initiate negotiation (handshake animation)
    - IF new_provider: Request sample first (test transaction)
    - IF insufficient_budget: Return to Treasury Agent

goal_oriented:
  current_goal: "Purchase 100 scrape credits"
  progress: 0/100
  budget_allocated: 2.00 USDC (expecting 0.02 discount)
```

### 3.4 Agent Class: TreasuryAgent (Financial Ops)
```yaml
agent_id: treasury_agent_{uuid}
role: financial_operations
sprite_variant: calculator_emerald
location_preference: Floor 3 (Fixed Desk)

wallet_config:
  type: locus_master_wallet
  can_rebalance: true
  audit_frequency: every 5 minutes

responsibilities:
  - budget_allocation:
      behavior: Monitor all agent balances, auto-topup jika < 10 USDC
      visual: Green lines mengalir dari Treasury ke agent yang di-refill
  
  - compliance_monitoring:
      behavior: Scan transactions untuk anomaly detection
      trigger: Unusual spending patterns, velocity checks
      action: Freeze agent, trigger alert
  
  - reconciliation:
      behavior: End-of-day balance matching
      visual: Spreadsheet-like overlay muncul di screen Treasury
  
  - reporting:
      behavior: Generate real-time charts (volume, active agents, revenue)

capabilities:
  - emergency_freeze:
      behavior: Hentikan semua transactions agent tertentu
      visual: Red lock icon muncul di agent target
  - policy_update:
      behavior: Ubah allowance/limits via API
      propagation: Real-time ke semua affected agents

behavioral_logic:
  stationary: true
  scan_animation:
    - Radar sweep effect setiap 5s (monitoring)
    - Status lights untuk setiap floor (Green=OK, Red=Alert)
  
  alert_protocols:
    - Level 1 (Yellow): Agent approaching limit (popup warning)
    - Level 2 (Orange): Policy violation (freeze transactions)
    - Level 3 (Red): Critical anomaly (notify human, stop all)
```

---

## 4. MOVEMENT & PATHFINDING SYSTEM

### 4.1 Isometric Grid System
```typescript
interface IsometricGrid {
  tileWidth: 64;
  tileHeight: 32;
  layers: 3; // Floor 1, 2, 3
  
  // Coordinate conversion
  cartesianToIso(x: number, y: number): {isoX: number, isoY: number};
  isoToCartesian(isoX: number, isoY: number): {x: number, y: number};
}

class AgentMovement {
  currentPos: Tile {x, y, floor};
  targetPos: Tile;
  path: Tile[];
  speed: 2; // tiles per second
  
  // A* Pathfinding dengan obstacle avoidance
  calculatePath(target: Tile): Tile[] {
    return astar(this.currentPos, target, obstacles);
  }
  
  // Visual movement dengan easing
  moveAlongPath() {
    this.path.forEach((tile, index) => {
      const screenPos = isoToScreen(tile.x, tile.y, tile.floor);
      
      // Sprite animation
      this.sprite.animateTo(screenPos.x, screenPos.y, {
        duration: 500, // ms per tile
        easing: "easeInOutQuad"
      });
      
      // Direction-based sprite rotation
      this.updateDirection(tile);
    });
  }
}
```

### 4.2 Proximity Detection & Interaction
```javascript
// Collision radius untuk commerce
const INTERACTION_RADIUS = 2; // tiles

function checkProximity(agentA, agentB) {
  const distance = calculateDistance(agentA.pos, agentB.pos);
  
  if (distance <= INTERACTION_RADIUS && agentA.floor === agentB.floor) {
    triggerCommerceInteraction(agentA, agentB);
  }
}

// Visual cues saat proximity terdeteksi
function triggerCommerceInteraction(buyer, seller) {
  // Speech bubble muncul dengan icon transaksi
  buyer.showIntentBubble("💰");
  seller.showPriceBubble("$0.01");
  
  // Pause movement selama 2s untuk "negotiation"
  buyer.pause();
  seller.pause();
  
  // Execute transaction logic (async)
  setTimeout(() => executeTransaction(buyer, seller), 2000);
}
```

### 4.3 Transaction Visual Effects
```css
/* USDC Flow Animation */
.transaction-beam {
  position: absolute;
  height: 4px;
  background: linear-gradient(90deg, transparent, #00c853, #64dd17, transparent);
  box-shadow: 0 0 15px #00c853, 0 0 30px #00c853;
  border-radius: 2px;
  animation: flowBeam 1.5s ease-in-out;
  z-index: 1000;
}

@keyframes flowBeam {
  0% {
    width: 0;
    opacity: 0;
    left: startX;
    top: startY;
  }
  50% {
    opacity: 1;
  }
  100% {
    width: 100%;
    opacity: 0;
    left: endX;
    top: endY;
  }
}

/* Floating Text untuk amounts */
.floating-text {
  position: absolute;
  font-family: 'Courier New', monospace;
  font-weight: bold;
  font-size: 14px;
  animation: floatUp 2s ease-out forwards;
  pointer-events: none;
}

.floating-text.negative {
  color: #ff5252;
  content: "-$X.XX";
}

.floating-text.positive {
  color: #00c853;
  content: "+$X.XX";
}

@keyframes floatUp {
  0% { transform: translateY(0); opacity: 1; }
  100% { transform: translateY(-50px); opacity: 0; }
}
```

---

## 5. COMMERCE MECHANICS & TRANSACTION FLOWS

### 5.1 Service Catalog Definition
```yaml
# catalog.yaml - Services available in simulation
services:
  web_scraping:
    provider_id: firecrawl_agent_01
    endpoint: /api/wrapped/firecrawl/scrape
    base_price: 0.01
    currency: USDC
    location: Floor 2, Booth A1
    description: "Scrape any URL, return markdown"
    icon: "🕷️"
    
  search_api:
    provider_id: exa_agent_02
    endpoint: /api/wrapped/exa/search
    base_price: 0.03
    currency: USDC
    location: Floor 2, Booth A2
    description: "AI-powered web search"
    icon: "🔍"
    
  content_gen:
    provider_id: openai_agent_03
    endpoint: /api/wrapped/openai/chat
    base_price: 0.05
    currency: USDC
    location: Floor 2, Booth B1
    description: "GPT-4 text generation"
    icon: "✍️"
    
  human_design:
    provider_id: task_agent_04
    endpoint: /api/tasks/create
    base_price: 5.00
    currency: USDC
    location: Floor 1, Desk 5
    description: "Human graphic designer"
    icon: "👨‍🎨"
    requires_approval: true
```

### 5.2 Agent-to-Agent (A2A) Transaction Flow

```typescript
async function executeA2ATransaction(
  buyer: ProcurementAgent,
  seller: ServiceProviderAgent,
  service: Service
): Promise<TransactionResult> {
  
  // STEP 1: Physical Approach (Visual)
  await buyer.moveTo(seller.location);
  buyer.setState("NEGOTIATING");
  seller.setState("NEGOTIATING");
  
  // STEP 2: Discovery (Locus API)
  const quote = await fetch(
    `https://api.paywithlocus.com/api/wrapped/md?provider=${seller.id}`,
    { headers: { Authorization: `Bearer ${buyer.locusApiKey}` } }
  );
  
  // STEP 3: Policy Check (Pre-transaction)
  if (quote.price > buyer.policy.max_transaction) {
    buyer.showAlert("Exceeds limit!");
    return { status: "BLOCKED_BY_POLICY", code: 403 };
  }
  
  // STEP 4: Visual Negotiation (2 detik)
  playAnimation("handshake", buyer, seller);
  await delay(2000);
  
  // STEP 5: Execute Payment (Locus Wrapped API)
  const startTime = Date.now();
  const result = await fetch(
    `https://api.paywithlocus.com/api/wrapped/${service.endpoint}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${buyer.locusApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(service.params)
    }
  );
  
  // STEP 6: Visual Feedback berdasarkan Response
  switch(result.status) {
    case 200: // Success
      drawTransactionBeam(buyer.position, seller.position, quote.price);
      buyer.showFloatingText(`-${quote.price} USDC`, "red");
      seller.showFloatingText(`+${quote.price} USDC`, "green");
      seller.incrementRevenue(quote.price);
      buyer.addToInventory(service.id);
      
      // Sparkle effect di seller booth
      playEffect("success_sparkle", seller.position);
      break;
      
    case 202: // Pending Approval
      buyer.setState("APPROVAL_PENDING");
      const data = await result.json();
      
      // Kirim ke human dashboard
      notifyHuman({
        type: "approval_required",
        url: data.data.approval_url,
        amount: data.data.estimated_cost_usdc,
        agent: buyer.id
      });
      
      // Visual: Purple hourglass di atas buyer
      buyer.showStatusIcon("⏳");
      break;
      
    case 402: // Insufficient Balance
      buyer.setState("ERROR");
      buyer.showAlert("Insufficient USDC!");
      
      // Auto-request topup dari Treasury
      treasuryAgent.requestTopup(buyer, quote.price * 2);
      break;
      
    case 403: // Policy/Disabled
      buyer.setState("ERROR");
      buyer.showAlert("Transaction blocked");
      break;
  }
  
  // Reset states
  setTimeout(() => {
    buyer.setState("IDLE");
    seller.setState("IDLE");
  }, 3000);
  
  return result;
}
```

### 5.3 Consumer-Facing (B2C) Transaction Flow

```typescript
class ConsumerKioskAgent {
  async handleCustomerRequest(customerRequest: string) {
    // 1. Analyze needs
    const requirements = this.nlp.parse(customerRequest);
    const services = this.matchServices(requirements);
    
    // 2. Calculate total
    const totalCost = services.reduce((sum, s) => sum + s.price, 0);
    
    // 3. Generate Locus Checkout Session
    const checkout = await locus.createCheckout({
      amount: totalCost,
      currency: "USDC",
      description: `Bundle: ${services.map(s => s.name).join(", ")}`,
      metadata: {
        agent_id: this.id,
        services: services,
        customer_session: uuid()
      }
    });
    
    // 4. Visual: Display QR Code di "screen" kiosk
    this.displayQRCode(checkout.url);
    this.showFloatingText("Scan to pay", "white");
    
    // 5. Polling untuk payment confirmation
    const maxWait = 300000; // 5 menit
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWait) {
      const status = await locus.checkPaymentStatus(checkout.session_id);
      
      if (status === "completed") {
        // Execute services
        this.hideQRCode();
        this.playAnimation("success");
        
        const results = await Promise.all(
          services.map(s => this.callServiceProvider(s))
        );
        
        // Deliver to customer (visual)
        this.deliverProduct(results);
        return { success: true, results };
      }
      
      if (status === "failed") {
        this.showAlert("Payment failed");
        return { success: false, error: "payment_failed" };
      }
      
      await delay(2000); // Poll every 2s
    }
    
    return { success: false, error: "timeout" };
  }
}
```

### 5.4 Financial Operations Flow (Treasury)

```typescript
class TreasuryOperations {
  async runAuditCycle() {
    const agents = this.getAllActiveAgents();
    
    for (const agent of agents) {
      // Fetch real-time data dari Locus
      const balance = await locus.getBalance(agent.walletAddress);
      const recentTx = await locus.getTransactions(agent.apiKey, { limit: 10 });
      
      // Update visual status
      this.updateAgentStatusBubble(agent, {
        balance: balance,
        recent_tx_count: recentTx.length
      });
      
      // Check anomalies
      if (this.detectAnomaly(recentTx)) {
        await this.handleAnomaly(agent, recentTx);
      }
      
      // Auto-rebalance jika low balance
      if (balance < 10) {
        await this.rebalance(agent, 100);
        
        // Visual: Green beam dari Treasury ke agent
        this.drawRebalanceBeam(agent);
        agent.showFloatingText("+100 USDC Refill", "blue");
      }
    }
  }
  
  detectAnomaly(transactions: Tx[]): boolean {
    // Velocity check: >10 tx dalam 1 menit
    const recentCount = transactions.filter(
      tx => Date.now() - tx.timestamp < 60000
    ).length;
    
    if (recentCount > 10) return true;
    
    // Amount anomaly: 3x above average
    const avgAmount = this.calculateAverage(transactions);
    const lastTx = transactions[0];
    if (lastTx.amount > avgAmount * 3) return true;
    
    // New merchant check
    const trustedMerchants = this.getTrustedList();
    if (!trustedMerchants.includes(lastTx.merchant)) return true;
    
    return false;
  }
  
  async handleAnomaly(agent: Agent, txs: Tx[]) {
    // Freeze agent immediately
    agent.freeze();
    agent.setState("ERROR");
    agent.showStatusIcon("🚫");
    
    // Alert ke human dashboard
    this.notifyHuman({
      severity: "HIGH",
      agent: agent.id,
      issue: "Suspicious activity detected",
      transactions: txs
    });
    
    // Tunggu human decision (unfreeze atau investigate)
  }
}
```

---

## 6. PAYWITHLOCUS INTEGRATION

### 6.1 Configuration & Setup
```javascript
// config/locus.config.js
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
      payoutAddress: process.env.PROVIDER_PAYOUT_ADDR
    },
    treasury: {
      walletType: "master",
      canRebalance: true,
      auditInterval: 300000 // 5 minutes
    }
  },
  
  wrappedApis: [
    "firecrawl/scrape",
    "firecrawl/crawl", 
    "exa/search",
    "openai/chat",
    "tasks/create"
  ]
};
```

### 6.2 Service Discovery Integration
```typescript
class LocusCatalogManager {
  async refreshServiceCatalog() {
    // Fetch dari Locus Wrapped API index
    const response = await fetch(
      `${LOCUS_BASE}/api/wrapped/md`,
      { headers: { Authorization: `Bearer ${this.masterKey}` } }
    );
    
    const markdown = await response.text();
    const services = this.parseMarkdownCatalog(markdown);
    
    // Update visual map - spawn providers ke booths
    services.forEach((service, index) => {
      const booth = this.office.getBoothByIndex(index);
      
      if (!this.agentExists(service.provider)) {
        const agent = this.spawnProviderAgent(service, booth);
        agent.setInventory([service]);
      } else {
        // Update existing agent inventory
        const agent = this.getAgent(service.provider);
        agent.addService(service);
      }
    });
  }
  
  // MCP Integration untuk LLM-based queries
  async queryViaMCP(agentGoal: string, requestingAgent: Agent) {
    const mcpClient = new LocusMCPClient({
      url: "https://mcp.paywithlocus.com/mcp",
      apiKey: requestingAgent.locusApiKey
    });
    
    return await mcpClient.query({
      goal: agentGoal,
      context: requestingAgent.memory
    });
  }
}
```

### 6.3 Error Handling & Human-in-the-Loop
```typescript
const ERROR_HANDLING = {
  200: {
    action: "success",
    visual: "green_checkmark",
    continue: true
  },
  202: {
    action: "pending_approval",
    visual: "purple_hourglass",
    continue: false,
    human_intervention: {
      type: "approval_url",
      notify: "dashboard",
      timeout: 3600000 // 1 hour
    }
  },
  402: {
    action: "insufficient_balance",
    visual: "red_warning",
    continue: false,
    auto_resolve: {
      action: "request_topup",
      from: "treasury",
      amount: "auto_calculated"
    }
  },
  403: {
    action: "policy_violation",
    visual: "red_lock",
    continue: false,
    log: "security_audit"
  },
  502: {
    action: "upstream_error",
    visual: "yellow_warning",
    continue: true, // Retry logic
    retry: {
      count: 3,
      delay: 1000
    }
  }
};
```

---

## 7. SIMULATION SCENARIOS

### Scenario A: End-to-End Research Task
```
Timeline:
T+0s:  ConsumerAgent menerima request "Research AI trends 2025"
T+2s:  Agent berjalan ke Exa Booth (Floor 2)
T+5s:  Transaction: -0.03 USDC → Exa search query
T+8s:  Hasil diterima, agent berjalan ke Firecrawl Booth
T+12s: Transaction: -0.01 USDC → Scrape 3 URLs
T+20s: Agent berjalan ke OpenAI Booth  
T+25s: Transaction: -0.05 USDC → Summarize content
T+30s: Agent kembali ke Floor 1, deliver hasil ke customer
T+35s: Total cost: 0.09 USDC (tercatat di ledger)

Visual Effects:
- 3 transaction beams (cyan lines) terlihat mengalir
- Floating text "-$0.03", "-$0.01", "-$0.05" muncul berurutan
- Provider booths menunjukkan revenue increase
- Treasury Agent mencatat transaksi di Floor 3
```

### Scenario B: Bulk Procurement dengan Negotiation
```
Timeline:
T+0s:  ProcurementAgent membutuhkan 100 scrape credits
T+5s:  Agent mengunjungi Provider A (Firecrawl) - Quote: 1.00 USDC
T+15s: Agent mengunjungi Provider B (ScraperX) - Quote: 0.90 USDC  
T+25s: Agent mengunjungi Provider C (WebBot) - Quote: 1.10 USDC
T+30s: Comparison chart muncul di UI (Best: Provider B)
T+35s: Agent kembali ke Provider B, initiate negotiation
T+40s: Handshake animation, bulk discount approved: 0.80 USDC
T+45s: Transaction: -0.80 USDC (saving 0.20 USDC)
T+50s: ProcurementAgent menerima 100 credits, update inventory

Visual Effects:
- Path visualization (trail) menunjukkan route comparison
- Comparison table popup di tengah layar (3s)
- Handshake animation diikuti sparkle effect
- Floating text "SAVED $0.20" berwarna gold muncul
```

### Scenario C: Financial Operations & Compliance
```
Timeline:
T+0s:  TreasuryAgent men-scan semua agents (radar sweep)
T+5s:  Alert: ConsumerAgent #7 memiliki spending pattern anomali
        (15 transactions dalam 2 menit, biasanya 2/jam)
T+8s:  TreasuryAgent mengubah status ConsumerAgent #7 menjadi "FROZEN"
T+10s: Red lock icon muncul di atas ConsumerAgent #7
T+12s: Notification dikirim ke Human Dashboard
T+15s: TreasuryAgent melakukan auto-topup ke agents lain yang low balance
        (3 agents menerima refill)
T+20s: Green beams terlihat mengalir dari Treasury ke 3 agents
T+30s: End-of-day report generated di Treasury screen

Visual Effects:
- Radar sweep hijau setiap 5 detik
- Red pulse saat anomaly detected
- Freeze effect (greyscale) pada agent yang di-freeze
- Green refill beams dengan particle effects
- Real-time chart updates di Floor 3 monitor
```

---

## 8. TECHNICAL IMPLEMENTATION STACK

### Core Technologies
- **Frontend Engine**: PixiJS v7 (2D WebGL) atau Three.js (untuk 3D isometric)
- **State Management**: Redux + Redux-Saga ( untuk agent state machines)
- **Backend**: Node.js + Express (API gateway)
- **Real-time**: Socket.io (live transaction updates)
- **Database**: 
  - PostgreSQL (transaction ledger, agent profiles)
  - Redis (real-time positions, state cache)
- **Blockchain Integration**: 
  - PayWithLocus SDK
  - Ethers.js (Base network interactions)
  - USDC Contract ABIs

### Agent AI Logic
- **Behavior Trees**: `behaviortree` npm package
- **Pathfinding**: `astar-typescript` atau custom A* implementation
- **NLP**: OpenAI API via Locus Wrapped (untuk consumer requests)
- **Decision Making**: Rule-based systems dengan fuzzy logic untuk pricing

### Visual Assets Required
```
/sprites
  /agents
    consumer_idle_{1-4}.png
    consumer_walk_{N,NE,E,SE,S,SW,W,NW}_{1-4}.png
    provider_idle_{1-4}.png
    procurement_walk_...
    treasury_idle_...
  /effects
    transaction_beam.png
    sparkle_particle.png
    status_icons (check, x, hourglass, lock)
  /environment
    floor_tiles_iso.png
    furniture (desk, booth, terminal)
    walls_and_elevator
```

---

## 9. DEPLOYMENT & TESTING

### Beta Environment Setup
1. Register di `beta.paywithlocus.com` dengan code `BETA-ACCESS-DOCS`
2. Create agent wallets (isolated dari production)
3. Request free USDC credits untuk testing
4. Setup webhook endpoints untuk transaction notifications

