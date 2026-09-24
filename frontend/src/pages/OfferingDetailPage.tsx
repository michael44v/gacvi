import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { CourseOffering } from '../types';
import { MapPin, CreditCard, ShieldCheck, BookOpen, AlertCircle, ArrowLeft, CheckCircle } from 'lucide-react';

export const OfferingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [offering, setOffering] = useState<CourseOffering | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [enrolling, setEnrolling] = useState(false);
  const [checkoutData, setCheckoutData] = useState<any>(null);
  const [paying, setPaying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.getOffering(Number(id))
      .then(setOffering)
      .catch((err) => setError(err.message || 'Failed to load course offering'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleStartEnrollment = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setEnrolling(true);
    setError('');
    try {
      const res = await api.enroll(Number(id));
      setCheckoutData(res);
    } catch (err: any) {
      setError(err.message || 'Enrollment failed');
    } finally {
      setEnrolling(false);
    }
  };

  const handleConfirmMockStripePayment = async () => {
    if (!checkoutData?.invoice_id) return;

    setPaying(true);
    setError('');
    try {
      await api.confirmPayment(checkoutData.invoice_id, checkoutData.stripe_client_secret);
      setPaymentSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Payment verification failed');
    } finally {
      setPaying(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '60px' }}>Loading offering details...</div>;
  if (error && !offering) return <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px', backgroundColor: '#FEE2E2', color: '#991B1B', borderRadius: '8px' }}>{error}</div>;
  if (!offering) return null;

  return (
    <div style={{ maxWidth: '1280px', margin: '40px auto', padding: '0 24px' }}>

      <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--primary-navy)', fontWeight: '600', marginBottom: '24px' }}>
        <ArrowLeft size={18} /> Back to Catalog
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '36px' }}>

        <div>
          <div style={{ backgroundColor: 'var(--primary-navy)', color: '#FFFFFF', padding: '32px', borderRadius: 'var(--radius-lg)', marginBottom: '32px' }}>
            <span className={`badge ${offering.delivery_mode === 'PHYSICAL' ? 'badge-physical' : 'badge-online'}`} style={{ marginBottom: '16px', display: 'inline-block' }}>
              {offering.delivery_mode === 'PHYSICAL' ? 'Physical Vocational Center' : 'Online LMS Offering'}
            </span>
            <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '12px' }}>{offering.title}</h1>
            <p style={{ color: '#E2E8F0', fontSize: '1rem', lineHeight: 1.5, marginBottom: '20px' }}>{offering.course_description}</p>

            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px', fontSize: '0.9rem', color: '#CBD5E1' }}>
              <div><strong>Code:</strong> {offering.course_code}</div>
              <div><strong>Category:</strong> {offering.course_category}</div>
              {offering.instructor_first_name && (
                <div><strong>Instructor:</strong> Dr. {offering.instructor_first_name} {offering.instructor_last_name}</div>
              )}
            </div>
          </div>

          {offering.delivery_mode === 'PHYSICAL' && (
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '24px', marginBottom: '32px', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--primary-navy)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin color="var(--brand-red)" size={22} /> Physical Training Center & Classroom
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '0.95rem' }}>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Training Center</div>
                  <strong>{offering.location_name || 'GACVI Main Campus'}</strong>
                  <div>{offering.location_address || '100 Vocational Way, Toronto, ON'}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Assigned Classroom / Lab</div>
                  <strong>{offering.classroom_name || 'Room 101 - Clinical Lab'}</strong>
                  <div>Capacity: {offering.capacity} Students</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Class Schedule</div>
                  <strong>{offering.schedule_description || 'Saturdays 9:00 AM - 1:00 PM'}</strong>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Start Date</div>
                  <strong>{offering.start_date || 'October 1, 2026'}</strong>
                </div>
              </div>
            </div>
          )}

          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--primary-navy)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={22} color="var(--primary-navy)" /> Curriculum & Syllabus Breakdown
            </h3>

            {offering.modules && offering.modules.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {offering.modules.map((m, idx) => (
                  <div key={m.id} style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '16px' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--primary-navy)', marginBottom: '6px' }}>
                      Module {idx + 1}: {m.title}
                    </h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px' }}>{m.description}</p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '12px', borderLeft: '2px solid var(--accent-gold)' }}>
                      {m.lessons.map((les) => (
                        <div key={les.id} style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-primary)' }}>
                          <span>• {les.title}</span>
                          <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', backgroundColor: '#F1F5F9', fontWeight: '600' }}>
                            {les.content_type}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Detailed module schedule available upon enrollment.</p>
            )}
          </div>

        </div>

        <div>
          <div style={{ backgroundColor: '#FFFFFF', border: '2px solid var(--accent-gold)', borderRadius: 'var(--radius-lg)', padding: '28px', boxShadow: 'var(--shadow-lg)', position: 'sticky', top: '96px' }}>

            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>Course Offering Tuition</div>
              <div style={{ fontSize: '2.4rem', fontWeight: '800', color: 'var(--primary-navy)' }}>
                ${offering.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#15803D', fontWeight: '700', marginTop: '4px' }}>
                ✓ Includes all learning materials & clinical lab fees
              </div>
            </div>

            {error && (
              <div style={{ backgroundColor: '#FEE2E2', color: '#991B1B', padding: '12px', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertCircle size={16} /> {error}
              </div>
            )}

            {!checkoutData && !paymentSuccess && (
              <div>
                <button
                  onClick={handleStartEnrollment}
                  disabled={enrolling}
                  className="btn-gold"
                  style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '1rem', marginBottom: '12px' }}
                >
                  {enrolling ? 'Initializing Enrollment...' : 'Enroll & Pay Online (Stripe)'}
                </button>
                <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  <ShieldCheck size={16} color="var(--primary-navy)" /> 256-bit Secure Server-Verified Checkout
                </div>
              </div>
            )}

            {checkoutData && !paymentSuccess && (
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', marginTop: '16px' }}>
                <div style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: 'var(--radius-sm)', marginBottom: '16px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--primary-navy)', marginBottom: '6px' }}>Invoice: {checkoutData.invoice_number}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Amount Payable: <strong>${checkoutData.amount} USD</strong></div>
                  <div style={{ fontSize: '0.75rem', color: '#0369A1', marginTop: '6px' }}>Stripe Secret: {checkoutData.stripe_client_secret.substring(0, 20)}...</div>
                </div>

                <div style={{ border: '1px dashed #CBD5E1', padding: '16px', borderRadius: '8px', marginBottom: '16px', backgroundColor: '#FFFFFF' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: '700', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CreditCard size={18} /> Stripe Credit Card Gateway
                  </div>
                  <input type="text" readOnly value="4242 •••• •••• 4242 (Mock Stripe Card)" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '0.85rem', backgroundColor: '#F1F5F9' }} />
                </div>

                <button
                  onClick={handleConfirmMockStripePayment}
                  disabled={paying}
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '1rem' }}
                >
                  {paying ? 'Verifying Stripe Transaction...' : 'Confirm & Complete Payment'}
                </button>
              </div>
            )}

            {paymentSuccess && (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <CheckCircle size={48} color="#16A34A" style={{ margin: '0 auto 12px' }} />
                <h4 style={{ color: '#16A34A', fontWeight: '800', marginBottom: '8px' }}>Enrollment Active!</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  Your payment has been server-verified. You now have full access to your student LMS portal.
                </p>
                <Link to="/student" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                  Go to Student LMS
                </Link>
              </div>
            )}

          </div>
        </div>

      </div>

    </div>
  );
};
