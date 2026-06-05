"use client"

import { useState, useEffect } from "react"
import { 
  Rocket, 
  Book, 
  Key, 
  Layers, 
  Cpu, 
  Coins, 
  Shield, 
  Award, 
  Code, 
  FileCode, 
  Globe, 
  HelpCircle 
} from "lucide-react"

function CodeBlock({ code, title = "BASH" }: { code: string; title?: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="mt-4 bg-[#08080c] border border-border/30 rounded-lg overflow-hidden font-mono text-[11px] sm:text-xs">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/20 bg-card/30 text-[10px] tracking-wider uppercase font-semibold text-muted-foreground">
        <span>{title}</span>
        <button onClick={copy} className="hover:text-foreground transition-colors cursor-pointer text-[10px] font-bold">
          {copied ? "COPIED" : "COPY"}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-muted-foreground whitespace-pre-wrap leading-relaxed">
        {code}
      </pre>
    </div>
  )
}

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("quick-start")

  // Listen for scroll requests (switches) from the Sidebar component
  useEffect(() => {
    const handleScrollRequest = (e: Event) => {
      const id = (e as CustomEvent).detail
      setActiveSection(id)
      
      const scrollContainer = document.querySelector('main')
      if (scrollContainer) {
        scrollContainer.scrollTo({
          top: 0,
          behavior: "smooth"
        })
      } else {
        window.scrollTo({
          top: 0,
          behavior: "smooth"
        })
      }
    }

    window.addEventListener('scroll-to-docs-section', handleScrollRequest)
    return () => window.removeEventListener('scroll-to-docs-section', handleScrollRequest)
  }, [])

  // Switch section state internally and notify sidebar to keep in sync
  const handleSectionSwitch = (id: string) => {
    setActiveSection(id)
    window.dispatchEvent(new CustomEvent('active-docs-section-changed', { detail: id }))
    
    const scrollContainer = document.querySelector('main')
    if (scrollContainer) {
      scrollContainer.scrollTo({
        top: 0,
        behavior: "smooth"
      })
    } else {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      })
    }
  }

  // Initial sync on mount
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('active-docs-section-changed', { detail: activeSection }))
  }, [activeSection])

  const renderActiveSectionContent = () => {
    switch (activeSection) {
      case "quick-start":
        return (
          <section id="quick-start" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-3">
              <Rocket className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold uppercase tracking-tight">QUICK START</h2>
            </div>
            <p className="text-muted-foreground text-sm">
              Get up and running with RevealX in 4 simple steps: Connect Wallet, Create Capsule, Place Prediction, and Reveal Payload.
            </p>

            <div className="border border-border/40 bg-[#0d0e14] rounded-xl p-6 space-y-8 shadow-sm">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold tracking-widest text-primary">STEP 01</span>
                  <span className="text-xs font-bold uppercase tracking-wider text-foreground">CONNECT YOUR WALLET</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Use the header button to connect your MetaMask (for Ethereum Sepolia/Hardhat Local) or Phantom (for Solana Devnet/Testnet/Mainnet) wallet.
                </p>
                <CodeBlock code={`# Faucets for local development:\n# EVM (Hardhat local node): http://127.0.0.1:8545\n# Solana (Devnet faucet): solana airdrop 1 <YOUR_WALLET_ADDRESS>`} />
              </div>

              <div className="border-t border-border/10 my-6" />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold tracking-widest text-primary">STEP 02</span>
                  <span className="text-xs font-bold uppercase tracking-wider text-foreground">CREATE A TIME CAPSULE</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Enter your secrets, specify the unlock timestamp, recipient address, category hint, and lock your stake. The payload gets encrypted locally in your browser.
                </p>
                <CodeBlock title="TYPESCRIPT" code={`// Local Encryption & IPFS Upload Flow\nconst aesKey = crypto.getRandomValues(new Uint8Array(32));\nconst encryptedPayload = await encryptAESGCM(payloadText, aesKey);\nconst encryptedKey = await encryptECIES(aesKey, recipientPublicKey);\nconst ipfsCID = await uploadToIPFS(encryptedPayload);`} />
              </div>

              <div className="border-t border-border/10 my-6" />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold tracking-widest text-primary">STEP 03</span>
                  <span className="text-xs font-bold uppercase tracking-wider text-foreground">PLACE PREDICTION WAGER</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Community members can browse public capsules in the explore feed and stake native tokens guessing the true category.
                </p>
                <CodeBlock title="SOLIDITY" code={`// Predict the capsule category on Ethereum\ntransaction = await timeCapsuleContract.makePrediction(\n    capsuleId,\n    uint8(Category.CryptoProfit),\n    { value: ethers.parseEther("0.005") }\n);`} />
              </div>

              <div className="border-t border-border/10 my-6" />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold tracking-widest text-primary">STEP 04</span>
                  <span className="text-xs font-bold uppercase tracking-wider text-foreground">REVEAL AND CLAIM</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Once the unlock date passes, the creator unlocks the capsule, exposing the true category and releasing the stakes. Correct predictors claim their share of the reward pool.
                </p>
                <CodeBlock title="RUST" code={`// Claim Solana devnet reward on Win\npub fn claim_reward(ctx: Context<ClaimReward>) -> Result<()> {\n    let capsule = &ctx.accounts.capsule;\n    let prediction = &mut ctx.accounts.prediction;\n    require!(prediction.guess == capsule.category, Error::WrongPrediction);\n    // ... distributes proportional reward from prediction pool\n}`} />
              </div>
            </div>
          </section>
        )
      case "core-concepts":
        return (
          <section id="core-concepts" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-3">
              <Book className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold uppercase tracking-tight">CORE CONCEPTS</h2>
            </div>
            <p className="text-muted-foreground text-sm">
              How RevealX guarantees trustless locked storage combined with open prediction markets.
            </p>

            <div className="border border-border/40 bg-[#0d0e14] rounded-xl p-6 space-y-6 shadow-sm">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold tracking-widest text-primary">CONCEPT 01</span>
                  <span className="text-xs font-bold uppercase tracking-wider text-foreground">TRUSTLESS TIME LOCKS</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Decentralized smart contracts act as non-custodial time locks. The contract retains ownership of the capsule state and wagers. No entity—not even the creator—can unlock a capsule or retrieve stake amounts before the specified timestamp.
                </p>
              </div>

              <div className="border-t border-border/10 my-4" />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold tracking-widest text-primary">CONCEPT 02</span>
                  <span className="text-xs font-bold uppercase tracking-wider text-foreground">HYBRID PREDICTION MARKETS</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Each capsule can be flagged as public or private. Public capsules contain category hints, letting users stake tokens predicting which category it represents. When unlocked, the smart contract settles the pool, rewarding correct guesses.
                </p>
              </div>

              <div className="border-t border-border/10 my-4" />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold tracking-widest text-primary">CONCEPT 03</span>
                  <span className="text-xs font-bold uppercase tracking-wider text-foreground">DECENTRALIZED IPFS PINNING</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  To avoid high gas fees, raw capsule payloads are encrypted and stored in decentralized InterPlanetary File System (IPFS) nodes. Only the metadata hash (CID) and decryption key envelope reside directly on-chain.
                </p>
              </div>
            </div>
          </section>
        )
      case "key-management":
        return (
          <section id="key-management" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-3">
              <Key className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold uppercase tracking-tight">KEY MANAGEMENT</h2>
            </div>
            <p className="text-muted-foreground text-sm">
              End-to-end client-side encryption flow in RevealX.
            </p>

            <div className="border border-border/40 bg-[#0d0e14] rounded-xl p-6 space-y-6 shadow-sm">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold tracking-widest text-primary">SECURITY FLOW</span>
                  <span className="text-xs font-bold uppercase tracking-wider text-foreground">CLIENT-SIDE AES-256-GCM + ECIES</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  RevealX employs a two-tier key design for high efficiency and flexibility:
                </p>
                <ul className="list-disc pl-5 text-xs text-muted-foreground space-y-2 pt-2">
                  <li><strong>Symmetric Encryption:</strong> The capsule content is encrypted inside the browser using a randomly generated 256-bit AES-GCM key.</li>
                  <li><strong>Asymmetric Key Envelopment:</strong> The symmetric AES key is encrypted using the recipient's public key (using ECIES or standard MetaMask/Phantom encryption ciphers).</li>
                  <li><strong>On-chain Storage:</strong> The encrypted AES key is stored on the blockchain within the Capsule struct.</li>
                  <li><strong>Decryption:</strong> Upon the capsule's unlock date, the recipient decrypts the key envelope using their private key and uses the decrypted AES key to read the IPFS payload.</li>
                </ul>
              </div>
              <CodeBlock title="ENCRYPTION HELPERS" code={`// Decrypting the key envelope locally\nconst decryptedAESKey = await window.ethereum.request({\n  method: "eth_decrypt",\n  params: [encryptedKeyHex, userAddress],\n});\nconst decryptedContent = await decryptAESGCM(ipfsContent, decryptedAESKey);`} />
            </div>
          </section>
        )
      case "smart-contracts-evm":
        return (
          <section id="smart-contracts-evm" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-3">
              <Layers className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold uppercase tracking-tight">SMART CONTRACTS (EVM)</h2>
            </div>
            <p className="text-muted-foreground text-sm">
              The Solidity smart contract `TimeCapsule.sol` implements non-custodial time locks, wagering prediction pools, and user likes/stars.
            </p>

            <div className="border border-border/40 bg-[#0d0e14] rounded-xl p-6 space-y-6 shadow-sm">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold tracking-widest text-primary">ABI METHODS</span>
                  <span className="text-xs font-bold uppercase tracking-wider text-foreground">TIMECAPSULE.SOL INTERFACE</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Key methods for interacting with the EVM contract:
                </p>
                <CodeBlock title="SOLIDITY" code={`contract TimeCapsule {\n    enum Category { StartupLaunch, Marriage, Breakup, CryptoProfit, JobAnnouncement, Travel, Graduation, Secret, Other }\n\n    function createCapsule(\n        address _recipient,\n        uint256 _unlockTime,\n        string calldata _ipfsCid,\n        bytes calldata _encryptedKey,\n        string calldata _hint,\n        Category _category,\n        bool _isPublic\n    ) external payable;\n\n    function makePrediction(uint256 _id, Category _guess) external payable;\n    function unlockCapsule(uint256 _id) external;\n    function claimReward(uint256 _id) external;\n    function deleteCapsule(uint256 _id) external;\n\n    // Social metrics\n    function likeCapsule(uint256 _id) external;\n    function starUser(address _user) external;\n}`} />
              </div>
            </div>
          </section>
        )
      case "smart-contracts-svm":
        return (
          <section id="smart-contracts-svm" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-3">
              <Cpu className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold uppercase tracking-tight">SMART CONTRACTS (SVM)</h2>
            </div>
            <p className="text-muted-foreground text-sm">
              The Anchor program `time_capsule_program` handles SVM execution on Solana networks using program derived addresses (PDAs) for capsule states.
            </p>

            <div className="border border-border/40 bg-[#0d0e14] rounded-xl p-6 space-y-6 shadow-sm">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold tracking-widest text-primary">RUST & ANCHOR</span>
                  <span className="text-xs font-bold uppercase tracking-wider text-foreground">TIME_CAPSULE_PROGRAM IDL</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  The program handles state accounts using PDA seeds:
                </p>
                <CodeBlock title="RUST" code={`// PDA seeds and initialization contexts in Anchor\n#[derive(Accounts)]\npub struct CreateCapsule<'info> {\n    #[account(\n        init, payer = creator, space = 8 + Capsule::INIT_SPACE,\n        seeds = [b"capsule", capsule_counter.count.to_le_bytes().as_ref()],\n        bump\n    )]\n    pub capsule: Account<'info, Capsule>,\n    #[account(mut, seeds = [b"counter"], bump)]\n    pub capsule_counter: Account<'info, CapsuleCounter>,\n    pub recipient: AccountInfo<'info>,\n    #[account(mut)]\n    pub creator: Signer<'info>,\n    pub system_program: Program<'info, System>,\n}`} />
              </div>
            </div>
          </section>
        )
      case "prediction-staking":
        return (
          <section id="prediction-staking" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-3">
              <Coins className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold uppercase tracking-tight">PREDICTION STAKING</h2>
            </div>
            <p className="text-muted-foreground text-sm">
              Browse public capsules, forecast categories, and participate in prediction pools.
            </p>

            <div className="border border-border/40 bg-[#0d0e14] rounded-xl p-6 space-y-6 shadow-sm">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold tracking-widest text-primary">STAKING MATH</span>
                  <span className="text-xs font-bold uppercase tracking-wider text-foreground">PROPORTIONAL PAYOUT CALCULATION</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Upon settlement, the total prediction pool (containing all guesses) is divided among the correct predictors. The reward payout formula is:
                </p>
                <div className="bg-[#08080c] border border-border/20 rounded p-4 text-xs font-mono text-muted-foreground">
                  Reward = WinStake + (WinStake * LoserPool) / WinnerPool
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed pt-2">
                  This guarantees that winners receive their principal wager back, plus a pro-rata share of all incorrect stakes based on their relative stake amount.
                </p>
              </div>

              <div className="border-t border-border/10 my-4" />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold tracking-widest text-primary">RULES</span>
                  <span className="text-xs font-bold uppercase tracking-wider text-foreground">STAKING PARAMETERS</span>
                </div>
                <ul className="list-disc pl-5 text-xs text-muted-foreground space-y-2">
                  <li><strong>Minimum Stake:</strong> 0.001 ETH (on EVM) or 0.001 SOL (on Solana).</li>
                  <li><strong>Timing:</strong> Predictions must be submitted before the capsule's unlock timestamp.</li>
                  <li><strong>Limit:</strong> One prediction wager per user address per capsule.</li>
                </ul>
              </div>
            </div>
          </section>
        )
      case "unlocks-reveals":
        return (
          <section id="unlocks-reveals" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold uppercase tracking-tight">UNLOCKS & REVEALS</h2>
            </div>
            <p className="text-muted-foreground text-sm">
              Decrypting capsules, settling stakes, and claiming prediction rewards.
            </p>

            <div className="border border-border/40 bg-[#0d0e14] rounded-xl p-6 space-y-6 shadow-sm">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold tracking-widest text-primary">RELEASE CYCLE</span>
                  <span className="text-xs font-bold uppercase tracking-wider text-foreground">UNSEALING PROCEDURES</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Once block timestamps exceed the unlock date:
                </p>
                <ol className="list-decimal pl-5 text-xs text-muted-foreground space-y-2 pt-2">
                  <li><strong>Creator/Recipient Call:</strong> Either the creator or recipient sends the `unlockCapsule` transaction.</li>
                  <li><strong>State Update:</strong> The contract updates `isUnlocked = true`, confirming the actual category.</li>
                  <li><strong>Escrow Payout:</strong> The creator's locked stake is automatically released and transferred to the recipient address.</li>
                  <li><strong>Claiming Rewards:</strong> Correct predictors call the `claimReward` method to claim their reward share from the contract.</li>
                </ol>
              </div>
            </div>
          </section>
        )
      case "social-reputation":
        return (
          <section id="social-reputation" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-3">
              <Award className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold uppercase tracking-tight">SOCIAL & REPUTATION</h2>
            </div>
            <p className="text-muted-foreground text-sm">
              Increase your credibility, accumulate profile stars, and climb the leaderboard rankings.
            </p>

            <div className="border border-border/40 bg-[#0d0e14] rounded-xl p-6 space-y-6 shadow-sm text-xs">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold tracking-widest text-primary">SCORING TIER</span>
                  <span className="text-xs font-bold uppercase tracking-wider text-foreground">REPUTATION METRICS</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  RevealX features a social feedback loop built directly into the smart contracts:
                </p>
                <ul className="list-disc pl-5 text-xs text-muted-foreground space-y-2 pt-2">
                  <li><strong>Capsule Likes:</strong> Users can like public capsules. The `likeCapsule` method increments on-chain popularity counters.</li>
                  <li><strong>User Stars:</strong> Users can star other creators. The `starUser` method tracks starrer addresses on-chain to prevent duplicate scoring.</li>
                  <li><strong>Leaderboard Ranking:</strong> Profiles are sorted dynamically based on total capsules created, total received likes, and global stars.</li>
                </ul>
              </div>
            </div>
          </section>
        )
      case "developer-sdk-evm":
        return (
          <section id="developer-sdk-evm" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-3">
              <Code className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold uppercase tracking-tight">DEVELOPER SDK (EVM)</h2>
            </div>
            <p className="text-muted-foreground text-sm">
              Integrate RevealX EVM capabilities inside your web applications using Ethers.js.
            </p>

            <div className="border border-border/40 bg-[#0d0e14] rounded-xl p-6 space-y-6 shadow-sm">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold tracking-widest text-primary">JAVASCRIPT</span>
                  <span className="text-xs font-bold uppercase tracking-wider text-foreground">ETHERS.JS SERVICE UTILS</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Initialize and submit capsules using the browser provider:
                </p>
                <CodeBlock title="JAVASCRIPT" code={`import { ethers } from "ethers";\n\nconst CONTRACT_ABI = [\n  "function createCapsule(address _recipient, uint256 _unlockTime, string calldata _ipfsCid, bytes calldata _encryptedKey, string calldata _hint, uint8 _category, bool _isPublic) external payable"\n];\n\nasync function mintCapsule(recipient, unlockTime, ipfsCid, encryptedKey, stakeEth) {\n  const provider = new ethers.BrowserProvider(window.ethereum);\n  const signer = await provider.getSigner();\n  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);\n\n  const tx = await contract.createCapsule(\n    recipient,\n    unlockTime,\n    ipfsCid,\n    encryptedKey,\n    "Locked startup milestone details",\n    0, // StartupLaunch category index\n    true, // isPublic\n    { value: ethers.parseEther(stakeEth) }\n  );\n  const receipt = await tx.wait();\n  console.log("Capsule minted in tx:", receipt.hash);\n}`} />
              </div>
            </div>
          </section>
        )
      case "developer-sdk-svm":
        return (
          <section id="developer-sdk-svm" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-3">
              <FileCode className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold uppercase tracking-tight">DEVELOPER SDK (SVM)</h2>
            </div>
            <p className="text-muted-foreground text-sm">
              Integrate RevealX SVM features inside Solana clients using Anchor and `@solana/web3.js`.
            </p>

            <div className="border border-border/40 bg-[#0d0e14] rounded-xl p-6 space-y-6 shadow-sm">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold tracking-widest text-primary">TYPESCRIPT</span>
                  <span className="text-xs font-bold uppercase tracking-wider text-foreground">ANCHOR SVM INSTRUCTIONS</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Interact with the Solana program using PDA generation:
                </p>
                <CodeBlock title="TYPESCRIPT" code={`import { Program, AnchorProvider, BN } from "@coral-xyz/anchor";\nimport { PublicKey, SystemProgram } from "@solana/web3.js";\n\nasync function mintSolanaCapsule(program, counterPDA, recipientPublicKey, ipfsCid, encryptedKey, unlockTime) {\n  const [capsulePDA] = PublicKey.findProgramAddressSync([\n    Buffer.from("capsule"),\n    Buffer.from(new Uint8Array(new BN(capsuleId).toArray("le", 8)))\n  ], program.programId);\n\n  const tx = await program.methods\n    .createCapsule(\n      ipfsCid,\n      Buffer.from(encryptedKey),\n      "Key release proof",\n      8, // CryptoProfit category index\n      new BN(unlockTime),\n      true // isPublic\n    )\n    .accounts({\n      capsule: capsulePDA,\n      capsuleCounter: counterPDA,\n      recipient: recipientPublicKey,\n      creator: program.provider.publicKey,\n      systemProgram: SystemProgram.programId\n    })\n    .rpc();\n\n  console.log("Solana transaction signature:", tx);\n}`} />
              </div>
            </div>
          </section>
        )
      case "supported-networks":
        return (
          <section id="supported-networks" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-3">
              <Globe className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold uppercase tracking-tight">SUPPORTED NETWORKS</h2>
            </div>
            <p className="text-muted-foreground text-sm">
              Networks supported by RevealX. Solana runs on Testnet, Devnet, and Mainnet. Ethereum/EVM runs strictly on Ethereum Sepolia and Hardhat Local.
            </p>

            <div className="border border-border/40 bg-[#0d0e14] rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border/20 bg-card/50 text-[10px] tracking-wider uppercase font-semibold text-muted-foreground">
                    <th className="p-4">CHAIN FAMILY</th>
                    <th className="p-4">NETWORK</th>
                    <th className="p-4">RPC ENDPOINT</th>
                    <th className="p-4">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/10 text-muted-foreground">
                  <tr>
                    <td className="p-4 font-semibold text-foreground">Ethereum/EVM</td>
                    <td className="p-4">Hardhat Localhost</td>
                    <td className="p-4 font-mono">http://127.0.0.1:8545</td>
                    <td className="p-4 text-emerald-500 font-bold uppercase">Supported</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold text-foreground">Ethereum/EVM</td>
                    <td className="p-4">Ethereum Sepolia</td>
                    <td className="p-4 font-mono">https://ethereum-sepolia-rpc.publicnode.com</td>
                    <td className="p-4 text-emerald-500 font-bold uppercase">Supported</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold text-foreground">Solana/SVM</td>
                    <td className="p-4">Solana Devnet</td>
                    <td className="p-4 font-mono">https://api.devnet.solana.com</td>
                    <td className="p-4 text-emerald-500 font-bold uppercase">Supported</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold text-foreground">Solana/SVM</td>
                    <td className="p-4">Solana Testnet</td>
                    <td className="p-4 font-mono">https://api.testnet.solana.com</td>
                    <td className="p-4 text-emerald-500 font-bold uppercase">Supported</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold text-foreground">Solana/SVM</td>
                    <td className="p-4">Solana Mainnet-Beta</td>
                    <td className="p-4 font-mono">https://api.mainnet-beta.solana.com</td>
                    <td className="p-4 text-emerald-500 font-bold uppercase">Supported</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        )
      case "faq":
        return (
          <section id="faq" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-3">
              <HelpCircle className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold uppercase tracking-tight">FAQ</h2>
            </div>
            <p className="text-muted-foreground text-sm">
              Answers to frequently asked questions about the RevealX protocol.
            </p>

            <div className="border border-border/40 bg-[#0d0e14] rounded-xl p-6 space-y-6 shadow-sm text-xs">
              <div className="space-y-2">
                <h4 className="font-bold text-foreground">What happens if the creator loses their private key?</h4>
                <p className="text-muted-foreground leading-relaxed">
                  Because RevealX is completely decentralized and non-custodial, there is no master administrator key. If the creator loses their keys, the enveloped key cannot be decrypted, and the capsule stake remains permanently locked in the contract escrow.
                </p>
              </div>

              <div className="border-t border-border/10 my-4" />

              <div className="space-y-2">
                <h4 className="font-bold text-foreground">Can predictors retrieve their stakes if a capsule is never unlocked?</h4>
                <p className="text-muted-foreground leading-relaxed">
                  If the unlock date passes and the capsule creator fails to trigger the unlock transaction, the capsule remains sealed. Correct predictions cannot be settled, and wagers remain in the pool. Make sure to only predict capsules from reputable creators.
                </p>
              </div>

              <div className="border-t border-border/10 my-4" />

              <div className="space-y-2">
                <h4 className="font-bold text-foreground">Are there platform fees on prediction stakes?</h4>
                <p className="text-muted-foreground leading-relaxed">
                  No, there are no fee-taking middlemen on prediction pools. The entire pool is split pro-rata directly among winners who accurately guessed the true capsule category.
                </p>
              </div>
            </div>
          </section>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-[#07070a] text-foreground relative overflow-hidden py-12 px-6 sm:px-10 max-w-5xl mx-auto" style={{ zoom: 1.2 }}>
      
      <div className="space-y-12 pb-32 relative z-10">
        
        {/* Header Portal Info */}
        <div className="space-y-4">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-primary/10 border border-primary/20 text-primary mb-2">
            DEVELOPER DOCUMENTATION
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4 uppercase">
            REVEALX <span className="text-primary font-black">DOCS</span>
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed">
            Full smart contract interfaces, client-side encryption algorithms, prediction pool wagers, and SDK code examples. Build next-generation time-locked escrows on EVM and Solana with RevealX.
          </p>
          
          <div className="flex items-center gap-3 pt-2">
            <button 
              onClick={() => handleSectionSwitch("smart-contracts-evm")} 
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-muted/65 border border-border text-foreground hover:bg-muted transition-all cursor-pointer"
            >
              <span className="font-bold">EVM INTERFACE</span>
            </button>
            <button 
              onClick={() => handleSectionSwitch("smart-contracts-svm")} 
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-muted/65 border border-border text-foreground hover:bg-muted transition-all cursor-pointer"
            >
              <span className="font-bold">SVM INTERFACE</span>
            </button>
          </div>
        </div>

        <div className="border-b border-border/30 w-full" />

        {/* Active Section Content (Internal Scroll/Lock Context) */}
        <div className="relative">
          {renderActiveSectionContent()}
        </div>

      </div>
    </div>
  )
}
