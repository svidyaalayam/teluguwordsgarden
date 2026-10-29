import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import BackToBmkButton from "./BackToBmkButton";

function displayName(user: {
  first_name: string;
  last_name: string;
  bmk_username: string;
  username: string;
}) {
  const fullName = `${user.first_name || ""} ${user.last_name || ""}`.trim();
  if (fullName) return fullName;

  const accountName = user.bmk_username || user.username;
  return accountName.includes("@") ? "My account" : accountName;
}

function initials(name: string) {
  const parts = name.split(/\s+/).filter(Boolean);
  return (
    parts.length > 1
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`
      : name.slice(0, 2)
  ).toUpperCase();
}

export default function Header() {
  const { user, logout } = useAuth();
  const name = user ? displayName(user) : "";

  return (
    <header className="site-header vp-header">
      <div className="vp-header-inner">
        <Link to="/" className="vp-brand">
          <img
            className="vp-brand-logo"
            src="/bmk-logo.png"
            alt="Balamukundam"
            width={48}
            height={48}
          />
          <span className="vp-brand-text">
            <strong>Telugu Learning</strong>
            <span className="vp-brand-sub" lang="te">తెలుగు నేర్చుకుందాం</span>
          </span>
        </Link>

        <nav className="vp-main-nav" aria-label="Main navigation">
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/varnamala">Varnamala</NavLink>
          <NavLink to="/word-garden">Word Garden</NavLink>
          <NavLink to="/resources">Resources</NavLink>
          <NavLink to="/exam/level-1-achulu">Exams</NavLink>
        </nav>

        <div className="vp-header-actions">
          <BackToBmkButton className="vp-btn vp-btn-outline" />

          {user ? (
            <div className="vp-user-badge">
              <span className="vp-username">
                <span className="vp-user-name">{name}</span>
                <span className="vp-user-avatar" aria-hidden="true">
                  {initials(name)}
                </span>
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
  );
}
