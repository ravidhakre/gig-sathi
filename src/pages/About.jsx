import React from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, Target, Zap, TrendingUp, Handshake, Network } from 'lucide-react';

const About = () => {
  const { cms } = useApp();

  const aCMS = cms.about || {
    mission: "To construct a frictionless ecosystem between top tier enterprises needing scale and field personnel seeking flexible income opportunities.",
    vision: "To become the first choice scaling partner for all tier-1 businesses in logistics, finance, and marketing by 2030."
  };

  return (
    <div className="fade-in">
      {/* Hero Banner */}
      <div className="page-hero-banner">
        <div className="container">
          <span style={badgeStyle}>WHO WE ARE</span>
          <h1>About GigSathi</h1>
          <p>
            We bridge the gap between large corporates requiring rapid workforce distribution and independent field executives seeking scalable earnings.
          </p>
          <div style={{ marginTop: '16px', fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.65)', fontWeight: '600', letterSpacing: '0.02em' }}>
            GigSathi is managed and operated by SRYN Management PVT LTD.
          </div>
        </div>
      </div>

      {/* Pillars Section */}
      <section className="section-padding">
        <div className="container grid-3">
          <div className="card" style={pillarCardStyle}>
            <Target size={36} color="var(--primary-color)" />
            <h3 style={{ margin: '14px 0 8px 0' }}>Our Mission</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
              {aCMS.mission}
            </p>
          </div>
          <div className="card" style={pillarCardStyle}>
            <Zap size={36} color="var(--secondary-color)" />
            <h3 style={{ margin: '14px 0 8px 0' }}>Our Vision</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
              {aCMS.vision}
            </p>
          </div>
          <div className="card" style={pillarCardStyle}>
            <ShieldCheck size={36} color="var(--accent-color)" />
            <h3 style={{ margin: '14px 0 8px 0' }}>Our Value</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
              Integrity, transparency in commission payouts, compliance to government regulations, and digital efficiency first.
            </p>
          </div>
        </div>
      </section>

      {/* Operational Model */}
      <section className="section-padding" style={{ backgroundColor: 'rgba(255,255,255,0.01)', borderTop: '1px solid var(--border-color)' }}>
        <div className="container grid-2" style={{ alignItems: 'center', gap: '48px' }}>
          <div>
            <h2 style={{ fontSize: '2.2rem', marginBottom: '20px' }}>Unified Scaling for Enterprises</h2>
            <p style={textBlockStyle}>
              GigSathi started with a clear realization: traditional staffing systems are too slow and rigid for modern fast-paced enterprises (especially banks, fintech platforms, and instant delivery apps).
            </p>
            <p style={textBlockStyle}>
              We created a flexible, contract-based hiring framework. Companies can deploy campaigns and specify target onboarding milestones. GigSathi utilizes its digital platform to verify candidates, provide them with dynamic dashboard updates, track leads, and handle KYC details.
            </p>
          </div>
          <div className="glass-card" style={{ padding: '36px' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>Operating Framework</h3>
            <ul style={flowListStyle}>
              <li>
                <div style={circleNumStyle}>1</div>
                <div>
                  <strong>Client Onboarding:</strong> We align on metrics, deliverables, and create campaign assets.
                </div>
              </li>
              <li>
                <div style={circleNumStyle}>2</div>
                <div>
                  <strong>Executive Sourcing:</strong> Verified field executives are assigned to campaigns with distinct target guides.
                </div>
              </li>
              <li>
                <div style={circleNumStyle}>3</div>
                <div>
                  <strong>CRM Calling & Training:</strong> Our HR coordinates via CRM to support candidate callings and verify documents.
                </div>
              </li>
              <li>
                <div style={circleNumStyle}>4</div>
                <div>
                  <strong>Payouts & KYC Approval:</strong> Automated checkups and weekly commission releases to direct bank routes.
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Strategic Partners Banner */}
      <section className="section-padding">
        <div className="container" style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.5rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '40px' }}>
            Trusted by Industry Market Leaders
          </h3>
          <div style={partnerGridStyle}>
            <div style={partnerIconStyle}><Handshake size={20} /> Zomato</div>
            <div style={partnerIconStyle}><Network size={20} /> SBI Card</div>
            <div style={partnerIconStyle}><TrendingUp size={20} /> Airtel Bank</div>
            <div style={partnerIconStyle}><ShieldCheck size={20} /> Swiggy</div>
          </div>
        </div>
      </section>
    </div>
  );
};

// Inline Styles
const bannerStyle = {
  background: 'linear-gradient(180deg, rgba(99, 102, 241, 0.08) 0%, rgba(11, 15, 25, 0) 100%)',
  padding: '80px 24px 60px 24px',
  borderBottom: '1px solid var(--border-color)',
  textAlign: 'left'
};

const badgeStyle = {
  fontSize: '0.8rem',
  fontWeight: '800',
  color: 'var(--primary-color)',
  letterSpacing: '0.1em',
  textTransform: 'uppercase'
};

const pillarCardStyle = {
  textAlign: 'left',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between'
};

const textBlockStyle = {
  color: 'var(--text-secondary)',
  fontSize: '1rem',
  lineHeight: '1.7',
  marginBottom: '20px'
};

const flowListStyle = {
  listStyle: 'none',
  padding: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: '20px'
};

const circleNumStyle = {
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  backgroundColor: 'var(--primary-light)',
  color: 'var(--primary-color)',
  border: '1px solid rgba(16, 185, 129, 0.3)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: '700',
  fontSize: '0.9rem',
  flexShrink: 0
};

const partnerGridStyle = {
  display: 'flex',
  justifyContent: 'center',
  gap: '40px',
  flexWrap: 'wrap',
  opacity: '0.7'
};

const partnerIconStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  fontSize: '1.2rem',
  fontWeight: '600',
  color: 'var(--text-primary)',
  background: 'rgba(255,255,255,0.02)',
  padding: '12px 24px',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--border-color)'
};

// Add stylesheet rules for flex rows in the operational steps
const aboutCSS = document.createElement('style');
aboutCSS.textContent = `
  ul[style*="flowListStyle"] li {
    display: flex;
    gap: 16px;
    align-items: start;
    font-size: 0.95rem;
    color: var(--text-secondary);
  }
  ul[style*="flowListStyle"] strong {
    color: var(--text-primary);
  }
`;
document.head.appendChild(aboutCSS);

export default About;
