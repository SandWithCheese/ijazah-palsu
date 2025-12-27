# Digital Diploma System (Ijazah Palsu)

Sistem pencatatan ijazah digital berbasis blockchain dengan kriptografi untuk menjamin keaslian dan keamanan dokumen.

## Fitur Utama

- **F-01**: Autentikasi Admin via Nonce Challenge (ECDSA signature)
- **F-02**: Penerbitan Ijazah (enkripsi AES-256, hash SHA-256, upload ke storage)
- **F-03**: Pencabutan Ijazah dengan alasan
- **F-04**: Verifikasi publik dengan dekripsi dan validasi hash
- **F-05**: Integrasi Blockchain Explorer (Sepolia Etherscan)
- **F-06**: Public Ledger - daftar semua transaksi

## Tech Stack

| Layer          | Teknologi                                |
| -------------- | ---------------------------------------- |
| Frontend       | React + TanStack Router + TanStack Start |
| Styling        | Tailwind CSS                             |
| Smart Contract | Solidity (ERC-721) + OpenZeppelin        |
| Blockchain     | Sepolia Testnet / Ganache (dev)          |
| Web3           | Web3.js + MetaMask                       |
| Kriptografi    | Web Crypto API (AES-256-CBC, SHA-256)    |
| Storage        | Local (dev) / IPFS (production)          |

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm
- MetaMask browser extension
- Ganache (for local dev) or Sepolia testnet ETH

### Installation

```bash
# Clone repository
git clone <repo-url>
cd tubes-2

# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env
# Edit .env with your configuration

# Start development server
pnpm dev
```

### Smart Contract Deployment

```bash
cd contracts

# Install contract dependencies
npm install

# For local Ganache
npx truffle migrate --network development

# For Sepolia testnet
npx truffle migrate --network sepolia
```

### Docker Development (with hot reload)

```bash
# Start all services
docker-compose up --build

# App available at http://localhost:3000
```

## Project Structure

```
├── contracts/           # Solidity smart contracts
│   ├── contracts/       # Contract source files
│   ├── migrations/      # Truffle migrations
│   └── test/           # Contract tests
├── src/
│   ├── components/     # React components
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utility libraries
│   │   ├── auth.ts     # Nonce challenge authentication
│   │   ├── crypto.ts   # AES/SHA-256 cryptography
│   │   ├── storage.ts  # File storage service
│   │   └── web3/       # Web3 client & contracts
│   └── routes/         # TanStack Router pages
│       ├── dashboard/  # Admin dashboard pages
│       ├── verify.tsx  # Public verification
│       └── ledger.tsx  # Public transaction ledger
└── public/             # Static assets & uploads
```

## Environment Variables

| Variable                   | Description                  | Default                      |
| -------------------------- | ---------------------------- | ---------------------------- |
| `NEXT_PUBLIC_CHAIN_ID`     | Blockchain network ID        | 11155111 (Sepolia)           |
| `NEXT_PUBLIC_RPC_URL`      | RPC endpoint URL             | https://rpc.sepolia.org      |
| `NEXT_PUBLIC_EXPLORER_URL` | Block explorer URL           | https://sepolia.etherscan.io |
| `DATABASE_URL`             | PostgreSQL connection string | -                            |

## Testing

```bash
# Run smart contract tests
cd contracts && npm test

# Run frontend linting
pnpm lint
```

## Pembagian Tugas Kelompok

| Anggota | Kontribusi                  |
| ------- | --------------------------- |
| -       | Smart Contract Development  |
| -       | Frontend Development        |
| -       | Cryptography Implementation |
| -       | Documentation & Testing     |

## Referensi

- [PRD Document](./PRD.md) - Product Requirements Document
- [Smart Contract README](./contracts/README.md) - Contract deployment guide
- [Web3 Guide](./WEB3_GUIDE.md) - Web3 integration documentation

---

**IF4020 Kriptografi - Tugas Besar II**  
Institut Teknologi Bandung - Semester I 2025/2026
