import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Users, Briefcase, FileText, Settings, Layout, LogOut, Plus, Trash2, Edit3, UserCheck, Upload, Save, HelpCircle, Menu, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import dbService from '../../services/db';

const AdminDashboard = () => {
  const { 
    projects, leads, templates, cms, logout, 
    createProject, updateProjectDetails, deleteProjectDetails, 
    updateCMS, saveOfferLetterTemplate, changeUserRoleAdmin,
    approveUserKYCAdmin, assignLeadsToHR, uploadLeadsBulk, showToast 
  } = useApp();
  
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('users');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Local state for administrative tables
  const [usersList, setUsersList] = useState([]);
  const [hrOfficers, setHrOfficers] = useState([]);
  const [selectedUserForKYC, setSelectedUserForKYC] = useState(null);

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

  // Project save updates
  const handleProjSubmit = async (e) => {
    e.preventDefault();
    if (!projForm.title || !projForm.description || !projForm.commission) {
      showToast("Please fill all required project parameters.", "warning");
      return;
    }
    try {
      if (editingProj) {
        await updateProjectDetails(editingProj.id, projForm);
      } else {
        await createProject(projForm);
      }
      setShowProjModal(false);
      setEditingProj(null);
      setProjForm({ title: '', category: 'Financial Products', description: '', commission: '', workingLink: '' });
    } catch (err) {}
  };

  const handleEditProjClick = (p) => {
    setEditingProj(p);
    setProjForm({ title: p.title, category: p.category, description: p.description, commission: p.commission, workingLink: p.workingLink || '' });
    setShowProjModal(true);
  };

  const handleDeleteProjClick = async (id) => {
    if (window.confirm("Are you sure you want to delete this campaign?")) {
      await deleteProjectDetails(id);
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
        <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>GigSathi Admin Panel</span>
      </div>

      {/* Sidenav Overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>
      )}

      {/* Sidenav */}
      <aside className={`sidebar ${sidebarOpen ? 'active' : ''}`}>
        <div style={sidebarLogoStyle}>
          <Settings size={24} color="var(--primary-color)" />
          <span style={{ fontWeight: 800, fontSize: '1.25rem' }}>GigSathi <span style={{ fontSize: '0.75rem', color: 'var(--primary-color)' }}>Admin</span></span>
        </div>

        <div style={sidebarMenuStyle}>
          <button 
            onClick={() => { setActiveTab('users'); setSidebarOpen(false); }}
            style={{ ...sidebarLinkStyle, ...(activeTab === 'users' ? activeLinkStyle : {}) }}
          >
            <Users size={18} /> Users Manager
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
            onClick={() => { setActiveTab('offer'); setSidebarOpen(false); }}
            style={{ ...sidebarLinkStyle, ...(activeTab === 'offer' ? activeLinkStyle : {}) }}
          >
            <FileText size={18} /> Offer Templates
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

        {/* --- USERS TAB --- */}
        {activeTab === 'users' && (
          <div style={tabContentStyle}>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>User Portal Management</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>Modify registered employee authorization levels and view KYC completeness status.</p>

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
                          {u.role === 'Candidate' && u.profileComplete && (
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                              <span className={`badge ${u.profileApproved === true ? 'badge-hired' : u.profileApproved === false ? 'badge-rejected' : 'badge-calling'}`} style={{ fontSize: '0.75rem' }}>
                                {u.profileApproved === true ? 'Approved' : u.profileApproved === false ? 'Rejected' : 'Pending Review'}
                              </span>
                              <button 
                                onClick={() => setSelectedUserForKYC(u)} 
                                className="btn btn-outline" 
                                style={{ padding: '2px 8px', fontSize: '0.75rem', minWidth: 'auto', border: '1px solid var(--primary-color)', color: 'var(--primary-color)' }}
                              >
                                Review Docs
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
                          style={{ padding: '6px', fontSize: '0.85rem', width: '130px' }}
                          disabled={u.uid === 'admin-1' || u.role === 'Admin'}
                        >
                          <option value="Candidate">Candidate</option>
                          <option value="HR">HR Officer</option>
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

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PAYOUT COMMISSION</div>
                      <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>{p.commission}</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                    <button onClick={() => handleEditProjClick(p)} className="btn btn-outline" style={{ flex: 1, padding: '8px' }}>
                      <Edit3 size={14} /> Modify
                    </button>
                    <button onClick={() => handleDeleteProjClick(p.id)} className="btn btn-outline" style={{ borderColor: 'var(--danger-color)', color: 'var(--danger-color)', padding: '8px' }}>
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
                      <option value="Candidate">Candidate / Field Executive</option>
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
                  When candidates view their offer letter from their respective dashboard, the GigSathi portal matches these key template tokens dynamically.
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
                    <code>{"{{date}}"}</code>
                    <span>The current calendar date of opening</span>
                  </div>
                </div>
              </div>
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

      </main>

      {/* --- ADD / EDIT PROJECT CAMPAIGN MODAL --- */}
      {showProjModal && (
        <div className="modal-overlay">
          <div className="modal-content fade-in">
            <div style={modalHeaderStyle}>
              <h3>{editingProj ? 'Modify Project Details' : 'Create New Campaign'}</h3>
              <button onClick={() => { setShowProjModal(false); setEditingProj(null); }}><X size={20} /></button>
            </div>
            <form onSubmit={projForm.title ? handleProjSubmit : (e) => e.preventDefault()}>
              <div className="form-group">
                <label>Campaign Title</label>
                <input
                  type="text"
                  className="form-control"
                  value={projForm.title}
                  onChange={(e) => setProjForm({ ...projForm, title: e.target.value })}
                  placeholder="E.g., HDFC Credit Card Sales"
                  required
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select
                  className="form-control"
                  value={projForm.category}
                  onChange={(e) => setProjForm({ ...projForm, category: e.target.value })}
                >
                  <option value="Financial Products">Financial Products</option>
                  <option value="Delivery Boy Hiring">Delivery Boy Hiring</option>
                  <option value="Third Party Hiring">Third Party Hiring</option>
                </select>
              </div>
              <div className="form-group">
                <label>Commission structure text</label>
                <input
                  type="text"
                  className="form-control"
                  value={projForm.commission}
                  onChange={(e) => setProjForm({ ...projForm, commission: e.target.value })}
                  placeholder="E.g., Rs. 2,500 per approved card"
                  required
                />
              </div>
              <div className="form-group">
                <label>Working Onboarding / Card link (Sent to customers)</label>
                <input
                  type="url"
                  className="form-control"
                  value={projForm.workingLink}
                  onChange={(e) => setProjForm({ ...projForm, workingLink: e.target.value })}
                  placeholder="https://hdfc.com/cc-apply-link"
                />
              </div>
              <div className="form-group">
                <label>Brief description</label>
                <textarea
                  rows="3"
                  className="form-control"
                  value={projForm.description}
                  onChange={(e) => setProjForm({ ...projForm, description: e.target.value })}
                  placeholder="Campaign outlines and terms..."
                  required
                ></textarea>
              </div>
              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', marginTop: '10px' }}
                onClick={handleProjSubmit}
              >
                {editingProj ? 'Save Project Details' : 'Generate Campaign'}
              </button>
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
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>AADHAR NUMBER</div>
                  <strong style={{ fontSize: '1rem', letterSpacing: '1px', color: '#fff' }}>{selectedUserForKYC.aadharNumber}</strong>
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
                  <strong style={{ color: '#fff' }}>{`${selectedUserForKYC.address}, ${selectedUserForKYC.city}, ${selectedUserForKYC.state} - ${selectedUserForKYC.pincode}`}</strong>
                </div>
              </div>

              {/* Status Badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontWeight: '600', color: '#fff' }}>Current Status:</span>
                <span className={`badge ${selectedUserForKYC.profileApproved === true ? 'badge-hired' : selectedUserForKYC.profileApproved === false ? 'badge-rejected' : 'badge-calling'}`} style={{ fontSize: '0.9rem', padding: '6px 12px' }}>
                  {selectedUserForKYC.profileApproved === true ? 'Approved & Verified' : selectedUserForKYC.profileApproved === false ? 'Rejected' : 'Pending Review'}
                </span>
              </div>

              {/* Document Images */}
              <div>
                <h4 style={{ marginBottom: '12px', fontSize: '1.1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '6px', color: '#fff' }}>Uploaded Documents</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>AADHAR CARD FRONT</div>
                    {selectedUserForKYC.aadharFront ? (
                      <div style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000' }}>
                        <img src={selectedUserForKYC.aadharFront} alt="Aadhar Front" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                      </div>
                    ) : (
                      <div style={{ height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)' }}>No image uploaded</div>
                    )}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>AADHAR CARD BACK</div>
                    {selectedUserForKYC.aadharBack ? (
                      <div style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000' }}>
                        <img src={selectedUserForKYC.aadharBack} alt="Aadhar Back" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                      </div>
                    ) : (
                      <div style={{ height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)' }}>No image uploaded</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Resume download / view */}
              {selectedUserForKYC.resume && (
                <div style={{ backgroundColor: 'rgba(255,255,255,0.01)', padding: '15px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ fontSize: '0.95rem', color: '#fff' }}>Candidate Resume / CV</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>Provided in text or document format</div>
                    </div>
                    <a 
                      href={selectedUserForKYC.resume} 
                      download={`${selectedUserForKYC.fullName.replace(/\s+/g, '_')}_Resume`}
                      className="btn btn-outline" 
                      style={{ padding: '6px 12px', fontSize: '0.85rem', borderColor: 'var(--primary-color)', color: 'var(--primary-color)' }}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Download Resume
                    </a>
                  </div>
                </div>
              )}

              {/* Approval Buttons */}
              <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px', marginTop: '10px' }}>
                <button 
                  onClick={async () => {
                    await approveUserKYCAdmin(selectedUserForKYC.uid, true);
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
                    await approveUserKYCAdmin(selectedUserForKYC.uid, false);
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
