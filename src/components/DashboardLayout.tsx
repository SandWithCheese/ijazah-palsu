import { ChevronDown, Lock, AlertTriangle, Wallet } from 'lucide-react'
import Sidebar from './Sidebar'
import { useWallet } from '../hooks/useWallet'

interface DashboardLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
}

export default function DashboardLayout({
  children,
  title,
  subtitle,
}: DashboardLayoutProps) {
  const {
    address,
    isConnected,
    isIssuer,
    isCorrectNetwork,
    connect,
    switchNetwork,
  } = useWallet()

  const formatAddress = (addr: string | null) => {
    if (!addr) return 'Not Connected'
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return (
    <div className="flex h-screen w-full bg-background-dark font-display text-white antialiased overflow-hidden">
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-background-dark relative ml-72">
        {/* Background Gradient Decorations */}
        <div className="absolute top-0 left-0 w-full h-96 bg-linear-to-b from-[#1337ec]/10 to-transparent pointer-events-none"></div>

        {/* Header */}
        <header className="shrink-0 px-8 py-6 flex flex-wrap justify-between items-center gap-4 z-10 border-b border-white/5 bg-[#101322]/80 backdrop-blur-sm">
          <div className="flex flex-col gap-1">
            <h2 className="text-white text-3xl font-black leading-tight tracking-tight">
              {title}
            </h2>
            <p className="text-[#929bc9] text-sm font-normal">{subtitle}</p>
          </div>

          <div className="flex items-center gap-4">
            {/* Network Warning */}
            {isConnected && !isCorrectNetwork && (
              <button
                onClick={switchNetwork}
                className="flex items-center gap-2 px-4 h-10 rounded-lg bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 text-sm font-bold hover:bg-yellow-500/30 transition-colors"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Wrong Network - Click to switch</span>
              </button>
            )}

            {/* Wallet Connection Status */}
            {isConnected ? (
              <div className="flex items-center gap-2 px-4 h-10 rounded-lg bg-[#232948] border border-[#323b67] text-white text-sm font-bold">
                <Lock className="text-green-400 w-[18px] h-[18px]" />
                <span className="truncate">{formatAddress(address)}</span>
                {isIssuer && (
                  <span className="ml-2 px-2 py-0.5 rounded text-xs bg-green-500/20 text-green-400 border border-green-500/30">
                    Issuer
                  </span>
                )}
              </div>
            ) : (
              <button
                onClick={connect}
                className="flex items-center gap-2 px-4 h-10 rounded-lg bg-sc-accent-blue hover:bg-blue-700 text-white text-sm font-bold transition-colors"
              >
                <Wallet className="w-4 h-4" />
                <span>Connect Wallet</span>
              </button>
            )}

            <div className="h-10 w-10 rounded-full border-2 border-[#232948] bg-cover bg-center overflow-hidden">
              <img
                src={`https://api.dicebear.com/7.x/identicon/svg?seed=${address || 'guest'}`}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 z-0">
          <div className="max-w-[1200px] mx-auto">{children}</div>
        </div>
      </main>
    </div>
  )
}
