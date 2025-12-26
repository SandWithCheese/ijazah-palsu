/**
 * File Storage Service for Digital Diploma System
 *
 * Handles encrypted file upload and download.
 * Supports local storage (dev) and can be extended for IPFS (production).
 */

import { arrayBufferToBase64, base64ToArrayBuffer } from './crypto'

/**
 * Upload encrypted file to storage
 * @param encryptedData Encrypted file data
 * @param filename Original filename (for reference)
 * @returns CID/URL for the stored file
 */
export async function uploadEncryptedFile(
  encryptedData: ArrayBuffer,
  filename: string,
): Promise<string> {
  const base64Data = arrayBufferToBase64(encryptedData)

  const response = await fetch('/api/upload', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      data: base64Data,
      filename: filename,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to upload file')
  }

  const result = await response.json()
  return result.cid
}

/**
 * Download encrypted file from storage
 * @param cid CID/URL of the stored file
 * @returns Encrypted file data as ArrayBuffer
 */
export async function downloadEncryptedFile(cid: string): Promise<ArrayBuffer> {
  const response = await fetch(`/api/files/${cid}`)

  if (!response.ok) {
    throw new Error('Failed to download file')
  }

  const result = await response.json()
  return base64ToArrayBuffer(result.data)
}

/**
 * Get file metadata from storage
 * @param cid CID of the file
 */
export async function getFileMetadata(cid: string): Promise<{
  filename: string
  size: number
  uploadedAt: string
} | null> {
  try {
    const response = await fetch(`/api/files/${cid}/metadata`)
    if (!response.ok) return null
    return response.json()
  } catch {
    return null
  }
}

/**
 * Check if file exists in storage
 */
export async function fileExists(cid: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/files/${cid}/metadata`, {
      method: 'HEAD',
    })
    return response.ok
  } catch {
    return false
  }
}

/**
 * Generate a unique CID for local storage
 * Uses timestamp + random string
 */
export function generateLocalCID(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 10)
  return `local-${timestamp}-${random}`
}
