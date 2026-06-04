<p align="center">
  <img src="./time-capsule/public/logo.png" alt="RevealX Logo" width="120" />
</p>

# RevealX
### Decentralized Time-Locked Prediction Protocol
Built natively on Ethereum & Solana — Hardhat Contracts · Anchor Programs · Ethers.js & Solana Web3

<p align="center">
  <img src="https://img.shields.io/badge/build-passing-brightgreen" alt="Build" />
  <img src="https://img.shields.io/badge/license-MIT-blue" alt="License" />
  <img src="https://img.shields.io/badge/Ethereum-3C3C3D?style=flat&logo=ethereum&logoColor=white" alt="Ethereum" />
  <img src="https://img.shields.io/badge/Solana-9945FF?style=flat&logo=solana&logoColor=white" alt="Solana" />
  <img src="https://img.shields.io/badge/status-MVP-orange" alt="Status" />
</p>

---

<p align="center">
  <a href="#-features">Features</a> • 
  <a href="#%EF%B8%8F-architecture">Architecture</a> • 
  <a href="#-tech-stack">Tech Stack</a> • 
  <a href="#-on-chain-integration">On-Chain Integration</a> • 
  <a href="#-api--abi-reference">API/ABI Reference</a> • 
  <a href="#-quick-start">Quick Start</a> • 
  <a href="#-contributing">Contributing</a>
</p>

---

### 📖 Overview

* **What the project does & how users interact with it:** RevealX is a decentralized social platform where future posts are locked on-chain, audiences stake on predictions, and truth is revealed at a fixed time. Users create encrypted "capsules" containing future claims or messages and lock them with a stake of ETH or SOL. Other users browse these capsules, read a public hint, and stake in a pool predicting the capsule's correct category. 
* **How Cryptographic Encryption / Contracts are used:** The platform encrypts content client-side using AES-256 with keys derived from the user's wallet signature. The encrypted text is stored on IPFS. The smart contract acts as a trustless escrow that enforces the unlock time, handles prediction staking pools, and distributes rewards to winners when the capsule is decrypted.
* **On-Chain Integration:** Implements a dual-engine blockchain layer supporting both Ethereum (via Solidity smart contracts on Hardhat/Sepolia) and Solana (via Rust Anchor programs on Devnet) to resolve capsule balances, record sequences, and verify wallet identities.

---

### 🎯 Philosophy: Why RevealX?
In standard social media, posts are reactive. People share opinions after events unfold, often rewriting history to fit narratives. There's no accountability for predictions, no skin in the game, and no trustless way to prove what someone said before an outcome occurred.

RevealX is the truth layer for the decentralized web. By parsing cryptographic time-locks and staking pools, it turns raw opinions into verifiable, accountable prediction games.

| Problem (Legacy Social Media & Prediction Markets) | Solution (RevealX) |
| :--- | :--- |
| "I told you so" claims with no cryptographic proof | **Time-Locked Capsules** that are immutable and timestamped on-chain |
| No accountability for bold claims or predictions | Creators **stake ETH/SOL** as commitment to back their claims |
| Complex, high-barrier traditional prediction markets | **Simple, category-based** social prediction pools |
| Centralized custody & content censoring/tampering | **Client-side AES-256 encryption** + decentralized IPFS storage |
| No reputation tracking for accuracy | **Reputation Leaderboard** showing top predictors |

**Target Users:** Crypto influencers proving their alpha, retail stakers participating in micro-predictions, and casual users sending time-capsules to friends or their future selves.

---

### ✨ Features

* **🔒 Time-Locked Capsules** — Encrypt messages/predictions client-side (AES-256) and lock them on-chain with strict time-lock validation.
* **💰 Dual-Chain Staking Pools** — Supporting both Ethereum (via Hardhat Solidity contracts) and Solana (via Rust Anchor programs) for staking commitments.
* **🎯 Gamified Predictions** — Audiences guess the capsule category and stake ETH/SOL to earn a share of the prediction pool.
* **⭐ Social Reputation Layer** — Follow top predictors, star users, and view accuracy-based leaderboards.
* **🔐 Trustless IPFS Storage** — Decentralized storage via Pinata IPFS ensures immutable, encrypted content storage.
* **🎨 Premium UI/UX** — Modern styling with smooth dark-mode layouts, responsive charts (for PnL and accuracy tracking), and custom micro-animations.
* **📥 Zero-State Fallback Resolution** — New wallets or empty addresses automatically render clean, zeroed-out stats, scores, and charts.

---

### 🏗️ Architecture

#### Layered System Design
RevealX connects web interface actions to raw on-chain nodes using a server-side proxy route and a client-side visualization layer.

| Layer | Description |
| :--- | :--- |
| **Client Layer** | Built with Next.js App Router (React 18), utilizing RainbowKit (for Ethereum) and Solana Wallet Adapter (for Solana). |
| **Integration Layer** | Ethers.js & `@coral-xyz/anchor` proxy wrappers communicating with RPC nodes. |
| **Storage Layer** | IPFS via Pinata for storing encrypted payloads. |
| **Smart Contract Layer** | Solidity contracts (`TimeCapsule.sol`) on Ethereum and Anchor Rust programs (`time_capsule_program`) on Solana. |

#### System Design & Processing Pipeline

1. **Modular Ingestion Pipeline:**
   * Addresses are validated matching either the Ethereum Hex format (`^0x[a-fA-F0-9]{40}$`) or the Solana Base58 format.
   * The query pulls balance records and tx history logs concurrently to minimize first-load latency.
2. **Cryptographic Execution:**
   * Secret messages are encrypted client-side using AES-256 with keys derived from the user's wallet signature.
   * Encrypted key shares and payloads are stored securely on IPFS using Pinata.
3. **Sovereign Client Session Design:**
   * The interface acts completely client-side for credentials, retaining wallet connection flags dynamically inside isolated state objects.
   * Search parameters and session parameters do not intersect, maintaining session status securely across different pages.

---

### 💻 Tech Stack

#### Frontend & UI
* **React / Next.js (v14.2.33)** — Next.js App Router.
* **Tailwind CSS (v4)** — Utility classes optimized for glow effects, borders, and animations.
* **Recharts** — Beautifully integrated dynamic area and bar charts for PnL and win rates.
* **Framer Motion** — Fluid transitions and interactive micro-animations for card hovers.
* **Lucide React** — Premium, developer-focused iconography for dashboard panels.

#### Smart Contracts & Tools
* **Ethereum Platform:** Solidity 0.8.20, Hardhat, Ethers.js v6, Wagmi/Viem.
* **Solana Platform:** Rust, Anchor v0.32.1, Solana Web3.js, Solana Wallet Adapter.
* **Storage & Encryption:** CryptoJS (AES-256), IPFS (Pinata gateway).

---

### ⚡ On-Chain Integration

RevealX interacts directly with the core chain infrastructure:

#### 1. Real-Time Ethereum / Hardhat queries
Retrieves historical transaction logs and account states using standard JSON-RPC endpoints:
* **Local Hardhat Node:** `http://127.0.0.1:8545`
* **Testnet/Mainnet Providers:** Infura / Alchemy API.

#### 2. Indexed Solana Auditing
Queries active Devnet clusters to fetch PDA status, account records, and verify sequence counts:
* **Devnet REST/RPC URL:** `https://api.devnet.solana.com`
* **Localnet RPC URL:** `http://127.0.0.1:8899`

#### 3. IPFS Gateway Resolution
Retrieves encrypted payloads from Pinata IPFS using CID verification:
* **Gateway URL:** `https://gateway.pinata.cloud/ipfs/...`

---

### 🌐 API & ABI Reference

#### Key Smart Contract Functions

| Method | Target Platform | Description |
| :--- | :--- | :--- |
| `createCapsule` | Ethereum & Solana | Creates a time-locked capsule, commits the IPFS CID, and locks the creator's stake. |
| `makePrediction` | Ethereum & Solana | Allows predictors to guess the capsule category and stake tokens in the reward pool. |
| `unlockCapsule` | Ethereum & Solana | Decrypts and unlocks the capsule after the lock time has expired, updating local state. |
| `claimReward` | Ethereum & Solana | Distributes the accumulated prediction pool among correct predictors. |

#### Sample Capsule Profile Object
```json
{
  "id": "1",
  "creator": "0x71C2496A2C4dE98ee6be538e5cdbdb1234567890",
  "recipient": "0x0000000000000000000000000000000000000000",
  "ipfsCid": "QmZ7xY8G2N9hGqH4jP6kS7wL9mF8vT5uW2rE1qD",
  "hint": "BTC Price in December 2026",
  "category": 8,
  "unlockTime": 1799270400,
  "stakeAmount": "0.1",
  "isPublic": true,
  "isUnlocked": false,
  "predictionPool": "1.5",
  "predictionCount": 12
}
```

---

### 📁 Project Structure

```
Time-Capsule/
├── 📁 time-capsule/                  # Next.js Frontend & Ethereum Hardhat Project
│   ├── 📁 app/                       #   Next.js App Router Pages
│   │   ├── 📁 analyze/               #     Analysis routing
│   │   ├── 📁 create/                #     Capsule Creation workspace
│   │   ├── globals.css               #     Global CSS configuration
│   │   └── layout.tsx                #     App wrapper & root metadata
│   ├── 📁 components/                #   Reusable React Components
│   │   ├── 📁 ui/                    #     Base atoms (button, dropdown)
│   │   └── header.tsx                #     Navigation and Wallet Selector
│   ├── 📁 lib/                       #   Core Services & Utils
│   │   ├── solana-contract-service.ts#     Solana network integration
│   │   └── wallet-context.tsx        #     Ethers / Wallet status manager
│   ├── 📁 idl/                       #   Solana Program IDL definitions
│   ├── 📁 public/                    #   Static Assets
│   │   └── logo.png                  #     Brand Logo asset
│   └── 📁 smart-contracts/           #   Ethereum Solidity Contracts (Hardhat setup)
│       ├── 📁 contracts/             #     TimeCapsule.sol
│       ├── 📁 scripts/               #     Deployment scripts
│       └── hardhat.config.js         #     Hardhat configuration
└── 📁 time_capsule_program/          # Solana Rust Anchor Program
    ├── 📁 programs/                  #   Solana contract source code
    │   └── 📁 time_capsule_program/
    │       └── 📁 src/
    │           └── lib.rs            #     Rust entrypoints & logic
    └── Anchor.toml                   #   Solana Anchor Config
```

---

### 🚀 Quick Start

#### Prerequisites
* Node.js 18.17.0 or higher
* Package Manager: `npm` or `pnpm`
* Rust & Solana CLI (optional, only for building Solana program)

#### 1. Clone & Install
```bash
# Clone the repository
git clone https://github.com/iamomm-hack/revealx.git
cd revealx

# Install frontend dependencies
cd time-capsule
npm install
```

#### 2. Run Local Blockchain & Deploy Contracts
**For Ethereum / Hardhat:**
```bash
# Start local hardhat blockchain (Terminal 1)
cd smart-contracts
npx hardhat node

# Deploy contracts (Terminal 2)
npx hardhat run scripts/deploy.js --network localhost
```

**For Solana / Anchor:**
```bash
# Build Solana program
cd time_capsule_program
anchor build

# Test Solana program locally
anchor test
```

#### 3. Run Local Development
```bash
# Run Next.js app
cd time-capsule
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

### 🔧 Network Config Parameters

| Parameter | Ethereum (Local / Testnet) | Solana (Local / Devnet) |
| :--- | :--- | :--- |
| **RPC Endpoint** | `http://127.0.0.1:8545` / Infura | `http://127.0.0.1:8899` / Devnet |
| **Chain ID** | `31337` / Sepolia `11155111` | Localnet / `devnet` |
| **Contract / Prog ID** | `TimeCapsule` Contract Address | `GccELE2LzH3tot4qx6ooEjxryaAdZNJq4oP6quMhySKT` |
| **Wallet Connector** | MetaMask / RainbowKit | Phantom / Solflare Adapter |

---

### 🚢 Production Deployment
The project is pre-configured for deployment on Vercel:
1. Connect your Github repository to the Vercel Dashboard.
2. In Project Settings, set Root Directory to `time-capsule`.
3. Set your environment variables in Vercel:
   * `NEXT_PUBLIC_CONTRACT_ADDRESS`
   * `NEXT_PUBLIC_PINATA_JWT`
4. Click **Deploy**.

---

### 🤝 Contributing
1. Fork the project.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your Changes (`git commit -m 'feat: Add some AmazingFeature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

### 📄 License
Distributed under the MIT License. See [LICENSE](LICENSE) for more information.
