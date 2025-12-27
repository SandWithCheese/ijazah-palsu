import Web3 from 'web3'

let web3Instance: Web3 | null = null

/**
 * Get or create Web3 instance
 */
export const getWeb3 = (): Web3 => {
  if (web3Instance) {
    return web3Instance
  }

  // Check if MetaMask or other Web3 provider is available
  if (typeof window !== 'undefined' && (window as any).ethereum) {
    web3Instance = new Web3((window as any).ethereum)
    return web3Instance
  }

  // Fallback to HTTP provider (for server-side or development)
  const providerUrl = process.env.NEXT_PUBLIC_RPC_URL || 'http://localhost:8545'
  web3Instance = new Web3(new Web3.providers.HttpProvider(providerUrl))

  return web3Instance
}

/**
 * Request account access (MetaMask)
 */
export const requestAccounts = async (): Promise<string[]> => {
  if (typeof window === 'undefined' || !(window as any).ethereum) {
    throw new Error('MetaMask not detected')
  }

  try {
    const accounts = await (window as any).ethereum.request({
      method: 'eth_requestAccounts',
    })
    return accounts
  } catch (error) {
    console.error('Error requesting accounts:', error)
    throw error
  }
}

/**
 * Get current connected account
 */
export const getCurrentAccount = async (): Promise<string | null> => {
  const web3 = getWeb3()
  const accounts = await web3.eth.getAccounts()
  return accounts[0] || null
}

/**
 * Get network ID
 */
export const getNetworkId = async (): Promise<number> => {
  const web3 = getWeb3()
  const networkId = await web3.eth.net.getId()
  return Number(networkId)
}

/**
 * Check if connected to the correct network
 */
export const isCorrectNetwork = async (): Promise<boolean> => {
  const networkId = await getNetworkId()
  const expectedNetworkId = Number(process.env.NEXT_PUBLIC_CHAIN_ID) || 11155111
  return networkId === expectedNetworkId
}

/**
 * Switch to the correct network (MetaMask)
 */
export const switchToCorrectNetwork = async (): Promise<void> => {
  if (typeof window === 'undefined' || !(window as any).ethereum) {
    throw new Error('MetaMask not detected')
  }

  const chainId = process.env.NEXT_PUBLIC_CHAIN_ID || '11155111'
  const chainIdHex = `0x${Number(chainId).toString(16)}`

  try {
    await (window as any).ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: chainIdHex }],
    })
  } catch (error: any) {
    // This error code indicates that the chain has not been added to MetaMask
    if (error.code === 4902) {
      await addNetwork()
    } else {
      throw error
    }
  }
}

/**
 * Add custom network to MetaMask
 */
export const addNetwork = async (): Promise<void> => {
  if (typeof window === 'undefined' || !(window as any).ethereum) {
    throw new Error('MetaMask not detected')
  }

  const chainId = process.env.NEXT_PUBLIC_CHAIN_ID || '11155111'
  const chainIdHex = `0x${Number(chainId).toString(16)}`
  const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc.sepolia.org'

  // Determine network config based on chainId
  const isSepoliaNetwork = chainId === '11155111'
  const networkConfig = isSepoliaNetwork
    ? {
        chainId: chainIdHex,
        chainName: 'Sepolia Testnet',
        nativeCurrency: {
          name: 'Sepolia Ether',
          symbol: 'SepoliaETH',
          decimals: 18,
        },
        rpcUrls: [rpcUrl],
        blockExplorerUrls: ['https://sepolia.etherscan.io'],
      }
    : {
        chainId: chainIdHex,
        chainName: 'Ganache Local',
        nativeCurrency: {
          name: 'Ether',
          symbol: 'ETH',
          decimals: 18,
        },
        rpcUrls: [rpcUrl],
      }

  try {
    await (window as any).ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [networkConfig],
    })
  } catch (error) {
    console.error('Error adding network:', error)
    throw error
  }
}

/**
 * Listen for account changes
 */
export const onAccountsChanged = (
  callback: (accounts: string[]) => void,
): void => {
  if (typeof window !== 'undefined' && (window as any).ethereum) {
    ;(window as any).ethereum.on('accountsChanged', callback)
  }
}

/**
 * Listen for network changes
 */
export const onChainChanged = (callback: (chainId: string) => void): void => {
  if (typeof window !== 'undefined' && (window as any).ethereum) {
    ;(window as any).ethereum.on('chainChanged', callback)
  }
}

/**
 * Format Ether amount
 */
export const formatEther = (weiAmount: string): string => {
  const web3 = getWeb3()
  return web3.utils.fromWei(weiAmount, 'ether')
}

/**
 * Parse Ether to Wei
 */
export const parseEther = (etherAmount: string): string => {
  const web3 = getWeb3()
  return web3.utils.toWei(etherAmount, 'ether')
}
