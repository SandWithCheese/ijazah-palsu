import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowUpRight, ShieldCheck, Award, BookOpen } from 'lucide-react'

export const Route = createFileRoute('/dashboard/')({
  component: DashboardOverview,
})

function DashboardOverview() {
  const recentActivity = [
    {
      type: 'mint',
      student: 'Ahmad Santoso',
      nim: '202300101',
      time: '2 minutes ago',
      status: 'confirmed',
    },
    {
      type: 'mint',
      student: 'Siti Putri',
      nim: '202300142',
      time: '15 minutes ago',
      status: 'pending',
    },
    {
      type: 'verification',
      student: 'Dian Rahmawati',
      nim: '202300088',
      time: '1 hour ago',
      status: 'confirmed',
    },
    {
      type: 'mint',
      student: 'Dewi Lestari',
      nim: '202300156',
      time: '2 hours ago',
      status: 'confirmed',
    },
  ]

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
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 hover:bg-white/3 transition-colors group"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-lg ${
                    activity.type === 'mint'
                      ? 'bg-linear-to-br from-indigo-500 to-blue-600 text-white'
                      : 'bg-linear-to-br from-emerald-500 to-teal-600 text-white'
                  }`}
                >
                  {activity.student
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white">
                    {activity.student}
                  </p>
                  <p className="text-xs text-[#929bc9] font-medium">
                    NIM: {activity.nim} •{' '}
                    <span className="text-[#5a648b]">
                      {activity.type === 'mint'
                        ? 'Credential Minted'
                        : 'Identity Verified'}
                    </span>
                  </p>
                </div>

                <div className="text-right flex flex-col items-end gap-1">
                  <span
                    className={`sc-badge ${
                      activity.status === 'confirmed'
                        ? 'sc-badge-success'
                        : 'sc-badge-warning'
                    }`}
                  >
                    {activity.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                  </span>
                  <p className="text-[10px] font-bold text-[#5a648b] uppercase tracking-wider">
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
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
