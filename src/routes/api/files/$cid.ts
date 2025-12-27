import { createFileRoute } from '@tanstack/react-router'
import * as fs from 'fs'
import * as path from 'path'

const UPLOAD_DIR = process.env.UPLOAD_DIR || './public/uploads'

export const Route = createFileRoute('/api/files/$cid')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        try {
          const { cid } = params

          if (!cid) {
            return Response.json({ error: 'CID is required' }, { status: 400 })
          }

          // Check if it's an IPFS CID (starts with Qm or bafy)
          if (
            cid.startsWith('Qm') ||
            cid.startsWith('bafy') ||
            cid.startsWith('diplomas/')
          ) {
            try {
              const { downloadFromIPFS, isFilebaseConfigured } =
                await import('../../../lib/filebase')

              if (isFilebaseConfigured()) {
                console.log('Downloading from IPFS:', cid)
                const data = await downloadFromIPFS(cid)

                return Response.json({
                  data,
                  storage: 'ipfs',
                  metadata: { cid },
                })
              }
            } catch (ipfsError: any) {
              console.warn('IPFS download failed:', ipfsError.message)
              // Fall through to local storage check
            }
          }

          // Try local storage for local-* CIDs or as fallback
          const filePath = path.join(UPLOAD_DIR, `${cid}.enc`)

          if (!fs.existsSync(filePath)) {
            return Response.json({ error: 'File not found' }, { status: 404 })
          }

          // Read encrypted file data (Base64 encoded)
          const data = fs.readFileSync(filePath, 'utf-8')

          // Read metadata if available
          const metadataPath = path.join(UPLOAD_DIR, `${cid}.meta.json`)
          let metadata = null
          if (fs.existsSync(metadataPath)) {
            metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'))
          }

          return Response.json({
            data,
            storage: 'local',
            metadata,
          })
        } catch (error: any) {
          console.error('Download error:', error)
          return Response.json(
            { error: error.message || 'Download failed' },
            { status: 500 },
          )
        }
      },
    },
  },
})
