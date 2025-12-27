import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import {
  ArrowUpRight,
  ShieldCheck,
  Award,
  BookOpen,
  Loader2,
  XCircle,
  AlertCircle,
} from 'lucide-react'

export const Route = createFileRoute('/dashboard/')({
  component: DashboardOverview,
})

interface DiplomaActivity {
  id: number
  type: 'mint' | 'revoked'
  studentName: string
  nim: string
  timestamp: number
  isActive: boolean
}

function DashboardOverview() {
  const [recentActivity, setRecentActivity] = useState<DiplomaActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDiplomas = async () => {
      try {
        const { getAllDiplomas } = await import('../../lib/web3/contracts')
        const allDiplomas = await getAllDiplomas()

        // Transform and sort by timestamp (most recent first), take top 5
        const activities: DiplomaActivity[] = allDiplomas
          .map((d) => ({
            id: d.id,
            type: d.isActive ? ('mint' as const) : ('revoked' as const),
            studentName: d.studentName || 'Unknown Student',
            nim: d.nim || 'N/A',
            timestamp: d.timestamp,
            isActive: d.isActive,
          }))
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 5)

        setRecentActivity(activities)
      } catch (err: any) {
        console.error('Error fetching diplomas:', err)
        setError(err.message || 'Failed to fetch diploma data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchDiplomas()
  }, [])

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp * 1000 // Convert to milliseconds

    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
    return `${days} day${days > 1 ? 's' : ''} ago`
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-8 glass-panel rounded-xl flex flex-col overflow-hidden">
          <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/2">
            <h2 className="text-lg font-bold text-white">Recent Activity</h2>
            <Link
              to="/dashboard/records"
              className="text-sm text-sc-accent-blue hover:text-white flex items-center gap-1 font-bold transition-colors"
            >
              View All
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="divide-y divide-white/5">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 text-sc-accent-blue animate-spin" />
                <span className="ml-3 text-[#929bc9]">
                  Loading from blockchain...
                </span>
              </div>
            ) : error ? (
              <div className="p-6 text-center">
                <XCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            ) : recentActivity.length === 0 ? (
              <div className="p-8 text-center">
                <AlertCircle className="w-8 h-8 text-[#5a648b] mx-auto mb-2" />
                <p className="text-[#929bc9]">No activity yet</p>
                <p className="text-[#5a648b] text-sm mt-1">
                  Issue your first diploma to see it here
                </p>
              </div>
            ) : (
              recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center gap-4 p-4 hover:bg-white/3 transition-colors group"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-lg ${
                      activity.isActive
                        ? 'bg-linear-to-br from-indigo-500 to-blue-600 text-white'
                        : 'bg-linear-to-br from-red-500 to-orange-600 text-white'
                    }`}
                  >
                    {activity.studentName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white">
                      {activity.studentName}
                    </p>
                    <p className="text-xs text-[#929bc9] font-medium">
                      NIM: {activity.nim} •{' '}
                      <span className="text-[#5a648b]">
                        {activity.isActive
                          ? 'Credential Minted'
                          : 'Credential Revoked'}
                      </span>
                    </p>
                  </div>

                  <div className="text-right flex flex-col items-end gap-1">
                    <span
                      className={`sc-badge ${
                        activity.isActive
                          ? 'sc-badge-success'
                          : 'sc-badge-error'
                      }`}
                    >
                      {activity.isActive ? 'Active' : 'Revoked'}
                    </span>
                    <p className="text-[10px] font-bold text-[#5a648b] uppercase tracking-wider">
                      {formatTimeAgo(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <h2 className="text-lg font-bold text-white mb-2">
            Platform Actions
          </h2>

          <Link
            to="/dashboard/mint"
            className="glass-panel p-4 rounded-xl group hover:bg-[#232948]/80 transition-all border-white/5 hover:border-sc-accent-blue/30"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-sc-accent-blue/10 flex items-center justify-center group-hover:bg-sc-accent-blue/20 transition-colors border border-sc-accent-blue/20">
                <Award className="w-6 h-6 text-sc-accent-blue" />
              </div>
              <div>
                <h3 className="font-bold text-white group-hover:text-sc-accent-blue-light transition-colors">
                  Issue Diploma
                </h3>
                <p className="text-xs font-medium text-[#929bc9]">
                  Mint new tamper-proof credentials
                </p>
              </div>
            </div>
          </Link>

          <Link
            to="/dashboard/records"
            className="glass-panel p-4 rounded-xl group hover:bg-[#232948]/80 transition-all border-white/5 hover:border-sc-accent-green/30"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors border border-green-500/20">
                <BookOpen className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h3 className="font-bold text-white group-hover:text-green-400 transition-colors">
                  Digital Registry
                </h3>
                <p className="text-xs font-medium text-[#929bc9]">
                  Manage student record database
                </p>
              </div>
            </div>
          </Link>

          <Link
            to="/dashboard/verify"
            className="glass-panel p-4 rounded-xl group hover:bg-[#232948]/80 transition-all border-white/5 hover:border-sc-accent-purple/30"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors border border-purple-500/20">
                <ShieldCheck className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="font-bold text-white group-hover:text-purple-400 transition-colors">
                  Instant Verification
                </h3>
                <p className="text-xs font-medium text-[#929bc9]">
                  Verify active credentials on-chain
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
