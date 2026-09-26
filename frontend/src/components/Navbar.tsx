import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Award, LogOut, User as UserIcon, Shield, Users, Menu, X } from 'lucide-react';
import logoUrl from '../assets/gacvi-logo.png';
import './Navbar.css';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate('/login');
  };

  const hasRole = (role: string) => user?.roles?.includes(role);
  const closeMobile = () => setMobileOpen(false);

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
              <Link to="/login" className="btn-outline" style={{ borderColor: '#FFFFFF', color: '#FFFFFF' }}>
                Sign In
              </Link>
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
          <div className="mobile-guest-actions">
            <Link to="/login" className="btn-outline" style={{ borderColor: '#FFFFFF', color: '#FFFFFF' }} onClick={closeMobile}>
              Sign In
            </Link>
            <Link to="/register" className="btn-gold" onClick={closeMobile}>
              Enroll Now
            </Link>
          </div>
        )}
      </div>
    </nav>
    </>
  );
};