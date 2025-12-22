import { Link } from '@tanstack/react-router'
import { ShieldCheck, Wallet } from 'lucide-react'
import { useWallet } from '../hooks/useWallet'

export default function Header() {
  const { address, isConnected } = useWallet()

  const formatAddress = (addr: string | null) => {
    if (!addr) return 'Connect Wallet'
    return `${addr.slice(0, 4)}...${addr.slice(-2)}`
  }

  return (
    <header className="sticky top-0 z-50 glass-panel border-b-0 border-b-white/5">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="size-10 flex items-center justify-center bg-sc-accent-blue/20 rounded-lg border border-sc-accent-blue/30 text-sc-accent-blue group-hover:bg-sc-accent-blue/30 transition-all">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-white text-xl font-black tracking-tight">
              Serti-Chain
            </h2>
          </Link>

          {/* Connect Wallet Button */}
          <div className="flex items-center">
            <Link
              to="/dashboard"
              className="group flex items-center justify-center gap-2 h-10 px-5 bg-sc-accent-blue hover:bg-blue-700 active:scale-95 transition-all rounded-lg text-white text-sm font-black shadow-[0_0_15px_rgba(19,55,236,0.3)] hover:shadow-[0_0_25px_rgba(19,55,236,0.5)]"
            >
              <Wallet className="w-4 h-4" />
              <span>
                {isConnected ? formatAddress(address) : 'Connect Wallet'}
              </span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
