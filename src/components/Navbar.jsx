import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Menu, X, Briefcase, LogOut, User, LayoutDashboard } from 'lucide-react';

const Navbar = () => {
  const { currentUser, logout } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  // Dynamic Styles based on Scroll State
  const navbarStyle = {
    height: 'var(--navbar-height)',
    width: '100%',
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 1000,
    backgroundColor: isScrolled ? '#0b0f19' : 'transparent',
    borderBottom: isScrolled ? '1px solid rgba(255, 255, 255, 0.08)' : 'none',
    boxShadow: isScrolled ? '0 10px 30px rgba(0, 0, 0, 0.25)' : 'none',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.3s ease-in-out'
  };

  const logoColor = isScrolled ? 'var(--primary-color)' : '#ffffff';
  const logoTextColor = '#ffffff';

  return (
    <>
      <nav className="navbar" style={navbarStyle}>
        <div className="container" style={navContainerStyle}>
          {/* Logo */}
          <Link to="/" style={logoStyle}>
            <Briefcase size={28} color={logoColor} style={{ transition: 'color 0.3s' }} />
            <span style={{ fontWeight: 800, fontSize: '1.5rem', color: logoTextColor }}>
              Gig<span style={{ color: logoColor, transition: 'color 0.3s' }}>Sathi</span>
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
                  color: location.pathname === link.path 
                    ? (isScrolled ? 'var(--primary-color)' : '#ffffff') 
                    : (isScrolled ? 'rgba(255, 255, 255, 0.75)' : 'rgba(255, 255, 255, 0.9)'),
                  borderBottom: location.pathname === link.path ? `2px solid ${isScrolled ? 'var(--primary-color)' : '#ffffff'}` : 'none',
                  paddingBottom: '4px'
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
                <span style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.8)' }}>
                  Hi, <strong style={{ color: '#ffffff' }}>{currentUser.fullName}</strong>
                </span>
                <Link to={getDashboardPath()} className="btn btn-primary" style={{ padding: '8px 16px', boxShadow: 'none' }}>
                  Dashboard
                </Link>
                <button onClick={() => { logout(); navigate('/'); }} className="btn btn-outline" style={{ padding: '8px 12px', borderColor: 'rgba(255,255,255,0.2)', color: '#ffffff' }}>
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Link to="/auth" className="btn btn-outline" style={{ padding: '8px 20px', borderColor: 'rgba(255,255,255,0.2)', color: '#ffffff' }}>
                  Login
                </Link>
                <Link to="/auth?signup=true" className="btn btn-primary" style={{ padding: '8px 20px', boxShadow: 'none' }}>
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="mobile-menu-btn" onClick={toggleMenu} style={{ ...mobileMenuBtnStyle, color: '#ffffff' }}>
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
                  color: location.pathname === link.path ? 'var(--primary-color)' : '#ffffff'
                }}
              >
                {link.name}
              </Link>
            ))}
            <hr style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '10px 0' }} />
            
            {currentUser ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem' }}>
                  Logged in as <strong style={{ color: '#ffffff' }}>{currentUser.fullName}</strong>
                </div>
                <Link to={getDashboardPath()} onClick={toggleMenu} className="btn btn-primary" style={{ width: '100%' }}>
                  Dashboard
                </Link>
                <button onClick={() => { logout(); navigate('/'); toggleMenu(); }} className="btn btn-outline" style={{ width: '100%', color: '#ffffff', borderColor: 'rgba(255,255,255,0.2)' }}>
                  Logout
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Link to="/auth" onClick={toggleMenu} className="btn btn-outline" style={{ width: '100%', color: '#ffffff', borderColor: 'rgba(255,255,255,0.2)' }}>
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
      {/* Spacer for fixed navbar is managed on pages */}
    </>
  );
};

// Inline Styles
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
  transition: 'all 0.2s ease'
};

const desktopActionsStyle = {
  display: 'flex',
  alignItems: 'center'
};

const mobileMenuBtnStyle = {
  display: 'none',
  background: 'none',
  border: 'none',
  cursor: 'pointer'
};

const mobileDrawerStyle = {
  position: 'fixed',
  top: 'var(--navbar-height)',
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: '#0b0f19',
  zIndex: 999,
  animation: 'fadeIn 0.2s forwards'
};

const mobileNavLinkStyle = {
  fontSize: '1.25rem',
  fontWeight: '600',
  padding: '10px 0',
  display: 'block'
};

// Injected styles for hover states
const style = document.createElement('style');
style.textContent = `
  @media (max-width: 768px) {
    .nav-links-desktop, .nav-actions-desktop { display: none !important; }
    .mobile-menu-btn { display: block !important; }
  }
  .nav-links-desktop a:hover {
    color: var(--primary-color) !important;
  }
`;
document.head.appendChild(style);

export default Navbar;
