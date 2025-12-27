import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
import {
  User,
  Badge,
  Link as LinkIcon,
  CheckCircle,
  Circle,
  Info,
  CloudUpload,
  FileText,
  X,
  Copy,
  Loader2,
  Lock,
  Hash,
  QrCode,
} from 'lucide-react'
import { ExplorerLink } from '../../components/ExplorerLink'

export const Route = createFileRoute('/dashboard/mint')({
  component: MintDiplomaPage,
})

interface MintResult {
  diplomaId: string
  transactionHash: string
  verificationUrl: string
  cid: string
}

function MintDiplomaPage() {
  const [studentName, setStudentName] = useState('')
  const [nim, setNim] = useState('')
  const [recipientAddress, setRecipientAddress] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isProcessing, setIsProcessing] = useState(false)
  const [currentStep, setCurrentStep] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [mintResult, setMintResult] = useState<MintResult | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null)
      return
    }

    const url = URL.createObjectURL(file)
    setPreviewUrl(url)

    return () => URL.revokeObjectURL(url)
  }, [file])

  const handleMint = async () => {
    if (!file || !studentName || !nim || !recipientAddress) {
      setError('Please fill in all fields')
      return
    }

    setIsProcessing(true)
    setError(null)
    setMintResult(null)

    try {
      // Step 1: Hash the file
      setCurrentStep('Computing document hash...')
      const {
        hashFile,
        generateAESKey,
        generateIV,
        encryptFile,
        encodeVerificationURL,
      } = await import('../../lib/crypto')

      const documentHash = await hashFile(file)
      console.log('Document hash:', documentHash)

      // Step 2: Generate encryption keys
      setCurrentStep('Generating encryption keys...')
      const aesKey = await generateAESKey()
      const iv = generateIV()

      // Step 3: Encrypt the file
      setCurrentStep('Encrypting document...')
      const encryptedData = await encryptFile(file, aesKey, iv)

      // Step 4: Upload encrypted file
      setCurrentStep('Uploading to secure storage...')
      const { uploadEncryptedFile } = await import('../../lib/storage')
      const cid = await uploadEncryptedFile(encryptedData, file.name)
      console.log('Uploaded CID:', cid)

      // Step 5: Sign with wallet
      setCurrentStep('Signing with wallet...')
      const { signMessage } = await import('../../lib/web3/contracts')
      const { getCurrentAccount } = await import('../../lib/web3/client')

      const account = await getCurrentAccount()
      if (!account) {
        throw new Error('Please connect your wallet')
      }

      // Create message to sign (includes hash and metadata)
      const messageToSign = JSON.stringify({
        hash: documentHash,
        studentName,
        nim,
        cid,
        timestamp: Date.now(),
      })
      const signature = await signMessage(messageToSign, account)

      // Step 6: Issue diploma on blockchain
      setCurrentStep('Issuing diploma on blockchain...')
      const { issueDiploma } = await import('../../lib/web3/contracts')
      const receipt = await issueDiploma(
        recipientAddress,
        documentHash,
        cid,
        signature,
        studentName,
        nim,
        account,
      )

      // Extract diploma ID from event
      const diplomaIssuedEvent = receipt.events?.DiplomaIssued
      const diplomaId =
        diplomaIssuedEvent?.returnValues?.diplomaId?.toString() || '0'

      // Step 7: Generate verification URL
      setCurrentStep('Generating verification link...')
      const baseUrl = window.location.origin + '/verify'
      const verificationUrl = encodeVerificationURL(
        baseUrl,
        diplomaId,
        aesKey,
        iv,
        cid,
      )

      setMintResult({
        diplomaId,
        transactionHash: receipt.transactionHash,
        verificationUrl,
        cid,
      })

      setCurrentStep('')
    } catch (err: any) {
      console.error('Mint error:', err)
      setError(err.message || 'Failed to mint diploma')
    } finally {
      setIsProcessing(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const checklistItems = [
    {
      label: 'Wallet Connected',
      description: 'Ready to sign transaction',
      completed: true,
    },
    {
      label: 'Document Uploaded',
      description: file
        ? `${file.name} (${(file.size / 1024).toFixed(1)} KB)`
        : 'Waiting for upload...',
      completed: !!file,
    },
    {
      label: 'Student Info',
      description:
        studentName && nim ? 'All fields valid' : 'Waiting for input...',
      completed: !!(studentName && nim),
    },
    {
      label: 'Recipient Address',
      description: recipientAddress
        ? 'Valid address'
        : 'Enter student wallet address',
      completed: !!recipientAddress && recipientAddress.startsWith('0x'),
    },
  ]

  const allChecked = checklistItems.every((item) => item.completed)

  return (
    <div className="flex flex-col gap-8">
      {/* Success Result */}
      {mintResult && (
        <div className="glass-panel rounded-xl p-6 border-2 border-green-500/30 bg-green-500/5 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="text-green-400 w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                Diploma Issued Successfully!
              </h3>
              <p className="text-green-400 text-sm">
                Diploma ID: #{mintResult.diplomaId}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-[#111422] rounded-lg p-4">
              <label className="text-xs text-[#929bc9] uppercase font-bold block mb-2">
                Verification URL (Share with student)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={mintResult.verificationUrl}
                  readOnly
                  className="flex-1 bg-[#1c2237] text-white text-sm p-3 rounded-lg font-mono overflow-hidden text-ellipsis"
                />
                <button
                  onClick={() => copyToClipboard(mintResult.verificationUrl)}
                  className="px-4 py-2 bg-sc-accent-blue hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors"
                >
                  {copied ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <p className="text-xs text-[#929bc9] mt-2 flex items-center gap-1">
                <Lock className="w-3 h-3" />
                Encryption keys are embedded in URL - share only with the
                student
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-[#111422] rounded-lg p-4">
                <label className="text-xs text-[#929bc9] uppercase font-bold block mb-1">
                  Transaction Hash
                </label>
                <ExplorerLink
                  hash={mintResult.transactionHash}
                  type="tx"
                  truncate
                />
              </div>
              <div className="bg-[#111422] rounded-lg p-4">
                <label className="text-xs text-[#929bc9] uppercase font-bold block mb-1">
                  Storage CID
                </label>
                <p className="text-white font-mono text-sm truncate">
                  {mintResult.cid}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setMintResult(null)
                setFile(null)
                setStudentName('')
                setNim('')
                setRecipientAddress('')
              }}
              className="w-full py-3 bg-[#232948] hover:bg-[#2e365c] text-white rounded-lg transition-colors"
            >
              Issue Another Diploma
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3">
          <X className="text-red-400 w-5 h-5" />
          <p className="text-red-400">{error}</p>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-400 hover:text-red-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Minting Workflow Section */}
      {!mintResult && (
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Left Column: Upload & Form */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="glass-panel rounded-xl p-6 flex flex-col gap-6">
              <div className="flex items-center gap-2 border-b border-white/5 pb-4 mb-2">
                <span className="text-sc-accent-blue material-symbols-outlined">
                  description
                </span>
                <h3 className="text-lg font-bold text-white">
                  Issue New Diploma
                </h3>
              </div>

              {/* Upload Area */}
              <div
                className="sc-upload group"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.txt"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                <div className="h-12 w-12 rounded-full bg-[#232948] flex items-center justify-center group-hover:bg-sc-accent-blue/20 transition-colors">
                  <CloudUpload className="text-white group-hover:text-sc-accent-blue transition-colors w-6 h-6" />
                </div>
                <div className="flex flex-col items-center gap-1 text-center">
                  <p className="text-white text-base font-bold">
                    {file ? file.name : 'Upload Diploma Document'}
                  </p>
                  <p className="text-[#929bc9] text-sm">
                    Supported: PDF, PNG, JPG, JPEG, TXT (max 50MB)
                  </p>
                </div>
                <button className="mt-2 px-4 py-2 bg-[#232948] text-white text-xs font-bold rounded-lg hover:bg-[#2e365c] transition-colors">
                  {file ? 'Change File' : 'Select File'}
                </button>
              </div>

              {/* Input Fields */}
              <div className="grid md:grid-cols-2 gap-5">
                <label className="flex flex-col gap-2">
                  <span className="text-[#929bc9] text-xs font-bold uppercase tracking-wider ml-1">
                    Student Full Name
                  </span>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#929bc9] w-5 h-5 pointer-events-none" />
                    <input
                      type="text"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="e.g., Jane Doe"
                      className="sc-input sc-input-icon"
                    />
                  </div>
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-[#929bc9] text-xs font-bold uppercase tracking-wider ml-1">
                    NIM (Student ID)
                  </span>
                  <div className="relative">
                    <Badge className="absolute left-4 top-1/2 -translate-y-1/2 text-[#929bc9] w-5 h-5 pointer-events-none" />
                    <input
                      type="text"
                      value={nim}
                      onChange={(e) => setNim(e.target.value)}
                      placeholder="e.g., 202400159"
                      className="sc-input sc-input-icon"
                    />
                  </div>
                </label>
              </div>

              <label className="flex flex-col gap-2">
                <span className="text-[#929bc9] text-xs font-bold uppercase tracking-wider ml-1">
                  Recipient Wallet Address
                </span>
                <div className="relative">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-[#929bc9] w-5 h-5 pointer-events-none" />
                  <input
                    type="text"
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    placeholder="0x..."
                    className="sc-input sc-input-icon font-mono"
                  />
                </div>
              </label>

              {/* Processing Status */}
              {isProcessing && (
                <div className="bg-[#232948] rounded-lg p-4 flex items-center gap-3 animate-pulse">
                  <Loader2 className="w-5 h-5 text-sc-accent-blue animate-spin" />
                  <span className="text-white">{currentStep}</span>
                </div>
              )}

              {/* Action Button */}
              <div className="pt-2">
                <button
                  className="w-full h-14 bg-sc-accent-blue hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 flex items-center justify-center gap-3 transition-all transform active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!allChecked || isProcessing}
                  onClick={handleMint}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <LinkIcon className="w-5 h-5" />
                      <span>Issue Diploma</span>
                    </>
                  )}
                </button>
              </div>

              {/* PDF Preview Area */}
              {file && previewUrl && (
                <div className="mt-4 pt-6 border-t border-white/5 flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="text-sc-accent-blue w-5 h-5" />
                      <h3 className="text-base font-bold text-white">
                        Document Preview
                      </h3>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setFile(null)
                      }}
                      className="p-2 hover:bg-white/5 rounded-lg text-[#929bc9] hover:text-white transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="aspect-4/5 w-full bg-[#111422] rounded-lg overflow-hidden border border-white/5 relative">
                    {file.type === 'application/pdf' ? (
                      <iframe
                        src={`${previewUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                        className="w-full h-full border-none"
                        title="PDF Preview"
                      />
                    ) : file.type.startsWith('image/') ? (
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-[#929bc9]">
                        <FileText className="w-16 h-16" />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Checklist */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="glass-panel rounded-xl p-6 h-full flex flex-col gap-4">
              <div className="flex items-center gap-2 border-b border-white/5 pb-4">
                <Info className="text-sc-accent-yellow w-5 h-5" />
                <h3 className="text-lg font-bold text-white">
                  Pre-Issue Checklist
                </h3>
              </div>

              <div className="flex flex-col gap-3">
                {checklistItems.map((item, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
                      item.completed
                        ? 'bg-green-500/10 border-green-500/20'
                        : 'bg-[#232948]/50 border-white/5'
                    }`}
                  >
                    {item.completed ? (
                      <CheckCircle className="text-green-400 w-4 h-4 mt-1" />
                    ) : (
                      <Circle className="text-[#929bc9] w-4 h-4 mt-1" />
                    )}
                    <div className="flex flex-col">
                      <span
                        className={`text-sm font-semibold ${item.completed ? 'text-white' : 'text-[#929bc9]'}`}
                      >
                        {item.label}
                      </span>
                      <span
                        className={`text-xs ${item.completed ? 'text-white/60' : 'text-[#929bc9]/60'}`}
                      >
                        {item.description}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Process Steps */}
              <div className="mt-4 pt-4 border-t border-white/5">
                <h4 className="text-xs text-[#929bc9] uppercase font-bold mb-3">
                  Issuance Process
                </h4>
                <div className="space-y-2 text-xs text-[#929bc9]">
                  <div className="flex items-center gap-2">
                    <Hash className="w-3 h-3" />
                    <span>1. Compute SHA-256 hash</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Lock className="w-3 h-3" />
                    <span>2. Encrypt with AES-256</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CloudUpload className="w-3 h-3" />
                    <span>3. Upload to storage</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-3 h-3" />
                    <span>4. Sign with wallet</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <LinkIcon className="w-3 h-3" />
                    <span>5. Issue on blockchain</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <QrCode className="w-3 h-3" />
                    <span>6. Generate verification URL</span>
                  </div>
                </div>
              </div>

              <div className="mt-auto bg-linear-to-br from-[#1c2237] to-[#111422] rounded-lg p-4 border border-white/5">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-[#929bc9] uppercase font-bold">
                    Gas Estimation
                  </span>
                  <span className="text-xs text-white font-mono">
                    ~0.003 ETH
                  </span>
                </div>
                <div className="w-full bg-[#111422] rounded-full h-1.5">
                  <div
                    className="bg-sc-accent-blue h-1.5 rounded-full shadow-[0_0_8px_rgba(19,55,236,0.5)]"
                    style={{
                      width: `${(checklistItems.filter((i) => i.completed).length / checklistItems.length) * 100}%`,
                    }}
                  ></div>
                </div>
                <p className="text-[10px] text-[#929bc9] mt-2 text-right">
                  Network Status: <span className="text-green-400">Stable</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
