import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from 'react'
import {
  requestAccounts,
  getCurrentAccount,
  getNetworkId,
  isCorrectNetwork,
  switchToCorrectNetwork,
  onAccountsChanged,
  onChainChanged,
} from '../lib/web3/client'
import { isIssuer } from '../lib/web3/contracts'

interface WalletContextType {
  address: string | null
  isConnected: boolean
  isIssuer: boolean
  isLoading: boolean
  networkId: number | null
  isCorrectNetwork: boolean
  connect: () => Promise<void>
  disconnect: () => void
  switchNetwork: () => Promise<void>
  error: string | null
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [networkId, setNetworkId] = useState<number | null>(null)
  const [correctNetwork, setCorrectNetwork] = useState(false)
  const [issuerStatus, setIssuerStatus] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check issuer status when address changes
  const checkIssuerStatus = async (addr: string) => {
    try {
      const status = await isIssuer(addr)
      setIssuerStatus(status)
    } catch (err) {
      console.error('Failed to check issuer status:', err)
      setIssuerStatus(false)
    }
  }

  // Initialize connection check
  useEffect(() => {
    const checkConnection = async () => {
      setIsLoading(true)
      try {
        // Check if already connected
        const account = await getCurrentAccount()
        if (account) {
          setAddress(account)
          await checkIssuerStatus(account)

          const netId = await getNetworkId()
          setNetworkId(netId)

          const isCorrect = await isCorrectNetwork()
          setCorrectNetwork(isCorrect)
        }
      } catch (err) {
        console.error('Failed to check wallet connection:', err)
      } finally {
        setIsLoading(false)
      }
    }

    // Only run on client side
    if (typeof window !== 'undefined') {
      checkConnection()

      // Listen for account changes
      onAccountsChanged(async (accounts: string[]) => {
        if (accounts.length === 0) {
          setAddress(null)
          setIssuerStatus(false)
        } else {
          setAddress(accounts[0])
          await checkIssuerStatus(accounts[0])
        }
      })

      // Listen for network changes
      onChainChanged(async () => {
        const netId = await getNetworkId()
        setNetworkId(netId)
        const isCorrect = await isCorrectNetwork()
        setCorrectNetwork(isCorrect)
      })
    }
  }, [])

  const connect = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const accounts = await requestAccounts()
      if (accounts.length > 0) {
        setAddress(accounts[0])
        await checkIssuerStatus(accounts[0])

        const netId = await getNetworkId()
        setNetworkId(netId)

        const isCorrect = await isCorrectNetwork()
        setCorrectNetwork(isCorrect)
      }
    } catch (err: any) {
      console.error('Failed to connect wallet:', err)
      setError(err.message || 'Failed to connect wallet')
    } finally {
      setIsLoading(false)
    }
  }

  const disconnect = () => {
    setAddress(null)
    setIssuerStatus(false)
    setNetworkId(null)
    setCorrectNetwork(false)
  }

  const switchNetwork = async () => {
    setError(null)
    try {
      await switchToCorrectNetwork()
      const isCorrect = await isCorrectNetwork()
      setCorrectNetwork(isCorrect)
    } catch (err: any) {
      console.error('Failed to switch network:', err)
      setError(err.message || 'Failed to switch network')
    }
  }

  return (
    <WalletContext.Provider
      value={{
        address,
        isConnected: !!address,
        isIssuer: issuerStatus,
        isLoading,
        networkId,
        isCorrectNetwork: correctNetwork,
        connect,
        disconnect,
        switchNetwork,
        error,
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

// Hook untuk mengecek akses institusi (issuer)
export function useInstitutionAccess() {
  const { isConnected, isIssuer, isLoading, address } = useWallet()

  return {
    hasAccess: isConnected && isIssuer,
    isLoading,
    isConnected,
    isInstitution: isIssuer,
    address,
  }
}
