import { createFileRoute } from '@tanstack/react-router'
import * as fs from 'fs'
import * as path from 'path'

// Upload directory for encrypted files (fallback/local storage)
const UPLOAD_DIR = process.env.UPLOAD_DIR || './public/uploads'

// Ensure upload directory exists
function ensureUploadDir() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true })
  }
}

// Generate a unique CID for local storage
function generateLocalCID(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 10)
  return `local-${timestamp}-${random}`
}

export const Route = createFileRoute('/api/upload')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json()
          const { data, filename } = body

          if (!data) {
            return Response.json({ error: 'No data provided' }, { status: 400 })
          }

          // Try Filebase IPFS first
          try {
            const { isFilebaseConfigured, uploadToIPFS } =
              await import('../../lib/filebase')

            if (isFilebaseConfigured()) {
              console.log('Uploading to Filebase IPFS...')
              const cid = await uploadToIPFS(data, filename || 'diploma')
              console.log('Uploaded to IPFS with CID:', cid)

              return Response.json({
                cid,
                storage: 'ipfs',
                message: 'File uploaded to IPFS successfully',
              })
            }
          } catch (ipfsError: any) {
            console.warn(
              'Filebase upload failed, falling back to local:',
              ipfsError.message,
            )
          }

          // Fallback to local storage
          console.log('Using local storage (Filebase not configured)')
          ensureUploadDir()

          // Generate CID
          const cid = generateLocalCID()

          // Save encrypted file
          const filePath = path.join(UPLOAD_DIR, `${cid}.enc`)
          fs.writeFileSync(filePath, data, 'utf-8')

          // Save metadata
          const metadataPath = path.join(UPLOAD_DIR, `${cid}.meta.json`)
          const metadata = {
            filename: filename || 'unknown',
            size: data.length,
            uploadedAt: new Date().toISOString(),
            cid,
          }
          fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2))

          console.log(`File uploaded locally: ${cid}`)

          return Response.json({
            cid,
            storage: 'local',
            message: 'File uploaded successfully',
          })
        } catch (error: any) {
          console.error('Upload error:', error)
          return Response.json(
            { error: error.message || 'Upload failed' },
            { status: 500 },
          )
        }
      },
    },
  },
})
