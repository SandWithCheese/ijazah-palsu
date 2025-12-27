/**
 * Filebase IPFS Storage Service
 *
 * Uses AWS S3 SDK to interact with Filebase's S3-compatible API.
 * Filebase automatically pins files to IPFS and returns a CID.
 *
 * Required environment variables:
 * - FILEBASE_ACCESS_KEY: Your Filebase access key
 * - FILEBASE_SECRET_KEY: Your Filebase secret key
 * - FILEBASE_BUCKET: Your IPFS-enabled bucket name
 * - FILEBASE_GATEWAY: Gateway URL for downloads (e.g., https://ipfs.filebase.io/ipfs)
 */

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3'

// Filebase S3 endpoint
const FILEBASE_ENDPOINT = 'https://s3.filebase.com'

// Initialize S3 client for Filebase
function getS3Client(): S3Client {
  const accessKey = process.env.FILEBASE_ACCESS_KEY
  const secretKey = process.env.FILEBASE_SECRET_KEY

  if (!accessKey || !secretKey) {
    throw new Error(
      'Filebase credentials not configured. Set FILEBASE_ACCESS_KEY and FILEBASE_SECRET_KEY.',
    )
  }

  return new S3Client({
    endpoint: FILEBASE_ENDPOINT,
    region: 'us-east-1', // Filebase uses us-east-1
    credentials: {
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
    },
    forcePathStyle: true, // Required for S3-compatible services
  })
}

/**
 * Check if Filebase is configured
 */
export function isFilebaseConfigured(): boolean {
  return !!(
    process.env.FILEBASE_ACCESS_KEY &&
    process.env.FILEBASE_SECRET_KEY &&
    process.env.FILEBASE_BUCKET
  )
}

/**
 * Upload encrypted data to Filebase IPFS
 * @param data Base64 encoded encrypted data
 * @param filename Original filename for metadata
 * @returns IPFS CID
 */
export async function uploadToIPFS(
  data: string,
  filename: string,
): Promise<string> {
  const bucket = process.env.FILEBASE_BUCKET

  if (!bucket) {
    throw new Error('FILEBASE_BUCKET not configured')
  }

  const client = getS3Client()

  // Generate unique key for the file
  const timestamp = Date.now()
  const key = `diplomas/${timestamp}-${filename}.enc`

  // Convert base64 to buffer for upload
  const buffer = Buffer.from(data, 'utf-8')

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: 'application/octet-stream',
    Metadata: {
      filename: filename,
      uploadedAt: new Date().toISOString(),
      encrypted: 'true',
    },
  })

  const response = await client.send(command)

  // Filebase returns the CID in the x-amz-meta-cid header
  // We need to fetch it with HeadObject
  const headCommand = new HeadObjectCommand({
    Bucket: bucket,
    Key: key,
  })

  const headResponse = await client.send(headCommand)

  // Get CID from response metadata
  const cid = headResponse.Metadata?.cid

  if (!cid) {
    // If CID not in metadata, use the ETag or generate reference
    console.warn('CID not found in response, using key as reference')
    return key
  }

  console.log(`Uploaded to IPFS: ${cid}`)
  return cid
}

/**
 * Download encrypted data from Filebase IPFS
 * @param cid IPFS CID or file key
 * @returns Base64 encoded encrypted data
 */
export async function downloadFromIPFS(cid: string): Promise<string> {
  // Try gateway first for IPFS CIDs
  const gateway =
    process.env.FILEBASE_GATEWAY || 'https://ipfs.filebase.io/ipfs'

  // Check if it's an IPFS CID (starts with Qm or bafy)
  if (cid.startsWith('Qm') || cid.startsWith('bafy')) {
    try {
      const response = await fetch(`${gateway}/${cid}`)
      if (response.ok) {
        const text = await response.text()
        return text
      }
    } catch (error) {
      console.warn('Gateway fetch failed, trying S3 API:', error)
    }
  }

  // Fallback to S3 API for non-CID keys
  const bucket = process.env.FILEBASE_BUCKET
  if (!bucket) {
    throw new Error('FILEBASE_BUCKET not configured')
  }

  const client = getS3Client()

  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: cid,
  })

  const response = await client.send(command)

  if (!response.Body) {
    throw new Error('Empty response from Filebase')
  }

  // Convert stream to string
  const chunks: Uint8Array[] = []
  const reader = response.Body.transformToWebStream().getReader()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
  }

  const buffer = Buffer.concat(chunks)
  return buffer.toString('utf-8')
}

/**
 * Get public IPFS gateway URL for a CID
 * @param cid IPFS CID
 * @returns Public gateway URL
 */
export function getIPFSUrl(cid: string): string {
  const gateway =
    process.env.FILEBASE_GATEWAY || 'https://ipfs.filebase.io/ipfs'

  // If it's already a full URL, return as is
  if (cid.startsWith('http')) {
    return cid
  }

  // If it's an IPFS CID, construct gateway URL
  if (cid.startsWith('Qm') || cid.startsWith('bafy')) {
    return `${gateway}/${cid}`
  }

  // For non-CID keys (fallback), return the key
  return cid
}
