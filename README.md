# 🛡️ RegistrAI (KYA Registry)

**The "Credit Bureau" for the Agentic Economy.**

> *A decentralized, high-frequency reputation layer for AI Agents, built on Linera Microchains.*

[![Built on Linera](https://img.shields.io/badge/Built%20on-Linera-blueviolet)](https://linera.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🚀 Quick Start (Docker)

```bash
# Clone the repository
git clone https://github.com/Legatia/RegistrAI.git
cd RegistrAI

# Start everything with Docker (connects to Testnet Conway)
docker compose up --build
```

**Access:**
- 🌐 **Frontend**: http://localhost:5173
- 🔌 **API Server**: http://localhost:3001
- 🔗 **Network**: Linera Testnet Conway (`faucet.testnet-conway.linera.net`)

---

## 🧐 The Problem: The "Agent Trust Gap"

By 2026, millions of AI agents will attempt to transact on-chain:

- **DeFi protocols block them** as "spam bots"
- **Users don't trust them** with funds (rug pull risk)
- **Existing Blockchains** (Solana/EVM) are too expensive to track real-time agent behavior

---

## 💡 The Solution: High-Frequency Identity

**KYA (Know Your Agent)** is a registry that issues **Dynamic Reputation Badges** (Soulbound NFTs) to AI agents.

Unlike static registries, our reputation is **live**:

1. **Agent performs a task** → Logs it on its own Microchain
2. **Registry verifies the log** → Updates Reputation Score instantly
3. **DeFi Apps query the score** → Allow/Deny transaction

---

## 🏗 Architecture

### Project Structure

```
RegistrAI/
├── kya-registry/       # Linera smart contract (Rust)
├── kya-agent-client/   # Agent SDK for microchain integration
├── kya-oracle-bridge/  # Cross-chain score export (Base/Solana)
├── server/             # Node.js API server
├── web/                # React frontend
├── Dockerfile          # Docker container setup
├── compose.yaml        # Docker Compose configuration
└── run.bash            # Startup script for Docker
```

### Smart Contract Features

| Feature | Description |
|---------|-------------|
| **Agent Registration** | Register AI agents with code hash verification |
| **Dynamic Badges** | Soulbound NFTs with mutable reputation data |
| **Staking** | Lock tokens to increase trust/security bond |
| **Slashing** | Governance can slash staked tokens for bad behavior |
| **Subscriptions** | Monetization via subscription payments |
| **Tiered Access** | Rate limits based on reputation tier |

### Reputation Tiers

| Tier | Score | Rate Limit |
|------|-------|------------|
| Unverified | 0-249 | 0 req/sec |
| Verified | 250-499 | 10 req/sec |
| Gold | 500-749 | 100 req/sec |
| Platinum | 750-1000 | Unlimited |

---

## 🛠️ Development Setup

### Prerequisites

- **Docker** (recommended) OR:
- **Rust 1.86.0** with `wasm32-unknown-unknown` target
- **Node.js 20+**
- **Linera Toolchain** v0.15.5

### Manual Installation

1. **Install Rust & Wasm target**:
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   rustup target add wasm32-unknown-unknown
   ```

2. **Install Linera toolchain**:
   ```bash
   cargo install --locked linera-storage-service@0.15.5
   cargo install --locked linera-service@0.15.5
   ```

3. **Build the WASM contracts**:
   ```bash
   cargo build -p kya-registry --release --target wasm32-unknown-unknown
   ```

4. **Connect to Testnet Conway**:
   ```bash
   linera wallet init --faucet https://faucet.testnet-conway.linera.net
   linera wallet request-chain --faucet https://faucet.testnet-conway.linera.net
   ```

5. **Deploy Registry**:
   ```bash
   linera publish-and-create \
     target/wasm32-unknown-unknown/release/kya-registry-contract.wasm \
     target/wasm32-unknown-unknown/release/kya-registry-service.wasm
   ```

---

## 📡 API Endpoints

### Server API (port 3001)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/agents` | GET | List all registered agents |
| `/api/agents/:id` | GET | Get agent details by ID |
| `/api/agents` | POST | Register a new agent |
| `/api/agents/search` | POST | Filter agents by tier/score/capability |
| `/api/agents/:id/score` | GET | Get agent score |
| `/api/agents/:id/commitment` | GET | Generate signed score commitment |
| `/api/agents/verify` | POST | Verify a score commitment |
| `/api/waitlist` | POST | Join the waitlist |
| `/api/waitlist/count` | GET | Get waitlist count |
| `/auth/google` | GET | Google OAuth login |
| `/auth/logout` | GET | Logout current user |
| `/api/me` | GET | Get current user info |
| `/api/provision-chain` | POST | Provision Linera chain for user |

### Frontend Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page with waitlist |
| `/agents` | Browse & search all agents |
| `/agent/:id` | Agent profile page |
| `/register` | Register new agent |
| `/dashboard` | User dashboard |
| `/docs` | Developer documentation |

### GraphQL (Linera Faucet - port 8080)

```graphql
query {
  getBadge(agentId: "0x...") {
    reputationScore
    tier
    tasksCompleted
    stakeBalance
  }
}
```

---

## 🧪 Testing

```bash
# Rust contract tests
cargo test -p kya-registry --lib

# Server API tests
cd server && npm test

# Frontend component tests
cd web && npm test
```

---

## 🔮 Roadmap

| Phase | Status | Description |
|-------|--------|-------------|
| **Phase 1** | ✅ Complete | Single-chain Registry on Linera Devnet |
| **Phase 2** | ✅ Complete | Economic features (Staking, Slashing, Subscriptions) |
| **Phase 3** | ✅ Complete | Web App + Docker deployment |
| **Phase 4** | 📋 Planned | Base Bridge - Export scores to Ethereum L2s |

---

## 🤝 Contributing

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

**Built with ❤️ for the Agent Economy.**
