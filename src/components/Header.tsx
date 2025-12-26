import { Link } from '@tanstack/react-router'
import { ShieldCheck, Wallet, LogOut, AlertTriangle } from 'lucide-react'
import { useWallet } from '../hooks/useWallet'

export default function Header() {
  const {
    address,
    isConnected,
    isLoading,
    isCorrectNetwork,
    connect,
    disconnect,
    switchNetwork,
    error,
  } = useWallet()

  const formatAddress = (addr: string | null) => {
    if (!addr) return 'Connect Wallet'
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const handleConnectClick = async () => {
    if (isConnected) {
      disconnect()
    } else {
      await connect()
    }
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

          {/* Wallet Section */}
          <div className="flex items-center gap-3">
            {/* Network Warning */}
            {isConnected && !isCorrectNetwork && (
              <button
                onClick={switchNetwork}
                className="flex items-center gap-2 h-10 px-4 bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 rounded-lg text-sm font-bold hover:bg-yellow-500/30 transition-all"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Wrong Network</span>
              </button>
            )}

            {/* Connect/Disconnect Button */}
            {isConnected ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/dashboard"
                  className="flex items-center justify-center gap-2 h-10 px-5 bg-sc-accent-blue hover:bg-blue-700 active:scale-95 transition-all rounded-lg text-white text-sm font-black"
                >
                  <Wallet className="w-4 h-4" />
                  <span>{formatAddress(address)}</span>
                </Link>
                <button
                  onClick={disconnect}
                  className="flex items-center justify-center h-10 w-10 bg-white/5 hover:bg-red-500/20 border border-white/10 rounded-lg text-[#929bc9] hover:text-red-400 transition-all"
                  title="Disconnect Wallet"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnectClick}
                disabled={isLoading}
                className="group flex items-center justify-center gap-2 h-10 px-5 bg-sc-accent-blue hover:bg-blue-700 active:scale-95 transition-all rounded-lg text-white text-sm font-black shadow-[0_0_15px_rgba(19,55,236,0.3)] hover:shadow-[0_0_25px_rgba(19,55,236,0.5)] disabled:opacity-50"
              >
                <Wallet className="w-4 h-4" />
                <span>{isLoading ? 'Connecting...' : 'Connect Wallet'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="pb-4">
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
              {error}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
