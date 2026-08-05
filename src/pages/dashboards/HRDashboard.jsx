import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import Profile from '../Profile';
import { 
  LayoutDashboard, Users, BarChart3, FileText, User, LogOut, Search, Plus, PhoneCall, Filter, Calendar, Save, X, PhoneIncoming, CheckCircle2, Menu,
  BookOpen, Copy, Check, Globe, Video, MessageSquare, Target, Award, ShieldCheck, Sparkles, ChevronRight, HelpCircle, Send, Share2, ExternalLink, MessageCircle, Briefcase, MapPin, Building2, Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HRDashboard = () => {
  const { currentUser, logout, leads, addNewLead, updateLeadStatus, projects, templates, showToast } = useApp();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [scriptRound, setScriptRound] = useState('round1'); // 'round1' | 'round2'
  const [scriptLang, setScriptLang] = useState('hi'); // 'hi' | 'en'
  const [copiedSnippet, setCopiedSnippet] = useState(null);
  const [scriptCandidateName, setScriptCandidateName] = useState('');

  // Share JD & Dynamic Campaign State
  const [selectedProjId, setSelectedProjId] = useState('');
  const assignedProjects = (projects || []).filter(p => !p.assignedHR || p.assignedHR === 'ALL' || p.assignedHR === currentUser?.uid);
  const activeProj = (assignedProjects || []).find(p => p.id === selectedProjId) || assignedProjects[0] || (projects && projects[0]) || {};

  const [jdCandidateName, setJdCandidateName] = useState('');
  const [jdCandidateMobile, setJdCandidateMobile] = useState('');
  const [jdRole, setJdRole] = useState('');
  const [jdSalary, setJdSalary] = useState('');
  const [jdLocation, setJdLocation] = useState('');
  const [jdFormat, setJdFormat] = useState('whatsapp_hi'); // 'whatsapp_hi' | 'whatsapp_en' | 'email'

  const [offerSigned, setOfferSigned] = useState(() => {
    return localStorage.getItem(`gs_hr_offer_signed_${currentUser?.uid}`) === 'true';
  });

  const effectiveRole = jdRole || activeProj?.title || 'Customer Relationship Executive';
  const effectiveSalary = jdSalary || activeProj?.salary || activeProj?.commission || '₹15,000 / month + Incentives';
  const effectiveLocation = jdLocation || activeProj?.location || 'Hometown / Local Area';

  const handleSelectProject = (projId) => {
    setSelectedProjId(projId);
    const found = (projects || []).find(p => p.id === projId);
    if (found) {
      setJdRole(found.title || '');
      setJdSalary(found.salary || found.commission || '₹15,000 / month + Incentives');
      setJdLocation(found.location || 'Hometown / Local Area');
      if (typeof showToast === 'function') {
        showToast(`Switched campaign to: ${found.title}`, 'info');
      }
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(id);
    showToast("Copied to clipboard!", "success");
    setTimeout(() => setCopiedSnippet(null), 2500);
  };

  const handleShareWhatsAppJD = (text) => {
    let cleanMobile = (jdCandidateMobile || '').replace(/\D/g, '');
    if (cleanMobile.length === 10) {
      cleanMobile = '91' + cleanMobile;
    }
    const url = cleanMobile 
      ? `https://api.whatsapp.com/send?phone=${cleanMobile}&text=${encodeURIComponent(text)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    showToast("Opening WhatsApp to share Job Description...", "success");
  };

  const getWhatsAppJDText = () => {
    const candidateName = jdCandidateName || '[Candidate Name]';
    const roleName = effectiveRole;
    const salaryVal = effectiveSalary;
    const locationVal = effectiveLocation;
    const hrName = currentUser?.fullName || 'HR Specialist';

    // Admin Custom Overrides per Project
    if (jdFormat === 'whatsapp_hi' && activeProj?.jdHindi && activeProj.jdHindi.trim()) {
      return activeProj.jdHindi
        .replace(/{{name}}/g, candidateName)
        .replace(/{{role}}/g, roleName)
        .replace(/{{salary}}/g, salaryVal)
        .replace(/{{location}}/g, locationVal)
        .replace(/{{hrName}}/g, hrName);
    }

    if (jdFormat === 'whatsapp_en' && activeProj?.jdEnglish && activeProj.jdEnglish.trim()) {
      return activeProj.jdEnglish
        .replace(/{{name}}/g, candidateName)
        .replace(/{{role}}/g, roleName)
        .replace(/{{salary}}/g, salaryVal)
        .replace(/{{location}}/g, locationVal)
        .replace(/{{hrName}}/g, hrName);
    }

    if (jdFormat === 'whatsapp_en') {
      return `🏢 *${(activeProj?.title || 'SRYN MANAGEMENT PVT. LTD.').toUpperCase()}*
📍 *Career Opportunity in Your Hometown!*

Dear *${candidateName}*,

Greetings from SRYN Management Pvt. Ltd.!

We are pleased to inform you that your profile has been shortlisted for the position of *${roleName}*.

━━━━━━━━━━━━━━━━━━━━━━
💼 *JOB SUMMARY:*
━━━━━━━━━━━━━━━━━━━━━━
🔹 *Position:* ${roleName}
🔹 *Fixed Salary:* ${salaryVal}
🔹 *Location:* ${locationVal} (No Relocation Required!)
🔹 *Company:* SRYN Management Pvt. Ltd. (CIN: U51900UP2022PTC169096)

━━━━━━━━━━━━━━━━━━━━━━
🎯 *ROLE RESPONSIBILITIES:*
━━━━━━━━━━━━━━━━━━━━━━
• Educate and assist customers with our ${roleName} services.
• Provide product details and clear customer queries.
• Assist interested customers through the official digital portal.
• Relationship management & customer acquisition role.

━━━━━━━━━━━━━━━━━━━━━━
🎁 *WHAT WE OFFER:*
━━━━━━━━━━━━━━━━━━━━━━
✅ Official Offer Letter & Employee ID Card
✅ Personal Employee Portal & Dashboard Access
✅ Comprehensive Product & Sales Conversation Training
✅ Marketing Materials (Brochures, WhatsApp & Social Media Creatives)
✅ Dedicated Managerial Support & Hometown Placement

━━━━━━━━━━━━━━━━━━━━━━
🚀 *HIRING STEPS:*
━━━━━━━━━━━━━━━━━━━━━━
1️⃣ Round 1: Telephonic Interview
2️⃣ Round 2: Video Interview (15-20 mins)

Please confirm your availability for the *2nd Round Video Interview*.

Best Regards,
👤 *${hrName}* | SRYN HR Desk
📞 *Phone:* 8265903984
🌐 *Website:* www.sryn.online`;
    }

    if (jdFormat === 'email') {
      return `Subject: Job Opportunity - ${roleName} at SRYN Management Pvt. Ltd.

Dear ${candidateName},

We are pleased to invite you to apply for the position of ${roleName} at SRYN Management Pvt. Ltd.

Job Overview:
- Designation: ${roleName}
- Fixed Remuneration: ${salaryVal}
- Work Location: ${locationVal}
- Organization: SRYN Management Pvt. Ltd. (CIN: U51900UP2022PTC169096)

Key Responsibilities:
1. Assist customers regarding ${roleName} operations and services.
2. Complete customer onboarding through the official digital portal.
3. Maintain high standards of customer relationship management.

Employee Support & Benefits:
- Official Appointment Cum Offer Letter
- Authorized Employee ID Card & Personal Dashboard Access
- Complete Product & Communication Skill Training
- Work opportunities in your hometown with long-term growth prospects.

Selection Process:
1st Round: Telephonic Screening Interview
2nd Round: Video Interview

Please reply to this email or contact the undersigned to schedule your Video Interview.

Sincerely,
${hrName}
Recruitment Specialist | SRYN Management Pvt. Ltd.
Email: info@sryn.online | Phone: 8265903984 | Web: www.sryn.online`;
    }

    // Default: 'whatsapp_hi' (Hindi / Hinglish WhatsApp format)
    return `🏢 *${(activeProj?.title || 'SRYN MANAGEMENT PVT. LTD.').toUpperCase()}*
📍 *Job Opportunity in Your Hometown!*

Dear *${candidateName}*,

Greetings! Aapki profile SRYN Management Pvt. Ltd. mein *${roleName}* ki position ke liye shortlist hui hai.

━━━━━━━━━━━━━━━━━━━━━━
💼 *JOB DETAILS & HIGHLIGHTS:*
━━━━━━━━━━━━━━━━━━━━━━
🔹 *Designation:* ${roleName}
🔹 *Offered Salary:* ${salaryVal}
🔹 *Work Location:* ${locationVal} (Aapke Apne City/District Mein!)
🔹 *Company:* SRYN Management Pvt. Ltd.
🔹 *Campaign:* ${activeProj?.title || 'Financial Services'}

━━━━━━━━━━━━━━━━━━━━━━
🎯 *KEY RESPONSIBILITIES:*
━━━━━━━━━━━━━━━━━━━━━━
• Customers ko hamari ${roleName} services ke baare mein guide karna.
• Key benefits aur process explain karna.
• Customers ko application process complete karwane mein assist karna.
• No field cash collection involved! Pure relationship & guidance role.

━━━━━━━━━━━━━━━━━━━━━━
🎁 *EMPLOYEE BENEFITS & SUPPORT:*
━━━━━━━━━━━━━━━━━━━━━━
✅ Official Appointment Cum Offer Letter
✅ Employee ID Card & Personal Employee Dashboard Access
✅ 100% Complete Product & Communication Skill Training
✅ Product Brochures, WhatsApp & Social Media Marketing Creatives
✅ Hometown Work Opportunity & Fast Career Growth

━━━━━━━━━━━━━━━━━━━━━━
🚀 *SELECTION PROCESS:*
━━━━━━━━━━━━━━━━━━━━━━
1️⃣ *Round 1:* Telephonic Interview
2️⃣ *Round 2:* 15-20 Min Video Interview

📌 *Next Step:*
Kripya second round *Video Interview* ke liye apna time confirm karein.

For any questions, reply to this message:
👤 *${hrName}* | SRYN HR Desk
📞 *Phone:* 8265903984
🌐 *Website:* www.sryn.online

We look forward to welcoming you to *SRYN Management Pvt. Ltd.*! Have a wonderful day!`;
  };

  const handleSignOffer = () => {
    if (currentUser?.uid) {
      localStorage.setItem(`gs_hr_offer_signed_${currentUser.uid}`, 'true');
    }
    setOfferSigned(true);
    if (typeof showToast === 'function') {
      showToast("Offer letter accepted and signed successfully!", "success");
    }
  };

  const handleDownloadPDF = (personParam = null) => {
    try {
      const target = (personParam && typeof personParam === 'object' && (personParam.email || personParam.fullName)) 
        ? personParam 
        : (currentUser || {});
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        if (typeof showToast === 'function') {
          showToast("Pop-up blocked! Please allow pop-ups for this site to view/print your Offer Letter.", "warning");
        } else {
          alert("Pop-up blocked! Please allow pop-ups for this site to view/print your Offer Letter.");
        }
        return;
      }
      const content = renderOfferLetter(target);
    
    printWindow.document.write(`
      <html>
        <head>
          <title>SRYN Offer Letter - ${target?.fullName || 'Candidate'}</title>
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
              color: #334155;
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
    } catch (err) {
      console.error("Error opening print window:", err);
      if (typeof showToast === 'function') {
        showToast("Unable to open print preview. Please check browser pop-up settings.", "warning");
      }
    }
  };

  const renderOfferLetter = (targetPerson = null) => {
    try {
      const person = (targetPerson && typeof targetPerson === 'object' && (targetPerson.email || targetPerson.fullName)) 
        ? targetPerson 
        : (currentUser || {});
      const safeTemplates = templates || [];
      const hrTemplate = safeTemplates.find(t => t.role === (person?.role || 'HR')) 
        || safeTemplates.find(t => t.role === 'Candidate') 
        || safeTemplates.find(t => t.role === 'HR') 
        || { content: `<h3>SRYN MANAGEMENT PRIVATE LIMITED</h3><p>Dear {{name}}, your official offer letter is loading...</p>` };
      
      const issueDateObj = person?.date ? new Date(person.date) : new Date();
      const joiningDateObj = new Date(issueDateObj);
      joiningDateObj.setDate(joiningDateObj.getDate() + 1);

      const todayStr = issueDateObj.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });

      const joiningDateStr = person?.joiningDate || joiningDateObj.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });

      const userAddress = [
        person?.address,
        person?.city,
        person?.state,
        person?.pincode
      ].filter(Boolean).join(', ') || (currentUser?.address ? [currentUser.address, currentUser.city, currentUser.state, currentUser.pincode].filter(Boolean).join(', ') : 'Not Provided (Complete Candidate Profile)');

      const userRole = person?.roleApplied || person?.position || person?.project || (person?.role === 'HR' ? 'HR Executive' : 'Field Executive');
      const userSalary = person?.salary || '₹8,000/- (Rupees Eight Thousand Only)';
      const userWorkingHours = person?.workingHours || '11:00 A.M. to 7:30 P.M.';
      const userPerformanceTarget = person?.performanceTarget || 'Fifty (50) candidates';

      let html = (hrTemplate?.content || '')
        .replace(/{{name}}/g, person?.fullName || person?.name || currentUser?.fullName || 'Candidate')
        .replace(/{{email}}/g, person?.email || currentUser?.email || 'N/A')
        .replace(/{{mobile}}/g, person?.mobile || currentUser?.mobile || 'N/A')
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
      console.error("Error in renderOfferLetter:", err);
      return `<div style="padding: 30px; text-align: center; color: #de3163;"><h3>SRYN MANAGEMENT PRIVATE LIMITED</h3><p>Loading Offer Letter details. Please wait...</p></div>`;
    }
  };
  
  // CRM Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');

  // Call simulation modal states
  const [callingLead, setCallingLead] = useState(null);
  const [callNotes, setCallNotes] = useState('');
  const [callStatus, setCallStatus] = useState('Calling');

  // Manual Add Lead states
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedLeadOffer, setSelectedLeadOffer] = useState(null);
  const [newLeadForm, setNewLeadForm] = useState({ fullName: '', mobile: '', email: '', project: '', roleApplied: 'Field Executive' });

  // Filtered Leads
  const hrLeads = (leads || []).filter(l => l && (l.assignedTo === currentUser?.uid || currentUser?.role === 'Admin'));
  const filteredLeads = hrLeads.filter(lead => {
    if (!lead) return false;
    const nameStr = (lead.fullName || '').toLowerCase();
    const mobileStr = lead.mobile || '';
    const searchStr = (searchTerm || '').toLowerCase();
    const matchesSearch = nameStr.includes(searchStr) || mobileStr.includes(searchTerm || '');
    const matchesStatus = statusFilter === 'All' || lead.status === statusFilter;
    const matchesDate = !dateFilter || lead.date === dateFilter;

    return matchesSearch && matchesStatus && matchesDate;
  });

  const handleManualLeadSubmit = async (e) => {
    e.preventDefault();
    if (!newLeadForm.fullName || !newLeadForm.mobile || !newLeadForm.email || !newLeadForm.project) {
      showToast("Please fill all required lead fields.", "warning");
      return;
    }
    try {
      await addNewLead({
        ...newLeadForm,
        assignedTo: currentUser.uid
      });
      setShowAddModal(false);
      setNewLeadForm({ fullName: '', mobile: '', email: '', project: '', roleApplied: 'Field Executive' });
    } catch (err) {}
  };

  // Simulate CRM Calling
  const triggerCallSimulation = (lead) => {
    setCallingLead(lead);
    setCallStatus(lead.status);
    setCallNotes(lead.feedback || '');
  };

  const saveCallOutcome = async () => {
    if (!callingLead) return;
    try {
      await updateLeadStatus(callingLead.id, callStatus, callNotes);
      setCallingLead(null);
      setCallNotes('');
    } catch (err) {}
  };

  // Metrics calculation
  const totalAssigned = hrLeads.length;
  const interestedCount = hrLeads.filter(l => l.status === 'Interested').length;
  const hiredCount = hrLeads.filter(l => l.status === 'Hired').length;
  const callingCount = hrLeads.filter(l => l.status === 'Calling').length;

  return (
    <div className="dashboard-layout fade-in">
      {/* Mobile Header Bar */}
      <div className="dashboard-mobile-header">
        <button onClick={() => setSidebarOpen(true)} className="mobile-toggle-btn">
          <Menu size={24} />
        </button>
        <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>SRYN HR Panel</span>
      </div>

      {/* Sidenav Overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>
      )}

      {/* Sidenav */}
      <aside className={`sidebar ${sidebarOpen ? 'active' : ''}`}>
        <div style={sidebarLogoStyle}>
          <Users size={24} color="var(--secondary-color)" />
          <span style={{ fontWeight: 800, fontSize: '1.25rem' }}>SRYN <span style={{ fontSize: '0.75rem', color: 'var(--secondary-color)' }}>HR</span></span>
        </div>

        <div style={sidebarMenuStyle}>
          <button 
            onClick={() => { setActiveTab('dashboard'); setSidebarOpen(false); }}
            style={{ ...sidebarLinkStyle, ...(activeTab === 'dashboard' ? activeLinkStyle : {}) }}
          >
            <LayoutDashboard size={18} /> Dashboard
          </button>
          <button 
            onClick={() => { setActiveTab('leads'); setSidebarOpen(false); }}
            style={{ ...sidebarLinkStyle, ...(activeTab === 'leads' ? activeLinkStyle : {}) }}
          >
            <Users size={18} /> Leads CRM
          </button>
          <button 
            onClick={() => { setActiveTab('scripts'); setSidebarOpen(false); }}
            style={{ ...sidebarLinkStyle, ...(activeTab === 'scripts' ? activeLinkStyle : {}) }}
          >
            <BookOpen size={18} /> Interview Scripts
          </button>
          <button 
            onClick={() => { setActiveTab('jd'); setSidebarOpen(false); }}
            style={{ ...sidebarLinkStyle, ...(activeTab === 'jd' ? activeLinkStyle : {}) }}
          >
            <Send size={18} /> Share Job Description (JD)
          </button>
          <button 
            onClick={() => { setActiveTab('reports'); setSidebarOpen(false); }}
            style={{ ...sidebarLinkStyle, ...(activeTab === 'reports' ? activeLinkStyle : {}) }}
          >
            <BarChart3 size={18} /> Reports
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
            <User size={18} /> Complete Profile
          </button>
        </div>

        <div style={{ marginTop: 'auto', padding: '20px' }}>
          <button onClick={() => { logout(); navigate('/'); }} style={logoutBtnStyle}>
            <LogOut size={18} /> Log Out
          </button>
        </div>
      </aside>

      {/* Main Dashboard Space */}
      <main className="dashboard-main">

        {/* --- HR DASHBOARD METRICS --- */}
        {activeTab === 'dashboard' && (
          <div style={tabContentStyle}>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>HR Operations Hub</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>Monitor assignments, calling stats, and onboardings.</p>

            <div className="grid-4" style={{ marginBottom: '40px' }}>
              <div className="premium-metric-card metric-purple">
                <Users size={28} color="var(--secondary-color)" />
                <div>
                  <div style={metricLabelStyle}>Total Leads</div>
                  <div style={metricValueStyle}>{totalAssigned}</div>
                </div>
              </div>
              <div className="premium-metric-card metric-orange">
                <PhoneCall size={28} color="var(--accent-color)" />
                <div>
                  <div style={metricLabelStyle}>In Calling status</div>
                  <div style={metricValueStyle}>{callingCount}</div>
                </div>
              </div>
              <div className="premium-metric-card metric-blue">
                <BarChart3 size={28} color="var(--info-color)" />
                <div>
                  <div style={metricLabelStyle}>Interested</div>
                  <div style={metricValueStyle}>{interestedCount}</div>
                </div>
              </div>
              <div className="premium-metric-card metric-cherry">
                <CheckCircle2 size={28} color="var(--primary-color)" />
                <div>
                  <div style={metricLabelStyle}>Hired (Verified)</div>
                  <div style={metricValueStyle}>{hiredCount}</div>
                </div>
              </div>
            </div>

            <div className="grid-2">
              <div className="card">
                <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Hiring Conversion Rate</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={progressRowStyle}>
                    <span>New Leads Sourced</span>
                    <strong>{hrLeads.filter(l => l.status === 'New').length}</strong>
                  </div>
                  <div style={progressRowStyle}>
                    <span>Interested Prospects</span>
                    <strong>{interestedCount}</strong>
                  </div>
                  <div style={progressRowStyle}>
                    <span>Onboarded Candidates</span>
                    <strong>{hiredCount}</strong>
                  </div>
                  <div style={progressBarContainerStyle}>
                    <div style={{
                      ...progressBarFillStyle, 
                      width: `${totalAssigned > 0 ? (hiredCount / totalAssigned) * 100 : 0}%`,
                      backgroundColor: 'var(--primary-color)'
                    }}></div>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                    Conversion Efficiency: {totalAssigned > 0 ? Math.round((hiredCount / totalAssigned) * 100) : 0}%
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Recent Lead History</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {hrLeads.slice(0, 3).map(l => (
                    <div key={l.id} style={leadHistoryRowStyle}>
                      <div>
                        <strong>{l.fullName}</strong>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Project: {l.project}</div>
                      </div>
                      <span className={`badge badge-${(l.status || 'new').toLowerCase()}`}>{l.status || 'New'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- LEADS CRM TAB --- */}
        {activeTab === 'leads' && (
          <div style={tabContentStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h2 style={{ fontSize: '1.8rem' }}>Hiring Leads CRM</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Execute callings, update records, and filter pipelines.</p>
              </div>
              <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
                <Plus size={18} /> Add Candidate Lead
              </button>
            </div>

            {/* Filters panel */}
            <div className="filter-panel-responsive">
              {/* Search */}
              <div style={searchContainerStyle} className="search-container-premium">
                <Search size={18} style={searchIconStyle} />
                <input
                  type="text"
                  placeholder="Search name or mobile..."
                  className="form-control"
                  style={{ paddingLeft: '40px' }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Status filter */}
              <div className="filter-item-responsive">
                <Filter size={16} color="var(--text-muted)" />
                <select 
                  className="form-control" 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{ width: '150px' }}
                >
                  <option value="All">All Statuses</option>
                  <option value="New">New</option>
                  <option value="Calling">Calling</option>
                  <option value="Interested">Interested</option>
                  <option value="Hired">Hired</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              {/* Date filter */}
              <div className="filter-item-responsive">
                <Calendar size={16} color="var(--text-muted)" />
                <input
                  type="date"
                  className="form-control"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  style={{ width: '160px' }}
                />
              </div>
            </div>

            {/* Leads Table */}
            <div className="crm-table-container">
              <table className="crm-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Candidate Name</th>
                    <th>Mobile</th>
                    <th>Role / Project</th>
                    <th>Status</th>
                    <th>Latest Feedback</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.length > 0 ? (
                    filteredLeads.map(l => (
                      <tr key={l.id}>
                        <td>{l.date}</td>
                        <td style={{ fontWeight: '700' }}>{l.fullName}</td>
                        <td>{l.mobile}</td>
                        <td>
                          <div>{l.roleApplied}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{l.project}</div>
                        </td>
                        <td>
                          <span className={`badge badge-${(l.status || 'new').toLowerCase()}`}>{l.status || 'New'}</span>
                        </td>
                        <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {l.feedback || 'No logs entered.'}
                        </td>
                        <td style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <button onClick={() => triggerCallSimulation(l)} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                            <PhoneCall size={14} color="var(--primary-color)" /> Call & Update
                          </button>
                          <button onClick={() => setSelectedLeadOffer(l)} className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                            <FileText size={14} /> Offer Letter
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>
                        No leads match current filter attributes.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- REPORTS TAB --- */}
        {activeTab === 'reports' && (
          <div style={tabContentStyle}>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Hiring Conversion Analytics</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>View key stats regarding HR recruitment performance indicators.</p>

            <div className="grid-2">
              <div className="card">
                <h3 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Source Breakdown</h3>
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {projects.map(p => {
                    const count = hrLeads.filter(l => l.project === p.title).length;
                    return (
                      <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{p.title}</span>
                        <strong style={{ color: 'var(--primary-color)' }}>{count} leads</strong>
                      </div>
                    );
                  })}
                </ul>
              </div>

              <div className="card">
                <h3 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Activity Summary Ledger</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={progressRowStyle}>
                    <span>Direct Admin Assigned Leads</span>
                    <strong>{hrLeads.length}</strong>
                  </div>
                  <div style={progressRowStyle}>
                    <span>Feedback Logs Entered</span>
                    <strong>{hrLeads.filter(l => l.feedback).length}</strong>
                  </div>
                  <div style={progressRowStyle}>
                    <span>Aadhar Files Validated</span>
                    <strong>{hrLeads.filter(l => l.status === 'Hired').length}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* --- OFFER LETTER TAB --- */}
        {activeTab === 'offer' && (
          <div style={tabContentStyle}>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Employment Offer Agreement</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>Please review the terms of your engagement as HR Officer / Recruitment Coordinator with SRYN.</p>

            <div className="grid-2" style={{ gap: '30px', alignItems: 'start' }}>
              <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ backgroundColor: 'rgba(0,0,0,0.02)', padding: '16px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>OFFER_LETTER_HR.pdf</span>
                  <span className={`badge ${offerSigned ? 'badge-hired' : 'badge-calling'}`}>
                    {offerSigned ? 'SIGNED & ACTIVE' : 'AWAITING SIGNATURE'}
                  </span>
                </div>
                
                <div className="contract-document-wrapper">
                  <div 
                    dangerouslySetInnerHTML={{ __html: renderOfferLetter() }} 
                    style={{ textAlign: 'left' }}
                  />
                </div>
              </div>

              <div className="card">
                <h3 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>Sign & Accept Offer</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '24px' }}>
                  By clicking accept, you acknowledge and agree to the roles, payout matrices, and code of conduct policies of SRYN Recruiting Solutions.
                </p>

                {offerSigned ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '20px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--primary-light)', border: '1px solid rgba(222,49,99,0.2)', width: '100%' }}>
                    <CheckCircle2 size={36} color="var(--primary-color)" />
                    <strong style={{ color: 'var(--primary-color)' }}>Agreement Signed & Locked</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>IP logged successfully. Copy sent to verified email.</span>
                    <button onClick={handleDownloadPDF} className="btn btn-primary" style={{ width: '100%' }}>
                      Download Offer Letter (PDF)
                    </button>
                  </div>
                ) : (
                  <button onClick={handleSignOffer} className="btn btn-primary" style={{ width: '100%' }}>
                    Accept & Sign Agreement
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
        {/* --- INTERVIEW SCRIPTS TAB --- */}
        {activeTab === 'scripts' && (
          <div style={tabContentStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <BookOpen size={26} color="var(--primary-color)" /> HR Interview Calling & Pitch Scripts
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
                  Interactive multi-lingual pitch guide for SRYN hiring campaigns.
                </p>
              </div>

              {/* Language & Candidate Name Toolbar */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', background: 'var(--surface-color)', padding: '4px 8px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.8rem', marginRight: '8px', color: 'var(--text-muted)' }}>Hiring Campaign:</span>
                  <select
                    className="form-control"
                    value={selectedProjId}
                    onChange={(e) => handleSelectProject(e.target.value)}
                    style={{ background: 'none', border: 'none', color: 'var(--primary-color)', outline: 'none', fontSize: '0.85rem', fontWeight: 'bold', padding: '0 4px', cursor: 'pointer' }}
                  >
                    {assignedProjects.map(p => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', background: 'var(--surface-color)', padding: '4px 8px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.8rem', marginRight: '8px', color: 'var(--text-muted)' }}>Live Candidate Name:</span>
                  <input
                    type="text"
                    placeholder="Candidate Name"
                    value={scriptCandidateName}
                    onChange={(e) => setScriptCandidateName(e.target.value)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-primary)', outline: 'none', fontSize: '0.85rem', width: '130px', fontWeight: 'bold' }}
                  />
                </div>

                <div style={{ display: 'flex', background: 'var(--surface-color)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <button
                    onClick={() => setScriptLang('hi')}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '6px',
                      border: 'none',
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      background: scriptLang === 'hi' ? 'var(--primary-color)' : 'transparent',
                      color: scriptLang === 'hi' ? '#fff' : 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    🇮🇳 Hindi / Hinglish
                  </button>
                  <button
                    onClick={() => setScriptLang('en')}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '6px',
                      border: 'none',
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      background: scriptLang === 'en' ? 'var(--primary-color)' : 'transparent',
                      color: scriptLang === 'en' ? '#fff' : 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    🌐 English
                  </button>
                </div>
              </div>
            </div>

            {/* Round Switcher Tabs */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <button
                onClick={() => setScriptRound('round1')}
                className={`btn ${scriptRound === 'round1' ? 'btn-primary' : 'btn-outline'}`}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px' }}
              >
                <PhoneCall size={18} /> First Round: Telephonic Script
              </button>
              <button
                onClick={() => setScriptRound('round2')}
                className={`btn ${scriptRound === 'round2' ? 'btn-primary' : 'btn-outline'}`}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px' }}
              >
                <Video size={18} /> Second Round: Video Interview Script
              </button>
            </div>

            {/* --- ROUND 1 TELEPHONIC SCRIPT --- */}
            {scriptRound === 'round1' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Script Header Card */}
                <div className="card" style={{ background: 'linear-gradient(135deg, rgba(222,49,99,0.08), rgba(37,99,235,0.04))', border: '1px solid rgba(222,49,99,0.2)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div>
                      <span className="badge badge-hired" style={{ marginBottom: '8px' }}>Round 1 Telephonic Calling</span>
                      <h3 style={{ fontSize: '1.4rem' }}>Customer Relationship Executive Hiring Pitch</h3>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Company: SRYN Management Pvt. Ltd. | Position: CRE | Salary: ₹15,000 / month</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(
                        scriptLang === 'hi' 
                          ? `Hello, kya meri baat ${scriptCandidateName || '[Candidate Name]'} se ho rahi hai? SRYN Management Pvt. Ltd. se Customer Relationship Executive hiring ke liye baat kar raha/rahi hoon.` 
                          : `Hello, may I speak with ${scriptCandidateName || '[Candidate Name]'}? Calling from SRYN Management Pvt. Ltd. for Customer Relationship Executive hiring.`,
                        'r1-full'
                      )}
                      className="btn btn-outline"
                      style={{ fontSize: '0.8rem', padding: '8px 14px' }}
                    >
                      {copiedSnippet === 'r1-full' ? <Check size={16} color="var(--success-color)" /> : <Copy size={16} />} Copy Quick Intro
                    </button>
                  </div>
                </div>

                {/* Step 1: Introduction */}
                <div className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary-color)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Step 1: Introduction & Courtesy Permission</span>
                    <button onClick={() => copyToClipboard(scriptLang === 'hi' ? `Hello, kya meri baat ${scriptCandidateName || '[Candidate Name]'} se ho rahi hai? Hi ${scriptCandidateName || '[Candidate Name]'}, mera naam ${currentUser?.fullName || '[Your Name]'} hai aur main SRYN Management Pvt. Ltd. se baat kar raha/rahi hoon. Kya abhi 2-3 minute baat karne ke liye sahi time hai?` : `Hello, may I speak with ${scriptCandidateName || '[Candidate Name]'}? Hi ${scriptCandidateName || '[Candidate Name]'}, my name is ${currentUser?.fullName || '[Your Name]'}, and I'm calling from SRYN Management Pvt. Ltd. Is this a good time to talk? It will only take 2–3 minutes.`, 's1')} className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
                      {copiedSnippet === 's1' ? <Check size={14} /> : <Copy size={14} />} Copy
                    </button>
                  </div>
                  <p style={{ fontSize: '0.95rem', lineHeight: '1.6', background: 'var(--surface-color)', padding: '12px 16px', borderRadius: '8px', borderLeft: '3px solid var(--primary-color)' }}>
                    {scriptLang === 'hi' ? (
                      <>
                        "Hello, kya meri baat <strong>{scriptCandidateName || '[Candidate Name]'}</strong> se ho rahi hai?<br/>
                        Hi <strong>{scriptCandidateName || '[Candidate Name]'}</strong>, mera naam <strong>{currentUser?.fullName || '[Your Name]'}</strong> hai, aur main <strong>SRYN Management Pvt. Ltd.</strong> se baat kar raha/rahi hoon.<br/>
                        Kya abhi 2–3 minute baat karne ke liye sahi time hai?"
                      </>
                    ) : (
                      <>
                        "Hello, may I speak with <strong>{scriptCandidateName || '[Candidate Name]'}</strong>?<br/>
                        Hi <strong>{scriptCandidateName || '[Candidate Name]'}</strong>, my name is <strong>{currentUser?.fullName || '[Your Name]'}</strong>, and I'm calling from <strong>SRYN Management Pvt. Ltd.</strong><br/>
                        Is this a good time to talk? It will only take 2–3 minutes."
                      </>
                    )}
                  </p>
                </div>

                {/* Step 2: Role & Hometown Opportunity */}
                <div className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--secondary-color)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Step 2: Opportunity & Hometown Work Pitch</span>
                    <button onClick={() => copyToClipboard(scriptLang === 'hi' ? `Hum abhi Customer Relationship Executives hire kar rahe hain. Sabse achhi baat ye hai ki hum aapko aapke hometown mein work opportunity de rahe hain. Offered salary ₹15,000 per month hai.` : `We are currently hiring Customer Relationship Executives for our financial services division. The best part is that we provide work opportunities in your hometown with salary ₹15,000 per month.`, 's2')} className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
                      {copiedSnippet === 's2' ? <Check size={14} /> : <Copy size={14} />} Copy
                    </button>
                  </div>
                  <p style={{ fontSize: '0.95rem', lineHeight: '1.6', background: 'var(--surface-color)', padding: '12px 16px', borderRadius: '8px', borderLeft: '3px solid var(--secondary-color)' }}>
                    {scriptLang === 'hi' ? (
                      <>
                        "Bahut badiya!<br/>
                        Hum abhi apni financial services division ke liye <strong>Customer Relationship Executives</strong> hire kar rahe hain. Aapki profile is opportunity ke liye suitable hai.<br/>
                        Sabse achhi baat ye hai ki hum aapko aapke <strong>hometown mein work opportunity</strong> de rahe hain, toh aapko relocate hone ki zaroorat nahi hai.<br/>
                        Offered salary <strong>₹15,000 per month</strong> hai, saath mein performance-based growth opportunities hain."
                      </>
                    ) : (
                      <>
                        "Great!<br/>
                        We are currently hiring <strong>Customer Relationship Executives</strong> for our financial services division. I came across your profile and found it suitable for this opportunity.<br/>
                        The best part is that we provide <strong>work opportunities in your hometown</strong>, so you don't need to relocate.<br/>
                        The offered salary is <strong>₹15,000 per month</strong>, along with performance-based growth opportunities."
                      </>
                    )}
                  </p>
                </div>

                {/* Step 3: FD Card Benefits */}
                <div className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--info-color)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Step 3: Role & FD Card Product Explanation</span>
                    <button onClick={() => copyToClipboard(scriptLang === 'hi' ? `Aapki responsibility hamare FD Card ke baare mein customers ko guide karna hoga. FD ₹2,000 se ₹5,00,000 tak, 7% annual interest, aur CIBIL score builder.` : `Your responsibility will be to guide customers about our FD Card. FD from ₹2,000 to ₹5,00,000 with 7% annual interest and CIBIL building benefits.`, 's3')} className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
                      {copiedSnippet === 's3' ? <Check size={14} /> : <Copy size={14} />} Copy
                    </button>
                  </div>
                  <p style={{ fontSize: '0.95rem', lineHeight: '1.6', background: 'var(--surface-color)', padding: '12px 16px', borderRadius: '8px', borderLeft: '3px solid var(--info-color)', marginBottom: '12px' }}>
                    {scriptLang === 'hi' ? (
                      "Aapki responsibility hamare FD Card ke baare mein customers ko guide karna aur application process mein help karna hoga. Hamara card un customers ke liye specially designed hai jo apna CIBIL score banana ya improve karna chahte hain."
                    ) : (
                      "Your responsibility will be to guide customers about our FD Card and help them complete the application process. Our company offers an FD-backed card specially designed for customers who want to improve or build their CIBIL score."
                    )}
                  </p>

                  <div style={{ background: 'rgba(37,99,235,0.05)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(37,99,235,0.15)' }}>
                    <strong style={{ fontSize: '0.85rem', color: 'var(--info-color)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>Key FD Card Benefits to Explain:</strong>
                    <ul style={{ paddingLeft: '20px', fontSize: '0.9rem', lineHeight: '1.6' }}>
                      <li>FD starting from <strong>₹2,000 up to ₹5,00,000</strong></li>
                      <li>Fixed Deposit earns <strong>7% annual interest</strong></li>
                      <li>FD remains in the customer's own name</li>
                      <li>Instant credit to linked card account upon FD closure process</li>
                      <li>Helps customers build a strong <strong>CIBIL score</strong> while their money earns interest</li>
                    </ul>
                  </div>
                </div>

                {/* Step 4: Simple Hiring Process & Payout */}
                <div className="card">
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--warning-color)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '10px' }}>Step 4: Hiring Process & Salary Payout Schedule</span>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '0.9rem' }}>
                    <div style={{ background: 'var(--surface-color)', padding: '14px', borderRadius: '8px' }}>
                      <strong>2-Round Simple Hiring:</strong>
                      <p style={{ marginTop: '6px', color: 'var(--text-secondary)' }}>
                        1st Round: Telephonic Interview<br/>
                        2nd Round: Video Interview<br/>
                        Then: Official Offer Letter & Dashboard Activation.
                      </p>
                    </div>
                    <div style={{ background: 'var(--surface-color)', padding: '14px', borderRadius: '8px' }}>
                      <strong>Salary Cycle & Payout:</strong>
                      <p style={{ marginTop: '6px', color: 'var(--text-secondary)' }}>
                        Salary is processed after completing <strong>30 days of work</strong>.<br/>
                        Payment credited within <strong>5–7 working days</strong> post cycle.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Step 5: Interview Invite Closing */}
                <div className="card" style={{ border: '2px solid var(--primary-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary-color)', textTransform: 'uppercase' }}>Step 5: Closing Line & Video Interview Invitation</span>
                    <button onClick={() => copyToClipboard(scriptLang === 'hi' ? `Would you be interested in attending our second-round video interview to know more about the company, salary structure, training process, and growth opportunities?` : `Would you be interested in attending our second-round video interview to know more about the company, salary structure, training process, and growth opportunities?`, 's5')} className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                      {copiedSnippet === 's5' ? <Check size={16} /> : <Copy size={16} />} Copy Closing Pitch
                    </button>
                  </div>
                  <p style={{ fontSize: '1rem', fontWeight: '600', lineHeight: '1.6', color: 'var(--text-primary)' }}>
                    {scriptLang === 'hi' ? (
                      `"Aapki profile dekhte hue, I believe ye opportunity aapke liye bahut achhi fit ho sakti hai. Kya aap hamare second-round video interview ko attend karne mein interested hain jahan company, salary structure, training aur growth ke baare mein detail milegi?"`
                    ) : (
                      `"Based on your profile, I believe this opportunity can be a good fit for you. Would you be interested in attending our second-round video interview to know more about the company, salary structure, training process, and growth opportunities?"`
                    )}
                  </p>
                </div>

                {/* Interactive Objection Handling Cards */}
                <h3 style={{ fontSize: '1.2rem', marginTop: '10px' }}>⚡ Interactive Candidate Objection Handlers</h3>
                <div className="grid-2">
                  {/* Objection 1 */}
                  <div className="card" style={{ borderLeft: '4px solid var(--danger-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <strong style={{ color: 'var(--danger-color)', fontSize: '0.9rem' }}>If Candidate Says "I'm Not Interested"</strong>
                      <button onClick={() => copyToClipboard(scriptLang === 'hi' ? `Main samajh sakta/samajhti hoon. Par ye ₹15,000 fixed salary wali hometown job hai, official offer letter aur training ke saath. Sirf 15-20 minute ka video interview hai, jiske baad aap decide kar sakte hain.` : `I completely understand. Before you decide, I'd just like to mention that this is a customer relationship role with a fixed salary of ₹15,000, work in your hometown, official offer letter, employee dashboard, and training support. It will only take around 15–20 minutes to attend the video interview.`, 'obj1')} className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '0.75rem' }}>
                        {copiedSnippet === 'obj1' ? <Check size={12} /> : <Copy size={12} />} Copy
                      </button>
                    </div>
                    <p style={{ fontSize: '0.88rem', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
                      {scriptLang === 'hi' ? (
                        `"Main samajh sakta/samajhti hoon. Par aapse kehna chahunga/chahungi ki ye Customer Relationship role hai jismein ₹15,000 fixed salary, hometown work opportunity, official offer letter, employee dashboard aur full training support milta hai. Sirf 15–20 minute ka video interview hai, jiske baad aap decide kar sakte hain. Kya aap ek baar interview attend karke final decision lena chahenge?"`
                      ) : (
                        `"I completely understand. Before you decide, I'd just like to mention that this is a customer relationship role with a fixed salary of ₹15,000, work opportunities in your hometown, official offer letter, employee dashboard, training support, and future career growth. It will only take around 15–20 minutes to attend the video interview, after which you can decide. Would you be willing to attend the interview once and then make your final decision?"`
                      )}
                    </p>
                  </div>

                  {/* Objection 2 */}
                  <div className="card" style={{ borderLeft: '4px solid var(--warning-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <strong style={{ color: 'var(--warning-color)', fontSize: '0.9rem' }}>If Candidate Asks "Is There Any Target?"</strong>
                      <button onClick={() => copyToClipboard(scriptLang === 'hi' ? `Ye Customer Relationship role hai jahan aap FD Card services mein help karenge. Video interview mein HR team aapko work process, targets, incentives aur growth ke baare mein detail mein batayegi.` : `This is a customer relationship role where you'll assist customers with our FD Card services. During the interview, our HR team will explain the complete work process, expectations, incentives, and career growth in detail.`, 'obj2')} className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '0.75rem' }}>
                        {copiedSnippet === 'obj2' ? <Check size={12} /> : <Copy size={12} />} Copy
                      </button>
                    </div>
                    <p style={{ fontSize: '0.88rem', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
                      {scriptLang === 'hi' ? (
                        `"Ye Customer Relationship role hai jahan aap customers ko hamari FD Card services mein assist karenge. Video interview ke dauran hamari HR team aapko complete work process, expectations, incentives aur career growth detail mein batayegi."`
                      ) : (
                        `"This is a customer relationship role where you'll assist customers with our FD Card services. During the interview, our HR team will explain the complete work process, expectations, incentives, and career growth in detail."`
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* --- ROUND 2 VIDEO INTERVIEW SCRIPT --- */}
            {scriptRound === 'round2' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="card" style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.08), rgba(222,49,99,0.04))', border: '1px solid rgba(37,99,235,0.2)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div>
                      <span className="badge badge-calling" style={{ marginBottom: '8px' }}>Round 2 Video Interview & Selection</span>
                      <h3 style={{ fontSize: '1.4rem' }}>Second Round Detailed Orientation & Evaluation Script</h3>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Position: Customer Relationship Executive | Target: ₹1 Lakh FD Value (60% Minimum for ₹15k Salary)</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(
                        `Hello ${scriptCandidateName || '[Candidate Name]'}, welcome to the second round video interview with SRYN Management Pvt. Ltd.`,
                        'r2-intro'
                      )}
                      className="btn btn-outline"
                      style={{ fontSize: '0.8rem', padding: '8px 14px' }}
                    >
                      {copiedSnippet === 'r2-intro' ? <Check size={16} color="var(--success-color)" /> : <Copy size={16} />} Copy Welcome Intro
                    </button>
                  </div>
                </div>

                {/* Section 1: Welcome & Tone */}
                <div className="card">
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary-color)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>1. Welcome & Interview Purpose</span>
                  <p style={{ fontSize: '0.95rem', lineHeight: '1.6', background: 'var(--surface-color)', padding: '12px 16px', borderRadius: '8px', borderLeft: '3px solid var(--primary-color)' }}>
                    {scriptLang === 'hi' ? (
                      `"Hello ${scriptCandidateName || '[Candidate Name]'}, SRYN Management Pvt. Ltd. ke second round video interview mein aapka swagat hai. Aaj ka interview sirf candidate select karne ke liye nahi hai, balki aapko job profile, responsibilities aur growth ke baare mein poori jankari dene ke liye hai taaki agar aap hamare saath judte hain toh aapko apna kaam clear rahe. Koi bhi sawaal ho toh zaroor poochiye."`
                    ) : (
                      `"Hello ${scriptCandidateName || '[Candidate Name]'}, welcome to the second round of your interview with SRYN Management Pvt. Ltd. First of all, thank you for joining us today. This interview is not just about selecting candidates—it is also about helping you understand the complete job profile so that, if you join us, you know exactly what your responsibilities, growth opportunities, and expectations will be. Please feel free to ask questions at any point."`
                    )}
                  </p>
                </div>

                {/* Section 2: About SRYN */}
                <div className="card">
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--secondary-color)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>2. About SRYN Management Pvt. Ltd.</span>
                  <p style={{ fontSize: '0.92rem', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
                    {scriptLang === 'hi' ? (
                      "SRYN Management Pvt. Ltd. financial services sector mein kaam karti hai. Hamara uddeshya customers ko sahi financial products dena hai jisse unka credit journey behtar bane aur unhe Fixed Deposits par 7% annual interest mil sake. Hum transparency, proper training, aur employees ki long-term career growth par focus karte hain."
                    ) : (
                      "SRYN Management Pvt. Ltd. works in the financial services sector. Our objective is to help customers access financial products that can support their credit journey while allowing them to earn returns on their Fixed Deposits. We believe in transparency, proper training, and long-term career growth for our employees."
                    )}
                  </p>
                </div>

                {/* Section 3: Job Role & No Field Collection */}
                <div className="card" style={{ borderLeft: '4px solid var(--info-color)' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--info-color)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>3. Job Role Clarity (Customer Relationship Executive)</span>
                  <p style={{ fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '12px' }}>
                    {scriptLang === 'hi' ? (
                      `Aapki designation Customer Relationship Executive ki hogi. Ye Customer Relationship aur Acquisition role hai. Aapka kaam logon se milna, trust build karna, FD Card explain karna, aur application complete karvana hai. THIS IS NOT A FIELD COLLECTION JOB. Aapko kisi se cash collect nahi karna hai.`
                    ) : (
                      `The position you have applied for is Customer Relationship Executive. This is a customer relationship and customer acquisition role. Your responsibility is to meet people, build trust, explain our FD Card product, answer customer queries, and help interested customers complete their application. THIS IS NOT A FIELD COLLECTION JOB, and you will never collect cash from customers on behalf of the company.`
                    )}
                  </p>
                  <div style={{ background: 'var(--surface-color)', padding: '12px 16px', borderRadius: '8px', fontSize: '0.85rem' }}>
                    <strong>Network Building Points to Explain:</strong>
                    <p style={{ marginTop: '4px', color: 'var(--text-secondary)' }}>
                      Start with personal local network: Family, friends, relatives, neighbours, local shopkeepers, salaried employees, business owners.<br/>
                      As company expands digital marketing campaigns, qualified customer inquiries are assigned based on performance.
                    </p>
                  </div>
                </div>

                {/* Section 4: Target Breakdown & 60% Criteria */}
                <div className="card" style={{ border: '2px solid var(--warning-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--warning-color)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Target size={18} /> 4. Target Structure & Salary Eligibility
                    </span>
                    <span className="badge badge-calling">Target: ₹1,00,000 FD Value</span>
                  </div>

                  <div className="grid-3" style={{ marginBottom: '16px' }}>
                    <div style={{ background: 'var(--surface-color)', padding: '14px', borderRadius: '8px', textAnchor: 'middle' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Monthly Target</div>
                      <div style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--text-primary)' }}>₹1,00,000</div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Total FD Business</span>
                    </div>
                    <div style={{ background: 'rgba(16,185,129,0.08)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.2)' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--success-color)', fontWeight: 'bold' }}>Minimum Eligibility (60%)</div>
                      <div style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--success-color)' }}>₹60,000</div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>For Fixed Salary ₹15,000</span>
                    </div>
                    <div style={{ background: 'rgba(37,99,235,0.08)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(37,99,235,0.2)' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--info-color)', fontWeight: 'bold' }}>Primary Focus FDs</div>
                      <div style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--info-color)' }}>₹2,000 & ₹5,000</div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Affordable for all</span>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.9rem', lineHeight: '1.6', background: 'var(--surface-color)', padding: '12px', borderRadius: '8px' }}>
                    {scriptLang === 'hi' ? (
                      `"Target sun kar ghabraney ki zaroorat nahi hai. Aapko ek customer se 1 Lakh nahi lana hai. Humara daily focus ₹2,000 aur ₹5,000 ki FDs par rehta hai. 12 se 15 choti FDs poore 30 din mein complete karne par aapka minimum 60% requirement aasaani se poora ho jata hai!"`
                    ) : (
                      `"You are not expected to find ₹1 lakh from one customer. Our day-to-day focus is on ₹2,000 and ₹5,000 FDs. Completing 12 to 15 small FDs across the month easily achieves your 60% salary requirement!"`
                    )}
                  </p>
                </div>

                {/* Section 5: Training & Company Support Suite */}
                <div className="card">
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--success-color)', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>5. Complete Training & Support Package Provided</span>
                  <div className="grid-2" style={{ fontSize: '0.88rem' }}>
                    <ul style={{ paddingLeft: '20px', lineHeight: '1.7' }}>
                      <li>Complete Product Training</li>
                      <li>Customer Communication & Pitch Training</li>
                      <li>Sales Conversation & Objection Handling</li>
                      <li>Live Application Process Training</li>
                      <li>Employee Dashboard Access</li>
                    </ul>
                    <ul style={{ paddingLeft: '20px', lineHeight: '1.7' }}>
                      <li>Official Offer Letter & Employee ID Card</li>
                      <li>Product Brochures & Digital Presentation</li>
                      <li>WhatsApp Marketing Material</li>
                      <li>Social Media Promotional Creatives</li>
                      <li>Daily Manager Guidance & Support</li>
                    </ul>
                  </div>
                </div>

                {/* Section 6: Candidate Readiness Checklist */}
                <div className="card" style={{ background: 'var(--surface-color)' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary-color)', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>6. Candidate Evaluation Questions (Ask Candidate)</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <CheckCircle2 size={16} color="var(--primary-color)" />
                      <span>Are you comfortable speaking with new people every day?</span>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <CheckCircle2 size={16} color="var(--primary-color)" />
                      <span>Can you build relationships within your local area?</span>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <CheckCircle2 size={16} color="var(--primary-color)" />
                      <span>Are you willing to learn and follow the company's process?</span>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <CheckCircle2 size={16} color="var(--primary-color)" />
                      <span>Are you looking for a long-term opportunity where communication skills help you grow?</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        {/* --- SHARE JOB DESCRIPTION (JD) TAB --- */}
        {activeTab === 'jd' && (
          <div style={tabContentStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Send size={26} color="var(--primary-color)" /> Job Description (JD) & WhatsApp Sharer
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
                  Send branded Job Descriptions directly to candidate WhatsApp numbers or copy formatted email templates.
                </p>
                <div style={{ display: 'inline-flex', alignItems: 'center', background: 'var(--surface-color)', padding: '4px 8px', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '8px' }}>
                  <span style={{ fontSize: '0.8rem', marginRight: '8px', color: 'var(--text-muted)' }}>Active Hiring Campaign:</span>
                  <select
                    className="form-control"
                    value={selectedProjId}
                    onChange={(e) => handleSelectProject(e.target.value)}
                    style={{ background: 'none', border: 'none', color: 'var(--primary-color)', outline: 'none', fontSize: '0.85rem', fontWeight: 'bold', padding: '0 4px', cursor: 'pointer' }}
                  >
                    {assignedProjects.map(p => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Format Switcher */}
              <div style={{ display: 'flex', background: 'var(--surface-color)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <button
                  onClick={() => setJdFormat('whatsapp_hi')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    background: jdFormat === 'whatsapp_hi' ? '#25D366' : 'transparent',
                    color: jdFormat === 'whatsapp_hi' ? '#fff' : 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <MessageCircle size={14} /> WhatsApp (Hindi)
                </button>
                <button
                  onClick={() => setJdFormat('whatsapp_en')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    background: jdFormat === 'whatsapp_en' ? '#25D366' : 'transparent',
                    color: jdFormat === 'whatsapp_en' ? '#fff' : 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Globe size={14} /> WhatsApp (English)
                </button>
                <button
                  onClick={() => setJdFormat('email')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    background: jdFormat === 'email' ? 'var(--primary-color)' : 'transparent',
                    color: jdFormat === 'email' ? '#fff' : 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <FileText size={14} /> Formal Email
                </button>
              </div>
            </div>

            <div className="grid-2" style={{ gap: '30px', alignItems: 'start' }}>
              {/* Left Column: Candidate & Job Parameters Form */}
              <div className="card">
                <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Briefcase size={18} color="var(--primary-color)" /> Customize Job Description
                </h3>

                <div className="form-group">
                  <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Candidate Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Rahul Sharma"
                    value={jdCandidateName}
                    onChange={(e) => setJdCandidateName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Candidate Mobile Number (WhatsApp)</label>
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="e.g. 9876543210"
                    value={jdCandidateMobile}
                    onChange={(e) => setJdCandidateMobile(e.target.value)}
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Include country code or 10-digit mobile number for direct WhatsApp messaging.</span>
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Position / Job Title</label>
                  <input
                    type="text"
                    className="form-control"
                    value={effectiveRole}
                    onChange={(e) => setJdRole(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Offered Salary Package</label>
                  <input
                    type="text"
                    className="form-control"
                    value={effectiveSalary}
                    onChange={(e) => setJdSalary(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Job Location</label>
                  <input
                    type="text"
                    className="form-control"
                    value={effectiveLocation}
                    onChange={(e) => setJdLocation(e.target.value)}
                  />
                </div>

                {/* Quick Highlights Summary Card */}
                <div style={{ background: 'var(--surface-color)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '20px' }}>
                  <strong style={{ fontSize: '0.85rem', color: 'var(--primary-color)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>
                    ⚡ Key Highlights Included:
                  </strong>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <div>• <strong>Fixed Salary:</strong> ₹15,000 / month</div>
                    <div>• <strong>Work Placement:</strong> Hometown / Local Area</div>
                    <div>• <strong>Product Division:</strong> SRYN CIBIL FD Card (7% Returns)</div>
                    <div>• <strong>Official Benefits:</strong> Offer Letter, ID Card, Employee Portal</div>
                  </div>
                </div>
              </div>

              {/* Right Column: WhatsApp Live Preview & Action Buttons */}
              <div className="card" style={{ padding: '0', overflow: 'hidden', border: '1px solid #10b981' }}>
                {/* WhatsApp Header Bar */}
                <div style={{ background: '#075e54', color: '#ffffff', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <MessageCircle size={22} color="#25D366" />
                    <div>
                      <div style={{ fontWeight: '800', fontSize: '0.95rem' }}>WhatsApp JD Preview</div>
                      <span style={{ fontSize: '0.7rem', color: '#e2e8f0' }}>SRYN Management Pvt. Ltd. Official HR Desk</span>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '12px' }}>
                    ✓ Verified Template
                  </span>
                </div>

                {/* Message Body Preview Area */}
                <div style={{ padding: '20px', background: '#efeae2', maxHeight: '480px', overflowY: 'auto', fontFamily: 'system-ui, sans-serif' }}>
                  <div style={{ background: '#ffffff', padding: '16px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.12)', fontSize: '0.88rem', lineHeight: '1.65', color: '#111b21', whiteSpace: 'pre-wrap' }}>
                    {getWhatsAppJDText()}
                  </div>
                </div>

                {/* Bottom Share & Copy Toolbar */}
                <div style={{ padding: '16px', background: '#f0f2f5', borderTop: '1px solid #e9edef', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => handleShareWhatsAppJD(getWhatsAppJDText())}
                    className="btn btn-primary"
                    style={{ flex: 1, minWidth: '180px', background: '#25D366', borderColor: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 'bold' }}
                  >
                    <Send size={18} /> Send Directly via WhatsApp
                  </button>

                  <button
                    onClick={() => copyToClipboard(getWhatsAppJDText(), 'jd-text')}
                    className="btn btn-outline"
                    style={{ padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    {copiedSnippet === 'jd-text' ? <Check size={16} color="var(--success-color)" /> : <Copy size={16} />} Copy Text
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div style={tabContentStyle}>
            <Profile />
          </div>
        )}

      </main>

      {/* --- CRM CALL SIMULATION MODAL --- */}
      {callingLead && (
        <div className="modal-overlay">
          <div className="modal-content fade-in" style={{ maxWidth: '460px' }}>
            <div style={modalHeaderStyle}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <PhoneIncoming size={20} color="var(--primary-color)" /> CRM Call Simulator
              </h3>
              <button onClick={() => setCallingLead(null)}><X size={20} /></button>
            </div>
            
            <div style={dialingSectionStyle}>
              <div className="pulse-circle" style={pulseCircleStyle}>
                <PhoneCall size={32} color="#fff" />
              </div>
              <h4 style={{ fontSize: '1.4rem', marginTop: '16px' }}>{callingLead.fullName}</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Dialing: {callingLead.mobile}</p>
            </div>

            <hr style={{ margin: '20px 0', borderColor: 'var(--border-color)' }} />

            <div className="form-group">
              <label>Update Candidate Status</label>
              <select 
                className="form-control"
                value={callStatus}
                onChange={(e) => setCallStatus(e.target.value)}
              >
                <option value="New">New / Uncalled</option>
                <option value="Calling">Calling / Scheduled Back</option>
                <option value="Interested">Interested / Send Offer</option>
                <option value="Hired">Hired (Onboarding Complete)</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div className="form-group">
              <label>HR Feedback & Log Notes</label>
              <textarea 
                rows="3" 
                className="form-control"
                placeholder="Log candidate response, interview results, or details..."
                value={callNotes}
                onChange={(e) => setCallNotes(e.target.value)}
              ></textarea>
            </div>

            <button onClick={saveCallOutcome} className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
              <Save size={18} /> Update Lead & Save Outcomes
            </button>
          </div>
        </div>
      )}

      {/* --- MANUAL LEAD MODAL --- */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content fade-in">
            <div style={modalHeaderStyle}>
              <h3>Add New Candidate Lead</h3>
              <button onClick={() => setShowAddModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleManualLeadSubmit}>
              <div className="form-group">
                <label>Candidate Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={newLeadForm.fullName}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, fullName: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Mobile Number</label>
                <input
                  type="tel"
                  className="form-control"
                  value={newLeadForm.mobile}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, mobile: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  value={newLeadForm.email}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Project Campaign</label>
                <select
                  className="form-control"
                  value={newLeadForm.project}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, project: e.target.value })}
                  required
                >
                  <option value="">-- Choose Campaign --</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.title}>{p.title}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Hiring Role Type</label>
                <select
                  className="form-control"
                  value={newLeadForm.roleApplied}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, roleApplied: e.target.value })}
                  required
                >
                  <option value="Field Executive">Field Executive</option>
                  <option value="Delivery Boy">Delivery Boy</option>
                  <option value="TL Agent">Team Leader</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                Insert Lead to CRM
              </button>
            </form>
          </div>
        </div>
      )}
      {/* --- CANDIDATE OFFER LETTER MODAL --- */}
      {selectedLeadOffer && (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
          <div className="modal-content fade-in" style={{ maxWidth: '850px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>Appointment Cum Offer Letter – {selectedLeadOffer.fullName}</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Position: {selectedLeadOffer.roleApplied || selectedLeadOffer.project}</span>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button onClick={() => handleDownloadPDF(selectedLeadOffer)} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                  <Printer size={16} /> Print / Save PDF
                </button>
                <button onClick={() => setSelectedLeadOffer(null)} className="btn btn-outline" style={{ padding: '8px 12px' }}>
                  <X size={18} />
                </button>
              </div>
            </div>
            
            <div className="contract-document-wrapper" style={{ maxHeight: '70vh', overflowY: 'auto', background: '#f8fafc', padding: '20px', borderRadius: '8px' }}>
              <div 
                dangerouslySetInnerHTML={{ __html: renderOfferLetter(selectedLeadOffer) }} 
                style={{ textAlign: 'left' }}
              />
            </div>
          </div>
        </div>
      )}

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
  backgroundColor: 'var(--secondary-light)',
  color: 'var(--secondary-color)'
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

const progressRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: '0.9rem',
  color: 'var(--text-secondary)'
};

const leadHistoryRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '10px 14px',
  borderRadius: 'var(--radius-sm)',
  backgroundColor: 'rgba(255,255,255,0.01)',
  border: '1px solid var(--border-color)',
  textAlign: 'left'
};

const filterPanelStyle = {
  display: 'flex',
  gap: '16px',
  alignItems: 'center',
  flexWrap: 'wrap',
  margin: '20px 0'
};

const searchContainerStyle = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  flex: 1,
  minWidth: '240px'
};

const searchIconStyle = {
  position: 'absolute',
  left: '16px',
  color: 'var(--text-muted)'
};

const modalHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '20px'
};

const dialingSectionStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '20px 0'
};

const pulseCircleStyle = {
  width: '70px',
  height: '70px',
  borderRadius: '50%',
  backgroundColor: 'var(--primary-color)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  animation: 'pulseGlow 1.5s infinite alternate'
};

const progressBarContainerStyle = {
  height: '6px',
  width: '100%',
  backgroundColor: 'rgba(255,255,255,0.05)',
  borderRadius: 'var(--radius-full)',
  overflow: 'hidden',
  marginTop: '8px'
};

const progressBarFillStyle = {
  height: '100%',
  transition: 'width 0.3s ease'
};

const crmStyles = document.createElement('style');
crmStyles.textContent = `
  @keyframes pulseGlow {
    from { box-shadow: 0 0 0 0px rgba(16, 185, 129, 0.4); }
    to { box-shadow: 0 0 0 16px rgba(16, 185, 129, 0); }
  }
  aside button[style*="activeLinkStyle"]:hover { background-color: var(--secondary-light) !important; color: var(--secondary-color) !important; }
`;
document.head.appendChild(crmStyles);

export default HRDashboard;
