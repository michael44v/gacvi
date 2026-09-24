import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import type { CourseOffering } from '../types';
import { MapPin, HeartPulse, ArrowRight } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [offerings, setOfferings] = useState<CourseOffering[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getOfferings()
      .then(setOfferings)
      .catch((err) => console.error('Error fetching offerings:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC' }}>

      {/* HERO SECTION */}
      <section style={{
        background: 'linear-gradient(135deg, var(--primary-navy-dark) 0%, var(--primary-navy) 100%)',
        color: '#FFFFFF',
        padding: '80px 24px 100px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'center' }}>

          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'rgba(212, 175, 55, 0.15)',
              border: '1px solid var(--accent-gold)',
              padding: '6px 14px',
              borderRadius: '20px',
              color: 'var(--accent-gold)',
              fontSize: '0.85rem',
              fontWeight: '700',
              marginBottom: '20px'
            }}>
              <HeartPulse size={16} /> Healthcare Education For Real Impact
            </div>

            <h1 style={{ fontSize: '3rem', fontWeight: '800', lineHeight: 1.15, marginBottom: '20px' }}>
              Giant Ambassadors <br />
              <span style={{ color: 'var(--accent-gold)' }}>Canadian Vocational</span> Institute
            </h1>

            <p style={{ fontSize: '1.15rem', color: '#CBD5E1', lineHeight: 1.6, marginBottom: '36px' }}>
              Empowering healthcare professionals through accredited online self-paced courses and hands-on physical vocational training centers. Build your career with skilled care and stronger tomorrows.
            </p>

            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <Link to="/offerings" className="btn-gold" style={{ padding: '14px 28px', fontSize: '1rem' }}>
                Explore Course Offerings <ArrowRight size={18} />
              </Link>
              <Link to="/register" className="btn-outline" style={{ borderColor: '#FFFFFF', color: '#FFFFFF', padding: '14px 28px', fontSize: '1rem' }}>
                Create Account
              </Link>
            </div>

            {/* Core Values Pill Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginTop: '48px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--accent-gold)' }}>LEARN TODAY</div>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Skilled Care</div>
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--accent-gold)' }}>CARE TOMORROW</div>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Compassionate</div>
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--accent-gold)' }}>BUILD CAREER</div>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Certified Skills</div>
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--accent-gold)' }}>MAKE DIFFERENCE</div>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Healthy Communities</div>
              </div>
            </div>

          </div>

          {/* Hero Visual Card */}
          <div style={{ position: 'relative' }}>
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              boxShadow: 'var(--shadow-lg)',
              color: 'var(--text-primary)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span className="badge badge-physical">Vocational Programs</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>Hybrid & Physical</span>
              </div>
              <img
                src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800"
                alt="GACVI Healthcare Vocational Training"
                style={{ width: '100%', height: '240px', objectFit: 'cover', borderRadius: 'var(--radius-md)', marginBottom: '16px' }}
              />
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--primary-navy)', marginBottom: '8px' }}>
                Healthcare Assistant & Clinical Support Specialist
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                Master patient monitoring, emergency first response, laboratory clinical procedures, and personal support care.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--primary-navy)' }}>
                  Toronto & Lagos Centers
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--brand-red)' }}>
                  $1,250.00 USD
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* FEATURED COURSE OFFERINGS */}
      <section style={{ maxWidth: '1280px', margin: '60px auto', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--primary-navy)', marginBottom: '12px' }}>
            Featured Academic Course Offerings
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto' }}>
            Choose between physical class offerings with clinical labs or flexible online LMS offerings.
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>Loading course offerings...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
            {offerings.map((off) => (
              <div key={off.id} style={{
                backgroundColor: 'var(--card-bg)',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-md)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{ position: 'relative' }}>
                  <img
                    src={off.thumbnail_url || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600'}
                    alt={off.title}
                    style={{ width: '100%', height: '180px', objectFit: 'cover' }}
                  />
                  <span className={`badge ${off.delivery_mode === 'PHYSICAL' ? 'badge-physical' : 'badge-online'}`} style={{ position: 'absolute', top: '12px', right: '12px' }}>
                    {off.delivery_mode === 'PHYSICAL' ? 'Physical Center' : 'Online LMS'}
                  </span>
                </div>

                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--accent-gold)', marginBottom: '4px' }}>
                      {off.course_code} • {off.course_category}
                    </div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--primary-navy)', marginBottom: '10px' }}>
                      {off.title}
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.4 }}>
                      {off.schedule_description || 'Flexible schedule with certified instructors.'}
                    </p>

                    {off.delivery_mode === 'PHYSICAL' && off.location_name && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                        <MapPin size={16} color="var(--brand-red)" />
                        <strong>Center:</strong> {off.location_name} ({off.classroom_name})
                      </div>
                    )}
                  </div>

                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tuition Fee</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--primary-navy)' }}>
                        ${off.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                    <Link to={`/offerings/${off.id}`} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                      View Details
                    </Link>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* FOOTER */}
      <footer style={{ backgroundColor: 'var(--primary-navy-dark)', color: '#94A3B8', padding: '40px 24px', borderTop: '3px solid var(--accent-gold)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ color: '#FFFFFF', fontWeight: '800', fontSize: '1.2rem', marginBottom: '8px' }}>
            GIANT AMBASSADORS CANADIAN VOCATIONAL INSTITUTE (GACVI)
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--accent-gold)', marginBottom: '16px' }}>
            Healthier People • Brighter Communities • Healthcare Education for Real Impact
          </p>
          <p style={{ fontSize: '0.8rem' }}>
            © {new Date().getFullYear()} GACVI Academy. All rights reserved. Custom Production System Architecture.
          </p>
        </div>
      </footer>

    </div>
  );
};
