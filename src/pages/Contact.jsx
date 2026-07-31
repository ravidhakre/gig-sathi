import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Mail, Phone, MapPin, Send, HelpCircle } from 'lucide-react';

const Contact = () => {
  const { showToast } = useApp();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      showToast("Please fill in all required fields.", "warning");
      return;
    }
    showToast(`Query sent successfully! We will email you shortly.`, 'success');
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="fade-in">
      {/* Banner */}
      <div className="page-hero-banner">
        <div className="container">
          <span style={badgeStyle}>CONNECT WITH US</span>
          <h1>Contact GigSathi</h1>
          <p>
            Have questions about payouts, projects, or bulk hirings? Get in touch with our helpdesk team.
          </p>
          <div style={{ marginTop: '16px', fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.65)', fontWeight: '600', letterSpacing: '0.02em' }}>
            GigSathi is managed and operated by SRYN Management PVT LTD.
          </div>
        </div>
      </div>

      <section className="section-padding">
        <div className="container grid-2" style={{ gap: '60px', alignItems: 'start' }}>
          
          {/* Contact Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div>
              <h2 style={{ fontSize: '2rem', marginBottom: '16px' }}>Office Headquarters</h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Visit our main recruiting branch or give us a call during operations hours (Monday to Saturday, 9:30 AM to 6:30 PM).
              </p>
            </div>

            <div style={infoGridStyle}>
              <div style={infoItemStyle}>
                <div style={iconBoxStyle}><MapPin size={24} color="var(--primary-color)" /></div>
                <div>
                  <h4 style={infoTitleStyle}>Address</h4>
                  <p style={infoValueStyle}>3rd Floor, Tower B, Sector 62, Noida, Uttar Pradesh, 201301</p>
                </div>
              </div>

              <div style={infoItemStyle}>
                <div style={iconBoxStyle}><Phone size={24} color="var(--primary-color)" /></div>
                <div>
                  <h4 style={infoTitleStyle}>Support Desk</h4>
                  <p style={infoValueStyle}>+91 82659 03984 / +91 120 4567890</p>
                </div>
              </div>

              <div style={infoItemStyle}>
                <div style={iconBoxStyle}><Mail size={24} color="var(--primary-color)" /></div>
                <div>
                  <h4 style={infoTitleStyle}>General Enquiries</h4>
                  <p style={infoValueStyle}>info@gigsathi.com / support@gigsathi.com</p>
                </div>
              </div>
            </div>

            {/* Simulated Map Container */}
            <div style={mapPlaceholderStyle}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', color: 'var(--text-secondary)' }}>
                <HelpCircle size={20} />
                <span>Noida Sector 62 Office (Interactive Map Mock)</span>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="glass-card" style={{ padding: '36px' }}>
            <h3 style={{ fontSize: '1.6rem', marginBottom: '8px' }}>Send a Message</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '24px' }}>
              Fill up this form and our support desk will respond within 4 working hours.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Your Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter your name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="Enter email address"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Subject</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="E.g., Payout delay, Project registration issue"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Message Content</label>
                <textarea
                  rows="4"
                  className="form-control"
                  placeholder="Type your questions in detail..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  required
                ></textarea>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                Send Inquiry <Send size={16} />
              </button>
            </form>
          </div>

        </div>
      </section>
    </div>
  );
};

// Inline Styles
const bannerStyle = {
  background: 'linear-gradient(180deg, rgba(99, 102, 241, 0.06) 0%, rgba(11, 15, 25, 0) 100%)',
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

const infoGridStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '24px'
};

const infoItemStyle = {
  display: 'flex',
  gap: '20px',
  alignItems: 'start',
  textAlign: 'left'
};

const iconBoxStyle = {
  padding: '12px',
  borderRadius: 'var(--radius-md)',
  backgroundColor: 'rgba(255, 255, 255, 0.02)',
  border: '1px solid var(--border-color)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0
};

const infoTitleStyle = {
  fontSize: '1rem',
  fontWeight: '700',
  color: 'var(--primary-color)',
  marginBottom: '4px'
};

const infoValueStyle = {
  fontSize: '0.95rem',
  color: 'var(--text-secondary)',
  lineHeight: '1.5'
};

const mapPlaceholderStyle = {
  height: '220px',
  borderRadius: 'var(--radius-md)',
  border: '1px dashed var(--border-color)',
  backgroundColor: 'rgba(255,255,255,0.01)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

export default Contact;
