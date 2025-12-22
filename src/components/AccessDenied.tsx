import { Link } from '@tanstack/react-router'
import { ShieldX, Wallet } from 'lucide-react'

interface AccessDeniedProps {
  message?: string
}

export default function AccessDenied({ message }: AccessDeniedProps) {
  return (
    <div className="min-h-screen bg-sc-bg-primary flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 rounded-full bg-sc-accent-red/10 flex items-center justify-center mx-auto mb-6">
          <ShieldX className="w-10 h-10 text-sc-accent-red" />
        </div>

        <h1 className="text-2xl font-bold text-sc-text-primary mb-4">
          Access Denied
        </h1>

        <p className="text-sc-text-secondary mb-8">
          {message ||
            'Halaman ini hanya dapat diakses oleh wallet yang teridentifikasi sebagai perwakilan institusi. Silakan hubungkan wallet institusi Anda untuk melanjutkan.'}
        </p>

        <div className="space-y-4">
          <button className="w-full sc-btn-primary py-3">
            <Wallet className="w-5 h-5" />
            Connect Institution Wallet
          </button>

          <Link to="/" className="block w-full sc-btn-outline py-3">
            Back to Home
          </Link>
        </div>

        <p className="text-xs text-sc-text-muted mt-8">
          Jika Anda adalah perwakilan institusi dan mengalami masalah, silakan
          hubungi administrator.
        </p>
      </div>
    </div>
  )
}
