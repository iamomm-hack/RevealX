/**
 * IPFS Service for uploading encrypted content
 * Using Pinata as IPFS provider
 */

const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY || '';
const PINATA_SECRET_KEY = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY || '';
const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT || '';

export interface IPFSUploadResult {
  cid: string;
  url: string;
}

/**
 * Upload encrypted content to IPFS via Pinata
 */
export async function uploadToIPFS(encryptedContent: string, metadata?: any): Promise<IPFSUploadResult> {
  try {
    // Using Pinata API
    const data = JSON.stringify({
      pinataContent: {
        encryptedData: encryptedContent,
        timestamp: Date.now(),
        ...metadata
      },
      pinataMetadata: {
        name: `time-capsule-${Date.now()}`,
      }
    });

    const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PINATA_JWT}`
      },
      body: data
    });

    if (!response.ok) {
      throw new Error(`IPFS upload failed: ${response.statusText}`);
    }

    const result = await response.json();
    
    return {
      cid: result.IpfsHash,
      url: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`
    };
  } catch (error) {
    console.error('IPFS Upload Error:', error);
    throw error;
  }
}

/**
 * Retrieve content from IPFS
 */
export async function retrieveFromIPFS(cid: string): Promise<any> {
  try {
    const response = await fetch(`https://gateway.pinata.cloud/ipfs/${cid}`);
    
    if (!response.ok) {
      throw new Error(`IPFS retrieval failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('IPFS Retrieval Error:', error);
    throw error;
  }
}
