import { useState, useEffect } from 'react'
import {
  requestAccounts,
  getCurrentAccount,
  getNetworkId,
  isCorrectNetwork,
  switchToCorrectNetwork,
  onAccountsChanged,
  onChainChanged,
} from './client'

/**
 * Hook to manage Web3 connection
 */
export const useWeb3 = () => {
  const [account, setAccount] = useState<string | null>(null)
  const [networkId, setNetworkId] = useState<number | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isCorrectNet, setIsCorrectNet] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const connect = async () => {
    setIsLoading(true)
    setError(null)

    try {
      await requestAccounts()
      const currentAccount = await getCurrentAccount()
      setAccount(currentAccount)

      const netId = await getNetworkId()
      setNetworkId(netId)

      const correctNetwork = await isCorrectNetwork()
      setIsCorrectNet(correctNetwork)

      setIsConnected(true)
    } catch (err: any) {
      setError(err.message || 'Failed to connect to wallet')
      setIsConnected(false)
    } finally {
      setIsLoading(false)
    }
  }

  const disconnect = () => {
    setAccount(null)
    setNetworkId(null)
    setIsConnected(false)
    setIsCorrectNet(false)
  }

  const switchNetwork = async () => {
    try {
      setError(null)
      await switchToCorrectNetwork()
      const correctNetwork = await isCorrectNetwork()
      setIsCorrectNet(correctNetwork)
    } catch (err: any) {
      setError(err.message || 'Failed to switch network')
    }
  }

  useEffect(() => {
    const init = async () => {
      try {
        const currentAccount = await getCurrentAccount()

        if (currentAccount) {
          setAccount(currentAccount)
          const netId = await getNetworkId()
          setNetworkId(netId)
          const correctNetwork = await isCorrectNetwork()
          setIsCorrectNet(correctNetwork)
          setIsConnected(true)
        }
      } catch (err: any) {
        console.error('Web3 initialization error:', err)
      } finally {
        setIsLoading(false)
      }
    }

    init()

    onAccountsChanged((accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect()
      } else {
        setAccount(accounts[0])
      }
    })

    onChainChanged(async () => {
      const netId = await getNetworkId()
      setNetworkId(netId)
      const correctNetwork = await isCorrectNetwork()
      setIsCorrectNet(correctNetwork)
    })
  }, [])

  return {
    account,
    networkId,
    isConnected,
    isCorrectNetwork: isCorrectNet,
    isLoading,
    error,
    connect,
    disconnect,
    switchNetwork,
  }
}

/**
 * Hook to interact with IjazahNFT contract
 */
export const useIjazahNFT = () => {
  const { account, isConnected } = useWeb3()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Issue a new diploma
   */
  const issueDiploma = async (
    recipientAddress: string,
    documentHash: string,
    cid: string,
    signature: string,
  ) => {
    if (!account || !isConnected) {
      throw new Error('Wallet not connected')
    }

    setIsLoading(true)
    setError(null)

    try {
      const { issueDiploma: issue } = await import('./contracts')
      const receipt = await issue(
        recipientAddress,
        documentHash,
        cid,
        signature,
        account,
      )
      return receipt
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to issue diploma'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Revoke a diploma
   */
  const revokeDiploma = async (diplomaId: number, reason: string) => {
    if (!account || !isConnected) {
      throw new Error('Wallet not connected')
    }

    setIsLoading(true)
    setError(null)

    try {
      const { revokeDiploma: revoke } = await import('./contracts')
      const receipt = await revoke(diplomaId, reason, account)
      return receipt
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to revoke diploma'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Verify a diploma
   */
  const verifyDiploma = async (diplomaId: number) => {
    setIsLoading(true)
    setError(null)

    try {
      const { verifyDiploma: verify } = await import('./contracts')
      const result = await verify(diplomaId)
      return result
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to verify diploma'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Verify diploma hash
   */
  const verifyHash = async (diplomaId: number, documentHash: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const { verifyHash: verify } = await import('./contracts')
      const isMatch = await verify(diplomaId, documentHash)
      return isMatch
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to verify hash'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Get diploma details
   */
  const getDiplomaDetails = async (diplomaId: number) => {
    setIsLoading(true)
    setError(null)

    try {
      const { getDiplomaDetails: getDetails } = await import('./contracts')
      const details = await getDetails(diplomaId)
      return details
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to get diploma details'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Get revocation reason
   */
  const getRevocationReason = async (diplomaId: number) => {
    setIsLoading(true)
    setError(null)

    try {
      const { getRevocationReason: getReason } = await import('./contracts')
      const reason = await getReason(diplomaId)
      return reason
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to get revocation reason'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Check if connected account is an issuer
   */
  const checkIsIssuer = async () => {
    if (!account) return false

    try {
      const { isIssuer } = await import('./contracts')
      return await isIssuer(account)
    } catch {
      return false
    }
  }

  /**
   * Sign a message with wallet
   */
  const signMessage = async (message: string) => {
    if (!account || !isConnected) {
      throw new Error('Wallet not connected')
    }

    try {
      const { signMessage: sign } = await import('./contracts')
      return await sign(message, account)
    } catch (err: any) {
      throw new Error(err.message || 'Failed to sign message')
    }
  }

  return {
    issueDiploma,
    revokeDiploma,
    verifyDiploma,
    verifyHash,
    getDiplomaDetails,
    getRevocationReason,
    checkIsIssuer,
    signMessage,
    isLoading,
    error,
  }
}
