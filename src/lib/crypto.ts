/**
 * Cryptography utilities for Digital Diploma System
 *
 * Features:
 * - AES-256-CBC encryption/decryption
 * - SHA-256 file hashing
 * - URL fragment encoding/decoding for secure parameter passing
 */

/**
 * Generate a random AES-256 key
 * @returns Base64-encoded key
 */
export async function generateAESKey(): Promise<string> {
  const key = await crypto.subtle.generateKey(
    { name: 'AES-CBC', length: 256 },
    true,
    ['encrypt', 'decrypt'],
  )
  const exported = await crypto.subtle.exportKey('raw', key)
  return arrayBufferToBase64(exported)
}

/**
 * Generate a random initialization vector
 * @returns Base64-encoded IV
 */
export function generateIV(): string {
  const iv = crypto.getRandomValues(new Uint8Array(16))
  return arrayBufferToBase64(iv.buffer)
}

/**
 * Encrypt a file using AES-256-CBC
 * @param file File to encrypt
 * @param keyBase64 Base64-encoded AES key
 * @param ivBase64 Base64-encoded IV
 * @returns Encrypted data as ArrayBuffer
 */
export async function encryptFile(
  file: File,
  keyBase64: string,
  ivBase64: string,
): Promise<ArrayBuffer> {
  const fileBuffer = await file.arrayBuffer()
  const key = await importAESKey(keyBase64)
  const iv = base64ToArrayBuffer(ivBase64)

  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-CBC', iv: new Uint8Array(iv) },
    key,
    fileBuffer,
  )

  return encrypted
}

/**
 * Encrypt raw data using AES-256-CBC
 * @param data Data to encrypt as ArrayBuffer
 * @param keyBase64 Base64-encoded AES key
 * @param ivBase64 Base64-encoded IV
 * @returns Encrypted data as ArrayBuffer
 */
export async function encryptData(
  data: ArrayBuffer,
  keyBase64: string,
  ivBase64: string,
): Promise<ArrayBuffer> {
  const key = await importAESKey(keyBase64)
  const iv = base64ToArrayBuffer(ivBase64)

  return crypto.subtle.encrypt(
    { name: 'AES-CBC', iv: new Uint8Array(iv) },
    key,
    data,
  )
}

/**
 * Decrypt data using AES-256-CBC
 * @param encryptedData Encrypted data as ArrayBuffer
 * @param keyBase64 Base64-encoded AES key
 * @param ivBase64 Base64-encoded IV
 * @returns Decrypted data as ArrayBuffer
 */
export async function decryptData(
  encryptedData: ArrayBuffer,
  keyBase64: string,
  ivBase64: string,
): Promise<ArrayBuffer> {
  const key = await importAESKey(keyBase64)
  const iv = base64ToArrayBuffer(ivBase64)

  return crypto.subtle.decrypt(
    { name: 'AES-CBC', iv: new Uint8Array(iv) },
    key,
    encryptedData,
  )
}

/**
 * Calculate SHA-256 hash of a file
 * @param file File to hash
 * @returns Hex-encoded hash string (with 0x prefix)
 */
export async function hashFile(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  return hashArrayBuffer(buffer)
}

/**
 * Calculate SHA-256 hash of an ArrayBuffer
 * @param buffer Data to hash
 * @returns Hex-encoded hash string (with 0x prefix)
 */
export async function hashArrayBuffer(buffer: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
  return '0x' + hashHex
}

/**
 * Encode verification parameters into URL fragment
 * Fragment format: #diplomaId=X&key=Y&iv=Z&cid=W
 * Note: Using fragment (#) ensures params are not sent to server
 */
export function encodeVerificationURL(
  baseUrl: string,
  diplomaId: string | number,
  aesKey: string,
  iv: string,
  cid: string,
): string {
  const params = new URLSearchParams({
    diplomaId: String(diplomaId),
    key: aesKey,
    iv: iv,
    cid: cid,
  })
  return `${baseUrl}#${params.toString()}`
}

/**
 * Decode verification parameters from URL fragment
 */
export function decodeVerificationURL(fragment: string): {
  diplomaId: string
  key: string
  iv: string
  cid: string
} | null {
  try {
    // Remove leading # if present
    const cleanFragment = fragment.startsWith('#')
      ? fragment.slice(1)
      : fragment
    const params = new URLSearchParams(cleanFragment)

    const diplomaId = params.get('diplomaId')
    const key = params.get('key')
    const iv = params.get('iv')
    const cid = params.get('cid')

    if (!diplomaId || !key || !iv || !cid) {
      return null
    }

    return { diplomaId, key, iv, cid }
  } catch {
    return null
  }
}

// ============ Helper Functions ============

/**
 * Convert ArrayBuffer to Base64 string
 */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

/**
 * Convert Base64 string to ArrayBuffer
 */
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}

/**
 * Import AES key from Base64 string
 */
async function importAESKey(keyBase64: string): Promise<CryptoKey> {
  const keyBuffer = base64ToArrayBuffer(keyBase64)
  return crypto.subtle.importKey('raw', keyBuffer, { name: 'AES-CBC' }, false, [
    'encrypt',
    'decrypt',
  ])
}

/**
 * Convert file to Blob for download
 */
export function arrayBufferToBlob(buffer: ArrayBuffer, mimeType: string): Blob {
  return new Blob([buffer], { type: mimeType })
}

/**
 * Create download link for decrypted file
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
