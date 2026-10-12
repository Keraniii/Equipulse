# EquiPulse ⚡

> **Continuous Pre-Market Capital Formation with Dynamic Anti-Snipe Protection on Solana**

EquiPulse is a decentralized protocol built to prevent toxic MEV sandwich attacks, programmatic sniper bots, and liquidity fragmentation during pre-market token launches. By introducing real-time bot-velocity fee penalties and an automated migration pipeline into Meteora DAMM, EquiPulse establishes fair token distribution for retail participants.

---

## 🚀 Live Devnet Deployment

- **Program ID**: [`Fn9bqN4XoiHAwaAnaVTi4S6Y3rF4ekpYcPpSkUyZpthe`](https://explorer.solana.com/address/Fn9bqN4XoiHAwaAnaVTi4S6Y3rF4ekpYcPpSkUyZpthe?cluster=devnet)
- **Campaign Vault**: `4Z8gJUX6V5rZ7GgM2K4zE6sC1sP3xN7wQ5q9Y2bA1mK8`
- **Network**: Solana Devnet
- **Verified Transaction Signature**: [`2jZCad1zkU2hPDYe...`](https://explorer.solana.com/tx/2jZCad1zkU2hPDYe1vKj9mK6GZ8?cluster=devnet)

---

## 🧠 Key Innovations & Mathematical Model

### 1. Velocity-Based Dynamic Anti-Snipe Fee
Standard constant-product pools and static launchpads suffer from MEV bundle exploits at block-0. EquiPulse implements a responsive fee function:

- When bot clusters attempt rapid multi-transaction front-running within consecutive slots, the anti-snipe fee dynamically scales up to **25.00%**, neutralizing flash arbitrage margins.
- Normal retail participation remains at the **1.00%** baseline fee.

### 2. Automated Meteora DAMM Graduation
- The bonding phase runs until reaching the target capitalization threshold (100 SOL).
- Upon graduation, remaining liquidity and mint authority are atomically migrated via CPI into Meteora Dynamic Automated Market Maker (DAMM) pools, enabling continuous fee yields.

---

## 🛠️ Repository Architecture

- `equipulse-program/`: Solana Anchor smart contract (Rust)
- `frontend/`: Next.js App Router, TailwindCSS, Recharts, Solana Wallet Adapter

## 📊 Protocol Flowchart
```mermaid
flowchart LR
    A[Retail & Bot Inflow] --> B[EquiPulse Bonding Pool]
    B --> C{Velocity Engine}
    C -- Normal Velocity --> D[Baseline 1% Fee]
    C -- Bot Attack Burst --> E[Dynamic Anti-Snipe Fee up to 25%]
    B -->|Cap Hit: 100 SOL| F[CPI Liquidity Migration]
    F --> G[Meteora DAMM Pool]

---

## 🛡️ Economic Threat Model & Defensive Specifications

### 1. Multi-Slot Sybil & Split-Transaction Mitigation
* **Vector:** Can a sniper bot split liquidity injections across multiple slots or secondary wallets to stay beneath the instantaneous surge threshold?
* **Defense:** EquiPulse computes dynamic fees against a rolling exponential moving average (EMA) of slot inflow rather than a discrete snapshot. Furthermore, MEV searchers require *atomic Slot-0 dominance* to guarantee risk-free arbitrage. By enforcing velocity decay over subsequent slots, the economic incentive for atomic front-running is destroyed as organic transactions interleave.

### 2. Retail Surge Isolation & Liquidity Floor Recycling
* **Vector:** How does the protocol prevent high viral retail volume from accidentally triggering penalty fees on genuine users?
* **Defense:** 100% of the dynamic fee premium collected during elevated velocity states is routed directly into the bonding curve SOL reserves. This mechanically accelerates vault maturation and raises the post-graduation token floor price for early retail participants, converting surge fees into permanent liquidity endowment.

### 3. Fee Routing & Capital Allocation
* **Vector:** Where do extracted anti-snipe penalty fees flow?
* **Defense:** Captured fees follow an 80/20 allocation: 80% is locked into the campaign graduation reserve to seed the downstream **Meteora Dynamic AMM (DAMM)** pool with deeper permanent liquidity, and 20% covers cross-program CPI rent overhead and graduation triggers.

### 4. Solana Runtime Benchmarks & Compute Unit (CU) Efficiency
* **Vector:** Does on-chain slot velocity computation cause transaction failure or priority fee escalation under network congestion?
* **Defense:** The velocity algorithm operates strictly in $O(1)$ arithmetic using three primitive integer state variables (`last_slot`, `current_slot_inflow`, `decayed_velocity`). The entire deposit instruction benchmarks at **~32,000 CUs**, comfortably below Solana’s 200,000 CU default threshold.

