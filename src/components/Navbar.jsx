import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Menu, X, Briefcase, LogOut, User, LayoutDashboard, Shield } from 'lucide-react';

const Navbar = () => {
  const { currentUser, logout } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const getDashboardPath = () => {
    if (!currentUser) return '/login';
    if (currentUser.role === 'Admin') return '/admin';
    if (currentUser.role === 'HR') return '/hr';
    return '/candidate';
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Our Projects', path: '/projects' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <>
      <nav className="navbar" style={navbarStyle}>
        <div className="container" style={navContainerStyle}>
          {/* Logo */}
          <Link to="/" style={logoStyle}>
            <Briefcase size={28} color="var(--primary-color)" />
            <span style={{ fontWeight: 800, fontSize: '1.5rem', color: '#fff' }}>
              Gig<span style={{ color: 'var(--primary-color)' }}>Sathi</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="nav-links-desktop" style={desktopLinksStyle}>
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                style={{
                  ...navLinkStyle,
                  color: location.pathname === link.path ? 'var(--primary-color)' : 'var(--text-secondary)'
                }}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="nav-actions-desktop" style={desktopActionsStyle}>
            {currentUser ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  Hi, <strong style={{ color: 'var(--text-primary)' }}>{currentUser.fullName}</strong> ({currentUser.role})
                </span>
                <Link to={getDashboardPath()} className="btn btn-primary" style={{ padding: '8px 16px' }}>
                  <LayoutDashboard size={18} />
                  Dashboard
                </Link>
                <button onClick={() => { logout(); navigate('/'); }} className="btn btn-outline" style={{ padding: '8px 16px' }}>
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Link to="/auth" className="btn btn-outline" style={{ padding: '8px 20px' }}>
                  Login
                </Link>
                <Link to="/auth?signup=true" className="btn btn-primary" style={{ padding: '8px 20px' }}>
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="mobile-menu-btn" onClick={toggleMenu} style={mobileMenuBtnStyle}>
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="mobile-drawer" style={mobileDrawerStyle}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '40px 24px' }}>
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={toggleMenu}
                style={{
                  ...mobileNavLinkStyle,
                  color: location.pathname === link.path ? 'var(--primary-color)' : 'var(--text-primary)'
                }}
              >
                {link.name}
              </Link>
            ))}
            <hr style={{ borderColor: 'var(--border-color)', margin: '10px 0' }} />
            
            {currentUser ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                  Logged in as <strong style={{ color: 'var(--text-primary)' }}>{currentUser.fullName}</strong>
                </div>
                <Link to={getDashboardPath()} onClick={toggleMenu} className="btn btn-primary" style={{ width: '100%' }}>
                  <LayoutDashboard size={18} /> Dashboard
                </Link>
                <button onClick={() => { logout(); navigate('/'); toggleMenu(); }} className="btn btn-outline" style={{ width: '100%' }}>
                  <LogOut size={18} /> Logout
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Link to="/auth" onClick={toggleMenu} className="btn btn-outline" style={{ width: '100%' }}>
                  Login
                </Link>
                <Link to="/auth?signup=true" onClick={toggleMenu} className="btn btn-primary" style={{ width: '100%' }}>
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Spacer for fixed navbar */}
      <div style={{ height: 'var(--navbar-height)' }}></div>
    </>
  );
};

// Inline Styles
const navbarStyle = {
  height: 'var(--navbar-height)',
  width: '100%',
  position: 'fixed',
  top: 0,
  left: 0,
  zIndex: 1000,
  backgroundColor: 'rgba(11, 15, 25, 0.85)',
  backdropFilter: 'blur(12px)',
  borderBottom: '1px solid var(--border-color)',
  display: 'flex',
  alignItems: 'center'
};

const navContainerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '0 24px'
};

const logoStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  textDecoration: 'none'
};

const desktopLinksStyle = {
  display: 'flex',
  gap: '32px',
  alignItems: 'center'
};

const navLinkStyle = {
  fontWeight: '600',
  fontSize: '0.95rem',
  transition: 'color var(--transition-fast)'
};

const desktopActionsStyle = {
  display: 'flex',
  alignItems: 'center'
};

const mobileMenuBtnStyle = {
  display: 'none',
  color: '#fff'
};

const mobileDrawerStyle = {
  position: 'fixed',
  top: 'var(--navbar-height)',
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'var(--bg-color)',
  zIndex: 999,
  animation: 'fadeIn 0.2s forwards'
};

const mobileNavLinkStyle = {
  fontSize: '1.25rem',
  fontWeight: '600',
  padding: '10px 0'
};

// Media query style insertions (to support responsive menu toggles on small screen)
const style = document.createElement('style');
style.textContent = `
  @media (max-width: 768px) {
    .nav-links-desktop, .nav-actions-desktop { display: none !important; }
    .mobile-menu-btn { display: block !important; }
  }
`;
document.head.appendChild(style);

export default Navbar;
