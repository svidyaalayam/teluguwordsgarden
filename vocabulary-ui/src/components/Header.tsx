import { Link, NavLink } from 'react-router-dom'
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
            <strong>Telugu Learning</strong>
            <span className="vp-brand-sub">తెలుగు నేర్చుకుందాం</span>
          </span>
        </Link>

        <nav className="vp-main-nav" aria-label="Main navigation">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/varnamala">Varnamala</NavLink>
          <NavLink to="/word-garden">Word Garden</NavLink>
          <NavLink to="/resources">Resources</NavLink>
        </nav>

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
