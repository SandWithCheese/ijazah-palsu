import { createFileRoute } from '@tanstack/react-router'
import * as fs from 'fs'
import * as path from 'path'

// Upload directory for encrypted files
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
          ensureUploadDir()

          const body = await request.json()
          const { data, filename } = body

          if (!data) {
            return Response.json({ error: 'No data provided' }, { status: 400 })
          }

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

          console.log(`File uploaded: ${cid}`)

          return Response.json({ cid, message: 'File uploaded successfully' })
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
