import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Users, Briefcase, FileText, Settings, Layout, LogOut, Plus, Trash2, Edit3, UserCheck, Upload, Save, HelpCircle, Menu, X,
  BookOpen, Video, PhoneCall, Share2, Power, ToggleLeft, ToggleRight, Eye, EyeOff, ExternalLink, CheckCircle2, ShieldCheck,
  LayoutDashboard
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import dbService from '../../services/db';

const AdminDashboard = () => {
  const { 
    projects, leads, customers, templates, cms, trainingModules, logout, 
    createProject, updateProjectDetails, deleteProjectDetails, 
    createTrainingModule, updateTrainingModuleDetails, deleteTrainingModuleDetails,
    updateCMS, saveOfferLetterTemplate, changeUserRoleAdmin,
    approveUserKYCAdmin, deleteUserAdmin, resetUserPasswordAdmin,
    assignLeadsToHR, uploadLeadsBulk, showToast 
  } = useApp();
  
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Training Module Form States
  const [showTrainModal, setShowTrainModal] = useState(false);
  const [editingTrain, setEditingTrain] = useState(null);
  const [trainForm, setTrainForm] = useState({
    title: '',
    category: 'FD Card',
    targetRole: 'Candidate',
    description: '',
    pdfUrl: '',
    fileName: ''
  });

  const handleTrainFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setTrainForm(prev => ({
        ...prev,
        pdfUrl: event.target.result,
        fileName: file.name
      }));
      showToast(`Attached PDF file "${file.name}"`, "info");
    };
    reader.readAsDataURL(file);
  };

  const handleTrainSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!trainForm.title || !trainForm.category || !trainForm.description) {
      showToast("Please fill in Title, Category, and Description.", "warning");
      return;
    }
    try {
      if (editingTrain) {
        await updateTrainingModuleDetails(editingTrain.id, trainForm);
      } else {
        await createTrainingModule(trainForm);
      }
      setShowTrainModal(false);
      setEditingTrain(null);
      setTrainForm({ title: '', category: 'FD Card', targetRole: 'Candidate', description: '', pdfUrl: '', fileName: '' });
    } catch (err) {}
  };

  const handleEditTrainClick = (m) => {
    setEditingTrain(m);
    setTrainForm({
      title: m.title || '',
      category: m.category || 'FD Card',
      targetRole: m.targetRole || 'Candidate',
      description: m.description || '',
      pdfUrl: m.pdfUrl || '',
      fileName: m.fileName || ''
    });
    setShowTrainModal(true);
  };

  const handleDeleteTrainClick = async (id) => {
    if (window.confirm("Are you sure you want to delete this training module?")) {
      await deleteTrainingModuleDetails(id);
    }
  };

  // Local state for administrative tables
  const [usersList, setUsersList] = useState([]);
  const [hrOfficers, setHrOfficers] = useState([]);
  const [selectedUserForKYC, setSelectedUserForKYC] = useState(null);
  const [editingCandidate, setEditingCandidate] = useState(null);
  const [candidateForm, setCandidateForm] = useState({
    fullName: '', email: '', mobile: '', aadharNumber: '', 
    address: '', city: '', state: '', pincode: '',
    bankName: '', accountNumber: '', ifscCode: '', accountHolderName: ''
  });

  // CMS Form States
  const [homeCMS, setHomeCMS] = useState({ heroTitle: '', heroSubtitle: '', statsCandidates: '', statsPartners: '', statsCommission: '' });
  const [aboutCMS, setAboutCMS] = useState({ mission: '', vision: '' });

  // Template Form States
  const [selectedTemplateRole, setSelectedTemplateRole] = useState('Candidate');
  const [templateTitle, setTemplateTitle] = useState('');
  const [templateContent, setTemplateContent] = useState('');

  // Project Form States
  const [showProjModal, setShowProjModal] = useState(false);
  const [editingProj, setEditingProj] = useState(null);
  const [projForm, setProjForm] = useState({ title: '', category: 'Financial Products', description: '', commission: '', workingLink: '' });

  // Campaign HR Assignment Modal States
  const [showHRAssignModal, setShowHRAssignModal] = useState(false);
  const [selectedHRAssignModalProj, setSelectedHRAssignModalProj] = useState(null);
  const [selectedHRsForCampaign, setSelectedHRsForCampaign] = useState(['ALL']);

  // Document Lightbox Preview State
  const [previewDocModal, setPreviewDocModal] = useState(null);

  // Script Editor States
  const [selectedScriptProjId, setSelectedScriptProjId] = useState('');
  const [scriptFormData, setScriptFormData] = useState({
    scriptRound1Hindi: '',
    scriptRound1English: '',
    scriptRound2Hindi: '',
    scriptRound2English: '',
    jdHindi: '',
    jdEnglish: ''
  });

  useEffect(() => {
    if (projects && projects.length > 0) {
      const activeId = selectedScriptProjId || projects[0]?.id;
      if (!selectedScriptProjId && activeId) {
        setSelectedScriptProjId(activeId);
      }
      const found = projects.find(p => p.id === activeId);
      if (found) {
        setScriptFormData({
          scriptRound1Hindi: found.scriptRound1Hindi || '',
          scriptRound1English: found.scriptRound1English || '',
          scriptRound2Hindi: found.scriptRound2Hindi || '',
          scriptRound2English: found.scriptRound2English || '',
          jdHindi: found.jdHindi || '',
          jdEnglish: found.jdEnglish || ''
        });
      }
    }
  }, [selectedScriptProjId, projects]);

  const handleSaveScripts = async (e) => {
    if (e) e.preventDefault();
    if (!selectedScriptProjId) {
      showToast("Please select a Campaign Project first.", "warning");
      return;
    }
    try {
      await updateProjectDetails(selectedScriptProjId, {
        ...scriptFormData,
        scriptActive: true
      });
      showToast("Calling & Pitch Scripts saved and published to HR Officers successfully!", "success");
    } catch (err) {
      showToast("Failed to save scripts: " + err.message, "danger");
    }
  };

  const handleToggleScriptActive = async (proj) => {
    try {
      const newStatus = proj.scriptActive !== false ? false : true;
      await updateProjectDetails(proj.id, { scriptActive: newStatus });
      showToast(`Script status for "${proj.title}" set to ${newStatus ? 'ACTIVE (ON)' : 'DISABLED (OFF)'}`, "info");
    } catch (err) {
      showToast("Failed to toggle script status: " + err.message, "danger");
    }
  };

  const handleDeleteScript = async (proj) => {
    if (window.confirm(`Are you sure you want to delete/reset calling scripts for "${proj.title}"?`)) {
      try {
        await updateProjectDetails(proj.id, {
          scriptRound1Hindi: '',
          scriptRound1English: '',
          scriptRound2Hindi: '',
          scriptRound2English: '',
          jdHindi: '',
          jdEnglish: '',
          scriptActive: false
        });
        if (selectedScriptProjId === proj.id) {
          setScriptFormData({
            scriptRound1Hindi: '',
            scriptRound1English: '',
            scriptRound2Hindi: '',
            scriptRound2English: '',
            jdHindi: '',
            jdEnglish: ''
          });
        }
        showToast(`Calling scripts deleted for "${proj.title}".`, "success");
      } catch (err) {
        showToast("Failed to delete scripts: " + err.message, "danger");
      }
    }
  };

  const handleEditScript = (proj) => {
    setSelectedScriptProjId(proj.id);
    setScriptFormData({
      scriptRound1Hindi: proj.scriptRound1Hindi || '',
      scriptRound1English: proj.scriptRound1English || '',
      scriptRound2Hindi: proj.scriptRound2Hindi || '',
      scriptRound2English: proj.scriptRound2English || '',
      jdHindi: proj.jdHindi || '',
      jdEnglish: proj.jdEnglish || ''
    });
    const editorElem = document.getElementById('script-editor-form');
    if (editorElem) {
      editorElem.scrollIntoView({ behavior: 'smooth' });
    }
    showToast(`Loaded scripts for "${proj.title}" into Editor below.`, "info");
  };

  // Leads Assignment States
  const [bulkLeadsText, setBulkLeadsText] = useState('');
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [targetHR, setTargetHR] = useState('');

  // Load all users
  const loadUsers = async () => {
    try {
      const res = await dbService.getUsers();
      setUsersList(res);
      setHrOfficers(res.filter(u => u.role === 'HR' || u.role === 'Admin'));
    } catch (err) {}
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Calculate summary metrics for Admin Panel
  const hrCount = usersList.filter(u => u.role === 'HR').length;
  const candidateCount = usersList.filter(u => u.role === 'Candidate').length;
  const pendingCandidatesCount = usersList.filter(u => u.role === 'Candidate' && u.profileApproved !== true).length;
  const approvedCandidatesCount = usersList.filter(u => u.role === 'Candidate' && u.profileApproved === true).length;
  
  const totalCustomersCount = (customers || []).length;
  const pendingCustomersCount = (customers || []).filter(c => c.status === 'Pending' || c.status === 'Pending KYC' || c.status === 'Calling' || !c.status).length;
  const activeCustomersCount = (customers || []).filter(c => c.status === 'Active' || c.status === 'Completed' || c.status === 'Approved').length;

  // Initialize CMS forms
  useEffect(() => {
    if (cms.home) {
      setHomeCMS(cms.home);
    }
    if (cms.about) {
      setAboutCMS(cms.about);
    }
  }, [cms]);

  // Initialize Template forms
  useEffect(() => {
    const activeTemp = templates.find(t => t.role === selectedTemplateRole);
    if (activeTemp) {
      setTemplateTitle(activeTemp.title);
      setTemplateContent(activeTemp.content);
    } else {
      setTemplateTitle('');
      setTemplateContent('');
    }
  }, [selectedTemplateRole, templates]);

  // User role modifications
  const handleRoleChange = async (uid, newRole) => {
    try {
      await changeUserRoleAdmin(uid, newRole);
      await loadUsers();
    } catch (err) {}
  };

  const handleEditCandidateClick = (c) => {
    setEditingCandidate(c);
    setCandidateForm({
      fullName: c.fullName || '',
      email: c.email || '',
      mobile: c.mobile || '',
      aadharNumber: c.aadharNumber || '',
      address: c.address || '',
      city: c.city || '',
      state: c.state || '',
      pincode: c.pincode || '',
      bankName: c.bankName || '',
      accountNumber: c.accountNumber || '',
      ifscCode: c.ifscCode || '',
      accountHolderName: c.accountHolderName || ''
    });
  };

  const handleCandidateEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingCandidate) return;
    try {
      await dbService.updateProfile(editingCandidate.uid, candidateForm);
      showToast("Candidate profile updated successfully!", "success");
      setEditingCandidate(null);
      await loadUsers();
    } catch (err) {
      showToast(err.message, "danger");
    }
  };

  const handleReviewKYCClick = async (u) => {
    let base = { ...u };
    if (u.uid) {
      const storedRes = localStorage.getItem(`gs_doc_resume_${u.uid}`);
      if (storedRes && (!base.resume || base.resume.length < 100)) base.resume = storedRes;
      const storedFront = localStorage.getItem(`gs_doc_aadharFront_${u.uid}`);
      if (storedFront && (!base.aadharFront || base.aadharFront.length < 100)) base.aadharFront = storedFront;
      const storedBack = localStorage.getItem(`gs_doc_aadharBack_${u.uid}`);
      if (storedBack && (!base.aadharBack || base.aadharBack.length < 100)) base.aadharBack = storedBack;
    }
    setSelectedUserForKYC(base);

    if (dbMode === 'FIREBASE' && (u.uid || u.email)) {
      try {
        let fullDoc = null;
        if (u.uid) {
          const docSnap = await getDoc(doc(firebaseFirestore, 'users', u.uid));
          if (docSnap.exists()) fullDoc = docSnap.data();
        }
        if (!fullDoc && u.email) {
          const docSnap = await getDoc(doc(firebaseFirestore, 'users', u.email.toLowerCase().trim()));
          if (docSnap.exists()) fullDoc = docSnap.data();
        }
        if (fullDoc) {
          setSelectedUserForKYC(prev => {
            const merged = { ...prev, ...fullDoc };
            if (u.uid) {
              const sRes = localStorage.getItem(`gs_doc_resume_${u.uid}`);
              if (sRes && (!merged.resume || merged.resume.length < 100)) merged.resume = sRes;
            }
            return merged;
          });
        }
      } catch (err) {
        console.error("Error fetching full KYC doc from Firestore:", err);
      }
    }
  };

  const handleDeleteCandidateClick = async (userObjOrUid) => {
    if (window.confirm("Are you sure you want to delete this user completely from the portal?")) {
      await deleteUserAdmin(userObjOrUid);
      await loadUsers();
    }
  };

  const handleResetPasswordClick = async (uid, email) => {
    if (window.confirm(`Are you sure you want to trigger password reset for ${email}?`)) {
      await resetUserPasswordAdmin(uid, email);
    }
  };

  // CMS update submissions
  const handleCMSUpdate = async (e) => {
    e.preventDefault();
    await updateCMS({ home: homeCMS, about: aboutCMS });
  };

  // Template save submissions
  const handleTemplateSave = async (e) => {
    e.preventDefault();
    const activeTemp = templates.find(t => t.role === selectedTemplateRole);
    const id = activeTemp?.id || 'temp-' + selectedTemplateRole.toLowerCase();
    await saveOfferLetterTemplate(id, {
      role: selectedTemplateRole,
      title: templateTitle,
      content: templateContent
    });
  };

  const [projFormErrors, setProjFormErrors] = useState({});

  // Project save updates
  const handleProjSubmit = async (e) => {
    if (e) e.preventDefault();
    const errors = {};
    if (!projForm.title?.trim()) errors.title = "Campaign Title is required";
    if (!projForm.salary?.trim()) errors.salary = "Offered Salary is required";
    if (!projForm.location?.trim()) errors.location = "Work Location is required";
    if (!projForm.commission?.trim()) errors.commission = "Commission Structure is required";
    if (!projForm.workingLink?.trim()) errors.workingLink = "Onboarding Link is required";
    if (!projForm.description?.trim()) errors.description = "Overview & Description is required";

    if (Object.keys(errors).length > 0) {
      setProjFormErrors(errors);
      showToast("Please fill all required campaign fields highlighted in red.", "danger");
      return;
    }
    setProjFormErrors({});

    try {
      if (editingProj) {
        await updateProjectDetails(editingProj.id, projForm);
      } else {
        await createProject(projForm);
      }
      setShowProjModal(false);
      setEditingProj(null);
      setProjForm({ 
        title: '', category: 'Financial Products', description: '', commission: '', workingLink: '',
        salary: '₹15,000 / month + Incentives', location: 'Hometown / Local Area', assignedHR: 'ALL',
        jdHindi: '', jdEnglish: '', scriptRound1Hindi: '', scriptRound2Hindi: ''
      });
    } catch (err) {}
  };

  const handleEditProjClick = (p) => {
    setEditingProj(p);
    setProjForm({ 
      title: p.title || '', 
      category: p.category || 'Financial Products', 
      description: p.description || '', 
      commission: p.commission || '', 
      workingLink: p.workingLink || '',
      salary: p.salary || '₹15,000 / month + Incentives',
      location: p.location || 'Hometown / Local Area',
      assignedHR: p.assignedHR || 'ALL',
      jdHindi: p.jdHindi || '',
      jdEnglish: p.jdEnglish || '',
      scriptRound1Hindi: p.scriptRound1Hindi || '',
      scriptRound2Hindi: p.scriptRound2Hindi || ''
    });
    setShowProjModal(true);
  };

  const handleDeleteProjClick = async (id) => {
    if (window.confirm("Are you sure you want to delete this campaign?")) {
      await deleteProjectDetails(id);
    }
  };

  // Campaign HR Assignment Handlers
  const handleOpenAssignHRModal = (proj) => {
    setSelectedHRAssignModalProj(proj);
    const existingHRs = proj.assignedHRs || (proj.assignedHR ? (Array.isArray(proj.assignedHR) ? proj.assignedHR : [proj.assignedHR]) : ['ALL']);
    setSelectedHRsForCampaign(existingHRs.length > 0 ? existingHRs : ['ALL']);
    setShowHRAssignModal(true);
  };

  const handleToggleHRSelection = (hrUid) => {
    if (hrUid === 'ALL') {
      setSelectedHRsForCampaign(['ALL']);
      return;
    }

    let updated = selectedHRsForCampaign.filter(id => id !== 'ALL');
    if (updated.includes(hrUid)) {
      updated = updated.filter(id => id !== hrUid);
    } else {
      updated.push(hrUid);
    }

    if (updated.length === 0) {
      updated = ['ALL'];
    }
    setSelectedHRsForCampaign(updated);
  };

  const handleSaveHRAssignments = async () => {
    if (!selectedHRAssignModalProj) return;
    try {
      await updateProjectDetails(selectedHRAssignModalProj.id, {
        assignedHRs: selectedHRsForCampaign,
        assignedHR: selectedHRsForCampaign.includes('ALL') ? 'ALL' : (selectedHRsForCampaign[0] || 'ALL')
      });
      showToast(`HR Assignments updated for "${selectedHRAssignModalProj.title}"!`, "success");
      setShowHRAssignModal(false);
      setSelectedHRAssignModalProj(null);
    } catch (err) {
      showToast("Failed to update HR assignments: " + err.message, "danger");
    }
  };

  // Bulk Leads Parsing
  const handleBulkLeadsUpload = () => {
    if (!bulkLeadsText) {
      showToast("Please paste CSV formatted leads data.", "warning");
      return;
    }
    // Simple line-by-line CSV parser
    // Expect: Full Name, Mobile, Email, Project applied
    const lines = bulkLeadsText.split('\n').filter(l => l.trim().length > 0);
    const parsed = [];
    
    lines.forEach((line) => {
      const parts = line.split(',');
      if (parts.length >= 3) {
        parsed.push({
          fullName: parts[0]?.trim(),
          mobile: parts[1]?.trim(),
          email: parts[2]?.trim(),
          project: parts[3]?.trim() || projects[0]?.title || 'HDFC Credit Card Sales',
          roleApplied: parts[4]?.trim() || 'Field Executive'
        });
      }
    });

    if (parsed.length === 0) {
      showToast("Invalid CSV format. Please separate fields by commas.", "warning");
      return;
    }

    uploadLeadsBulk(parsed);
    setBulkLeadsText('');
  };

  const handleAssignSelected = async () => {
    if (selectedLeads.length === 0) {
      showToast("Please select at least one lead from the list.", "warning");
      return;
    }
    if (!targetHR) {
      showToast("Please select a target HR officer to assign leads.", "warning");
      return;
    }
    try {
      await assignLeadsToHR(selectedLeads, targetHR);
      setSelectedLeads([]);
    } catch (err) {}
  };

  const toggleSelectLead = (id) => {
    setSelectedLeads(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="dashboard-layout fade-in">
      {/* Mobile Header Bar */}
      <div className="dashboard-mobile-header">
        <button onClick={() => setSidebarOpen(true)} className="mobile-toggle-btn">
          <Menu size={24} />
        </button>
        <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>SRYN Admin Panel</span>
      </div>

      {/* Sidenav Overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>
      )}

      {/* Sidenav */}
      <aside className={`sidebar ${sidebarOpen ? 'active' : ''}`}>
        <div style={sidebarLogoStyle}>
          <Settings size={24} color="var(--primary-color)" />
          <span style={{ fontWeight: 800, fontSize: '1.25rem' }}>SRYN <span style={{ fontSize: '0.75rem', color: 'var(--primary-color)' }}>Admin</span></span>
        </div>

        <div style={sidebarMenuStyle}>
          <button 
            onClick={() => { setActiveTab('dashboard'); setSidebarOpen(false); }}
            style={{ ...sidebarLinkStyle, ...(activeTab === 'dashboard' ? activeLinkStyle : {}) }}
          >
            <LayoutDashboard size={18} /> Dashboard
          </button>
          <button 
            onClick={() => { setActiveTab('users'); setSidebarOpen(false); }}
            style={{ ...sidebarLinkStyle, ...(activeTab === 'users' ? activeLinkStyle : {}) }}
          >
            <Users size={18} /> Users Manager
          </button>
          <button 
            onClick={() => { setActiveTab('candidates'); setSidebarOpen(false); }}
            style={{ ...sidebarLinkStyle, ...(activeTab === 'candidates' ? activeLinkStyle : {}) }}
          >
            <UserCheck size={18} /> Candidates
          </button>
          <button 
            onClick={() => { setActiveTab('hr-candidates'); setSidebarOpen(false); }}
            style={{ ...sidebarLinkStyle, ...(activeTab === 'hr-candidates' ? activeLinkStyle : {}) }}
          >
            <Users size={18} /> HR Candidates
          </button>
          <button 
            onClick={() => { setActiveTab('leads'); setSidebarOpen(false); }}
            style={{ ...sidebarLinkStyle, ...(activeTab === 'leads' ? activeLinkStyle : {}) }}
          >
            <Upload size={18} /> Lead Assignments
          </button>
          <button 
            onClick={() => { setActiveTab('projects'); setSidebarOpen(false); }}
            style={{ ...sidebarLinkStyle, ...(activeTab === 'projects' ? activeLinkStyle : {}) }}
          >
            <Briefcase size={18} /> Campaign Projects
          </button>
          <button 
            onClick={() => { setActiveTab('training'); setSidebarOpen(false); }}
            style={{ ...sidebarLinkStyle, ...(activeTab === 'training' ? activeLinkStyle : {}) }}
          >
            <BookOpen size={18} /> Training Modules
          </button>
          <button 
            onClick={() => { setActiveTab('offer'); setSidebarOpen(false); }}
            style={{ ...sidebarLinkStyle, ...(activeTab === 'offer' ? activeLinkStyle : {}) }}
          >
            <FileText size={18} /> Offer Templates
          </button>
          <button 
            onClick={() => { setActiveTab('scripts'); setSidebarOpen(false); }}
            style={{ ...sidebarLinkStyle, ...(activeTab === 'scripts' ? activeLinkStyle : {}) }}
          >
            <BookOpen size={18} /> Calling Pitch Scripts
          </button>
          <button 
            onClick={() => { setActiveTab('cms'); setSidebarOpen(false); }}
            style={{ ...sidebarLinkStyle, ...(activeTab === 'cms' ? activeLinkStyle : {}) }}
          >
            <Layout size={18} /> CMS Website Editor
          </button>
        </div>

        <div style={{ marginTop: 'auto', padding: '20px' }}>
          <button onClick={() => { logout(); navigate('/'); }} style={logoutBtnStyle}>
            <LogOut size={18} /> Log Out
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="dashboard-main">

        {/* --- DASHBOARD TAB --- */}
        {activeTab === 'dashboard' && (
          <div style={tabContentStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '1.8rem', marginBottom: '6px' }}>System Overview Dashboard</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Real-time analytical overview of team operations, candidate approvals, and customer conversions.</p>
              </div>
            </div>

            {/* --- ADMIN SUMMARY METRICS CARDS --- */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px', marginBottom: '30px' }}>
              
              {/* HR Officers */}
              <div className="premium-metric-card metric-purple">
                <Briefcase size={26} color="var(--secondary-color)" />
                <div>
                  <div style={metricLabelStyle}>HR Officers</div>
                  <div style={metricValueStyle}>{hrCount}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Active HR Team</div>
                </div>
              </div>

              {/* Total Candidates */}
              <div className="premium-metric-card metric-cherry">
                <Users size={26} color="var(--primary-color)" />
                <div>
                  <div style={metricLabelStyle}>Total Candidates</div>
                  <div style={metricValueStyle}>{candidateCount}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Registered Field Candidates</div>
                </div>
              </div>

              {/* Pending Candidates */}
              <div 
                onClick={() => setActiveTab('candidates')}
                className="premium-metric-card metric-orange"
                style={{ cursor: 'pointer' }}
              >
                <HelpCircle size={26} color="#eab308" />
                <div>
                  <div style={metricLabelStyle}>Pending Candidate KYC</div>
                  <div style={{ ...metricValueStyle, color: '#eab308' }}>{pendingCandidatesCount}</div>
                  <div style={{ fontSize: '0.75rem', color: '#eab308', fontWeight: 'bold', marginTop: '4px' }}>⏳ Click to Review</div>
                </div>
              </div>

              {/* Approved Candidates */}
              <div 
                onClick={() => setActiveTab('candidates')}
                className="premium-metric-card metric-blue"
                style={{ cursor: 'pointer' }}
              >
                <UserCheck size={26} color="#16a34a" />
                <div>
                  <div style={metricLabelStyle}>Approved Candidates</div>
                  <div style={{ ...metricValueStyle, color: '#16a34a' }}>{approvedCandidatesCount}</div>
                  <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 'bold', marginTop: '4px' }}>✓ Offer Unlocked</div>
                </div>
              </div>

              {/* Total Customers */}
              <div className="premium-metric-card metric-cherry" style={{ background: 'linear-gradient(135deg, rgba(222,49,99,0.06) 0%, rgba(222,49,99,0.12) 100%)' }}>
                <FileText size={26} color="var(--primary-color)" />
                <div>
                  <div style={metricLabelStyle}>Total Customers</div>
                  <div style={metricValueStyle}>{totalCustomersCount}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Onboarded Leads</div>
                </div>
              </div>

              {/* Pending Customers */}
              <div className="premium-metric-card metric-orange" style={{ background: 'linear-gradient(135deg, rgba(234,179,8,0.06) 0%, rgba(234,179,8,0.12) 100%)' }}>
                <HelpCircle size={26} color="#ca8a04" />
                <div>
                  <div style={metricLabelStyle}>Pending Customers</div>
                  <div style={{ ...metricValueStyle, color: '#ca8a04' }}>{pendingCustomersCount}</div>
                  <div style={{ fontSize: '0.75rem', color: '#ca8a04', fontWeight: 'bold', marginTop: '4px' }}>⏳ Pending Activation</div>
                </div>
              </div>

              {/* Active / Final Customers */}
              <div className="premium-metric-card metric-purple" style={{ background: 'linear-gradient(135deg, rgba(22,163,74,0.06) 0%, rgba(22,163,74,0.12) 100%)' }}>
                <CheckCircle2 size={26} color="#16a34a" />
                <div>
                  <div style={metricLabelStyle}>Final Active Customers</div>
                  <div style={{ ...metricValueStyle, color: '#16a34a' }}>{activeCustomersCount}</div>
                  <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 'bold', marginTop: '4px' }}>🎉 Final / Active</div>
                </div>
              </div>

            </div>

            {/* Quick Actions & System Overview Cards */}
            <div className="grid-2" style={{ gap: '20px' }}>
              <div className="card">
                <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <UserCheck size={20} color="var(--primary-color)" /> Pending Candidate Approvals
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {usersList.filter(u => u.role === 'Candidate' && u.profileApproved !== true).slice(0, 5).map(u => (
                    <div key={u.uid} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', backgroundColor: 'var(--surface-color)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <div>
                        <strong style={{ fontSize: '0.9rem' }}>{u.fullName}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email} | {u.mobile}</div>
                      </div>
                      <button 
                        onClick={() => { setSelectedUserForKYC(u); setActiveTab('users'); }}
                        className="btn btn-primary" 
                        style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                      >
                        Review KYC
                      </button>
                    </div>
                  ))}
                  {pendingCandidatesCount === 0 && (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', padding: '20px', textAlign: 'center' }}>
                      ✓ All candidates are currently approved & verified.
                    </div>
                  )}
                </div>
              </div>

              <div className="card">
                <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Briefcase size={20} color="var(--secondary-color)" /> Active Hiring Campaigns
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {(projects || []).slice(0, 5).map(p => (
                    <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', backgroundColor: 'var(--surface-color)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <div>
                        <strong style={{ fontSize: '0.9rem' }}>{p.title}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.category} | {p.salary}</div>
                      </div>
                      <span className="badge badge-hired" style={{ fontSize: '0.75rem' }}>Active</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- USERS TAB --- */}
        {activeTab === 'users' && (
          <div style={tabContentStyle}>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>User Portal Management</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Modify registered employee authorization levels and view KYC completeness status.</p>

            <div className="crm-table-container">
              <table className="crm-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Contact details</th>
                    <th>Portal Role</th>
                    <th>KYC Verified</th>
                    <th>Aadhar Checked</th>
                    <th>Set Level</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map((u) => (
                    <tr key={u.uid}>
                      <td style={{ fontWeight: '700' }}>
                        {u.fullName}
                        {u.bankName && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--secondary-color)', fontWeight: 'normal', marginTop: '4px' }}>
                            🏦 {u.bankName} (A/c: {u.accountNumber})<br/>
                            IFSC: {u.ifscCode} | Name: {u.accountHolderName}
                          </div>
                        )}
                      </td>
                      <td>
                        <div>{u.email}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{u.mobile}</div>
                      </td>
                      <td>
                        <span className={`badge ${u.role === 'Admin' ? 'badge-new' : u.role === 'HR' ? 'badge-calling' : 'badge-hired'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${u.verified ? 'badge-hired' : 'badge-rejected'}`}>
                          {u.verified ? 'Email OTP Ok' : 'Pending OTP'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <span style={{ fontSize: '0.9rem', color: u.profileComplete ? 'var(--primary-color)' : 'var(--danger-color)', fontWeight: '600' }}>
                            {u.profileComplete ? 'Aadhar Uploaded' : 'Missing KYC Doc'}
                          </span>
                          {(u.role === 'Candidate' || u.role === 'HR' || u.role === 'HR Executive' || u.role === 'HR Intern') && (
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                              <span className={`badge ${u.profileApproved === true ? 'badge-approved' : u.profileApproved === false ? 'badge-rejected' : 'badge-pending'}`} style={{ fontSize: '0.75rem' }}>
                                {u.profileApproved === true ? 'Approved' : u.profileApproved === false ? 'Rejected' : 'Pending Review'}
                              </span>
                              <button 
                                onClick={() => setSelectedUserForKYC(u)} 
                                className="btn btn-outline" 
                                style={{ padding: '2px 8px', fontSize: '0.75rem', minWidth: 'auto', border: '1px solid var(--primary-color)', color: 'var(--primary-color)' }}
                              >
                                Review KYC
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <select
                          className="form-control"
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.uid, e.target.value)}
                          style={{ padding: '6px', fontSize: '0.85rem', width: '140px' }}
                          disabled={u.uid === 'admin-1' || u.role === 'Admin'}
                        >
                          <option value="Candidate">Candidate</option>
                          <option value="HR Executive">HR Executive</option>
                          <option value="HR Intern">HR Intern</option>
                          {u.role === 'HR' && <option value="HR">HR Officer</option>}
                          {u.role === 'Admin' && <option value="Admin">Admin</option>}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- CANDIDATES TAB --- */}
        {activeTab === 'candidates' && (
          <div style={tabContentStyle}>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Candidates Database</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>Inspect and manage candidate registration, documents, bank details, passwords, and portal roles.</p>

            <div className="crm-table-container">
              <table className="crm-table">
                <thead>
                  <tr>
                    <th>Candidate Name</th>
                    <th>Contact details</th>
                    <th>KYC Uploads</th>
                    <th>Verification Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.filter(u => u.role === 'Candidate').length > 0 ? (
                    usersList.filter(u => u.role === 'Candidate').map((u) => (
                      <tr key={u.uid}>
                        <td style={{ fontWeight: '700' }}>
                          {u.fullName}
                          {u.bankName && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--secondary-color)', fontWeight: 'normal', marginTop: '4px' }}>
                              🏦 {u.bankName} (A/c: {u.accountNumber})<br/>
                              IFSC: {u.ifscCode} | Name: {u.accountHolderName}
                            </div>
                          )}
                        </td>
                        <td>
                          <div>{u.email}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{u.mobile}</div>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.9rem', color: u.profileComplete ? 'var(--primary-color)' : 'var(--danger-color)', fontWeight: '600' }}>
                            {u.profileComplete ? 'Aadhar & Resume Uploaded' : 'Missing KYC Doc'}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${u.profileApproved === true ? 'badge-approved' : u.profileApproved === false ? 'badge-rejected' : 'badge-pending'}`}>
                            {u.profileApproved === true ? 'Approved' : u.profileApproved === false ? 'Rejected' : 'Pending Review'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            <button 
                              onClick={() => handleReviewKYCClick(u)}
                              className="btn btn-outline" 
                              style={{ padding: '6px 12px', fontSize: '0.8rem', borderColor: 'var(--primary-color)', color: 'var(--primary-color)' }}
                            >
                              Review KYC
                            </button>
                            <button 
                              onClick={() => handleEditCandidateClick(u)}
                              className="btn btn-outline" 
                              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                            >
                              Edit Profile
                            </button>
                            <button 
                              onClick={() => handleResetPasswordClick(u.uid, u.email)}
                              className="btn btn-outline" 
                              style={{ padding: '6px 12px', fontSize: '0.8rem', borderColor: 'var(--accent-color)', color: 'var(--accent-color)' }}
                            >
                              Reset Pass
                            </button>
                            <button 
                              onClick={() => handleDeleteCandidateClick(u)}
                              className="btn btn-outline" 
                              style={{ padding: '6px 12px', fontSize: '0.8rem', borderColor: 'var(--danger-color)', color: 'var(--danger-color)' }}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                        No registered candidates found in the database.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- HR CANDIDATES TAB --- */}
        {activeTab === 'hr-candidates' && (
          <div style={tabContentStyle}>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>HR Candidates Database</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>Inspect and manage HR Executives and HR Interns: credentials, document uploads, passwords, and portal verification.</p>

            <div className="crm-table-container">
              <table className="crm-table">
                <thead>
                  <tr>
                    <th>HR Name</th>
                    <th>Contact details</th>
                    <th>Sub-Role</th>
                    <th>KYC Uploads</th>
                    <th>Verification Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.filter(u => u.role === 'HR' || u.role === 'HR Executive' || u.role === 'HR Intern').length > 0 ? (
                    usersList.filter(u => u.role === 'HR' || u.role === 'HR Executive' || u.role === 'HR Intern').map((u) => (
                      <tr key={u.uid}>
                        <td style={{ fontWeight: '700' }}>
                          {u.fullName}
                          {u.bankName && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--secondary-color)', fontWeight: 'normal', marginTop: '4px' }}>
                              🏦 {u.bankName} (A/c: {u.accountNumber})<br/>
                              IFSC: {u.ifscCode} | Name: {u.accountHolderName}
                            </div>
                          )}
                        </td>
                        <td>
                          <div>{u.email}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{u.mobile}</div>
                        </td>
                        <td>
                          <span className={`badge ${u.role === 'HR Executive' ? 'badge-new' : 'badge-calling'}`}>
                            {u.role === 'HR' ? 'HR Officer' : u.role}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.9rem', color: u.profileComplete ? 'var(--primary-color)' : 'var(--danger-color)', fontWeight: '600' }}>
                            {u.profileComplete ? 'Aadhar & Resume Uploaded' : 'Missing KYC Doc'}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${u.profileApproved === true ? 'badge-approved' : u.profileApproved === false ? 'badge-rejected' : 'badge-pending'}`}>
                            {u.profileApproved === true ? 'Approved' : u.profileApproved === false ? 'Rejected' : 'Pending Review'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            <button 
                              onClick={() => handleReviewKYCClick(u)}
                              className="btn btn-outline" 
                              style={{ padding: '6px 12px', fontSize: '0.8rem', borderColor: 'var(--primary-color)', color: 'var(--primary-color)' }}
                            >
                              Review KYC
                            </button>
                            <button 
                              onClick={() => handleEditCandidateClick(u)}
                              className="btn btn-outline" 
                              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                            >
                              Edit Profile
                            </button>
                            <button 
                              onClick={() => handleResetPasswordClick(u.uid, u.email)}
                              className="btn btn-outline" 
                              style={{ padding: '6px 12px', fontSize: '0.8rem', borderColor: 'var(--accent-color)', color: 'var(--accent-color)' }}
                            >
                              Reset Pass
                            </button>
                            <button 
                              onClick={() => handleDeleteCandidateClick(u)}
                              className="btn btn-outline" 
                              style={{ padding: '6px 12px', fontSize: '0.8rem', borderColor: 'var(--danger-color)', color: 'var(--danger-color)' }}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                        No HR candidates found in the database.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- LEADS TAB --- */}
        {activeTab === 'leads' && (
          <div style={tabContentStyle}>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Bulk Sourcing & HR Leads Mapping</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>Upload large candidate chunks and map assignments to specific HR personnel.</p>

            <div className="grid-2" style={{ gap: '30px', alignItems: 'start', marginBottom: '40px' }}>
              {/* Upload Card */}
              <div className="card">
                <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Upload size={18} color="var(--primary-color)" /> Paste Leads Data (CSV)
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                  Enter raw text separated by commas. Format:<br />
                  <code>Full Name, Mobile Number, Email ID, Project Title, Role Type</code>
                </p>
                <textarea
                  rows="6"
                  className="form-control"
                  placeholder="Rahul Singh, 9888877775, rahul@gmail.com, HDFC Credit Card Sales, Field Executive"
                  value={bulkLeadsText}
                  onChange={(e) => setBulkLeadsText(e.target.value)}
                  style={{ marginBottom: '16px', fontFamily: 'monospace', fontSize: '0.85rem' }}
                ></textarea>
                <button onClick={handleBulkLeadsUpload} className="btn btn-primary" style={{ width: '100%' }}>
                  Upload Sourced Leads
                </button>
              </div>

              {/* Assign Card */}
              <div className="card">
                <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <UserCheck size={18} color="var(--primary-color)" /> Assign Checked Leads
                </h3>
                <div className="form-group">
                  <label>Selected Leads Count</label>
                  <input type="text" className="form-control" value={`${selectedLeads.length} leads selected`} disabled />
                </div>
                <div className="form-group">
                  <label>Assign to HR Officer</label>
                  <select 
                    className="form-control"
                    value={targetHR}
                    onChange={(e) => setTargetHR(e.target.value)}
                  >
                    <option value="">-- Choose HR Manager --</option>
                    {hrOfficers.map(hr => (
                      <option key={hr.uid} value={hr.uid}>{hr.fullName} ({hr.role})</option>
                    ))}
                  </select>
                </div>
                <button onClick={handleAssignSelected} className="btn btn-secondary" style={{ width: '100%', marginTop: '10px' }}>
                  Execute Lead Assignments
                </button>
              </div>
            </div>

            {/* Selection list */}
            <div className="card">
              <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Manage Unassigned leads ({leads.filter(l => !l.assignedTo).length})</h3>
              <div className="crm-table-container" style={{ maxHeight: '300px' }}>
                <table className="crm-table">
                  <thead>
                    <tr>
                      <th>Select</th>
                      <th>Candidate Name</th>
                      <th>Mobile</th>
                      <th>Project Campaign</th>
                      <th>Assigned Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map(l => (
                      <tr key={l.id}>
                        <td>
                          <input 
                            type="checkbox"
                            checked={selectedLeads.includes(l.id)}
                            onChange={() => toggleSelectLead(l.id)}
                            style={{ scale: '1.2', cursor: 'pointer' }}
                          />
                        </td>
                        <td style={{ fontWeight: '700' }}>{l.fullName}</td>
                        <td>{l.mobile}</td>
                        <td>{l.project}</td>
                        <td>
                          {l.assignedTo ? (
                            <span className="badge badge-hired">Assigned</span>
                          ) : (
                            <span className="badge badge-rejected">Unassigned</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- PROJECTS TAB --- */}
        {activeTab === 'projects' && (
          <div style={tabContentStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <div>
                <h2 style={{ fontSize: '1.8rem' }}>Client Hiring Campaigns</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Add campaigns and adjust payout structures or registration landing links.</p>
              </div>
              <button onClick={() => { setEditingProj(null); setShowProjModal(true); }} className="btn btn-primary">
                <Plus size={18} /> New Campaign
              </button>
            </div>

            <div className="grid-2" style={{ gap: '24px' }}>
              {projects.map(p => (
                <div key={p.id} className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', textAlign: 'left' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--secondary-color)', textTransform: 'uppercase' }}>
                      {p.category}
                    </span>
                    <span className="badge badge-hired">{p.status}</span>
                  </div>
                  
                  <h3 style={{ fontSize: '1.35rem', marginBottom: '8px' }}>{p.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px', flexGrow: 1 }}>{p.description}</p>
                  
                  <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '12px', marginBottom: '16px', backgroundColor: 'rgba(0,0,0,0.1)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Working FD Card / Signup Link:</div>
                    <code style={{ fontSize: '0.85rem', color: 'var(--primary-color)', wordBreak: 'break-all' }}>{p.workingLink}</code>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PAYOUT COMMISSION</div>
                      <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>{p.commission}</strong>
                    </div>
                  </div>

                  {/* Assigned HR Officers Box */}
                  <div style={{ marginBottom: '16px', padding: '10px 12px', borderRadius: '8px', background: 'var(--surface-color)', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <UserCheck size={14} color="var(--primary-color)" /> Assigned HR Officers:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {(p.assignedHRs || (p.assignedHR ? (Array.isArray(p.assignedHR) ? p.assignedHR : [p.assignedHR]) : ['ALL'])).includes('ALL') ? (
                        <span className="badge badge-approved" style={{ fontSize: '0.75rem' }}>🌐 All HR Officers (Global Access)</span>
                      ) : (
                        (p.assignedHRs || [p.assignedHR]).map(hrId => {
                          const hrObj = hrOfficers.find(h => h.uid === hrId || h.email?.toLowerCase() === hrId?.toLowerCase());
                          return (
                            <span key={hrId} className="badge" style={{ backgroundColor: 'rgba(222,49,99,0.1)', color: 'var(--primary-color)', border: '1px solid rgba(222,49,99,0.2)', fontSize: '0.75rem' }}>
                              👤 {hrObj ? hrObj.fullName : hrId}
                            </span>
                          );
                        })
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                    <button onClick={() => handleOpenAssignHRModal(p)} className="btn btn-primary" style={{ flex: 1.2, padding: '8px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                      <UserCheck size={14} /> Assign HRs
                    </button>
                    <button onClick={() => handleEditProjClick(p)} className="btn btn-outline" style={{ flex: 1, padding: '8px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                      <Edit3 size={14} /> Modify
                    </button>
                    <button onClick={() => handleDeleteProjClick(p.id)} className="btn btn-outline" style={{ borderColor: 'var(--danger-color)', color: 'var(--danger-color)', padding: '8px 12px' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- TEMPLATES TAB --- */}
        {activeTab === 'offer' && (
          <div style={tabContentStyle}>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Offer Letter Design Setup</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>Set dynamic placeholder elements. Candidates will see their variables replaced instantly.</p>

            <div className="grid-2" style={{ gap: '30px', alignItems: 'start' }}>
              {/* Configuration panel */}
              <div className="card">
                <h3 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Edit Template Structure</h3>
                <form onSubmit={handleTemplateSave}>
                  <div className="form-group">
                    <label>Target User Role</label>
                    <select
                      className="form-control"
                      value={selectedTemplateRole}
                      onChange={(e) => setSelectedTemplateRole(e.target.value)}
                    >
                      <option value="Candidate">Candidate</option>
                      <option value="HR">HR Officer / Recruiter</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Offer Document Title</label>
                    <input
                      type="text"
                      className="form-control"
                      value={templateTitle}
                      onChange={(e) => setTemplateTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Contract Content (HTML Templates)</label>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      Available tokens: <code>{"{{name}}"}</code>, <code>{"{{email}}"}</code>, <code>{"{{mobile}}"}</code>, <code>{"{{date}}"}</code>
                    </p>
                    <textarea
                      rows="12"
                      className="form-control"
                      value={templateContent}
                      onChange={(e) => setTemplateContent(e.target.value)}
                      style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
                      required
                    ></textarea>
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                    <Save size={18} /> Save Offer Template
                  </button>
                </form>
              </div>

              {/* Guide/Instruction card */}
              <div className="glass-card" style={{ border: '1px solid rgba(99,102,241,0.15)' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '14px' }}>Dynamic Placeholders Guide</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '20px' }}>
                  When candidates view their offer letter from their respective dashboard, the SRYN portal matches these key template tokens dynamically.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={placeholderRowStyle}>
                    <code>{"{{name}}"}</code>
                    <span>Candidate's Registered Name</span>
                  </div>
                  <div style={placeholderRowStyle}>
                    <code>{"{{email}}"}</code>
                    <span>Candidate's Registered Email</span>
                  </div>
                  <div style={placeholderRowStyle}>
                    <code>{"{{mobile}}"}</code>
                    <span>Candidate's Mobile Number</span>
                  </div>
                  <div style={placeholderRowStyle}>
                    <code>{"{{address}}"}</code>
                    <span>Candidate's Address</span>
                  </div>
                  <div style={placeholderRowStyle}>
                    <code>{"{{position}}"}</code>
                    <span>Designation / Position Role</span>
                  </div>
                  <div style={placeholderRowStyle}>
                    <code>{"{{salary}}"}</code>
                    <span>Salary / Consolidated Remuneration</span>
                  </div>
                  <div style={placeholderRowStyle}>
                    <code>{"{{working_hours}}"}</code>
                    <span>Working Schedule / Hours</span>
                  </div>
                  <div style={placeholderRowStyle}>
                    <code>{"{{date}}"}</code>
                    <span>The current calendar date of opening</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- CALLING PITCH SCRIPTS EDITOR TAB --- */}
        {activeTab === 'scripts' && (
          <div style={tabContentStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <BookOpen size={26} color="var(--primary-color)" /> Calling & Pitch Scripts Manager
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
                  Upload, edit, enable/disable, and publish campaign-wise calling scripts for HR officers.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <a href="#script-editor-form" className="btn btn-outline" style={{ padding: '10px 18px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Plus size={18} /> Add / Upload New Script
                </a>
              </div>
            </div>

            {/* --- SECTION 1: ALL CAMPAIGN PITCH SCRIPTS LIST TABLE --- */}
            <div className="card" style={{ marginBottom: '30px', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  📋 All Campaign Pitch Scripts List
                </h3>
                <span className="badge badge-approved" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
                  {projects.filter(p => p.scriptActive !== false && (p.scriptRound1Hindi || p.scriptRound1English)).length} / {projects.length} Active Scripts
                </span>
              </div>

              <div className="table-responsive">
                <table className="data-table" style={{ width: '100%', textAlign: 'left' }}>
                  <thead>
                    <tr>
                      <th>Hiring Campaign Role</th>
                      <th>Category</th>
                      <th>Script Status (ON / OFF)</th>
                      <th>Round 1 (Telephonic)</th>
                      <th>Round 2 (Video)</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map((proj) => {
                      const isActive = proj.scriptActive !== false;
                      const hasR1 = Boolean(proj.scriptRound1Hindi || proj.scriptRound1English);
                      const hasR2 = Boolean(proj.scriptRound2Hindi || proj.scriptRound2English);

                      return (
                        <tr key={proj.id} style={{ backgroundColor: selectedScriptProjId === proj.id ? 'rgba(222, 49, 99, 0.04)' : 'transparent' }}>
                          <td>
                            <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>{proj.title}</strong>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>ID: {proj.id}</div>
                          </td>
                          <td>
                            <span className="badge" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                              {proj.category || 'Financial Products'}
                            </span>
                          </td>
                          <td>
                            <button
                              onClick={() => handleToggleScriptActive(proj)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '6px 14px',
                                borderRadius: '20px',
                                border: 'none',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                fontSize: '0.8rem',
                                backgroundColor: isActive ? '#dcfce7' : '#fee2e2',
                                color: isActive ? '#15803d' : '#b91c1c',
                                transition: 'all 0.2s ease'
                              }}
                              title="Click to toggle script ON or OFF for HR Officers"
                            >
                              {isActive ? <ToggleRight size={20} color="#15803d" /> : <ToggleLeft size={20} color="#b91c1c" />}
                              {isActive ? '🟢 SCRIPT ON' : '🔴 SCRIPT OFF'}
                            </button>
                          </td>
                          <td>
                            <span className={`badge ${hasR1 ? 'badge-approved' : 'badge-pending'}`}>
                              {hasR1 ? '✓ Configured' : '⚠️ Empty'}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${hasR2 ? 'badge-approved' : 'badge-pending'}`}>
                              {hasR2 ? '✓ Configured' : '⚠️ Empty'}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                onClick={() => handleEditScript(proj)}
                                className="btn btn-outline"
                                style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                              >
                                <Edit3 size={14} /> Edit
                              </button>
                              <button
                                onClick={() => handleDeleteScript(proj)}
                                style={{
                                  padding: '6px 12px',
                                  fontSize: '0.8rem',
                                  backgroundColor: '#fee2e2',
                                  color: '#b91c1c',
                                  border: '1px solid #fca5a5',
                                  borderRadius: 'var(--radius-sm)',
                                  cursor: 'pointer',
                                  fontWeight: 'bold',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                <Trash2 size={14} /> Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* --- SECTION 2: SCRIPT EDITOR FORM --- */}
            <div id="script-editor-form" className="card" style={{ marginBottom: '24px', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <label style={{ fontWeight: 'bold', fontSize: '1rem' }}>✍️ Edit Pitch Script for:</label>
                  <select
                    className="form-control"
                    value={selectedScriptProjId}
                    onChange={(e) => setSelectedScriptProjId(e.target.value)}
                    style={{ maxWidth: '380px', fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--primary-color)' }}
                  >
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>📢 {p.title} ({p.category})</option>
                    ))}
                  </select>
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', background: 'var(--surface-color)', padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                  Tokens: <code>{"{{name}}"}</code>, <code>{"{{role}}"}</code>, <code>{"{{salary}}"}</code>, <code>{"{{location}}"}</code>, <code>{"{{hrName}}"}</code>
                </div>
              </div>

              <form onSubmit={handleSaveScripts} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Round 1 Telephonic Calling */}
                <div>
                  <h3 style={{ fontSize: '1.15rem', color: 'var(--primary-color)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <PhoneCall size={20} /> Round 1: Telephonic Calling Pitch Script
                  </h3>
                  <div className="grid-2" style={{ gap: '20px' }}>
                    <div className="form-group">
                      <label style={{ fontWeight: 'bold' }}>Hindi / Hinglish Telephonic Pitch</label>
                      <textarea
                        rows="6"
                        className="form-control"
                        value={scriptFormData.scriptRound1Hindi}
                        onChange={(e) => setScriptFormData({ ...scriptFormData, scriptRound1Hindi: e.target.value })}
                        placeholder="Enter Round 1 Telephonic calling script in Hindi/Hinglish..."
                        style={{ fontFamily: 'sans-serif', fontSize: '0.9rem', lineHeight: '1.6' }}
                      ></textarea>
                    </div>
                    <div className="form-group">
                      <label style={{ fontWeight: 'bold' }}>English Telephonic Pitch</label>
                      <textarea
                        rows="6"
                        className="form-control"
                        value={scriptFormData.scriptRound1English}
                        onChange={(e) => setScriptFormData({ ...scriptFormData, scriptRound1English: e.target.value })}
                        placeholder="Enter Round 1 Telephonic calling script in English..."
                        style={{ fontFamily: 'sans-serif', fontSize: '0.9rem', lineHeight: '1.6' }}
                      ></textarea>
                    </div>
                  </div>
                </div>

                {/* Round 2 Video Interview */}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                  <h3 style={{ fontSize: '1.15rem', color: 'var(--secondary-color)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Video size={20} /> Round 2: Video Interview Pitch Script
                  </h3>
                  <div className="grid-2" style={{ gap: '20px' }}>
                    <div className="form-group">
                      <label style={{ fontWeight: 'bold' }}>Hindi / Hinglish Video Interview Pitch</label>
                      <textarea
                        rows="6"
                        className="form-control"
                        value={scriptFormData.scriptRound2Hindi}
                        onChange={(e) => setScriptFormData({ ...scriptFormData, scriptRound2Hindi: e.target.value })}
                        placeholder="Enter Round 2 Video Interview script in Hindi/Hinglish..."
                        style={{ fontFamily: 'sans-serif', fontSize: '0.9rem', lineHeight: '1.6' }}
                      ></textarea>
                    </div>
                    <div className="form-group">
                      <label style={{ fontWeight: 'bold' }}>English Video Interview Pitch</label>
                      <textarea
                        rows="6"
                        className="form-control"
                        value={scriptFormData.scriptRound2English}
                        onChange={(e) => setScriptFormData({ ...scriptFormData, scriptRound2English: e.target.value })}
                        placeholder="Enter Round 2 Video Interview script in English..."
                        style={{ fontFamily: 'sans-serif', fontSize: '0.9rem', lineHeight: '1.6' }}
                      ></textarea>
                    </div>
                  </div>
                </div>

                {/* WhatsApp Job Description Pitch */}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                  <h3 style={{ fontSize: '1.15rem', color: '#16a34a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Share2 size={20} /> WhatsApp Job Description (JD) Share Pitch
                  </h3>
                  <div className="grid-2" style={{ gap: '20px' }}>
                    <div className="form-group">
                      <label style={{ fontWeight: 'bold' }}>WhatsApp JD Text (Hindi / Hinglish)</label>
                      <textarea
                        rows="5"
                        className="form-control"
                        value={scriptFormData.jdHindi}
                        onChange={(e) => setScriptFormData({ ...scriptFormData, jdHindi: e.target.value })}
                        placeholder="Enter WhatsApp JD share message in Hindi..."
                        style={{ fontFamily: 'sans-serif', fontSize: '0.9rem', lineHeight: '1.6' }}
                      ></textarea>
                    </div>
                    <div className="form-group">
                      <label style={{ fontWeight: 'bold' }}>WhatsApp JD Text (English)</label>
                      <textarea
                        rows="5"
                        className="form-control"
                        value={scriptFormData.jdEnglish}
                        onChange={(e) => setScriptFormData({ ...scriptFormData, jdEnglish: e.target.value })}
                        placeholder="Enter WhatsApp JD share message in English..."
                        style={{ fontFamily: 'sans-serif', fontSize: '0.9rem', lineHeight: '1.6' }}
                      ></textarea>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                  <button type="submit" className="btn btn-primary" style={{ padding: '12px 30px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Save size={18} /> Save & Publish Calling Scripts
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* --- CMS TAB --- */}
        {activeTab === 'cms' && (
          <div style={tabContentStyle}>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>CMS Landing Customizer</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>Update public texts, values, and headlines instantly.</p>

            <form onSubmit={handleCMSUpdate} className="card">
              <h3 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Landing Page Headers</h3>
              
              <div className="grid-2" style={{ gap: '20px', marginBottom: '20px' }}>
                <div className="form-group">
                  <label>Hero Section Title</label>
                  <input
                    type="text"
                    className="form-control"
                    value={homeCMS.heroTitle}
                    onChange={(e) => setHomeCMS({ ...homeCMS, heroTitle: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Hero Section Subtitle</label>
                  <textarea
                    rows="3"
                    className="form-control"
                    value={homeCMS.heroSubtitle}
                    onChange={(e) => setHomeCMS({ ...homeCMS, heroSubtitle: e.target.value })}
                    required
                  ></textarea>
                </div>
              </div>

              <div className="grid-3" style={{ gap: '20px', marginBottom: '30px' }}>
                <div className="form-group">
                  <label>Candidates Stat Counter</label>
                  <input
                    type="text"
                    className="form-control"
                    value={homeCMS.statsCandidates}
                    onChange={(e) => setHomeCMS({ ...homeCMS, statsCandidates: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Partners Stat Counter</label>
                  <input
                    type="text"
                    className="form-control"
                    value={homeCMS.statsPartners}
                    onChange={(e) => setHomeCMS({ ...homeCMS, statsPartners: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Commission Stat Counter</label>
                  <input
                    type="text"
                    className="form-control"
                    value={homeCMS.statsCommission}
                    onChange={(e) => setHomeCMS({ ...homeCMS, statsCommission: e.target.value })}
                  />
                </div>
              </div>

              <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                About Company Statistics
              </h3>
              <div className="grid-2" style={{ gap: '20px', marginBottom: '30px' }}>
                <div className="form-group">
                  <label>Corporate Mission Text</label>
                  <textarea
                    rows="3"
                    className="form-control"
                    value={aboutCMS.mission}
                    onChange={(e) => setAboutCMS({ ...aboutCMS, mission: e.target.value })}
                  ></textarea>
                </div>
                <div className="form-group">
                  <label>Corporate Vision Text</label>
                  <textarea
                    rows="3"
                    className="form-control"
                    value={aboutCMS.vision}
                    onChange={(e) => setAboutCMS({ ...aboutCMS, vision: e.target.value })}
                  ></textarea>
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ minWidth: '200px' }}>
                <Save size={18} /> Update Landing Content
              </button>
            </form>
          </div>
        )}

        {/* --- TRAINING MODULES TAB --- */}
        {activeTab === 'training' && (
          <div style={tabContentStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '1.8rem', marginBottom: '6px' }}>Training & Sourcing Modules Manager</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Upload role-specific training PDFs, pitch guides, and SOP manuals for Candidates and HR Officers.</p>
              </div>
              <button 
                onClick={() => {
                  setEditingTrain(null);
                  setTrainForm({ title: '', category: 'FD Card', targetRole: 'Candidate', description: '', pdfUrl: '', fileName: '' });
                  setShowTrainModal(true);
                }} 
                className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Plus size={18} /> Upload New Training PDF / Module
              </button>
            </div>

            <div className="crm-table-container">
              <table className="crm-table">
                <thead>
                  <tr>
                    <th>Title & Document</th>
                    <th>Category</th>
                    <th>Target Role</th>
                    <th>Date Uploaded</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(trainingModules || []).length > 0 ? (
                    trainingModules.map((m) => (
                      <tr key={m.id}>
                        <td style={{ fontWeight: '700' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <BookOpen size={18} color="var(--primary-color)" />
                            <div>
                              <div>{m.title}</div>
                              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 'normal', marginTop: '2px' }}>
                                {m.fileName || 'PDF Document'} • {(m.description || '').substring(0, 75)}...
                              </div>
                            </div>
                          </div>
                        </td>
                        <td><span className="badge badge-calling">{m.category}</span></td>
                        <td><span className="badge badge-hired">{m.targetRole || 'Candidate'}</span></td>
                        <td>{m.date || '2026-08-07'}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button 
                              onClick={() => handleEditTrainClick(m)} 
                              className="btn btn-outline"
                              style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                            >
                              <Edit3 size={14} /> Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteTrainClick(m.id)} 
                              className="btn btn-outline"
                              style={{ padding: '4px 10px', fontSize: '0.75rem', color: 'var(--danger-color)', borderColor: 'rgba(239,68,68,0.3)' }}
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                        No training modules uploaded yet. Click "+ Upload New Training PDF / Module" to add one.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      {/* --- ADD / EDIT TRAINING MODULE MODAL --- */}
      {showTrainModal && (
        <div className="modal-overlay">
          <div className="modal-content fade-in" style={{ maxWidth: '650px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={modalHeaderStyle}>
              <h3>{editingTrain ? 'Edit Training Module' : 'Upload New Training Module / PDF'}</h3>
              <button onClick={() => { setShowTrainModal(false); setEditingTrain(null); }}><X size={20} /></button>
            </div>
            <form onSubmit={handleTrainSubmit} style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div className="form-group">
                <label style={{ fontWeight: 'bold' }}>Training Title <span style={{ color: 'var(--danger-color)' }}>*</span></label>
                <input
                  type="text"
                  className="form-control"
                  value={trainForm.title}
                  onChange={(e) => setTrainForm({ ...trainForm, title: e.target.value })}
                  placeholder="E.g., FD Card Customer Pitching & Activation SOP Manual"
                  required
                />
              </div>

              <div className="grid-2" style={{ gap: '15px' }}>
                <div className="form-group">
                  <label style={{ fontWeight: 'bold' }}>Campaign Category</label>
                  <select
                    className="form-control"
                    value={trainForm.category}
                    onChange={(e) => setTrainForm({ ...trainForm, category: e.target.value })}
                  >
                    <option value="FD Card">FD Card</option>
                    <option value="Financial Products">Financial Products</option>
                    <option value="Delivery Boy Hiring">Delivery Boy Sourcing</option>
                    <option value="Field Executive">Field Executive Sourcing</option>
                    <option value="General">General Training</option>
                  </select>
                </div>
                <div className="form-group">
                  <label style={{ fontWeight: 'bold' }}>Target Candidate Role</label>
                  <select
                    className="form-control"
                    value={trainForm.targetRole}
                    onChange={(e) => setTrainForm({ ...trainForm, targetRole: e.target.value })}
                  >
                    <option value="Candidate">Candidate (Field Executives)</option>
                    <option value="HR">HR Officers</option>
                    <option value="ALL">All Roles (Global)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label style={{ fontWeight: 'bold' }}>Training PDF Attachment</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="form-control"
                  onChange={handleTrainFileUpload}
                />
                {trainForm.fileName && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--primary-color)', fontWeight: 'bold', marginTop: '6px' }}>
                    📎 Attached File: {trainForm.fileName}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label style={{ fontWeight: 'bold' }}>Module Description & Operational SOP <span style={{ color: 'var(--danger-color)' }}>*</span></label>
                <textarea
                  rows="4"
                  className="form-control"
                  value={trainForm.description}
                  onChange={(e) => setTrainForm({ ...trainForm, description: e.target.value })}
                  placeholder="Detailed guidelines, pitching instructions, objection resolution steps..."
                  required
                ></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => { setShowTrainModal(false); setEditingTrain(null); }} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-primary">{editingTrain ? 'Save Changes' : 'Publish Training Module'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- ADD / EDIT PROJECT CAMPAIGN MODAL --- */}
      {showProjModal && (
        <div className="modal-overlay">
          <div className="modal-content fade-in" style={{ maxWidth: '800px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={modalHeaderStyle}>
              <h3>{editingProj ? 'Modify Campaign Details & Scripts' : 'Create New Hiring Campaign'}</h3>
              <button onClick={() => { setShowProjModal(false); setEditingProj(null); }}><X size={20} /></button>
            </div>
            <form onSubmit={handleProjSubmit} style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div className="grid-2" style={{ gap: '15px' }}>
                <div className="form-group">
                  <label style={{ color: projFormErrors.title ? 'var(--danger-color)' : 'inherit', fontWeight: 'bold' }}>
                    Campaign Title / Hiring Role <span style={{ color: 'var(--danger-color)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    style={{
                      borderColor: projFormErrors.title ? 'var(--danger-color)' : '',
                      boxShadow: projFormErrors.title ? '0 0 0 3px rgba(239, 68, 68, 0.25)' : '',
                      backgroundColor: projFormErrors.title ? '#fff5f5' : ''
                    }}
                    value={projForm.title}
                    onChange={(e) => {
                      setProjForm({ ...projForm, title: e.target.value });
                      if (projFormErrors.title) setProjFormErrors({ ...projFormErrors, title: null });
                    }}
                    placeholder="E.g., SRYN FD Card Customer Relationship Executive"
                  />
                  {projFormErrors.title && (
                    <div style={{ color: 'var(--danger-color)', fontSize: '0.78rem', marginTop: '4px', fontWeight: 'bold' }}>
                      ⚠️ {projFormErrors.title}
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label>Campaign Category</label>
                  <select
                    className="form-control"
                    value={projForm.category}
                    onChange={(e) => setProjForm({ ...projForm, category: e.target.value })}
                  >
                    <option value="Financial Products">Financial Products</option>
                    <option value="Delivery Boy Hiring">Delivery Boy Hiring</option>
                    <option value="Third Party Hiring">Third Party Hiring</option>
                    <option value="Field Executive">Field Executive Sourcing</option>
                  </select>
                </div>
              </div>

              <div className="grid-3" style={{ gap: '15px' }}>
                <div className="form-group">
                  <label style={{ color: projFormErrors.salary ? 'var(--danger-color)' : 'inherit', fontWeight: 'bold' }}>
                    Offered Fixed Salary <span style={{ color: 'var(--danger-color)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    style={{
                      borderColor: projFormErrors.salary ? 'var(--danger-color)' : '',
                      boxShadow: projFormErrors.salary ? '0 0 0 3px rgba(239, 68, 68, 0.25)' : '',
                      backgroundColor: projFormErrors.salary ? '#fff5f5' : ''
                    }}
                    value={projForm.salary}
                    onChange={(e) => {
                      setProjForm({ ...projForm, salary: e.target.value });
                      if (projFormErrors.salary) setProjFormErrors({ ...projFormErrors, salary: null });
                    }}
                    placeholder="E.g., ₹15,000 / month + Incentives"
                  />
                  {projFormErrors.salary && (
                    <div style={{ color: 'var(--danger-color)', fontSize: '0.78rem', marginTop: '4px', fontWeight: 'bold' }}>
                      ⚠️ {projFormErrors.salary}
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label style={{ color: projFormErrors.location ? 'var(--danger-color)' : 'inherit', fontWeight: 'bold' }}>
                    Work Location <span style={{ color: 'var(--danger-color)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    style={{
                      borderColor: projFormErrors.location ? 'var(--danger-color)' : '',
                      boxShadow: projFormErrors.location ? '0 0 0 3px rgba(239, 68, 68, 0.25)' : '',
                      backgroundColor: projFormErrors.location ? '#fff5f5' : ''
                    }}
                    value={projForm.location}
                    onChange={(e) => {
                      setProjForm({ ...projForm, location: e.target.value });
                      if (projFormErrors.location) setProjFormErrors({ ...projFormErrors, location: null });
                    }}
                    placeholder="E.g., Hometown / Local District"
                  />
                  {projFormErrors.location && (
                    <div style={{ color: 'var(--danger-color)', fontSize: '0.78rem', marginTop: '4px', fontWeight: 'bold' }}>
                      ⚠️ {projFormErrors.location}
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label>Assign to HR Manager</label>
                  <select
                    className="form-control"
                    value={projForm.assignedHR}
                    onChange={(e) => setProjForm({ ...projForm, assignedHR: e.target.value })}
                  >
                    <option value="ALL">All HR Officers (Global)</option>
                    {hrOfficers.map(hr => (
                      <option key={hr.uid} value={hr.uid}>{hr.fullName} ({hr.role})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid-2" style={{ gap: '15px' }}>
                <div className="form-group">
                  <label style={{ color: projFormErrors.commission ? 'var(--danger-color)' : 'inherit', fontWeight: 'bold' }}>
                    Commission / Remuneration Structure <span style={{ color: 'var(--danger-color)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    style={{
                      borderColor: projFormErrors.commission ? 'var(--danger-color)' : '',
                      boxShadow: projFormErrors.commission ? '0 0 0 3px rgba(239, 68, 68, 0.25)' : '',
                      backgroundColor: projFormErrors.commission ? '#fff5f5' : ''
                    }}
                    value={projForm.commission}
                    onChange={(e) => {
                      setProjForm({ ...projForm, commission: e.target.value });
                      if (projFormErrors.commission) setProjFormErrors({ ...projFormErrors, commission: null });
                    }}
                    placeholder="E.g., Rs. 2,500 per approved card / ₹15,000 fixed"
                  />
                  {projFormErrors.commission && (
                    <div style={{ color: 'var(--danger-color)', fontSize: '0.78rem', marginTop: '4px', fontWeight: 'bold' }}>
                      ⚠️ {projFormErrors.commission}
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label style={{ color: projFormErrors.workingLink ? 'var(--danger-color)' : 'inherit', fontWeight: 'bold' }}>
                    Working Signup / Onboarding Link <span style={{ color: 'var(--danger-color)' }}>*</span>
                  </label>
                  <input
                    type="url"
                    className="form-control"
                    style={{
                      borderColor: projFormErrors.workingLink ? 'var(--danger-color)' : '',
                      boxShadow: projFormErrors.workingLink ? '0 0 0 3px rgba(239, 68, 68, 0.25)' : '',
                      backgroundColor: projFormErrors.workingLink ? '#fff5f5' : ''
                    }}
                    value={projForm.workingLink}
                    onChange={(e) => {
                      setProjForm({ ...projForm, workingLink: e.target.value });
                      if (projFormErrors.workingLink) setProjFormErrors({ ...projFormErrors, workingLink: null });
                    }}
                    placeholder="https://sryn.online/apply-link"
                  />
                  {projFormErrors.workingLink && (
                    <div style={{ color: 'var(--danger-color)', fontSize: '0.78rem', marginTop: '4px', fontWeight: 'bold' }}>
                      ⚠️ {projFormErrors.workingLink}
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label style={{ color: projFormErrors.description ? 'var(--danger-color)' : 'inherit', fontWeight: 'bold' }}>
                  Brief Campaign Overview & Description <span style={{ color: 'var(--danger-color)' }}>*</span>
                </label>
                <textarea
                  rows="2"
                  className="form-control"
                  style={{
                    borderColor: projFormErrors.description ? 'var(--danger-color)' : '',
                    boxShadow: projFormErrors.description ? '0 0 0 3px rgba(239, 68, 68, 0.25)' : '',
                    backgroundColor: projFormErrors.description ? '#fff5f5' : ''
                  }}
                  value={projForm.description}
                  onChange={(e) => {
                    setProjForm({ ...projForm, description: e.target.value });
                    if (projFormErrors.description) setProjFormErrors({ ...projFormErrors, description: null });
                  }}
                  placeholder="Overview of this hiring drive..."
                ></textarea>
                {projFormErrors.description && (
                  <div style={{ color: 'var(--danger-color)', fontSize: '0.78rem', marginTop: '4px', fontWeight: 'bold' }}>
                    ⚠️ {projFormErrors.description}
                  </div>
                )}
              </div>

              <hr style={{ borderColor: 'var(--border-color)', margin: '5px 0' }} />
              <h4 style={{ color: 'var(--primary-color)', fontSize: '1.05rem' }}>📝 Custom Job Description (JD) Overrides</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Tokens available: <code>{"{{name}}"}</code>, <code>{"{{role}}"}</code>, <code>{"{{salary}}"}</code>, <code>{"{{location}}"}</code>, <code>{"{{hrName}}"}</code>
              </p>

              <div className="grid-2" style={{ gap: '15px' }}>
                <div className="form-group">
                  <label>WhatsApp JD Text (Hindi / Hinglish)</label>
                  <textarea
                    rows="5"
                    className="form-control"
                    value={projForm.jdHindi}
                    onChange={(e) => setProjForm({ ...projForm, jdHindi: e.target.value })}
                    placeholder="Custom Hindi WhatsApp JD text..."
                    style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}
                  ></textarea>
                </div>
                <div className="form-group">
                  <label>WhatsApp JD Text (English)</label>
                  <textarea
                    rows="5"
                    className="form-control"
                    value={projForm.jdEnglish}
                    onChange={(e) => setProjForm({ ...projForm, jdEnglish: e.target.value })}
                    placeholder="Custom English WhatsApp JD text..."
                    style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}
                  ></textarea>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ flex: 1 }}
                  onClick={handleProjSubmit}
                >
                  {editingProj ? 'Save Campaign & Script Updates' : 'Generate Campaign'}
                </button>
                <button 
                  type="button"
                  onClick={() => { setShowProjModal(false); setEditingProj(null); setProjFormErrors({}); }}
                  className="btn btn-outline"
                  style={{ flex: 0.4 }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- KYC REVIEW / APPROVAL MODAL --- */}
      {selectedUserForKYC && (
        <div className="modal-overlay">
          <div className="modal-content fade-in" style={{ maxWidth: '650px', width: '90%', maxHeight: '90vh', overflowY: 'auto', backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={modalHeaderStyle}>
              <h3 style={{ fontSize: '1.4rem', color: '#fff' }}>Review KYC Documents</h3>
              <button onClick={() => setSelectedUserForKYC(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#fff' }}><X size={20} /></button>
            </div>
            
            <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* User info */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', backgroundColor: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>CANDIDATE NAME</div>
                  <strong style={{ fontSize: '1rem', color: '#fff' }}>{selectedUserForKYC.fullName}</strong>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ROLE / PORTAL TYPE</div>
                  <strong style={{ fontSize: '0.95rem', color: 'var(--primary-color)' }}>{selectedUserForKYC.role || 'Candidate'}</strong>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>AADHAR NUMBER</div>
                  <strong style={{ fontSize: '1rem', letterSpacing: '1px', color: '#fff' }}>{selectedUserForKYC.aadharNumber || 'Not provided'}</strong>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>EMAIL ADDRESS</div>
                  <strong style={{ color: '#fff' }}>{selectedUserForKYC.email}</strong>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>MOBILE NUMBER</div>
                  <strong style={{ color: '#fff' }}>{selectedUserForKYC.mobile}</strong>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PERMANENT ADDRESS</div>
                  <strong style={{ color: '#fff' }}>{`${selectedUserForKYC.address || 'Address N/A'}, ${selectedUserForKYC.city || ''}, ${selectedUserForKYC.state || ''} - ${selectedUserForKYC.pincode || ''}`}</strong>
                </div>
              </div>

              {/* Bank Details (if provided) */}
              {(selectedUserForKYC.bankName || selectedUserForKYC.accountNumber) && (
                <div style={{ backgroundColor: 'rgba(37,99,235,0.06)', padding: '15px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(37,99,235,0.2)' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 'bold', color: 'var(--secondary-color)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                    🏦 Payout Bank Account Details
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.88rem' }}>
                    <div><span style={{ color: 'var(--text-muted)' }}>Bank Name:</span> <strong style={{ color: '#fff' }}>{selectedUserForKYC.bankName || 'N/A'}</strong></div>
                    <div><span style={{ color: 'var(--text-muted)' }}>Account No:</span> <strong style={{ color: '#fff' }}>{selectedUserForKYC.accountNumber || 'N/A'}</strong></div>
                    <div><span style={{ color: 'var(--text-muted)' }}>IFSC Code:</span> <strong style={{ color: '#fff' }}>{selectedUserForKYC.ifscCode || 'N/A'}</strong></div>
                    <div><span style={{ color: 'var(--text-muted)' }}>Holder Name:</span> <strong style={{ color: '#fff' }}>{selectedUserForKYC.accountHolderName || selectedUserForKYC.fullName}</strong></div>
                  </div>
                </div>
              )}

              {/* Status Badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontWeight: '600', color: '#fff' }}>Current Status:</span>
                <span className={`badge ${selectedUserForKYC.profileApproved === true ? 'badge-approved' : selectedUserForKYC.profileApproved === false ? 'badge-rejected' : 'badge-pending'}`} style={{ fontSize: '0.9rem', padding: '6px 12px' }}>
                  {selectedUserForKYC.profileApproved === true ? 'Approved & Verified' : selectedUserForKYC.profileApproved === false ? 'Rejected' : 'Pending Review'}
                </span>
              </div>

              {/* Document Images with Clickable Lightbox */}
              <div>
                <h4 style={{ marginBottom: '12px', fontSize: '1.1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '6px', color: '#fff' }}>
                  Uploaded Documents (Click image to open full size)
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>AADHAR CARD FRONT</div>
                    {selectedUserForKYC.aadharFront ? (
                      <div 
                        onClick={() => setPreviewDocModal({ title: 'Aadhaar Card Front', url: selectedUserForKYC.aadharFront, type: 'image', candidate: selectedUserForKYC.fullName })}
                        style={{ border: '2px solid var(--primary-color)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', height: '180px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000', cursor: 'pointer', position: 'relative' }}
                      >
                        <img src={selectedUserForKYC.aadharFront} alt="Aadhar Front" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(222,49,99,0.85)', color: '#fff', fontSize: '0.75rem', fontWeight: 'bold', padding: '4px 8px', textAlign: 'center' }}>
                          🔍 Click to View Full Image
                        </div>
                      </div>
                    ) : (
                      <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)' }}>No image uploaded</div>
                    )}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>AADHAR CARD BACK</div>
                    {selectedUserForKYC.aadharBack ? (
                      <div 
                        onClick={() => setPreviewDocModal({ title: 'Aadhaar Card Back', url: selectedUserForKYC.aadharBack, type: 'image', candidate: selectedUserForKYC.fullName })}
                        style={{ border: '2px solid var(--primary-color)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', height: '180px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000', cursor: 'pointer', position: 'relative' }}
                      >
                        <img src={selectedUserForKYC.aadharBack} alt="Aadhar Back" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(222,49,99,0.85)', color: '#fff', fontSize: '0.75rem', fontWeight: 'bold', padding: '4px 8px', textAlign: 'center' }}>
                          🔍 Click to View Full Image
                        </div>
                      </div>
                    ) : (
                      <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)' }}>No image uploaded</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Resume download / view */}
              {selectedUserForKYC.resume && (
                <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ fontSize: '0.95rem', color: '#fff' }}>Candidate Resume / CV</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>Click to view or download candidate resume</div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => setPreviewDocModal({ title: 'Candidate Resume / CV', url: selectedUserForKYC.resume, type: selectedUserForKYC.resume.startsWith('data:image/') ? 'image' : 'doc', candidate: selectedUserForKYC.fullName })}
                        className="btn btn-primary"
                        style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                      >
                        🔍 Open Resume
                      </button>
                      <a 
                        href={selectedUserForKYC.resume} 
                        download={`${selectedUserForKYC.fullName.replace(/\s+/g, '_')}_Resume`}
                        className="btn btn-outline" 
                        style={{ padding: '6px 12px', fontSize: '0.85rem', borderColor: 'rgba(255,255,255,0.2)', color: '#fff' }}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Download
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Approval Buttons */}
              <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px', marginTop: '10px' }}>
                <button 
                  onClick={async () => {
                    await approveUserKYCAdmin(selectedUserForKYC, true);
                    setSelectedUserForKYC(null);
                    await loadUsers();
                  }}
                  className="btn btn-primary" 
                  style={{ flex: 1, backgroundColor: 'var(--primary-color)', color: '#fff' }}
                >
                  Approve KYC Profile
                </button>
                <button 
                  onClick={async () => {
                    await approveUserKYCAdmin(selectedUserForKYC, false);
                    setSelectedUserForKYC(null);
                    await loadUsers();
                  }}
                  className="btn btn-outline" 
                  style={{ flex: 1, borderColor: 'var(--danger-color)', color: 'var(--danger-color)', backgroundColor: 'transparent' }}
                >
                  Reject KYC Profile
                </button>
                <button 
                  onClick={() => setSelectedUserForKYC(null)}
                  className="btn btn-outline"
                  style={{ flex: 0.5, color: '#fff', borderColor: 'rgba(255,255,255,0.2)' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- EDIT CANDIDATE MODAL --- */}
      {editingCandidate && (
        <div className="modal-overlay">
          <div className="modal-content fade-in" style={{ maxWidth: '600px', width: '90%', maxHeight: '90vh', overflowY: 'auto', backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={modalHeaderStyle}>
              <h3 style={{ fontSize: '1.4rem', color: '#fff' }}>Edit Candidate Profile</h3>
              <button onClick={() => setEditingCandidate(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#fff' }}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleCandidateEditSubmit} style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div className="grid-2" style={{ gap: '15px' }}>
                <div className="form-group">
                  <label style={{ color: '#fff' }}>Full Name</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={candidateForm.fullName}
                    onChange={(e) => setCandidateForm({ ...candidateForm, fullName: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label style={{ color: '#fff' }}>Mobile Number</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={candidateForm.mobile}
                    onChange={(e) => setCandidateForm({ ...candidateForm, mobile: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label style={{ color: '#fff' }}>Email Address</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    value={candidateForm.email}
                    onChange={(e) => setCandidateForm({ ...candidateForm, email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label style={{ color: '#fff' }}>Aadhaar Number</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={candidateForm.aadharNumber}
                    onChange={(e) => setCandidateForm({ ...candidateForm, aadharNumber: e.target.value })}
                  />
                </div>
              </div>

              <h4 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '6px', marginTop: '10px', color: '#fff', fontSize: '1.05rem' }}>Address Details</h4>
              <div className="form-group">
                <label style={{ color: '#fff' }}>Street Address</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={candidateForm.address}
                  onChange={(e) => setCandidateForm({ ...candidateForm, address: e.target.value })}
                />
              </div>
              <div className="grid-3" style={{ gap: '10px' }}>
                <div className="form-group">
                  <label style={{ color: '#fff' }}>City</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={candidateForm.city}
                    onChange={(e) => setCandidateForm({ ...candidateForm, city: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label style={{ color: '#fff' }}>State</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={candidateForm.state}
                    onChange={(e) => setCandidateForm({ ...candidateForm, state: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label style={{ color: '#fff' }}>Pincode</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={candidateForm.pincode}
                    onChange={(e) => setCandidateForm({ ...candidateForm, pincode: e.target.value })}
                  />
                </div>
              </div>

              <h4 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '6px', marginTop: '10px', color: '#fff', fontSize: '1.05rem' }}>Bank Details</h4>
              <div className="grid-2" style={{ gap: '15px' }}>
                <div className="form-group">
                  <label style={{ color: '#fff' }}>Bank Name</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={candidateForm.bankName}
                    onChange={(e) => setCandidateForm({ ...candidateForm, bankName: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label style={{ color: '#fff' }}>Account Number</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={candidateForm.accountNumber}
                    onChange={(e) => setCandidateForm({ ...candidateForm, accountNumber: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label style={{ color: '#fff' }}>IFSC Code</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={candidateForm.ifscCode}
                    onChange={(e) => setCandidateForm({ ...candidateForm, ifscCode: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label style={{ color: '#fff' }}>Account Holder Name</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={candidateForm.accountHolderName}
                    onChange={(e) => setCandidateForm({ ...candidateForm, accountHolderName: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px', marginTop: '10px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, color: '#fff' }}>
                  Save Profile Edits
                </button>
                <button 
                  type="button" 
                  onClick={() => setEditingCandidate(null)} 
                  className="btn btn-outline" 
                  style={{ flex: 0.5, color: '#fff', borderColor: 'rgba(255,255,255,0.2)' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- ASSIGN HR OFFICERS MODAL --- */}
      {showHRAssignModal && selectedHRAssignModalProj && (
        <div className="modal-overlay">
          <div className="modal-content fade-in" style={{ maxWidth: '580px', width: '90%', padding: '24px' }}>
            <div style={modalHeaderStyle}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserCheck size={20} color="var(--primary-color)" /> Assign Campaign to HR Officers
              </h3>
              <button onClick={() => setShowHRAssignModal(false)}><X size={20} /></button>
            </div>

            <div style={{ textAlign: 'left', marginBottom: '20px', background: 'var(--surface-color)', padding: '14px', borderRadius: '8px', borderLeft: '4px solid var(--primary-color)' }}>
              <strong style={{ fontSize: '1.1rem', color: 'var(--primary-color)', display: 'block', marginBottom: '4px' }}>
                {selectedHRAssignModalProj.title}
              </strong>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Select which HR Officers can view this campaign, use its calling pitch scripts, and receive candidate applications.
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px', maxHeight: '320px', overflowY: 'auto' }}>
              {/* Global Option */}
              <div 
                onClick={() => handleToggleHRSelection('ALL')}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px', 
                  padding: '12px 16px', 
                  borderRadius: '8px', 
                  border: '1px solid',
                  borderColor: selectedHRsForCampaign.includes('ALL') ? 'var(--primary-color)' : 'var(--border-color)',
                  backgroundColor: selectedHRsForCampaign.includes('ALL') ? 'rgba(222,49,99,0.06)' : 'var(--surface-color)',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  textAlign: 'left'
                }}
              >
                <input 
                  type="checkbox" 
                  checked={selectedHRsForCampaign.includes('ALL')} 
                  onChange={() => {}} 
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <div>
                  <div style={{ fontSize: '0.98rem' }}>🌐 All HR Officers (Global Access)</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>Visible to every current and future HR Officer</div>
                </div>
              </div>

              {/* Individual HR Officers */}
              {hrOfficers.map(hr => {
                const isChecked = !selectedHRsForCampaign.includes('ALL') && selectedHRsForCampaign.includes(hr.uid);
                return (
                  <div 
                    key={hr.uid}
                    onClick={() => handleToggleHRSelection(hr.uid)}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '12px', 
                      padding: '12px 16px', 
                      borderRadius: '8px', 
                      border: '1px solid',
                      borderColor: isChecked ? 'var(--primary-color)' : 'var(--border-color)',
                      backgroundColor: isChecked ? 'rgba(222,49,99,0.06)' : 'var(--surface-color)',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <input 
                      type="checkbox" 
                      checked={isChecked} 
                      onChange={() => {}} 
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <div>
                      <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>👤 {hr.fullName}</strong>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Email: {hr.email} | Role: {hr.role}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={handleSaveHRAssignments} className="btn btn-primary" style={{ flex: 1, padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <Save size={18} /> Save HR Assignments
              </button>
              <button onClick={() => setShowHRAssignModal(false)} className="btn btn-outline" style={{ flex: 0.4 }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- FULLSCREEN DOCUMENT PREVIEW LIGHTBOX MODAL --- */}
      {previewDocModal && (
        <div className="modal-overlay" style={{ zIndex: 1200, backgroundColor: 'rgba(0,0,0,0.92)' }}>
          <div className="modal-content fade-in" style={{ maxWidth: '900px', width: '95%', maxHeight: '92vh', overflowY: 'auto', backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.2)', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
              <div style={{ textAlign: 'left' }}>
                <h3 style={{ fontSize: '1.25rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  🔍 {previewDocModal.title}
                </h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Candidate: {previewDocModal.candidate}</span>
              </div>
              <button onClick={() => setPreviewDocModal(null)} className="btn btn-outline" style={{ padding: '6px 14px', color: '#fff', borderColor: 'rgba(255,255,255,0.2)' }}>
                <X size={20} /> Close
              </button>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '20px', backgroundColor: '#000', borderRadius: '8px', padding: '16px', minHeight: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {previewDocModal.url.startsWith('data:image/') || previewDocModal.url.match(/\.(jpeg|jpg|png|webp|gif)$/i) || previewDocModal.type === 'image' ? (
                <img src={previewDocModal.url} alt={previewDocModal.title} style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain', borderRadius: '4px' }} />
              ) : (
                <iframe src={previewDocModal.url} title={previewDocModal.title} style={{ width: '100%', height: '65vh', border: 'none', borderRadius: '4px', background: '#fff' }}></iframe>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href={previewDocModal.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ padding: '8px 18px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ExternalLink size={16} /> Open Full Size in New Tab
              </a>
              <a href={previewDocModal.url} download={`${(previewDocModal.candidate || 'Document').replace(/\s+/g, '_')}_${previewDocModal.title.replace(/\s+/g, '_')}`} className="btn btn-outline" style={{ padding: '8px 18px', fontSize: '0.85rem', color: '#fff', borderColor: 'rgba(255,255,255,0.2)' }}>
                Download File
              </a>
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

const tabContentStyle = {
  display: 'flex',
  flexDirection: 'column',
  textAlign: 'left'
};

const modalHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '20px'
};

const placeholderRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '10px',
  backgroundColor: 'rgba(255,255,255,0.01)',
  border: '1px solid var(--border-color)',
  borderRadius: 'var(--radius-sm)',
  fontSize: '0.85rem'
};

// Injected styles for hover states
const adminHoverCSS = document.createElement('style');
adminHoverCSS.textContent = `
  aside button[style*="activeLinkStyle"]:hover { background-color: var(--primary-light) !important; color: var(--primary-color) !important; }
  code { background-color: rgba(0,0,0,0.3); padding: 2px 6px; border-radius: 4px; font-weight: bold; color: var(--primary-color); }
`;
document.head.appendChild(adminHoverCSS);

export default AdminDashboard;
