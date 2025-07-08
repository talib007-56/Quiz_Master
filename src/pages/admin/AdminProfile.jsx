import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI, usersAPI } from '../../services/api';

const AdminProfile = () => {
  const navigate = useNavigate();
  const { currentUser, logout, refreshUser } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    full_name: '',
    email: '',
    phone: '',
    department: '',
    bio: '',
    created_at: ''
  });
  const [editFormData, setEditFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    department: '',
    bio: ''
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (currentUser) {
      const userData = {
        full_name: currentUser.full_name || 'Administrator',
        email: currentUser.email || 'admin@quizmaster.com',
        phone: currentUser.phone || '',
        department: currentUser.department || '',
        bio: currentUser.bio || '',
        created_at: currentUser.created_at || new Date().toISOString()
      };
      setProfileData(userData);
      setEditFormData(userData);
    }
  }, [currentUser]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      setEditFormData(profileData);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Update profile via API  
      const userId = currentUser.id || currentUser._id;
      
      const response = await usersAPI.update(userId, {
        full_name: editFormData.full_name,
        email: editFormData.email,
        phone: editFormData.phone,
        department: editFormData.department,
        bio: editFormData.bio
      });
      
      // Update local state with saved data
      setProfileData(editFormData);
      setIsEditing(false);
      
      // Refresh user data in auth context
      if (refreshUser) {
        await refreshUser();
      }
      
      // Show success message
      const successAlert = document.createElement('div');
      successAlert.className = 'alert alert-success alert-dismissible fade show position-fixed';
      successAlert.style.cssText = 'top: 20px; right: 20px; z-index: 9999; width: 300px;';
      successAlert.innerHTML = `
        <i class="bi bi-check-circle me-2"></i>
        Profile updated successfully!
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      `;
      document.body.appendChild(successAlert);
      
      setTimeout(() => {
        if (document.body.contains(successAlert)) {
          document.body.removeChild(successAlert);
        }
      }, 3000);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      const errorMessage = error.response?.data?.message || 'Error updating profile. Please try again.';
      
      // Show error message
      const errorAlert = document.createElement('div');
      errorAlert.className = 'alert alert-danger alert-dismissible fade show position-fixed';
      errorAlert.style.cssText = 'top: 20px; right: 20px; z-index: 9999; width: 300px;';
      errorAlert.innerHTML = `
        <i class="bi bi-exclamation-triangle me-2"></i>
        ${errorMessage}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      `;
      document.body.appendChild(errorAlert);
      
      setTimeout(() => {
        if (document.body.contains(errorAlert)) {
          document.body.removeChild(errorAlert);
        }
      }, 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (passwordError) setPasswordError('');
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      return;
    }
    
    setPasswordLoading(true);
    setPasswordError('');
    
    try {
      const response = await authAPI.changePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword
      );
      
      // Show success message
      const successAlert = document.createElement('div');
      successAlert.className = 'alert alert-success alert-dismissible fade show position-fixed';
      successAlert.style.cssText = 'top: 20px; right: 20px; z-index: 9999; width: 300px;';
      successAlert.innerHTML = `
        <i class="bi bi-check-circle me-2"></i>
        Password changed successfully!
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      `;
      document.body.appendChild(successAlert);
      
      setTimeout(() => {
        if (document.body.contains(successAlert)) {
          document.body.removeChild(successAlert);
        }
      }, 3000);
      
      // Reset form and close modal
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswordModal(false);
    } catch (error) {
      console.error('Error changing password:', error);
      const errorMessage = error.response?.data?.message || 'Failed to change password. Please try again.';
      setPasswordError(errorMessage);
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="container-fluid" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', padding: '0' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #667eea 100%)',
        borderRadius: '0 0 24px 24px',
        padding: '40px 30px',
        marginBottom: '30px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(102, 126, 234, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        {/* Background Decorative Elements */}
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
          borderRadius: '50%'
        }} />
        
        <div style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div className="d-flex align-items-center gap-3">
            
            
            <div>
              <h1 style={{
                color: '#fff',
                fontSize: '2rem',
                fontWeight: '700',
                margin: 0,
                textShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
              }}>
                Admin Profile
              </h1>
              <p style={{
                color: 'rgba(255, 255, 255, 0.8)',
                margin: 0,
                fontSize: '1.1rem'
              }}>
                Manage your account settings and information
              </p>
            </div>
          </div>
          
          <div className="d-flex gap-2">
            <button 
              onClick={handleLogout}
              className="btn btn-outline-light rounded-pill px-3 py-2"
              style={{
                border: '1px solid rgba(255, 255, 255, 0.3)',
                backdropFilter: 'blur(10px)',
                background: 'rgba(255, 255, 255, 0.1)'
              }}
            >
              <i className="bi bi-box-arrow-right me-2"></i>
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="container-fluid px-4">
        <div className="row">

          {/* Profile Information */}
          <div className="col-lg-20 mb-4">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white border-bottom">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">
                    <i className="bi bi-person-gear me-2 text-primary"></i>
                    Profile Information
                  </h5>
                  <button 
                    className={`btn ${isEditing ? 'btn-success' : 'btn-primary'} btn-sm rounded-pill px-3`}
                    onClick={isEditing ? handleSave : handleEditToggle}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Saving...
                      </>
                    ) : isEditing ? (
                      <>
                        <i className="bi bi-check me-2"></i>
                        Save Changes
                      </>
                    ) : (
                      <>
                        <i className="bi bi-pencil me-2"></i>
                        Edit Profile
                      </>
                    )}
                  </button>
                </div>
              </div>
              
              <div className="card-body p-4">
                {isEditing ? (
                  // Edit Mode
                  <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-semibold">Full Name</label>
                        <input
                          type="text"
                          name="full_name"
                          className="form-control"
                          value={editFormData.full_name}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-semibold">Email Address</label>
                        <input
                          type="email"
                          name="email"
                          className="form-control"
                          value={editFormData.email}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-semibold">Phone Number</label>
                        <input
                          type="tel"
                          name="phone"
                          className="form-control"
                          value={editFormData.phone}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-semibold">Department</label>
                        <input
                          type="text"
                          name="department"
                          className="form-control"
                          value={editFormData.department}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="col-12 mb-3">
                        <label className="form-label fw-semibold">Bio</label>
                        <textarea
                          name="bio"
                          className="form-control"
                          rows="4"
                          value={editFormData.bio}
                          onChange={handleInputChange}
                          placeholder="Tell us about yourself..."
                        ></textarea>
                      </div>
                    </div>
                    
                    <div className="d-flex gap-2 mt-3">
                      <button type="submit" className="btn btn-success" disabled={loading}>
                        <i className="bi bi-check me-2"></i>
                        Save Changes
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-outline-secondary" 
                        onClick={handleEditToggle}
                        disabled={loading}
                      >
                        <i className="bi bi-x me-2"></i>
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  // View Mode
                  <div className="row">
                    <div className="col-md-6 mb-4">
                      <div className="d-flex align-items-center mb-2">
                        <i className="bi bi-person text-primary me-2"></i>
                        <strong>Full Name</strong>
                      </div>
                      <p className="text-muted mb-0 ms-4">{profileData.full_name}</p>
                    </div>
                    
                    <div className="col-md-6 mb-4">
                      <div className="d-flex align-items-center mb-2">
                        <i className="bi bi-envelope text-primary me-2"></i>
                        <strong>Email Address</strong>
                      </div>
                      <p className="text-muted mb-0 ms-4">{profileData.email}</p>
                    </div>
                    
                    <div className="col-md-6 mb-4">
                      <div className="d-flex align-items-center mb-2">
                        <i className="bi bi-telephone text-primary me-2"></i>
                        <strong>Phone Number</strong>
                      </div>
                      <p className="text-muted mb-0 ms-4">{profileData.phone}</p>
                    </div>
                    
                    <div className="col-md-6 mb-4">
                      <div className="d-flex align-items-center mb-2">
                        <i className="bi bi-building text-primary me-2"></i>
                        <strong>Department</strong>
                      </div>
                      <p className="text-muted mb-0 ms-4">{profileData.department}</p>
                    </div>
                    
                    <div className="col-12 mb-4">
                      <div className="d-flex align-items-center mb-2">
                        <i className="bi bi-file-text text-primary me-2"></i>
                        <strong>Bio</strong>
                      </div>
                      <p className="text-muted mb-0 ms-4">{profileData.bio}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="row">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white border-bottom">
                <h5 className="mb-0">
                  <i className="bi bi-shield-check me-2 text-success"></i>
                  Security Settings
                </h5>
              </div>
              <div className="card-body p-4">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded">
                      <div>
                        <h6 className="mb-1">Password</h6>
                        <small className="text-muted">Last changed 30 days ago</small>
                      </div>
                      <button 
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => setShowPasswordModal(true)}
                      >
                        <i className="bi bi-key me-1"></i>
                        Change
                      </button>
                    </div>
                  </div>
                  
                  <div className="col-md-6 mb-3">
                    <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded">
                      <div>
                        <h6 className="mb-1">Two-Factor Authentication</h6>
                        <small className="text-muted">Add extra security to your account</small>
                      </div>
                      <button className="btn btn-outline-success btn-sm">
                        <i className="bi bi-plus-circle me-1"></i>
                        Enable
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%', 
          backgroundColor: 'rgba(0, 0, 0, 0.5)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 1050 
        }}>
          <div className="modal-dialog" style={{ margin: 0, width: '90%', maxWidth: '500px' }}>
            <div className="modal-content" style={{ borderRadius: '20px', border: 'none', overflow: 'hidden' }}>
              <div className="modal-header" style={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                color: 'white', 
                border: 'none' 
              }}>
                <h5 className="modal-title">
                  <i className="bi bi-key me-2"></i>
                  Change Password
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordForm({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: ''
                    });
                    setPasswordError('');
                  }}
                ></button>
              </div>
              
              <form onSubmit={handlePasswordSubmit}>
                <div className="modal-body" style={{ padding: '30px' }}>
                  {passwordError && (
                    <div className="alert alert-danger d-flex align-items-center" role="alert">
                      <i className="bi bi-exclamation-triangle me-2"></i>
                      {passwordError}
                    </div>
                  )}
                  
                  <div className="mb-4">
                    <label htmlFor="currentPassword" className="form-label fw-semibold">
                      <i className="bi bi-lock me-2 text-muted"></i>
                      Current Password
                    </label>
                    <input
                      type="password"
                      className="form-control form-control-lg"
                      id="currentPassword"
                      name="currentPassword"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                      required
                      style={{ borderRadius: '12px', border: '2px solid #e9ecef' }}
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="newPassword" className="form-label fw-semibold">
                      <i className="bi bi-key me-2 text-muted"></i>
                      New Password
                    </label>
                    <input
                      type="password"
                      className="form-control form-control-lg"
                      id="newPassword"
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      required
                      minLength="6"
                      style={{ borderRadius: '12px', border: '2px solid #e9ecef' }}
                    />
                    <small className="text-muted">Password must be at least 6 characters long</small>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="confirmPassword" className="form-label fw-semibold">
                      <i className="bi bi-check2-circle me-2 text-muted"></i>
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      className="form-control form-control-lg"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                      style={{ borderRadius: '12px', border: '2px solid #e9ecef' }}
                    />
                  </div>
                </div>
                
                <div className="modal-footer" style={{ 
                  padding: '20px 30px', 
                  backgroundColor: '#f8f9fa', 
                  border: 'none' 
                }}>
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-lg px-4"
                    onClick={() => {
                      setShowPasswordModal(false);
                      setPasswordForm({
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: ''
                      });
                      setPasswordError('');
                    }}
                    disabled={passwordLoading}
                    style={{ borderRadius: '12px' }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-lg px-4"
                    disabled={passwordLoading}
                    style={{ 
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      border: 'none',
                      color: 'white',
                      borderRadius: '12px'
                    }}
                  >
                    {passwordLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Changing...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check me-2"></i>
                        Change Password
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProfile; 