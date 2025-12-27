import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import {
  Search,
  Download,
  Filter,
  Link as LinkIcon,
  AlertTriangle,
  Loader2,
  XCircle,
} from 'lucide-react'
import { ExplorerLink } from '../components/ExplorerLink'

export const Route = createFileRoute('/ledger')({
  component: PublicLedgerPage,
})

interface DiplomaEntry {
  id: number
  owner: string
  issuer: string
  timestamp: number
  isActive: boolean
  studentName: string
  nim: string
  cid: string
}

function PublicLedgerPage() {
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [diplomas, setDiplomas] = useState<DiplomaEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDiplomas = async () => {
      try {
        const { getAllDiplomas } = await import('../lib/web3/contracts')
        const allDiplomas = await getAllDiplomas()
        setDiplomas(allDiplomas)
      } catch (err: any) {
        console.error('Error fetching diplomas:', err)
        setError(err.message || 'Failed to fetch ledger data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchDiplomas()
  }, [])

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000)
    return {
      date: date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
      time:
        date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }) + ' UTC',
    }
  }

  const filteredDiplomas = diplomas.filter((d) => {
    const matchesFilter =
      filter === 'all' ||
      (filter === 'active' && d.isActive) ||
      (filter === 'revoked' && !d.isActive)
    const search = searchQuery.toLowerCase()
    const matchesSearch =
      d.id.toString().includes(search) ||
      d.studentName.toLowerCase().includes(search) ||
      d.nim.toLowerCase().includes(search)
    return matchesFilter && matchesSearch
  })

  return (
    <div className="flex min-h-screen bg-background-dark font-display text-white antialiased overflow-hidden">
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Background Gradient Decorations */}
        <div className="absolute top-0 left-0 w-full h-96 bg-linear-to-b from-[#1337ec]/10 to-transparent pointer-events-none"></div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 z-0">
          <div className="max-w-[1400px] mx-auto">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-[#929bc9] font-medium mb-4">
              <span>Platform</span>
              <span className="text-[#929bc9]/50 text-xs">›</span>
              <span className="text-white">Public Ledger</span>
            </nav>

            <div className="flex items-start justify-between mb-8">
              <div>
                <h1 className="text-4xl font-black text-white leading-tight tracking-tight mb-3">
                  Public Diploma Ledger
                </h1>
                <p className="text-[#929bc9] max-w-2xl leading-relaxed">
                  A real-time, immutable record of all academic certifications
                  issued and revoked on the blockchain network.
                </p>
              </div>
              <button className="sc-btn-primary h-12 px-6">
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>

            {/* Search Bar */}
            <div className="mb-8 relative max-w-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5a648b]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Diploma ID, Student Name, or NIM..."
                className="w-full bg-[#111422] border border-[#323b67] rounded-xl h-14 pl-12 pr-4 text-white placeholder-[#5a648b] focus:ring-2 focus:ring-sc-accent-blue focus:border-transparent outline-none transition-all shadow-lg"
              />
            </div>

            {/* Filters & Actions */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                    filter === 'all'
                      ? 'bg-sc-accent-blue/10 text-white border-sc-accent-blue/20'
                      : 'text-[#929bc9] border-transparent hover:text-white'
                  }`}
                >
                  All Diplomas
                </button>
                <button
                  onClick={() => setFilter('active')}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all border flex items-center gap-2 ${
                    filter === 'active'
                      ? 'bg-green-500/10 text-white border-green-500/20'
                      : 'bg-[#232948]/30 text-[#929bc9] border-transparent hover:text-white'
                  }`}
                >
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  Active
                </button>
                <button
                  onClick={() => setFilter('revoked')}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all border flex items-center gap-2 ${
                    filter === 'revoked'
                      ? 'bg-red-500/10 text-white border-red-500/20'
                      : 'bg-[#232948]/30 text-[#929bc9] border-transparent hover:text-white'
                  }`}
                >
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  Revoked
                </button>
              </div>

              <button className="flex items-center gap-2 px-5 h-10 bg-[#232948]/50 border border-white/5 rounded-xl text-sm font-bold text-[#929bc9] hover:text-white transition-all">
                <Filter className="w-4 h-4" />
                Filter
              </button>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="glass-panel rounded-xl p-12 text-center">
                <Loader2 className="w-8 h-8 text-sc-accent-blue animate-spin mx-auto mb-4" />
                <p className="text-white font-bold">Loading ledger data...</p>
                <p className="text-[#929bc9] text-sm">
                  Fetching diploma records from blockchain
                </p>
              </div>
            )}

            {/* Error State */}
            {error && !isLoading && (
              <div className="glass-panel rounded-xl p-12 text-center border border-red-500/20">
                <XCircle className="w-8 h-8 text-red-400 mx-auto mb-4" />
                <p className="text-red-400 font-bold">{error}</p>
                <p className="text-[#929bc9] text-sm mt-2">
                  Make sure the contract is deployed and accessible.
                </p>
              </div>
            )}

            {/* Table Container */}
            {!isLoading && !error && (
              <div className="glass-panel rounded-xl overflow-hidden shadow-2xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 bg-[#1c2136]">
                      <th className="p-4 text-xs font-bold text-[#929bc9] uppercase tracking-wider">
                        Diploma ID
                      </th>
                      <th className="p-4 text-xs font-bold text-[#929bc9] uppercase tracking-wider">
                        Student
                      </th>
                      <th className="p-4 text-xs font-bold text-[#929bc9] uppercase tracking-wider">
                        Timestamp (UTC)
                      </th>
                      <th className="p-4 text-xs font-bold text-[#929bc9] uppercase tracking-wider">
                        Issuer
                      </th>
                      <th className="p-4 text-xs font-bold text-[#929bc9] uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {filteredDiplomas.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="p-8 text-center text-[#929bc9]"
                        >
                          {diplomas.length === 0
                            ? 'No diplomas have been issued yet.'
                            : 'No matching records found.'}
                        </td>
                      </tr>
                    ) : (
                      filteredDiplomas.map((diploma) => {
                        const { date, time } = formatDate(diploma.timestamp)
                        return (
                          <tr
                            key={diploma.id}
                            className="border-b border-white/5 hover:bg-[#1c2136] transition-colors group"
                          >
                            <td className="p-4">
                              <div className="flex items-center gap-4">
                                <div
                                  className={`p-2 rounded-lg bg-[#232948] border border-white/10 group-hover:border-sc-accent-blue/30 transition-colors ${diploma.isActive ? 'text-sc-accent-blue' : 'text-orange-500'}`}
                                >
                                  <LinkIcon className="w-4 h-4" />
                                </div>
                                <span
                                  className={`font-mono font-bold tracking-tight ${diploma.isActive ? 'text-sc-accent-blue' : 'text-orange-400'}`}
                                >
                                  #{diploma.id}
                                </span>
                              </div>
                            </td>
                            <td className="p-4">
                              <div>
                                <p className="font-bold text-white">
                                  {diploma.studentName || 'Unknown'}
                                </p>
                                <p className="text-xs text-[#5a648b]">
                                  NIM: {diploma.nim || 'N/A'}
                                </p>
                              </div>
                            </td>
                            <td className="p-4">
                              <div>
                                <p className="font-bold text-white">{date}</p>
                                <p className="text-[10px] font-bold text-[#5a648b] uppercase">
                                  {time}
                                </p>
                              </div>
                            </td>
                            <td className="p-4">
                              <ExplorerLink
                                hash={diploma.issuer}
                                type="address"
                                truncate
                                showCopy={false}
                              />
                            </td>
                            <td className="p-4">
                              {diploma.isActive ? (
                                <span className="sc-badge-success">Active</span>
                              ) : (
                                <span className="sc-badge-error">
                                  <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                                  Revoked
                                </span>
                              )}
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>

                {/* Pagination & Summary */}
                <div className="p-6 border-t border-white/5 flex items-center justify-between">
                  <p className="text-sm font-bold text-[#5a648b]">
                    Showing{' '}
                    <span className="text-white">
                      {filteredDiplomas.length}
                    </span>{' '}
                    of <span className="text-white">{diplomas.length}</span>{' '}
                    diplomas
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      className="px-5 py-2 bg-[#232948]/50 border border-white/5 rounded-xl text-sm font-bold text-[#929bc9] disabled:opacity-30 disabled:cursor-not-allowed"
                      disabled
                    >
                      Previous
                    </button>
                    <button className="px-5 py-2 bg-[#232948]/50 border border-white/5 rounded-xl text-sm font-bold text-[#929bc9] hover:text-white transition-all">
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Version Info & Last Synced */}
            <div className="mt-8 flex items-center justify-between px-2">
              <p className="text-[10px] font-bold text-[#5a648b] uppercase tracking-widest">
                Ijazah-Palsu v1.0 • Connected to Sepolia Testnet
              </p>
              <p className="text-[10px] font-bold text-[#5a648b] uppercase tracking-widest">
                {diplomas.length} records on chain
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
