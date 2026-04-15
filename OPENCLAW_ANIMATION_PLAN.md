# OpenClaw Transaction Visualization: Implementation Plan

**Objective**: Upgrade the static `Simulation.tsx` to a dynamic, event-driven visualization engine. The simulation must animate agents moving to target booths and firing transaction beams (visualizing USDC flow) whenever a mock or real OpenClaw transaction occurs.

This document serves as a step-by-step implementation guide for the AI Agent assigned to build this feature.

---

## Phase 1: Define Transaction Models & Event System

**Target File:** `src/pages/Simulation.tsx` (or a new types file)

1. **Define `OpenClawEvent` Interface:**
   Create an interface to represent incoming transactions from OpenClaw.

   ```typescript
   interface OpenClawEvent {
     id: string;
     buyerId: string; // Refers to an agent in the simulation (e.g., 'c1', 'i1')
     providerId: string; // Refers to a booth or provider agent (e.g., 'B1', 'c5')
     skillId: string; // e.g., 'openai/chat'
     amount: number; // e.g., 0.05
     status: "SUCCESS" | "FAILED";
     timestamp: number;
   }
   ```

2. **Create an Event Queue State:**
   Add a React state `const [eventQueue, setEventQueue] = useState<OpenClawEvent[]>([])` to queue incoming transactions so they can be processed sequentially without visual collision.

## Phase 2: Mock Trigger UI (Dev Panel)

**Target File:** `src/pages/Simulation.tsx`

1. **Build a "Dev Control Panel" Component:**
   - Render a fixed, semi-transparent div at the bottom-left or right of the screen.
   - Add a button labeled `"Mock OpenClaw Transaction"`.
2. **Implement the Mock Generator:**
   - When clicked, randomly select an idle agent (e.g., `Procure-X`) and a target booth (e.g., `OpenAI Booth`).
   - Push a generated `OpenClawEvent` to the `eventQueue`.

## Phase 3: The Animation Sequence (State Machine)

**Target File:** `src/pages/Simulation.tsx`

Create a `useEffect` hook that listens to `eventQueue`. If the queue has items, pop the first item and execute the following visual sequence:

1. **Step A: Pathfinding & Walking (0s - 2s)**
   - Find the `buyer` Agent in the `agents` state.
   - Update the buyer's `status` to `WORKING`.
   - Set the buyer's `target` to the `(x, y)` coordinates of the `provider/booth`.
   - _Visual Result:_ The CSS/Framer Motion will automatically interpolate the position, making the agent walk toward the booth.

2. **Step B: Transacting & Laser Beam (2s - 3.5s)**
   - Use `setTimeout` (approx 2 seconds) to wait for the walking animation to finish.
   - Update buyer's `status` to `TRANSACTING`.
   - Create a new `Beam` object connecting the buyer's position to the provider's position and add it to the `beams` state.
   - _Visual Result:_ A glowing energy beam (USDC transaction) fires from the agent to the booth.

3. **Step C: Economy Update (3.5s)**
   - Deduct `amount` from the buyer's `balance`.
   - Add `amount` to the provider's `revenue` / `balance`.
   - Push a `Transaction` log into the `transactions` state to update the UI History sidebar.

4. **Step D: Reset & Cleanup (4s)**
   - Remove the `Beam` from the state.
   - Set the buyer's `target` back to its original `(x, y)` spawn point (or let it roam).
   - Set buyer's `status` back to `IDLE`.
   - Proceed to the next item in the `eventQueue`.

## Phase 4: Prepare for Real OpenClaw WebHooks

**Target File:** `src/config/locus-config.ts` & `src/pages/Simulation.tsx`

1. **Create an Interface Wrapper:**
   Instead of the Play button pushing directly to the queue, wrap it in a function `listenToOpenClaw(callback)`.
   ```typescript
   // Inside a helper or hook
   export const startOpenClawListener = (
     onTransaction: (event: OpenClawEvent) => void,
   ) => {
     // TODO: Replace with real WebSocket / API Polling later
     // setInterval(() => fetch('/api/locus/events').then(...), 5000)

     // Currently exposes a global function for the Dev Panel to trigger
     window.triggerMockTransaction = (event) => onTransaction(event);
   };
   ```
2. **Mount the Listener:**
   Call this listener in the topmost `useEffect` of the `Simulation` component to securely funnel outside events into the React state queue.

---

**Execution Notes for Implementing Agent:**

- Ensure `Framer Motion` layout transitions are not interrupted mid-frame by React state re-renders. Use `initial={false}` on the `<motion.div>` for agents.
- The `isoToScreen` function already exists in `Simulation.tsx`. Use it to calculate the start and end coordinates for the `<Beam />` component.
- Ensure multiple agents can perform this sequence concurrently. (Keep agent states separate and map logic carefully inside `setAgents(prev => ...)`).
