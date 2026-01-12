import { 
  Connection, 
  PublicKey, 
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  clusterApiUrl
} from '@solana/web3.js';
import { AnchorProvider, Program, BN, Idl } from '@coral-xyz/anchor';

// Program ID from Anchor.toml
const PROGRAM_ID = new PublicKey('GccELE2LzH3tot4qx6ooEjxryaAdZNJq4oP6quMhySKT');

// Category enum matching Solidity contract
export enum SolanaCategory {
  StartupLaunch = 0,
  Marriage = 1,
  Breakup = 2,
  CryptoProfit = 3,
  JobAnnouncement = 4,
  Travel = 5,
  Graduation = 6,
  Secret = 7,
  Other = 8
}

export const SOLANA_CATEGORY_NAMES = [
  'Startup Launch',
  'Marriage',
  'Breakup',
  'Crypto Profit',
  'Job Announcement',
  'Travel',
  'Graduation',
  'Secret',
  'Other'
];

export interface SolanaCapsule {
  id: string;
  creator: string;
  recipient: string;
  ipfsCid: string;
  hint: string;
  category: number;
  unlockTime: number;
  stakeAmount: string;
  isPublic: boolean;
  isUnlocked: boolean;
  predictionPool: string;
  predictionCount: number;
}

export interface SolanaPrediction {
  predictor: string;
  capsuleId: string;
  guess: number;
  stakeAmount: string;
  claimed: boolean;
}

// Simplified IDL for the program
const IDL: Idl = {
  version: "0.1.0",
  name: "time_capsule_program",
  instructions: [
    {
      name: "initialize",
      accounts: [
        { name: "capsuleCounter", isMut: true, isSigner: false },
        { name: "authority", isMut: true, isSigner: true },
        { name: "systemProgram", isMut: false, isSigner: false }
      ],
      args: []
    },
    {
      name: "createCapsule",
      accounts: [
        { name: "capsule", isMut: true, isSigner: false },
        { name: "capsuleCounter", isMut: true, isSigner: false },
        { name: "recipient", isMut: false, isSigner: false },
        { name: "creator", isMut: true, isSigner: true },
        { name: "systemProgram", isMut: false, isSigner: false }
      ],
      args: [
        { name: "ipfsCid", type: "string" },
        { name: "encryptedKey", type: "bytes" },
        { name: "hint", type: "string" },
        { name: "category", type: "u8" },
        { name: "unlockTime", type: "i64" },
        { name: "isPublic", type: "bool" }
      ]
    },
    {
      name: "makePrediction",
      accounts: [
        { name: "prediction", isMut: true, isSigner: false },
        { name: "capsule", isMut: true, isSigner: false },
        { name: "predictor", isMut: true, isSigner: true },
        { name: "systemProgram", isMut: false, isSigner: false }
      ],
      args: [{ name: "guess", type: "u8" }]
    },
    {
      name: "unlockCapsule",
      accounts: [
        { name: "capsule", isMut: true, isSigner: false },
        { name: "authority", isMut: false, isSigner: true }
      ],
      args: []
    },
    {
      name: "claimReward",
      accounts: [
        { name: "capsule", isMut: false, isSigner: false },
        { name: "prediction", isMut: true, isSigner: false },
        { name: "predictor", isMut: false, isSigner: true }
      ],
      args: []
    }
  ],
  accounts: [
    {
      name: "CapsuleCounter",
      type: { kind: "struct", fields: [{ name: "count", type: "u64" }] }
    },
    {
      name: "Capsule",
      type: {
        kind: "struct",
        fields: [
          { name: "id", type: "u64" },
          { name: "creator", type: "publicKey" },
          { name: "recipient", type: "publicKey" },
          { name: "ipfsCid", type: "string" },
          { name: "encryptedKey", type: "bytes" },
          { name: "hint", type: "string" },
          { name: "category", type: "u8" },
          { name: "unlockTime", type: "i64" },
          { name: "stakeAmount", type: "u64" },
          { name: "isPublic", type: "bool" },
          { name: "isUnlocked", type: "bool" },
          { name: "predictionPool", type: "u64" },
          { name: "predictionCount", type: "u32" },
          { name: "bump", type: "u8" }
        ]
      }
    },
    {
      name: "Prediction",
      type: {
        kind: "struct",
        fields: [
          { name: "predictor", type: "publicKey" },
          { name: "capsuleId", type: "u64" },
          { name: "guess", type: "u8" },
          { name: "stakeAmount", type: "u64" },
          { name: "claimed", type: "bool" },
          { name: "bump", type: "u8" }
        ]
      }
    }
  ]
};

export class SolanaTimeCapsuleService {
  private connection: Connection;
  private program: Program | null = null;
  private provider: AnchorProvider | null = null;

  constructor(cluster: 'devnet' | 'mainnet-beta' | 'localnet' = 'devnet') {
    const endpoint = cluster === 'localnet' 
      ? 'http://127.0.0.1:8899' 
      : clusterApiUrl(cluster);
    this.connection = new Connection(endpoint, 'confirmed');
  }

  async initialize(wallet: any) {
    // @ts-ignore
    this.provider = new AnchorProvider(this.connection, wallet, {
      preflightCommitment: 'confirmed'
    });
    // @ts-ignore
    this.program = new Program(IDL, PROGRAM_ID, this.provider);
  }

  // Get PDA for capsule counter
  private getCounterPDA(): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('counter')],
      PROGRAM_ID
    );
  }

  // Get PDA for capsule by ID
  private getCapsulePDA(id: number): [PublicKey, number] {
    const idBuffer = Buffer.alloc(8);
    idBuffer.writeBigUInt64LE(BigInt(id));
    return PublicKey.findProgramAddressSync(
      [Buffer.from('capsule'), idBuffer],
      PROGRAM_ID
    );
  }

  // Get PDA for prediction
  private getPredictionPDA(capsulePubkey: PublicKey, predictorPubkey: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('prediction'), capsulePubkey.toBuffer(), predictorPubkey.toBuffer()],
      PROGRAM_ID
    );
  }

  async createCapsule(
    recipient: string,
    unlockTime: number,
    ipfsCid: string,
    encryptedKey: Uint8Array,
    stakeAmount: string,
    hint: string,
    category: SolanaCategory,
    isPublic: boolean
  ): Promise<string> {
    if (!this.program || !this.provider) throw new Error('Not initialized');

    const [counterPDA] = this.getCounterPDA();
    const counterAccount = await this.program.account.capsuleCounter.fetch(counterPDA);
    const capsuleId = (counterAccount as any).count.toNumber();
    const [capsulePDA] = this.getCapsulePDA(capsuleId);

    const tx = await this.program.methods
      .createCapsule(
        ipfsCid,
        Buffer.from(encryptedKey),
        hint,
        category,
        new BN(unlockTime),
        isPublic
      )
      .accounts({
        capsule: capsulePDA,
        capsuleCounter: counterPDA,
        recipient: new PublicKey(recipient),
        creator: this.provider.wallet.publicKey,
        systemProgram: SystemProgram.programId
      })
      .rpc();

    return capsuleId.toString();
  }

  async makePrediction(
    capsuleId: string,
    guess: SolanaCategory,
    stakeAmount: string
  ): Promise<void> {
    if (!this.program || !this.provider) throw new Error('Not initialized');

    const [capsulePDA] = this.getCapsulePDA(parseInt(capsuleId));
    const [predictionPDA] = this.getPredictionPDA(
      capsulePDA,
      this.provider.wallet.publicKey
    );

    await this.program.methods
      .makePrediction(guess)
      .accounts({
        prediction: predictionPDA,
        capsule: capsulePDA,
        predictor: this.provider.wallet.publicKey,
        systemProgram: SystemProgram.programId
      })
      .rpc();
  }

  async unlockCapsule(capsuleId: string): Promise<void> {
    if (!this.program || !this.provider) throw new Error('Not initialized');

    const [capsulePDA] = this.getCapsulePDA(parseInt(capsuleId));

    await this.program.methods
      .unlockCapsule()
      .accounts({
        capsule: capsulePDA,
        authority: this.provider.wallet.publicKey
      })
      .rpc();
  }

  async claimReward(capsuleId: string): Promise<void> {
    if (!this.program || !this.provider) throw new Error('Not initialized');

    const [capsulePDA] = this.getCapsulePDA(parseInt(capsuleId));
    const [predictionPDA] = this.getPredictionPDA(
      capsulePDA,
      this.provider.wallet.publicKey
    );

    await this.program.methods
      .claimReward()
      .accounts({
        capsule: capsulePDA,
        prediction: predictionPDA,
        predictor: this.provider.wallet.publicKey
      })
      .rpc();
  }

  async getCapsule(capsuleId: string): Promise<SolanaCapsule | null> {
    if (!this.program) throw new Error('Not initialized');

    try {
      const [capsulePDA] = this.getCapsulePDA(parseInt(capsuleId));
      const capsule = await this.program.account.capsule.fetch(capsulePDA);
      
      return {
        id: (capsule as any).id.toString(),
        creator: (capsule as any).creator.toString(),
        recipient: (capsule as any).recipient.toString(),
        ipfsCid: (capsule as any).ipfsCid,
        hint: (capsule as any).hint,
        category: (capsule as any).category,
        unlockTime: (capsule as any).unlockTime.toNumber(),
        stakeAmount: ((capsule as any).stakeAmount.toNumber() / LAMPORTS_PER_SOL).toString(),
        isPublic: (capsule as any).isPublic,
        isUnlocked: (capsule as any).isUnlocked,
        predictionPool: ((capsule as any).predictionPool.toNumber() / LAMPORTS_PER_SOL).toString(),
        predictionCount: (capsule as any).predictionCount
      };
    } catch {
      return null;
    }
  }

  async getNextCapsuleId(): Promise<number> {
    if (!this.program) throw new Error('Not initialized');

    const [counterPDA] = this.getCounterPDA();
    try {
      const counter = await this.program.account.capsuleCounter.fetch(counterPDA);
      return (counter as any).count.toNumber();
    } catch {
      return 0;
    }
  }
}

export const solanaTimeCapsuleService = new SolanaTimeCapsuleService('devnet');
