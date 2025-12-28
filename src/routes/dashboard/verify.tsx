import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useCallback } from 'react'
import {
  Search,
  QrCode,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Calendar,
  Hash,
  UserCircle,
  ExternalLink,
  Camera,
  X,
} from 'lucide-react'

export const Route = createFileRoute('/dashboard/verify')({
  component: DashboardVerifyPage,
})

interface VerificationResult {
  diplomaId: string
  status: 'valid' | 'revoked' | 'invalid'
  owner: string
  issuer: string
  timestamp: number
  documentHash: string
  cid: string
  isActive: boolean
  studentName?: string
  nim?: string
  revocationReason?: string
}

function DashboardVerifyPage() {
  const [activeTab, setActiveTab] = useState<'id' | 'qr'>('id')
  const [searchValue, setSearchValue] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [result, setResult] = useState<VerificationResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleVerify = useCallback(async () => {
    if (!searchValue.trim()) {
      setError('Please enter a diploma ID')
      return
    }

    setIsVerifying(true)
    setError(null)
    setResult(null)

    try {
      const { verifyDiploma, getDiplomaDetails, getRevocationReason } =
        await import('../../lib/web3/contracts')

      const id = parseInt(searchValue.trim(), 10)
      if (isNaN(id)) {
        throw new Error('Invalid diploma ID. Please enter a number.')
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
        diplomaId: searchValue.trim(),
        status: verification.isActive ? 'valid' : 'revoked',
        owner: details.owner,
        issuer: details.issuer,
        timestamp: details.timestamp,
        documentHash: details.documentHash,
        cid: details.cid,
        isActive: verification.isActive,
        studentName: details.studentName,
        nim: details.nim,
        revocationReason,
      })
    } catch (err: any) {
      console.error('Verification error:', err)
      setError(err.message || 'Verification failed')
    } finally {
      setIsVerifying(false)
    }
  }, [searchValue])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleVerify()
    }
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

  const clearResult = () => {
    setResult(null)
    setError(null)
    setSearchValue('')
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'valid':
        return {
          icon: CheckCircle2,
          title: 'Verified Valid',
          subtitle: 'This diploma is authentic and active',
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
      default:
        return {
          icon: XCircle,
          title: 'Invalid',
          subtitle: 'Verification failed',
          bgClass: 'bg-red-500/10 border-red-500/20',
          iconBgClass: 'bg-red-500',
          textClass: 'text-red-400',
        }
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Result Display */}
      {result && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-500">
          {(() => {
            const config = getStatusConfig(result.status)
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
                  <button
                    onClick={clearResult}
                    className="p-2 bg-white/5 rounded-lg text-[#929bc9] hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
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

                    {result.studentName && (
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[#232948] flex items-center justify-center border border-white/5 text-[#F5D061]">
                          <UserCircle className="w-7 h-7" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[#929bc9] text-[10px] uppercase font-black tracking-widest">
                            Student
                          </span>
                          <span className="text-white font-bold">
                            {result.studentName}
                          </span>
                          {result.nim && (
                            <span className="text-[#5a648b] text-xs">
                              NIM: {result.nim}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {result.status === 'revoked' && result.revocationReason && (
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
                        <UserCircle className="w-3.5 h-3.5" />
                        <span className="text-[10px] uppercase font-black tracking-widest">
                          Owner / Issuer
                        </span>
                      </div>
                      <span className="text-white text-sm font-mono">
                        {truncateAddress(result.owner)}
                      </span>
                      <span className="text-[#5a648b] text-xs font-mono">
                        Issuer: {truncateAddress(result.issuer)}
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

                    <div className="flex gap-2 mt-2">
                      <Link
                        to="/verify"
                        search={{ id: result.diplomaId }}
                        className="flex-1 h-10 bg-sc-accent-blue hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Public View
                      </Link>
                      {result.isActive && (
                        <Link
                          to="/dashboard/revoke"
                          search={{ id: result.diplomaId }}
                          className="flex-1 h-10 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2"
                        >
                          <XCircle className="w-4 h-4" />
                          Revoke
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })()}
        </div>
      )}

      {/* Error Display */}
      {error && !result && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3 animate-in fade-in">
          <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-red-400">{error}</p>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-400 hover:text-red-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Action Area */}
      <div className="glass-panel p-8 md:p-12 rounded-2xl relative overflow-hidden">
        {/* Background Decorative */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-sc-accent-blue/5 blur-[80px] rounded-full pointer-events-none"></div>

        <div className="max-w-2xl mx-auto flex flex-col gap-8 relative z-10">
          <div className="text-center flex flex-col gap-2">
            <h2 className="text-2xl font-black text-white">
              {activeTab === 'id' ? 'Verify via Search' : 'Verify via Scanner'}
            </h2>
            <p className="text-[#929bc9] font-medium">
              Verify credentials across the global Serti-Chain ecosystem
              instantly.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 shrink-0">
                {activeTab === 'id' ? (
                  <ShieldCheck className="w-5 h-5 text-sc-accent-blue" />
                ) : (
                  <QrCode className="w-5 h-5 text-sc-accent-blue" />
                )}
              </div>
              {activeTab === 'id' ? (
                <>
                  <input
                    type="text"
                    className="sc-input sc-input-icon h-14 w-full pr-28"
                    placeholder="Enter Diploma ID (e.g., 0, 1, 2...)"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isVerifying}
                  />
                  <button
                    onClick={handleVerify}
                    disabled={isVerifying || !searchValue.trim()}
                    className="absolute right-2 top-2 h-10 px-4 bg-sc-accent-blue hover:bg-blue-700 text-white font-bold rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-blue-900/40 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Verifying
                      </>
                    ) : (
                      <>
                        Verify
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </>
              ) : (
                <div className="sc-input sc-input-icon h-14 w-full flex items-center justify-between pr-4">
                  <span className="text-[#5a648b]">QR Scanner</span>
                  <div className="flex items-center gap-2">
                    <Camera className="w-5 h-5 text-[#929bc9]" />
                    <span className="text-xs text-[#929bc9] bg-[#232948] px-2 py-1 rounded">
                      Coming Soon
                    </span>
                  </div>
                </div>
              )}
            </div>
            <p className="text-center text-[10px] text-[#5a648b] font-black uppercase tracking-widest">
              Direct connection to Mainnet & Sepolia verification nodes
            </p>
          </div>
        </div>
      </div>

      {/* Verify Methods */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* ID Search Method */}
        <div
          className={`glass-panel p-8 rounded-2xl border transition-all cursor-pointer group ${
            activeTab === 'id'
              ? 'border-sc-accent-blue bg-sc-accent-blue/5 shadow-2xl shadow-blue-900/10'
              : 'border-white/5 hover:border-white/10'
          }`}
          onClick={() => setActiveTab('id')}
        >
          <div className="flex flex-col gap-6">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                activeTab === 'id'
                  ? 'bg-sc-accent-blue text-white shadow-lg shadow-blue-900/40'
                  : 'bg-[#232948] text-[#929bc9]'
              }`}
            >
              <Search className="w-7 h-7" />
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-xl font-black text-white">ID Verification</h3>
              <p className="text-[#929bc9] text-sm font-medium leading-relaxed">
                Manually enter a student credential ID or transaction hash to
                verify identity.
              </p>
            </div>
            <div
              className={`mt-2 flex items-center gap-2 font-bold text-sm ${
                activeTab === 'id' ? 'text-sc-accent-blue' : 'text-[#5a648b]'
              }`}
            >
              {activeTab === 'id' ? 'Active Method' : 'Select Method'}
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* QR Scan Method */}
        <div
          className={`glass-panel p-8 rounded-2xl border transition-all cursor-pointer group ${
            activeTab === 'qr'
              ? 'border-sc-accent-blue bg-sc-accent-blue/5 shadow-2xl shadow-blue-900/10'
              : 'border-white/5 hover:border-white/10'
          }`}
          onClick={() => setActiveTab('qr')}
        >
          <div className="flex flex-col gap-6">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                activeTab === 'qr'
                  ? 'bg-sc-accent-blue text-white shadow-lg shadow-blue-900/40'
                  : 'bg-[#232948] text-[#929bc9]'
              }`}
            >
              <QrCode className="w-7 h-7" />
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-xl font-black text-white">QR Code Scan</h3>
              <p className="text-[#929bc9] text-sm font-medium leading-relaxed">
                Scan the QR code printed on physical diplomas for instant
                digital validation.
              </p>
            </div>
            <div
              className={`mt-2 flex items-center gap-2 font-bold text-sm ${
                activeTab === 'qr' ? 'text-sc-accent-blue' : 'text-[#5a648b]'
              }`}
            >
              {activeTab === 'qr' ? 'Active Method' : 'Select Method'}
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="glass-panel p-6 rounded-xl">
        <h3 className="text-sm font-bold text-[#929bc9] uppercase tracking-wider mb-4">
          Quick Links
        </h3>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/verify"
            className="flex items-center gap-2 px-4 py-2 bg-[#232948] hover:bg-[#2e365c] text-white text-sm font-bold rounded-lg transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Public Verification Page
          </Link>
          <Link
            to="/ledger"
            className="flex items-center gap-2 px-4 py-2 bg-[#232948] hover:bg-[#2e365c] text-white text-sm font-bold rounded-lg transition-colors"
          >
            <Hash className="w-4 h-4" />
            Public Ledger
          </Link>
          <Link
            to="/dashboard/records"
            className="flex items-center gap-2 px-4 py-2 bg-[#232948] hover:bg-[#2e365c] text-white text-sm font-bold rounded-lg transition-colors"
          >
            <Search className="w-4 h-4" />
            Browse All Records
          </Link>
        </div>
      </div>
    </div>
  )
}
