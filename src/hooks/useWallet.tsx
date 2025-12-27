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
  const [isMounted, setIsMounted] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
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

  // Handle client-side mounting to prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Initialize connection check
  useEffect(() => {
    if (!isMounted) return

    const checkConnection = async () => {
      setIsLoading(true)
      try {
        // Check if MetaMask is available
        if (typeof window === 'undefined' || !(window as any).ethereum) {
          setIsLoading(false)
          return
        }

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

    checkConnection()

    // Listen for account changes
    if (typeof window !== 'undefined' && (window as any).ethereum) {
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
  }, [isMounted])

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
