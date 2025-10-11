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
}

export interface Prediction {
  id: string
  capsuleId: string
  predictor: string
  prediction: "popular" | "unpopular"
  stakeAmount: string
  createdAt: number
}

// Simulate smart contract interactions
export class TimeCapsuleContract {
  static async createCapsule(capsuleData: {
    title: string
    contentHash: string
    unlockDate: Date
    category: string
    isPublic: boolean
  }): Promise<string> {
    // Simulate blockchain transaction delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const capsuleId = "TC-" + Date.now().toString(36).toUpperCase()

    // In a real implementation, this would interact with the smart contract
    console.log("[v0] Creating capsule on blockchain:", capsuleData)

    return capsuleId
  }

  static async getCapsule(capsuleId: string): Promise<TimeCapsule | null> {
    // Simulate fetching from blockchain
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Mock capsule data
    return {
      id: capsuleId,
      creator: "0x" + Math.random().toString(16).substr(2, 40),
      title: "Sample Time Capsule",
      contentHash: "Qm" + Math.random().toString(36).substr(2, 44),
      unlockDate: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days from now
      category: "personal",
      isPublic: true,
      createdAt: Date.now(),
      totalStaked: "150.5",
      predictionCount: 23,
    }
  }

  static async getUserCapsules(userAddress: string): Promise<TimeCapsule[]> {
    // Simulate fetching user's capsules
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock data
    return [
      {
        id: "TC-USER1",
        creator: userAddress,
        title: "My Future Predictions",
        contentHash: "Qm" + Math.random().toString(36).substr(2, 44),
        unlockDate: Date.now() + 15 * 24 * 60 * 60 * 1000,
        category: "prediction",
        isPublic: true,
        createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
        totalStaked: "75.2",
        predictionCount: 12,
      },
    ]
  }

  static async stakePrediction(
    capsuleId: string,
    prediction: "popular" | "unpopular",
    amount: string,
  ): Promise<string> {
    // Simulate staking transaction
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const predictionId = "PRED-" + Date.now().toString(36).toUpperCase()

    console.log("[v0] Staking prediction:", { capsuleId, prediction, amount })

    return predictionId
  }

  static async getCapsulesForPrediction(): Promise<TimeCapsule[]> {
    // Simulate fetching capsules available for prediction
    await new Promise((resolve) => setTimeout(resolve, 800))

    // Mock data
    return [
      {
        id: "TC-PRED1",
        creator: "0x" + Math.random().toString(16).substr(2, 40),
        title: "AI Will Replace Most Jobs by 2030",
        contentHash: "Qm" + Math.random().toString(36).substr(2, 44),
        unlockDate: Date.now() + 365 * 24 * 60 * 60 * 1000, // 1 year
        category: "prediction",
        isPublic: true,
        createdAt: Date.now() - 10 * 24 * 60 * 60 * 1000,
        totalStaked: "1250.8",
        predictionCount: 89,
      },
      {
        id: "TC-PRED2",
        creator: "0x" + Math.random().toString(16).substr(2, 40),
        title: "My Startup Will Be Worth $1M",
        contentHash: "Qm" + Math.random().toString(36).substr(2, 44),
        unlockDate: Date.now() + 180 * 24 * 60 * 60 * 1000, // 6 months
        category: "goal",
        isPublic: true,
        createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
        totalStaked: "892.3",
        predictionCount: 45,
      },
    ]
  }
}
