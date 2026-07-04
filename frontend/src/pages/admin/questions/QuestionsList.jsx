import { useState, useEffect } from 'react';
import { questionsAPI, quizzesAPI, subjectsAPI, chaptersAPI } from '../../../services/api';
import { aiAPI } from '../../../services/api';

const emptyForm = {
  quiz_id: '',
  question_title: '',
  question_statement: '',
  option1: '',
  option2: '',
  option3: '',
  option4: '',
  correct_option: '',
  difficulty: 'medium'
};

const QuestionsList = () => {
  const [questions, setQuestions] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  // AI Generator state
  const [aiForm, setAiForm] = useState({ subject: '', chapter: '', count: 5, difficulty: 'medium', quiz_id: '' });
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiError, setAiError] = useState('');
  const [aiQuestions, setAiQuestions] = useState([]);
  const [selectedAiQuestions, setSelectedAiQuestions] = useState([]);
  const [savingAi, setSavingAi] = useState(false);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [qRes, quizRes, subRes, chapRes] = await Promise.all([
        questionsAPI.getAll(),
        quizzesAPI.getAll(),
        subjectsAPI.getAll(),
        chaptersAPI.getAll()
      ]);
      setQuestions(Array.isArray(qRes.data) ? qRes.data : qRes.data?.data || []);
      setQuizzes(Array.isArray(quizRes.data) ? quizRes.data : quizRes.data?.data || []);
      setSubjects(Array.isArray(subRes.data) ? subRes.data : subRes.data?.data || []);
      setChapters(Array.isArray(chapRes.data) ? chapRes.data : chapRes.data?.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    try {
      await questionsAPI.create(formData);
      setShowAddModal(false);
      setFormData(emptyForm);
      fetchAll();
    } catch (err) {
      setError('Failed to add question');
    }
  };

  const handleEditQuestion = async (e) => {
    e.preventDefault();
    try {
      await questionsAPI.update(selectedQuestion._id, formData);
      setShowEditModal(false);
      setSelectedQuestion(null);
      setFormData(emptyForm);
      fetchAll();
    } catch (err) {
      setError('Failed to update question');
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (window.confirm('Delete this question?')) {
      try {
        await questionsAPI.delete(id);
        fetchAll();
      } catch {
        setError('Failed to delete question');
      }
    }
  };

  const openEditModal = (question) => {
    setSelectedQuestion(question);
    setFormData({
      quiz_id: question.quiz_id?._id || question.quiz_id || '',
      question_title: question.question_title || '',
      question_statement: question.question_statement,
      option1: question.option1,
      option2: question.option2,
      option3: question.option3,
      option4: question.option4,
      correct_option: question.correct_option,
      difficulty: question.difficulty || 'medium'
    });
    setShowEditModal(true);
  };

  // --- AI Generator ---
  const handleAiGenerate = async () => {
    if (!aiForm.subject || !aiForm.chapter) {
      setAiError('Please select a subject and chapter.');
      return;
    }
    setAiGenerating(true);
    setAiError('');
    setAiQuestions([]);
    setSelectedAiQuestions([]);
    try {
      const subjectObj = subjects.find(s => s._id === aiForm.subject);
      const chapterObj = chapters.find(c => c._id === aiForm.chapter);
      const res = await aiAPI.generateQuestions({
        subject: subjectObj?.name || aiForm.subject,
        chapter: chapterObj?.name || aiForm.chapter,
        count: parseInt(aiForm.count),
        difficulty: aiForm.difficulty
      });
      setAiQuestions(res.data.questions || []);
      setSelectedAiQuestions(res.data.questions.map((_, i) => i));
    } catch (err) {
      setAiError(err.response?.data?.message || 'Failed to generate questions. Check your ANTHROPIC_API_KEY.');
    } finally {
      setAiGenerating(false);
    }
  };

  const toggleSelectAiQuestion = (idx) => {
    setSelectedAiQuestions(prev =>
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  const handleSaveAiQuestions = async () => {
    if (!aiForm.quiz_id) {
      setAiError('Select a quiz to save questions to.');
      return;
    }
    if (selectedAiQuestions.length === 0) {
      setAiError('Select at least one question to save.');
      return;
    }
    setSavingAi(true);
    try {
      const toSave = selectedAiQuestions.map(i => ({
        ...aiQuestions[i],
        quiz_id: aiForm.quiz_id,
        difficulty: aiForm.difficulty
      }));
      await Promise.all(toSave.map(q => questionsAPI.create(q)));
      setShowAIModal(false);
      setAiQuestions([]);
      setSelectedAiQuestions([]);
      setAiForm({ subject: '', chapter: '', count: 5, difficulty: 'medium', quiz_id: '' });
      fetchAll();
      alert(`${toSave.length} AI-generated question(s) saved successfully!`);
    } catch (err) {
      setAiError('Failed to save some questions.');
    } finally {
      setSavingAi(false);
    }
  };

  const difficultyBadge = (d) => {
    const map = { easy: 'success', medium: 'warning', hard: 'danger' };
    return <span className={`badge bg-${map[d] || 'secondary'}`}>{d || 'medium'}</span>;
  };

  const getQuizLabel = (quiz) => {
    const chapter = chapters.find(c => {
      const id = typeof quiz.chapter_id === 'object' ? quiz.chapter_id?._id : quiz.chapter_id;
      return c._id === id;
    });
    return chapter ? chapter.name : `Quiz ${quiz._id?.slice(-6)}`;
  };

  const filteredChapters = chapters.filter(c => {
    const subId = typeof c.subject_id === 'object' ? c.subject_id?._id : c.subject_id;
    return subId === aiForm.subject;
  });

  if (loading) return (
    <div className="d-flex justify-content-center my-5">
      <div className="spinner-border text-primary" role="status" />
    </div>
  );

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h2 className="mb-0">Questions <span className="badge bg-secondary ms-2">{questions.length}</span></h2>
        <div className="d-flex gap-2">
          <button className="btn btn-warning" onClick={() => { setShowAIModal(true); setAiQuestions([]); setAiError(''); }}>
            <i className="bi bi-robot me-2"></i>Generate with AI
          </button>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <i className="bi bi-plus-circle me-2"></i>Add Question
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>Quiz / Chapter</th>
              <th>Question</th>
              <th>Difficulty</th>
              <th>Correct</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {questions.length === 0 ? (
              <tr><td colSpan="6" className="text-center py-4 text-muted">No questions yet. Add manually or use AI Generator.</td></tr>
            ) : questions.map((q, i) => (
              <tr key={q._id}>
                <td>{i + 1}</td>
                <td>
                  <small className="text-muted">
                    {q.quiz_id && q.quiz_id.chapter_id ? q.quiz_id.chapter_id.name : 'Unknown'}
                  </small>
                </td>
                <td style={{ maxWidth: 300 }}>
                  <div className="fw-semibold text-truncate" title={q.question_statement}>
                    {q.question_statement}
                  </div>
                </td>
                <td>{difficultyBadge(q.difficulty)}</td>
                <td><span className="badge bg-success">Option {q.correct_option}</span></td>
                <td>
                  <button className="btn btn-sm btn-outline-primary me-1" onClick={() => openEditModal(q)} disabled={!q.quiz_id}>
                    <i className="bi bi-pencil"></i>
                  </button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteQuestion(q._id)}>
                    <i className="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── AI GENERATOR MODAL ── */}
      {showAIModal && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header" style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)', color: '#fff' }}>
                <h5 className="modal-title"><i className="bi bi-robot me-2"></i>AI Question Generator — BCA Quest</h5>
                <button className="btn-close btn-close-white" onClick={() => setShowAIModal(false)} />
              </div>
              <div className="modal-body">
                {/* Config row */}
                <div className="row g-3 mb-4">
                  <div className="col-md-3">
                    <label className="form-label fw-bold">Subject</label>
                    <select className="form-select" value={aiForm.subject}
                      onChange={e => setAiForm(p => ({ ...p, subject: e.target.value, chapter: '' }))}>
                      <option value="">Select subject</option>
                      {subjects.map(s => <option key={s._id} value={s._id}>{s.name}{s.semester ? ` (Sem ${s.semester})` : ''}</option>)}
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-bold">Chapter / Topic</label>
                    <select className="form-select" value={aiForm.chapter}
                      onChange={e => setAiForm(p => ({ ...p, chapter: e.target.value }))}
                      disabled={!aiForm.subject}>
                      <option value="">Select chapter</option>
                      {filteredChapters.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="col-md-2">
                    <label className="form-label fw-bold">Difficulty</label>
                    <select className="form-select" value={aiForm.difficulty}
                      onChange={e => setAiForm(p => ({ ...p, difficulty: e.target.value }))}>
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                  <div className="col-md-2">
                    <label className="form-label fw-bold">Count</label>
                    <select className="form-select" value={aiForm.count}
                      onChange={e => setAiForm(p => ({ ...p, count: e.target.value }))}>
                      {[3,5,10].map(n => <option key={n} value={n}>{n} questions</option>)}
                    </select>
                  </div>
                  <div className="col-md-2 d-flex align-items-end">
                    <button className="btn btn-primary w-100" onClick={handleAiGenerate} disabled={aiGenerating}>
                      {aiGenerating ? <><span className="spinner-border spinner-border-sm me-1" />Generating...</> : <><i className="bi bi-stars me-1" />Generate</>}
                    </button>
                  </div>
                </div>

                {aiError && <div className="alert alert-danger">{aiError}</div>}

                {/* Generated questions preview */}
                {aiQuestions.length > 0 && (
                  <>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h6 className="mb-0 text-success"><i className="bi bi-check-circle me-2"></i>{aiQuestions.length} questions generated — select which to save:</h6>
                      <div className="d-flex gap-2 align-items-center">
                        <label className="form-label mb-0 fw-bold">Save to Quiz:</label>
                        <select className="form-select form-select-sm" style={{ width: 220 }} value={aiForm.quiz_id}
                          onChange={e => setAiForm(p => ({ ...p, quiz_id: e.target.value }))}>
                          <option value="">Select quiz</option>
                          {quizzes.map(q => <option key={q._id} value={q._id}>{getQuizLabel(q)}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="row g-3">
                      {aiQuestions.map((q, idx) => (
                        <div className="col-md-6" key={idx}>
                          <div className={`card h-100 ${selectedAiQuestions.includes(idx) ? 'border-primary border-2' : 'border'}`}
                            style={{ cursor: 'pointer' }} onClick={() => toggleSelectAiQuestion(idx)}>
                            <div className="card-body">
                              <div className="d-flex justify-content-between mb-2">
                                <span className="badge bg-primary">Q{idx + 1}</span>
                                <input type="checkbox" className="form-check-input" readOnly
                                  checked={selectedAiQuestions.includes(idx)} />
                              </div>
                              <p className="fw-semibold mb-2">{q.question_statement}</p>
                              <ol className="mb-2 small">
                                {[q.option1, q.option2, q.option3, q.option4].map((opt, i) => (
                                  <li key={i} className={i + 1 === q.correct_option ? 'text-success fw-bold' : ''}>
                                    {opt} {i + 1 === q.correct_option && '✓'}
                                  </li>
                                ))}
                              </ol>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
              {aiQuestions.length > 0 && (
                <div className="modal-footer">
                  <span className="text-muted me-auto">{selectedAiQuestions.length} of {aiQuestions.length} selected</span>
                  <button className="btn btn-secondary" onClick={() => setShowAIModal(false)}>Cancel</button>
                  <button className="btn btn-success" onClick={handleSaveAiQuestions} disabled={savingAi || selectedAiQuestions.length === 0}>
                    {savingAi ? 'Saving...' : <><i className="bi bi-save me-1" />Save {selectedAiQuestions.length} Question(s)</>}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── ADD QUESTION MODAL ── */}
      {showAddModal && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add Question</h5>
                <button className="btn-close" onClick={() => setShowAddModal(false)} />
              </div>
              <form onSubmit={handleAddQuestion}>
                <div className="modal-body">
                  <QuestionForm formData={formData} onChange={handleInputChange} quizzes={quizzes} chapters={chapters} />
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Add Question</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT QUESTION MODAL ── */}
      {showEditModal && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Question</h5>
                <button className="btn-close" onClick={() => setShowEditModal(false)} />
              </div>
              <form onSubmit={handleEditQuestion}>
                <div className="modal-body">
                  <QuestionForm formData={formData} onChange={handleInputChange} quizzes={quizzes} chapters={chapters} />
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Update Question</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const QuestionForm = ({ formData, onChange, quizzes, chapters }) => (
  <>
    <div className="mb-3">
      <label className="form-label">Quiz</label>
      <select className="form-select" name="quiz_id" value={formData.quiz_id} onChange={onChange} required>
        <option value="">Select a quiz</option>
        {quizzes.map(q => {
          const ch = typeof q.chapter_id === 'object' ? q.chapter_id?.name : null;
          return <option key={q._id} value={q._id}>{ch || `Quiz ${q._id?.slice(-6)}`}</option>;
        })}
      </select>
    </div>
    <div className="row g-2 mb-3">
      <div className="col-md-8">
        <label className="form-label">Question Title</label>
        <input className="form-control" name="question_title" value={formData.question_title} onChange={onChange} placeholder="Short title (optional)" />
      </div>
      <div className="col-md-4">
        <label className="form-label">Difficulty</label>
        <select className="form-select" name="difficulty" value={formData.difficulty} onChange={onChange}>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>
    </div>
    <div className="mb-3">
      <label className="form-label">Question Statement</label>
      <textarea className="form-control" name="question_statement" value={formData.question_statement} onChange={onChange} rows={3} required />
    </div>
    {['option1','option2','option3','option4'].map((opt, i) => (
      <div className="mb-3" key={opt}>
        <label className="form-label">Option {i + 1}</label>
        <input className="form-control" name={opt} value={formData[opt]} onChange={onChange} required />
      </div>
    ))}
    <div className="mb-3">
      <label className="form-label">Correct Option</label>
      <select className="form-select" name="correct_option" value={formData.correct_option} onChange={onChange} required>
        <option value="">Select correct option</option>
        {[1,2,3,4].map(n => <option key={n} value={n}>Option {n}</option>)}
      </select>
    </div>
  </>
);

export default QuestionsList;
