import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import {
  Search,
  Download,
  Filter,
  Link as LinkIcon,
  AlertTriangle,
} from 'lucide-react'

export const Route = createFileRoute('/ledger')({
  component: PublicLedgerPage,
})

function PublicLedgerPage() {
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const transactions = [
    {
      txHash: '0x71C...9A2',
      blockNo: '18,293,044',
      timestamp: 'Oct 24, 2023',
      timestampTime: '14:02:11 UTC',
      diplomaId: 'DIP-2023-8849',
      status: 'active',
    },
    {
      txHash: '0x3B2...1C4',
      blockNo: '18,293,010',
      timestamp: 'Oct 24, 2023',
      timestampTime: '13:55:04 UTC',
      diplomaId: 'DIP-2023-8848',
      status: 'active',
    },
    {
      txHash: '0x9A1...7D2',
      blockNo: '18,292,881',
      timestamp: 'Oct 24, 2023',
      timestampTime: '12:30:15 UTC',
      diplomaId: 'DIP-2022-1044',
      status: 'revoked',
    },
    {
      txHash: '0x4F5...8E1',
      blockNo: '18,292,240',
      timestamp: 'Oct 24, 2023',
      timestampTime: '10:15:55 UTC',
      diplomaId: 'DIP-2023-8847',
      status: 'active',
    },
    {
      txHash: '0x2C9...3B5',
      blockNo: '18,291,102',
      timestamp: 'Oct 24, 2023',
      timestampTime: '09:45:10 UTC',
      diplomaId: 'DIP-2023-8846',
      status: 'active',
    },
    {
      txHash: '0xD8E...9F2',
      blockNo: '18,290,050',
      timestamp: 'Oct 23, 2023',
      timestampTime: '18:22:45 UTC',
      diplomaId: 'DIP-2023-8845',
      status: 'active',
    },
  ]

  const filteredTransactions = transactions.filter((tx) => {
    const matchesFilter = filter === 'all' || tx.status === filter
    const matchesSearch =
      tx.txHash.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.diplomaId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.blockNo.includes(searchQuery)
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
                  issued and revoked on the Serti-Chain network. Verified by
                  Ethereum consensus.
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
                placeholder="Search by Transaction Hash, Block, or Diploma ID..."
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
                  All Transactions
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
                  Active Status
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
                  Revoked Status
                </button>
              </div>

              <button className="flex items-center gap-2 px-5 h-10 bg-[#232948]/50 border border-white/5 rounded-xl text-sm font-bold text-[#929bc9] hover:text-white transition-all">
                <Filter className="w-4 h-4" />
                Filter
              </button>
            </div>

            {/* Table Container */}
            <div className="glass-panel rounded-xl overflow-hidden shadow-2xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-[#1c2136]">
                    <th className="p-4 text-xs font-bold text-[#929bc9] uppercase tracking-wider">
                      Transaction Hash
                    </th>
                    <th className="p-4 text-xs font-bold text-[#929bc9] uppercase tracking-wider">
                      Block No.
                    </th>
                    <th className="p-4 text-xs font-bold text-[#929bc9] uppercase tracking-wider">
                      Timestamp (UTC)
                    </th>
                    <th className="p-4 text-xs font-bold text-[#929bc9] uppercase tracking-wider">
                      Diploma ID
                    </th>
                    <th className="p-4 text-xs font-bold text-[#929bc9] uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {filteredTransactions.map((tx, index) => (
                    <tr
                      key={index}
                      className="border-b border-white/5 hover:bg-[#1c2136] transition-colors group"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-4">
                          <div
                            className={`p-2 rounded-lg bg-[#232948] border border-white/10 group-hover:border-sc-accent-blue/30 transition-colors ${tx.status === 'revoked' ? 'text-orange-500' : 'text-sc-accent-blue'}`}
                          >
                            <LinkIcon className="w-4 h-4" />
                          </div>
                          <span
                            className={`font-mono font-medium tracking-tight ${tx.status === 'revoked' ? 'text-orange-400' : 'text-sc-accent-blue'}`}
                          >
                            {tx.txHash}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-[#929bc9] font-medium">
                        {tx.blockNo}
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="font-bold text-white">{tx.timestamp}</p>
                          <p className="text-[10px] font-bold text-[#5a648b] uppercase">
                            {tx.timestampTime}
                          </p>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-[#929bc9] font-medium">
                        {tx.diplomaId}
                      </td>
                      <td className="p-4">
                        {tx.status === 'active' ? (
                          <span className="sc-badge-success">Active</span>
                        ) : (
                          <span className="sc-badge-error">
                            <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                            Revoked
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination & Summary */}
              <div className="p-6 border-t border-white/5 flex items-center justify-between">
                <p className="text-sm font-bold text-[#5a648b]">
                  Showing <span className="text-white">1-6</span> of{' '}
                  <span className="text-white">2,840</span> transactions
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

            {/* Version Info & Last Synced */}
            <div className="mt-8 flex items-center justify-between px-2">
              <p className="text-[10px] font-bold text-[#5a648b] uppercase tracking-widest">
                Serti-Chain v2.4.0 • Connected to Ethereum Mainnet
              </p>
              <p className="text-[10px] font-bold text-[#5a648b] uppercase tracking-widest">
                Last synced: 12s ago
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
