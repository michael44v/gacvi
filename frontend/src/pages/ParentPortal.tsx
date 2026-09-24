import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { UserCheck, Award, Calendar, BookOpen } from 'lucide-react';

export const ParentPortal: React.FC = () => {
  const [wards, setWards] = useState<any[]>([]);
  const [selectedWard, setSelectedWard] = useState<any>(null);
  const [wardData, setWardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getParentWards()
      .then((data) => {
        setWards(data);
        if (data.length > 0) {
          handleSelectWard(data[0]);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSelectWard = async (ward: any) => {
    setSelectedWard(ward);
    try {
      const overview = await api.getWardOverview(ward.id);
      setWardData(overview);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '60px' }}>Loading Parent / Guardian Portal...</div>;

  return (
    <div style={{ maxWidth: '1280px', margin: '32px auto', padding: '0 24px' }}>

      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary-navy)' }}>
          Parent & Guardian Monitoring Portal
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Read-only academic progress, physical attendance logs, quiz scores, and tuition invoice monitoring for your linked wards.
        </p>
      </div>

      {wards.length === 0 ? (
        <div style={{ backgroundColor: '#FFFFFF', padding: '40px', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
          <UserCheck size={48} color="var(--primary-navy)" style={{ marginBottom: '16px' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '8px' }}>No Linked Students / Wards Found</h3>
          <p style={{ color: 'var(--text-muted)' }}>Please contact GACVI Administration to link your student ward account.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '28px' }}>

          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '16px', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase' }}>
              My Wards / Children
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {wards.map((w) => (
                <button
                  key={w.id}
                  onClick={() => handleSelectWard(w)}
                  style={{
                    textAlign: 'left',
                    padding: '12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: selectedWard?.id === w.id ? 'var(--primary-navy)' : '#F8FAFC',
                    color: selectedWard?.id === w.id ? '#FFFFFF' : 'var(--text-primary)',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  <div style={{ fontSize: '0.95rem', fontWeight: '700' }}>
                    {w.first_name} {w.last_name}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: selectedWard?.id === w.id ? 'var(--accent-gold)' : 'var(--text-muted)', marginTop: '2px' }}>
                    Relationship: {w.relationship}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            {wardData && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--primary-navy)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BookOpen size={20} /> Course Enrollments & Invoices
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {wardData.enrollments.map((enr: any) => (
                      <div key={enr.id} style={{ padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--accent-gold)' }}>{enr.delivery_mode}</div>
                          <div style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--primary-navy)' }}>{enr.offering_title}</div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{enr.course_title}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span className={`badge ${enr.status === 'ACTIVE' ? 'badge-active' : 'badge-pending'}`} style={{ marginBottom: '6px', display: 'inline-block' }}>
                            {enr.status}
                          </span>
                          <div style={{ fontSize: '0.9rem', fontWeight: '700' }}>
                            Fee: ${enr.amount ? enr.amount.toLocaleString('en-US') : '0.00'} USD ({enr.invoice_status || 'UNPAID'})
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--primary-navy)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={20} /> Physical Class Attendance Logs
                  </h3>

                  {wardData.attendance.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No physical class attendance recorded yet.</p>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#F1F5F9', textAlign: 'left', color: 'var(--primary-navy)' }}>
                          <th style={{ padding: '10px 14px' }}>Date</th>
                          <th style={{ padding: '10px 14px' }}>Offering Cohort</th>
                          <th style={{ padding: '10px 14px' }}>Attendance Status</th>
                          <th style={{ padding: '10px 14px' }}>Instructor Remarks</th>
                        </tr>
                      </thead>
                      <tbody>
                        {wardData.attendance.map((att: any) => (
                          <tr key={att.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td style={{ padding: '12px 14px', fontWeight: '700' }}>{att.class_date}</td>
                            <td style={{ padding: '12px 14px' }}>{att.offering_title}</td>
                            <td style={{ padding: '12px 14px' }}>
                              <span className={`badge ${att.status === 'PRESENT' ? 'badge-active' : 'badge-pending'}`}>
                                {att.status}
                              </span>
                            </td>
                            <td style={{ padding: '12px 14px', color: 'var(--text-muted)' }}>{att.remarks || 'Normal attendance'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--primary-navy)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Award size={20} /> Quiz Scores & Assessment Results
                  </h3>

                  {wardData.quizzes.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No quizzes attempted yet.</p>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
                      {wardData.quizzes.map((q: any) => (
                        <div key={q.id} style={{ border: '1px solid var(--border-color)', padding: '16px', borderRadius: '8px', backgroundColor: '#F8FAFC' }}>
                          <div style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--primary-navy)' }}>{q.quiz_title}</div>
                          <div style={{ fontSize: '1.4rem', fontWeight: '800', color: q.passed ? '#15803D' : '#991B1B', margin: '8px 0' }}>
                            {q.score}%
                          </div>
                          <span className={`badge ${q.passed ? 'badge-active' : 'badge-pending'}`}>
                            {q.passed ? 'PASSED' : 'RETAKE REQUIRED'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
