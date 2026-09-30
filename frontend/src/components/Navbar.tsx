import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Award, LogOut, User as UserIcon, Shield, Users, Menu, X, ChevronDown, UserCheck } from 'lucide-react';
import logoUrl from '../assets/gacvi-logo.png';
import './Navbar.css';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loginDropdownOpen, setLoginDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    setLoginDropdownOpen(false);
    navigate('/login');
  };

  const hasRole = (role: string) => user?.roles?.includes(role);
  const closeMobile = () => setMobileOpen(false);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setLoginDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      {mobileOpen && <div className="navbar-backdrop" onClick={closeMobile} />}
      <nav className="gacvi-navbar">
        <div className="navbar-inner">

        {/* Brand */}
        <Link to="/" className="navbar-brand" onClick={closeMobile}>
          <div className="crest">
            <img src={logoUrl} alt="GACVI crest" />
          </div>
          <div>
            <div className="brand-name">GACVI</div>
            <div className="brand-sub">Giant Ambassadors Canadian Vocational Institute</div>
          </div>
        </Link>

        {/* Desktop nav links */}
        <div className="navbar-links">
          <Link to="/offerings">
            <BookOpen size={18} /> Courses & Offerings
          </Link>

          {isAuthenticated && (
            <>
              {hasRole('STUDENT') && (
                <Link to="/student">
                  <Award size={18} /> My LMS Portal
                </Link>
              )}
              {hasRole('TEACHER') && (
                <Link to="/teacher">
                  <Users size={18} /> Instructor Portal
                </Link>
              )}
              {hasRole('PARENT') && (
                <Link to="/parent">
                  <UserIcon size={18} /> Parent Portal
                </Link>
              )}
              {(hasRole('ADMIN') || hasRole('SUPER_ADMIN')) && (
                <Link to="/admin" style={{ color: 'var(--accent-gold)' }}>
                  <Shield size={18} /> Admin Dashboard
                </Link>
              )}
            </>
          )}
        </div>

        {/* Desktop auth area */}
        <div className="navbar-actions">
          {isAuthenticated ? (
            <div className="navbar-user">
              <div style={{ textAlign: 'right' }}>
                <div className="navbar-user-name">{user?.first_name} {user?.last_name}</div>
                <div className="navbar-user-role">{user?.roles?.[0]}</div>
              </div>
              <button onClick={handleLogout} className="navbar-logout">
                <LogOut size={16} /> Logout
              </button>
            </div>
          ) : (
            <div className="navbar-guest">
              <div className="login-dropdown-wrapper" ref={dropdownRef}>
                <button
                  type="button"
                  className="btn-outline login-dropdown-trigger"
                  style={{ borderColor: '#FFFFFF', color: '#FFFFFF' }}
                  onClick={() => setLoginDropdownOpen(!loginDropdownOpen)}
                >
                  Sign In <ChevronDown size={14} style={{ transform: loginDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>

                {loginDropdownOpen && (
                  <div className="login-dropdown-menu">
                    <Link to="/login/student" onClick={() => setLoginDropdownOpen(false)}>
                      <Award size={16} color="var(--primary-navy)" /> Student Login
                    </Link>
                    <Link to="/login/teacher" onClick={() => setLoginDropdownOpen(false)}>
                      <Users size={16} color="#0D9488" /> Teacher Login
                    </Link>
                    <Link to="/login/admin" onClick={() => setLoginDropdownOpen(false)}>
                      <Shield size={16} color="var(--accent-red)" /> Admin Login
                    </Link>
                    <Link to="/login/parent" onClick={() => setLoginDropdownOpen(false)}>
                      <UserCheck size={16} color="#4F46E5" /> Parent Login
                    </Link>
                    <div className="dropdown-divider" />
                    <Link to="/login" onClick={() => setLoginDropdownOpen(false)} style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      View All Portals
                    </Link>
                  </div>
                )}
              </div>

              <Link to="/register" className="btn-gold">
                Enroll Now
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            className="navbar-toggle"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown panel */}
      <div className={`navbar-mobile-panel ${mobileOpen ? 'open' : ''}`}>
        <Link to="/offerings" onClick={closeMobile}>
          <BookOpen size={18} /> Courses & Offerings
        </Link>

        {isAuthenticated ? (
          <>
            {hasRole('STUDENT') && (
              <Link to="/student" onClick={closeMobile}>
                <Award size={18} /> My LMS Portal
              </Link>
            )}
            {hasRole('TEACHER') && (
              <Link to="/teacher" onClick={closeMobile}>
                <Users size={18} /> Instructor Portal
              </Link>
            )}
            {hasRole('PARENT') && (
              <Link to="/parent" onClick={closeMobile}>
                <UserIcon size={18} /> Parent Portal
              </Link>
            )}
            {(hasRole('ADMIN') || hasRole('SUPER_ADMIN')) && (
              <Link to="/admin" onClick={closeMobile} style={{ color: 'var(--accent-gold)' }}>
                <Shield size={18} /> Admin Dashboard
              </Link>
            )}
            <button onClick={handleLogout}>
              <LogOut size={18} /> Logout ({user?.first_name})
            </button>
          </>
        ) : (
          <>
            <div style={{ padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--accent-gold)', fontWeight: 700, padding: '4px 8px' }}>
                Portals & Sign In
              </div>
              <Link to="/login/student" onClick={closeMobile} style={{ paddingLeft: '16px' }}>
                <Award size={18} /> Student Login
              </Link>
              <Link to="/login/teacher" onClick={closeMobile} style={{ paddingLeft: '16px' }}>
                <Users size={18} /> Teacher Login
              </Link>
              <Link to="/login/admin" onClick={closeMobile} style={{ paddingLeft: '16px' }}>
                <Shield size={18} /> Admin Login
              </Link>
              <Link to="/login/parent" onClick={closeMobile} style={{ paddingLeft: '16px' }}>
                <UserCheck size={18} /> Parent Login
              </Link>
            </div>
            <div className="mobile-guest-actions">
              <Link to="/register" className="btn-gold" onClick={closeMobile}>
                Enroll Now
              </Link>
            </div>
          </>
        )}
      </div>
    </nav>
    </>
  );
};
