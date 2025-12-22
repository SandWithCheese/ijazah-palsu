import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import {
  Search,
  Filter,
  Download,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  XCircle,
} from 'lucide-react'

export const Route = createFileRoute('/dashboard/records')({
  component: StudentRecordsPage,
})

function StudentRecordsPage() {
  const [searchTerm, setSearchTerm] = useState('')

  const students = [
    {
      id: '202300101',
      name: 'Ahmad Santoso',
      major: 'Computer Science',
      gpa: '3.92',
      status: 'minted',
      date: 'Oct 24, 2023',
    },
    {
      id: '202300142',
      name: 'Siti Putri',
      major: 'Computer Engineering',
      gpa: '3.85',
      status: 'pending',
      date: 'Oct 24, 2023',
    },
    {
      id: '202300088',
      name: 'Dian Rahmawati',
      major: 'Information Systems',
      gpa: '3.95',
      status: 'minted',
      date: 'Oct 23, 2023',
    },
    {
      id: '202300156',
      name: 'Dewi Lestari',
      major: 'Informatics',
      gpa: '3.78',
      status: 'minted',
      date: 'Oct 22, 2023',
    },
    {
      id: '202300189',
      name: 'Budi Hartono',
      major: 'Software Engineering',
      gpa: '3.65',
      status: 'rejected',
      date: 'Oct 20, 2023',
    },
    {
      id: '202300210',
      name: 'Rina Wijaya',
      major: 'Computer Science',
      gpa: '3.88',
      status: 'minted',
      date: 'Oct 18, 2023',
    },
    {
      id: '202300245',
      name: 'Toni Kurniawan',
      major: 'Information Systems',
      gpa: '3.72',
      status: 'minted',
      date: 'Oct 15, 2023',
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex-1 min-w-[300px] relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#929bc9] w-4 h-4" />
          <input
            type="text"
            placeholder="Search student by name, ID, or major..."
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
                  Major
                </th>
                <th className="p-4 text-xs font-bold text-[#929bc9] uppercase tracking-wider text-center">
                  GPA
                </th>
                <th className="p-4 text-xs font-bold text-[#929bc9] uppercase tracking-wider">
                  Issue Date
                </th>
                <th className="p-4 text-xs font-bold text-[#929bc9] uppercase tracking-wider">
                  Credential
                </th>
                <th className="p-4 text-xs font-bold text-[#929bc9] uppercase tracking-wider text-right"></th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {students.map((student, index) => (
                <tr
                  key={index}
                  className="border-b border-white/5 hover:bg-[#1c2136] transition-colors group"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500/20 to-indigo-500/20 border border-white/5 flex items-center justify-center text-xs font-bold text-sc-accent-blue shadow-inner">
                        {student.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-white font-bold">
                          {student.name}
                        </span>
                        <span className="text-[#929bc9] text-xs font-medium">
                          ID: {student.id}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-white/80 font-medium">
                      {student.major}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="bg-[#232948] text-white px-2 py-1 rounded text-xs font-mono font-bold">
                      {student.gpa}
                    </span>
                  </td>
                  <td className="p-4 text-[#929bc9] font-medium">
                    {student.date}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`sc-badge ${
                          student.status === 'minted'
                            ? 'sc-badge-success'
                            : student.status === 'pending'
                              ? 'sc-badge-warning'
                              : 'sc-badge-error'
                        }`}
                      >
                        {student.status.charAt(0).toUpperCase() +
                          student.status.slice(1)}
                      </span>
                      {student.status === 'rejected' && (
                        <XCircle className="w-3.5 h-3.5 text-red-400 opacity-50" />
                      )}
                      {student.status === 'minted' && (
                        <ShieldCheck className="w-3.5 h-3.5 text-green-400 opacity-50" />
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <button className="p-2 text-[#5a648b] hover:text-white transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-6 border-t border-white/5 bg-[#1c2136]/30 flex items-center justify-between">
          <p className="text-xs font-bold text-[#5a648b] uppercase tracking-widest">
            Showing <span className="text-white">1-7</span> of{' '}
            <span className="text-white">45</span> students
          </p>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg bg-[#232948] border border-[#323b67] text-[#929bc9] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1">
              <button className="w-8 h-8 rounded-lg bg-sc-accent-blue text-white text-xs font-bold">
                1
              </button>
              <button className="w-8 h-8 rounded-lg text-[#929bc9] hover:bg-white/5 text-xs font-bold">
                2
              </button>
              <button className="w-8 h-8 rounded-lg text-[#929bc9] hover:bg-white/5 text-xs font-bold">
                3
              </button>
            </div>
            <button className="p-2 rounded-lg bg-[#232948] border border-[#323b67] text-[#929bc9] hover:text-white">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
