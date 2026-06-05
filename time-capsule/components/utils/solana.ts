import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js"
import { AnchorProvider, Program, Wallet, Idl } from "@coral-xyz/anchor"
import { Metaplex, keypairIdentity } from "@metaplex-foundation/js"
import idl from "../../idl/time_capsule.json" // adjust path if needed

// ---------------- Solana connection ----------------
export const connection = new Connection(clusterApiUrl("devnet"))

// ---------------- Anchor provider helper ----------------
export const getAnchorProvider = (wallet: Wallet) => {
  return new AnchorProvider(connection, wallet, AnchorProvider.defaultOptions())
}

// ---------------- Program helper ----------------
export const getProgram = (wallet: Wallet) => {
  const provider = getAnchorProvider(wallet)

  // Use dummy public key for now (replace with deployed program ID later)
  const programId = new PublicKey(
    (idl as any).metadata?.address || "11111111111111111111111111111111"
  )

  // @ts-ignore - IDL type compatibility
  return new Program(idl as any, programId, provider)
}

// ---------------- Metaplex helper (for NFT minting) ----------------
export const getMetaplex = (wallet: Wallet) => {
  const metaplex = Metaplex.make(connection)
  metaplex.use(keypairIdentity(wallet.payer))
  return metaplex
}
