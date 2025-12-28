import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useMemo } from 'react'
import {
  Search,
  Download,
  Filter,
  Link as LinkIcon,
  AlertTriangle,
  Loader2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from 'lucide-react'
import { ExplorerLink } from '../components/ExplorerLink'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '../components/ui/dropdown-menu'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../components/ui/popover'
import PublicNav from '../components/PublicNav'

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

const ITEMS_PER_PAGE = 10

function PublicLedgerPage() {
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [diplomas, setDiplomas] = useState<DiplomaEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  // Advanced filter states
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

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

  // Filter and search logic
  const filteredDiplomas = useMemo(() => {
    let result = diplomas.filter((d) => {
      const matchesFilter =
        filter === 'all' ||
        (filter === 'active' && d.isActive) ||
        (filter === 'revoked' && !d.isActive)

      const search = searchQuery.toLowerCase()
      const matchesSearch =
        d.id.toString().includes(search) ||
        d.studentName.toLowerCase().includes(search) ||
        d.nim.toLowerCase().includes(search)

      // Date filter
      let matchesDate = true
      if (dateFrom) {
        const fromTimestamp = new Date(dateFrom).getTime() / 1000
        matchesDate = matchesDate && d.timestamp >= fromTimestamp
      }
      if (dateTo) {
        const toTimestamp = new Date(dateTo).getTime() / 1000 + 86400 // Include full day
        matchesDate = matchesDate && d.timestamp <= toTimestamp
      }

      return matchesFilter && matchesSearch && matchesDate
    })

    // Sort
    result.sort((a, b) => {
      if (sortOrder === 'newest') {
        return b.timestamp - a.timestamp
      }
      return a.timestamp - b.timestamp
    })

    return result
  }, [diplomas, filter, searchQuery, sortOrder, dateFrom, dateTo])

  // Pagination
  const totalPages = Math.ceil(filteredDiplomas.length / ITEMS_PER_PAGE)
  const paginatedDiplomas = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredDiplomas.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredDiplomas, currentPage])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filter, searchQuery, sortOrder, dateFrom, dateTo])

  // Export CSV function
  const exportToCSV = () => {
    const headers = [
      'Diploma ID',
      'Student Name',
      'NIM',
      'Owner Address',
      'Issuer Address',
      'Issue Date',
      'Issue Time (UTC)',
      'Status',
      'CID',
    ]

    const rows = filteredDiplomas.map((d) => {
      const { date, time } = formatDate(d.timestamp)
      return [
        d.id,
        d.studentName,
        d.nim,
        d.owner,
        d.issuer,
        date,
        time,
        d.isActive ? 'Active' : 'Revoked',
        d.cid,
      ]
    })

    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','),
      ),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute(
      'download',
      `public-ledger-${new Date().toISOString().split('T')[0]}.csv`,
    )
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Clear date filter
  const clearDateFilter = () => {
    setDateFrom('')
    setDateTo('')
  }

  // Check if any advanced filter is active
  const hasAdvancedFilter = dateFrom || dateTo || sortOrder !== 'newest'

  // Generate page numbers
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages)
      }
    }
    return pages
  }

  return (
    <div className="flex flex-col min-h-screen bg-background-dark font-display text-white antialiased overflow-hidden">
      {/* Navigation */}
      <PublicNav />

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
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
              <button
                onClick={exportToCSV}
                disabled={filteredDiplomas.length === 0}
                className="sc-btn-primary h-12 px-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
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

              {/* Advanced Filter Dropdown */}
              <Popover>
                <PopoverTrigger asChild>
                  <button className="flex items-center gap-2 px-5 h-10 bg-[#232948]/50 border border-white/5 rounded-xl text-sm font-bold text-[#929bc9] hover:text-white transition-all">
                    <Filter className="w-4 h-4" />
                    Filter
                    {hasAdvancedFilter && (
                      <span className="w-2 h-2 bg-sc-accent-blue rounded-full" />
                    )}
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  align="end"
                  className="w-72 bg-[#1c2136] border-[#323b67] p-4"
                >
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="text-xs font-bold text-[#929bc9] uppercase tracking-wider mb-2 block">
                        Sort Order
                      </label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSortOrder('newest')}
                          className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold transition-all ${
                            sortOrder === 'newest'
                              ? 'bg-sc-accent-blue text-white'
                              : 'bg-[#232948] text-[#929bc9] hover:text-white'
                          }`}
                        >
                          Newest
                        </button>
                        <button
                          onClick={() => setSortOrder('oldest')}
                          className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold transition-all ${
                            sortOrder === 'oldest'
                              ? 'bg-sc-accent-blue text-white'
                              : 'bg-[#232948] text-[#929bc9] hover:text-white'
                          }`}
                        >
                          Oldest
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#929bc9] uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        Date Range
                      </label>
                      <div className="flex flex-col gap-2">
                        <input
                          type="date"
                          value={dateFrom}
                          onChange={(e) => setDateFrom(e.target.value)}
                          className="w-full bg-[#232948] border border-[#323b67] rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-sc-accent-blue focus:border-transparent outline-none"
                          placeholder="From"
                        />
                        <input
                          type="date"
                          value={dateTo}
                          onChange={(e) => setDateTo(e.target.value)}
                          className="w-full bg-[#232948] border border-[#323b67] rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-sc-accent-blue focus:border-transparent outline-none"
                          placeholder="To"
                        />
                      </div>
                    </div>

                    {(dateFrom || dateTo) && (
                      <button
                        onClick={clearDateFilter}
                        className="w-full py-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold rounded-lg hover:bg-red-500/20 transition-all"
                      >
                        Clear Date Filter
                      </button>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
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
                    {paginatedDiplomas.length === 0 ? (
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
                      paginatedDiplomas.map((diploma) => {
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
                      {filteredDiplomas.length > 0
                        ? Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredDiplomas.length)
                        : 0}
                    </span>{' '}
                    -{' '}
                    <span className="text-white">
                      {Math.min(currentPage * ITEMS_PER_PAGE, filteredDiplomas.length)}
                    </span>{' '}
                    of <span className="text-white">{filteredDiplomas.length}</span>{' '}
                    diplomas
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-5 py-2 bg-[#232948]/50 border border-white/5 rounded-xl text-sm font-bold text-[#929bc9] disabled:opacity-30 disabled:cursor-not-allowed hover:text-white transition-all"
                    >
                      Previous
                    </button>

                    <div className="flex items-center gap-1">
                      {getPageNumbers().map((page, index) =>
                        typeof page === 'number' ? (
                          <button
                            key={index}
                            onClick={() => setCurrentPage(page)}
                            className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${
                              currentPage === page
                                ? 'bg-sc-accent-blue text-white'
                                : 'bg-[#232948]/50 border border-white/5 text-[#929bc9] hover:text-white'
                            }`}
                          >
                            {page}
                          </button>
                        ) : (
                          <span key={index} className="text-[#5a648b] px-1">
                            ...
                          </span>
                        ),
                      )}
                    </div>

                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages || totalPages === 0}
                      className="px-5 py-2 bg-[#232948]/50 border border-white/5 rounded-xl text-sm font-bold text-[#929bc9] hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
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
