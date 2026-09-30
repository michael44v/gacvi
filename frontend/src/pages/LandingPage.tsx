import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { api } from '../services/api';
import type { CourseOffering } from '../types';
import {
  ArrowRight,
  Stethoscope,
  ClipboardCheck,
  GraduationCap,
  Users,
  Award,
  Building2,
  Quote,
  FileCheck2,
  UserCheck,
  BookOpenCheck,
} from 'lucide-react';
import './LandingPage.css';

// Save the GACVI logo to src/assets/gacvi-logo.png and this import
// will resolve. Swap the path if you store it elsewhere.
import logoUrl from '../assets/gacvi-logo.png';

const PROGRAM_PATHWAYS = [
  {
    icon: Stethoscope,
    title: 'Healthcare Assistant & Clinical Support',
    description:
      'Patient monitoring, emergency first response, and laboratory clinical procedures for frontline care roles.',
  },
  {
    icon: UserCheck,
    title: 'Personal Support Worker',
    description:
      'Hands-on training in daily living assistance, mobility support, and compassionate elder and home care.',
  },
  {
    icon: FileCheck2,
    title: 'Medical Office Administration',
    description:
      'Scheduling, records management, and billing systems used in clinical offices around the world.',
  },
  {
    icon: BookOpenCheck,
    title: 'Emergency First Response',
    description:
      'Certification-track training in triage, CPR, and on-site emergency stabilization for care environments.',
  },
];

const STATS = [
  { value: '500+', label: 'Program graduates' },
  { value: 'Global', label: 'Students learning worldwide' },
  { value: '15+', label: 'Certified course offerings' },
  { value: '98%', label: 'Graduate job placement rate' },
];

const APPLICATION_STEPS = [
  {
    number: '01',
    title: 'Apply online',
    description: 'Submit your application and background documents through the student portal.',
  },
  {
    number: '02',
    title: 'Assessment & advising',
    description: 'Meet with a program advisor to confirm the pathway that fits your career goals.',
  },
  {
    number: '03',
    title: 'Enroll & begin training',
    description: 'Start coursework at a physical center or in the self-paced online LMS.',
  },
  {
    number: '04',
    title: 'Graduate & get certified',
    description: 'Complete clinical hours and assessments to earn your accredited certification.',
  },
];

const TESTIMONIALS = [
  {
    quote:
      'The hybrid format let me keep working while I trained. My clinical hours prepared me for the job I have now.',
    name: 'Ifeoma A.',
    program: 'Healthcare Assistant Graduate, 2025',
  },
  {
    quote:
      'Instructors held every cohort to the same standard. That mattered when employers checked my certification.',
    name: 'Daniel O.',
    program: 'Personal Support Worker Graduate, 2024',
  },
  {
    quote:
      'The online LMS courses were structured enough that I always knew what was next, even studying between shifts.',
    name: 'Grace E.',
    program: 'Medical Office Administration Graduate, 2025',
  },
];

// Soft white wash laid over the logo so it reads as a background, not content.
// Lower the 0.92 to make the logo more visible, raise it to make it fainter.
const LOGO_BACKDROP_STYLE: React.CSSProperties = {
  backgroundImage: `linear-gradient(rgba(248,250,252,0.92), rgba(248,250,252,0.92)), url(${logoUrl})`,
};

export const LandingPage: React.FC = () => {
  const [offerings, setOfferings] = useState<CourseOffering[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getOfferings()
      .then(setOfferings)
      .catch((err) => console.error('Error fetching offerings:', err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    AOS.init({
      duration: 700,
      easing: 'ease-out-cubic',
      once: true,
      offset: 80,
    });
  }, []);

  // Only online courses are featured on the landing page.
  const onlineOfferings = offerings.filter((off) => off.delivery_mode !== 'PHYSICAL');

  return (
    <div className="gacvi-landing">

      {/* HERO SECTION */}
      <section className="hero-section">
        <div className="hero-bg" />

        <div className="hero-inner">
          <div className="logo-bar" data-aos="fade-down">

          </div>

          <div className="hero-grid">
            <div data-aos="fade-right">
              <div className="hero-eyebrow">
               Healthcare Education For Real Impact
              </div>

              <h1 className="hero-headline">
                Giant Ambassadors <br />
                <span style={{ color: 'var(--accent-gold)' }}>Canadian Vocational</span> Institute
              </h1>

              <p className="hero-sub">
                Empowering healthcare professionals through accredited online self-paced courses and hands-on physical vocational training centers. Build your career with skilled care and stronger tomorrows.
              </p>

              <div className="hero-actions">
                <Link to="/offerings" className="btn-gold">
                  Explore Course Offerings <ArrowRight size={18} />
                </Link>
                <Link to="/register" className="btn-outline" style={{ borderColor: '#FFFFFF', color: '#FFFFFF' }}>
                  Create Account
                </Link>
              </div>

              <div className="core-values">
                <div>
                  <div className="cv-label">LEARN TODAY</div>
                  <div className="cv-sub">Skilled Care</div>
                </div>
                <div>
                  <div className="cv-label">CARE TOMORROW</div>
                  <div className="cv-sub">Compassionate</div>
                </div>
                <div>
                  <div className="cv-label">BUILD CAREER</div>
                  <div className="cv-sub">Certified Skills</div>
                </div>
                <div>
                  <div className="cv-label">MAKE DIFFERENCE</div>
                  <div className="cv-sub">Healthy Communities</div>
                </div>
              </div>
            </div>

            <div data-aos="fade-left" data-aos-delay="150">
              <div className="hero-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <span className="badge badge-physical">Vocational Programs</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>Hybrid & Physical</span>
                </div>
                <img
                  src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800"
                  alt="GACVI Healthcare Vocational Training"
                />
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--primary-navy)', marginBottom: '8px' }}>
                  Healthcare Assistant & Clinical Support Specialist
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  Master patient monitoring, emergency first response, laboratory clinical procedures, and personal support care.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--primary-navy)' }}>
                    Global Centers
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--brand-red)' }}>
                    $1,250.00 USD
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS STRIP */}
      <section className="stats-strip">
        <div className="stats-grid">
          {STATS.map((stat, i) => (
            <div key={stat.label} data-aos="fade-up" data-aos-delay={i * 100}>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* LOGO BACKDROP: Program Pathways through From Our Graduates */}
      <div className="logo-backdrop" style={LOGO_BACKDROP_STYLE}>

        {/* PROGRAM PATHWAYS */}
        <section className="section">
          <div className="section-heading" data-aos="fade-up">
            <h2>Program Pathways</h2>
            <p>Four routes into healthcare work, each built around the skills employers are hiring for right now.</p>
          </div>

          <div className="pathways-grid">
            {PROGRAM_PATHWAYS.map((pathway, i) => {
              const Icon = pathway.icon;
              return (
                <div key={pathway.title} className="pathway-card" data-aos="fade-up" data-aos-delay={i * 100}>
                  <div className="pathway-icon">
                    <Icon size={24} color="var(--accent-gold)" />
                  </div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--primary-navy)', marginBottom: '8px' }}>
                    {pathway.title}
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    {pathway.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* FEATURED ONLINE COURSE OFFERINGS */}
        <section className="section">
          <div className="section-heading" data-aos="fade-up">
            <h2>Featured Online Course Offerings</h2>
            <p>Learn at your own pace with self-paced online LMS courses, available from anywhere in the world.</p>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>Loading course offerings...</div>
          ) : onlineOfferings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              No online courses are available right now.
            </div>
          ) : (
            <div className="offerings-grid">
              {onlineOfferings.map((off, i) => (
                <div key={off.id} className="offering-card" data-aos="fade-up" data-aos-delay={(i % 3) * 100}>
                  <div style={{ position: 'relative' }}>
                    <img
                      src={off.thumbnail_url || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600'}
                      alt={off.title}
                    />
                    <span className="badge badge-online" style={{ position: 'absolute', top: '12px', right: '12px' }}>
                      Online LMS
                    </span>
                  </div>

                  <div className="offering-body">
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
                    </div>

                    {/* No price here: it is shown on the View Details page */}
                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)' }}>
                        Self-paced • Online
                      </span>
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

        {/* HOW ENROLLMENT WORKS */}
        <section className="steps-section">
          <div className="section" style={{ margin: 0 }}>
            <div className="section-heading" data-aos="fade-up">
              <h2>How Enrollment Works</h2>
              <p>From application to certification, here's the path every student follows.</p>
            </div>

            <div className="steps-grid">
              {APPLICATION_STEPS.map((step, i) => (
                <div key={step.number} className="step-item" data-aos="fade-up" data-aos-delay={i * 120}>
                  <div className="step-number">{step.number}</div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--primary-navy)', marginBottom: '8px' }}>
                    {step.title}
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="section">
          <div className="section-heading" data-aos="fade-up">
            <h2>From Our Graduates</h2>
          </div>

          <div className="testimonials-grid">
            {TESTIMONIALS.map((t, i) => (
              <div key={t.name} className="testimonial-card" data-aos="fade-up" data-aos-delay={i * 100}>
                <Quote size={22} color="var(--accent-gold)" style={{ marginBottom: '14px' }} />
                <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: 1.6, marginBottom: '20px' }}>
                  {t.quote}
                </p>
                <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--primary-navy)' }}>{t.name}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{t.program}</div>
              </div>
            ))}
          </div>
        </section>

      </div>
      {/* END LOGO BACKDROP */}

      {/* WHY GACVI */}
      <section className="why-section">
        <div className="why-grid">
          <div data-aos="fade-up">
            <Building2 size={28} color="var(--accent-gold)" style={{ marginBottom: '14px' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '8px' }}>Global centers</h3>
            <p style={{ fontSize: '0.88rem', color: '#94A3B8', lineHeight: 1.5 }}>
              Physical training centers and online learning open to students worldwide, all sharing one accredited curriculum.
            </p>
          </div>
          <div data-aos="fade-up" data-aos-delay="100">
            <ClipboardCheck size={28} color="var(--accent-gold)" style={{ marginBottom: '14px' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '8px' }}>Accredited certification</h3>
            <p style={{ fontSize: '0.88rem', color: '#94A3B8', lineHeight: 1.5 }}>
              Every program maps to recognized healthcare-sector certification requirements.
            </p>
          </div>
          <div data-aos="fade-up" data-aos-delay="200">
            <Users size={28} color="var(--accent-gold)" style={{ marginBottom: '14px' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '8px' }}>Small cohort instruction</h3>
            <p style={{ fontSize: '0.88rem', color: '#94A3B8', lineHeight: 1.5 }}>
              Certified instructors, capped class sizes, and hands-on lab time for physical programs.
            </p>
          </div>
          <div data-aos="fade-up" data-aos-delay="300">
            <Award size={28} color="var(--accent-gold)" style={{ marginBottom: '14px' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '8px' }}>Career placement support</h3>
            <p style={{ fontSize: '0.88rem', color: '#94A3B8', lineHeight: 1.5 }}>
              Graduate support connecting students to employers around the world.
            </p>
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="cta-wrap">
        <div className="cta-card" data-aos="zoom-in">
          <GraduationCap size={36} color="var(--primary-navy)" style={{ marginBottom: '16px' }} />
          <h2>Ready to build your healthcare career?</h2>
          <p style={{ color: 'var(--primary-navy)', fontSize: '1rem', marginBottom: '28px', opacity: 0.85 }}>
            Applications for the next physical and online cohorts are open now.
          </p>
          <div className="cta-actions">
            <Link to="/register" className="btn-primary" style={{ padding: '14px 28px', fontSize: '1rem' }}>
              Create Account <ArrowRight size={18} />
            </Link>
            <Link to="/offerings" className="btn-outline" style={{ borderColor: 'var(--primary-navy)', color: 'var(--primary-navy)', padding: '14px 28px', fontSize: '1rem' }}>
              View All Courses
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="landing-footer">
        <img src={logoUrl} alt="GACVI crest" />
        <div className="footer-title">GIANT AMBASSADORS CANADIAN VOCATIONAL INSTITUTE (GACVI)</div>
        <p className="footer-tagline">Healthier People • Brighter Communities • Healthcare Education for Real Impact</p>
        <p style={{ fontSize: '0.8rem' }}>
          © {new Date().getFullYear()} GACVI Academy. All rights reserved. Custom Production System Architecture.
        </p>
      </footer>

    </div>
  );
};