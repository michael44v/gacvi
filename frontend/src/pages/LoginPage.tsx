import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Lock, Mail, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.login({ email, password });
      login(res.token, res.user);

      // Route according to user role
      const primaryRole = res.user.roles?.[0] || 'STUDENT';
      if (primaryRole === 'SUPER_ADMIN' || primaryRole === 'ADMIN') {
        navigate('/admin');
      } else if (primaryRole === 'TEACHER') {
        navigate('/teacher');
      } else if (primaryRole === 'PARENT') {
        navigate('/parent');
      } else {
        navigate('/student');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 72px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-color)', width: '100%', maxWidth: '440px', padding: '28px 20px' }}>

        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ backgroundColor: '#F1F5F9', width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <GraduationCap size={32} color="var(--primary-navy)" />
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--primary-navy)' }}>
            GACVI Portal Login
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Giant Ambassadors Canadian Vocational Institute
          </p>
        </div>

        {error && (
          <div style={{ backgroundColor: '#FEE2E2', color: '#991B1B', padding: '12px', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@gacvi.org"
                style={{ width: '100%', padding: '10px 12px 10px 40px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '0.9rem', minHeight: '44px' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ width: '100%', padding: '10px 12px 10px 40px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '0.9rem', minHeight: '44px' }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '1rem', marginTop: '8px' }}
          >
            {loading ? 'Authenticating...' : 'Sign In to Portal'}
          </button>
        </form>

        <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border-color)', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Need an account? <Link to="/register" style={{ color: 'var(--primary-navy)', fontWeight: '700' }}>Register Here</Link>
        </div>

        {/* MOCK DEMO CREDENTIALS BOX */}
        <div style={{ marginTop: '20px', padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <strong>Demo Credentials:</strong><br />
          • Admin: <code>admin@gacvi.org</code> / <code>Admin123!</code><br />
          • Instructor: <code>teacher@gacvi.org</code> / <code>Admin123!</code><br />
          • Student: <code>student@gacvi.org</code> / <code>Admin123!</code><br />
          • Parent: <code>parent@gacvi.org</code> / <code>Admin123!</code>
        </div>

      </div>
    </div>
  );
};
