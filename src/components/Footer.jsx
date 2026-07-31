import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Mail, Phone, MapPin, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={footerStyle}>
      <div className="container" style={gridStyle}>
        {/* Info Column */}
        <div style={colStyle}>
          <Link to="/" style={{ ...logoStyle, flexDirection: 'column', alignItems: 'flex-start', gap: '4px', textDecoration: 'none' }}>
            <span style={{ fontWeight: 'normal', fontSize: '3.2rem', color: '#ffffff', letterSpacing: '0.11em', marginRight: '-0.11em', fontFamily: "'Frank Bellamy', 'Bangers', sans-serif", lineHeight: 0.8, textTransform: 'uppercase' }}>
              SRYN
            </span>
            <span style={{ fontSize: '0.48rem', fontWeight: 800, letterSpacing: '0.07em', color: '#ffffff', textTransform: 'uppercase', lineHeight: 1 }}>
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
            <li style={contactItemStyle}>
              <Mail size={16} color="var(--primary-color)" />
              <span>info@srynmanagement.com</span>
            </li>
            <li style={contactItemStyle}>
              <Phone size={16} color="var(--primary-color)" />
              <span>+91 82659 03984</span>
            </li>
            <li style={contactItemStyle}>
              <MapPin size={16} color="var(--primary-color)" />
              <span>Sector 62, Noida, UP, India</span>
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
  color: 'var(--text-secondary)',
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
    background: linear-gradient(180deg, #0b0f19 0%, #060911 100%) !important;
    position: relative;
    overflow: hidden;
  }
  
  footer::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background-image: radial-gradient(rgba(255, 255, 255, 0.02) 1.5px, transparent 1.5px);
    background-size: 32px 32px;
    pointer-events: none;
  }

  footer h4 {
    color: #ffffff !important;
    font-weight: 800 !important;
    font-size: 1.15rem !important;
    letter-spacing: 0.02em;
    margin-bottom: 24px;
  }
  
  footer a {
    transition: all 0.25s ease !important;
    display: inline-block;
  }
  
  footer a:hover {
    color: #ffffff !important;
    transform: translateX(4px);
  }
  
  @media (max-width: 768px) {
    footer .container { grid-template-columns: 1fr !important; gap: 30px !important; }
    footer { padding-top: 40px !important; }
  }
`;
document.head.appendChild(footerCSS);

export default Footer;
