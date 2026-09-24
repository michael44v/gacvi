import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Users, Calendar, MapPin, Save } from 'lucide-react';

export const TeacherPortal: React.FC = () => {
  const [offerings, setOfferings] = useState<any[]>([]);
  const [selectedOffering, setSelectedOffering] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [classDate, setClassDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState<Record<number, string>>({});

  const [loading, setLoading] = useState(true);
  const [savingAttendance, setSavingAttendance] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    api.getTeacherOfferings()
      .then((data) => {
        setOfferings(data);
        if (data.length > 0) {
          handleSelectOffering(data[0]);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSelectOffering = async (off: any) => {
    setSelectedOffering(off);
    setSavedSuccess(false);
    try {
      const stData = await api.getOfferingStudents(off.id);
      setStudents(stData);

      const initialMap: Record<number, string> = {};
      stData.forEach((s: any) => {
        initialMap[s.id] = 'PRESENT';
      });
      setAttendance(initialMap);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveAttendance = async () => {
    if (!selectedOffering) return;

    setSavingAttendance(true);
    setSavedSuccess(false);

    const records = Object.entries(attendance).map(([studentId, status]) => ({
      student_id: Number(studentId),
      status
    }));

    try {
      await api.recordAttendance(selectedOffering.id, classDate, records);
      setSavedSuccess(true);
    } catch (err: any) {
      alert(err.message || 'Error recording attendance');
    } finally {
      setSavingAttendance(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '60px' }}>Loading Instructor Portal...</div>;

  return (
    <div style={{ maxWidth: '1280px', margin: '32px auto', padding: '0 24px' }}>

      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary-navy)' }}>
          Instructor Class & Attendance Portal
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Manage assigned physical training center cohorts, view enrolled student rosters, and log physical class attendance records.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '28px' }}>

        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '16px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase' }}>
            My Assigned Course Offerings
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {offerings.map((off) => (
              <button
                key={off.id}
                onClick={() => handleSelectOffering(off)}
                style={{
                  textAlign: 'left',
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: selectedOffering?.id === off.id ? 'var(--primary-navy)' : '#F8FAFC',
                  color: selectedOffering?.id === off.id ? '#FFFFFF' : 'var(--text-primary)',
                  border: '1px solid var(--border-color)'
                }}
              >
                <div style={{ fontSize: '0.8rem', fontWeight: '700', color: selectedOffering?.id === off.id ? 'var(--accent-gold)' : 'var(--text-muted)' }}>
                  {off.course_code} • {off.delivery_mode}
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: '700', marginTop: '2px' }}>
                  {off.title}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          {selectedOffering ? (
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '20px' }}>
                <div>
                  <span className={`badge ${selectedOffering.delivery_mode === 'PHYSICAL' ? 'badge-physical' : 'badge-online'}`} style={{ marginBottom: '6px', display: 'inline-block' }}>
                    {selectedOffering.delivery_mode}
                  </span>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--primary-navy)' }}>{selectedOffering.title}</h2>
                  {selectedOffering.location_name && (
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                      <MapPin size={16} color="var(--brand-red)" /> Center: {selectedOffering.location_name} ({selectedOffering.classroom_name})
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Calendar size={20} color="var(--primary-navy)" />
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Class Date</label>
                    <input
                      type="date"
                      value={classDate}
                      onChange={(e) => setClassDate(e.target.value)}
                      style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '0.9rem' }}
                    />
                  </div>
                </div>
              </div>

              {savedSuccess && (
                <div style={{ backgroundColor: '#DCFCE7', color: '#15803D', padding: '12px 16px', borderRadius: '6px', marginBottom: '16px', fontWeight: '700' }}>
                  ✓ Physical class attendance logged successfully for {classDate}!
                </div>
              )}

              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--primary-navy)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={20} /> Enrolled Student Roster ({students.length})
              </h3>

              {students.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No active student enrollments in this offering cohort.</p>
              ) : (
                <div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', marginBottom: '20px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#F1F5F9', textAlign: 'left', color: 'var(--primary-navy)' }}>
                        <th style={{ padding: '10px 14px' }}>Student Name</th>
                        <th style={{ padding: '10px 14px' }}>Email / Contact</th>
                        <th style={{ padding: '10px 14px' }}>Status</th>
                        <th style={{ padding: '10px 14px' }}>Attendance Marking</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((st) => (
                        <tr key={st.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '12px 14px', fontWeight: '700' }}>
                            {st.first_name} {st.last_name}
                          </td>
                          <td style={{ padding: '12px 14px', color: 'var(--text-muted)' }}>
                            {st.email}
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <span className="badge badge-active">{st.enrollment_status}</span>
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <select
                              value={attendance[st.id] || 'PRESENT'}
                              onChange={(e) => setAttendance({ ...attendance, [st.id]: e.target.value })}
                              style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid var(--border-color)', fontWeight: '600' }}
                            >
                              <option value="PRESENT">PRESENT</option>
                              <option value="ABSENT">ABSENT</option>
                              <option value="LATE">LATE</option>
                              <option value="EXCUSED">EXCUSED</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <button
                    onClick={handleSaveAttendance}
                    disabled={savingAttendance}
                    className="btn-gold"
                    style={{ padding: '12px 24px' }}
                  >
                    <Save size={18} /> {savingAttendance ? 'Saving Attendance...' : 'Save Attendance Log'}
                  </button>
                </div>
              )}

            </div>
          ) : (
            <div style={{ backgroundColor: '#FFFFFF', padding: '40px', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
              Select an offering cohort from the sidebar to record attendance.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
