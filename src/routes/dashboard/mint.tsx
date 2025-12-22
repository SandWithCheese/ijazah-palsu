import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
import {
  User,
  Badge,
  Link as LinkIcon,
  CheckCircle,
  Circle,
  Info,
  CloudUpload,
  FileText,
  X,
} from 'lucide-react'

export const Route = createFileRoute('/dashboard/mint')({
  component: MintDiplomaPage,
})

function MintDiplomaPage() {
  const [studentName, setStudentName] = useState('')
  const [nim, setNim] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null)
      return
    }

    const url = URL.createObjectURL(file)
    setPreviewUrl(url)

    return () => URL.revokeObjectURL(url)
  }, [file])

  const checklistItems = [
    {
      label: 'Wallet Connected',
      description: 'Ready to sign transaction',
      completed: true,
    },
    {
      label: 'PDF Validated',
      description: file ? 'Document verified' : 'Waiting for upload...',
      completed: !!file,
    },
    {
      label: 'Data Integrity Check',
      description:
        studentName && nim ? 'All fields valid' : 'Waiting for input...',
      completed: !!(studentName && nim),
    },
  ]

  return (
    <div className="flex flex-col gap-8">
      {/* Minting Workflow Section */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column: Upload & Form */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="glass-panel rounded-xl p-6 flex flex-col gap-6">
            <div className="flex items-center gap-2 border-b border-white/5 pb-4 mb-2">
              <span className="text-sc-accent-blue material-symbols-outlined">
                description
              </span>
              <h3 className="text-lg font-bold text-white">
                Credential Details
              </h3>
            </div>

            {/* Upload Area */}
            <div
              className="sc-upload group"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                accept=".pdf"
                ref={fileInputRef}
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <div className="h-12 w-12 rounded-full bg-[#232948] flex items-center justify-center group-hover:bg-sc-accent-blue/20 transition-colors">
                <CloudUpload className="text-white group-hover:text-sc-accent-blue transition-colors w-6 h-6" />
              </div>
              <div className="flex flex-col items-center gap-1 text-center">
                <p className="text-white text-base font-bold">
                  {file ? file.name : 'Upload Diploma PDF'}
                </p>
                <p className="text-[#929bc9] text-sm">
                  Drag and drop your signed PDF file here, or click to browse.
                </p>
              </div>
              <button className="mt-2 px-4 py-2 bg-[#232948] text-white text-xs font-bold rounded-lg hover:bg-[#2e365c] transition-colors">
                {file ? 'Change File' : 'Select File'}
              </button>
            </div>

            {/* Input Fields */}
            <div className="grid md:grid-cols-2 gap-5">
              <label className="flex flex-col gap-2">
                <span className="text-[#929bc9] text-xs font-bold uppercase tracking-wider ml-1">
                  Student Full Name
                </span>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#929bc9] w-5 h-5 pointer-events-none" />
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="e.g., Jane Doe"
                    className="sc-input sc-input-icon"
                  />
                </div>
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-[#929bc9] text-xs font-bold uppercase tracking-wider ml-1">
                  NIM (Student ID)
                </span>
                <div className="relative">
                  <Badge className="absolute left-4 top-1/2 -translate-y-1/2 text-[#929bc9] w-5 h-5 pointer-events-none" />
                  <input
                    type="text"
                    value={nim}
                    onChange={(e) => setNim(e.target.value)}
                    placeholder="e.g., 202400159"
                    className="sc-input sc-input-icon"
                  />
                </div>
              </label>
            </div>

            {/* Action Button */}
            <div className="pt-2">
              <button
                className="w-full h-14 bg-sc-accent-blue hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 flex items-center justify-center gap-3 transition-all transform active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!file || !studentName || !nim}
              >
                <LinkIcon className="w-5 h-5" />
                <span>Mint to Blockchain</span>
              </button>
            </div>

            {/* PDF Preview Area */}
            {file && previewUrl && (
              <div className="mt-4 pt-6 border-t border-white/5 flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="text-sc-accent-blue w-5 h-5" />
                    <h3 className="text-base font-bold text-white">
                      Document Preview
                    </h3>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setFile(null)
                    }}
                    className="p-2 hover:bg-white/5 rounded-lg text-[#929bc9] hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="aspect-4/5 w-full bg-[#111422] rounded-lg overflow-hidden border border-white/5 relative">
                  <iframe
                    src={`${previewUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                    className="w-full h-full border-none"
                    title="PDF Preview"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Checklist */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="glass-panel rounded-xl p-6 h-full flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-white/5 pb-4">
              <Info className="text-sc-accent-yellow w-5 h-5" />
              <h3 className="text-lg font-bold text-white">
                Pre-Mint Checklist
              </h3>
            </div>

            <div className="flex flex-col gap-3">
              {checklistItems.map((item, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
                    item.completed
                      ? 'bg-green-500/10 border-green-500/20'
                      : 'bg-[#232948]/50 border-white/5'
                  }`}
                >
                  {item.completed ? (
                    <CheckCircle className="text-green-400 w-4 h-4 mt-1" />
                  ) : (
                    <Circle className="text-[#929bc9] w-4 h-4 mt-1" />
                  )}
                  <div className="flex flex-col">
                    <span
                      className={`text-sm font-semibold ${item.completed ? 'text-white' : 'text-[#929bc9]'}`}
                    >
                      {item.label}
                    </span>
                    <span
                      className={`text-xs ${item.completed ? 'text-white/60' : 'text-[#929bc9]/60'}`}
                    >
                      {item.description}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-auto bg-linear-to-br from-[#1c2237] to-[#111422] rounded-lg p-4 border border-white/5">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-[#929bc9] uppercase font-bold">
                  Gas Estimation
                </span>
                <span className="text-xs text-white font-mono">~0.002 ETH</span>
              </div>
              <div className="w-full bg-[#111422] rounded-full h-1.5">
                <div
                  className="bg-sc-accent-blue h-1.5 rounded-full shadow-[0_0_8px_rgba(19,55,236,0.5)]"
                  style={{ width: '66.6%' }}
                ></div>
              </div>
              <p className="text-[10px] text-[#929bc9] mt-2 text-right">
                Network Status: <span className="text-green-400">Stable</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
