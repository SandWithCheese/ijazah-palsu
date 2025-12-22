import { createFileRoute, Outlet, useLocation } from '@tanstack/react-router'
import DashboardLayout from '../components/DashboardLayout'
import AccessDenied from '../components/AccessDenied'
import { useInstitutionAccess } from '../hooks/useWallet'
import { Loader2 } from 'lucide-react'

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
  '/dashboard/verify': {
    title: 'Verification',
    subtitle:
      'Verify the authenticity of diploma credentials on the blockchain.',
  },
}

function DashboardRoute() {
  const location = useLocation()
  const pageConfig = pageTitles[location.pathname] || {
    title: '',
    subtitle: '',
  }

  // Untuk sementara, akses selalu diberikan (development mode)
  // Ubah ke false untuk mengaktifkan pengecekan akses
  const bypassAccessControl = true

  // Access control check
  const { hasAccess, isLoading } = useInstitutionAccess()

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

  // Show access denied if not authorized
  if (!hasAccess && !bypassAccessControl) {
    return <AccessDenied />
  }

  return (
    <DashboardLayout title={pageConfig.title} subtitle={pageConfig.subtitle}>
      <Outlet />
    </DashboardLayout>
  )
}
