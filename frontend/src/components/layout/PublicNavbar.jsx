import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import logoImg from '../../assets/logoo.png';

const LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/about', label: 'About Us' },
  { to: '/features', label: 'Features' },
  { to: '/how-it-works', label: 'How It Works' },
  { to: '/contact', label: 'Contact' },
];

export default function PublicNavbar() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  function handleLogout() {
    logout();
    setProfileOpen(false);
    setMobileOpen(false);
    navigate('/');
  }

  return (
    <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant">
      <nav className="max-w-7xl mx-auto px-lg h-24 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-xs">
          <img src={logoImg} alt="NourishShare" className="h-24 w-24 rounded-full object-cover" />
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-xl">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `font-label-md transition-colors ${
                  isActive ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-primary'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        {/* Right side: auth state */}
        <div className="hidden md:flex items-center gap-md">
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setProfileOpen((o) => !o)}
                className="flex items-center gap-xs text-on-surface-variant hover:text-primary transition-colors"
                aria-label="Account menu"
              >
                <span className="material-symbols-outlined text-[32px]">account_circle</span>
                <span className="material-symbols-outlined text-[18px]">
                  {profileOpen ? 'expand_less' : 'expand_more'}
                </span>
              </button>
              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setProfileOpen(false)} />
                  <div className="absolute right-0 mt-sm w-48 bg-surface border border-outline-variant rounded-xl shadow-lg z-40 overflow-hidden">
                    <Link
                      to="/dashboard"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-sm px-md py-sm text-label-md text-on-surface hover:bg-surface-container-low transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">dashboard</span>
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-sm text-left px-md py-sm text-label-md text-error hover:bg-surface-container-low transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">logout</span>
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="font-label-md text-on-surface-variant hover:text-primary transition-colors">
                Log in
              </Link>
              <Link
                to="/register"
                className="bg-primary text-on-primary px-lg py-sm rounded-lg font-label-md hover:opacity-90 transition-opacity"
              >
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden material-symbols-outlined text-primary"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? 'close' : 'menu'}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-outline-variant bg-surface px-lg py-md flex flex-col gap-xs">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `py-sm font-label-md ${isActive ? 'text-primary font-bold' : 'text-on-surface-variant'}`
              }
            >
              {link.label}
            </NavLink>
          ))}
          <div className="border-t border-outline-variant pt-md mt-sm flex flex-col gap-sm">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-sm font-label-md text-primary"
                >
                  <span className="material-symbols-outlined text-[18px]">dashboard</span>
                  Dashboard
                </Link>
                <button onClick={handleLogout} className="flex items-center gap-sm text-left font-label-md text-error">
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)} className="font-label-md text-on-surface-variant">
                  Log in
                </Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="font-label-md text-primary font-bold">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
