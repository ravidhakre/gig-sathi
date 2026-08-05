import React, { createContext, useContext, useState, useEffect } from 'react';
import dbService from '../services/db';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('gs_current_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [projects, setProjects] = useState([]);
  const [leads, setLeads] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [cms, setCms] = useState({});
  const [toasts, setToasts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load initial data
  const loadData = async () => {
    try {
      setLoading(true);
      const projData = await dbService.getProjects();
      setProjects(projData || []);
      
      const leadData = await dbService.getLeads();
      setLeads(leadData || []);

      const tempData = await dbService.getTemplates();
      setTemplates(tempData || []);

      const cmsData = await dbService.getCMS();
      setCms(cmsData || {});

      if (currentUser) {
        const allUsers = await dbService.getUsers();
        const latestSelf = allUsers.find(
          (u) => u.uid === currentUser.uid || u.email?.toLowerCase() === currentUser.email?.toLowerCase()
        );
        if (latestSelf) {
          localStorage.setItem('gs_current_user', JSON.stringify(latestSelf));
          setCurrentUser(latestSelf);
        }

        const custData = await dbService.getCustomers(
          currentUser.role === 'Candidate' ? currentUser.uid : null
        );
        setCustomers(custData || []);
      }
    } catch (error) {
      console.error("Failed to load initial application data:", error);
      // Ensure fallbacks are applied on failure
      setProjects([]);
      setLeads([]);
      setTemplates([]);
      setCustomers([]);
      setCms({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser?.uid]);

  // Toast Helper
  const showToast = (message, type = 'success', duration = 6000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  };

  // Auth Functions
  const login = async (email, password) => {
    try {
      const user = await dbService.login(email, password);
      if (user.verified) {
        localStorage.setItem('gs_current_user', JSON.stringify(user));
        setCurrentUser(user);
        showToast(`Welcome back, ${user.fullName}!`, 'success');
      } else {
        showToast(`Please verify your email address to log in.`, 'warning');
      }
      return user;
    } catch (error) {
      showToast(error.message, 'danger');
      throw error;
    }
  };

  const signup = async (fullName, mobile, email, password, role) => {
    try {
      const res = await dbService.register(fullName, mobile, email, password, role);
      // Automatically show the simulated OTP email send
      showToast(
        `📬 Simulated Email Sent! OTP is: ${res.otp} (Valid for 5 mins)`,
        'info',
        10000 // Show for 10 seconds so the user can easily see it
      );
      return res;
    } catch (error) {
      showToast(error.message, 'danger');
      throw error;
    }
  };

  const verifyOTP = async (uid, otp) => {
    try {
      const user = await dbService.verifyOTP(uid, otp);
      localStorage.setItem('gs_current_user', JSON.stringify(user));
      setCurrentUser(user);
      showToast(`Verification Successful! Welcome to SRYN.`, 'success');
      return user;
    } catch (error) {
      showToast(error.message, 'danger');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('gs_current_user');
    setCurrentUser(null);
    setCustomers([]);
    showToast(`You have logged out successfully.`, 'info');
  };

  const refreshCurrentUser = async () => {
    if (!currentUser) return;
    try {
      const allUsers = await dbService.getUsers();
      const latestSelf = allUsers.find(
        (u) => u.uid === currentUser.uid || u.email?.toLowerCase() === currentUser.email?.toLowerCase()
      );
      if (latestSelf) {
        localStorage.setItem('gs_current_user', JSON.stringify(latestSelf));
        setCurrentUser(latestSelf);
        return latestSelf;
      }
    } catch (e) {
      console.error("Error refreshing current user:", e);
    }
  };

  const updateProfile = async (updatedFields) => {
    if (!currentUser) return;
    try {
      const updatedUser = await dbService.updateProfile(currentUser.uid, updatedFields);
      localStorage.setItem('gs_current_user', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
      // Sync the user list in localStorage
      const allUsers = await dbService.getUsers();
      showToast("Profile details updated successfully!", "success");
      return updatedUser;
    } catch (error) {
      showToast(error.message, "danger");
      throw error;
    }
  };

  // Candidate: Customers and FD Cards
  const addCustomer = async (customerData) => {
    if (!currentUser) return;
    try {
      const newCustomer = await dbService.addCustomer(customerData, currentUser.uid);
      setCustomers((prev) => [newCustomer, ...prev]);

      // Fetch active link configuration from admin configuration settings (or default)
      const targetProject = projects.find(p => p.title === customerData.project) || projects[0];
      const link = targetProject?.workingLink || 'https://srynmanagement.com/apply-fd-card';

      // Simulate sending email to customer with link
      showToast(
        `📬 Card Link Emailed! Sent to: ${customerData.email}. Link: ${link}`,
        'info',
        9000
      );

      return newCustomer;
    } catch (error) {
      showToast(error.message, 'danger');
      throw error;
    }
  };

  // HR Lead Status Update
  const updateLeadStatus = async (leadId, status, feedback) => {
    try {
      const updatedLead = await dbService.updateLeadStatus(leadId, status, feedback);
      setLeads((prev) => prev.map(l => l.id === leadId ? updatedLead : l));
      showToast(`Lead status updated to: ${status}`, 'success');
    } catch (error) {
      showToast(error.message, 'danger');
    }
  };

  // HR Manual Add Lead
  const addNewLead = async (leadData) => {
    try {
      const newLead = await dbService.addLead(leadData);
      setLeads((prev) => [newLead, ...prev]);
      showToast(`New Lead added: ${leadData.fullName}`, 'success');
      return newLead;
    } catch (error) {
      showToast(error.message, 'danger');
      throw error;
    }
  };

  // Admin CMS & Templates
  const updateCMS = async (newCMS) => {
    try {
      const res = await dbService.updateCMS(newCMS);
      setCms(res);
      showToast(`CMS content updated successfully!`, 'success');
    } catch (error) {
      showToast(error.message, 'danger');
    }
  };

  const saveOfferLetterTemplate = async (templateId, fields) => {
    try {
      const res = await dbService.saveTemplate(templateId, fields);
      setTemplates((prev) => prev.map(t => t.id === templateId ? res : t));
      showToast(`Offer letter template saved!`, 'success');
    } catch (error) {
      showToast(error.message, 'danger');
    }
  };

  const uploadLeadsBulk = async (uploadedLeads) => {
    try {
      const added = [];
      for (const lead of uploadedLeads) {
        const res = await dbService.addLead(lead);
        added.push(res);
      }
      setLeads((prev) => [...added, ...prev]);
      showToast(`Bulk Upload: ${uploadedLeads.length} leads loaded successfully!`, 'success');
    } catch (error) {
      showToast(error.message, 'danger');
    }
  };

  const assignLeadsToHR = async (leadIds, hrId) => {
    try {
      await dbService.assignLeads(leadIds, hrId);
      // Refresh local leads list
      const leadData = await dbService.getLeads();
      setLeads(leadData);
      showToast(`Successfully assigned ${leadIds.length} leads.`, 'success');
    } catch (error) {
      showToast(error.message, 'danger');
    }
  };

  const createProject = async (projFields) => {
    try {
      const res = await dbService.addProject(projFields);
      setProjects((prev) => [...prev, res]);
      showToast(`Project "${res.title}" created!`, 'success');
      return res;
    } catch (error) {
      showToast(error.message, 'danger');
      throw error;
    }
  };

  const updateProjectDetails = async (id, fields) => {
    try {
      const res = await dbService.updateProject(id, fields);
      setProjects((prev) => prev.map(p => p.id === id ? res : p));
      showToast(`Project details updated!`, 'success');
      return res;
    } catch (error) {
      showToast(error.message, 'danger');
      throw error;
    }
  };

  const deleteProjectDetails = async (id) => {
    try {
      await dbService.deleteProject(id);
      setProjects((prev) => prev.filter(p => p.id !== id));
      showToast(`Project deleted successfully.`, 'info');
    } catch (error) {
      showToast(error.message, 'danger');
    }
  };

  const changeUserRoleAdmin = async (uid, newRole) => {
    try {
      const updated = await dbService.updateUserRole(uid, newRole);
      showToast(`User role updated to: ${newRole}`, 'success');
      return updated;
    } catch (error) {
      showToast(error.message, 'danger');
    }
  };

  const approveUserKYCAdmin = async (uid, isApproved) => {
    try {
      const updated = await dbService.approveUserKYC(uid, isApproved);
      showToast(`Candidate profile ${isApproved ? 'Approved' : 'Rejected'} successfully!`, 'success');
      return updated;
    } catch (error) {
      showToast(error.message, 'danger');
    }
  };

  const deleteUserAdmin = async (uid) => {
    try {
      await dbService.deleteUser(uid);
      showToast(`User deleted successfully!`, 'success');
    } catch (error) {
      showToast(error.message, 'danger');
    }
  };

  const resetUserPasswordAdmin = async (uid, email) => {
    try {
      await dbService.resetUserPassword(uid, email);
      showToast(`Password reset link sent to ${email} (Mock user password reset to password123)!`, 'success');
    } catch (error) {
      showToast(error.message, 'danger');
    }
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      projects,
      leads,
      customers,
      templates,
      cms,
      toasts,
      loading,
      login,
      signup,
      verifyOTP,
      logout,
      updateProfile,
      refreshCurrentUser,
      addCustomer,
      updateLeadStatus,
      addNewLead,
      updateCMS,
      saveOfferLetterTemplate,
      uploadLeadsBulk,
      assignLeadsToHR,
      createProject,
      updateProjectDetails,
      deleteProjectDetails,
      changeUserRoleAdmin,
      approveUserKYCAdmin,
      deleteUserAdmin,
      resetUserPasswordAdmin,
      showToast
    }}>
      {children}
      {/* Toast Render System */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast ${toast.type === 'danger' ? 'toast-danger' : ''}`} style={{
            borderLeft: `4px solid ${
              toast.type === 'danger' ? 'var(--danger-color)' : 
              toast.type === 'info' ? 'var(--info-color)' : 
              toast.type === 'warning' ? 'var(--accent-color)' : 'var(--primary-color)'
            }`
          }}>
            <div style={{ flex: 1, whiteSpace: 'pre-line' }}>{toast.message}</div>
          </div>
        ))}
      </div>
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
