import { useState, useEffect } from 'react';
import { usersAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getProfile();
      setProfile(response.data.user);
      setError(null);
    } catch (error) {
      setError('Failed to fetch profile');
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger my-4">{error}</div>;
  }

  if (!profile) {
    return <div className="alert alert-warning my-4">No profile found.</div>;
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4">User Profile</h2>
      <div className="card mb-4">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">Profile Information</h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <p><strong>Full Name:</strong> {profile.full_name}</p>
              <p><strong>Email:</strong> {profile.email}</p>
              <p><strong>Role:</strong> <span className="badge bg-secondary">{profile.role}</span></p>
            </div>
            <div className="col-md-6">
              <p><strong>Qualification:</strong> {profile.qualification}</p>
              <p><strong>Date of Birth:</strong> {profile.dob ? new Date(profile.dob).toLocaleDateString() : 'Not provided'}</p>
              <p><strong>Member Since:</strong> {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Not available'}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="card">
        <div className="card-header bg-info text-white">
          <h5 className="mb-0">Account Status</h5>
        </div>
        <div className="card-body">
          <p className="text-success"><i className="fas fa-check-circle"></i> Account Active</p>
          <p className="text-muted">Your account is in good standing and you have access to all quiz features.</p>
        </div>
      </div>
    </div>
  );
};

export default Profile; 