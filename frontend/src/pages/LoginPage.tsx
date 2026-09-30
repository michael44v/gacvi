import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Lock, Mail, AlertCircle, Shield, Users, UserCheck, ArrowRight, ArrowLeft } from 'lucide-react';

interface RoleLoginProps {
  portalTitle: string;
  portalSubtitle: string;
  allowedRoles: string[];
  redirectPath: string;
  icon: React.ReactNode;
  themeColor?: string;
  demoEmail: string;
  demoRoleLabel: string;
}

const BaseRoleLoginPage: React.FC<RoleLoginProps> = ({
  portalTitle,
  portalSubtitle,
  allowedRoles,
  redirectPath,
  icon,
  themeColor = 'var(--primary-navy)',
  demoEmail,
  demoRoleLabel,
}) => {
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

      // Role enforcement check
      const userRoles = res.user.roles || [];
      const hasPermission = userRoles.some((role) => allowedRoles.includes(role));

      if (!hasPermission) {
        setError(`Access Denied: Your account does not have permissions for the ${portalTitle}.`);
        setLoading(false);
        return;
      }

      login(res.token, res.user);

      // Navigate to portal
      const primaryRole = userRoles[0] || 'STUDENT';
      if (primaryRole === 'SUPER_ADMIN' || primaryRole === 'ADMIN') {
        navigate(redirectPath || '/admin');
      } else if (primaryRole === 'TEACHER') {
        navigate(redirectPath || '/teacher');
      } else if (primaryRole === 'PARENT') {
        navigate(redirectPath || '/parent');
      } else {
        navigate(redirectPath || '/student');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 72px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-color)', width: '100%', maxWidth: '450px', padding: '32px 24px' }}>

        <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '20px' }}>
          <ArrowLeft size={16} /> Switch Login Portal
        </Link>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ backgroundColor: '#F1F5F9', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            {icon}
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: themeColor, margin: '0 0 4px 0' }}>
            {portalTitle}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
            {portalSubtitle}
          </p>
        </div>

        {error && (
          <div style={{ backgroundColor: '#FEE2E2', color: '#991B1B', padding: '12px', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '20px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>{error}</div>
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
                placeholder={`${demoEmail}`}
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
            style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '1rem', marginTop: '8px', backgroundColor: themeColor, borderColor: themeColor }}
          >
            {loading ? 'Authenticating...' : `Sign In to ${demoRoleLabel}`}
          </button>
        </form>

        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-color)', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Need a new account? <Link to="/register" style={{ color: themeColor, fontWeight: '700' }}>Register Here</Link>
        </div>

        {/* DEMO CREDENTIALS */}
        <div style={{ marginTop: '20px', padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '6px', fontSize: '0.78rem', color: 'var(--text-muted)', border: '1px border-subtle' }}>
          <strong>{demoRoleLabel} Demo Login:</strong><br />
          • Email: <code>{demoEmail}</code><br />
          • Password: <code>Admin123!</code>
        </div>
      </div>
    </div>
  );
};

export const StudentLoginPage: React.FC = () => (
  <BaseRoleLoginPage
    portalTitle="Student LMS Portal Login"
    portalSubtitle="Giant Ambassadors Canadian Vocational Institute"
    allowedRoles={['STUDENT', 'ADMIN', 'SUPER_ADMIN']}
    redirectPath="/student"
    icon={<GraduationCap size={32} color="var(--primary-navy)" />}
    themeColor="var(--primary-navy)"
    demoEmail="student@gacvi.org"
    demoRoleLabel="Student Portal"
  />
);

export const TeacherLoginPage: React.FC = () => (
  <BaseRoleLoginPage
    portalTitle="Teacher & Faculty Login"
    portalSubtitle="GACVI Instructor LMS & Classroom Portal"
    allowedRoles={['TEACHER', 'ADMIN', 'SUPER_ADMIN']}
    redirectPath="/teacher"
    icon={<Users size={32} color="#0D9488" />}
    themeColor="#0D9488"
    demoEmail="teacher@gacvi.org"
    demoRoleLabel="Instructor Portal"
  />
);

export const AdminLoginPage: React.FC = () => (
  <BaseRoleLoginPage
    portalTitle="Admin Portal Login"
    portalSubtitle="GACVI Administrative Dashboard & System Management"
    allowedRoles={['ADMIN', 'SUPER_ADMIN']}
    redirectPath="/admin"
    icon={<Shield size={32} color="var(--accent-red)" />}
    themeColor="var(--accent-red)"
    demoEmail="admin@gacvi.org"
    demoRoleLabel="Admin Dashboard"
  />
);

export const ParentLoginPage: React.FC = () => (
  <BaseRoleLoginPage
    portalTitle="Parent Portal Login"
    portalSubtitle="GACVI Parent & Guardian Tracking Portal"
    allowedRoles={['PARENT', 'ADMIN', 'SUPER_ADMIN']}
    redirectPath="/parent"
    icon={<UserCheck size={32} color="#4F46E5" />}
    themeColor="#4F46E5"
    demoEmail="parent@gacvi.org"
    demoRoleLabel="Parent Portal"
  />
);

export const LoginPage: React.FC = () => {
  return (
    <div style={{ minHeight: 'calc(100vh - 72px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 16px' }}>
      <div style={{ width: '100%', maxWidth: '720px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary-navy)', marginBottom: '8px' }}>
            Select Your Login Portal
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Choose your account role to access the correct GACVI portal
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>

          <Link
            to="/login/student"
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', height: '100%', transition: 'all 0.2s ease-in-out' }}>
              <div style={{ backgroundColor: '#EFF6FF', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <GraduationCap size={26} color="var(--primary-navy)" />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--primary-navy)', margin: '0 0 8px 0' }}>
                Student Portal
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', flex: 1, margin: '0 0 16px 0' }}>
                Access course materials, assignments, quizzes, and track your learning progress.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', fontSize: '0.85rem', color: 'var(--primary-navy)' }}>
                Sign In as Student <ArrowRight size={16} />
              </div>
            </div>
          </Link>

          <Link
            to="/login/teacher"
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', height: '100%', transition: 'all 0.2s ease-in-out' }}>
              <div style={{ backgroundColor: '#CCFBF1', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Users size={26} color="#0D9488" />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#0D9488', margin: '0 0 8px 0' }}>
                Teacher / Faculty
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', flex: 1, margin: '0 0 16px 0' }}>
                Manage course content, view enrolled students, grade assignments, and post announcements.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', fontSize: '0.85rem', color: '#0D9488' }}>
                Sign In as Teacher <ArrowRight size={16} />
              </div>
            </div>
          </Link>

          <Link
            to="/login/admin"
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', height: '100%', transition: 'all 0.2s ease-in-out' }}>
              <div style={{ backgroundColor: '#FEE2E2', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Shield size={26} color="var(--accent-red)" />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--accent-red)', margin: '0 0 8px 0' }}>
                Admin Dashboard
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', flex: 1, margin: '0 0 16px 0' }}>
                Manage users, system configurations, course offerings, enrollments, and reports.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', fontSize: '0.85rem', color: 'var(--accent-red)' }}>
                Sign In as Admin <ArrowRight size={16} />
              </div>
            </div>
          </Link>

          <Link
            to="/login/parent"
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', height: '100%', transition: 'all 0.2s ease-in-out' }}>
              <div style={{ backgroundColor: '#E0E7FF', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <UserCheck size={26} color="#4F46E5" />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#4F46E5', margin: '0 0 8px 0' }}>
                Parent Portal
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', flex: 1, margin: '0 0 16px 0' }}>
                View your child's academic progress, attendance, grades, and communicate with instructors.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', fontSize: '0.85rem', color: '#4F46E5' }}>
                Sign In as Parent <ArrowRight size={16} />
              </div>
            </div>
          </Link>

        </div>
      </div>
    </div>
  );
};
