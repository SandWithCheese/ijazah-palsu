import { Link, useLocation } from '@tanstack/react-router'
import { ShieldCheck, BookOpen, History, Home } from 'lucide-react'

const navLinks = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/verify', label: 'Verify', icon: ShieldCheck },
  { to: '/ledger', label: 'Public Ledger', icon: History },
]

export default function PublicNav() {
  const location = useLocation()

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <nav className="sticky top-0 z-50 bg-[#0b0e1b]/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="size-9 flex items-center justify-center bg-sc-accent-blue/20 rounded-lg border border-sc-accent-blue/30 text-sc-accent-blue group-hover:bg-sc-accent-blue/30 transition-all">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h2 className="text-white text-lg font-black tracking-tight">
              Serti-Chain
            </h2>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon
              const active = isActive(link.to)
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    active
                      ? 'bg-sc-accent-blue/10 text-white border border-sc-accent-blue/20'
                      : 'text-[#929bc9] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{link.label}</span>
                </Link>
              )
            })}
          </div>

          {/* Dashboard Link */}
          <Link
            to="/dashboard"
            className="flex items-center gap-2 h-10 px-5 bg-sc-accent-blue hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-all"
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Institution Portal</span>
          </Link>
        </div>
      </div>
    </nav>
  )
}

