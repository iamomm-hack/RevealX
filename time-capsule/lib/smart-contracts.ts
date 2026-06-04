import { ethers } from 'ethers';
import { retrieveFromIPFS } from './ipfs-service';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '';
const CONTRACT_ABI = [
  "function getCapsule(uint256 _id) external view returns (tuple(uint256 id, address creator, address recipient, string ipfsCID, bytes encryptedKey, uint256 unlockTime, uint256 stakeAmount, address stakeToken, bool isUnlocked, bool stakeReleased))",
  "function nextCapsuleId() external view returns (uint256)",
];

export interface TimeCapsule {
  id: string
  creator: string
  title: string
  contentHash: string
  unlockDate: number
  category: string
  isPublic: boolean
  createdAt: number
  totalStaked: string
  predictionCount: number
  recipient?: string
  isUnlocked?: boolean
}

export interface Prediction {
  id: string
  capsuleId: string
  predictor: string
  prediction: "popular" | "unpopular"
  stakeAmount: string
  createdAt: number
}

// Get a read-only contract instance using local Hardhat RPC
function getReadOnlyContract(): ethers.Contract | null {
  if (!CONTRACT_ADDRESS || !ethers.isAddress(CONTRACT_ADDRESS)) {
    console.error('[TimeCapsuleContract] No valid contract address configured:', CONTRACT_ADDRESS);
    return null;
  }
  
  // Use localhost Hardhat network for local development (FREE!)
  const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
}

// Real smart contract interactions
export class TimeCapsuleContract {
  static async createCapsule(capsuleData: {
    title: string
    contentHash: string
    unlockDate: Date
    category: string
    isPublic: boolean
  }): Promise<string> {
    // This is handled by contract-service.ts now
    console.log("[TimeCapsuleContract] Creating capsule:", capsuleData)
    return "CREATED"
  }

  static async getCapsule(capsuleId: string): Promise<TimeCapsule | null> {
    try {
      const contract = getReadOnlyContract();
      if (!contract) return null;
      
      const capsule = await contract.getCapsule(capsuleId);
      
      // Try to get metadata from IPFS
      let title = `Capsule #${capsuleId}`;
      let category = 'personal';
      
      if (capsule.ipfsCID) {
        try {
          const ipfsData = await retrieveFromIPFS(capsule.ipfsCID);
          title = ipfsData?.title || title;
          category = ipfsData?.category || category;
        } catch (e) {
          console.error('Error fetching IPFS data:', e);
        }
      }
      
      return {
        id: capsule.id.toString(),
        creator: capsule.creator,
        title: title,
        contentHash: capsule.ipfsCID,
        unlockDate: Number(capsule.unlockTime) * 1000, // Convert to milliseconds
        category: category,
        isPublic: true,
        createdAt: Date.now(), // Contract doesn't store creation time
        totalStaked: ethers.formatEther(capsule.stakeAmount),
        predictionCount: 0,
        recipient: capsule.recipient,
        isUnlocked: capsule.isUnlocked,
      };
    } catch (error) {
      console.error("[TimeCapsuleContract] Error getting capsule:", error);
      return null;
    }
  }

  static async getUserCapsules(userAddress: string): Promise<TimeCapsule[]> {
    try {
      const contract = getReadOnlyContract();
      if (!contract) {
        console.error('[TimeCapsuleContract] Contract not available');
        return [];
      }
      
      const capsules: TimeCapsule[] = [];
      const nextId = await contract.nextCapsuleId();
      const totalCapsules = Number(nextId);
      
      console.log(`[TimeCapsuleContract] Scanning ${totalCapsules} capsules for user ${userAddress}`);
      
      // Iterate through all capsules to find user's capsules
      for (let i = 0; i < totalCapsules; i++) {
        try {
          const capsule = await contract.getCapsule(i);
          
          // Check if user is creator or recipient
          if (capsule.creator.toLowerCase() === userAddress.toLowerCase() ||
              capsule.recipient.toLowerCase() === userAddress.toLowerCase()) {
            
            console.log(`[TimeCapsuleContract] Found capsule ${i} for user`);
            
            // Try to get metadata from IPFS
            let title = `Capsule #${i}`;
            let category = 'personal';
            
            if (capsule.ipfsCID) {
              try {
                const ipfsData = await retrieveFromIPFS(capsule.ipfsCID);
                title = ipfsData?.title || title;
                category = ipfsData?.category || category;
              } catch (e) {
                // Ignore IPFS errors
              }
            }
            
            capsules.push({
              id: capsule.id.toString(),
              creator: capsule.creator,
              title: title,
              contentHash: capsule.ipfsCID,
              unlockDate: Number(capsule.unlockTime) * 1000, // Convert to milliseconds
              category: category,
              isPublic: true,
              createdAt: Date.now(),
              totalStaked: ethers.formatEther(capsule.stakeAmount),
              predictionCount: 0,
              recipient: capsule.recipient,
              isUnlocked: capsule.isUnlocked,
            });
          }
        } catch (e) {
          // Capsule might not exist or fetch error
          console.error(`[TimeCapsuleContract] Error fetching capsule ${i}:`, e);
        }
      }
      
      console.log(`[TimeCapsuleContract] Found ${capsules.length} capsules for user`);
      return capsules;
    } catch (error) {
      console.error("[TimeCapsuleContract] Error getting user capsules:", error);
      return [];
    }
  }

  static async stakePrediction(
    capsuleId: string,
    prediction: "popular" | "unpopular",
    amount: string,
  ): Promise<string> {
    // Simulate staking transaction (not implemented in current contract)
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const predictionId = "PRED-" + Date.now().toString(36).toUpperCase()

    console.log("[v0] Staking prediction:", { capsuleId, prediction, amount })

    return predictionId
  }

  static async getCapsulesForPrediction(): Promise<TimeCapsule[]> {
    try {
      const contract = getReadOnlyContract();
      if (!contract) return [];
      
      // Get all public capsules for prediction
      const capsules: TimeCapsule[] = [];
      const nextId = await contract.nextCapsuleId();
      const totalCapsules = Math.min(Number(nextId), 10); // Limit to 10 for performance
      
      for (let i = 0; i < totalCapsules; i++) {
        try {
          const capsule = await contract.getCapsule(i);
          
          let title = `Capsule #${i}`;
          if (capsule.ipfsCID) {
            try {
              const ipfsData = await retrieveFromIPFS(capsule.ipfsCID);
              title = ipfsData?.title || title;
            } catch (e) {
              // Ignore IPFS errors
            }
          }
          
          capsules.push({
            id: capsule.id.toString(),
            creator: capsule.creator,
            title: title,
            contentHash: capsule.ipfsCID,
            unlockDate: Number(capsule.unlockTime) * 1000,
            category: 'prediction',
            isPublic: true,
            createdAt: Date.now(),
            totalStaked: ethers.formatEther(capsule.stakeAmount),
            predictionCount: 0,
          });
        } catch (e) {
          // Skip errors
        }
      }
      
      return capsules;
    } catch (error) {
      console.error("[TimeCapsuleContract] Error getting capsules for prediction:", error);
      return [];
    }
  }
}
