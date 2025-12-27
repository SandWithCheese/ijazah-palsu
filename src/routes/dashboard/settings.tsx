import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import {
  UserPlus,
  UserMinus,
  Shield,
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Users,
} from 'lucide-react'
import { useWallet } from '../../hooks/useWallet'
import { ExplorerLink } from '../../components/ExplorerLink'

export const Route = createFileRoute('/dashboard/settings')({
  component: IssuerSettingsPage,
})

interface IssuerInfo {
  address: string
  isActive: boolean
}

function IssuerSettingsPage() {
  const { address } = useWallet()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [newIssuerAddress, setNewIssuerAddress] = useState('')
  const [removeIssuerAddress, setRemoveIssuerAddress] = useState('')
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [currentIssuers, setCurrentIssuers] = useState<IssuerInfo[]>([])

  // Check if current user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!address) {
        setIsLoading(false)
        return
      }

      try {
        const { isAdmin: checkAdmin } = await import('../../lib/web3/contracts')
        const adminStatus = await checkAdmin(address)
        setIsAdmin(adminStatus)
      } catch (err) {
        console.error('Failed to check admin status:', err)
        setIsAdmin(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkAdminStatus()
  }, [address])

  // Handle add issuer
  const handleAddIssuer = async () => {
    if (!newIssuerAddress || !address) return

    // Validate address format
    if (!newIssuerAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      setError('Invalid Ethereum address format')
      return
    }

    setIsProcessing(true)
    setError(null)
    setSuccess(null)

    try {
      const { addIssuer, isIssuer } = await import('../../lib/web3/contracts')

      // Check if already an issuer
      const alreadyIssuer = await isIssuer(newIssuerAddress)
      if (alreadyIssuer) {
        setError('This address is already an authorized issuer')
        setIsProcessing(false)
        return
      }

      await addIssuer(newIssuerAddress, address)
      setSuccess(
        `Successfully added ${newIssuerAddress.slice(0, 10)}... as an issuer`,
      )
      setNewIssuerAddress('')

      // Refresh issuer list
      setCurrentIssuers((prev) => [
        ...prev,
        { address: newIssuerAddress, isActive: true },
      ])
    } catch (err: any) {
      console.error('Add issuer error:', err)
      setError(err.message || 'Failed to add issuer')
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle remove issuer
  const handleRemoveIssuer = async () => {
    if (!removeIssuerAddress || !address) return

    if (!removeIssuerAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      setError('Invalid Ethereum address format')
      return
    }

    setIsProcessing(true)
    setError(null)
    setSuccess(null)

    try {
      const { removeIssuer, isIssuer } =
        await import('../../lib/web3/contracts')

      // Check if actually an issuer
      const actuallyIssuer = await isIssuer(removeIssuerAddress)
      if (!actuallyIssuer) {
        setError('This address is not currently an issuer')
        setIsProcessing(false)
        return
      }

      await removeIssuer(removeIssuerAddress, address)
      setSuccess(
        `Successfully removed ${removeIssuerAddress.slice(0, 10)}... from issuers`,
      )
      setRemoveIssuerAddress('')

      // Update issuer list
      setCurrentIssuers((prev) =>
        prev.filter(
          (i) => i.address.toLowerCase() !== removeIssuerAddress.toLowerCase(),
        ),
      )
    } catch (err: any) {
      console.error('Remove issuer error:', err)
      setError(err.message || 'Failed to remove issuer')
    } finally {
      setIsProcessing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-sc-accent-blue animate-spin" />
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="glass-panel rounded-xl p-8 text-center">
        <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-yellow-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">
          Admin Access Required
        </h2>
        <p className="text-[#929bc9] max-w-md mx-auto">
          Only the contract administrator can manage issuers. Your current
          wallet does not have admin privileges.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
          <p className="text-green-400">{success}</p>
          <button
            onClick={() => setSuccess(null)}
            className="ml-auto text-green-400 hover:text-green-300"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3">
          <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-red-400">{error}</p>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-400 hover:text-red-300"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Add Issuer Card */}
        <div className="glass-panel rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <UserPlus className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Add New Issuer</h3>
              <p className="text-[#929bc9] text-sm">
                Grant diploma issuance privileges to an address
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs text-[#929bc9] uppercase font-bold block mb-2">
                Wallet Address
              </label>
              <input
                type="text"
                value={newIssuerAddress}
                onChange={(e) => setNewIssuerAddress(e.target.value)}
                placeholder="0x..."
                className="sc-input font-mono"
                disabled={isProcessing}
              />
            </div>

            <button
              onClick={handleAddIssuer}
              disabled={isProcessing || !newIssuerAddress}
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Add Issuer
                </>
              )}
            </button>
          </div>
        </div>

        {/* Remove Issuer Card */}
        <div className="glass-panel rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <UserMinus className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Remove Issuer</h3>
              <p className="text-[#929bc9] text-sm">
                Revoke diploma issuance privileges from an address
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs text-[#929bc9] uppercase font-bold block mb-2">
                Wallet Address
              </label>
              <input
                type="text"
                value={removeIssuerAddress}
                onChange={(e) => setRemoveIssuerAddress(e.target.value)}
                placeholder="0x..."
                className="sc-input font-mono"
                disabled={isProcessing}
              />
            </div>

            <button
              onClick={handleRemoveIssuer}
              disabled={isProcessing || !removeIssuerAddress}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <UserMinus className="w-4 h-4" />
                  Remove Issuer
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Current Admin Info */}
      <div className="glass-panel rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-5 h-5 text-sc-accent-blue" />
          <h3 className="text-lg font-bold text-white">Your Privileges</h3>
        </div>

        <div className="bg-[#1c2237] rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[#929bc9] uppercase font-bold mb-1">
                Admin Address
              </p>
              <ExplorerLink hash={address || ''} type="address" truncate />
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded-full">
                Admin
              </span>
              <span className="px-3 py-1 bg-sc-accent-blue/20 text-sc-accent-blue text-xs font-bold rounded-full">
                Issuer
              </span>
            </div>
          </div>
        </div>

        <p className="text-[#5a648b] text-xs mt-4">
          As the contract admin, you can add or remove issuers. The admin role
          is set during contract deployment and cannot be changed.
        </p>
      </div>

      {/* Recently Added Issuers */}
      {currentIssuers.length > 0 && (
        <div className="glass-panel rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-5 h-5 text-[#F5D061]" />
            <h3 className="text-lg font-bold text-white">
              Recently Added Issuers
            </h3>
          </div>

          <div className="space-y-2">
            {currentIssuers.map((issuer) => (
              <div
                key={issuer.address}
                className="bg-[#1c2237] rounded-lg p-3 flex items-center justify-between"
              >
                <ExplorerLink hash={issuer.address} type="address" />
                <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded">
                  Active
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
