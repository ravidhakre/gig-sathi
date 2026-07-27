import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User, Phone, Mail, ShieldAlert, UploadCloud, FileText, CheckCircle2, Lock } from 'lucide-react';

const Profile = () => {
  const { currentUser, updateProfile, showToast } = useApp();

  const [personal, setPersonal] = useState({
    fullName: currentUser?.fullName || '',
    mobile: currentUser?.mobile || '',
    email: currentUser?.email || ''
  });

  const [address, setAddress] = useState({
    aadharNumber: currentUser?.aadharNumber || '',
    address: currentUser?.address || '',
    pincode: currentUser?.pincode || '',
    city: currentUser?.city || '',
    state: currentUser?.state || ''
  });

  // Password reset fields
  const [password, setPassword] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });

  // File uploads (DataURLs or simulated names)
  const [files, setFiles] = useState({
    aadharFront: currentUser?.aadharFront || '',
    aadharBack: currentUser?.aadharBack || '',
    resume: currentUser?.resume || ''
  });

  const [uploadProgress, setUploadProgress] = useState({ aadharFront: 0, aadharBack: 0, resume: 0 });

  const handlePersonalUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(personal);
    } catch (err) {}
  };

  const handleAddressUpdate = async (e) => {
    e.preventDefault();
    if (address.aadharNumber && !/^\d{4}-\d{4}-\d{4}$/.test(address.aadharNumber) && !/^\d{12}$/.test(address.aadharNumber)) {
      showToast("Please enter a valid 12-digit Aadhar number.", "warning");
      return;
    }
    try {
      await updateProfile(address);
    } catch (err) {}
  };

  const handlePasswordReset = (e) => {
    e.preventDefault();
    if (!password.oldPassword || !password.newPassword || !password.confirmPassword) {
      showToast("Please fill all password fields.", "warning");
      return;
    }
    if (password.newPassword !== password.confirmPassword) {
      showToast("New passwords do not match.", "warning");
      return;
    }
    showToast("Password updated successfully!", "success");
    setPassword({ oldPassword: '', newPassword: '', confirmPassword: '' });
  };

  // Handle files conversion to base64 for mock storage and visualization
  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;

    // Simulate progress bar loading animation
    setUploadProgress(prev => ({ ...prev, [fieldName]: 10 }));
    let progress = 10;
    const interval = setInterval(() => {
      progress += 20;
      if (progress >= 100) {
        clearInterval(interval);
        setUploadProgress(prev => ({ ...prev, [fieldName]: 100 }));

        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Content = reader.result;
          setFiles(prev => ({ ...prev, [fieldName]: base64Content }));
          // Update profile with the uploaded file
          try {
            await updateProfile({ [fieldName]: base64Content });
          } catch (err) {}
        };
        reader.readAsDataURL(file);
      } else {
        setUploadProgress(prev => ({ ...prev, [fieldName]: progress }));
      }
    }, 150);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', textAlign: 'left' }}>
      
      {/* Page Title */}
      <div>
        <h2 style={{ fontSize: '1.8rem', color: '#fff', marginBottom: '8px' }}>Complete Profile & KYC</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Please complete your KYC verify verification by entering address coordinates and Aadhar documents.
        </p>
      </div>

      {/* Profile Status Badge */}
      <div style={{
        ...statusBannerStyle,
        backgroundColor: currentUser?.profileComplete ? 'var(--primary-light)' : 'var(--danger-light)',
        borderColor: currentUser?.profileComplete ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'
      }}>
        <ShieldAlert size={20} color={currentUser?.profileComplete ? 'var(--primary-color)' : 'var(--danger-color)'} />
        <div>
          <strong style={{ color: currentUser?.profileComplete ? '#fff' : 'var(--danger-color)' }}>
            KYC Status: {currentUser?.profileComplete ? 'COMPLETED & VERIFIED' : 'PENDING ACTION'}
          </strong>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {currentUser?.profileComplete 
              ? 'Your Aadhar details, document uploads, and resumes are active. You are eligible for project assignments.' 
              : 'Please input your Aadhar number, full address, front/back Aadhar cards, and upload your resume to activate your status.'}
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ gap: '30px', alignItems: 'start' }}>
        
        {/* Left Side: General Profile & Address */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* Account Profile Fields */}
          <div className="card">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={18} color="var(--primary-color)" /> General Account Details
            </h3>
            <form onSubmit={handlePersonalUpdate}>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={personal.fullName}
                  onChange={(e) => setPersonal({ ...personal, fullName: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Mobile Number</label>
                <input
                  type="tel"
                  className="form-control"
                  value={personal.mobile}
                  onChange={(e) => setPersonal({ ...personal, mobile: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  value={personal.email}
                  disabled
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }}>
                Save Account Info
              </button>
            </form>
          </div>

          {/* KYC Details Form */}
          <div className="card">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={18} color="var(--primary-color)" /> KYC Address & Verification
            </h3>
            <form onSubmit={handleAddressUpdate}>
              <div className="form-group">
                <label>Aadhar Card Number</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="12 digit number or xxxx-xxxx-xxxx"
                  value={address.aadharNumber}
                  onChange={(e) => setAddress({ ...address, aadharNumber: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Street Address</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter house, building, street, and area..."
                  value={address.address}
                  onChange={(e) => setAddress({ ...address, address: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>Pincode</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="201301"
                    value={address.pincode}
                    onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Noida"
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="UP"
                    value={address.state}
                    onChange={(e) => setAddress({ ...address, state: e.target.value })}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }}>
                Save KYC & Address
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Documents Upload & Password */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* Documents Upload Section */}
          <div className="card">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UploadCloud size={18} color="var(--primary-color)" /> Verification Documents
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Aadhar Front */}
              <div>
                <label style={uploadLabelStyle}>Aadhar Card Front Image</label>
                <div style={uploaderBoxStyle}>
                  {files.aadharFront ? (
                    <div style={previewBoxStyle}>
                      <img src={files.aadharFront} alt="Aadhar Front Preview" style={imagePreviewStyle} />
                      <label style={changeFileBtnStyle}>
                        Change File
                        <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'aadharFront')} style={{ display: 'none' }} />
                      </label>
                    </div>
                  ) : (
                    <label style={dropZoneStyle}>
                      <UploadCloud size={28} color="var(--text-muted)" />
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Click to upload Front photo</span>
                      <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'aadharFront')} style={{ display: 'none' }} />
                    </label>
                  )}
                  {uploadProgress.aadharFront > 0 && uploadProgress.aadharFront < 100 && (
                    <div style={progressBarContainerStyle}>
                      <div style={{ ...progressBarFillStyle, width: `${uploadProgress.aadharFront}%` }}></div>
                    </div>
                  )}
                </div>
              </div>

              {/* Aadhar Back */}
              <div>
                <label style={uploadLabelStyle}>Aadhar Card Back Image</label>
                <div style={uploaderBoxStyle}>
                  {files.aadharBack ? (
                    <div style={previewBoxStyle}>
                      <img src={files.aadharBack} alt="Aadhar Back Preview" style={imagePreviewStyle} />
                      <label style={changeFileBtnStyle}>
                        Change File
                        <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'aadharBack')} style={{ display: 'none' }} />
                      </label>
                    </div>
                  ) : (
                    <label style={dropZoneStyle}>
                      <UploadCloud size={28} color="var(--text-muted)" />
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Click to upload Back photo</span>
                      <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'aadharBack')} style={{ display: 'none' }} />
                    </label>
                  )}
                  {uploadProgress.aadharBack > 0 && uploadProgress.aadharBack < 100 && (
                    <div style={progressBarContainerStyle}>
                      <div style={{ ...progressBarFillStyle, width: `${uploadProgress.aadharBack}%` }}></div>
                    </div>
                  )}
                </div>
              </div>

              {/* Resume File */}
              <div>
                <label style={uploadLabelStyle}>Resume Document (PDF/DOC)</label>
                <div style={uploaderBoxStyle}>
                  {files.resume ? (
                    <div style={docPreviewStyle}>
                      <FileText size={24} color="var(--secondary-color)" />
                      <span style={{ fontSize: '0.9rem', color: '#fff', flexGrow: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        resume_loaded.pdf
                      </span>
                      <label style={changeFileBtnStyle}>
                        Change
                        <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => handleFileChange(e, 'resume')} style={{ display: 'none' }} />
                      </label>
                    </div>
                  ) : (
                    <label style={dropZoneStyle}>
                      <UploadCloud size={28} color="var(--text-muted)" />
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Upload PDF/Word resume</span>
                      <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => handleFileChange(e, 'resume')} style={{ display: 'none' }} />
                    </label>
                  )}
                  {uploadProgress.resume > 0 && uploadProgress.resume < 100 && (
                    <div style={progressBarContainerStyle}>
                      <div style={{ ...progressBarFillStyle, width: `${uploadProgress.resume}%` }}></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Reset Password Card */}
          <div className="card">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lock size={18} color="var(--primary-color)" /> Reset Portal Password
            </h3>
            <form onSubmit={handlePasswordReset}>
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={password.oldPassword}
                  onChange={(e) => setPassword({ ...password, oldPassword: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={password.newPassword}
                  onChange={(e) => setPassword({ ...password, newPassword: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={password.confirmPassword}
                  onChange={(e) => setPassword({ ...password, confirmPassword: e.target.value })}
                />
              </div>
              <button type="submit" className="btn btn-outline" style={{ marginTop: '10px' }}>
                Reset Password
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
};

// Inline Styles
const statusBannerStyle = {
  display: 'flex',
  gap: '16px',
  padding: '20px',
  borderRadius: 'var(--radius-md)',
  border: '1px solid',
  alignItems: 'start'
};

const uploadLabelStyle = {
  fontSize: '0.8rem',
  fontWeight: '700',
  color: 'var(--text-secondary)',
  textTransform: 'uppercase',
  marginBottom: '8px',
  display: 'block'
};

const uploaderBoxStyle = {
  position: 'relative'
};

const dropZoneStyle = {
  border: '1px dashed var(--border-color)',
  borderRadius: 'var(--radius-md)',
  padding: '24px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '10px',
  cursor: 'pointer',
  backgroundColor: 'rgba(0,0,0,0.15)',
  transition: 'border-color var(--transition-fast)'
};

const previewBoxStyle = {
  position: 'relative',
  border: '1px solid var(--border-color)',
  borderRadius: 'var(--radius-md)',
  overflow: 'hidden',
  height: '140px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(0,0,0,0.3)'
};

const imagePreviewStyle = {
  maxHeight: '100%',
  maxWidth: '100%',
  objectFit: 'contain'
};

const changeFileBtnStyle = {
  position: 'absolute',
  bottom: '8px',
  right: '8px',
  backgroundColor: 'rgba(0,0,0,0.7)',
  color: '#fff',
  fontSize: '0.75rem',
  fontWeight: '700',
  padding: '4px 10px',
  borderRadius: 'var(--radius-sm)',
  cursor: 'pointer',
  border: '1px solid rgba(255,255,255,0.2)'
};

const docPreviewStyle = {
  border: '1px solid var(--border-color)',
  borderRadius: 'var(--radius-md)',
  padding: '16px',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  backgroundColor: 'rgba(0,0,0,0.15)'
};

const progressBarContainerStyle = {
  height: '4px',
  width: '100%',
  backgroundColor: 'rgba(255,255,255,0.05)',
  borderRadius: 'var(--radius-full)',
  overflow: 'hidden',
  marginTop: '8px'
};

const progressBarFillStyle = {
  height: '100%',
  backgroundColor: 'var(--primary-color)',
  transition: 'width 0.15s ease'
};

const cssInjection = document.createElement('style');
cssInjection.textContent = `
  label[style*="dropZoneStyle"]:hover { border-color: var(--primary-color) !important; }
`;
document.head.appendChild(cssInjection);

export default Profile;
