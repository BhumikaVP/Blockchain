# Blockchain-Based Certificate Verifier

A decentralized application (dApp) built to issue, store, and verify academic certificates on the Ethereum blockchain using smart contracts and IPFS.

## Overview
This project solves the problem of certificate forgery by ensuring that academic credentials cannot be tampered with once issued.

### Objectives
- Issue academic certificates as blockchain records.
- Provide a cryptographic fingerprint (SHA-256) of certificates to ensure authenticity.
- Provide a public verification tool that anyone can use without an issuer account.
- Allow issuers to cryptographically revoke certificates if issued by mistake.

### Features
1. **Issuer Dashboard**: A secure area for institutions to issue and manage certificates.
2. **Issue Certificate**: Captures student data, uploads the document to IPFS, calculates SHA-256, and stores the hash on the blockchain.
3. **QR Code Verification**: Generates QR codes that instantly route to the verifier page.
4. **Public Verifier**: Anyone can upload a certificate. The system recalculates the SHA-256 hash and checks the blockchain for its validity.
5. **Revocation**: Issuers can mark a certificate as revoked while retaining the blockchain trail.

## Architecture
- **Frontend**: React + Vite + TailwindCSS.
- **Web3 Interface**: Ethers.js connects the frontend to the smart contract via MetaMask.
- **Smart Contract**: Written in Solidity using OpenZeppelin AccessControl.
- **Storage**: IPFS via Pinata (with a mock fallback for local development).
- **Hashing**: Browser's native `crypto.subtle` API calculates SHA-256.

### Privacy First
No personal information (student name, grades, etc.) is stored directly on the blockchain. Only the cryptographic hash (fingerprint) of the certificate is stored on-chain.

## Setup Instructions

### 1. Environment Setup
Create a `.env` file in the project root based on `.env.example`:
```env
SEPOLIA_RPC_URL=https://rpc.sepolia.org
PRIVATE_KEY=your_private_key_here
VITE_PINATA_JWT=your_pinata_jwt_here
```

### 2. Local Blockchain Development
1. Start the local Hardhat node:
   ```bash
   npx hardhat node
   ```
2. In a new terminal, deploy the smart contract to the local network:
   ```bash
   npx hardhat run scripts/deploy.js --network localhost
   ```
This will automatically generate the `CertificateVerifier.json` ABI file in the frontend `src/contracts/` folder.

### 3. Start Frontend
1. Navigate to `frontend`:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
2. Open http://localhost:5173

### 4. MetaMask Configuration
1. Install the MetaMask browser extension.
2. Add Localhost Network:
   - Network Name: Localhost 8545
   - RPC URL: http://127.0.0.1:8545
   - Chain ID: 31337
3. Import an account using one of the private keys provided by the `npx hardhat node` output. This account will be the ISSUER.

## Usage Guide (Demo)

### Demo 1: Issue a Certificate
1. Connect MetaMask (ensure you are using the Issuer account).
2. Go to "Issue".
3. Fill in the student details and upload a sample certificate file (PDF/Image).
4. Click "Issue Certificate on Blockchain" and confirm the MetaMask transaction.
5. A QR code and success screen will appear.

### Demo 2: Verify Original
1. Go to "Verify".
2. Upload the exact same certificate file you just issued.
3. The system will say **✓ CERTIFICATE VALID** and show the issue date and issuer.

### Demo 3: Tampering Demonstration
1. Open the original certificate file and change a single pixel or text (e.g., change the Grade from A to B). Save the tampered file.
2. Go to "Verify" and upload the tampered file.
3. The system will output a different SHA-256 hash and say **✕ CERTIFICATE NOT FOUND / INVALID**.

### Demo 4: Revocation
1. Log in with the Issuer account.
2. Go to "History".
3. Click "Revoke" on the issued certificate and confirm in MetaMask.
4. Go back to "Verify" and upload the original certificate.
5. The system will now say **⚠ CERTIFICATE REVOKED**.

## Testing
Run the comprehensive smart contract test suite:
```bash
npx hardhat test
```

## Deployment to Sepolia Testnet
When ready to deploy publicly:
1. Ensure your `.env` has `SEPOLIA_RPC_URL` and `PRIVATE_KEY` funded with Sepolia ETH.
2. Run:
   ```bash
   npx hardhat run scripts/deploy.js --network sepolia
   ```
3. Update `VITE_CONTRACT_ADDRESS` in `frontend/.env` with the newly deployed address.

## Limitations & Future Enhancements
- Currently, the mock IPFS storage clears when the browser refreshes. Pinata must be configured for persistent IPFS storage.
- Future enhancement: Bulk certificate issuance.
- Future enhancement: Support for soulbound tokens (SBTs) instead of just hashes.
