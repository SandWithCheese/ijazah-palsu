import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from 'react'

// Daftar wallet institusi yang terotorisasi (placeholder)
// Nantinya akan diambil dari smart contract
const AUTHORIZED_INSTITUTION_WALLETS = [
  '0x1234567890abcdef1234567890abcdef12345678',
  '0xabcdef1234567890abcdef1234567890abcdef12',
  // Tambahkan wallet institusi lainnya di sini
]

interface WalletContextType {
  address: string | null
  isConnected: boolean
  isInstitution: boolean
  isLoading: boolean
  connect: () => Promise<void>
  disconnect: () => void
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulasi pengecekan wallet yang sudah terkoneksi
    // Nantinya akan menggunakan Web3 provider sebenarnya
    const checkConnection = async () => {
      setIsLoading(true)
      try {
        // Placeholder: simulasi wallet terkoneksi
        // Untuk demo, kita anggap wallet sudah terkoneksi
        const mockAddress = '0x1234567890abcdef1234567890abcdef12345678'
        setAddress(mockAddress)
      } catch (error) {
        console.error('Failed to check wallet connection:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkConnection()
  }, [])

  const connect = async () => {
    setIsLoading(true)
    try {
      // Placeholder: simulasi koneksi wallet
      // Nantinya akan menggunakan MetaMask atau wallet provider lainnya
      const mockAddress = '0x1234567890abcdef1234567890abcdef12345678'
      setAddress(mockAddress)
    } catch (error) {
      console.error('Failed to connect wallet:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const disconnect = () => {
    setAddress(null)
  }

  const isConnected = !!address
  const isInstitution = address
    ? AUTHORIZED_INSTITUTION_WALLETS.includes(address.toLowerCase())
    : false

  return (
    <WalletContext.Provider
      value={{
        address,
        isConnected,
        isInstitution,
        isLoading,
        connect,
        disconnect,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}

// Hook untuk mengecek akses institusi
export function useInstitutionAccess() {
  const { isConnected, isInstitution, isLoading, address } = useWallet()

  return {
    hasAccess: isConnected && isInstitution,
    isLoading,
    isConnected,
    isInstitution,
    address,
  }
}
