import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Shield, Users, BookOpen, GraduationCap, DollarSign, Award } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [offerings, setOfferings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getAdminStats(), api.getOfferings()])
      .then(([statsData, offeringsData]) => {
        setStats(statsData);
        setOfferings(offeringsData);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: '60px' }}>Loading Admin Executive Dashboard...</div>;

  return (
    <div style={{ maxWidth: '1280px', margin: '32px auto', padding: '0 24px' }}>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Shield size={18} /> GACVI Institutional Executive Suite
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary-navy)' }}>
            System Architecture Admin Dashboard
          </h1>
        </div>
      </div>

      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '36px' }}>

          <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>Enrolled Students</span>
              <GraduationCap size={20} color="var(--primary-navy)" />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--primary-navy)' }}>
              {stats.total_students}
            </div>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>Instructors</span>
              <Users size={20} color="var(--primary-navy)" />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--primary-navy)' }}>
              {stats.total_teachers}
            </div>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>Active Enrollments</span>
              <Award size={20} color="#16A34A" />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#16A34A' }}>
              {stats.active_enrollments}
            </div>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>Course Offerings</span>
              <BookOpen size={20} color="var(--primary-navy)" />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--primary-navy)' }}>
              {stats.total_offerings}
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--primary-navy)', color: '#FFFFFF', padding: '20px', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#E2E8F0', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>Verified Revenue</span>
              <DollarSign size={20} color="var(--accent-gold)" />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--accent-gold)' }}>
              ${stats.total_revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>

        </div>
      )}

      <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--primary-navy)', marginBottom: '16px' }}>
          Active Course Offering Cohorts & Physical Labs
        </h3>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#F1F5F9', textAlign: 'left', color: 'var(--primary-navy)' }}>
              <th style={{ padding: '12px 14px' }}>Offering Title</th>
              <th style={{ padding: '12px 14px' }}>Delivery Mode</th>
              <th style={{ padding: '12px 14px' }}>Location & Classroom</th>
              <th style={{ padding: '12px 14px' }}>Capacity & Enrolled</th>
              <th style={{ padding: '12px 14px' }}>Tuition Price</th>
              <th style={{ padding: '12px 14px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {offerings.map((off) => (
              <tr key={off.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '14px', fontWeight: '700', color: 'var(--primary-navy)' }}>
                  {off.title}
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>
                    Code: {off.course_code}
                  </div>
                </td>
                <td style={{ padding: '14px' }}>
                  <span className={`badge ${off.delivery_mode === 'PHYSICAL' ? 'badge-physical' : 'badge-online'}`}>
                    {off.delivery_mode}
                  </span>
                </td>
                <td style={{ padding: '14px', color: 'var(--text-primary)' }}>
                  {off.delivery_mode === 'PHYSICAL' ? (
                    <div>
                      <strong>{off.location_name}</strong>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{off.classroom_name}</div>
                    </div>
                  ) : (
                    <span style={{ color: 'var(--text-muted)' }}>Online Remote Access</span>
                  )}
                </td>
                <td style={{ padding: '14px' }}>
                  <strong>{off.enrolled_count}</strong> / {off.capacity} Seats
                </td>
                <td style={{ padding: '14px', fontWeight: '800', color: 'var(--primary-navy)' }}>
                  ${off.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
                <td style={{ padding: '14px' }}>
                  <span className="badge badge-active">{off.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};
