import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Shield, Users, Award, TrendingUp, ArrowRight, Briefcase, Mail, Phone, CheckCircle2 } from 'lucide-react';

const Home = () => {
  const { cms, projects, showToast } = useApp();

  const [jobForm, setJobForm] = useState({ fullName: '', email: '', mobile: '', project: '', message: '' });
  const [clientForm, setClientForm] = useState({ companyName: '', contactPerson: '', email: '', mobile: '', hiringType: 'Delivery Boy Hiring', description: '' });

  const handleJobSubmit = (e) => {
    e.preventDefault();
    if (!jobForm.fullName || !jobForm.email || !jobForm.mobile || !jobForm.project) {
      showToast("Please fill all required fields in the application form.", "warning");
      return;
    }
    showToast(`Application submitted! Our HR team will call you within 24 hours.`, 'success');
    setJobForm({ fullName: '', email: '', mobile: '', project: '', message: '' });
  };

  const handleClientSubmit = (e) => {
    e.preventDefault();
    if (!clientForm.companyName || !clientForm.contactPerson || !clientForm.email || !clientForm.mobile) {
      showToast("Please fill all required fields in the enquiry form.", "warning");
      return;
    }
    showToast(`Enquiry received! Our Business Development manager will contact you.`, 'success');
    setClientForm({ companyName: '', contactPerson: '', email: '', mobile: '', hiringType: 'Delivery Boy Hiring', description: '' });
  };

  const hCMS = cms.home || {
    heroTitle: "Empowering Freelancers, Connecting Opportunities",
    heroSubtitle: "GigSathi is India's leading third-party hiring portal. We partner with India's largest brands in logistics, fintech, and retail to build robust field forces and delivery fleets.",
    statsCandidates: "25,000+",
    statsPartners: "150+",
    statsCommission: "₹50 Lakhs+"
  };

  return (
    <div className="fade-in">
      {/* Hero Section */}
      <section style={heroSectionStyle}>
        <div className="container" style={heroContainerStyle}>
          <div style={heroTextStyle}>
            <span style={badgeStyle}>🚀 INDIA'S #1 GIG PORTAL</span>
            <h1 style={heroHeaderStyle}>
              {hCMS.heroTitle}
            </h1>
            <p style={heroSubStyle}>
              {hCMS.heroSubtitle}
            </p>
            <div style={heroActionsStyle}>
              <a href="#apply" className="btn btn-primary btn-lg" style={lgBtnStyle}>
                Apply For Work <ArrowRight size={18} />
              </a>
              <a href="#partner" className="btn btn-outline btn-lg" style={lgBtnStyle}>
                Partner With Us
              </a>
            </div>
          </div>
          
          {/* Hero Decorative Glow Card */}
          <div className="hero-glow-card" style={glowCardStyle}>
            <div className="glass-card glass-card-glow" style={{ padding: '40px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <h3 style={{ fontSize: '1.8rem', marginBottom: '16px' }}><span className="text-gradient">GigSathi Ecosystem</span></h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '16px', padding: 0 }}>
                <li style={listItemStyle}><CheckCircle2 color="var(--primary-color)" /> Instant Onboarding & Verification</li>
                <li style={listItemStyle}><CheckCircle2 color="var(--primary-color)" /> Direct-to-bank Commission Payouts</li>
                <li style={listItemStyle}><CheckCircle2 color="var(--primary-color)" /> Multi-Project Earning Options</li>
                <li style={listItemStyle}><CheckCircle2 color="var(--primary-color)" /> Dedicated Relationship Manager Support</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Banner */}
      <section style={statsSectionStyle}>
        <div className="container grid-3" style={{ textAlign: 'center' }}>
          <div style={statCardStyle}>
            <div style={statNumberStyle}>{hCMS.statsCandidates}</div>
            <div style={statLabelStyle}>Active Field Force</div>
          </div>
          <div style={statCardStyle}>
            <div style={statNumberStyle}>{hCMS.statsPartners}</div>
            <div style={statLabelStyle}>Corporate Clients Scaled</div>
          </div>
          <div style={statCardStyle}>
            <div style={statNumberStyle}>{hCMS.statsCommission}</div>
            <div style={statLabelStyle}>Commissions Disbursed</div>
          </div>
        </div>
      </section>

      {/* Divisions Section */}
      <section className="section-padding" style={{ backgroundColor: 'rgba(255,255,255,0.01)' }}>
        <div className="container" style={{ textAlign: 'center', marginBottom: '60px' }}>
          <span style={{ color: 'var(--primary-color)', fontWeight: 700, fontSize: '0.9rem', letterSpacing: '0.1em' }}>OUR DOMAINS</span>
          <h2 style={{ fontSize: '2.5rem', marginTop: '10px' }}>Hiring Programs We Manage</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '12px auto 0 auto' }}>
            We recruit, verify, and train personnel across multiple channels to ensure absolute delivery metrics.
          </p>
        </div>

        <div className="container grid-3">
          {/* Card 1 */}
          <div className="card" style={serviceCardStyle}>
            <TrendingUp size={40} color="var(--primary-color)" style={{ marginBottom: '20px' }} />
            <h3 style={{ marginBottom: '12px', fontSize: '1.4rem' }}>Financial Products</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
              We deploy certified field agents to acquire credit card customers, merchant scanner onboardings, and bank account accounts activations.
            </p>
          </div>
          {/* Card 2 */}
          <div className="card" style={serviceCardStyle}>
            <Users size={40} color="var(--secondary-color)" style={{ marginBottom: '20px' }} />
            <h3 style={{ marginBottom: '12px', fontSize: '1.4rem' }}>Delivery Fleet Sourcing</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
              High-volume sourcing of delivery partners for leading logistics, e-commerce, quick-commerce, and food delivery companies in India.
            </p>
          </div>
          {/* Card 3 */}
          <div className="card" style={serviceCardStyle}>
            <Shield size={40} color="var(--accent-color)" style={{ marginBottom: '20px' }} />
            <h3 style={{ marginBottom: '12px', fontSize: '1.4rem' }}>Third-Party Hiring & Verification</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
              Complete end-to-end recruitment process, background KYC checkups, document uploads, training module setups, and onboarding compliance.
            </p>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="section-padding">
        <div className="container" style={whyGridStyle}>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <span style={{ color: 'var(--primary-color)', fontWeight: 700, fontSize: '0.9rem' }}>WHY PARTNER GIGSATHI</span>
            <h2 style={{ fontSize: '2.5rem', marginTop: '10px', marginBottom: '24px' }}>Tech-Enabled Force Hiring Solutions</h2>
            <div style={whyFeatureItemStyle}>
              <div style={iconBoxStyle}><Award size={24} color="var(--primary-color)" /></div>
              <div>
                <h4 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>Quality & Compliance First</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Automated Aadhar KYC validation, background checks, and customized training modules.</p>
              </div>
            </div>
            <div style={whyFeatureItemStyle}>
              <div style={iconBoxStyle}><Users size={24} color="var(--secondary-color)" /></div>
              <div>
                <h4 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>Geographical Outreach</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Active operations across Tier-1, Tier-2, and Tier-3 cities in India for hyper-local delivery scales.</p>
              </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="glass-card" style={{ padding: '40px', border: '1px solid rgba(99, 102, 241, 0.2)', width: '100%' }}>
              <h3 style={{ fontSize: '1.6rem', marginBottom: '12px' }}>Need Instant Scale?</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '24px', lineHeight: '1.6' }}>
                Deploy 100+ vetted field executives or delivery boy fleets within 72 hours.
              </p>
              <a href="#partner" className="btn btn-secondary" style={{ width: '100%' }}>Get Corporate Consultation</a>
            </div>
          </div>
        </div>
      </section>

      {/* Forms Section */}
      <section className="section-padding" style={{ backgroundColor: 'rgba(255,255,255,0.01)', borderTop: '1px solid var(--border-color)' }}>
        <div className="container grid-2" style={{ gap: '48px', alignItems: 'start' }}>
          
          {/* Candidate Apply Form */}
          <div id="apply" className="glass-card fade-in" style={{ padding: '36px' }}>
            <h3 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Apply For Open Projects</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '24px' }}>
              Register as an executive to earn weekly commissions. Fill the form below.
            </p>
            <form onSubmit={handleJobSubmit}>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter your name"
                  value={jobForm.fullName}
                  onChange={(e) => setJobForm({ ...jobForm, fullName: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Mobile Number</label>
                <input
                  type="tel"
                  className="form-control"
                  placeholder="Enter 10-digit number"
                  value={jobForm.mobile}
                  onChange={(e) => setJobForm({ ...jobForm, mobile: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="Enter email address"
                  value={jobForm.email}
                  onChange={(e) => setJobForm({ ...jobForm, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Select Project Interest</label>
                <select
                  className="form-control"
                  value={jobForm.project}
                  onChange={(e) => setJobForm({ ...jobForm, project: e.target.value })}
                  required
                >
                  <option value="">-- Choose Project --</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.title}>{p.title} ({p.category})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Additional Notes / Experience</label>
                <textarea
                  rows="3"
                  className="form-control"
                  placeholder="E.g., 1 year experience in credit cards or delivery boy work..."
                  value={jobForm.message}
                  onChange={(e) => setJobForm({ ...jobForm, message: e.target.value })}
                ></textarea>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                Submit Application
              </button>
            </form>
          </div>

          {/* Corporate Client Onboard Form */}
          <div id="partner" className="glass-card" style={{ padding: '36px', border: '1px solid rgba(99, 102, 241, 0.15)' }}>
            <h3 style={{ fontSize: '1.8rem', marginBottom: '8px' }}><span className="text-gradient">Hire Gig Forces</span></h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '24px' }}>
              Are you a brand looking for field resources? Let us manage your sourcing & KYC details.
            </p>
            <form onSubmit={handleClientSubmit}>
              <div className="form-group">
                <label>Company Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="E.g., Zomato, SBI, Airtel"
                  value={clientForm.companyName}
                  onChange={(e) => setClientForm({ ...clientForm, companyName: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Contact Person</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter contact person name"
                  value={clientForm.contactPerson}
                  onChange={(e) => setClientForm({ ...clientForm, contactPerson: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Business Email ID</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="corporate@company.com"
                  value={clientForm.email}
                  onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Business Mobile</label>
                <input
                  type="tel"
                  className="form-control"
                  placeholder="Enter business phone number"
                  value={clientForm.mobile}
                  onChange={(e) => setClientForm({ ...clientForm, mobile: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Recruitment Division</label>
                <select
                  className="form-control"
                  value={clientForm.hiringType}
                  onChange={(e) => setClientForm({ ...clientForm, hiringType: e.target.value })}
                  required
                >
                  <option value="Delivery Boy Hiring">Delivery Boy Hiring</option>
                  <option value="Financial Products Sales">Financial Products Sales</option>
                  <option value="Field Executive Sourcing">Field Executive Sourcing</option>
                  <option value="Full Scale Hiring Program">Full Scale Third Party Hiring</option>
                </select>
              </div>
              <div className="form-group">
                <label>Hiring Scale / Requirements</label>
                <textarea
                  rows="3"
                  className="form-control"
                  placeholder="Describe your project, city requirements, and timeline..."
                  value={clientForm.description}
                  onChange={(e) => setClientForm({ ...clientForm, description: e.target.value })}
                ></textarea>
              </div>
              <button type="submit" className="btn btn-secondary" style={{ width: '100%', marginTop: '10px' }}>
                Submit Corporate Request
              </button>
            </form>
          </div>

        </div>
      </section>
    </div>
  );
};

// Inline styles
const heroSectionStyle = {
  padding: '100px 24px 80px 24px',
  position: 'relative',
  overflow: 'hidden'
};

const heroContainerStyle = {
  display: 'grid',
  gridTemplateColumns: '1.2fr 0.8fr',
  gap: '40px',
  alignItems: 'center'
};

const heroTextStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
  textAlign: 'left'
};

const badgeStyle = {
  display: 'inline-block',
  alignSelf: 'flex-start',
  padding: '6px 14px',
  backgroundColor: 'var(--primary-light)',
  border: '1px solid rgba(16, 185, 129, 0.3)',
  color: 'var(--primary-color)',
  fontSize: '0.8rem',
  fontWeight: '800',
  borderRadius: 'var(--radius-full)',
  letterSpacing: '0.05em'
};

const heroHeaderStyle = {
  fontSize: '3.6rem',
  fontWeight: '800',
  lineHeight: '1.15',
  letterSpacing: '-0.03em'
};

const heroSubStyle = {
  fontSize: '1.15rem',
  color: 'var(--text-secondary)',
  lineHeight: '1.6',
  maxWidth: '560px'
};

const heroActionsStyle = {
  display: 'flex',
  gap: '16px',
  flexWrap: 'wrap'
};

const lgBtnStyle = {
  padding: '14px 28px',
  fontSize: '1.05rem'
};

const glowCardStyle = {
  height: '100%',
  minHeight: '340px'
};

const listItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  fontSize: '1.05rem',
  fontWeight: '600'
};

const statsSectionStyle = {
  padding: '40px 24px',
  borderTop: '1px solid var(--border-color)',
  borderBottom: '1px solid var(--border-color)',
  backgroundColor: 'rgba(255,255,255,0.01)'
};

const statCardStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px'
};

const statNumberStyle = {
  fontSize: '2.8rem',
  fontWeight: '800',
  color: 'var(--primary-color)',
  lineHeight: '1'
};

const statLabelStyle = {
  fontSize: '0.95rem',
  fontWeight: '600',
  color: 'var(--text-secondary)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em'
};

const serviceCardStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  textAlign: 'left',
  height: '100%'
};

const whyGridStyle = {
  display: 'grid',
  gridTemplateColumns: '1.1fr 0.9fr',
  gap: '60px'
};

const whyFeatureItemStyle = {
  display: 'flex',
  gap: '20px',
  marginBottom: '24px',
  alignItems: 'start'
};

const iconBoxStyle = {
  padding: '12px',
  borderRadius: 'var(--radius-md)',
  backgroundColor: 'rgba(255,255,255,0.02)',
  border: '1px solid var(--border-color)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const responsiveStyle = document.createElement('style');
responsiveStyle.textContent = `
  @media (max-width: 992px) {
    .hero-glow-card { display: none !important; }
    #apply, #partner { width: 100% !important; }
  }
  @media (max-width: 768px) {
    h1 { font-size: 2.6rem !important; }
    .hero-actions-desktop { flex-direction: column !important; }
    div[style*="whyGridStyle"] { grid-template-columns: 1fr !important; gap: 30px !important; }
  }
`;
document.head.appendChild(responsiveStyle);

export default Home;
