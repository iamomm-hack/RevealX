import { ethers } from 'ethers';

export function getJsonRpcProvider(): ethers.JsonRpcProvider {
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '';
  
  // If the contract address is the default Hardhat local address, use localhost.
  // Otherwise, fallback to the Sepolia public RPC node.
  const rpcUrl = contractAddress.toLowerCase() === '0x5fbdb2315678afecb367f032d93f642f64180aa3'
    ? 'http://127.0.0.1:8545'
    : 'https://ethereum-sepolia-rpc.publicnode.com';
    
  return new ethers.JsonRpcProvider(rpcUrl);
}
