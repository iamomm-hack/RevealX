import { isAddress } from 'ethers';

// User Profile Service - localStorage based for username/avatar
// Likes/Stars are on-chain via smart contract

export interface UserProfile {
  address: string
  username: string
  avatarUrl: string // IPFS URL or data URL
  bio: string
  createdAt: number
}

const PROFILES_KEY = 'timecapsule_profiles'

// Get all profiles from localStorage
function getAllProfiles(): Record<string, UserProfile> {
  if (typeof window === 'undefined') return {}
  const data = localStorage.getItem(PROFILES_KEY)
  return data ? JSON.parse(data) : {}
}

// Save profiles to localStorage
function saveAllProfiles(profiles: Record<string, UserProfile>) {
  if (typeof window === 'undefined') return
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles))
}

// Get profile by address
export function getProfile(address: string): UserProfile | null {
  const profiles = getAllProfiles()
  return profiles[address.toLowerCase()] || null
}

// Save/update profile
export function saveProfile(profile: UserProfile) {
  const profiles = getAllProfiles()
  profiles[profile.address.toLowerCase()] = {
    ...profile,
    address: profile.address.toLowerCase()
  }
  saveAllProfiles(profiles)
}

// Search profiles by username or address
export function searchProfiles(query: string): UserProfile[] {
  const profiles = getAllProfiles()
  const trimmedQuery = query.trim()
  const lowerQuery = trimmedQuery.toLowerCase()
  
  const results = Object.values(profiles).filter(p => 
    (p.username && p.username.toLowerCase().includes(lowerQuery)) ||
    (p.address && p.address.toLowerCase().includes(lowerQuery))
  )
  
  // If the query is a valid Ethereum address and not in results, add a default profile for it
  if (isAddress(trimmedQuery)) {
    const cleanAddress = trimmedQuery.toLowerCase()
    const alreadyExists = results.some(r => r.address.toLowerCase() === cleanAddress)
    if (!alreadyExists) {
      const existing = profiles[cleanAddress]
      if (existing) {
        results.push(existing)
      } else {
        results.push({
          address: cleanAddress,
          username: "Anonymous User",
          avatarUrl: "",
          bio: "This user has not set up a profile yet.",
          createdAt: Date.now()
        })
      }
    }
  }
  
  return results;
}

// Get display name (username or truncated address)
export function getDisplayName(address: string): string {
  const profile = getProfile(address)
  if (profile?.username) {
    return profile.username
  }
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

// Get avatar URL (profile pic or default)
export function getAvatarUrl(address: string): string | null {
  const profile = getProfile(address)
  return profile?.avatarUrl || null
}

// Generate initials from address for default avatar
export function getInitials(address: string): string {
  const profile = getProfile(address)
  if (profile?.username) {
    return profile.username.slice(0, 2).toUpperCase()
  }
  return address.slice(2, 4).toUpperCase()
}
