import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Mail, Phone, MapPin, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={footerStyle}>
      <div className="footer-glow-blob"></div>
      <div className="container footer-grid" style={gridStyle}>
        {/* Info Column */}
        <div style={colStyle}>
          <Link to="/" style={{ ...logoStyle, flexDirection: 'column', alignItems: 'flex-start', gap: '4px', textDecoration: 'none' }}>
            <span style={{ fontWeight: 'normal', fontSize: '3.2rem', color: '#ffffff', letterSpacing: '0.11em', marginRight: '-0.11em', fontFamily: "'Frank Bellamy', 'Bangers', sans-serif", lineHeight: 0.8, textTransform: 'uppercase', textShadow: '0 0 15px rgba(255,255,255,0.1)' }}>
              SRYN
            </span>
            <span style={{ fontSize: '0.48rem', fontWeight: 800, letterSpacing: '0.07em', color: 'rgba(255,255,255,0.9)', textTransform: 'uppercase', lineHeight: 1 }}>
              SRYN MANAGEMENT PVT LTD
            </span>
          </Link>
          <p style={descStyle}>
            India's most trusted recruitment scaling partner. We connect high-performing field forces and delivery riders with leading national brands.
          </p>
        </div>

        {/* Links Column */}
        <div style={colStyle}>
          <h4 style={titleStyle}>Quick Links</h4>
          <ul style={listStyle}>
            <li><Link to="/" style={linkStyle}>Home</Link></li>
            <li><Link to="/about" style={linkStyle}>About Us</Link></li>
            <li><Link to="/projects" style={linkStyle}>Our Projects</Link></li>
            <li><Link to="/contact" style={linkStyle}>Contact</Link></li>
          </ul>
        </div>

        {/* Categories Column */}
        <div style={colStyle}>
          <h4 style={titleStyle}>Projects Category</h4>
          <ul style={listStyle}>
            <li><Link to="/projects" style={linkStyle}>Financial Products</Link></li>
            <li><Link to="/projects" style={linkStyle}>Delivery Boy Hiring</Link></li>
            <li><Link to="/projects" style={linkStyle}>Field Executives</Link></li>
            <li><Link to="/projects" style={linkStyle}>Third Party KYC</Link></li>
          </ul>
        </div>

        {/* Contact Column */}
        <div style={colStyle}>
          <h4 style={titleStyle}>Get in Touch</h4>
          <ul style={{ ...listStyle, gap: '12px' }}>
            <li className="footer-contact-item" style={{ ...contactItemStyle, cursor: 'default' }}>
              <span className="footer-contact-icon"><Mail size={13} /></span>
              <span style={{ fontSize: '0.92rem', color: '#94a3b8' }}>info@srynmanagement.com</span>
            </li>
            <li className="footer-contact-item" style={{ ...contactItemStyle, cursor: 'default' }}>
              <span className="footer-contact-icon"><Phone size={13} /></span>
              <span style={{ fontSize: '0.92rem', color: '#94a3b8' }}>+91 82659 03984</span>
            </li>
            <li className="footer-contact-item" style={{ ...contactItemStyle, cursor: 'default' }}>
              <span className="footer-contact-icon"><MapPin size={13} /></span>
              <span style={{ fontSize: '0.92rem', color: '#94a3b8' }}>Sector 62, Noida, UP, India</span>
            </li>
          </ul>
        </div>
      </div>

      <hr style={dividerStyle} />

      <div className="container" style={bottomStyle}>
        <div>&copy; {new Date().getFullYear()} SRYN Management PVT LTD. All rights reserved.</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          Made with <Heart size={14} color="var(--primary-color)" fill="var(--primary-color)" /> in India
        </div>
      </div>
    </footer>
  );
};

// Inline Styles
const footerStyle = {
  backgroundColor: '#070a13',
  borderTop: '1.5px solid rgba(222, 49, 99, 0.15)',
  padding: '80px 24px 40px 24px',
  color: 'var(--text-secondary)',
  fontSize: '0.92rem',
  position: 'relative'
};

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: '2fr 1fr 1fr 1.5fr',
  gap: '40px',
  marginBottom: '40px'
};

const colStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '20px'
};

const logoStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  textDecoration: 'none'
};

const descStyle = {
  lineHeight: '1.6',
  color: '#94a3b8',
  maxWidth: '300px'
};

const titleStyle = {
  color: 'var(--primary-color)',
  fontSize: '1.1rem',
  fontWeight: '700'
};

const listStyle = {
  listStyle: 'none',
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  padding: 0
};

const linkStyle = {
  transition: 'color var(--transition-fast)',
  hover: {
    color: '#fff'
  }
};

const contactItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px'
};

const dividerStyle = {
  border: 'none',
  borderTop: '1px solid var(--border-color)',
  margin: '0 auto 30px auto',
  maxWidth: '1200px'
};

const bottomStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '16px',
  fontSize: '0.85rem'
};

// Embed hover styling in CSS injected script
const footerCSS = document.createElement('style');
footerCSS.textContent = `
  footer {
    background: linear-gradient(135deg, #0b0f19 0%, #060911 55%, #100612 100%) !important;
    position: relative;
    overflow: hidden;
    border-top: 2px solid rgba(222, 49, 99, 0.25) !important;
    box-shadow: 0 -10px 40px rgba(222, 49, 99, 0.08) !important;
  }
  
  footer::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background-image: radial-gradient(rgba(255, 255, 255, 0.02) 1.5px, transparent 1.5px);
    background-size: 32px 32px;
    pointer-events: none;
  }

  .footer-glow-blob {
    position: absolute;
    bottom: -150px;
    right: -100px;
    width: 350px;
    height: 350px;
    background: radial-gradient(circle, rgba(222, 49, 99, 0.12) 0%, transparent 70%);
    pointer-events: none;
    z-index: 1;
  }

  footer h4 {
    color: #ffffff !important;
    font-weight: 700 !important;
    font-size: 0.95rem !important;
    text-transform: uppercase !important;
    letter-spacing: 0.12em !important;
    margin-bottom: 24px;
    position: relative;
    padding-bottom: 10px;
  }

  footer h4::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: 0;
    width: 30px;
    height: 2px;
    background: var(--primary-color);
    border-radius: 2px;
    box-shadow: 0 0 8px var(--primary-color);
  }
  
  footer a {
    color: #94a3b8 !important;
    font-weight: 500 !important;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
    display: inline-block;
  }
  
  footer a:hover {
    color: #ffffff !important;
    transform: translateX(6px) !important;
    text-shadow: 0 0 8px rgba(255, 255, 255, 0.2);
  }

  .footer-contact-item {
    transition: all 0.25s ease;
  }

  .footer-contact-item:hover {
    color: #ffffff !important;
    transform: translateX(4px);
  }

  .footer-contact-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: rgba(222, 49, 99, 0.1);
    border: 1px solid rgba(222, 49, 99, 0.18);
    color: var(--primary-color);
    box-shadow: 0 0 8px rgba(222, 49, 99, 0.1);
    transition: all 0.25s ease;
    margin-right: 12px;
    flex-shrink: 0;
  }

  .footer-contact-item:hover .footer-contact-icon {
    background: var(--primary-color);
    color: #ffffff;
    border-color: var(--primary-color);
    box-shadow: var(--shadow-glow);
    transform: scale(1.08);
  }
  
  @media (max-width: 992px) {
    .footer-grid { grid-template-columns: 1fr 1fr !important; gap: 40px !important; }
  }
  @media (max-width: 768px) {
    .footer-grid { grid-template-columns: 1fr !important; gap: 30px !important; }
    footer { padding-top: 50px !important; }
  }
`;
document.head.appendChild(footerCSS);

export default Footer;
