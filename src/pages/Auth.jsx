import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Briefcase, Key, Mail, Phone, User, CheckCircle2 } from 'lucide-react';

const Auth = () => {
  const { login, signup, verifyOTP, currentUser, showToast } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [isSignup, setIsSignup] = useState(false);
  const [step, setStep] = useState('auth'); // 'auth' or 'otp'
  const [userId, setUserId] = useState('');
  const [receivedOtp, setReceivedOtp] = useState(''); // Keep track for mock convenience display
  
  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Candidate'); // 'Candidate' or 'HR'
  const [otpCode, setOtpCode] = useState('');

  // Handle URL query parameters for registration defaults
  useEffect(() => {
    if (searchParams.get('signup') === 'true') {
      setIsSignup(true);
    }
  }, [searchParams]);

  // If user is already logged in, redirect them immediately to their dashboard
  useEffect(() => {
    if (currentUser) {
      redirectUser(currentUser.role);
    }
  }, [currentUser]);

  const redirectUser = (userRole) => {
    if (userRole === 'Admin') navigate('/admin');
    else if (userRole === 'HR' || userRole === 'HR Executive' || userRole === 'HR Intern') navigate('/hr');
    else navigate('/candidate');
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    if (isSignup) {
      if (!fullName || !mobile || !email || !password) {
        showToast("Please fill in all registration fields.", "warning");
        return;
      }
      try {
        const res = await signup(fullName, mobile, email, password, role);
        setUserId(res.user.uid);
        setReceivedOtp(res.otp);
        setStep('otp');
      } catch (error) {
        // error handled in context toasts
      }
    } else {
      if (!email || !password) {
        showToast("Please enter email and password.", "warning");
        return;
      }
      try {
        const user = await login(email, password);
        redirectUser(user.role);
      } catch (error) {
        // error handled in context toasts
      }
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (!otpCode) {
      showToast("Please enter the 6-digit OTP code.", "warning");
      return;
    }
    try {
      const user = await verifyOTP(userId, otpCode);
      redirectUser(user.role);
    } catch (error) {
      // error handled in context
    }
  };

  return (
    <div style={authPageStyle} className="fade-in">
      <div className="glass-card" style={authCardStyle}>
        
        {/* Header Logo */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ display: 'inline-flex', textDecoration: 'none', marginBottom: '12px' }}>
            <img src="/logo.jpeg" alt="SRYN Logo" style={{ height: '60px', borderRadius: '8px', objectFit: 'contain' }} />
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {step === 'otp' ? 'Email OTP Verification' : (isSignup ? 'Create your recruitment portal account' : 'Access your professional dashboard')}
          </p>
        </div>

        {step === 'auth' ? (
          <form onSubmit={handleAuthSubmit}>
            {isSignup && (
              <>
                <div className="form-group">
                  <label>Full Name</label>
                  <div style={inputContainerStyle}>
                    <User size={18} style={inputIconStyle} />
                    <input
                      type="text"
                      className="form-control"
                      placeholder="E.g., Rajesh Kumar"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      style={{ paddingLeft: '44px' }}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Mobile Number</label>
                  <div style={inputContainerStyle}>
                    <Phone size={18} style={inputIconStyle} />
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="10 digit phone number"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      style={{ paddingLeft: '44px' }}
                      required
                    />
                  </div>
                </div>
              </>
            )}

            <div className="form-group">
              <label>Email Address</label>
              <div style={inputContainerStyle}>
                <Mail size={18} style={inputIconStyle} />
                <input
                  type="email"
                  className="form-control"
                  placeholder="name@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: '44px' }}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <div style={inputContainerStyle}>
                <Key size={18} style={inputIconStyle} />
                <input
                  type="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: '44px' }}
                  required
                />
              </div>
            </div>

            {isSignup && (
              <div className="form-group">
                <label>Select Portal Role</label>
                <select
                  className="form-control"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                >
                  <option value="Candidate">Candidate / Field Executive</option>
                  <option value="HR">HR Officer / Team Leader</option>
                </select>
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px', padding: '12px' }}>
              {isSignup ? 'Register Account' : 'Log In'}
            </button>

            {/* Switch Mode Toggle */}
            <div style={toggleLinkStyle}>
              {isSignup ? (
                <>
                  Already have an account?{' '}
                  <span onClick={() => setIsSignup(false)} style={{ color: 'var(--primary-color)', cursor: 'pointer', fontWeight: 600 }}>
                    Login here
                  </span>
                </>
              ) : (
                <>
                  Don't have an account?{' '}
                  <span onClick={() => setIsSignup(true)} style={{ color: 'var(--primary-color)', cursor: 'pointer', fontWeight: 600 }}>
                    Register here
                  </span>
                </>
              )}
            </div>

            {/* Test Credentials Display */}
            {!isSignup && (
              <div style={credentialsBoxStyle}>
                <h5 style={{ color: 'var(--primary-color)', marginBottom: '8px', fontSize: '0.85rem' }}>🔑 DEMO ACCOUNTS (Use password: password123)</h5>
                <ul style={{ paddingLeft: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <li><strong>Admin:</strong> admin@srynmanagement.com</li>
                <li><strong>HR Manager:</strong> hr@srynmanagement.com</li>
                <li><strong>Candidate:</strong> candidate@srynmanagement.com</li>
                </ul>
              </div>
            )}
          </form>
        ) : (
          /* OTP VERIFICATION STEP */
          <form onSubmit={handleOtpSubmit}>
            <div style={otpSentInfoStyle}>
              <CheckCircle2 color="var(--primary-color)" size={24} />
              <span>We've dispatched a 6-digit OTP code to your registered email ID: <strong>{email}</strong></span>
            </div>

            <div className="form-group" style={{ textAlign: 'center' }}>
              <label style={{ textAlign: 'center', width: '100%', marginBottom: '12px' }}>Enter 6-Digit OTP</label>
              <input
                type="text"
                maxLength="6"
                className="form-control"
                placeholder="1 2 3 4 5 6"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                style={{ textAlign: 'center', fontSize: '1.8rem', letterSpacing: '0.3em', padding: '10px 0' }}
                required
              />
            </div>

            {/* Helper panel displaying OTP code directly for verification ease */}
            <div style={otpHelpPanelStyle}>
              <span>📬 Simulated Verification Code:</span>
              <strong style={{ fontSize: '1.2rem', color: 'var(--primary-color)' }}>{receivedOtp}</strong>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                (Enter this code above or use master bypass code: <strong>123456</strong>)
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '20px', padding: '12px' }}>
              Verify OTP & Proceed
            </button>

            <div style={toggleLinkStyle}>
              Need to change email?{' '}
              <span onClick={() => setStep('auth')} style={{ color: 'var(--primary-color)', cursor: 'pointer', fontWeight: 600 }}>
                Go Back
              </span>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};

// Inline Styles
const authPageStyle = {
  minHeight: 'calc(100vh - var(--navbar-height))',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '40px 24px',
  background: 'radial-gradient(circle at top, rgba(99, 102, 241, 0.05) 0%, rgba(11, 15, 25, 0) 60%)'
};

const authCardStyle = {
  maxWidth: '480px',
  width: '100%',
  padding: '40px 30px'
};

const inputContainerStyle = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center'
};

const inputIconStyle = {
  position: 'absolute',
  left: '16px',
  color: 'var(--text-muted)',
  pointerEvents: 'none'
};

const toggleLinkStyle = {
  textAlign: 'center',
  marginTop: '20px',
  fontSize: '0.9rem',
  color: 'var(--text-secondary)'
};

const credentialsBoxStyle = {
  marginTop: '24px',
  padding: '16px',
  borderRadius: 'var(--radius-md)',
  backgroundColor: 'rgba(255,255,255,0.02)',
  border: '1px solid var(--border-color)',
  textAlign: 'left'
};

const otpSentInfoStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  padding: '16px',
  borderRadius: 'var(--radius-md)',
  backgroundColor: 'var(--primary-light)',
  border: '1px solid rgba(16, 185, 129, 0.2)',
  fontSize: '0.9rem',
  color: 'var(--text-secondary)',
  lineHeight: '1.5',
  marginBottom: '24px',
  textAlign: 'left'
};

const otpHelpPanelStyle = {
  backgroundColor: 'rgba(255,255,255,0.02)',
  border: '1px dashed var(--border-color)',
  borderRadius: 'var(--radius-md)',
  padding: '16px',
  marginTop: '20px',
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  gap: '4px'
};

export default Auth;
