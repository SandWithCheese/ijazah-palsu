import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useCallback } from 'react'
import {
  Search,
  ShieldCheck,
  Download,
  Share2,
  CheckCircle2,
  Calendar,
  Hash,
  UserCircle,
  ChevronLeft,
  XCircle,
  AlertTriangle,
  Loader2,
  Lock,
  FileText,
  Check,
  Copy,
  Twitter,
  Linkedin,
  Link as LinkIcon,
} from 'lucide-react'
import PublicNav from '../components/PublicNav'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu'

interface VerifySearch {
  id?: string
}

export const Route = createFileRoute('/verify')({
  component: VerifyCredentialPage,
  validateSearch: (search: Record<string, unknown>): VerifySearch => {
    return {
      id: typeof search.id === 'string' ? search.id : undefined,
    }
  },
})

type VerificationStatus = 'valid' | 'revoked' | 'invalid' | null

interface VerificationResult {
  diplomaId: string
  status: VerificationStatus
  owner: string
  issuer: string
  timestamp: number
  documentHash: string
  cid: string
  isActive: boolean
  hashMatch: boolean
  decryptedFile?: Blob
  revocationReason?: string
}

function VerifyCredentialPage() {
  const { id: searchId } = Route.useSearch()
  const [manualId, setManualId] = useState(searchId || '')
  const [isVerifying, setIsVerifying] = useState(false)
  const [result, setResult] = useState<VerificationResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [hasUrlParams, setHasUrlParams] = useState(false)

  // Parse URL fragment on mount
  useEffect(() => {
    const hash = window.location.hash
    if (hash) {
      handleVerifyFromUrl(hash)
    }
  }, [])

  // Auto-verify if ID is passed from search params
  useEffect(() => {
    if (searchId && !window.location.hash) {
      setManualId(searchId)
      // Small delay to ensure state is updated
      setTimeout(() => {
        handleManualVerifyWithId(searchId)
      }, 100)
    }
  }, [searchId])

  const handleVerifyFromUrl = async (hash: string) => {
    setIsVerifying(true)
    setError(null)
    setHasUrlParams(true)

    try {
      const {
        decodeVerificationURL,
        decryptData,
        hashArrayBuffer,
        arrayBufferToBlob,
      } = await import('../lib/crypto')

      const params = decodeVerificationURL(hash)
      if (!params) {
        throw new Error('Invalid verification URL')
      }

      const { diplomaId, key, iv, cid } = params

      // Step 1: Verify diploma on blockchain
      const {
        verifyDiploma,
        getDiplomaDetails,
        verifyHash,
        getRevocationReason,
      } = await import('../lib/web3/contracts')

      const id = parseInt(diplomaId, 10)
      const verification = await verifyDiploma(id)

      if (!verification.isValid) {
        throw new Error('Diploma not found on blockchain')
      }

      const details = await getDiplomaDetails(id)
      if (!details) {
        throw new Error('Failed to get diploma details')
      }

      // Step 2: Download encrypted file
      const { downloadEncryptedFile } = await import('../lib/storage')
      const encryptedData = await downloadEncryptedFile(cid)

      // Step 3: Decrypt the file
      const decryptedData = await decryptData(encryptedData, key, iv)

      // Step 4: Verify hash
      const computedHash = await hashArrayBuffer(decryptedData)
      const hashMatch = await verifyHash(id, computedHash)

      // Get revocation reason if revoked
      let revocationReason = ''
      if (!verification.isActive) {
        revocationReason = await getRevocationReason(id)
      }

      // Step 5: Add verification URL and QR code to PDF (as per specification)
      const { addVerificationUrlToPDF } = await import('../lib/pdf-utils')
      const verificationUrl = window.location.href // Full URL with hash
      let finalData = decryptedData

      try {
        // Try to add QR code to PDF
        finalData = await addVerificationUrlToPDF(
          decryptedData,
          verificationUrl,
          diplomaId,
        )
        console.log('✅ Successfully added verification URL and QR code to diploma')
      } catch (pdfError) {
        console.warn(
          'Could not modify PDF (may not be a PDF file), using original:',
          pdfError,
        )
        // If it's not a PDF or modification fails, use original decrypted data
        finalData = decryptedData
      }

      // Create blob for download with modified PDF
      const decryptedBlob = arrayBufferToBlob(finalData, 'application/pdf')

      setResult({
        diplomaId,
        status: verification.isActive
          ? hashMatch
            ? 'valid'
            : 'invalid'
          : 'revoked',
        owner: details.owner,
        issuer: details.issuer,
        timestamp: details.timestamp,
        documentHash: details.documentHash,
        cid: details.cid,
        isActive: verification.isActive,
        hashMatch,
        decryptedFile: decryptedBlob,
        revocationReason,
      })
    } catch (err: any) {
      console.error('Verification error:', err)
      setError(err.message || 'Verification failed')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleManualVerifyWithId = useCallback(async (idToVerify: string) => {
    if (!idToVerify) return

    setIsVerifying(true)
    setError(null)
    setHasUrlParams(false)

    try {
      const { verifyDiploma, getDiplomaDetails, getRevocationReason } =
        await import('../lib/web3/contracts')

      const id = parseInt(idToVerify, 10)
      if (isNaN(id)) {
        throw new Error('Invalid diploma ID')
      }

      const verification = await verifyDiploma(id)

      if (!verification.isValid) {
        throw new Error('Diploma not found on blockchain')
      }

      const details = await getDiplomaDetails(id)
      if (!details) {
        throw new Error('Failed to get diploma details')
      }

      let revocationReason = ''
      if (!verification.isActive) {
        revocationReason = await getRevocationReason(id)
      }

      setResult({
        diplomaId: idToVerify,
        status: verification.isActive ? 'valid' : 'revoked',
        owner: details.owner,
        issuer: details.issuer,
        timestamp: details.timestamp,
        documentHash: details.documentHash,
        cid: details.cid,
        isActive: verification.isActive,
        hashMatch: true, // Cannot verify without encryption keys
        revocationReason,
      })
    } catch (err: any) {
      console.error('Verification error:', err)
      setError(err.message || 'Verification failed')
    } finally {
      setIsVerifying(false)
    }
  }, [])

  const handleManualVerify = async () => {
    handleManualVerifyWithId(manualId)
  }

  // Share functionality
  const [copied, setCopied] = useState(false)

  const getShareUrl = () => {
    return `${window.location.origin}/verify?id=${result?.diplomaId}`
  }

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(getShareUrl())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShareTwitter = () => {
    const text = `I verified diploma #${result?.diplomaId} on Serti-Chain blockchain! 🎓✅`
    const url = getShareUrl()
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      '_blank',
    )
  }

  const handleShareLinkedIn = () => {
    const url = getShareUrl()
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      '_blank',
    )
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Diploma Verification #${result?.diplomaId}`,
          text: `Verified diploma on Serti-Chain blockchain`,
          url: getShareUrl(),
        })
      } catch (err) {
        // User cancelled or error
        console.log('Share cancelled')
      }
    } else {
      handleCopyLink()
    }
  }

  const handleDownload = () => {
    if (!result?.decryptedFile) return

    const url = URL.createObjectURL(result.decryptedFile)
    const a = document.createElement('a')
    a.href = url
    a.download = `diploma-${result.diplomaId}.pdf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const truncateAddress = (address: string) => {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const getStatusConfig = (status: VerificationStatus) => {
    switch (status) {
      case 'valid':
        return {
          icon: CheckCircle2,
          title: 'Verified Valid',
          subtitle: 'This diploma is authentic',
          bgClass: 'bg-green-500/10 border-green-500/20',
          iconBgClass: 'bg-green-500',
          textClass: 'text-green-400',
        }
      case 'revoked':
        return {
          icon: AlertTriangle,
          title: 'Revoked',
          subtitle: 'This diploma has been revoked',
          bgClass: 'bg-yellow-500/10 border-yellow-500/20',
          iconBgClass: 'bg-yellow-500',
          textClass: 'text-yellow-400',
        }
      case 'invalid':
        return {
          icon: XCircle,
          title: 'Invalid',
          subtitle: 'Document hash does not match',
          bgClass: 'bg-red-500/10 border-red-500/20',
          iconBgClass: 'bg-red-500',
          textClass: 'text-red-400',
        }
      default:
        return null
    }
  }

  return (
    <div className="relative flex flex-col min-h-screen w-full bg-background-dark text-white font-display overflow-x-hidden antialiased">
      {/* Navigation */}
      <PublicNav />

      {/* Background Glows */}
      <div className="fixed top-[-10%] right-[-10%] w-[40%] h-[40%] bg-sc-accent-blue/10 blur-[120px] rounded-full pointer-events-none z-0"></div>

      <main className="relative z-10 grow py-12 lg:py-20">
        <div className="max-w-[800px] mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
              Public <span className="gold-gradient-text">Verification</span>
            </h1>
            <p className="text-[#929bc9] text-lg font-medium max-w-xl mx-auto">
              Verify the authenticity of digital diplomas using blockchain
              verification.
            </p>
          </div>

          {/* Loading State */}
          {isVerifying && (
            <div className="glass-panel p-8 rounded-2xl border border-white/10 shadow-2xl">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-12 h-12 text-sc-accent-blue animate-spin" />
                <p className="text-white font-bold">Verifying diploma...</p>
                <p className="text-[#929bc9] text-sm">
                  {hasUrlParams
                    ? 'Decrypting and verifying document...'
                    : 'Checking blockchain...'}
                </p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !isVerifying && (
            <div className="glass-panel p-8 rounded-2xl border border-red-500/20 bg-red-500/5 mb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-500/20 rounded-lg">
                  <XCircle className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Verification Failed
                  </h3>
                  <p className="text-red-400">{error}</p>
                </div>
              </div>
              <button
                className="mt-4 text-[#929bc9] hover:text-white text-sm font-bold flex items-center gap-2"
                onClick={() => {
                  setError(null)
                  setResult(null)
                }}
              >
                <ChevronLeft className="w-4 h-4" />
                Try Again
              </button>
            </div>
          )}

          {!result && !isVerifying && !error && (
            /* Search Card */
            <div className="glass-panel p-8 md:p-10 rounded-2xl border border-white/10 shadow-2xl">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-[#929bc9] uppercase tracking-widest ml-1">
                    Enter Diploma ID
                  </label>
                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5a648b] group-focus-within:text-sc-accent-blue transition-colors" />
                    <input
                      type="text"
                      className="sc-input sc-input-icon h-14"
                      placeholder="e.g., 0, 1, 2..."
                      value={manualId}
                      onChange={(e) => setManualId(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  className="w-full h-14 bg-sc-accent-blue hover:bg-blue-700 text-white font-black rounded-xl shadow-lg shadow-blue-900/40 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
                  onClick={handleManualVerify}
                  disabled={isVerifying || !manualId}
                >
                  <ShieldCheck className="w-5 h-5" />
                  <span>Verify Authenticity</span>
                </button>

                <div className="pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2 justify-center text-[#5a648b] text-xs">
                    <Lock className="w-3 h-3" />
                    <span>
                      For full verification with document download, use the
                      verification URL
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {result && !isVerifying && (
            /* Result Display */
            <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Main Result Card */}
              {(() => {
                const config = getStatusConfig(result.status)
                if (!config) return null
                const StatusIcon = config.icon

                return (
                  <div
                    className={`glass-panel rounded-2xl border ${config.bgClass} shadow-2xl overflow-hidden`}
                  >
                    <div
                      className={`${config.bgClass} p-6 flex items-center justify-between border-b`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 ${config.iconBgClass} rounded-lg shadow-lg`}
                        >
                          <StatusIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-black text-white">
                            {config.title}
                          </h3>
                          <p
                            className={`${config.textClass} text-xs font-bold uppercase tracking-widest`}
                          >
                            {config.subtitle}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-2 bg-white/5 rounded-lg text-[#929bc9] hover:text-white transition-colors">
                              <Share2 className="w-4 h-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-48 bg-[#1c2136] border-[#323b67]"
                          >
                            <DropdownMenuLabel className="text-[#929bc9]">
                              Share Verification
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-[#323b67]" />
                            <DropdownMenuItem
                              className="text-white hover:bg-[#232948] focus:bg-[#232948] focus:text-white cursor-pointer"
                              onClick={handleCopyLink}
                            >
                              {copied ? (
                                <>
                                  <Check className="w-4 h-4 mr-2 text-green-400" />
                                  <span className="text-green-400">
                                    Copied!
                                  </span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-4 h-4 mr-2" />
                                  Copy Link
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-white hover:bg-[#232948] focus:bg-[#232948] focus:text-white cursor-pointer"
                              onClick={handleShareTwitter}
                            >
                              <Twitter className="w-4 h-4 mr-2" />
                              Share on X
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-white hover:bg-[#232948] focus:bg-[#232948] focus:text-white cursor-pointer"
                              onClick={handleShareLinkedIn}
                            >
                              <Linkedin className="w-4 h-4 mr-2" />
                              Share on LinkedIn
                            </DropdownMenuItem>
                            {typeof navigator.share === 'function' && (
                              <DropdownMenuItem
                                className="text-white hover:bg-[#232948] focus:bg-[#232948] focus:text-white cursor-pointer"
                                onClick={handleNativeShare}
                              >
                                <LinkIcon className="w-4 h-4 mr-2" />
                                More Options...
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                        {result.decryptedFile && (
                          <button
                            className="p-2 bg-white/5 rounded-lg text-[#929bc9] hover:text-white transition-colors"
                            onClick={handleDownload}
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="p-8 grid md:grid-cols-2 gap-8">
                      {/* Diploma Details */}
                      <div className="flex flex-col gap-6">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-[#232948] flex items-center justify-center border border-white/5 text-sc-accent-blue">
                            <Hash className="w-7 h-7" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[#929bc9] text-[10px] uppercase font-black tracking-widest">
                              Diploma ID
                            </span>
                            <span className="text-white text-xl font-bold">
                              #{result.diplomaId}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-[#232948] flex items-center justify-center border border-white/5 text-[#F5D061]">
                            <UserCircle className="w-7 h-7" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[#929bc9] text-[10px] uppercase font-black tracking-widest">
                              Owner
                            </span>
                            <span className="text-white text-sm font-mono">
                              {truncateAddress(result.owner)}
                            </span>
                            <span className="text-[#5a648b] text-xs">
                              Issuer: {truncateAddress(result.issuer)}
                            </span>
                          </div>
                        </div>

                        {result.status === 'revoked' &&
                          result.revocationReason && (
                            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                              <div className="flex items-center gap-2 text-yellow-400 mb-2">
                                <AlertTriangle className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase">
                                  Revocation Reason
                                </span>
                              </div>
                              <p className="text-white text-sm">
                                {result.revocationReason}
                              </p>
                            </div>
                          )}
                      </div>

                      {/* Blockchain Details */}
                      <div className="bg-[#1a1f35]/50 rounded-xl p-6 border border-white/5 flex flex-col gap-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-[#929bc9]">
                            <Calendar className="w-3.5 h-3.5" />
                            <span className="text-[10px] uppercase font-black tracking-widest">
                              Issuance Date
                            </span>
                          </div>
                          <span className="text-white font-bold">
                            {formatDate(result.timestamp)}
                          </span>
                        </div>

                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-[#929bc9]">
                            <Hash className="w-3.5 h-3.5" />
                            <span className="text-[10px] uppercase font-black tracking-widest">
                              Document Hash
                            </span>
                          </div>
                          <span className="text-xs font-mono text-[#5a648b] break-all">
                            {result.documentHash}
                          </span>
                        </div>

                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-[#929bc9]">
                            <FileText className="w-3.5 h-3.5" />
                            <span className="text-[10px] uppercase font-black tracking-widest">
                              Storage CID
                            </span>
                          </div>
                          <span className="text-xs font-mono text-[#5a648b] break-all">
                            {result.cid}
                          </span>
                        </div>

                        {result.decryptedFile && (
                          <button
                            onClick={handleDownload}
                            className="mt-2 w-full h-10 bg-sc-accent-blue hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2"
                          >
                            <Download className="w-4 h-4" />
                            Download Diploma
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })()}

              <button
                className="text-[#929bc9] hover:text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors mx-auto"
                onClick={() => {
                  setResult(null)
                  setError(null)
                  window.location.hash = ''
                }}
              >
                <ChevronLeft className="w-4 h-4" />
                Verify Another Diploma
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
