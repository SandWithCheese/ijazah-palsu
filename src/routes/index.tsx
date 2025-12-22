import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import {
  ShieldCheck,
  CheckCircle2,
  BookOpen,
  Fingerprint,
  Zap,
  Globe,
  Search,
  Verified,
  History,
} from 'lucide-react'

export const Route = createFileRoute('/')({
  component: LandingPage,
})

function LandingPage() {
  const navigate = useNavigate()
  const [searchValue, setSearchValue] = useState('')

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchValue.trim()) {
      navigate({ to: '/verify', search: { id: searchValue.trim() } })
    } else {
      navigate({ to: '/verify' })
    }
  }
  return (
    <div className="relative flex flex-col min-h-screen w-full bg-background-dark text-white font-display overflow-x-hidden antialiased selection:bg-sc-accent-blue selection:text-white">
      {/* Background decorative elements for depth */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-sc-accent-blue/10 blur-[120px] rounded-full pointer-events-none z-0"></div>
      <div className="fixed bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-sc-accent-blue/5 blur-[100px] rounded-full pointer-events-none z-0"></div>

      <main className="relative z-10 grow flex flex-col">
        {/* Hero Section */}
        <section className="relative py-16 lg:py-24 overflow-hidden">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
              {/* Hero Content */}
              <div className="flex flex-col gap-6 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 self-center lg:self-start px-3 py-1 rounded-full bg-sc-accent-blue/10 border border-sc-accent-blue/20 text-sc-accent-blue text-xs font-bold uppercase tracking-wide">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Web3 Secured
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight text-white">
                  The Future of <br />
                  <span className="gold-gradient-text">
                    Academic Integrity
                  </span>{' '}
                  <br />
                  is On-Chain.
                </h1>
                <p className="text-[#929bc9] text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto lg:mx-0 font-body">
                  Issue, manage, and verify digital diplomas instantly.
                  Serti-Chain leverages blockchain technology to create
                  tamper-proof credentials for universities and students
                  worldwide.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mt-4">
                  <Link
                    to="/dashboard"
                    className="h-12 px-8 bg-white text-[#101322] hover:bg-gray-100 font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    Get Started
                  </Link>
                </div>
              </div>

              {/* Hero Graphic */}
              <div className="relative w-full aspect-square max-w-md mx-auto lg:max-w-full lg:ml-auto">
                <div className="absolute inset-0 bg-linear-to-tr from-sc-accent-blue/20 to-purple-500/20 rounded-3xl blur-2xl"></div>
                <div className="relative h-full w-full glass-panel rounded-2xl p-4 flex flex-col items-center justify-center overflow-hidden border border-white/10">
                  <div className="absolute top-0 right-0 p-6 opacity-20">
                    <BookOpen className="w-32 h-32 text-white" />
                  </div>
                  <div
                    className="w-full h-full bg-cover bg-center rounded-xl relative overflow-hidden group"
                    style={{
                      backgroundImage:
                        "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAGLCcDw97XxAlP0WN4bnwteUxcqC7TOl-QK8GsWORh0_KdwvRNhtdZeeoCjwIzBMs2iWX4fP5g2y4RGIMfE_L5wyiycaI_aqKAjEH8qnZBU5TZgiRJMTeek0xx6k5gjec24aSQnzJsKWy9vU6O_Rim47mujiOS_OIYLiZcY3vL_ziFjQzqtafES2xtowU4ZGrKLPcaRtFFQlfkkgTSmgGF8IdfxjiG8I2-ptyrAggcyC-snYg8GOaXsm6cJfBEzil51ukdHveynlM')",
                    }}
                  >
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-500"></div>
                    <div className="absolute bottom-6 left-6 right-6 p-4 glass-panel rounded-xl flex items-center justify-between border border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center border border-green-500/30">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-white font-bold text-sm">
                            Diploma Verified
                          </p>
                          <p className="text-[#929bc9] text-xs font-mono">
                            ID: 0x8a...4b2
                          </p>
                        </div>
                      </div>
                      <div className="text-[#F5D061] font-bold text-xs uppercase tracking-wider">
                        100% VALID
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 bg-[#101322]">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-4xl font-black text-white mb-4 tracking-tight">
                Why Serti-Chain?
              </h2>
              <p className="text-[#929bc9] font-medium font-body leading-relaxed">
                Our decentralized architecture ensures that every credential
                issued is permanent, verifiable, and owned by the student.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-[#111422] border border-white/5 hover:border-sc-accent-blue/50 p-8 rounded-2xl group transition-all duration-300">
                <div className="size-14 bg-white/5 rounded-xl flex items-center justify-center mb-6 group-hover:bg-sc-accent-blue group-hover:text-white transition-colors text-sc-accent-blue">
                  <Fingerprint className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 tracking-tight">
                  Tamper-Proof
                </h3>
                <p className="text-[#929bc9] text-sm leading-relaxed font-body">
                  Once minted on the blockchain, credentials cannot be altered
                  or deleted. This immutability guarantees the authenticity of
                  every degree.
                </p>
              </div>
              <div className="bg-[#111422] border border-white/5 hover:border-sc-accent-blue/50 p-8 rounded-2xl group transition-all duration-300">
                <div className="size-14 bg-white/5 rounded-xl flex items-center justify-center mb-6 group-hover:bg-sc-accent-blue group-hover:text-white transition-colors text-sc-accent-blue">
                  <Zap className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 tracking-tight">
                  Instant Verification
                </h3>
                <p className="text-[#929bc9] text-sm leading-relaxed font-body">
                  Employers can verify academic records in seconds without
                  contacting the university, saving time and eliminating
                  administrative bottlenecks.
                </p>
              </div>
              <div className="bg-[#111422] border border-white/5 hover:border-sc-accent-blue/50 p-8 rounded-2xl group transition-all duration-300">
                <div className="size-14 bg-white/5 rounded-xl flex items-center justify-center mb-6 group-hover:bg-sc-accent-blue group-hover:text-white transition-colors text-sc-accent-blue">
                  <Globe className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 tracking-tight">
                  Global Standard
                </h3>
                <p className="text-[#929bc9] text-sm leading-relaxed font-body">
                  Built on open standards, Serti-Chain credentials are
                  recognized globally and are fully portable across different
                  wallet providers.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Ledger Navigation Section */}
        <section className="py-20 bg-[#0b0e1b] border-t border-white/5">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="glass-panel p-8 md:p-12 rounded-3xl border border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
              <div className="absolute -left-12 -top-12 size-48 bg-sc-accent-blue/10 blur-[60px] rounded-full"></div>
              <div className="flex flex-col gap-4 text-center md:text-left relative z-10 max-w-xl">
                <div className="inline-flex items-center gap-2 self-center md:self-start px-3 py-1 rounded-full bg-sc-accent-blue/10 border border-sc-accent-blue/20 text-sc-accent-blue text-xs font-bold uppercase tracking-widest">
                  <History className="w-3.5 h-3.5" />
                  Transparency First
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                  Explore the <br />
                  <span className="gold-gradient-text">
                    Public Transaction Ledger
                  </span>
                </h2>
                <p className="text-[#929bc9] font-medium leading-relaxed">
                  Real-time transparency. Browse every diploma minted, revoked,
                  or updated on the Serti-Chain network through our public
                  immutable registry.
                </p>
              </div>
              <Link
                to="/ledger"
                className="h-14 px-10 bg-[#232948] hover:bg-[#2e365c] text-white font-black rounded-xl border border-[#323b67] transition-all flex items-center justify-center gap-3 relative z-10 group"
              >
                <span>View Full Ledger</span>
                <History className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              </Link>
            </div>
          </div>
        </section>

        {/* CTA / Verification Section */}
        <section className="py-20 relative bg-[#101322]">
          <div className="absolute inset-0 bg-sc-accent-blue/5 -skew-y-3 z-0"></div>
          <div className="max-w-[960px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="glass-panel rounded-2xl p-8 md:p-12 lg:p-16 text-center border border-white/10 shadow-2xl overflow-hidden relative">
              <div className="absolute -top-24 -right-24 size-64 bg-sc-accent-blue/20 blur-[80px] rounded-full"></div>
              <Verified className="w-16 h-16 text-[#F5D061] mx-auto mb-6" />
              <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight">
                Verify a Credential Now
              </h2>
              <p className="text-[#929bc9] mb-8 max-w-xl mx-auto font-body text-lg">
                Enter a Diploma ID or transaction hash to check its authenticity
                on the blockchain instantly.
              </p>
              <div className="max-w-xl mx-auto">
                <form
                  onSubmit={handleVerify}
                  className="flex flex-col sm:flex-row gap-2 relative z-10"
                >
                  <div className="relative grow group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5a648b] group-focus-within:text-sc-accent-blue transition-colors" />
                    <input
                      className="w-full h-14 pl-12 pr-4 bg-[#1a1f35] border border-[#323b67] rounded-xl text-white placeholder-[#5a648b] focus:ring-2 focus:ring-sc-accent-blue focus:border-transparent transition-all outline-none font-medium"
                      placeholder="Enter Diploma ID (e.g., 0x7a...)"
                      type="text"
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                    />
                  </div>
                  <button
                    type="submit"
                    className="h-14 px-8 bg-sc-accent-blue hover:bg-blue-700 text-white font-black rounded-xl transition-all whitespace-nowrap shadow-lg shadow-blue-900/40 active:scale-95"
                  >
                    Verify Now
                  </button>
                </form>
                <p className="text-xs text-[#5a648b] mt-4 font-bold uppercase tracking-widest">
                  By verifying, you agree to our{' '}
                  <a className="underline hover:text-white" href="#">
                    Terms of Service
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#0b0e1b] border-t border-white/5 py-12 relative z-10">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="size-10 flex items-center justify-center bg-sc-accent-blue/20 rounded-lg border border-sc-accent-blue/30 text-sc-accent-blue">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="text-white font-black text-xl tracking-tight">
                Serti-Chain
              </span>
            </div>
            <div className="flex flex-wrap justify-center gap-8 text-sm font-bold uppercase tracking-widest text-[#929bc9]">
              <a className="hover:text-white transition-colors" href="#">
                Documentation
              </a>
              <a className="hover:text-white transition-colors" href="#">
                Smart Contracts
              </a>
              <a className="hover:text-white transition-colors" href="#">
                Privacy Policy
              </a>
            </div>
            <div className="text-[#5a648b] text-sm font-bold uppercase tracking-widest">
              © 2024 Serti-Chain Inc.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
