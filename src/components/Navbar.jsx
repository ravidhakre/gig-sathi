import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Menu, X, Briefcase, LogOut } from 'lucide-react';

const Navbar = () => {
  const { currentUser, logout } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const isHome = location.pathname === '/';

  useEffect(() => {
    // If not on the Home page, the navbar MUST always be solid black for clear contrast
    if (!isHome) {
      setIsScrolled(true);
      return;
    }

    // On Home page, detect scroll
    setIsScrolled(window.scrollY > 50);

    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHome]);

  const toggleMenu = () => setIsOpen(!isOpen);

  const getDashboardPath = () => {
    if (!currentUser) return '/login';
    if (currentUser.role === 'Admin') return '/admin';
    if (currentUser.role === 'HR' || currentUser.role === 'HR Executive' || currentUser.role === 'HR Intern') return '/hr';
    return '/candidate';
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Our Projects', path: '/projects' },
    { name: 'Contact', path: '/contact' },
  ];

  // Dynamic Navbar Styles
  const navbarStyle = {
    height: 'var(--navbar-height)',
    width: '100%',
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 1000,
    backgroundColor: isScrolled ? '#DE3163' : 'transparent',
    borderBottom: isScrolled ? '1px solid rgba(255, 255, 255, 0.15)' : 'none',
    boxShadow: isScrolled ? '0 10px 30px rgba(0, 0, 0, 0.2)' : 'none',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.3s ease-in-out'
  };

  const logoColor = '#ffffff';
  const logoTextColor = '#ffffff';

  return (
    <>
      <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`} style={navbarStyle}>
        <div className="container" style={navContainerStyle}>
          {/* Logo */}
          <Link to="/" style={{ ...logoStyle, flexDirection: 'column', alignItems: 'flex-start', gap: '2px', textDecoration: 'none' }}>
            <span className="navbar-brand-title">
              SRYN
            </span>
            <span className="navbar-brand-subtitle" style={{ color: logoColor }}>
              SRYN MANAGEMENT PVT LTD
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
                    ? '#ffffff' 
                    : 'rgba(255, 255, 255, 0.85)',
                  borderBottom: location.pathname === link.path ? '2px solid #ffffff' : 'none',
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
                <Link to="/auth" className="btn btn-nav-outline">
                  Login
                </Link>
                <Link to="/auth?signup=true" className="btn btn-nav-primary">
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button - Controlled entirely via CSS responsive classes */}
          <button className="mobile-menu-btn" onClick={toggleMenu}>
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="mobile-drawer" style={mobileDrawerStyle}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', padding: '40px 24px' }}>
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
  fontSize: '1.35rem',
  fontWeight: '600',
  padding: '10px 0',
  display: 'block'
};

// Injected styles for responsive overrides and premium hovers
const style = document.createElement('style');
style.textContent = `
  .mobile-menu-btn {
    display: none;
    background: none;
    border: none;
    color: #ffffff;
    cursor: pointer;
    z-index: 1100;
  }
  @media (max-width: 992px) {
    .nav-links-desktop, .nav-actions-desktop { display: none !important; }
    .mobile-menu-btn { display: block !important; }
  }
  
  .nav-links-desktop a {
    transition: color 0.25s ease, border-color 0.25s ease, opacity 0.25s ease !important;
  }
  
  /* Transparent Navbar state (not scrolled) */
  .navbar:not(.scrolled) .nav-links-desktop a:hover {
    color: #ffffff !important;
    opacity: 1 !important;
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.4);
  }
  
  /* Scrolled Navbar state */
  .navbar.scrolled .nav-links-desktop a:hover {
    color: #ffffff !important;
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
  }

  /* Premium Nav Action Buttons */
  .btn-nav-outline {
    background: transparent !important;
    border: 1.5px solid rgba(255, 255, 255, 0.5) !important;
    color: #ffffff !important;
    font-weight: 600 !important;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
  }
  
  .btn-nav-outline:hover {
    background: #ffffff !important;
    color: var(--primary-color) !important;
    border-color: #ffffff !important;
    transform: translateY(-2px) !important;
    box-shadow: 0 6px 15px rgba(255, 255, 255, 0.2) !important;
  }
  
  .navbar.scrolled .btn-nav-outline {
    border-color: rgba(255, 255, 255, 0.5) !important;
  }
  
  .navbar.scrolled .btn-nav-outline:hover {
    background: #ffffff !important;
    color: var(--primary-color) !important;
    border-color: #ffffff !important;
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15) !important;
  }

  .btn-nav-primary {
    background-color: #ffffff !important;
    color: var(--primary-color) !important;
    border: 1.5px solid #ffffff !important;
    font-weight: 700 !important;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
  }
  
  .btn-nav-primary:hover {
    background-color: transparent !important;
    color: #ffffff !important;
    transform: translateY(-2px) !important;
    box-shadow: 0 6px 15px rgba(255, 255, 255, 0.15) !important;
  }
  
  .navbar.scrolled .btn-nav-primary {
    background-color: #ffffff !important;
    color: var(--primary-color) !important;
    border-color: #ffffff !important;
  }
  
  .navbar.scrolled .btn-nav-primary:hover {
    background-color: transparent !important;
    color: #ffffff !important;
    border-color: #ffffff !important;
  }

  .navbar-brand-title {
    font-weight: normal;
    font-size: 3.2rem;
    color: #ffffff;
    letter-spacing: 0.11em;
    margin-right: -0.11em;
    font-family: 'Frank Bellamy', 'Bangers', sans-serif;
    line-height: 0.8;
    text-transform: uppercase;
  }

  .navbar-brand-subtitle {
    font-size: 0.48rem;
    font-weight: 800;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    line-height: 1;
    transition: color 0.3s;
  }

  @media (max-width: 576px) {
    .navbar-brand-title {
      font-size: 2.2rem !important;
      letter-spacing: 0.09em !important;
      margin-right: -0.09em !important;
    }
    .navbar-brand-subtitle {
      font-size: 0.4rem !important;
      letter-spacing: 0.04em !important;
    }
  }
`;
document.head.appendChild(style);

export default Navbar;
