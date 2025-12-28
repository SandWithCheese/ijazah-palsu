# Sistem Pencatatan Ijazah Digital Berbasis Blockchain

**Tugas Besar II - IF4020 Kriptografi**  
**Semester I Tahun 2025/2026**  
**Institut Teknologi Bandung**

Sistem pencatatan ijazah digital berbasis blockchain menggunakan Ethereum Sepolia testnet dengan implementasi kriptografi lengkap (AES-256, SHA-256, ECDSA) untuk menjamin keaslian, keamanan, dan immutability dokumen ijazah.

---

## 📋 Daftar Isi

1. [Daftar Fungsi](#-daftar-fungsi)
2. [Teknologi yang Digunakan](#-teknologi-yang-digunakan)
3. [Cara Menjalankan](#-cara-menjalankan)
4. [Struktur Project](#-struktur-project)
5. [Daftar Dependensi](#-daftar-dependensi)
6. [Pembagian Tugas](#-pembagian-tugas)
7. [Smart Contract](#-smart-contract)
8. [Konfigurasi Environment](#-konfigurasi-environment)

---

## 🎯 Daftar Fungsi

### **Fitur Wajib (Sesuai Spesifikasi)**

#### **F-01: Autentikasi Admin dengan Nonce Challenge**
- **Lokasi:** `src/lib/auth.ts`, `src/routes/dashboard.tsx`
- **Deskripsi:** Autentikasi admin menggunakan wallet kripto (MetaMask) dengan metode signature nonce challenge
- **Implementasi:**
  - Generate random nonce menggunakan `crypto.getRandomValues()`
  - Admin menandatangani nonce dengan ECDSA signature melalui MetaMask
  - Verifikasi signature dengan `web3.eth.personal.ecRecover()`
  - Pemeriksaan role ISSUER pada smart contract
- **Algoritma Kriptografi:** ECDSA (secp256k1)

#### **F-02: Penerbitan Ijazah (Issue Certificate)**
- **Lokasi:** `src/routes/dashboard/mint.tsx`, `contracts/contracts/IjazahNFT.sol`
- **Deskripsi:** Menerbitkan ijazah digital sebagai NFT di blockchain dengan enkripsi dan hashing
- **Alur Proses:**
  1. Upload file PDF ijazah
  2. Hash file dengan SHA-256: `crypto.subtle.digest('SHA-256', fileBuffer)`
  3. Generate AES-256 key dan IV: `crypto.subtle.generateKey()`
  4. Enkripsi file dengan AES-256-CBC: `crypto.subtle.encrypt()`
  5. Upload file terenkripsi ke IPFS/storage
  6. Admin menandatangani hash dengan wallet
  7. Mint NFT di blockchain dengan data:
     - `documentHash`: SHA-256 hash (bytes32)
     - `cid`: IPFS CID atau storage URL (string)
     - `signature`: ECDSA signature dari issuer (bytes)
     - `studentName`: Nama mahasiswa (string)
     - `nim`: NIM mahasiswa (string)
  8. Emit event `DiplomaIssued` dengan semua metadata
  9. Generate URL verifikasi dengan encryption keys di hash fragment
- **Algoritma Kriptografi:** SHA-256, AES-256-CBC, ECDSA
- **Output:** Transaction hash, diploma ID, verification URL

#### **F-03: Pencabutan Ijazah (Revoke Certificate)**
- **Lokasi:** `src/routes/dashboard/records.tsx`, `contracts/contracts/IjazahNFT.sol`
- **Deskripsi:** Mencabut ijazah yang sudah diterbitkan dengan mencatat alasan
- **Implementasi:**
  - Hanya issuer yang dapat mencabut (`onlyRole(ISSUER_ROLE)`)
  - Mengubah status `isActive` menjadi `false`
  - Menyimpan alasan pencabutan di mapping `revocationReasons`
  - Emit event `DiplomaRevoked` dengan alasan dan timestamp
  - Status tercatat immutable di blockchain
- **Smart Contract Method:** `revokeDiploma(uint256 _diplomaId, string memory _reason)`

#### **F-04: Verifikasi Ijazah Publik**
- **Lokasi:** `src/routes/verify.tsx`, `src/lib/crypto.ts`, `src/lib/pdf-utils.ts`
- **Deskripsi:** Verifikasi keaslian ijazah dengan dekripsi dan validasi hash
- **Alur Verifikasi:**
  1. Parse URL verification (decode dari hash fragment)
  2. Extract: diplomaId, AES key, IV, CID
  3. Query blockchain untuk validasi exists (`verifyDiploma()`)
  4. Download file terenkripsi dari IPFS/storage
  5. Dekripsi dengan AES-256-CBC menggunakan key dari URL
  6. Hash file hasil dekripsi dengan SHA-256
  7. Compare hash dengan hash on-chain (`verifyHash()`)
  8. **Tambahkan QR code dan URL ke PDF** (requirement specification)
  9. Check status revocation
  10. Display hasil verifikasi dengan status (Valid/Invalid/Revoked)
- **Algoritma Kriptografi:** SHA-256, AES-256-CBC
- **Output:** Status verifikasi, file PDF dengan QR code embedded

#### **F-05: Integrasi Blockchain Explorer**
- **Lokasi:** `src/components/ExplorerLink.tsx`
- **Deskripsi:** Link ke Sepolia Etherscan untuk transparansi transaksi
- **Implementasi:**
  - Component wrapper untuk generate link otomatis
  - Support untuk transaction hash, address, dan block
  - Link format: `https://sepolia.etherscan.io/address/{contractAddress}`
  - Tersedia di semua halaman yang menampilkan transaksi
- **URL Contract Explorer:** https://sepolia.etherscan.io/address/0x3b8281F04302EFFE8e243D172FFE5aE29ac0Ad7D

#### **F-06: Public Ledger (Daftar Transaksi)**
- **Lokasi:** `src/routes/ledger.tsx`
- **Deskripsi:** Halaman publik untuk melihat semua transaksi penerbitan ijazah
- **Fitur:**
  - Tampilkan semua diploma yang pernah diterbitkan
  - Filter: All, Active, Revoked
  - Search by diploma ID, student name, NIM, atau owner address
  - Pagination (10 items per page)
  - Export data ke CSV/JSON
  - Link ke blockchain explorer per transaction
  - Informasi lengkap: ID, owner, issuer, timestamp, status
- **Data Source:** Blockchain via `getAllDiplomas()` smart contract method

### **Fitur Tambahan (Sesuai Spesifikasi)**

#### **F-07: QR Code & URL Embedding ke PDF** ⭐
- **Lokasi:** `src/lib/pdf-utils.ts`, `src/routes/verify.tsx`
- **Deskripsi:** Menambahkan verification URL (dan QR code untuk PDF) ke file ijazah setelah verifikasi (sesuai spesifikasi)
- **Implementasi:**
  - **Proses (sesuai spec):**
    > "Setelah mengunduh (dari storage), mendekripsi, dan memverifikasi ijazah, **front-end menambahkan URL ijazah ke file ijazah tersebut** yang selanjutnya dapat diunduh."
  
  - **Untuk PDF files:**
    - Menggunakan library `pdf-lib` untuk manipulasi PDF
    - Menggunakan library `qrcode` untuk generate QR code
    - QR code di-embed di pojok kanan bawah halaman terakhir
    - Ukuran QR: 100x100px
    - Informasi: QR code, verification URL, diploma ID, instruksi
    - Border frame untuk visual clarity
  
  - **Untuk Text files (.txt):**
    - Append verification section di akhir file
    - Berisi: Diploma ID, verification URL, blockchain info, timestamp
    - Format text dengan border untuk readability
  
  - **Untuk file lain (images):**
    - Return original file (images biasanya ditampilkan dengan QR di UI)

- **Library:** `pdf-lib@1.17.1`, `qrcode@1.5.4`
- **Output:** PDF dengan QR code embedded, atau text file dengan verification URL appended

#### **F-08: Enkripsi Off-Chain dengan AES-256**
- **Lokasi:** `src/lib/crypto.ts`
- **Deskripsi:** Enkripsi file ijazah sebelum upload ke storage
- **Implementasi:**
  - Algorithm: AES-256-CBC (Web Crypto API)
  - Key generation: 256-bit random key
  - IV generation: 128-bit random IV
  - Padding: PKCS#7 (automatic dari Web Crypto)
- **Functions:**
  - `generateAESKey()`: Generate random 256-bit key
  - `generateIV()`: Generate random 128-bit IV
  - `encryptFile(file, key, iv)`: Encrypt file dengan AES-256-CBC
  - `decryptData(encrypted, key, iv)`: Decrypt data
  - Key dan IV di-encode dalam URL sebagai Base64

#### **F-09: Hashing dengan SHA-256**
- **Lokasi:** `src/lib/crypto.ts`
- **Deskripsi:** Generate hash dari dokumen ijazah untuk integrity check
- **Implementasi:**
  - Algorithm: SHA-256 (Web Crypto API)
  - Input: ArrayBuffer dari file ijazah
  - Output: Hex string dengan prefix "0x" (format Ethereum bytes32)
- **Function:** `calculateFileHash(file)`: File → SHA-256 hash
- **Penggunaan:**
  - Hash sebelum enkripsi (untuk verifikasi)
  - Disimpan di blockchain sebagai `documentHash`
  - Dibandingkan saat verifikasi untuk detect tampering

#### **F-10: Storage Multi-Platform**
- **Lokasi:** `src/lib/filebase.ts`, `src/lib/storage.ts`
- **Deskripsi:** Support multiple storage backends
- **Supported Storage:**
  1. **IPFS via Filebase** (Production)
     - Decentralized storage
     - Content-addressed (CID)
     - Permanent storage
     - S3-compatible API
  2. **Local Storage** (Development)
     - Files di `public/uploads/`
     - Fast untuk testing
     - Dengan metadata JSON
- **Auto-fallback:** IPFS → Local jika IPFS tidak tersedia

---

### **🎁 BONUS: Multi-Issuer Management**

#### **B-01: Manajemen Multiple Issuers**
- **Lokasi:** `contracts/contracts/IjazahNFT.sol`, `contracts/scripts/add-issuer.js`
- **Deskripsi:** Sistem role-based access control untuk multiple issuers
- **Implementasi:**
  - Menggunakan OpenZeppelin `AccessControl`
  - Role hierarchy:
    - `DEFAULT_ADMIN_ROLE`: Super admin (deployer)
    - `ISSUER_ROLE`: Authorized diploma issuers
  - **Functions:**
    - `addIssuer(address)`: Admin menambah issuer baru
    - `removeIssuer(address)`: Admin menghapus issuer
    - `isIssuer(address)`: Check apakah address adalah issuer
  - Semua transaksi issue/revoke memerlukan `ISSUER_ROLE`
- **Script:** `contracts/scripts/add-issuer.js` untuk menambah issuer via CLI
- **Benefit:** Mendukung mekanisme multi-signature dan distributed trust

---

## 🛠 Teknologi yang Digunakan

### **Blockchain & Smart Contract**
- **Blockchain:** Ethereum Sepolia Testnet
- **Smart Contract:** Solidity 0.8.20
- **Development Framework:** Hardhat 2.19.0
- **Contract Standard:** ERC-721 (NFT) + AccessControl
- **Libraries:** OpenZeppelin Contracts 5.0.0
- **Deployed Contract:** `0x3b8281F04302EFFE8e243D172FFE5aE29ac0Ad7D`

### **Frontend**
- **Framework:** React 19.2.1
- **Routing:** TanStack Router 1.139.14
- **State Management:** TanStack Query 5.90.12
- **Build Tool:** Vite 7.2.6
- **Styling:** Tailwind CSS 4.1.17
- **UI Components:** Radix UI, Lucide Icons

### **Web3 Integration**
- **Web3 Library:** Web3.js 4.16.0
- **Wallet:** MetaMask browser extension
- **RPC:** Sepolia public RPC (https://rpc.sepolia.org)

### **Kriptografi**
- **Platform:** Web Crypto API (native browser)
- **Symmetric Encryption:** AES-256-CBC
- **Hashing:** SHA-256
- **Digital Signature:** ECDSA (secp256k1 via MetaMask)

### **Storage**
- **IPFS Provider:** Filebase (S3-compatible)
- **Local Storage:** File system (development)
- **Database:** PostgreSQL 16 (metadata)
- **ORM:** Drizzle ORM 0.39.3

### **Deployment & DevOps**
- **Containerization:** Docker + Docker Compose
- **Node.js Runtime:** Node 20 Alpine
- **Package Manager:** pnpm 10.26.2

### **PDF Manipulation** (NEW)
- **PDF Library:** pdf-lib 1.17.1
- **QR Code Generator:** qrcode 1.5.4

---

## 🚀 Cara Menjalankan

### **Prerequisites**
- Node.js 20+
- pnpm (`npm install -g pnpm`)
- Docker & Docker Compose
- MetaMask browser extension
- Sepolia testnet ETH (dari faucet)

### **Langkah 1: Clone Repository**
```bash
git clone <repository-url>
cd ijazah-palsu
```

### **Langkah 2: Install Dependencies**
```bash
# Install frontend dependencies
pnpm install

# Install contract dependencies
cd contracts
pnpm install
cd ..
```

### **Langkah 3: Setup Environment Variables**
```bash
# Copy example env
cp .env.example .env

# Edit .env file
nano .env
```

**Konfigurasi minimal (`.env`):**
```bash
# Database
DATABASE_URL=postgresql://postgres:password@postgres:5432/ijazah_palsu
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_DB=ijazah_palsu

# Blockchain (Sepolia Testnet)
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_RPC_URL=https://rpc.sepolia.org
NEXT_PUBLIC_EXPLORER_URL=https://sepolia.etherscan.io

# Storage (Optional - use local if not configured)
# FILEBASE_ACCESS_KEY=your_key
# FILEBASE_SECRET_KEY=your_secret
# FILEBASE_BUCKET=your_bucket
# FILEBASE_GATEWAY=https://your-gateway.myfilebase.com/ipfs/

# Deployment (untuk deploy contract)
SEPOLIA_RPC_URL=https://rpc.sepolia.org
DEPLOYER_PRIVATE_KEY=your_private_key_here
```

### **Langkah 4: Deploy Smart Contract (Opsional)**

**CATATAN:** Contract sudah di-deploy di Sepolia: `0x3b8281F04302EFFE8e243D172FFE5aE29ac0Ad7D`

Jika ingin deploy ulang:
```bash
cd contracts

# Compile contract
pnpm run compile

# Deploy ke Sepolia
pnpm run deploy:sepolia

# Contract address akan tersimpan di contracts/deployments.json
```

### **Langkah 5: Jalankan Aplikasi dengan Docker**

**Opsi A: Development Mode (Recommended)**
```bash
# Start semua services (PostgreSQL + App)
docker-compose up --build -d

# Check logs
docker-compose logs -f app

# Stop
docker-compose down
```

**Opsi B: Local Development (tanpa Docker)**
```bash
# Start database
docker-compose up postgres -d

# Update DATABASE_URL di .env untuk localhost:
# DATABASE_URL=postgresql://postgres:password@localhost:5436/ijazah_palsu

# Push database schema
pnpm db:push

# Start development server
pnpm dev
```

### **Langkah 6: Setup MetaMask**
1. Install MetaMask extension
2. Tambah network Sepolia:
   - Network Name: Sepolia Testnet
   - RPC URL: https://rpc.sepolia.org
   - Chain ID: 11155111
   - Currency: SepoliaETH
3. Get testnet ETH dari faucet:
   - https://sepoliafaucet.com
   - https://faucet.quicknode.com/ethereum/sepolia
4. Buka aplikasi: http://localhost:3000

---

## 📁 Struktur Project

```
ijazah-palsu/
├── contracts/                      # Smart Contract Workspace
│   ├── contracts/
│   │   └── IjazahNFT.sol          # Main smart contract (ERC-721)
│   ├── scripts/
│   │   ├── deploy.js              # Deployment script
│   │   └── add-issuer.js          # Add issuer script (BONUS)
│   ├── test/
│   │   └── ijazah.test.js         # Contract unit tests
│   ├── hardhat.config.js          # Hardhat configuration
│   ├── deployments.json           # Deployed contract addresses
│   └── package.json               # Contract dependencies
│
├── src/
│   ├── components/                # React Components
│   │   ├── ui/                    # Reusable UI components
│   │   ├── AccessDenied.tsx       # 403 page
│   │   ├── ClientOnly.tsx         # Client-side only wrapper
│   │   ├── ExplorerLink.tsx       # Blockchain explorer links
│   │   ├── Nav.tsx                # Navigation bar
│   │   └── PublicNav.tsx          # Public pages navigation
│   │
│   ├── db/                        # Database
│   │   ├── schema.ts              # Drizzle ORM schema
│   │   └── index.ts               # Database connection
│   │
│   ├── hooks/                     # Custom React Hooks
│   │   └── useWallet.tsx          # Wallet connection hook
│   │
│   ├── lib/                       # Core Libraries
│   │   ├── auth.ts                # 🔐 F-01: Nonce challenge authentication
│   │   ├── crypto.ts              # 🔐 F-08, F-09: AES-256 & SHA-256
│   │   ├── pdf-utils.ts           # 📄 F-07: QR code embedding (NEW)
│   │   ├── storage.ts             # 💾 F-10: File storage
│   │   ├── filebase.ts            # 💾 F-10: IPFS integration
│   │   └── web3/
│   │       ├── client.ts          # Web3 client setup
│   │       └── contracts.ts       # Smart contract interactions
│   │
│   ├── routes/                    # Pages (TanStack Router)
│   │   ├── api/                   # API endpoints
│   │   │   ├── upload.ts          # File upload endpoint
│   │   │   └── files/$cid.ts     # File download endpoint
│   │   │
│   │   ├── dashboard/             # Admin Dashboard (Protected)
│   │   │   ├── index.tsx          # Dashboard home
│   │   │   ├── mint.tsx           # 📝 F-02: Issue diploma
│   │   │   ├── records.tsx        # 📋 F-03: View & revoke diplomas
│   │   │   └── settings.tsx       # ⚙️ B-01: Manage issuers (BONUS)
│   │   │
│   │   ├── __root.tsx             # Root layout
│   │   ├── index.tsx              # Landing page
│   │   ├── dashboard.tsx          # Dashboard layout + auth
│   │   ├── verify.tsx             # ✅ F-04: Public verification
│   │   └── ledger.tsx             # 📊 F-06: Public ledger
│   │
│   ├── styles.css                 # Global styles
│   ├── router.tsx                 # Router configuration
│   └── env.ts                     # Environment validation
│
├── public/                        # Static Assets
│   ├── contracts/                 # Compiled contract ABIs
│   │   ├── contracts/IjazahNFT.sol/IjazahNFT.json
│   │   ├── deployments.json       # Deployment addresses
│   │   └── ...                    # OpenZeppelin contracts
│   ├── uploads/                   # Local file storage (dev)
│   └── favicon.svg
│
├── docker-compose.yml             # Docker services configuration
├── Dockerfile.dev                 # Development Docker image
├── package.json                   # Frontend dependencies
├── pnpm-lock.yaml                 # Locked dependency versions
├── tsconfig.json                  # TypeScript configuration
├── vite.config.ts                 # Vite build configuration
└── README.md                      # This file
```

---

## 📦 Daftar Dependensi

Dependensi lengkap tercatat di `package.json` dan `pnpm-lock.yaml`.

### **Frontend Dependencies**
```json
{
  "@tanstack/react-router": "1.139.14",
  "@tanstack/react-start": "1.139.14",
  "@tanstack/react-query": "5.90.12",
  "react": "19.2.1",
  "react-dom": "19.2.1",
  "web3": "4.16.0",
  "tailwindcss": "4.1.17",
  "lucide-react": "0.544.0",
  "pdf-lib": "1.17.1",
  "qrcode": "1.5.4",
  "drizzle-orm": "0.39.3",
  "pg": "8.16.3",
  "zod": "4.1.13"
}
```

### **Contract Dependencies**
```json
{
  "@openzeppelin/contracts": "5.0.0",
  "@nomicfoundation/hardhat-toolbox": "4.0.0",
  "hardhat": "2.19.0",
  "dotenv": "16.0.0"
}
```

### **Install Dependencies**
```bash
# Frontend
pnpm install

# Contracts
cd contracts && pnpm install
```

---

## 👥 Pembagian Tugas

| Nama | NIM | Kontribusi |
|------|-----|------------|
| **Anggota 1** | 135XXXXX | **Smart Contract & Blockchain** <br/>- Desain dan implementasi smart contract IjazahNFT.sol (ERC-721)<br/>- Setup Hardhat dan deployment ke Sepolia testnet<br/>- Implementasi AccessControl untuk multi-issuer (BONUS)<br/>- Testing smart contract functions<br/>- Deployment script dan add-issuer script<br/>- Integrasi dengan blockchain explorer |
| **Anggota 2** | 135XXXXX | **Kriptografi & Security** <br/>- Implementasi AES-256-CBC encryption/decryption (`src/lib/crypto.ts`)<br/>- Implementasi SHA-256 hashing untuk integrity check<br/>- ECDSA signature authentication dengan nonce challenge (`src/lib/auth.ts`)<br/>- **QR code embedding ke PDF (`src/lib/pdf-utils.ts`)** ⭐<br/>- File storage integration (IPFS & local)<br/>- Security review dan testing |
| **Anggota 3** | 135XXXXX | **Frontend & Integration** <br/>- Setup React + TanStack Router + Vite<br/>- Implementasi halaman dashboard admin (mint, records, settings)<br/>- Implementasi halaman public (verify, ledger)<br/>- Web3 integration dengan MetaMask (`src/lib/web3/`)<br/>- UI/UX design dengan Tailwind CSS<br/>- Docker configuration untuk deployment<br/>- Documentation dan video demo |

**Catatan:** Semua anggota melakukan code review bersama dan testing integrasi.
