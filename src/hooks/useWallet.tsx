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
import {
  authenticateWithWallet,
  getAuthSession,
  clearAuthSession,
  isSessionValid,
} from '../lib/auth'

interface WalletContextType {
  address: string | null
  isConnected: boolean
  isIssuer: boolean
  isAuthenticated: boolean
  isLoading: boolean
  networkId: number | null
  isCorrectNetwork: boolean
  connect: () => Promise<void>
  authenticate: () => Promise<{ success: boolean; error?: string }>
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
  const [authenticated, setAuthenticated] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check issuer status when address changes
  const checkIssuerStatus = async (addr: string): Promise<boolean> => {
    try {
      const status = await isIssuer(addr)
      setIssuerStatus(status)
      return status
    } catch (err) {
      console.error('Failed to check issuer status:', err)
      setIssuerStatus(false)
      return false
    }
  }

  // Check if session is still valid
  const checkAuthSession = (addr: string) => {
    const session = getAuthSession()
    if (session && isSessionValid(addr)) {
      setAuthenticated(true)
      setIssuerStatus(session.isIssuer)
    } else {
      setAuthenticated(false)
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
          checkAuthSession(account)

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
          setAuthenticated(false)
          clearAuthSession()
        } else {
          // When account changes, invalidate auth
          setAddress(accounts[0])
          await checkIssuerStatus(accounts[0])
          // Check if we have a valid session for this account
          checkAuthSession(accounts[0])
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
        checkAuthSession(accounts[0])

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

  // Nonce challenge authentication (PRD F-01)
  const authenticate = async (): Promise<{
    success: boolean
    error?: string
  }> => {
    if (!address) {
      return { success: false, error: 'Wallet not connected' }
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await authenticateWithWallet(address, async () => {
        return await checkIssuerStatus(address)
      })

      if (result.success) {
        setAuthenticated(true)
      } else {
        setError(result.error || 'Authentication failed')
      }

      return result
    } catch (err: any) {
      const errorMsg = err.message || 'Authentication failed'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setIsLoading(false)
    }
  }

  const disconnect = () => {
    setAddress(null)
    setIssuerStatus(false)
    setAuthenticated(false)
    setNetworkId(null)
    setCorrectNetwork(false)
    clearAuthSession()
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
        isAuthenticated: authenticated,
        isLoading,
        networkId,
        isCorrectNetwork: correctNetwork,
        connect,
        authenticate,
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

// Hook untuk mengecek akses institusi (issuer) dengan authentication
export function useInstitutionAccess() {
  const { isConnected, isIssuer, isAuthenticated, isLoading, address } =
    useWallet()

  return {
    // Full access requires: connected + authenticated + issuer role
    hasAccess: isConnected && isAuthenticated && isIssuer,
    isLoading,
    isConnected,
    isAuthenticated,
    isInstitution: isIssuer,
    address,
  }
}
