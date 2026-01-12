# RevealX

**A Decentralized Time-Locked Prediction Protocol**

A decentralized social platform where future posts are locked on-chain, audiences stake on predictions, and truth is revealed at a fixed time.

![Build](https://img.shields.io/badge/build-passing-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![Network](https://img.shields.io/badge/network-Ethereum-purple)
![Status](https://img.shields.io/badge/status-MVP-orange)

---

## 📖 Overview

### The Problem

Social media today is reactive. People share opinions after events unfold, often rewriting history to fit narratives. There's no accountability for predictions, no skin in the game, and no trustless way to prove what someone said before an outcome occurred.

**Why this matters:**

- Influencers make bold claims with zero accountability
- "I told you so" culture lacks cryptographic proof
- Prediction markets are complex and inaccessible to mainstream users
- No social layer exists for time-locked content with community engagement

### The Solution

**RevealX** transforms how predictions and time-sensitive content are shared. Users create encrypted "capsules" locked until a specific future date. The community stakes ETH to predict the capsule's category (e.g., "Startup Success", "Crypto Price Prediction"). When time unlocks the capsule, winners split the prediction pool—creating a gamified, trustless social prediction market.

---

## ✨ Key Features

- **🔒 Time-Locked Capsules** — Content encrypted client-side and locked on-chain until unlock time
- **💰 Socializd Staking** — Creators stake ETH as commitment; predictors stake to guess outcomes
- **🎯 Prediction Markets** — Guess capsule categories and earn rewards for correct predictions
- **⭐ Social Layer** — Like capsules, star users, build reputation through accuracy
- **🏆 Leaderboards** — Compete for the top predictor spot
- **🔐 Zero-Knowledge Privacy** — Content never leaves your browser unencrypted
- **🚫 No Admin Keys** — Fully immutable smart contracts with no backdoors

---

## 🏗️ Architecture Overview

RevealX follows a decentralized architecture with clear separation between on-chain and off-chain components:

### System Design

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                │
│   Next.js 14 + TypeScript + TailwindCSS + Shadcn UI             │
│   Client-side AES-256 encryption + Wallet integration           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SMART CONTRACTS (Ethereum)                   │
│   • Capsule creation & time-lock enforcement                    │
│   • Prediction staking & reward distribution                    │
│   • Social interactions (likes/stars)                           │
│   • ReentrancyGuard + No admin privileges                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DECENTRALIZED STORAGE                        │
│   IPFS via Pinata — Encrypted content storage                   │
└─────────────────────────────────────────────────────────────────┘
```

### Flow Diagram

<img width="801" height="476" alt="Screenshot 2026-01-12 142254" src="https://github.com/user-attachments/assets/fb9f607d-66f1-4099-ab63-83a858d8567c" />


---

## 🛠️ Tech Stack

| Category            | Technologies                                            |
| ------------------- | ------------------------------------------------------- |
| **Blockchain**      | Ethereum, Solidity 0.8.20, Hardhat                      |
| **Smart Contracts** | OpenZeppelin (ReentrancyGuard), Custom prediction logic |
| **Frontend**        | Next.js 14, TypeScript, TailwindCSS, Shadcn UI          |
| **Wallet**          | Ethers.js v6, MetaMask, RainbowKit                      |
| **Storage**         | IPFS (Pinata)                                           |
| **Encryption**      | CryptoJS (AES-256), Signature-based key derivation      |
| **Tooling**         | ESLint, Prettier, Hardhat                               |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- MetaMask browser extension
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/iamomm-hack/revealx.git
cd revealx

# Install frontend dependencies
npm install

# Install smart contract dependencies
cd smart-contracts
npm install
cd ..
```

### Environment Setup

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_CONTRACT_ADDRESS="<deployed_contract_address>"
NEXT_PUBLIC_PINATA_JWT="<your_pinata_jwt_token>"
NEXT_PUBLIC_GATEWAY_URL="https://gateway.pinata.cloud"
```

### Build & Run

```bash
# Start local blockchain (Terminal 1)
cd smart-contracts
npx hardhat node

# Deploy contracts (Terminal 2)
npx hardhat run scripts/deploy.js --network localhost

# Start frontend (Terminal 3)
cd ..
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 Smart Contracts

### Contract Responsibilities

| Contract          | Purpose                                                                            |
| ----------------- | ---------------------------------------------------------------------------------- |
| `TimeCapsule.sol` | Core protocol logic: capsule creation, time-lock enforcement, predictions, rewards |

### Key Functions

```solidity
// Create a time-locked capsule with ETH stake
function createCapsule(address _recipient, uint256 _unlockTime, string calldata _ipfsCid, ...) external payable

// Predict capsule category by staking ETH
function makePrediction(uint256 _id, uint8 _guess) external payable

// Unlock capsule after time expires (triggers reward calculation)
function unlockCapsule(uint256 _id) external

// Winners claim their share of the prediction pool
function claimReward(uint256 _id) external
```

### Security Considerations

- **ReentrancyGuard** — All state-changing functions protected
- **No Admin Keys** — Contract is fully immutable post-deployment
- **Time Enforcement** — `block.timestamp` used for trustless unlock logic
- **Stake Validation** — Minimum stakes enforced to prevent spam

---

## 📱 Usage

### Creating a Capsule

1. Connect your MetaMask wallet
2. Click "Create Capsule"
3. Enter your message, select category, set unlock date
4. Stake ETH as commitment
5. Content is encrypted and uploaded to IPFS
6. Capsule metadata stored on-chain

### Making Predictions

1. Browse public capsules in the Explore page
2. Read the hint provided by the creator
3. Stake ETH and guess the category
4. Wait for unlock time
5. If correct, claim your share of the reward pool

### Social Features

- **Like Capsules** — Show appreciation (on-chain)
- **Star Users** — Follow top predictors
- **Leaderboard** — Compete for rankings

---

## 🔐 Security & Trust Model

### What RevealX Protects Against

✅ Unauthorized early access to capsule content  
✅ Manipulation of unlock times after creation  
✅ Prediction pool theft or admin rug pulls  
✅ Content tampering (IPFS + encryption)  
✅ Replay attacks (ReentrancyGuard)

### What RevealX Does NOT Protect Against

⚠️ Loss of wallet private keys  
⚠️ IPFS content availability (depends on Pinata)  
⚠️ Creator refusing to unlock (stake acts as incentive)  
⚠️ Front-running predictions (inherent to public blockchains)

### Trust Assumptions

- Users trust the Ethereum network consensus
- Users trust their browser environment for encryption
- IPFS pinning is reliable via Pinata

---

## 🗺️ Roadmap

### Short-term (Q1 2026)

- [x] Core smart contract development
- [x] Frontend MVP with create/predict/unlock flows
- [x] Social features (likes, stars, profiles)
- [ ] Mainnet deployment

### Mid-term (Q2-Q3 2026)

- [ ] Multi-chain support (Polygon, Arbitrum)
- [ ] NFT integration for capsule ownership
- [ ] Mobile-responsive PWA
- [ ] Advanced analytics dashboard

### Long-term (2026+)

- [ ] DAO governance for protocol upgrades
- [ ] Token launch (governance + staking rewards)
- [ ] SDK for third-party integrations
- [ ] Enterprise API

---

## 🤝 Contributing

We welcome contributions from the community!

### How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Use ESLint and Prettier for formatting
- Follow existing naming conventions
- Write meaningful commit messages
- Add tests for new features

### Pull Request Process

1. Ensure all tests pass
2. Update documentation if needed
3. Request review from maintainers
4. Squash commits before merge

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

You are free to use, modify, and distribute this software for any purpose.

---

## 🙏 Acknowledgements

- [OpenZeppelin](https://openzeppelin.com/) — Secure smart contract libraries
- [Pinata](https://pinata.cloud/) — IPFS pinning service
- [Shadcn UI](https://ui.shadcn.com/) — Beautiful React components
- [Ethers.js](https://docs.ethers.org/) — Ethereum library

---

<p align="center">
  Built with ❤️ for the decentralized future
</p>
