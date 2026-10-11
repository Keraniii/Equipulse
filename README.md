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
