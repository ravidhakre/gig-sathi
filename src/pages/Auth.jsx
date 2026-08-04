import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Briefcase, Key, Mail, Phone, User, CheckCircle2, ShieldCheck, Award, Building2, Sparkles, Eye, EyeOff, ArrowRight, Lock } from 'lucide-react';

const Auth = () => {
  const { login, signup, verifyOTP, currentUser, showToast } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [isSignup, setIsSignup] = useState(false);
  const [step, setStep] = useState('auth'); // 'auth' or 'otp'
  const [userId, setUserId] = useState('');
  const [receivedOtp, setReceivedOtp] = useState(''); 
  const [showPassword, setShowPassword] = useState(false);
  
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

  // If user is already logged in, redirect them immediately
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

  const handleQuickDemoLogin = async (demoEmail, demoRole) => {
    setEmail(demoEmail);
    setPassword('password123');
    try {
      const user = await login(demoEmail, 'password123');
      redirectUser(user.role || demoRole);
    } catch (error) {}
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
      <div style={authContainerStyle}>
        
        {/* LEFT PANEL: Corporate Branding & Feature Highlights */}
        <div style={leftBrandingStyle}>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(222,49,99,0.15)', border: '1px solid rgba(222,49,99,0.3)', padding: '6px 14px', borderRadius: '20px', marginBottom: '24px' }}>
              <Sparkles size={14} color="#de3163" />
              <span style={{ fontSize: '0.78rem', color: '#de3163', fontWeight: '800', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                SRYN Official Recruitment Portal
              </span>
            </div>

            <h1 style={{ fontSize: '2.5rem', fontWeight: '900', lineHeight: '1.2', color: '#ffffff', marginBottom: '16px' }}>
              Build Your Career & Earn Fixed Payouts in Your Hometown
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '32px' }}>
              Join SRYN Management Pvt. Ltd. as a Customer Relationship Executive or HR Specialist. Access official offer letters, employee dashboards, and daily guidance.
            </p>

            {/* Feature Bullet Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '40px' }}>
              <div style={featureRowStyle}>
                <div style={featureIconWrapperStyle}>
                  <Briefcase size={20} color="#de3163" />
                </div>
                <div>
                  <h4 style={{ color: '#ffffff', fontSize: '0.95rem', margin: 0 }}>Hometown Work Opportunities</h4>
                  <p style={{ color: '#64748b', fontSize: '0.82rem', margin: 0 }}>Fixed ₹15,000 / month salary + performance incentives</p>
                </div>
              </div>

              <div style={featureRowStyle}>
                <div style={featureIconWrapperStyle}>
                  <Award size={20} color="#3b82f6" />
                </div>
                <div>
                  <h4 style={{ color: '#ffffff', fontSize: '0.95rem', margin: 0 }}>Official Appointment & ID Card</h4>
                  <p style={{ color: '#64748b', fontSize: '0.82rem', margin: 0 }}>Authorized SRYN Offer Letter with digital signature & seal</p>
                </div>
              </div>

              <div style={featureRowStyle}>
                <div style={featureIconWrapperStyle}>
                  <ShieldCheck size={20} color="#10b981" />
                </div>
                <div>
                  <h4 style={{ color: '#ffffff', fontSize: '0.95rem', margin: 0 }}>Corporate Security & Guidance</h4>
                  <p style={{ color: '#64748b', fontSize: '0.82rem', margin: 0 }}>100% Free sales conversation & communication training</p>
                </div>
              </div>
            </div>

            {/* Corporate Registered Tag */}
            <div style={{ paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <strong style={{ display: 'block', color: '#ffffff', fontSize: '0.85rem' }}>SRYN MANAGEMENT PVT. LTD.</strong>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>CIN: U51900UP2022PTC169096</span>
              </div>
              <span style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)', padding: '4px 10px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 'bold' }}>
                ✓ Verified Corporate
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Interactive Form & Tab Switcher */}
        <div style={rightFormPanelStyle}>
          
          {/* Top Logo */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', textDecoration: 'none' }}>
              <span style={{ fontWeight: 'normal', fontSize: '3.6rem', color: 'var(--text-primary)', letterSpacing: '0.11em', marginRight: '-0.11em', fontFamily: "'Frank Bellamy', 'Bangers', sans-serif", lineHeight: 0.8, textTransform: 'uppercase' }}>
                SRYN
              </span>
              <span style={{ fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.08em', color: 'var(--primary-color)', textTransform: 'uppercase', marginTop: '4px' }}>
                RECRUITMENT & HR PORTAL
              </span>
            </div>
          </div>

          {/* Mode Switcher Tabs (Login vs Register) */}
          {step === 'auth' && (
            <div style={segmentedTabStyle}>
              <button
                type="button"
                onClick={() => setIsSignup(false)}
                style={{
                  ...segmentedBtnStyle,
                  background: !isSignup ? 'var(--primary-color)' : 'transparent',
                  color: !isSignup ? '#ffffff' : 'var(--text-secondary)'
                }}
              >
                Sign In (Login)
              </button>
              <button
                type="button"
                onClick={() => setIsSignup(true)}
                style={{
                  ...segmentedBtnStyle,
                  background: isSignup ? 'var(--primary-color)' : 'transparent',
                  color: isSignup ? '#ffffff' : 'var(--text-secondary)'
                }}
              >
                Create Account
              </button>
            </div>
          )}

          {step === 'auth' ? (
            <form onSubmit={handleAuthSubmit}>
              {isSignup && (
                <>
                  <div className="form-group">
                    <label style={labelStyle}>Full Name</label>
                    <div style={inputContainerStyle}>
                      <User size={18} style={inputIconStyle} />
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Rajesh Kumar"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        style={{ paddingLeft: '44px' }}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label style={labelStyle}>Mobile Number</label>
                    <div style={inputContainerStyle}>
                      <Phone size={18} style={inputIconStyle} />
                      <input
                        type="tel"
                        className="form-control"
                        placeholder="10 digit WhatsApp phone number"
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
                <label style={labelStyle}>Email Address</label>
                <div style={inputContainerStyle}>
                  <Mail size={18} style={inputIconStyle} />
                  <input
                    type="email"
                    className="form-control"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ paddingLeft: '44px' }}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label style={labelStyle}>Password</label>
                <div style={inputContainerStyle}>
                  <Key size={18} style={inputIconStyle} />
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ paddingLeft: '44px', paddingRight: '44px' }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '14px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Visual Role Selector Cards (When Signup) */}
              {isSignup && (
                <div className="form-group">
                  <label style={labelStyle}>Select Account Role</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div
                      onClick={() => setRole('Candidate')}
                      style={{
                        padding: '12px',
                        borderRadius: '8px',
                        border: role === 'Candidate' ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                        background: role === 'Candidate' ? 'var(--primary-light)' : 'var(--surface-color)',
                        cursor: 'pointer',
                        textAlign: 'center'
                      }}
                    >
                      <User size={20} color={role === 'Candidate' ? 'var(--primary-color)' : 'var(--text-muted)'} />
                      <div style={{ fontSize: '0.85rem', fontWeight: 'bold', marginTop: '4px', color: role === 'Candidate' ? 'var(--primary-color)' : 'var(--text-primary)' }}>
                        Candidate
                      </div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Field Executive</span>
                    </div>

                    <div
                      onClick={() => setRole('HR')}
                      style={{
                        padding: '12px',
                        borderRadius: '8px',
                        border: role === 'HR' ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                        background: role === 'HR' ? 'var(--primary-light)' : 'var(--surface-color)',
                        cursor: 'pointer',
                        textAlign: 'center'
                      }}
                    >
                      <Briefcase size={20} color={role === 'HR' ? 'var(--primary-color)' : 'var(--text-muted)'} />
                      <div style={{ fontSize: '0.85rem', fontWeight: 'bold', marginTop: '4px', color: role === 'HR' ? 'var(--primary-color)' : 'var(--text-primary)' }}>
                        HR Officer
                      </div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Team Leader / Recruiter</span>
                    </div>
                  </div>
                </div>
              )}

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '12px', padding: '14px', fontSize: '1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                {isSignup ? 'Register New Account' : 'Sign In to Portal'} <ArrowRight size={18} />
              </button>

              {/* Toggle Switch */}
              <div style={toggleLinkStyle}>
                {isSignup ? (
                  <>
                    Already registered?{' '}
                    <span onClick={() => setIsSignup(false)} style={{ color: 'var(--primary-color)', cursor: 'pointer', fontWeight: 'bold' }}>
                      Sign In here
                    </span>
                  </>
                ) : (
                  <>
                    New to SRYN Portal?{' '}
                    <span onClick={() => setIsSignup(true)} style={{ color: 'var(--primary-color)', cursor: 'pointer', fontWeight: 'bold' }}>
                      Create an account
                    </span>
                  </>
                )}
              </div>

              {/* One-Tap Demo Accounts Selector */}
              {!isSignup && (
                <div style={credentialsBoxStyle}>
                  <div style={{ fontSize: '0.78rem', fontWeight: '800', color: 'var(--primary-color)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Lock size={14} /> One-Tap Quick Demo Login:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => handleQuickDemoLogin('admin@srynmanagement.com', 'Admin')}
                      className="btn btn-outline"
                      style={{ padding: '8px 12px', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', textTransform: 'none' }}
                    >
                      <span>👑 <strong>Admin Portal</strong> (Full Control)</span>
                      <ArrowRight size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickDemoLogin('hr@srynmanagement.com', 'HR')}
                      className="btn btn-outline"
                      style={{ padding: '8px 12px', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', textTransform: 'none' }}
                    >
                      <span>💼 <strong>HR Officer Portal</strong> (CRM & Scripts)</span>
                      <ArrowRight size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickDemoLogin('candidate@srynmanagement.com', 'Candidate')}
                      className="btn btn-outline"
                      style={{ padding: '8px 12px', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', textTransform: 'none' }}
                    >
                      <span>👨‍💼 <strong>Candidate Portal</strong> (Offer & Tasks)</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
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
                <label style={{ textAlign: 'center', width: '100%', marginBottom: '12px', fontWeight: 'bold' }}>Enter 6-Digit OTP</label>
                <input
                  type="text"
                  maxLength="6"
                  className="form-control"
                  placeholder="1 2 3 4 5 6"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  style={{ textAlign: 'center', fontSize: '1.8rem', letterSpacing: '0.3em', padding: '12px 0', fontWeight: 'bold', color: 'var(--primary-color)' }}
                  required
                />
              </div>

              {/* Helper panel displaying OTP code directly */}
              <div style={otpHelpPanelStyle}>
                <span>📬 Verification OTP Code:</span>
                <strong style={{ fontSize: '1.4rem', color: 'var(--primary-color)', letterSpacing: '2px' }}>{receivedOtp || '123456'}</strong>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  (Enter code above or bypass with master code: <strong>123456</strong>)
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '20px', padding: '14px', fontSize: '1rem', fontWeight: 'bold' }}>
                Verify OTP & Proceed to Portal
              </button>

              <div style={toggleLinkStyle}>
                Need to change email?{' '}
                <span onClick={() => setStep('auth')} style={{ color: 'var(--primary-color)', cursor: 'pointer', fontWeight: 'bold' }}>
                  Go Back
                </span>
              </div>
            </form>
          )}

        </div>
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
  padding: '40px 20px',
  background: 'radial-gradient(circle at top left, rgba(222,49,99,0.08) 0%, rgba(15,23,42,0) 60%)'
};

const authContainerStyle = {
  maxWidth: '1040px',
  width: '100%',
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
  borderRadius: '20px',
  overflow: 'hidden',
  boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
  border: '1px solid var(--border-color)',
  background: 'var(--card-bg)'
};

const leftBrandingStyle = {
  padding: '48px 40px',
  background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #31102f 100%)',
  color: '#ffffff',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  position: 'relative'
};

const featureRowStyle = {
  display: 'flex',
  gap: '14px',
  alignItems: 'center',
  background: 'rgba(255,255,255,0.04)',
  padding: '12px 16px',
  borderRadius: '12px',
  border: '1px solid rgba(255,255,255,0.08)'
};

const featureIconWrapperStyle = {
  background: 'rgba(255,255,255,0.08)',
  padding: '10px',
  borderRadius: '10px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const rightFormPanelStyle = {
  padding: '40px 36px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  background: 'var(--card-bg)'
};

const segmentedTabStyle = {
  display: 'flex',
  background: 'var(--surface-color)',
  padding: '4px',
  borderRadius: '10px',
  border: '1px solid var(--border-color)',
  marginBottom: '24px'
};

const segmentedBtnStyle = {
  flex: 1,
  padding: '10px 16px',
  borderRadius: '8px',
  border: 'none',
  fontSize: '0.88rem',
  fontWeight: '700',
  cursor: 'pointer',
  transition: 'all 0.2s ease'
};

const labelStyle = {
  fontSize: '0.85rem',
  fontWeight: '600',
  marginBottom: '6px',
  display: 'block'
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
  marginTop: '18px',
  fontSize: '0.88rem',
  color: 'var(--text-secondary)'
};

const credentialsBoxStyle = {
  marginTop: '20px',
  padding: '16px',
  borderRadius: '12px',
  backgroundColor: 'var(--surface-color)',
  border: '1px solid var(--border-color)',
  textAlign: 'left'
};

const otpSentInfoStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  padding: '16px',
  borderRadius: '10px',
  backgroundColor: 'var(--primary-light)',
  border: '1px solid rgba(16, 185, 129, 0.2)',
  fontSize: '0.88rem',
  color: 'var(--text-secondary)',
  lineHeight: '1.5',
  marginBottom: '24px',
  textAlign: 'left'
};

const otpHelpPanelStyle = {
  backgroundColor: 'var(--surface-color)',
  border: '1px dashed var(--border-color)',
  borderRadius: '10px',
  padding: '16px',
  marginTop: '20px',
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  gap: '4px'
};

export default Auth;
