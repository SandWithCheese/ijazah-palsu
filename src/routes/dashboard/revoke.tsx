import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useCallback } from 'react'
import {
  Search,
  AlertTriangle,
  CheckCircle,
  XCircle,
  FileText,
  User,
  Calendar,
  Hash,
  Loader2,
} from 'lucide-react'

interface RevokeSearch {
  id?: string
}

export const Route = createFileRoute('/dashboard/revoke')({
  component: RevokeDiplomaPage,
  validateSearch: (search: Record<string, unknown>): RevokeSearch => {
    return {
      id: typeof search.id === 'string' ? search.id : undefined,
    }
  },
})

function RevokeDiplomaPage() {
  const { id: searchId } = Route.useSearch()
  const [diplomaId, setDiplomaId] = useState(searchId || '')
  const [reason, setReason] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [isRevoking, setIsRevoking] = useState(false)
  const [diplomaDetails, setDiplomaDetails] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSearch = useCallback(async (idToSearch?: string) => {
    const searchValue = idToSearch || diplomaId
    if (!searchValue.trim()) {
      setError('Please enter a diploma ID')
      return
    }

    setIsSearching(true)
    setError(null)
    setDiplomaDetails(null)

    try {
      const { getDiplomaDetails, verifyDiploma } =
        await import('../../lib/web3/contracts')

      const id = parseInt(searchValue, 10)
      if (isNaN(id)) {
        throw new Error('Invalid diploma ID')
      }

      const verification = await verifyDiploma(id)
      if (!verification.isValid) {
        throw new Error('Diploma not found')
      }

      const details = await getDiplomaDetails(id)
      setDiplomaDetails({ ...details, id, isActive: verification.isActive })
    } catch (err: any) {
      setError(err.message || 'Failed to find diploma')
    } finally {
      setIsSearching(false)
    }
  }, [diplomaId])

  // Auto-search when coming from records page with ID
  useEffect(() => {
    if (searchId) {
      setDiplomaId(searchId)
      handleSearch(searchId)
    }
  }, [searchId])

  const handleRevoke = async () => {
    if (!diplomaDetails) return
    if (!reason.trim()) {
      setError('Please provide a revocation reason')
      return
    }
    if (reason.length > 500) {
      setError('Reason must be 500 characters or less')
      return
    }

    setIsRevoking(true)
    setError(null)

    try {
      const { revokeDiploma } = await import('../../lib/web3/contracts')
      const { getCurrentAccount } = await import('../../lib/web3/client')

      const account = await getCurrentAccount()
      if (!account) {
        throw new Error('Please connect your wallet')
      }

      await revokeDiploma(diplomaDetails.id, reason, account)
      setSuccess(true)
      setDiplomaDetails({ ...diplomaDetails, isActive: false })
    } catch (err: any) {
      setError(err.message || 'Failed to revoke diploma')
    } finally {
      setIsRevoking(false)
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const truncateAddress = (address: string) => {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <div className="revoke-page">
      <div className="page-header">
        <h1>Revoke Diploma</h1>
        <p>Search for a diploma and revoke it with a reason</p>
      </div>

      {/* Search Section */}
      <div className="card search-card">
        <h2>
          <Search size={20} />
          Search Diploma
        </h2>

        <div className="search-form">
          <div className="input-group">
            <label>Diploma ID</label>
            <input
              type="text"
              value={diplomaId}
              onChange={(e) => setDiplomaId(e.target.value)}
              placeholder="Enter diploma ID (e.g., 0, 1, 2...)"
              disabled={isSearching}
            />
          </div>

          <button
            className="btn-primary"
            onClick={() => handleSearch()}
            disabled={isSearching || !diplomaId.trim()}
          >
            {isSearching ? (
              <>
                <Loader2 size={18} className="spin" />
                Searching...
              </>
            ) : (
              <>
                <Search size={18} />
                Search
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="alert alert-error">
          <XCircle size={20} />
          {error}
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="alert alert-success">
          <CheckCircle size={20} />
          Diploma has been successfully revoked!
        </div>
      )}

      {/* Diploma Details */}
      {diplomaDetails && (
        <div className="card details-card">
          <h2>
            <FileText size={20} />
            Diploma Details
          </h2>

          <div className="details-grid">
            <div className="detail-item">
              <Hash size={16} />
              <span className="label">Diploma ID</span>
              <span className="value">{diplomaDetails.id}</span>
            </div>

            <div className="detail-item">
              <User size={16} />
              <span className="label">Owner</span>
              <span className="value mono">
                {truncateAddress(diplomaDetails.owner)}
              </span>
            </div>

            <div className="detail-item">
              <User size={16} />
              <span className="label">Issuer</span>
              <span className="value mono">
                {truncateAddress(diplomaDetails.issuer)}
              </span>
            </div>

            <div className="detail-item">
              <Calendar size={16} />
              <span className="label">Issued Date</span>
              <span className="value">
                {formatDate(diplomaDetails.timestamp)}
              </span>
            </div>

            <div className="detail-item full-width">
              <Hash size={16} />
              <span className="label">Document Hash</span>
              <span className="value mono small">
                {diplomaDetails.documentHash}
              </span>
            </div>

            <div className="detail-item">
              <span className="label">Status</span>
              <span
                className={`status-badge ${diplomaDetails.isActive ? 'active' : 'revoked'}`}
              >
                {diplomaDetails.isActive ? (
                  <>
                    <CheckCircle size={14} /> Active
                  </>
                ) : (
                  <>
                    <XCircle size={14} /> Revoked
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Revocation Form */}
          {diplomaDetails.isActive && !success && (
            <div className="revoke-form">
              <h3>
                <AlertTriangle size={18} />
                Revoke This Diploma
              </h3>

              <div className="warning-box">
                <AlertTriangle size={20} />
                <p>
                  <strong>Warning:</strong> This action is irreversible. Once
                  revoked, this diploma will be marked as invalid and cannot be
                  restored.
                </p>
              </div>

              <div className="input-group">
                <label>Revocation Reason (required)</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Enter the reason for revocation (max 500 characters)"
                  maxLength={500}
                  rows={4}
                  disabled={isRevoking}
                />
                <span className="char-count">{reason.length}/500</span>
              </div>

              <button
                className="btn-danger"
                onClick={handleRevoke}
                disabled={isRevoking || !reason.trim()}
              >
                {isRevoking ? (
                  <>
                    <Loader2 size={18} className="spin" />
                    Revoking...
                  </>
                ) : (
                  <>
                    <XCircle size={18} />
                    Revoke Diploma
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      <style>{`
        .revoke-page {
          max-width: 800px;
          margin: 0 auto;
        }

        .page-header {
          margin-bottom: 2rem;
        }

        .page-header h1 {
          margin: 0 0 0.5rem 0;
          font-size: 1.75rem;
        }

        .page-header p {
          margin: 0;
          color: var(--color-text-secondary);
        }

        .card {
          background: var(--color-card);
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          border: 1px solid var(--color-border);
        }

        .card h2 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin: 0 0 1.5rem 0;
          font-size: 1.25rem;
        }

        .search-form {
          display: flex;
          gap: 1rem;
          align-items: flex-end;
        }

        .search-form .input-group {
          flex: 1;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .input-group label {
          font-weight: 500;
          font-size: 0.875rem;
        }

        .input-group input,
        .input-group textarea {
          padding: 0.75rem 1rem;
          border: 1px solid var(--color-border);
          border-radius: 8px;
          font-size: 1rem;
          background: var(--color-bg);
          color: var(--color-text);
        }

        .input-group input:focus,
        .input-group textarea:focus {
          outline: none;
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }

        .char-count {
          font-size: 0.75rem;
          color: var(--color-text-secondary);
          text-align: right;
        }

        .btn-primary,
        .btn-danger {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-primary {
          background: var(--color-primary);
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: var(--color-primary-dark);
        }

        .btn-danger {
          background: #dc2626;
          color: white;
        }

        .btn-danger:hover:not(:disabled) {
          background: #b91c1c;
        }

        .btn-primary:disabled,
        .btn-danger:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .alert {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
        }

        .alert-error {
          background: #fef2f2;
          color: #dc2626;
          border: 1px solid #fecaca;
        }

        .alert-success {
          background: #f0fdf4;
          color: #16a34a;
          border: 1px solid #bbf7d0;
        }

        .details-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .detail-item.full-width {
          grid-column: 1 / -1;
        }

        .detail-item .label {
          font-size: 0.75rem;
          color: var(--color-text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .detail-item .value {
          font-weight: 500;
        }

        .detail-item .value.mono {
          font-family: monospace;
        }

        .detail-item .value.small {
          font-size: 0.875rem;
          word-break: break-all;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.875rem;
          font-weight: 500;
          width: fit-content;
        }

        .status-badge.active {
          background: #dcfce7;
          color: #16a34a;
        }

        .status-badge.revoked {
          background: #fef2f2;
          color: #dc2626;
        }

        .revoke-form {
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid var(--color-border);
        }

        .revoke-form h3 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #dc2626;
          margin: 0 0 1rem 0;
        }

        .warning-box {
          display: flex;
          gap: 1rem;
          padding: 1rem;
          background: #fffbeb;
          border: 1px solid #fcd34d;
          border-radius: 8px;
          margin-bottom: 1.5rem;
        }

        .warning-box svg {
          color: #f59e0b;
          flex-shrink: 0;
        }

        .warning-box p {
          margin: 0;
          font-size: 0.875rem;
          color: #92400e;
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 640px) {
          .search-form {
            flex-direction: column;
          }

          .details-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}
