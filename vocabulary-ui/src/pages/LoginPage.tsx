import { useState, type FormEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import Header from '../components/Header'

export default function LoginPage() {
  const { user, login } = useAuth()
  const [username, setUsername] = useState('author')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (user) {
    return <Navigate to="/" replace />
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await login(username.trim(), password)
    } catch {
      setError('Could not sign in with Vocabulary Platform credentials.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="page-shell">
      <Header />
      <div className="shell narrow" style={{ maxWidth: '440px', margin: '40px auto', padding: '0 16px' }}>
        <main className="auth-card" style={{
          background: '#fff',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.08), 0 8px 10px -6px rgba(0,0,0,0.05)',
          border: '1px solid #e2e8f0'
        }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0 0 8px', color: '#1e293b' }}>Sign in</h1>
          <p className="muted" style={{ color: '#64748b', fontSize: '0.95rem', margin: '0 0 24px' }}>
            Vocabulary administrators and authors sign in here. Balamukundam teachers and students can open Word Garden directly from their school dashboard via Single Sign-On.
          </p>

          <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}>
              Username or email
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '1rem',
                  outline: 'none'
                }}
              />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}>
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                placeholder="Enter password"
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '1rem',
                  outline: 'none'
                }}
              />
            </label>

            {error && (
              <p className="error" style={{ color: '#dc2626', background: '#fef2f2', padding: '10px 14px', borderRadius: '8px', fontSize: '0.9rem', margin: 0 }}>
                {error}
              </p>
            )}

            <button
              className="btn primary"
              type="submit"
              disabled={busy}
              style={{
                marginTop: '8px',
                padding: '12px 20px',
                borderRadius: '8px',
                border: 'none',
                background: '#0d9488',
                color: '#fff',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: busy ? 'not-allowed' : 'pointer',
                opacity: busy ? 0.7 : 1,
                transition: 'all 0.2s'
              }}
            >
              {busy ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.9rem', color: '#64748b' }}>
            <Link to="/" style={{ color: '#0d9488', textDecoration: 'none', fontWeight: 500 }}>
              ← Browse Word Garden as guest
            </Link>
          </div>
        </main>
      </div>
    </div>
  )
}
