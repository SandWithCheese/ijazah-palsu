import { createFileRoute, useSearch } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { z } from 'zod'
import {
  Search,
  ShieldCheck,
  Download,
  Share2,
  ExternalLink,
  CheckCircle2,
  Calendar,
  Hash,
  UserCircle,
  ChevronLeft,
} from 'lucide-react'

const verifySearchSchema = z.object({
  id: z.string().optional(),
})

export const Route = createFileRoute('/verify')({
  component: VerifyCredentialPage,
  validateSearch: verifySearchSchema,
})

function VerifyCredentialPage() {
  const { id } = useSearch({ from: '/verify' })
  const [diplomaId, setDiplomaId] = useState(id || '')
  const [isVerifying, setIsVerifying] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleVerify = (idToVerify?: string) => {
    const targetId = idToVerify || diplomaId
    if (!targetId) return

    setIsVerifying(true)
    // Simulate API call
    setTimeout(() => {
      setResult({
        studentName: 'Ahmad Santoso',
        nim: '202300101',
        major: 'Computer Science',
        degree: 'Bachelor of Science',
        issueDate: 'Oct 24, 2023',
        institution: 'University of Technology',
        txHash: targetId.startsWith('0x') ? targetId : '0x71c...9a2b53e8',
        status: 'verified',
      })
      setIsVerifying(false)
    }, 1500)
  }

  useEffect(() => {
    if (id) {
      setDiplomaId(id)
      handleVerify(id)
    }
  }, [id])

  return (
    <div className="relative flex flex-col min-h-screen w-full bg-background-dark text-white font-display overflow-x-hidden antialiased">
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
              Confirm the authenticity of certificates instantly using
              Serti-Chain's on-chain verification protocol.
            </p>
          </div>

          {!result ? (
            /* Search Card */
            <div className="glass-panel p-8 md:p-10 rounded-2xl border border-white/10 shadow-2xl">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-[#929bc9] uppercase tracking-widest ml-1">
                    Enter Credential ID
                  </label>
                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5a648b] group-focus-within:text-sc-accent-blue transition-colors" />
                    <input
                      type="text"
                      className="sc-input sc-input-icon h-14"
                      placeholder="e.g., 0x8a...4b2 or Diploma NIM"
                      value={diplomaId}
                      onChange={(e) => setDiplomaId(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  className="w-full h-14 bg-sc-accent-blue hover:bg-blue-700 text-white font-black rounded-xl shadow-lg shadow-blue-900/40 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
                  onClick={() => handleVerify()}
                  disabled={isVerifying || !diplomaId}
                >
                  {isVerifying ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <ShieldCheck className="w-5 h-5" />
                  )}
                  <span>
                    {isVerifying ? 'Verifying...' : 'Verify Authenticity'}
                  </span>
                </button>

                <div className="pt-4 border-t border-white/5">
                  <p className="text-xs text-[#5a648b] text-center font-bold uppercase tracking-widest leading-relaxed">
                    Secure verification powered by <br />
                    <span className="text-sc-accent-blue">
                      Ethereum Sepolia Network
                    </span>
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Result Display */
            <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Main Result Card */}
              <div className="glass-panel rounded-2xl border border-green-500/20 shadow-[0_0_50px_rgba(34,197,94,0.1)] overflow-hidden">
                <div className="bg-green-500/10 p-6 flex items-center justify-between border-b border-green-500/10">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500 rounded-lg shadow-lg shadow-green-900/40">
                      <CheckCircle2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white">
                        Authenticated
                      </h3>
                      <p className="text-green-400 text-xs font-bold uppercase tracking-widest">
                        Verified Valid
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 bg-white/5 rounded-lg text-[#929bc9] hover:text-white transition-colors">
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button className="p-2 bg-white/5 rounded-lg text-[#929bc9] hover:text-white transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="p-8 grid md:grid-cols-2 gap-8">
                  {/* Student Details */}
                  <div className="flex flex-col gap-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[#232948] flex items-center justify-center border border-white/5 text-sc-accent-blue">
                        <UserCircle className="w-7 h-7" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[#929bc9] text-[10px] uppercase font-black tracking-widest">
                          Student Name
                        </span>
                        <span className="text-white text-xl font-bold">
                          {result.studentName}
                        </span>
                        <span className="text-[#5a648b] text-sm font-medium">
                          NIM: {result.nim}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[#232948] flex items-center justify-center border border-white/5 text-[#F5D061]">
                        <ShieldCheck className="w-7 h-7" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[#929bc9] text-[10px] uppercase font-black tracking-widest">
                          Qualification
                        </span>
                        <span className="text-white text-xl font-bold">
                          {result.degree}
                        </span>
                        <span className="text-[#5a648b] text-sm font-medium">
                          {result.major}
                        </span>
                      </div>
                    </div>
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
                        {result.issueDate}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-[#929bc9]">
                        <Hash className="w-3.5 h-3.5" />
                        <span className="text-[10px] uppercase font-black tracking-widest">
                          Transaction Hash
                        </span>
                      </div>
                      <div className="flex items-center gap-2 group flex-wrap">
                        <span className="text-xs font-mono text-[#5a648b] break-all">
                          {result.txHash}
                        </span>
                        <button className="text-sc-accent-blue hover:text-white transition-colors">
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <button className="mt-2 w-full h-10 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-lg border border-white/5 transition-all">
                      View on Sepolia Explorer
                    </button>
                  </div>
                </div>
              </div>

              <button
                className="text-[#929bc9] hover:text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors mx-auto"
                onClick={() => setResult(null)}
              >
                <ChevronLeft className="w-4 h-4" />
                Back to Search
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
