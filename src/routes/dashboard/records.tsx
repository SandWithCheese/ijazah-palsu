import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import {
  Search,
  Filter,
  Download,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  XCircle,
  Loader2,
} from 'lucide-react'

export const Route = createFileRoute('/dashboard/records')({
  component: StudentRecordsPage,
})

interface DiplomaRecord {
  id: number
  studentName: string
  nim: string
  owner: string
  issuer: string
  timestamp: number
  isActive: boolean
}

function StudentRecordsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [diplomas, setDiplomas] = useState<DiplomaRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDiplomas = async () => {
      try {
        const { getAllDiplomas } = await import('../../lib/web3/contracts')
        const allDiplomas = await getAllDiplomas()
        setDiplomas(allDiplomas)
      } catch (err: any) {
        console.error('Error fetching diplomas:', err)
        setError(err.message || 'Failed to fetch diplomas')
      } finally {
        setIsLoading(false)
      }
    }

    fetchDiplomas()
  }, [])

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const filteredDiplomas = diplomas.filter((d) => {
    const search = searchTerm.toLowerCase()
    return (
      d.studentName.toLowerCase().includes(search) ||
      d.nim.toLowerCase().includes(search) ||
      d.id.toString().includes(search)
    )
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-sc-accent-blue animate-spin" />
        <span className="ml-3 text-white">
          Loading records from blockchain...
        </span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
        <XCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
        <p className="text-red-400">{error}</p>
        <p className="text-[#929bc9] text-sm mt-2">
          Make sure the contract is deployed and you're connected to the correct
          network.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex-1 min-w-[300px] relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#929bc9] w-4 h-4" />
          <input
            type="text"
            placeholder="Search student by name, NIM, or ID..."
            className="sc-input sc-input-icon w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 h-12 bg-[#232948] border border-[#323b67] text-white text-sm font-bold rounded-lg hover:bg-white/5 transition-colors">
            <Filter className="w-4 h-4 text-[#929bc9]" />
            Filters
          </button>
          <button className="flex items-center gap-2 px-4 h-12 bg-[#232948] border border-[#323b67] text-white text-sm font-bold rounded-lg hover:bg-white/5 transition-colors">
            <Download className="w-4 h-4 text-[#929bc9]" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Registry Table */}
      <div className="glass-panel rounded-xl overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-[#1c2136]">
                <th className="p-4 text-xs font-bold text-[#929bc9] uppercase tracking-wider">
                  Student
                </th>
                <th className="p-4 text-xs font-bold text-[#929bc9] uppercase tracking-wider">
                  Diploma ID
                </th>
                <th className="p-4 text-xs font-bold text-[#929bc9] uppercase tracking-wider">
                  Issue Date
                </th>
                <th className="p-4 text-xs font-bold text-[#929bc9] uppercase tracking-wider">
                  Status
                </th>
                <th className="p-4 text-xs font-bold text-[#929bc9] uppercase tracking-wider text-right"></th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filteredDiplomas.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[#929bc9]">
                    {diplomas.length === 0
                      ? 'No diplomas have been issued yet.'
                      : 'No matching records found.'}
                  </td>
                </tr>
              ) : (
                filteredDiplomas.map((diploma) => (
                  <tr
                    key={diploma.id}
                    className="border-b border-white/5 hover:bg-[#1c2136] transition-colors group"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500/20 to-indigo-500/20 border border-white/5 flex items-center justify-center text-xs font-bold text-sc-accent-blue shadow-inner">
                          {diploma.studentName
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .slice(0, 2)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-white font-bold">
                            {diploma.studentName || 'Unknown'}
                          </span>
                          <span className="text-[#929bc9] text-xs font-medium">
                            NIM: {diploma.nim || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="bg-[#232948] text-white px-2 py-1 rounded text-xs font-mono font-bold">
                        #{diploma.id}
                      </span>
                    </td>
                    <td className="p-4 text-[#929bc9] font-medium">
                      {formatDate(diploma.timestamp)}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`sc-badge ${
                            diploma.isActive
                              ? 'sc-badge-success'
                              : 'sc-badge-error'
                          }`}
                        >
                          {diploma.isActive ? 'Active' : 'Revoked'}
                        </span>
                        {diploma.isActive ? (
                          <ShieldCheck className="w-3.5 h-3.5 text-green-400 opacity-50" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-red-400 opacity-50" />
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <button className="p-2 text-[#5a648b] hover:text-white transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-6 border-t border-white/5 bg-[#1c2136]/30 flex items-center justify-between">
          <p className="text-xs font-bold text-[#5a648b] uppercase tracking-widest">
            Showing{' '}
            <span className="text-white">{filteredDiplomas.length}</span> of{' '}
            <span className="text-white">{diplomas.length}</span> diplomas
          </p>
          <div className="flex items-center gap-2">
            <button
              className="p-2 rounded-lg bg-[#232948] border border-[#323b67] text-[#929bc9] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              disabled
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 rounded-lg bg-sc-accent-blue text-white text-xs font-bold">
              1
            </button>
            <button className="p-2 rounded-lg bg-[#232948] border border-[#323b67] text-[#929bc9] hover:text-white">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
