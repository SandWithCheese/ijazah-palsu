import { getWeb3 } from './client'
import type { Contract } from 'web3'

// Import contract ABIs (will be generated after compilation)
// These will be available after running `npm run compile` in contracts directory
let IjazahNFTArtifact: any = null
let deployments: any = null

// Lazy load contract artifacts
const loadArtifacts = async () => {
  if (typeof window === 'undefined') {
    // Server-side loading
    try {
      IjazahNFTArtifact = require('../../../public/contracts/IjazahNFT.json')
      deployments = require('../../../contracts/deployments.json')
    } catch (error) {
      console.warn(
        'Contract artifacts not found. Run contract compilation first.',
      )
    }
  } else {
    // Client-side loading
    try {
      const [nftResponse, deploymentsResponse] = await Promise.all([
        fetch('/contracts/IjazahNFT.json'),
        fetch('/contracts/deployments.json'),
      ])

      if (nftResponse.ok && deploymentsResponse.ok) {
        IjazahNFTArtifact = await nftResponse.json()
        deployments = await deploymentsResponse.json()
      }
    } catch (error) {
      console.warn('Failed to load contract artifacts:', error)
    }
  }
}

/**
 * Get IjazahNFT contract instance
 */
export const getIjazahNFTContract = async (
  networkId?: string,
): Promise<Contract<any> | null> => {
  await loadArtifacts()

  if (!IjazahNFTArtifact) {
    console.error('IjazahNFT artifact not loaded')
    return null
  }

  const web3 = getWeb3()

  // Get contract address from deployments
  const network = networkId || 'development'
  const contractAddress = deployments?.[network]?.IjazahNFT?.address

  if (!contractAddress) {
    console.error(`No deployment found for network: ${network}`)
    return null
  }

  return new web3.eth.Contract(IjazahNFTArtifact.abi, contractAddress)
}

/**
 * Mint a new certificate NFT
 */
export const mintCertificate = async (
  recipientAddress: string,
  certificateHash: string,
  tokenURI: string,
  fromAddress: string,
): Promise<any> => {
  const contract = await getIjazahNFTContract()

  if (!contract) {
    throw new Error('Contract not initialized')
  }

  try {
    const receipt = await contract.methods
      .mintCertificate(recipientAddress, certificateHash, tokenURI)
      .send({ from: fromAddress })

    return receipt
  } catch (error) {
    console.error('Error minting certificate:', error)
    throw error
  }
}

/**
 * Verify a certificate
 */
export const verifyCertificate = async (
  tokenId: number,
  certificateHash: string,
): Promise<boolean> => {
  const contract = await getIjazahNFTContract()

  if (!contract) {
    throw new Error('Contract not initialized')
  }

  try {
    const isValid = await contract.methods
      .verifyCertificate(tokenId, certificateHash)
      .call()

    return Boolean(isValid)
  } catch (error) {
    console.error('Error verifying certificate:', error)
    throw error
  }
}

/**
 * Get certificate details
 */
export const getCertificateDetails = async (
  tokenId: number,
): Promise<{
  owner: string
  issuer: string
  issueDate: number
  certificateHash: string
} | null> => {
  const contract = await getIjazahNFTContract()

  if (!contract) {
    throw new Error('Contract not initialized')
  }

  try {
    const details = (await contract.methods
      .getCertificateDetails(tokenId)
      .call()) as [string, string, bigint, string]

    return {
      owner: details[0],
      issuer: details[1],
      issueDate: Number(details[2]),
      certificateHash: details[3],
    }
  } catch (error) {
    console.error('Error getting certificate details:', error)
    throw error
  }
}

/**
 * Get token URI (metadata)
 */
export const getTokenURI = async (tokenId: number): Promise<string | null> => {
  const contract = await getIjazahNFTContract()

  if (!contract) {
    throw new Error('Contract not initialized')
  }

  try {
    const uri = await contract.methods.tokenURI(tokenId).call()
    return String(uri)
  } catch (error) {
    console.error('Error getting token URI:', error)
    throw error
  }
}

/**
 * Get all tokens owned by an address
 */
export const getOwnedTokens = async (
  ownerAddress: string,
): Promise<number[]> => {
  const contract = await getIjazahNFTContract()

  if (!contract) {
    throw new Error('Contract not initialized')
  }

  try {
    // This is a simple implementation
    // For production, consider using events or subgraph
    const balance = await contract.methods.balanceOf(ownerAddress).call()
    const tokens: number[] = []

    // Note: This is not efficient for large numbers of tokens
    // Consider implementing a better indexing solution
    for (let i = 0; i < Number(balance); i++) {
      const tokenId = await contract.methods
        .tokenOfOwnerByIndex(ownerAddress, i)
        .call()
      tokens.push(Number(tokenId))
    }

    return tokens
  } catch (error) {
    console.error('Error getting owned tokens:', error)
    return []
  }
}

/**
 * Create a hash for certificate data
 */
export const createCertificateHash = (certificateData: any): string => {
  const web3 = getWeb3()
  const dataString = JSON.stringify(certificateData)
  return web3.utils.keccak256(dataString)
}
