import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import Profile from '../Profile';
import { 
  LayoutDashboard, Users, BarChart3, FileText, User, LogOut, Plus, ShieldCheck, Mail, Calendar, HelpCircle, Menu, CheckCircle2,
  Copy, Send, Smartphone, AlertTriangle, ExternalLink, BookOpen, Download, Eye, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CandidateDashboard = () => {
  const { currentUser, logout, projects, customers, addCustomer, templates, trainingModules, showToast } = useApp();
  const navigate = useNavigate();
  
  const isApproved = currentUser?.profileApproved === true;

  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, customer, report, training, offer, profile
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedTrainCat, setSelectedTrainCat] = useState('ALL');
  const [previewTrainModal, setPreviewTrainModal] = useState(null);

  // Add Customer form state
  const [custForm, setCustForm] = useState({ name: '', mobile: '', email: '', project: '' });
  const [submittingCust, setSubmittingCust] = useState(false);

  // Filter training modules for Candidate
  const candTrainingModules = (trainingModules || []).filter(m => !m.targetRole || m.targetRole === 'Candidate' || m.targetRole === 'ALL');
  const filteredTraining = candTrainingModules.filter(m => selectedTrainCat === 'ALL' || m.category === selectedTrainCat);

  const resolvePdfUrl = (mod) => {
    if (!mod) return '';
    if (mod.pdfUrl && mod.pdfUrl.startsWith('data:')) return mod.pdfUrl;
    if (mod.id) {
      const stored = localStorage.getItem(`gs_train_pdf_${mod.id}`);
      if (stored && stored.startsWith('data:')) return stored;
    }
    return mod.pdfUrl || '';
  };

  const createPdfBlobUrl = (dataUrl) => {
    if (!dataUrl || !dataUrl.startsWith('data:')) return null;
    try {
      const parts = dataUrl.split(';base64,');
      if (parts.length < 2) return null;
      const contentType = parts[0].replace('data:', '') || 'application/pdf';
      const raw = window.atob(parts[1]);
      const rawLength = raw.length;
      const uInt8Array = new Uint8Array(rawLength);
      for (let i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
      }
      const blob = new Blob([uInt8Array], { type: contentType });
      return URL.createObjectURL(blob);
    } catch (e) {
      console.error("Failed to create PDF blob URL:", e);
      return null;
    }
  };

  const handleDownloadTrainingPDF = (mod) => {
    const pdfData = resolvePdfUrl(mod);
    const blobUrl = createPdfBlobUrl(pdfData);

    if (blobUrl) {
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = mod.fileName || `${(mod.title || 'Training_Doc').replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
      showToast(`Downloading "${mod.fileName || 'Training_Doc.pdf'}"...`, "success");
    } else {
      showToast("PDF document data is unavailable for download.", "warning");
    }
  };

  // Deduplicate customer list by ID / Mobile
  const uniqueCustomers = Array.from(
    new Map((customers || []).map(c => [c.id || `${c.mobile}_${c.date}_${c.customerName}`, c])).values()
  );

  const getCampaignWorkingLink = (projectTitle) => {
    const target = (projects || []).find(p => p.title === projectTitle) || (projects || [])[0];
    return target?.workingLink || 'https://www.sryn.online/auth?signup=true';
  };

  const handleCopyLink = (link) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(link);
      showToast("Campaign link copied to clipboard!", "success");
    } else {
      showToast(`Campaign link: ${link}`, "info", 6000);
    }
  };

  const handleSendWhatsApp = (cust) => {
    const link = getCampaignWorkingLink(cust.project);
    const msg = encodeURIComponent(`Dear ${cust.customerName},\n\nPlease complete your application for ${cust.project} using the official link below:\n${link}\n\n- SRYN Management`);
    window.open(`https://wa.me/91${cust.mobile}?text=${msg}`, '_blank');
  };

  const handleSendSMS = (cust) => {
    const link = getCampaignWorkingLink(cust.project);
    const msg = encodeURIComponent(`Apply for ${cust.project} here: ${link}`);
    window.open(`sms:${cust.mobile}?body=${msg}`, '_blank');
  };

  // Offer letter sign state
  const [offerSigned, setOfferSigned] = useState(() => {
    return currentUser?.offerSigned === true || (currentUser?.uid && localStorage.getItem(`gs_offer_signed_${currentUser?.uid}`) === 'true');
  });

  useEffect(() => {
    if (currentUser?.offerSigned === true || (currentUser?.uid && localStorage.getItem(`gs_offer_signed_${currentUser?.uid}`) === 'true')) {
      setOfferSigned(true);
    }
  }, [currentUser?.offerSigned, currentUser?.uid]);

  const handleCustSubmit = async (e) => {
    e.preventDefault();
    if (submittingCust) return;
    if (!custForm.name || !custForm.mobile || !custForm.email || !custForm.project) {
      showToast("Please fill in all customer fields.", "warning");
      return;
    }
    setSubmittingCust(true);
    try {
      await addCustomer({
        customerName: custForm.name,
        mobile: custForm.mobile,
        email: custForm.email,
        project: custForm.project
      });
      setCustForm({ name: '', mobile: '', email: '', project: '' });
      showToast("Customer added successfully and card link sent!", "success");
    } catch (err) {
      showToast(err.message || "Error adding customer", "danger");
    } finally {
      setSubmittingCust(false);
    }
  };

  const handleSignOffer = async () => {
    const now = new Date();
    const offerSignedDate = now.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    const joiningObj = new Date(now);
    joiningObj.setDate(joiningObj.getDate() + 1);
    const joiningDate = joiningObj.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    if (currentUser?.uid || currentUser?.email) {
      const targetId = currentUser.uid || currentUser.email;
      localStorage.setItem(`gs_offer_signed_${targetId}`, 'true');
      localStorage.setItem(`gs_offer_signed_date_${targetId}`, offerSignedDate);
      localStorage.setItem(`gs_offer_joining_date_${targetId}`, joiningDate);
      try {
        await updateProfile({ 
          offerSigned: true, 
          offerSignedDate: offerSignedDate, 
          joiningDate: joiningDate 
        });
      } catch (err) {}
    }
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

  const renderOfferLetter = (targetPerson = null) => {
    try {
      const target = (targetPerson && typeof targetPerson === 'object' && (targetPerson.email || targetPerson.fullName)) 
        ? targetPerson 
        : (currentUser || {});
      const safeTemplates = templates || [];
      const candidateTemplate = safeTemplates.find(t => t.role === 'Candidate') || safeTemplates.find(t => t.role === 'HR') || {
        content: `<h3>SRYN MANAGEMENT PRIVATE LIMITED</h3><p>Dear {{name}}, offer letter loading...</p>`
      };
      
      const targetId = target?.uid || target?.email || currentUser?.uid || currentUser?.email;
      
      const storedSignedDate = target?.offerSignedDate || (targetId ? localStorage.getItem(`gs_offer_signed_date_${targetId}`) : null);
      const storedJoiningDate = target?.joiningDate || (targetId ? localStorage.getItem(`gs_offer_joining_date_${targetId}`) : null);

      const issueDateObj = storedSignedDate ? new Date(storedSignedDate) : (target?.date ? new Date(target.date) : new Date());
      const joiningDateObj = storedJoiningDate ? new Date(storedJoiningDate) : new Date(issueDateObj);
      if (!storedJoiningDate) {
        joiningDateObj.setDate(joiningDateObj.getDate() + 1);
      }

      const todayStr = storedSignedDate || issueDateObj.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });

      const joiningDateStr = storedJoiningDate || joiningDateObj.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });

      const userAddress = [
        target?.address,
        target?.city,
        target?.state,
        target?.pincode
      ].filter(Boolean).join(', ') || (currentUser?.address ? [currentUser.address, currentUser.city, currentUser.state, currentUser.pincode].filter(Boolean).join(', ') : 'Not Provided (Complete Candidate Profile)');

      const userRole = target?.roleApplied || target?.position || 'Customer Relationship Executive';
      const userSalary = target?.salary || '₹15,000/- (Rupees Fifteen Thousand Only)';
      const userWorkingHours = target?.workingHours || '11:00 A.M. to 7:30 P.M.';
      const userPerformanceTarget = target?.performanceTarget || 'Fifty (50) Fixed Deposit Linked Cards';

      let html = (candidateTemplate?.content || '')
        .replace(/{{name}}/g, target?.fullName || target?.name || currentUser?.fullName || 'Candidate')
        .replace(/{{email}}/g, target?.email || currentUser?.email || 'N/A')
        .replace(/{{mobile}}/g, target?.mobile || currentUser?.mobile || 'N/A')
        .replace(/{{address}}/g, userAddress)
        .replace(/{{date}}/g, todayStr)
        .replace(/{{joining_date}}/g, joiningDateStr)
        .replace(/{{date_of_joining}}/g, joiningDateStr)
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
            onClick={() => { setActiveTab('training'); setSidebarOpen(false); }}
            style={{ ...sidebarLinkStyle, ...(activeTab === 'training' ? activeLinkStyle : {}) }}
          >
            <BookOpen size={18} /> Training & Pitching
          </button>
          <button 
            disabled={!isApproved}
            onClick={() => { 
              if (!isApproved) {
                showToast("Offer Letter menu is disabled until your profile is approved by Admin.", "warning");
                return;
              }
              setActiveTab('offer'); 
              setSidebarOpen(false); 
            }}
            title={!isApproved ? "Offer Letter is disabled until Admin approves your profile" : "View Offer Letter"}
            style={{ 
              ...sidebarLinkStyle, 
              ...(activeTab === 'offer' ? activeLinkStyle : {}),
              ...(!isApproved ? { opacity: 0.5, cursor: 'not-allowed', backgroundColor: 'transparent' } : {}) 
            }}
          >
            <FileText size={18} color={!isApproved ? "#94a3b8" : undefined} /> View Offer Letter
            {!isApproved && <span style={{ marginLeft: 'auto', fontSize: '0.65rem', backgroundColor: '#fef08a', color: '#854d0e', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>🔒 Locked</span>}
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
              <div 
                onClick={() => {
                  if (!isApproved) {
                    showToast("Offer Letter menu is disabled until your profile is approved by Admin.", "warning");
                    return;
                  }
                  setActiveTab('offer');
                }}
                className="premium-metric-card metric-blue"
                style={{ cursor: isApproved ? 'pointer' : 'not-allowed', opacity: isApproved ? 1 : 0.8 }}
              >
                <FileText size={28} color={offerSigned ? "var(--primary-color)" : isApproved ? "var(--danger-color)" : "#94a3b8"} />
                <div>
                  <div style={metricLabelStyle}>Offer Letter</div>
                  <div style={metricValueStyle}>
                    {offerSigned ? 'Signed' : isApproved ? 'Pending Sign' : '🔒 Approval Pending'}
                  </div>
                </div>
              </div>
            </div>

            {/* Professional Incentive & Remuneration Structure Banner */}
            <div style={{ background: 'linear-gradient(135deg, rgba(222,49,99,0.08) 0%, rgba(139,92,246,0.08) 100%)', border: '1px solid rgba(222,49,99,0.2)', borderRadius: '12px', padding: '20px 24px', marginBottom: '30px', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <span style={{ backgroundColor: 'var(--primary-color)', color: '#fff', padding: '4px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  ★ OFFICIAL REMUNERATION & INCENTIVE POLICY
                </span>
              </div>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '8px', fontWeight: '800' }}>
                Performance Benchmark & Commission Incentive Structure
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.6', margin: 0 }}>
                • <strong>Full Fixed Salary (₹15,000/-):</strong> Eligible upon achieving <strong>≥ 60% Monthly Performance</strong> (30 FD Cards activated).<br/>
                • <strong>Performance Incentive Surge:</strong> Earn an additional <strong>₹500/- Performance Incentive per Card</strong> on every activated card completed beyond your target threshold, paid directly along with your monthly salary!
              </p>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '1.8rem' }}>Customer Database & Link Dispatch</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Register onboarded customers and share application links directly.</p>
              </div>
            </div>

            {/* Technical Link Dispatch Notice */}
            <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '16px 20px', marginBottom: '20px', textAlign: 'left', color: '#1e40af', fontSize: '0.9rem', lineHeight: '1.5' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', fontSize: '0.95rem', marginBottom: '6px', color: '#1d4ed8' }}>
                <Send size={18} color="#1d4ed8" /> AUTOMATED LINK DISPATCH & TECHNICAL FALLBACK PROTOCOL
              </div>
              <div>
                Upon registering a customer below, our automated system dispatches an instant activation link to their email address.<br/>
                <strong>Technical Problem Fallback:</strong> If due to network congestion or technical delay the customer does not receive the automated message, candidate <strong>MUST immediately copy the campaign link or send it directly</strong> to the customer's mobile number via <strong>WhatsApp</strong>, <strong>SMS (Text Message)</strong>, or <strong>Email</strong> using the buttons in the table below.
              </div>
            </div>

            {/* Mandatory Customer Phone Device Policy Warning */}
            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '16px 20px', marginBottom: '24px', textAlign: 'left', color: '#991b1b', fontSize: '0.9rem', lineHeight: '1.5' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', fontSize: '0.95rem', marginBottom: '6px', color: '#dc2626' }}>
                <Smartphone size={20} color="#dc2626" /> MANDATORY POLICY: APPLICATION MUST BE COMPLETED ON CUSTOMER'S PHONE ONLY
              </div>
              <div>
                All card applications, document uploads, and deposit activations <strong>MUST be performed directly on the Customer's Personal Mobile Device</strong>.<br/>
                ❌ <strong>STRICT PROHIBITION:</strong> Candidates MUST NOT fill customer applications or activate cards on their own personal phones.<br/>
                ⚠️ <strong>Audit Penalty:</strong> Applications completed on a candidate's personal device will be flagged as invalid by system security and <strong>WILL NOT BE COUNTED</strong> towards monthly targets or incentive payouts.
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

                  {custForm.project && (
                    <div style={{ backgroundColor: 'var(--surface-color)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '14px' }}>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>ACTIVE CAMPAIGN LINK:</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--primary-color)', wordBreak: 'break-all', marginBottom: '8px' }}>
                        {getCampaignWorkingLink(custForm.project)}
                      </div>
                      <button 
                        type="button" 
                        onClick={() => handleCopyLink(getCampaignWorkingLink(custForm.project))}
                        className="btn btn-outline" 
                        style={{ padding: '4px 12px', fontSize: '0.78rem', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                      >
                        <Copy size={14} /> Copy Campaign Working Link
                      </button>
                    </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={submittingCust}
                    className="btn btn-primary" 
                    style={{ width: '100%', marginTop: '10px', opacity: submittingCust ? 0.7 : 1 }}
                  >
                    {submittingCust ? 'Processing...' : 'Register Customer & Send Link'}
                  </button>
                </form>
              </div>

              {/* Guide Card */}
              <div className="glass-card" style={{ textAlign: 'left', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '12px' }}><span className="text-gradient">How it Works?</span></h3>
                <ol style={{ paddingLeft: '16px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.95rem' }}>
                  <li>Enter the customer details here immediately after explaining the bank card features.</li>
                  <li>Our server dispatches the custom working link (configured by system admin) to their email.</li>
                  <li><strong>Technical Fallback:</strong> If link fails to arrive, click "Copy Link" or "WhatsApp" below to send it directly to customer's phone.</li>
                  <li><strong>Customer Phone Rule:</strong> Customer MUST open the link on their OWN phone to complete KYC/activation.</li>
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
            <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>Historical ledger of customers registered by you. Use buttons to resend application links.</p>

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
                    <th>Share Link / Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {uniqueCustomers.length > 0 ? (
                    uniqueCustomers.map((c) => (
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
                        <td style={{ whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <button 
                              onClick={() => handleCopyLink(getCampaignWorkingLink(c.project))}
                              className="btn btn-outline" 
                              style={{ padding: '4px 8px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                              title="Copy Campaign Application Link"
                            >
                              <Copy size={12} /> Copy
                            </button>
                            <button 
                              onClick={() => handleSendWhatsApp(c)}
                              className="btn" 
                              style={{ padding: '4px 8px', fontSize: '0.75rem', backgroundColor: '#25D366', color: '#ffffff', border: 'none', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}
                              title="Send via WhatsApp to Customer"
                            >
                              <Send size={12} /> WhatsApp
                            </button>
                            <button 
                              onClick={() => handleSendSMS(c)}
                              className="btn btn-outline" 
                              style={{ padding: '4px 8px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                              title="Send via SMS to Customer"
                            >
                              SMS
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>
                        No customers added yet. Navigate to "Customers" tab to register your first lead.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- TRAINING TAB --- */}
        {activeTab === 'training' && (
          <div style={tabContentStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '1.8rem', marginBottom: '6px' }}>Training & Pitching Materials</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Download official campaign SOPs, product training manuals, and calling pitch guidelines.</p>
              </div>
            </div>

            {/* Training Category Filter */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
              <button 
                onClick={() => setSelectedTrainCat('ALL')}
                className={`btn ${selectedTrainCat === 'ALL' ? 'btn-primary' : 'btn-outline'}`}
                style={{ padding: '6px 16px', fontSize: '0.85rem' }}
              >
                All Materials
              </button>
              {['FD Card', 'Financial Products', 'Field Executive', 'General'].map(cat => (
                <button 
                  key={cat}
                  onClick={() => setSelectedTrainCat(cat)}
                  className={`btn ${selectedTrainCat === cat ? 'btn-primary' : 'btn-outline'}`}
                  style={{ padding: '6px 16px', fontSize: '0.85rem' }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Training Cards Grid */}
            <div className="grid-2" style={{ gap: '20px' }}>
              {filteredTraining.length > 0 ? (
                filteredTraining.map((mod) => (
                  <div key={mod.id} className="card" style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <span className="badge badge-calling" style={{ fontSize: '0.78rem' }}>{mod.category}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>📅 Updated {mod.date}</span>
                      </div>
                      <h3 style={{ fontSize: '1.15rem', marginBottom: '8px', color: 'var(--text-primary)', fontWeight: '700' }}>
                        {mod.title}
                      </h3>
                      <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '16px' }}>
                        {mod.description}
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px', borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
                      <button 
                        onClick={() => setPreviewTrainModal(mod)}
                        className="btn btn-outline" 
                        style={{ flex: 1, padding: '8px 12px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                      >
                        <Eye size={16} /> View Details / PDF
                      </button>
                      <button 
                        onClick={() => handleDownloadTrainingPDF(mod)}
                        className="btn btn-primary" 
                        style={{ flex: 1, padding: '8px 12px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                      >
                        <Download size={16} /> Download PDF
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="card" style={{ gridColumn: '1 / -1', padding: '40px', color: 'var(--text-muted)' }}>
                  No training manuals found for the selected category.
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- TRAINING DETAIL / PREVIEW MODAL --- */}
        {previewTrainModal && (
          <div className="modal-overlay">
            <div className="modal-content fade-in" style={{ maxWidth: '750px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BookOpen size={22} color="var(--primary-color)" />
                  <h3 style={{ fontSize: '1.25rem' }}>{previewTrainModal.title}</h3>
                </div>
                <button onClick={() => setPreviewTrainModal(null)}><X size={20} /></button>
              </div>

              <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span className="badge badge-hired">{previewTrainModal.category}</span>
                  <span className="badge badge-calling">Target: {previewTrainModal.targetRole || 'Candidate'}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                    Uploaded: {previewTrainModal.date}
                  </span>
                </div>

                <div style={{ backgroundColor: 'var(--surface-color)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.92rem', lineHeight: '1.6' }}>
                  <strong style={{ display: 'block', marginBottom: '6px', color: 'var(--text-primary)' }}>Training Description & Overview:</strong>
                  {previewTrainModal.description}
                </div>

                {createPdfBlobUrl(resolvePdfUrl(previewTrainModal)) ? (
                  <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', height: '450px' }}>
                    <iframe src={createPdfBlobUrl(resolvePdfUrl(previewTrainModal))} width="100%" height="100%" title="Training PDF Document"></iframe>
                  </div>
                ) : (
                  <div style={{ backgroundColor: '#eff6ff', border: '1px dashed #93c5fd', borderRadius: '8px', padding: '24px', textAlign: 'center', color: '#1e40af' }}>
                    <FileText size={36} color="#2563eb" style={{ margin: '0 auto 12px' }} />
                    <strong style={{ display: 'block', fontSize: '1.05rem', marginBottom: '6px' }}>Official SRYN Training Module</strong>
                    <p style={{ fontSize: '0.88rem', color: '#3b82f6', marginBottom: '16px' }}>Click the button below to view or download the complete PDF training manual.</p>
                    <button 
                      onClick={() => handleDownloadTrainingPDF(previewTrainModal)}
                      className="btn btn-primary" 
                      style={{ padding: '8px 20px', fontSize: '0.9rem' }}
                    >
                      <Download size={16} /> Download Official PDF Document
                    </button>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                  <button onClick={() => setPreviewTrainModal(null)} className="btn btn-outline">Close</button>
                  <button onClick={() => handleDownloadTrainingPDF(previewTrainModal)} className="btn btn-primary">
                    <Download size={16} /> Download PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- OFFER LETTER TAB --- */}
        {activeTab === 'offer' && (
          <div style={tabContentStyle}>
            {!isApproved ? (
              <div style={{ textAlign: 'center', padding: '60px 24px', backgroundColor: 'var(--surface-color)', borderRadius: '12px', border: '1px solid var(--border-color)', maxWidth: '650px', margin: '40px auto', boxShadow: 'var(--shadow-md)' }}>
                <div style={{ width: '70px', height: '70px', borderRadius: '50%', backgroundColor: 'rgba(234, 179, 8, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <ShieldCheck size={36} color="#eab308" />
                </div>
                <h2 style={{ fontSize: '1.6rem', marginBottom: '12px', color: 'var(--text-primary)', fontWeight: '800' }}>Offer Letter Currently Locked</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '24px' }}>
                  Your candidate profile is currently pending Admin verification. Once Admin approves your profile, your official Offer Letter will automatically be unlocked for viewing & signing.
                </p>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: '#fef9c3', border: '1px solid #fef08a', color: '#854d0e', padding: '10px 20px', borderRadius: '30px', fontWeight: 'bold', fontSize: '0.88rem' }}>
                  ⏳ Status: Pending Admin Profile Approval
                </div>
              </div>
            ) : (
              <>
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

                  <div className="offer-actions-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-surface)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>CONTRACT DATE</div>
                      <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>{
                        new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
                      }</strong>
                    </div>

                    {offerSigned ? (
                      <div className="offer-signed-box" style={{ display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: '#dcfce7', padding: '12px 20px', borderRadius: '8px', border: '1px solid #86efac' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#15803d', fontWeight: '800' }}>
                          <CheckCircle2 size={24} color="#15803d" /> Signed & Accepted
                        </div>
                        <button onClick={handleDownloadPDF} className="btn" style={{ padding: '8px 18px', fontSize: '0.85rem', backgroundColor: '#16a34a', color: '#ffffff', fontWeight: 'bold', width: '100%' }}>
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
              </>
            )}
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
