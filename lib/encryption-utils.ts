import CryptoJS from 'crypto-js';

/**
 * Generate a random AES-256 symmetric key
 */
export function generateSymmetricKey(): string {
  return CryptoJS.lib.WordArray.random(32).toString();
}

/**
 * Encrypt content using AES-256
 */
export function encryptContent(content: string, symmetricKey: string): string {
  return CryptoJS.AES.encrypt(content, symmetricKey).toString();
}

/**
 * Decrypt content using AES-256
 */
export function decryptContent(encryptedContent: string, symmetricKey: string): string {
  const bytes = CryptoJS.AES.decrypt(encryptedContent, symmetricKey);
  return bytes.toString(CryptoJS.enc.Utf8);
}

/**
 * Encrypt the symmetric key using wallet signature-based encryption
 * This ensures only the wallet holder can decrypt
 */
export async function encryptSymmetricKey(
  symmetricKey: string,
  walletAddress: string,
  signer: any
): Promise<Uint8Array> {
  // Create a deterministic message for the wallet to sign
  const message = `Encrypt Time Capsule Key for: ${walletAddress}`;
  
  // Get signature from wallet
  const signature = await signer.signMessage(message);
  
  // Use the signature as encryption key (deterministic based on wallet)
  const encryptedKey = CryptoJS.AES.encrypt(symmetricKey, signature).toString();
  
  // Convert to Uint8Array for contract storage
  return new TextEncoder().encode(encryptedKey);
}

/**
 * Decrypt the symmetric key using wallet signature
 */
export async function decryptSymmetricKey(
  encryptedKeyHex: string,
  walletAddress: string,
  signer: any
): Promise<string> {
  // Recreate the same message
  const message = `Encrypt Time Capsule Key for: ${walletAddress}`;
  
  // Get the same signature
  const signature = await signer.signMessage(message);
  
  // Decode from hex/base64
  const encryptedKeyStr = new TextDecoder().decode(
    Uint8Array.from(Buffer.from(encryptedKeyHex.replace('0x', ''), 'hex'))
  );
  
  // Decrypt using signature
  const bytes = CryptoJS.AES.decrypt(encryptedKeyStr, signature);
  return bytes.toString(CryptoJS.enc.Utf8);
}
