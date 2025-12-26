import { getWeb3 } from './client'
import type { Contract } from 'web3'

// Import contract ABIs (will be generated after compilation)
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
 * Get contract address
 */
export const getContractAddress = async (
  networkId?: string,
): Promise<string | null> => {
  await loadArtifacts()
  const network = networkId || 'development'
  return deployments?.[network]?.IjazahNFT?.address || null
}

// ============ Diploma Operations ============

/**
 * Issue a new diploma (matches new contract interface)
 */
export const issueDiploma = async (
  recipientAddress: string,
  documentHash: string,
  cid: string,
  signature: string,
  fromAddress: string,
): Promise<any> => {
  const contract = await getIjazahNFTContract()

  if (!contract) {
    throw new Error('Contract not initialized')
  }

  try {
    const receipt = await contract.methods
      .issueDiploma(recipientAddress, documentHash, cid, signature)
      .send({ from: fromAddress })

    return receipt
  } catch (error) {
    console.error('Error issuing diploma:', error)
    throw error
  }
}

/**
 * Revoke a diploma
 */
export const revokeDiploma = async (
  diplomaId: number,
  reason: string,
  fromAddress: string,
): Promise<any> => {
  const contract = await getIjazahNFTContract()

  if (!contract) {
    throw new Error('Contract not initialized')
  }

  try {
    const receipt = await contract.methods
      .revokeDiploma(diplomaId, reason)
      .send({ from: fromAddress })

    return receipt
  } catch (error) {
    console.error('Error revoking diploma:', error)
    throw error
  }
}

/**
 * Verify a diploma - returns (isValid, isActive)
 */
export const verifyDiploma = async (
  diplomaId: number,
): Promise<{ isValid: boolean; isActive: boolean }> => {
  const contract = await getIjazahNFTContract()

  if (!contract) {
    throw new Error('Contract not initialized')
  }

  try {
    const result = (await contract.methods.verifyDiploma(diplomaId).call()) as [
      boolean,
      boolean,
    ]

    return {
      isValid: Boolean(result[0]),
      isActive: Boolean(result[1]),
    }
  } catch (error) {
    console.error('Error verifying diploma:', error)
    throw error
  }
}

/**
 * Verify diploma hash matches stored hash
 */
export const verifyHash = async (
  diplomaId: number,
  documentHash: string,
): Promise<boolean> => {
  const contract = await getIjazahNFTContract()

  if (!contract) {
    throw new Error('Contract not initialized')
  }

  try {
    const isMatch = await contract.methods
      .verifyHash(diplomaId, documentHash)
      .call()

    return Boolean(isMatch)
  } catch (error) {
    console.error('Error verifying hash:', error)
    throw error
  }
}

/**
 * Get complete diploma details
 */
export const getDiplomaDetails = async (
  diplomaId: number,
): Promise<{
  owner: string
  documentHash: string
  cid: string
  issuer: string
  signature: string
  timestamp: number
  isActive: boolean
} | null> => {
  const contract = await getIjazahNFTContract()

  if (!contract) {
    throw new Error('Contract not initialized')
  }

  try {
    const result = (await contract.methods
      .getDiplomaDetails(diplomaId)
      .call()) as [string, any]

    const owner = result[0]
    const diploma = result[1]

    return {
      owner,
      documentHash: diploma.documentHash,
      cid: diploma.cid,
      issuer: diploma.issuer,
      signature: diploma.signature,
      timestamp: Number(diploma.timestamp),
      isActive: Boolean(diploma.isActive),
    }
  } catch (error) {
    console.error('Error getting diploma details:', error)
    throw error
  }
}

/**
 * Get token URI (CID)
 */
export const getTokenURI = async (
  diplomaId: number,
): Promise<string | null> => {
  const contract = await getIjazahNFTContract()

  if (!contract) {
    throw new Error('Contract not initialized')
  }

  try {
    const uri = await contract.methods.tokenURI(diplomaId).call()
    return String(uri)
  } catch (error) {
    console.error('Error getting token URI:', error)
    throw error
  }
}

/**
 * Get total number of diplomas issued
 */
export const getTotalDiplomas = async (): Promise<number> => {
  const contract = await getIjazahNFTContract()

  if (!contract) {
    throw new Error('Contract not initialized')
  }

  try {
    const total = await contract.methods.getTotalDiplomas().call()
    return Number(total)
  } catch (error) {
    console.error('Error getting total diplomas:', error)
    throw error
  }
}

/**
 * Check if address is an authorized issuer
 */
export const isIssuer = async (address: string): Promise<boolean> => {
  const contract = await getIjazahNFTContract()

  if (!contract) {
    throw new Error('Contract not initialized')
  }

  try {
    const result = await contract.methods.isIssuer(address).call()
    return Boolean(result)
  } catch (error) {
    console.error('Error checking issuer status:', error)
    throw error
  }
}

/**
 * Get revocation reason for a diploma
 */
export const getRevocationReason = async (
  diplomaId: number,
): Promise<string> => {
  const contract = await getIjazahNFTContract()

  if (!contract) {
    throw new Error('Contract not initialized')
  }

  try {
    const reason = await contract.methods.revocationReasons(diplomaId).call()
    return String(reason)
  } catch (error) {
    console.error('Error getting revocation reason:', error)
    throw error
  }
}

// ============ Utility Functions ============

/**
 * Create a hash for document data using Web3
 */
export const createDocumentHash = (data: string): string => {
  const web3 = getWeb3()
  return web3.utils.keccak256(data)
}

/**
 * Sign message with wallet
 */
export const signMessage = async (
  message: string,
  fromAddress: string,
): Promise<string> => {
  const web3 = getWeb3()

  try {
    const signature = await web3.eth.personal.sign(message, fromAddress, '')
    return signature
  } catch (error) {
    console.error('Error signing message:', error)
    throw error
  }
}
