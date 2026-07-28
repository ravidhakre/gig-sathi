import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import Profile from '../Profile';
import { 
  LayoutDashboard, Users, BarChart3, FileText, User, LogOut, Search, Plus, PhoneCall, Filter, Calendar, Save, X, PhoneIncoming
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HRDashboard = () => {
  const { currentUser, logout, leads, addNewLead, updateLeadStatus, projects, showToast } = useApp();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('dashboard');
  
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
  const [newLeadForm, setNewLeadForm] = useState({ fullName: '', mobile: '', email: '', project: '', roleApplied: 'Field Executive' });

  // Filtered Leads
  const hrLeads = leads.filter(l => l.assignedTo === currentUser?.uid || currentUser?.role === 'Admin'); // HR sees assigned leads
  const filteredLeads = hrLeads.filter(lead => {
    const matchesSearch = lead.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          lead.mobile.includes(searchTerm);
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
      {/* Sidenav */}
      <aside className="sidebar">
        <div style={sidebarLogoStyle}>
          <Users size={24} color="var(--secondary-color)" />
          <span style={{ fontWeight: 800, fontSize: '1.25rem' }}>GigSathi <span style={{ fontSize: '0.75rem', color: 'var(--secondary-color)' }}>HR</span></span>
        </div>

        <div style={sidebarMenuStyle}>
          <button 
            onClick={() => setActiveTab('dashboard')}
            style={{ ...sidebarLinkStyle, ...(activeTab === 'dashboard' ? activeLinkStyle : {}) }}
          >
            <LayoutDashboard size={18} /> Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('leads')}
            style={{ ...sidebarLinkStyle, ...(activeTab === 'leads' ? activeLinkStyle : {}) }}
          >
            <Users size={18} /> Leads CRM
          </button>
          <button 
            onClick={() => setActiveTab('reports')}
            style={{ ...sidebarLinkStyle, ...(activeTab === 'reports' ? activeLinkStyle : {}) }}
          >
            <BarChart3 size={18} /> Reports
          </button>
          <button 
            onClick={() => setActiveTab('profile')}
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
              <div className="card" style={metricCardStyle}>
                <Users size={28} color="var(--secondary-color)" />
                <div>
                  <div style={metricLabelStyle}>Total Leads</div>
                  <div style={metricValueStyle}>{totalAssigned}</div>
                </div>
              </div>
              <div className="card" style={metricCardStyle}>
                <PhoneCall size={28} color="var(--accent-color)" />
                <div>
                  <div style={metricLabelStyle}>In Calling status</div>
                  <div style={metricValueStyle}>{callingCount}</div>
                </div>
              </div>
              <div className="card" style={metricCardStyle}>
                <BarChart3 size={28} color="var(--info-color)" />
                <div>
                  <div style={metricLabelStyle}>Interested</div>
                  <div style={metricValueStyle}>{interestedCount}</div>
                </div>
              </div>
              <div className="card" style={metricCardStyle}>
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
                      <span className={`badge badge-${l.status.toLowerCase()}`}>{l.status}</span>
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
            <div style={filterPanelStyle}>
              {/* Search */}
              <div style={searchContainerStyle}>
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                          <span className={`badge badge-${l.status.toLowerCase()}`}>{l.status}</span>
                        </td>
                        <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {l.feedback || 'No logs entered.'}
                        </td>
                        <td>
                          <button onClick={() => triggerCallSimulation(l)} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                            <PhoneCall size={14} color="var(--primary-color)" /> Call & Update
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

        {/* --- COMPLETE PROFILE --- */}
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
