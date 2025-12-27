import { createFileRoute, Outlet, useLocation } from '@tanstack/react-router'
import DashboardLayout from '../components/DashboardLayout'
import AccessDenied from '../components/AccessDenied'
import { useInstitutionAccess, useWallet } from '../hooks/useWallet'
import { Loader2, KeyRound, Wallet } from 'lucide-react'

export const Route = createFileRoute('/dashboard')({
  component: DashboardRoute,
})

// Page titles configuration
const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': {
    title: 'Dashboard Overview',
    subtitle: "Welcome back! Here's what's happening with your institution.",
  },
  '/dashboard/mint': {
    title: 'Issue New Credential',
    subtitle: 'Securely upload and mint digital diplomas to the blockchain.',
  },
  '/dashboard/records': {
    title: 'Student Records',
    subtitle: 'Manage and view all student diploma records.',
  },
  '/dashboard/revoke': {
    title: 'Revoke Credential',
    subtitle: 'Revoke previously issued diplomas with documented reason.',
  },
  '/dashboard/verify': {
    title: 'Verification',
    subtitle:
      'Verify the authenticity of diploma credentials on the blockchain.',
  },
  '/dashboard/settings': {
    title: 'Issuer Settings',
    subtitle: 'Manage authorized issuers and system configuration.',
  },
}

function DashboardRoute() {
  const location = useLocation()
  const pageConfig = pageTitles[location.pathname] || {
    title: '',
    subtitle: '',
  }

  // Access control is now ENABLED (PRD F-01 compliance)
  const bypassAccessControl = false

  // Access control check - now includes authentication
  const { isLoading, isConnected, isAuthenticated, isInstitution } =
    useInstitutionAccess()
  const { connect, authenticate, error } = useWallet()

  // Show loading state
  if (isLoading && !bypassAccessControl) {
    return (
      <div className="min-h-screen bg-sc-bg-primary flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-sc-accent-blue animate-spin mx-auto mb-4" />
          <p className="text-sc-text-secondary">Checking access...</p>
        </div>
      </div>
    )
  }

  // Step 1: Not connected - show connect prompt
  if (!isConnected && !bypassAccessControl) {
    return (
      <div className="min-h-screen bg-[#0d0f1a] flex items-center justify-center p-4">
        <div className="glass-panel max-w-md w-full p-8 rounded-2xl border border-white/10 text-center">
          <div className="w-16 h-16 bg-sc-accent-blue/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Wallet className="w-8 h-8 text-sc-accent-blue" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Connect Your Wallet
          </h2>
          <p className="text-[#929bc9] mb-6">
            Connect your wallet to access the admin dashboard.
          </p>
          <button
            onClick={connect}
            className="w-full py-3 bg-sc-accent-blue hover:bg-blue-700 text-white font-bold rounded-xl transition-colors"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    )
  }

  // Step 2: Connected but not authenticated - show nonce challenge
  if (isConnected && !isAuthenticated && !bypassAccessControl) {
    return (
      <div className="min-h-screen bg-[#0d0f1a] flex items-center justify-center p-4">
        <div className="glass-panel max-w-md w-full p-8 rounded-2xl border border-white/10 text-center">
          <div className="w-16 h-16 bg-[#F5D061]/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <KeyRound className="w-8 h-8 text-[#F5D061]" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Verify Your Identity
          </h2>
          <p className="text-[#929bc9] mb-6">
            Sign a message with your wallet to prove ownership and access the
            dashboard.
          </p>
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4 text-red-400 text-sm">
              {error}
            </div>
          )}
          <button
            onClick={authenticate}
            className="w-full py-3 bg-[#F5D061] hover:bg-yellow-500 text-black font-bold rounded-xl transition-colors"
          >
            Sign Message to Authenticate
          </button>
          <p className="text-[#5a648b] text-xs mt-4">
            This signature proves you own this wallet. No gas fees required.
          </p>
        </div>
      </div>
    )
  }

  // Step 3: Authenticated but not issuer - access denied
  if (isAuthenticated && !isInstitution && !bypassAccessControl) {
    return <AccessDenied />
  }

  // All checks passed or bypassed - show dashboard
  return (
    <DashboardLayout title={pageConfig.title} subtitle={pageConfig.subtitle}>
      <Outlet />
    </DashboardLayout>
  )
}
