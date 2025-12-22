import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import {
  Search,
  QrCode,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
} from 'lucide-react'

export const Route = createFileRoute('/dashboard/verify')({
  component: DashboardVerifyPage,
})

function DashboardVerifyPage() {
  const [activeTab, setActiveTab] = useState<'id' | 'qr'>('id')

  return (
    <div className="flex flex-col gap-8">
      {/* Action Area */}
      <div className="glass-panel p-8 my-12 md:p-12 rounded-2xl relative overflow-hidden">
        {/* Background Decorative */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-sc-accent-blue/5 blur-[80px] rounded-full pointer-events-none"></div>

        <div className="max-w-2xl mx-auto flex flex-col gap-8 relative z-10">
          <div className="text-center flex flex-col gap-2">
            <h2 className="text-2xl font-black text-white">
              {activeTab === 'id' ? 'Verify via Search' : 'Verify via Scanner'}
            </h2>
            <p className="text-[#929bc9] font-medium">
              Verify credentials across the global Serti-Chain ecosystem
              instantly.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 shrink-0">
                {activeTab === 'id' ? (
                  <ShieldCheck className="w-5 h-5 text-sc-accent-blue" />
                ) : (
                  <QrCode className="w-5 h-5 text-sc-accent-blue" />
                )}
              </div>
              <input
                type="text"
                className="sc-input sc-input-icon h-14 w-full"
                placeholder={
                  activeTab === 'id'
                    ? 'Enter Diploma ID (e.g., 0x7a...)'
                    : 'Scan interface placeholder...'
                }
              />
              <button className="absolute right-2 top-2 h-10 px-4 bg-sc-accent-blue hover:bg-blue-700 text-white font-bold rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-blue-900/40">
                Verify
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <p className="text-center text-[10px] text-[#5a648b] font-black uppercase tracking-widest">
              Direct connection to Mainnet & Sepolia verification nodes
            </p>
          </div>
        </div>
      </div>

      {/* Verify Methods */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* ID Search Method */}
        <div
          className={`glass-panel p-8 rounded-2xl border transition-all cursor-pointer group ${
            activeTab === 'id'
              ? 'border-sc-accent-blue bg-sc-accent-blue/5 shadow-2xl shadow-blue-900/10'
              : 'border-white/5 hover:border-white/10'
          }`}
          onClick={() => setActiveTab('id')}
        >
          <div className="flex flex-col gap-6">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                activeTab === 'id'
                  ? 'bg-sc-accent-blue text-white shadow-lg shadow-blue-900/40'
                  : 'bg-[#232948] text-[#929bc9]'
              }`}
            >
              <Search className="w-7 h-7" />
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-xl font-black text-white">ID Verification</h3>
              <p className="text-[#929bc9] text-sm font-medium leading-relaxed">
                Manually enter a student credential ID or transaction hash to
                verify identity.
              </p>
            </div>
            <div
              className={`mt-2 flex items-center gap-2 font-bold text-sm ${
                activeTab === 'id' ? 'text-sc-accent-blue' : 'text-[#5a648b]'
              }`}
            >
              {activeTab === 'id' ? 'Active Method' : 'Select Method'}
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* QR Scan Method */}
        <div
          className={`glass-panel p-8 rounded-2xl border transition-all cursor-pointer group ${
            activeTab === 'qr'
              ? 'border-sc-accent-blue bg-sc-accent-blue/5 shadow-2xl shadow-blue-900/10'
              : 'border-white/5 hover:border-white/10'
          }`}
          onClick={() => setActiveTab('qr')}
        >
          <div className="flex flex-col gap-6">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                activeTab === 'qr'
                  ? 'bg-sc-accent-blue text-white shadow-lg shadow-blue-900/40'
                  : 'bg-[#232948] text-[#929bc9]'
              }`}
            >
              <QrCode className="w-7 h-7" />
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-xl font-black text-white">QR Code Scan</h3>
              <p className="text-[#929bc9] text-sm font-medium leading-relaxed">
                Scan the QR code printed on physical diplomas for instant
                digital validation.
              </p>
            </div>
            <div
              className={`mt-2 flex items-center gap-2 font-bold text-sm ${
                activeTab === 'qr' ? 'text-sc-accent-blue' : 'text-[#5a648b]'
              }`}
            >
              {activeTab === 'qr' ? 'Active Method' : 'Select Method'}
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
