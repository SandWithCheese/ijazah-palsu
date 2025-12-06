# Web3 Integration Guide

This document explains the Web3/blockchain integration in the Ijazah Palsu project.

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Project Structure](#project-structure)
3. [Setup Instructions](#setup-instructions)
4. [Development Workflow](#development-workflow)
5. [Usage Examples](#usage-examples)
6. [Deployment](#deployment)

## 🏗️ Architecture Overview

The project integrates blockchain functionality using:

- **Truffle**: Smart contract development framework
- **Solidity**: Smart contract language (v0.8.20)
- **Ganache**: Local Ethereum blockchain for development
- **Web3.js**: JavaScript library for Ethereum interaction
- **OpenZeppelin**: Secure smart contract library

### Components

```
┌──────────────────────────────────────────┐
│         Frontend (TanStack Start)        │
│  - React hooks for Web3                  │
│  - Contract interaction layer            │
└────────────────┬─────────────────────────┘
                 │ Web3.js
                 ▼
┌──────────────────────────────────────────┐
│    Ethereum Network (Ganache/Testnet)   │
│  - IjazahNFT Smart Contract              │
│  - Certificate Registry                  │
└──────────────────────────────────────────┘
```

## 📁 Project Structure

```
ijazah-palsu/
├── contracts/                      # Smart contracts workspace
│   ├── contracts/                 # Solidity contracts
│   │   └── IjazahNFT.sol         # Main NFT contract
│   ├── migrations/                # Deployment scripts
│   │   └── 2_deploy_contracts.js
│   ├── test/                      # Contract tests
│   ├── truffle-config.js          # Truffle configuration
│   ├── package.json               # Contract dependencies
│   └── deployments.json           # Deployment addresses (generated)
│
├── src/lib/web3/                  # Web3 integration
│   ├── client.ts                  # Web3 client setup
│   ├── contracts.ts               # Contract interactions
│   └── hooks.ts                   # React hooks
│
└── public/contracts/              # Compiled ABIs (generated)
    └── IjazahNFT.json

```

## 🚀 Setup Instructions

### 1. Install Contract Dependencies

```bash
# From project root
npm run contracts:install

# Or from contracts directory
cd contracts
npm install
```

### 2. Install Frontend Dependencies

```bash
# From project root
npm install
```

This will install web3.js and other dependencies.

### 3. Start Ganache (via Docker)

```bash
docker-compose up -d ganache
```

Ganache will be available at `http://localhost:8545`

### 4. Compile Contracts

```bash
npm run contracts:compile
```

This generates:
- Contract ABIs in `public/contracts/`
- Build artifacts in `contracts/build/`

### 5. Deploy Contracts

```bash
npm run contracts:migrate
```

This deploys contracts to Ganache and creates `contracts/deployments.json`.

## 🔄 Development Workflow

### Typical Workflow

1. **Write/Modify Smart Contracts**
   ```bash
   # Edit files in contracts/contracts/
   ```

2. **Compile**
   ```bash
   npm run contracts:compile
   ```

3. **Test**
   ```bash
   npm run contracts:test
   ```

4. **Deploy**
   ```bash
   npm run contracts:migrate
   ```

5. **Use in Frontend**
   ```tsx
   import { useWeb3, useIjazahNFT } from '@/lib/web3/hooks'
   
   function MyComponent() {
     const { connect, account } = useWeb3()
     const { mintCertificate } = useIjazahNFT()
     
     // ... your code
   }
   ```

### Resetting Development Environment

```bash
# Reset Ganache (clears all data)
docker-compose restart ganache

# Redeploy contracts
npm run contracts:migrate
```

## 💡 Usage Examples

### Example 1: Connect Wallet

```tsx
import { useWeb3 } from '@/lib/web3/hooks'

function WalletConnect() {
  const { account, isConnected, connect, disconnect } = useWeb3()
  
  return (
    <div>
      {isConnected ? (
        <div>
          <p>Connected: {account}</p>
          <button onClick={disconnect}>Disconnect</button>
        </div>
      ) : (
        <button onClick={connect}>Connect Wallet</button>
      )}
    </div>
  )
}
```

### Example 2: Mint Certificate

```tsx
import { useIjazahNFT } from '@/lib/web3/hooks'

function MintCertificate() {
  const { mintCertificate, isLoading } = useIjazahNFT()
  
  const handleMint = async () => {
    const certificateData = {
      name: "John Doe",
      course: "Blockchain 101",
      date: new Date().toISOString()
    }
    
    const tokenURI = "ipfs://metadata-hash"
    
    try {
      const receipt = await mintCertificate(
        "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
        certificateData,
        tokenURI
      )
      console.log("Minted!", receipt)
    } catch (error) {
      console.error("Failed to mint:", error)
    }
  }
  
  return (
    <button onClick={handleMint} disabled={isLoading}>
      {isLoading ? "Minting..." : "Mint Certificate"}
    </button>
  )
}
```

### Example 3: Verify Certificate

```tsx
import { useIjazahNFT } from '@/lib/web3/hooks'

function VerifyCertificate({ tokenId }: { tokenId: number }) {
  const { verifyCertificate, getCertificateDetails } = useIjazahNFT()
  
  const handleVerify = async () => {
    // Get certificate data from your database
    const storedData = {
      name: "John Doe",
      course: "Blockchain 101",
      date: "2024-12-06"
    }
    
    const isValid = await verifyCertificate(tokenId, storedData)
    
    if (isValid) {
      const details = await getCertificateDetails(tokenId)
      console.log("Valid certificate!", details)
    } else {
      console.log("Invalid certificate!")
    }
  }
  
  return <button onClick={handleVerify}>Verify</button>
}
```

## 🌐 Deployment

### Deploying to Testnet (Sepolia)

1. **Update `.env`**
   ```env
   SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
   SEPOLIA_PRIVATE_KEY=your_private_key
   ```

2. **Update `truffle-config.js`**
   Uncomment the Sepolia network configuration

3. **Deploy**
   ```bash
   cd contracts
   npm run migrate -- --network sepolia
   ```

### Deploying to Mainnet

⚠️ **WARNING**: Test thoroughly on testnet first!

1. **Security Checklist**
   - [ ] Contracts audited
   - [ ] Tests passing
   - [ ] Gas optimization done
   - [ ] Access controls verified

2. **Update configuration for mainnet**

3. **Deploy with caution**
   ```bash
   npm run migrate -- --network mainnet
   ```

## 🔑 Environment Variables

```env
# Blockchain Configuration
GANACHE_PORT=8545
GANACHE_NETWORK_ID=5777
GANACHE_MNEMONIC=test test test test test test test test test test test junk

# Frontend
NEXT_PUBLIC_CHAIN_ID=5777
NEXT_PUBLIC_RPC_URL=http://localhost:8545

# For production (testnet/mainnet)
INFURA_PROJECT_ID=your_project_id
PRIVATE_KEY=your_private_key
```

## 📚 Smart Contract Methods

### IjazahNFT Contract

#### `mintCertificate(address recipient, bytes32 certificateHash, string tokenURI)`
Mints a new certificate NFT.

**Parameters:**
- `recipient`: Address to receive the certificate
- `certificateHash`: Hash of certificate data
- `tokenURI`: Metadata URI

**Returns:** `uint256` - Token ID

#### `verifyCertificate(uint256 tokenId, bytes32 certificateHash)`
Verifies a certificate by comparing hashes.

**Returns:** `bool` - True if valid

#### `getCertificateDetails(uint256 tokenId)`
Gets certificate information.

**Returns:**
- `address owner` - Current owner
- `address issuer` - Original issuer
- `uint256 issueDate` - Timestamp
- `bytes32 certificateHash` - Data hash

## 🧪 Testing

```bash
# Run contract tests
npm run contracts:test

# Run specific test file
cd contracts
npx truffle test ./test/ijazah.test.js
```

## 📖 Additional Resources

- [Truffle Documentation](https://trufflesuite.com/docs/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Web3.js Documentation](https://web3js.readthedocs.io/)
- [Solidity Documentation](https://docs.soliditylang.org/)

## 🐛 Troubleshooting

### Contract not found
- Make sure you've compiled: `npm run contracts:compile`
- Check if ABIs exist in `public/contracts/`

### Network mismatch
- Verify Ganache is running: `docker ps`
- Check CHAIN_ID matches in `.env`

### Transaction failed
- Check account has enough ETH
- Verify gas limit settings
- Check contract access controls

### MetaMask issues
- Add Ganache network manually in MetaMask
- Reset account if nonce issues occur
