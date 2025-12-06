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
      // Request account access
      await requestAccounts()

      // Get current account
      const currentAccount = await getCurrentAccount()
      setAccount(currentAccount)

      // Get network ID
      const netId = await getNetworkId()
      setNetworkId(netId)

      // Check if on correct network
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

  // Initialize and set up listeners
  useEffect(() => {
    const init = async () => {
      try {
        // Check if already connected
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

    // Set up event listeners
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

  const mintCertificate = async (
    recipientAddress: string,
    certificateData: any,
    tokenURI: string,
  ) => {
    if (!account || !isConnected) {
      throw new Error('Wallet not connected')
    }

    setIsLoading(true)
    setError(null)

    try {
      const { mintCertificate: mint, createCertificateHash } =
        await import('./contracts')

      const certificateHash = createCertificateHash(certificateData)
      const receipt = await mint(
        recipientAddress,
        certificateHash,
        tokenURI,
        account,
      )

      return receipt
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to mint certificate'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const verifyCertificate = async (tokenId: number, certificateData: any) => {
    setIsLoading(true)
    setError(null)

    try {
      const { verifyCertificate: verify, createCertificateHash } =
        await import('./contracts')

      const certificateHash = createCertificateHash(certificateData)
      const isValid = await verify(tokenId, certificateHash)

      return isValid
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to verify certificate'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const getCertificateDetails = async (tokenId: number) => {
    setIsLoading(true)
    setError(null)

    try {
      const { getCertificateDetails: getDetails } = await import('./contracts')
      const details = await getDetails(tokenId)

      return details
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to get certificate details'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const getOwnedCertificates = async (ownerAddress?: string) => {
    const address = ownerAddress || account

    if (!address) {
      throw new Error('No address provided')
    }

    setIsLoading(true)
    setError(null)

    try {
      const { getOwnedTokens } = await import('./contracts')
      const tokens = await getOwnedTokens(address)

      return tokens
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to get owned certificates'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    mintCertificate,
    verifyCertificate,
    getCertificateDetails,
    getOwnedCertificates,
    isLoading,
    error,
  }
}
