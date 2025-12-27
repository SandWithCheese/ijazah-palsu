import { ExternalLink, Copy, Check } from 'lucide-react'
import { useState } from 'react'

interface ExplorerLinkProps {
  hash: string
  type?: 'tx' | 'address' | 'block' | 'token'
  label?: string
  showCopy?: boolean
  truncate?: boolean
  className?: string
}

/**
 * Get the explorer URL based on environment configuration
 * Defaults to Sepolia Etherscan
 */
function getExplorerUrl(): string {
  if (typeof window !== 'undefined') {
    // Check for environment variable
    const envUrl = (window as any).__ENV__?.NEXT_PUBLIC_EXPLORER_URL
    if (envUrl) return envUrl
  }

  // Default to Sepolia Etherscan
  return 'https://sepolia.etherscan.io'
}

/**
 * Build full explorer URL for a given hash/address
 */
function buildExplorerUrl(
  hash: string,
  type: 'tx' | 'address' | 'block' | 'token',
): string {
  const baseUrl = getExplorerUrl()

  switch (type) {
    case 'tx':
      return `${baseUrl}/tx/${hash}`
    case 'address':
      return `${baseUrl}/address/${hash}`
    case 'block':
      return `${baseUrl}/block/${hash}`
    case 'token':
      return `${baseUrl}/token/${hash}`
    default:
      return `${baseUrl}/tx/${hash}`
  }
}

/**
 * Truncate a hash/address for display
 */
function truncateHash(hash: string, chars: number = 6): string {
  if (!hash) return ''
  if (hash.length <= chars * 2 + 2) return hash
  return `${hash.slice(0, chars + 2)}...${hash.slice(-chars)}`
}

/**
 * ExplorerLink Component
 *
 * Displays a hash/address with a link to blockchain explorer
 * and optional copy functionality.
 *
 * Implements PRD F-05: Integration with Blockchain Explorer
 */
export function ExplorerLink({
  hash,
  type = 'tx',
  label,
  showCopy = true,
  truncate = true,
  className = '',
}: ExplorerLinkProps) {
  const [copied, setCopied] = useState(false)

  const displayText = label || (truncate ? truncateHash(hash) : hash)
  const explorerUrl = buildExplorerUrl(hash, type)

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      await navigator.clipboard.writeText(hash)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <a
        href={explorerUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-sc-accent-blue hover:text-blue-400 transition-colors font-mono text-sm"
        title={`View on ${getExplorerUrl().includes('etherscan') ? 'Etherscan' : 'Explorer'}`}
      >
        <span>{displayText}</span>
        <ExternalLink className="w-3 h-3 flex-shrink-0" />
      </a>

      {showCopy && (
        <button
          onClick={handleCopy}
          className="p-1 hover:bg-white/10 rounded transition-colors"
          title={copied ? 'Copied!' : 'Copy to clipboard'}
        >
          {copied ? (
            <Check className="w-3 h-3 text-green-400" />
          ) : (
            <Copy className="w-3 h-3 text-[#929bc9] hover:text-white" />
          )}
        </button>
      )}
    </span>
  )
}

/**
 * Simple hash display with copy (no external link)
 * For local development or when explorer is not available
 */
export function HashDisplay({
  hash,
  label,
  truncate = true,
  className = '',
}: Omit<ExplorerLinkProps, 'type' | 'showCopy'>) {
  const [copied, setCopied] = useState(false)

  const displayText = label || (truncate ? truncateHash(hash) : hash)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(hash)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className="font-mono text-sm text-white">{displayText}</span>
      <button
        onClick={handleCopy}
        className="p-1 hover:bg-white/10 rounded transition-colors"
        title={copied ? 'Copied!' : 'Copy to clipboard'}
      >
        {copied ? (
          <Check className="w-3 h-3 text-green-400" />
        ) : (
          <Copy className="w-3 h-3 text-[#929bc9] hover:text-white" />
        )}
      </button>
    </span>
  )
}

export default ExplorerLink
