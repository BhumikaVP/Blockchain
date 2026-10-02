import { ethers } from 'ethers';
import ContractArtifact from '../contracts/CertificateVerifier.json';

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || ContractArtifact.address;
const CONTRACT_ABI = ContractArtifact.abi;

export async function getProvider() {
  if (window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }
  throw new Error("No crypto wallet found. Please install MetaMask.");
}

export async function getContract(signerOrProvider) {
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signerOrProvider);
}

export async function connectWallet() {
  const provider = await getProvider();
  await provider.send("eth_requestAccounts", []);
  const signer = await provider.getSigner();
  const address = await signer.getAddress();
  
  // Also check if they are the issuer
  const contract = await getContract(signer);
  const ISSUER_ROLE = await contract.ISSUER_ROLE();
  const isIssuer = await contract.hasRole(ISSUER_ROLE, address);

  return { address, signer, isIssuer };
}

// For public verifier that doesn't need to sign anything
export async function getReadOnlyContract() {
  // If metamask is not available, we could fallback to a public RPC
  // But for this project, we assume the user has Metamask for the network
  const provider = window.ethereum ? new ethers.BrowserProvider(window.ethereum) : ethers.getDefaultProvider("sepolia");
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
}
