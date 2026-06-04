import { ethers } from 'ethers';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '';

// Category enum mapping
export enum Category {
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

export const CATEGORY_NAMES = [
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

const CONTRACT_ABI = [
  // Create capsule with new parameters
  "function createCapsule(address _recipient, uint256 _unlockTime, string calldata _ipfsCid, bytes calldata _encryptedKey, string calldata _hint, uint8 _category, bool _isPublic) external payable",
  // Predictions
  "function makePrediction(uint256 _id, uint8 _guess) external payable",
  "function claimReward(uint256 _id) external",
  // Unlock
  "function unlockCapsule(uint256 _id) external",
  // Delete
  "function deleteCapsule(uint256 _id) external",
  // Social - Likes
  "function likeCapsule(uint256 _id) external",
  "function unlikeCapsule(uint256 _id) external",
  "function getCapsuleLikes(uint256 _id) external view returns (uint256)",
  "function hasLikedCapsule(uint256, address) external view returns (bool)",
  // Social - Stars
  "function starUser(address _user) external",
  "function unstarUser(address _user) external",
  "function getUserStars(address _user) external view returns (uint256)",
  "function hasStarredUser(address, address) external view returns (bool)",
  // View functions
  "function getCapsule(uint256 _id) external view returns (tuple(uint256 id, address creator, address recipient, string ipfsCID, bytes encryptedKey, uint256 unlockTime, uint256 stakeAmount, bool isUnlocked, bool stakeReleased, string hint, uint8 actualCategory, bool isPublic, uint256 predictionPool))",
  "function nextCapsuleId() external view returns (uint256)",
  "function getPredictionCount(uint256 _id) external view returns (uint256)",
  "function getPrediction(uint256 _id, uint256 _idx) external view returns (tuple(address predictor, uint8 guess, uint256 stakeAmount, bool claimed))",
  "function hasPredicted(uint256, address) external view returns (bool)",
  // Events
  "event CapsuleCreated(uint256 indexed id, address indexed creator, uint256 unlockTime, bool isPublic)",
  "event CapsuleUnlocked(uint256 indexed id, address indexed unlocker, uint8 actualCategory)",
  "event PredictionMade(uint256 indexed capsuleId, address indexed predictor, uint8 guess, uint256 stakeAmount)",
  "event RewardClaimed(uint256 indexed capsuleId, address indexed predictor, uint256 reward)",
  "event CapsuleDeleted(uint256 indexed id, address indexed creator)",
  "event CapsuleLiked(uint256 indexed capsuleId, address indexed liker)",
  "event UserStarred(address indexed user, address indexed starrer)"
];


export interface Capsule {
  id: string;
  creator: string;
  recipient: string;
  ipfsCID: string;
  encryptedKey: string;
  unlockTime: number;
  stakeAmount: string;
  isUnlocked: boolean;
  stakeReleased: boolean;
  hint: string;
  actualCategory: number;
  isPublic: boolean;
  predictionPool: string;
}

export interface Prediction {
  predictor: string;
  guess: number;
  stakeAmount: string;
  claimed: boolean;
}

export class TimeCapsuleService {
  private contract: ethers.Contract | null = null;
  private signer: ethers.Signer | null = null;

  async initialize(provider: ethers.BrowserProvider) {
    this.signer = await provider.getSigner();
    if (!CONTRACT_ADDRESS || !ethers.isAddress(CONTRACT_ADDRESS)) {
      console.warn('[TimeCapsuleService] Invalid or empty contract address configured:', CONTRACT_ADDRESS);
      this.contract = null;
      return;
    }
    this.contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, this.signer);
  }

  async createCapsule(
    recipient: string,
    unlockTime: number,
    ipfsCID: string,
    encryptedKey: Uint8Array,
    stakeAmount: string,
    hint: string = '',
    category: Category = Category.Other,
    isPublic: boolean = false
  ): Promise<string> {
    if (!this.contract) throw new Error('Contract not initialized');
    
    const tx = await this.contract.createCapsule(
      recipient,
      unlockTime,
      ipfsCID,
      encryptedKey,
      hint,
      category,
      isPublic,
      { value: ethers.parseEther(stakeAmount) }
    );
    
    const receipt = await tx.wait();
    
    // Try to get capsule ID
    try {
      const nextId = await this.contract.nextCapsuleId();
      return (Number(nextId) - 1).toString();
    } catch {
      return receipt.hash;
    }
  }

  async makePrediction(capsuleId: string, guess: Category, stakeAmount: string): Promise<void> {
    if (!this.contract) throw new Error('Contract not initialized');
    
    const tx = await this.contract.makePrediction(
      capsuleId,
      guess,
      { value: ethers.parseEther(stakeAmount) }
    );
    await tx.wait();
  }

  async claimReward(capsuleId: string): Promise<void> {
    if (!this.contract) throw new Error('Contract not initialized');
    
    const tx = await this.contract.claimReward(capsuleId);
    await tx.wait();
  }

  async unlockCapsule(capsuleId: string): Promise<void> {
    if (!this.contract) throw new Error('Contract not initialized');
    
    const tx = await this.contract.unlockCapsule(capsuleId);
    await tx.wait();
  }

  async getCapsule(capsuleId: string): Promise<Capsule> {
    if (!this.contract) throw new Error('Contract not initialized');
    
    const capsule = await this.contract.getCapsule(capsuleId);
    
    return {
      id: capsule.id.toString(),
      creator: capsule.creator,
      recipient: capsule.recipient,
      ipfsCID: capsule.ipfsCID,
      encryptedKey: ethers.hexlify(capsule.encryptedKey),
      unlockTime: Number(capsule.unlockTime),
      stakeAmount: ethers.formatEther(capsule.stakeAmount),
      isUnlocked: capsule.isUnlocked,
      stakeReleased: capsule.stakeReleased,
      hint: capsule.hint,
      actualCategory: Number(capsule.actualCategory),
      isPublic: capsule.isPublic,
      predictionPool: ethers.formatEther(capsule.predictionPool),
    };
  }

  async getNextCapsuleId(): Promise<number> {
    if (!this.contract) throw new Error('Contract not initialized');
    const id = await this.contract.nextCapsuleId();
    return Number(id);
  }

  async getPredictionCount(capsuleId: string): Promise<number> {
    if (!this.contract) throw new Error('Contract not initialized');
    const count = await this.contract.getPredictionCount(capsuleId);
    return Number(count);
  }

  async getPrediction(capsuleId: string, index: number): Promise<Prediction> {
    if (!this.contract) throw new Error('Contract not initialized');
    const pred = await this.contract.getPrediction(capsuleId, index);
    return {
      predictor: pred.predictor,
      guess: Number(pred.guess),
      stakeAmount: ethers.formatEther(pred.stakeAmount),
      claimed: pred.claimed,
    };
  }

  async hasPredicted(capsuleId: string, address: string): Promise<boolean> {
    if (!this.contract) throw new Error('Contract not initialized');
    return await this.contract.hasPredicted(capsuleId, address);
  }

  async deleteCapsule(capsuleId: string): Promise<void> {
    if (!this.contract) throw new Error('Contract not initialized');
    const tx = await this.contract.deleteCapsule(capsuleId);
    await tx.wait();
  }

  // ===== SOCIAL FEATURES =====
  
  async likeCapsule(capsuleId: string): Promise<void> {
    if (!this.contract) throw new Error('Contract not initialized');
    const tx = await this.contract.likeCapsule(capsuleId);
    await tx.wait();
  }

  async unlikeCapsule(capsuleId: string): Promise<void> {
    if (!this.contract) throw new Error('Contract not initialized');
    const tx = await this.contract.unlikeCapsule(capsuleId);
    await tx.wait();
  }

  async getCapsuleLikes(capsuleId: string): Promise<number> {
    if (!this.contract) throw new Error('Contract not initialized');
    const likes = await this.contract.getCapsuleLikes(capsuleId);
    return Number(likes);
  }

  async hasLikedCapsule(capsuleId: string, address: string): Promise<boolean> {
    if (!this.contract) throw new Error('Contract not initialized');
    return await this.contract.hasLikedCapsule(capsuleId, address);
  }

  async starUser(userAddress: string): Promise<void> {
    if (!this.contract) throw new Error('Contract not initialized');
    const tx = await this.contract.starUser(userAddress);
    await tx.wait();
  }

  async unstarUser(userAddress: string): Promise<void> {
    if (!this.contract) throw new Error('Contract not initialized');
    const tx = await this.contract.unstarUser(userAddress);
    await tx.wait();
  }

  async getUserStars(userAddress: string): Promise<number> {
    if (!this.contract) throw new Error('Contract not initialized');
    const stars = await this.contract.getUserStars(userAddress);
    return Number(stars);
  }

  async hasStarredUser(userAddress: string, starrerAddress: string): Promise<boolean> {
    if (!this.contract) throw new Error('Contract not initialized');
    return await this.contract.hasStarredUser(userAddress, starrerAddress);
  }
}

export const timeCapsuleService = new TimeCapsuleService();
