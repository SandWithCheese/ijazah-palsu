import { Link, useLocation } from '@tanstack/react-router'
import {
  LayoutDashboard,
  Award,
  BookOpen,
  ShieldCheck,
  Box,
  XCircle,
} from 'lucide-react'

const mainLinks = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
  { to: '/dashboard/mint', label: 'Issue Diploma', icon: Award },
  { to: '/dashboard/revoke', label: 'Revoke Diploma', icon: XCircle },
  { to: '/dashboard/records', label: 'Student Records', icon: BookOpen },
  { to: '/dashboard/verify', label: 'Verification', icon: ShieldCheck },
]

export default function Sidebar() {
  const location = useLocation()

  const isActive = (path: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === path
    }
    return (
      location.pathname.startsWith(path) &&
      (path !== '/dashboard' || location.pathname === '/dashboard')
    )
  }

  return (
    <aside className="w-72 shrink-0 border-r border-white/5 bg-[#111422] flex flex-col justify-between p-4 h-full fixed left-0 top-0 z-50">
      <div className="flex flex-col gap-8">
        {/* Branding - Clickable to Landing Page */}
        <Link to="/" className="flex gap-3 items-center px-2 group">
          <div className="bg-sc-accent-blue/20 rounded-full h-10 w-10 flex items-center justify-center border border-sc-accent-blue/30 group-hover:bg-sc-accent-blue/30 transition-colors">
            <Box className="text-sc-accent-blue w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-white text-lg font-bold leading-tight tracking-tight group-hover:text-sc-accent-blue transition-colors">
              Serti-Chain
            </h1>
            <p className="text-[#929bc9] text-xs font-normal">
              Institution Portal
            </p>
          </div>
        </Link>

        {/* Navigation Menu */}
        <nav className="flex flex-col gap-2">
          {mainLinks.map((link) => {
            const Icon = link.icon
            const active = isActive(link.to, link.exact)
            return (
              <Link
                key={link.to}
                to={link.to}
                className={
                  active ? 'sc-sidebar-link-active' : 'sc-sidebar-link group'
                }
              >
                <Icon
                  className={`w-5 h-5 ${active ? 'text-sc-accent-blue' : 'text-[#929bc9] group-hover:text-white'}`}
                />
                <span>{link.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
