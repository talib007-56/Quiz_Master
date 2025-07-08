import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { subjectsAPI } from '../../../services/api';

const SubjectsList = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const response = await subjectsAPI.getAll();
      setSubjects(response.data);
      setError(null);
    } catch (error) {
      setError('Failed to fetch subjects');
      console.error('Error fetching subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectClick = (subjectId) => {
    navigate(`/user/chapters/${subjectId}`);
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

  return (
    <div>
      <h2 className="mb-4">Available Subjects</h2>
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      <div className="row">
        {subjects.map(subject => (
          <div className="col-md-4 mb-4" key={subject._id}>
            <div
              className="card h-100 shadow-sm subject-card cursor-pointer"
              style={{ cursor: 'pointer' }}
              onClick={() => handleSubjectClick(subject._id)}
            >
              <div className="card-body">
                <h5 className="card-title">{subject.name}</h5>
                <p className="card-text">{subject.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubjectsList; 