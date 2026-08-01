import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';

// Public pages
import Home from './pages/Home';
import About from './pages/About';
import Projects from './pages/Projects';
import Contact from './pages/Contact';
import Auth from './pages/Auth';

// Dashboards
import CandidateDashboard from './pages/dashboards/CandidateDashboard';
import HRDashboard from './pages/dashboards/HRDashboard';
import AdminDashboard from './pages/dashboards/AdminDashboard';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// A Layout wrapper to show/hide navbar and footer based on active route
const AppLayout = ({ children }) => {
  const location = useLocation();
  // Check if current route is a dashboard route
  const isDashboard = 
    location.pathname.startsWith('/candidate') || 
    location.pathname.startsWith('/hr') || 
    location.pathname.startsWith('/admin');

  const isHome = location.pathname === '/';

  return (
    <div className="app-container">
      {!isDashboard && <Navbar />}
      {!isDashboard && !isHome && <div style={{ height: 'var(--navbar-height)' }}></div>}
      <main className="main-content">
        {children}
      </main>
      {!isDashboard && <Footer />}
    </div>
  );
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("SRYN Portal Render Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '60px 20px', textAlign: 'center', maxWidth: '600px', margin: '80px auto', background: '#ffffff', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
          <h2 style={{ color: '#de3163', fontSize: '1.6rem', marginBottom: '12px' }}>SRYN Management Portal</h2>
          <p style={{ color: '#475569', marginBottom: '24px' }}>Session update detected. Please click below to reload your dashboard.</p>
          <button 
            onClick={() => { window.location.href = '/auth'; }} 
            className="btn btn-primary"
            style={{ padding: '12px 24px', background: '#de3163', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Reload SRYN Portal Login
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Route protection wrappers
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { currentUser, loading } = useApp();

  if (loading) {
    return (
      <div style={loadingContainerStyle}>
        <div className="spinner" style={spinnerStyle}></div>
        <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>Loading SRYN Portal...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/auth" replace />;
  }

  const role = currentUser?.role || 'Candidate';
  if (allowedRoles && !allowedRoles.includes(role)) {
    if (role === 'Admin') return <Navigate to="/admin" replace />;
    if (role === 'HR' || role === 'HR Executive' || role === 'HR Intern') return <Navigate to="/hr" replace />;
    return <Navigate to="/candidate" replace />;
  }

  return children;
};

function App() {
  return (
    <AppProvider>
      <ErrorBoundary>
        <Router>
          <AppLayout>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/auth" element={<Auth />} />

              {/* Candidate Dashboard */}
              <Route 
                path="/candidate" 
                element={
                  <ProtectedRoute allowedRoles={['Candidate']}>
                    <CandidateDashboard />
                  </ProtectedRoute>
                } 
              />

              {/* HR Dashboard */}
              <Route 
                path="/hr" 
                element={
                  <ProtectedRoute allowedRoles={['HR', 'HR Executive', 'HR Intern', 'Admin']}>
                    <HRDashboard />
                  </ProtectedRoute>
                } 
              />

              {/* Admin Dashboard */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute allowedRoles={['Admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />

              {/* Catch-all Redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AppLayout>
        </Router>
      </ErrorBoundary>
    </AppProvider>
  );
}

// Inline Styles
const loadingContainerStyle = {
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'var(--bg-color)'
};

const spinnerStyle = {
  width: '50px',
  height: '50px',
  border: '3px solid var(--border-color)',
  borderTopColor: 'var(--primary-color)',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite'
};

const spinAnimation = document.createElement('style');
spinAnimation.textContent = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(spinAnimation);

export default App;
