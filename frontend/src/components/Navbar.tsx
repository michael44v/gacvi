import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, BookOpen, Award, LogOut, User as UserIcon, Shield, Users } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const hasRole = (role: string) => user?.roles?.includes(role);

  return (
    <nav style={{ backgroundColor: 'var(--primary-navy)', color: '#FFFFFF', boxShadow: 'var(--shadow-md)', position: 'sticky', top: 0, zIndex: 100 }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px', height: '72px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

        {/* Brand Header */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ backgroundColor: '#FFFFFF', padding: '6px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <GraduationCap size={28} color="var(--primary-navy)" />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '0.5px', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '6px' }}>
              GACVI <span style={{ color: 'var(--accent-gold)', fontSize: '0.85rem', fontWeight: '700' }}>ACADEMY</span>
            </div>
            <div style={{ fontSize: '0.65rem', color: '#94A3B8', letterSpacing: '0.3px', textTransform: 'uppercase' }}>
              Giant Ambassadors Canadian Vocational Institute
            </div>
          </div>
        </Link>

        {/* Navigation Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <Link to="/offerings" style={{ fontSize: '0.95rem', fontWeight: '600', color: '#E2E8F0', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <BookOpen size={18} /> Courses & Offerings
          </Link>

          {isAuthenticated && (
            <>
              {hasRole('STUDENT') && (
                <Link to="/student" style={{ fontSize: '0.95rem', fontWeight: '600', color: '#E2E8F0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Award size={18} /> My LMS Portal
                </Link>
              )}

              {hasRole('TEACHER') && (
                <Link to="/teacher" style={{ fontSize: '0.95rem', fontWeight: '600', color: '#E2E8F0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Users size={18} /> Instructor Portal
                </Link>
              )}

              {hasRole('PARENT') && (
                <Link to="/parent" style={{ fontSize: '0.95rem', fontWeight: '600', color: '#E2E8F0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <UserIcon size={18} /> Parent Portal
                </Link>
              )}

              {(hasRole('ADMIN') || hasRole('SUPER_ADMIN')) && (
                <Link to="/admin" style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Shield size={18} /> Admin Dashboard
                </Link>
              )}
            </>
          )}
        </div>

        {/* User Auth Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#FFFFFF' }}>{user?.first_name} {user?.last_name}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--accent-gold)' }}>{user?.roles?.[0]}</div>
              </div>
              <button onClick={handleLogout} style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#FFFFFF', padding: '8px 12px', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                <LogOut size={16} /> Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Link to="/login" className="btn-outline" style={{ borderColor: '#FFFFFF', color: '#FFFFFF', padding: '6px 16px', fontSize: '0.9rem' }}>
                Sign In
              </Link>
              <Link to="/register" className="btn-gold" style={{ padding: '6px 16px', fontSize: '0.9rem' }}>
                Enroll Now
              </Link>
            </div>
          )}
        </div>

      </div>
    </nav>
  );
};
