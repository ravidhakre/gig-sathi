import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import Profile from '../Profile';
import { 
  LayoutDashboard, Users, BarChart3, FileText, User, LogOut, Plus, ShieldCheck, Mail, Calendar, HelpCircle, Menu, CheckCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CandidateDashboard = () => {
  const { currentUser, logout, projects, customers, addCustomer, templates, showToast } = useApp();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, customer, report, offer, profile
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Add Customer form state
  const [custForm, setCustForm] = useState({ name: '', mobile: '', email: '', project: '' });

  // Offer letter sign state
  const [offerSigned, setOfferSigned] = useState(() => {
    return localStorage.getItem(`gs_offer_signed_${currentUser?.uid}`) === 'true';
  });

  const handleCustSubmit = async (e) => {
    e.preventDefault();
    if (!custForm.name || !custForm.mobile || !custForm.email || !custForm.project) {
      showToast("Please fill in all customer fields.", "warning");
      return;
    }
    try {
      await addCustomer({
        customerName: custForm.name,
        mobile: custForm.mobile,
        email: custForm.email,
        project: custForm.project
      });
      setCustForm({ name: '', mobile: '', email: '', project: '' });
      showToast("Customer added successfully and card link sent!", "success");
    } catch (err) {}
  };

  const handleSignOffer = () => {
    localStorage.setItem(`gs_offer_signed_${currentUser.uid}`, 'true');
    setOfferSigned(true);
    showToast("Offer letter accepted and signed successfully!", "success");
  };

  const handleDownloadPDF = () => {
    const printWindow = window.open('', '_blank');
    const content = renderOfferLetter();
    
    printWindow.document.write(`
      <html>
        <head>
          <title>SRYN Offer Letter - ${currentUser?.fullName}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #ffffff;
              color: #334155;
              margin: 0;
              padding: 0;
            }
            .contract-page-sheet {
              position: relative;
              background: #ffffff;
              color: #334155;
              padding: 50px 60px;
              margin: 0 auto;
              max-width: 800px;
              min-height: 1080px;
              display: flex;
              flex-direction: column;
              border: none;
              box-sizing: border-box;
              page-break-after: always;
            }
            .contract-page-sheet .watermark-text {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(-30deg);
              font-size: 2.3rem;
              font-weight: 900;
              color: rgba(222, 49, 99, 0.03) !important;
              text-transform: uppercase;
              pointer-events: none;
              user-select: none;
              white-space: nowrap;
              letter-spacing: 0.12em;
              z-index: 1;
            }
            .contract-page-sheet .letterhead-logo {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 2px solid #de3163;
              padding-bottom: 12px;
              margin-bottom: 24px;
            }
            .contract-page-sheet .letterhead-logo .logo-main {
              font-size: 1.8rem;
              font-weight: 800;
              color: #de3163;
              letter-spacing: -0.02em;
            }
            .contract-page-sheet .letterhead-logo .company-cin {
              text-align: right;
              font-size: 0.68rem;
              color: #64748b;
              line-height: 1.4;
            }
            .contract-page-sheet .contract-body {
              flex: 1;
              position: relative;
              z-index: 2;
              font-size: 0.92rem;
              line-height: 1.62;
              text-align: justify;
            }
            .contract-page-sheet .contract-body p {
              margin-bottom: 12px;
            }
            .contract-page-sheet .contract-body h3 {
              margin-top: 22px;
              margin-bottom: 10px;
              color: #de3163;
              font-size: 1rem;
              border-left: 3px solid #de3163;
              padding-left: 10px;
              text-transform: uppercase;
            }
            .contract-page-sheet .contract-body ul {
              margin-bottom: 12px;
              padding-left: 20px;
            }
            .contract-page-sheet .contract-body li {
              margin-bottom: 6px;
            }
            @media print {
              @page {
                size: A4 portrait;
                margin: 1.5cm 1.8cm;
              }
              body {
                background: #ffffff;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .contract-page-sheet {
                padding: 0 !important;
                margin: 0 !important;
                width: 100% !important;
                height: auto !important;
                page-break-after: always !important;
                page-break-inside: avoid !important;
              }
            }
          </style>
        </head>
        <body>
          ${content}
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const renderOfferLetter = () => {
    try {
      const safeTemplates = templates || [];
      const candidateTemplate = safeTemplates.find(t => t.role === 'Candidate') || safeTemplates.find(t => t.role === 'HR') || {
        content: `<h3>SRYN MANAGEMENT PRIVATE LIMITED</h3><p>Dear {{name}}, offer letter loading...</p>`
      };
      
      // Replace placeholders with candidate details dynamically
      const todayStr = new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });

      const userAddress = [
        currentUser?.address,
        currentUser?.city,
        currentUser?.state,
        currentUser?.pincode
      ].filter(Boolean).join(', ') || 'Not Provided (Complete Candidate Profile)';

      const userRole = currentUser?.roleApplied || currentUser?.position || 'Field Executive';
      const userSalary = currentUser?.salary || '₹8,000/- (Rupees Eight Thousand Only)';
      const userWorkingHours = currentUser?.workingHours || '11:00 A.M. to 7:30 P.M.';
      const userPerformanceTarget = currentUser?.performanceTarget || 'Fifty (50) candidates';

      let html = (candidateTemplate?.content || '')
        .replace(/{{name}}/g, currentUser?.fullName || 'Candidate')
        .replace(/{{email}}/g, currentUser?.email || 'N/A')
        .replace(/{{mobile}}/g, currentUser?.mobile || 'N/A')
        .replace(/{{address}}/g, userAddress)
        .replace(/{{date}}/g, todayStr)
        .replace(/{{position}}/g, userRole)
        .replace(/{{role}}/g, userRole)
        .replace(/{{salary}}/g, userSalary)
        .replace(/{{working_hours}}/g, userWorkingHours)
        .replace(/{{performance_target}}/g, userPerformanceTarget);

      return html;
    } catch (err) {
      console.error("Error in candidate renderOfferLetter:", err);
      return `<div style="padding: 20px; text-align: center;"><h3>SRYN MANAGEMENT PRIVATE LIMITED</h3><p>Offer Letter Loading...</p></div>`;
    }
  };

  // Metrics
  const activeEarnings = customers.length * 1200; // Mock calculation based on Rs.1200 commission average
  const pendingKYC = customers.filter(c => c.status === 'Pending KYC').length;

  return (
    <div className="dashboard-layout fade-in">
      {/* Mobile Header Bar */}
      <div className="dashboard-mobile-header">
        <button onClick={() => setSidebarOpen(true)} className="mobile-toggle-btn">
          <Menu size={24} />
        </button>
        <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>SRYN Exec Panel</span>
      </div>

      {/* Sidenav Overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'active' : ''}`}>
        <div style={sidebarLogoStyle}>
          <ShieldCheck size={24} color="var(--primary-color)" />
          <span style={{ fontWeight: 800, fontSize: '1.25rem' }}>SRYN <span style={{ fontSize: '0.75rem', color: 'var(--primary-color)' }}>Exec</span></span>
        </div>

        <div style={sidebarMenuStyle}>
          <button 
            onClick={() => { setActiveTab('dashboard'); setSidebarOpen(false); }}
            style={{ ...sidebarLinkStyle, ...(activeTab === 'dashboard' ? activeLinkStyle : {}) }}
          >
            <LayoutDashboard size={18} /> Dashboard
          </button>
          <button 
            onClick={() => { setActiveTab('customer'); setSidebarOpen(false); }}
            style={{ ...sidebarLinkStyle, ...(activeTab === 'customer' ? activeLinkStyle : {}) }}
          >
            <Users size={18} /> Customers Onboarded
          </button>
          <button 
            onClick={() => { setActiveTab('report'); setSidebarOpen(false); }}
            style={{ ...sidebarLinkStyle, ...(activeTab === 'report' ? activeLinkStyle : {}) }}
          >
            <BarChart3 size={18} /> Earnings Reports
          </button>
          <button 
            onClick={() => { setActiveTab('offer'); setSidebarOpen(false); }}
            style={{ ...sidebarLinkStyle, ...(activeTab === 'offer' ? activeLinkStyle : {}) }}
          >
            <FileText size={18} /> View Offer Letter
          </button>
          <button 
            onClick={() => { setActiveTab('profile'); setSidebarOpen(false); }}
            style={{ ...sidebarLinkStyle, ...(activeTab === 'profile' ? activeLinkStyle : {}) }}
          >
            <User size={18} /> KYC Profile
          </button>
        </div>

        <div style={{ marginTop: 'auto', padding: '20px' }}>
          <button onClick={() => { logout(); navigate('/'); }} style={logoutBtnStyle}>
            <LogOut size={18} /> Log Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="dashboard-main">
        
        {/* --- DASHBOARD TAB --- */}
        {activeTab === 'dashboard' && (
          <div style={tabContentStyle}>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Executive Dashboard</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>Welcome back, {currentUser?.fullName}. Check your commission pipelines.</p>
            
            {/* Metrics cards */}
            <div className="grid-4" style={{ marginBottom: '40px' }}>
              <div className="premium-metric-card metric-cherry">
                <Users size={28} color="var(--primary-color)" />
                <div>
                  <div style={metricLabelStyle}>Total Customers</div>
                  <div style={metricValueStyle}>{customers.length}</div>
                </div>
              </div>
              <div className="premium-metric-card metric-orange">
                <HelpCircle size={28} color="var(--accent-color)" />
                <div>
                  <div style={metricLabelStyle}>Pending KYC</div>
                  <div style={metricValueStyle}>{pendingKYC}</div>
                </div>
              </div>
              <div className="premium-metric-card metric-purple">
                <BarChart3 size={28} color="var(--secondary-color)" />
                <div>
                  <div style={metricLabelStyle}>Estimated Commissions</div>
                  <div style={metricValueStyle}>₹{activeEarnings.toLocaleString('en-IN')}</div>
                </div>
              </div>
              <div className="premium-metric-card metric-blue">
                <FileText size={28} color={offerSigned ? "var(--primary-color)" : "var(--danger-color)"} />
                <div>
                  <div style={metricLabelStyle}>Offer Letter</div>
                  <div style={metricValueStyle}>{offerSigned ? 'Signed' : 'Pending Sign'}</div>
                </div>
              </div>
            </div>

            {/* Sub-panels */}
            <div className="grid-2">
              <div className="card" style={{ textAlign: 'left' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Active Sourcing Campaigns</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {projects.slice(0, 3).map(p => (
                    <div key={p.id} style={campaignRowStyle}>
                      <div>
                        <strong>{p.title}</strong>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{p.category}</div>
                      </div>
                      <div style={payoutBadgeStyle}>{p.commission}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card" style={{ textAlign: 'left' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>KYC Checklist Status</h3>
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <li style={checkItemStyle}>
                    <div style={{ ...checkBulletStyle, backgroundColor: currentUser?.aadharNumber ? 'var(--primary-color)' : 'transparent' }}></div>
                    <span>Aadhar Verification: {currentUser?.aadharNumber ? 'Validated' : 'Required'}</span>
                  </li>
                  <li style={checkItemStyle}>
                    <div style={{ ...checkBulletStyle, backgroundColor: currentUser?.address ? 'var(--primary-color)' : 'transparent' }}></div>
                    <span>Address Coordinates: {currentUser?.address ? 'Stored' : 'Required'}</span>
                  </li>
                  <li style={checkItemStyle}>
                    <div style={{ ...checkBulletStyle, backgroundColor: currentUser?.aadharFront && currentUser?.aadharBack ? 'var(--primary-color)' : 'transparent' }}></div>
                    <span>Aadhar Card Photos Uploaded: {currentUser?.aadharFront ? 'Yes' : 'No'}</span>
                  </li>
                  <li style={checkItemStyle}>
                    <div style={{ ...checkBulletStyle, backgroundColor: currentUser?.resume ? 'var(--primary-color)' : 'transparent' }}></div>
                    <span>Professional Resume Uploaded: {currentUser?.resume ? 'Yes' : 'No'}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* --- CUSTOMER TAB --- */}
        {activeTab === 'customer' && (
          <div style={tabContentStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <div>
                <h2 style={{ fontSize: '1.8rem' }}>Customer Database</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Add your onboarded customers to send them link forms.</p>
              </div>
            </div>

            <div className="grid-2" style={{ alignItems: 'start' }}>
              {/* Form card */}
              <div className="card">
                <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Plus size={18} color="var(--primary-color)" /> Add Onboarded Customer
                </h3>
                <form onSubmit={handleCustSubmit}>
                  <div className="form-group">
                    <label>Customer Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter customer name"
                      value={custForm.name}
                      onChange={(e) => setCustForm({ ...custForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Mobile Number</label>
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="10 digit number"
                      value={custForm.mobile}
                      onChange={(e) => setCustForm({ ...custForm, mobile: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="customer@email.com"
                      value={custForm.email}
                      onChange={(e) => setCustForm({ ...custForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Campaign / Project</label>
                    <select
                      className="form-control"
                      value={custForm.project}
                      onChange={(e) => setCustForm({ ...custForm, project: e.target.value })}
                      required
                    >
                      <option value="">-- Choose Campaign --</option>
                      {projects.map(p => (
                        <option key={p.id} value={p.title}>{p.title}</option>
                      ))}
                    </select>
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                    Register Customer & Send Link
                  </button>
                </form>
              </div>

              {/* Guide Card */}
              <div className="glass-card" style={{ textAlign: 'left', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '12px' }}><span className="text-gradient">How it Works?</span></h3>
                <ol style={{ paddingLeft: '16px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.95rem' }}>
                  <li>Enter the customer details here immediately after explaining the bank card features.</li>
                  <li>Our server automatically dispatches the custom working link (configured by our system admin) to their email.</li>
                  <li>The customer opens the link, completes their onboarding/KYC.</li>
                  <li>Once validated, your commissions will be calculated and visible in your reports.</li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* --- REPORTS TAB --- */}
        {activeTab === 'report' && (
          <div style={tabContentStyle}>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Customer Submissions & Earnings</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>Historical ledger of customers registered by you.</p>

            <div className="crm-table-container">
              <table className="crm-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Customer Name</th>
                    <th>Mobile</th>
                    <th>Campaign Project</th>
                    <th>Status</th>
                    <th>Earned</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.length > 0 ? (
                    customers.map((c) => (
                      <tr key={c.id}>
                        <td>{c.date}</td>
                        <td style={{ fontWeight: '700' }}>{c.customerName}</td>
                        <td>{c.mobile}</td>
                        <td>{c.project}</td>
                        <td>
                          <span className={`badge ${c.status === 'Active' ? 'badge-hired' : 'badge-calling'}`}>
                            {c.status}
                          </span>
                        </td>
                        <td style={{ fontWeight: '700', color: 'var(--primary-color)' }}>
                          {c.status === 'Active' ? '₹1,200' : '₹0 (Pending)'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>
                        No customers added yet. Navigate to "Customers" tab to register your first lead.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- OFFER LETTER TAB --- */}
        {activeTab === 'offer' && (
          <div style={tabContentStyle}>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Your Employment Offer Letter</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>Review and sign your active project contract.</p>

            <div style={{ maxWidth: '850px', margin: '0 auto' }}>
              <div className="contract-document-wrapper">
                <div 
                  dangerouslySetInnerHTML={{ __html: renderOfferLetter() }} 
                  style={{ textAlign: 'left' }}
                />
              </div>
              
              <hr style={{ margin: '30px 0', borderColor: '#e2e8f0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-surface)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>CONTRACT DATE</div>
                  <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>{
                    new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
                  }</strong>
                </div>

                {offerSigned ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-color)', fontWeight: '700' }}>
                      <CheckCircle2 size={24} /> Signed & Accepted
                    </div>
                    <button onClick={handleDownloadPDF} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                      Download PDF
                    </button>
                  </div>
                ) : (
                  <button onClick={handleSignOffer} className="btn btn-primary" style={{ padding: '12px 30px' }}>
                    Accept & Sign Contract
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* --- PROFILE TAB --- */}
        {activeTab === 'profile' && (
          <div style={tabContentStyle}>
            <Profile />
          </div>
        )}

      </main>
    </div>
  );
};

// Inline Styles
const sidebarLogoStyle = {
  padding: '24px',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  borderBottom: '1px solid var(--border-color)'
};

const sidebarMenuStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  padding: '20px'
};

const sidebarLinkStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '12px 16px',
  borderRadius: 'var(--radius-md)',
  fontSize: '0.95rem',
  fontWeight: '600',
  color: 'var(--text-secondary)',
  textAlign: 'left',
  transition: 'all var(--transition-fast)'
};

const activeLinkStyle = {
  backgroundColor: 'var(--primary-light)',
  color: 'var(--primary-color)'
};

const logoutBtnStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '12px 16px',
  borderRadius: 'var(--radius-md)',
  fontSize: '0.95rem',
  fontWeight: '600',
  color: 'var(--danger-color)',
  width: '100%',
  textAlign: 'left',
  backgroundColor: 'var(--danger-light)',
  border: '1px solid rgba(239, 68, 68, 0.1)'
};

const tabContentStyle = {
  display: 'flex',
  flexDirection: 'column',
  textAlign: 'left'
};

const metricCardStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '20px',
  textAlign: 'left'
};

const metricLabelStyle = {
  fontSize: '0.8rem',
  color: 'var(--text-muted)',
  fontWeight: '600',
  textTransform: 'uppercase'
};

const metricValueStyle = {
  fontSize: '1.6rem',
  fontWeight: '800',
  color: 'var(--text-primary)',
  marginTop: '4px'
};

const campaignRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '12px',
  borderRadius: 'var(--radius-sm)',
  backgroundColor: 'rgba(255,255,255,0.01)',
  border: '1px solid var(--border-color)'
};

const payoutBadgeStyle = {
  fontSize: '0.85rem',
  fontWeight: '700',
  color: 'var(--primary-color)',
  backgroundColor: 'var(--primary-light)',
  padding: '4px 10px',
  borderRadius: 'var(--radius-sm)'
};

const checkItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  fontSize: '0.95rem'
};

const checkBulletStyle = {
  width: '16px',
  height: '16px',
  borderRadius: '50%',
  border: '2px solid var(--primary-color)',
  flexShrink: 0
};

// Injected styles for hover states
const dbInjected = document.createElement('style');
dbInjected.textContent = `
  aside button:hover { background-color: var(--bg-surface-hover); color: var(--text-primary); }
  aside button[style*="activeLinkStyle"]:hover { background-color: var(--primary-light) !important; color: var(--primary-color) !important; }
`;
document.head.appendChild(dbInjected);

export default CandidateDashboard;
