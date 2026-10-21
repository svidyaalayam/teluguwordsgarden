import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { consumeSsoHash, storeBmkReturnTo } from '../utils/bmkNav'
import Header from '../components/Header'

/**
 * Landing page for Balamukundam -> Vocabulary Platform SSO.
 * Expects #bmk_token=...&return_to=... from the BMK dashboard button.
 */
export default function SsoPage() {
  const { user, loginBmk, loading } = useAuth()
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    if (loading || user || started) return
    const payload = consumeSsoHash()
    if (!payload) {
      setError(
        'No Balamukundam sign-in was found. Open Word Garden from your Balamukundam school dashboard.',
      )
      return
    }
    setStarted(true)
    storeBmkReturnTo(payload.returnTo)
    setBusy(true)
    loginBmk(payload.token)
      .catch(() => {
        setError(
          'Could not sign in with Balamukundam. Check that BMK_JWT_SECRET matches on both apps.',
        )
      })
      .finally(() => setBusy(false))
  }, [loading, user, started, loginBmk])

  if (user) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="page-shell">
      <Header />
      <div className="shell narrow" style={{ maxWidth: '440px', margin: '60px auto', padding: '0 16px' }}>
        <main className="auth-card" style={{
          background: '#fff',
          borderRadius: '16px',
          padding: '32px',
          textAlign: 'center',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.08), 0 8px 10px -6px rgba(0,0,0,0.05)',
          border: '1px solid #e2e8f0'
        }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 12px', color: '#1e293b' }}>
            Continuing from Balamukundam…
          </h1>
          {busy && (
            <p style={{ color: '#0d9488', fontWeight: 500, fontSize: '1.05rem' }}>
              Signing you in to Word Garden…
            </p>
          )}
          {error && (
            <>
              <p className="error" style={{ color: '#dc2626', background: '#fef2f2', padding: '12px', borderRadius: '8px', fontSize: '0.9rem', marginBottom: '16px' }}>
                {error}
              </p>
              <p>
                <Link to="/" style={{ color: '#0d9488', fontWeight: 600 }}>
                  Continue to Word Garden as guest
                </Link>
              </p>
            </>
          )}
        </main>
      </div>
    </div>
  )
}
