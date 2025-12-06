# Smart Contracts

This directory contains the Solidity smart contracts for the Ijazah Palsu project.

## Quick Start

```bash
# Install dependencies
npm install

# Compile contracts
npm run compile

# Run tests
npm run test

# Deploy to development (Ganache)
npm run migrate

# Deploy to Docker Ganache
npm run migrate:docker
```

## Contracts

### IjazahNFT.sol
NFT contract for certificate management using ERC-721 standard.

**Features:**
- Mint certificates as NFTs
- Store certificate data hash on-chain
- Verify certificate authenticity
- Track issuer and issue date

## Development

See [WEB3_GUIDE.md](../WEB3_GUIDE.md) in the project root for detailed documentation.

## Testing

```bash
npm run test
```

Tests are located in `test/` directory.

## Network Configuration

Networks are configured in `truffle-config.js`:

- **development**: Local Ganache (localhost:8545)
- **docker**: Ganache in Docker (ganache:8545)
- **sepolia**: Ethereum testnet (requires configuration)

## Output

Compiled contracts are output to:
- `../public/contracts/` - ABIs for frontend use
- `build/contracts/` - Truffle build artifacts

Deployment information is saved to:
- `deployments.json` - Contract addresses per network
