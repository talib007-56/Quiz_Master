import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { chaptersAPI, subjectsAPI } from '../../../services/api';

const ChaptersList = () => {
  const [chapters, setChapters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState(null);

  const [formData, setFormData] = useState({
    subject_id: '',
    name: '',
    description: ''
  });

  // Fetch chapters and subjects
  useEffect(() => {
    fetchChapters();
    fetchSubjects();
  }, []);

  const fetchChapters = async () => {
    try {
      setLoading(true);
      const response = await chaptersAPI.getAll();
      setChapters(response.data);
      setError(null);
    } catch (error) {
      setError('Failed to fetch chapters');
      console.error('Error fetching chapters:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await subjectsAPI.getAll();
      setSubjects(response.data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleAddChapter = async (e) => {
    e.preventDefault();
    try {
      await chaptersAPI.create(formData);
      setShowAddModal(false);
      setFormData({ subject_id: '', name: '', description: '' });
      fetchChapters();
    } catch (error) {
      setError('Failed to add chapter');
      console.error('Error adding chapter:', error);
    }
  };

  const handleEditChapter = async (e) => {
    e.preventDefault();
    try {
      await chaptersAPI.update(selectedChapter._id, formData);
      setShowEditModal(false);
      setSelectedChapter(null);
      setFormData({ subject_id: '', name: '', description: '' });
      fetchChapters();
    } catch (error) {
      setError('Failed to update chapter');
      console.error('Error updating chapter:', error);
    }
  };

  const handleDeleteChapter = async (id) => {
    if (window.confirm('Are you sure you want to delete this chapter?')) {
      try {
        await chaptersAPI.delete(id);
        fetchChapters();
      } catch (error) {
        setError('Failed to delete chapter');
        console.error('Error deleting chapter:', error);
      }
    }
  };

  const openEditModal = (chapter) => {
    setSelectedChapter(chapter);
    setFormData({
      subject_id: chapter.subject_id._id,
      name: chapter.name,
      description: chapter.description
    });
    setShowEditModal(true);
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Chapters</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          <i className="bi bi-plus-circle me-2"></i>Add Chapter
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="table-responsive">
        <table className="table table-hover">
          <thead>
            <tr>
              <th>Subject</th>
              <th>Name</th>
              <th>Description</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {chapters.map(chapter => (
              <tr key={chapter._id}>
                <td>{chapter.subject_id.name}</td>
                <td>{chapter.name}</td>
                <td>{chapter.description}</td>
                <td>{new Date(chapter.created_at).toLocaleDateString()}</td>
                <td>
                  <button
                    className="btn btn-sm btn-outline-primary me-2"
                    onClick={() => openEditModal(chapter)}
                  >
                    <i className="bi bi-pencil"></i>
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDeleteChapter(chapter._id)}
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Chapter Modal */}
      {showAddModal && (
        <>
          <div className="modal show d-block" tabIndex="-1" style={{ zIndex: 1050, position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="modal-dialog" style={{ margin: 0, maxWidth: '500px', width: '90%' }}>
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Add Chapter</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowAddModal(false)}
                  ></button>
                </div>
                <form onSubmit={handleAddChapter}>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label htmlFor="subject_id" className="form-label">Subject</label>
                      <select
                        className="form-select"
                        id="subject_id"
                        name="subject_id"
                        value={formData.subject_id}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select a subject</option>
                        {subjects.map(subject => (
                          <option key={subject._id} value={subject._id}>
                            {subject.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-3">
                      <label htmlFor="name" className="form-label">Name</label>
                      <input
                        type="text"
                        className="form-control"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="description" className="form-label">Description</label>
                      <textarea
                        className="form-control"
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        required
                      ></textarea>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowAddModal(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Add Chapter
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="modal-backdrop show" style={{ zIndex: 1040, position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh' }}></div>
        </>
      )}

      {/* Edit Chapter Modal */}
      {showEditModal && createPortal(
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            zIndex: 9999,
            paddingTop: '50px',
            overflowY: 'auto'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowEditModal(false);
            }
          }}
        >
          <div 
            className="modal-dialog" 
            style={{ 
              margin: 0, 
              maxWidth: '500px', 
              width: '90%'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Chapter</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowEditModal(false)}
                ></button>
              </div>
              <form onSubmit={handleEditChapter}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="edit-subject_id" className="form-label">Subject</label>
                    <select
                      className="form-select"
                      id="edit-subject_id"
                      name="subject_id"
                      value={formData.subject_id}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select a subject</option>
                      {subjects.map(subject => (
                        <option key={subject._id} value={subject._id}>
                          {subject.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="edit-name" className="form-label">Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="edit-name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="edit-description" className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      id="edit-description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowEditModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Update Chapter
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}


    </div>
  );
};

export default ChaptersList; 