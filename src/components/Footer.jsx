import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Mail, Phone, MapPin, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={footerStyle}>
      <div className="container" style={gridStyle}>
        {/* Info Column */}
        <div style={colStyle}>
          <Link to="/" style={logoStyle}>
            <Briefcase size={28} color="var(--primary-color)" />
            <span style={{ fontWeight: 800, fontSize: '1.4rem', color: 'var(--text-primary)' }}>
              Gig<span style={{ color: 'var(--primary-color)' }}>Sathi</span>
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
              <span>info@gigsathi.com</span>
            </li>
            <li style={contactItemStyle}>
              <Phone size={16} color="var(--primary-color)" />
              <span>+91 98765 43210</span>
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
        <div>&copy; {new Date().getFullYear()} GigSathi Solutions Pvt. Ltd. All rights reserved.</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          Made with <Heart size={14} color="var(--primary-color)" fill="var(--primary-color)" /> in India
        </div>
      </div>
    </footer>
  );
};

// Inline Styles
const footerStyle = {
  backgroundColor: 'var(--bg-surface)',
  borderTop: '1px solid var(--border-color)',
  padding: '60px 24px 30px 24px',
  color: 'var(--text-secondary)',
  fontSize: '0.9rem'
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
  footer a:hover { color: var(--primary-color) !important; }
  @media (max-width: 768px) {
    footer .container { grid-template-columns: 1fr !important; gap: 30px !important; }
    footer { padding-top: 40px !important; }
  }
`;
document.head.appendChild(footerCSS);

export default Footer;
