import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import BackToBmkButton from './BackToBmkButton'

export default function Header() {
  const { user, logout } = useAuth()

  return (
    <header className="site-header vp-header">
      <div className="vp-header-inner">
        <Link to="/" className="vp-brand">
          <span className="vp-brand-icon">🌱</span>
          <span className="vp-brand-text">
            <strong>Word Garden</strong>
            <span className="vp-brand-sub">పదాల తోట</span>
          </span>
        </Link>

        <div className="vp-header-actions">
          <BackToBmkButton className="vp-btn vp-btn-outline" />

          {user ? (
            <div className="vp-user-badge">
              <span className="vp-username">
                👤 {user.first_name || user.username}
                {user.auth_source === 'bmk' && (
                  <span className="vp-badge-bmk">BMK</span>
                )}
              </span>
              <button
                type="button"
                className="vp-btn vp-btn-text"
                onClick={logout}
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link to="/login" className="vp-btn vp-btn-primary">
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
