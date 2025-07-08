import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { chaptersAPI, subjectsAPI } from '../../../services/api';

const ChaptersList = () => {
  const { subjectId } = useParams();
  const [chapters, setChapters] = useState([]);
  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchChapters();
    fetchSubject();
  }, [subjectId]);

  const fetchChapters = async () => {
    try {
      setLoading(true);
      const response = await chaptersAPI.getBySubject(subjectId);
      setChapters(response.data);
      setError(null);
    } catch (error) {
      setError('Failed to fetch chapters');
      console.error('Error fetching chapters:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubject = async () => {
    try {
      const response = await subjectsAPI.getById(subjectId);
      setSubject(response.data);
    } catch (error) {
      setSubject(null);
    }
  };

  const handleChapterClick = (chapterId) => {
    navigate(`/user/quizzes/${chapterId}`);
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
      <h2 className="mb-4">
        {subject ? `Chapters for ${subject.name}` : 'Chapters'}
      </h2>
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      <div className="row">
        {chapters.map(chapter => (
          <div className="col-md-4 mb-4" key={chapter._id}>
            <div
              className="card h-100 shadow-sm chapter-card cursor-pointer"
              style={{ cursor: 'pointer' }}
              onClick={() => handleChapterClick(chapter._id)}
            >
              <div className="card-body">
                <h5 className="card-title">{chapter.name}</h5>
                <p className="card-text">{chapter.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChaptersList; 