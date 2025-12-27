/**
 * Authentication Library for Digital Diploma System
 *
 * Implements nonce challenge authentication as required by PRD F-01:
 * 1. Generate random nonce
 * 2. Admin signs nonce with wallet
 * 3. Verify signature matches expected address
 * 4. Check if address has ISSUER_ROLE
 */

import { getWeb3 } from './web3/client'

// Session storage key
const AUTH_SESSION_KEY = 'diploma_auth_session'
const NONCE_KEY = 'diploma_auth_nonce'

interface AuthSession {
  address: string
  isIssuer: boolean
  authenticatedAt: number
  expiresAt: number
}

/**
 * Generate a cryptographically secure random nonce
 */
export function generateNonce(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  const nonce = Array.from(array, (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('')
  const timestamp = Date.now()
  return `Sign this message to authenticate with Digital Diploma System.\n\nNonce: ${nonce}\nTimestamp: ${timestamp}`
}

/**
 * Store nonce in session storage for verification
 */
export function storeNonce(nonce: string): void {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(NONCE_KEY, nonce)
  }
}

/**
 * Get stored nonce
 */
export function getStoredNonce(): string | null {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem(NONCE_KEY)
  }
  return null
}

/**
 * Clear stored nonce
 */
export function clearNonce(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(NONCE_KEY)
  }
}

/**
 * Sign nonce with wallet using personal_sign
 */
export async function signNonce(
  nonce: string,
  address: string,
): Promise<string> {
  const web3 = getWeb3()

  try {
    const signature = await web3.eth.personal.sign(nonce, address, '')
    return signature
  } catch (error) {
    console.error('Error signing nonce:', error)
    throw error
  }
}

/**
 * Verify that the signature matches the expected address
 */
export async function verifySignature(
  nonce: string,
  signature: string,
  expectedAddress: string,
): Promise<boolean> {
  const web3 = getWeb3()

  try {
    // Recover the address from the signature
    const recoveredAddress = await web3.eth.personal.ecRecover(nonce, signature)

    // Compare addresses (case-insensitive)
    return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase()
  } catch (error) {
    console.error('Error verifying signature:', error)
    return false
  }
}

/**
 * Create authenticated session
 */
export function createAuthSession(address: string, isIssuer: boolean): void {
  if (typeof window === 'undefined') return

  const session: AuthSession = {
    address: address.toLowerCase(),
    isIssuer,
    authenticatedAt: Date.now(),
    expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  }

  sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session))
}

/**
 * Get current auth session
 */
export function getAuthSession(): AuthSession | null {
  if (typeof window === 'undefined') return null

  const sessionData = sessionStorage.getItem(AUTH_SESSION_KEY)
  if (!sessionData) return null

  try {
    const session: AuthSession = JSON.parse(sessionData)

    // Check if session has expired
    if (Date.now() > session.expiresAt) {
      clearAuthSession()
      return null
    }

    return session
  } catch {
    return null
  }
}

/**
 * Check if current session is valid for the given address
 */
export function isSessionValid(address: string): boolean {
  const session = getAuthSession()
  if (!session) return false

  return session.address.toLowerCase() === address.toLowerCase()
}

/**
 * Clear auth session
 */
export function clearAuthSession(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(AUTH_SESSION_KEY)
    sessionStorage.removeItem(NONCE_KEY)
  }
}

/**
 * Full authentication flow
 * 1. Generate nonce
 * 2. Sign with wallet
 * 3. Verify signature
 * 4. Create session
 */
export async function authenticateWithWallet(
  address: string,
  checkIssuer: () => Promise<boolean>,
): Promise<{ success: boolean; error?: string }> {
  try {
    // Step 1: Generate nonce
    const nonce = generateNonce()
    storeNonce(nonce)

    // Step 2: Sign nonce with wallet
    const signature = await signNonce(nonce, address)

    // Step 3: Verify signature
    const isValid = await verifySignature(nonce, signature, address)
    if (!isValid) {
      return { success: false, error: 'Invalid signature' }
    }

    // Step 4: Check issuer status
    const isIssuer = await checkIssuer()

    // Step 5: Create session
    createAuthSession(address, isIssuer)
    clearNonce()

    return { success: true }
  } catch (error: any) {
    // User rejected the signature request
    if (error.code === 4001) {
      return { success: false, error: 'Authentication cancelled' }
    }
    return { success: false, error: error.message || 'Authentication failed' }
  }
}
