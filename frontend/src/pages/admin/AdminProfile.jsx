import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AdminProfile = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
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

  useEffect(() => {
    if (currentUser) {
      const userData = {
        full_name: currentUser.full_name || 'Administrator',
        email: currentUser.email || 'admin@quizmaster.com',
        phone: currentUser.phone || '+1 (555) 123-4567',
        department: currentUser.department || 'Information Technology',
        bio: currentUser.bio || 'System Administrator responsible for managing the Quiz Master platform and ensuring smooth operations.',
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
      // Here you would typically make an API call to update the profile
      // await userAPI.updateProfile(editFormData);
      
      // For now, just update local state
      setProfileData(editFormData);
      setIsEditing(false);
      
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
      alert('Error updating profile. Please try again.');
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
            <button 
              onClick={() => navigate('/admin')}
              className="btn btn-outline-light rounded-pill px-3 py-2"
              style={{
                border: '1px solid rgba(255, 255, 255, 0.3)',
                backdropFilter: 'blur(10px)',
                background: 'rgba(255, 255, 255, 0.1)'
              }}
            >
              <i className="bi bi-arrow-left me-2"></i>
              Back to Dashboard
            </button>
            
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
          {/* Profile Card */}
          <div className="col-lg-4 mb-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center p-4">
                {/* Profile Avatar */}
                <div className="mb-4">
                  <div className="mx-auto mb-3" style={{
                    width: '120px',
                    height: '120px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2.5rem',
                    color: '#fff',
                    fontWeight: 'bold',
                    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
                    border: '4px solid #fff'
                  }}>
                    {getInitials(profileData.full_name)}
                  </div>
                  
                  <h4 className="mb-1">{profileData.full_name}</h4>
                  <p className="text-muted mb-0">{profileData.department}</p>
                  <small className="text-muted">
                    <i className="bi bi-calendar me-1"></i>
                    Member since {formatDate(profileData.created_at)}
                  </small>
                </div>

                {/* Quick Stats */}
                <div className="row text-center">
                  <div className="col-4">
                    <div className="p-2">
                      <div className="h5 text-primary mb-0">12</div>
                      <small className="text-muted">Active Quizzes</small>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="p-2">
                      <div className="h5 text-success mb-0">156</div>
                      <small className="text-muted">Total Users</small>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="p-2">
                      <div className="h5 text-warning mb-0">8</div>
                      <small className="text-muted">Subjects</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <div className="col-lg-8 mb-4">
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
                      <button className="btn btn-outline-primary btn-sm">
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
    </div>
  );
};

export default AdminProfile; 