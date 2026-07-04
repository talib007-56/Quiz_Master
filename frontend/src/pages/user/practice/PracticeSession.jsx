import { useState, useEffect, useRef } from 'react';
import { subjectsAPI, chaptersAPI, aiAPI } from '../../../services/api';

// AI-powered practice session: student picks subject/chapter/difficulty,
// Claude generates fresh questions, session is timed with instant feedback
// and on-demand step-by-step explanations.
const PracticeSession = () => {
  // 'setup' | 'generating' | 'practice' | 'summary'
  const [stage, setStage] = useState('setup');

  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [config, setConfig] = useState({
    subject: '',
    chapter: '',
    difficulty: 'medium',
    count: 5,
    timed: true
  });

  const [practiceQuestions, setPracticeQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null); // 1-based, locked after checking
  const [checked, setChecked] = useState(false);
  const [results, setResults] = useState([]); // { correct: bool } per question
  const [timer, setTimer] = useState(0); // seconds remaining
  const timerRef = useRef(null);

  const [explanation, setExplanation] = useState(null);
  const [explaining, setExplaining] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [subRes, chapRes] = await Promise.all([subjectsAPI.getAll(), chaptersAPI.getAll()]);
        setSubjects(Array.isArray(subRes.data) ? subRes.data : subRes.data?.data || []);
        setChapters(Array.isArray(chapRes.data) ? chapRes.data : chapRes.data?.data || []);
      } catch {
        setError('Failed to load subjects and chapters.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Countdown timer: 90 seconds per question, auto-finish at zero
  useEffect(() => {
    if (stage === 'practice' && config.timed && timer > 0) {
      timerRef.current = setInterval(() => {
        setTimer(t => {
          if (t <= 1) {
            clearInterval(timerRef.current);
            setStage('summary');
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [stage, config.timed]);

  const subjectObj = subjects.find(s => s._id === config.subject);
  const chapterObj = chapters.find(c => c._id === config.chapter);

  const filteredChapters = chapters.filter(c => {
    const subId = typeof c.subject_id === 'object' ? c.subject_id?._id : c.subject_id;
    return subId === config.subject;
  });

  const startSession = async () => {
    if (!config.subject || !config.chapter) {
      setError('Please select a subject and a chapter to practice.');
      return;
    }
    setError('');
    setStage('generating');
    try {
      const res = await aiAPI.generateQuestions({
        subject: subjectObj?.name || '',
        chapter: chapterObj?.name || '',
        count: parseInt(config.count),
        difficulty: config.difficulty
      });
      const qs = res.data.questions || [];
      if (qs.length === 0) throw new Error('No questions generated');
      setPracticeQuestions(qs);
      setResults([]);
      setCurrentIndex(0);
      setSelectedOption(null);
      setChecked(false);
      setExplanation(null);
      setTimer(qs.length * 90); // 90 seconds per question
      setStage('practice');
    } catch (err) {
      setError(err.response?.data?.message || 'AI question generation failed. Please try again.');
      setStage('setup');
    }
  };

  const checkAnswer = () => {
    if (selectedOption === null || checked) return;
    const q = practiceQuestions[currentIndex];
    const correct = selectedOption === q.correct_option;
    setResults(prev => [...prev, { correct }]);
    setChecked(true);
  };

  const nextQuestion = () => {
    if (currentIndex < practiceQuestions.length - 1) {
      setCurrentIndex(i => i + 1);
      setSelectedOption(null);
      setChecked(false);
      setExplanation(null);
    } else {
      clearInterval(timerRef.current);
      setStage('summary');
    }
  };

  const getExplanation = async () => {
    const q = practiceQuestions[currentIndex];
    setExplaining(true);
    setExplanation(null);
    try {
      const res = await aiAPI.explainAnswer({
        questionStatement: q.question_statement,
        options: [q.option1, q.option2, q.option3, q.option4],
        correctOption: q.correct_option,
        subject: subjectObj?.name || '',
        chapter: chapterObj?.name || ''
      });
      setExplanation(res.data.explanation);
    } catch {
      setExplanation('Could not fetch AI explanation. Please try again.');
    } finally {
      setExplaining(false);
    }
  };

  const resetSession = () => {
    clearInterval(timerRef.current);
    setStage('setup');
    setPracticeQuestions([]);
    setResults([]);
    setExplanation(null);
    setError('');
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center my-5">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  // ── SETUP ──
  if (stage === 'setup' || stage === 'generating') {
    return (
      <div className="container" style={{ maxWidth: 700 }}>
        <div className="card border-0 shadow">
          <div className="card-header text-white" style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)' }}>
            <h4 className="mb-0"><i className="bi bi-robot me-2"></i>AI Practice Session</h4>
            <small>Unlimited practice questions generated by AI — never run out of material</small>
          </div>
          <div className="card-body p-4">
            {error && <div className="alert alert-danger">{error}</div>}

            <div className="mb-3">
              <label className="form-label fw-bold">Subject</label>
              <select className="form-select" value={config.subject}
                onChange={e => setConfig(p => ({ ...p, subject: e.target.value, chapter: '' }))}
                disabled={stage === 'generating'}>
                <option value="">Choose a subject...</option>
                {subjects.map(s => (
                  <option key={s._id} value={s._id}>
                    {s.name}{s.semester ? ` — Semester ${s.semester}` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold">Chapter / Topic</label>
              <select className="form-select" value={config.chapter}
                onChange={e => setConfig(p => ({ ...p, chapter: e.target.value }))}
                disabled={!config.subject || stage === 'generating'}>
                <option value="">Choose a chapter...</option>
                {filteredChapters.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label fw-bold">Difficulty</label>
                <select className="form-select" value={config.difficulty}
                  onChange={e => setConfig(p => ({ ...p, difficulty: e.target.value }))}
                  disabled={stage === 'generating'}>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">Number of Questions</label>
                <select className="form-select" value={config.count}
                  onChange={e => setConfig(p => ({ ...p, count: e.target.value }))}
                  disabled={stage === 'generating'}>
                  {[3, 5, 10].map(n => <option key={n} value={n}>{n} questions</option>)}
                </select>
              </div>
            </div>

            <div className="form-check form-switch mb-4">
              <input className="form-check-input" type="checkbox" id="timedSwitch"
                checked={config.timed}
                onChange={e => setConfig(p => ({ ...p, timed: e.target.checked }))}
                disabled={stage === 'generating'} />
              <label className="form-check-label" htmlFor="timedSwitch">
                Timed mode (90 seconds per question — simulates exam conditions)
              </label>
            </div>

            <button className="btn btn-primary btn-lg w-100" onClick={startSession}
              disabled={stage === 'generating'}>
              {stage === 'generating'
                ? <><span className="spinner-border spinner-border-sm me-2" />AI is generating your questions...</>
                : <><i className="bi bi-stars me-2"></i>Start Practice Session</>}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── SUMMARY ──
  if (stage === 'summary') {
    const attempted = results.length;
    const correct = results.filter(r => r.correct).length;
    const pct = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
    return (
      <div className="container" style={{ maxWidth: 600 }}>
        <div className="card border-0 shadow text-center">
          <div className="card-header text-white" style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)' }}>
            <h4 className="mb-0"><i className="bi bi-flag-fill me-2"></i>Practice Complete!</h4>
          </div>
          <div className="card-body p-4">
            <div className="display-3 fw-bold mb-2" style={{ color: pct >= 60 ? '#28a745' : '#dc3545' }}>
              {pct}%
            </div>
            <p className="lead mb-1">
              {correct} correct out of {attempted} attempted
              {attempted < practiceQuestions.length && ` (${practiceQuestions.length - attempted} unanswered)`}
            </p>
            <p className="text-muted mb-4">
              {subjectObj?.name} — {chapterObj?.name} ({config.difficulty})
            </p>
            <div className="alert alert-info text-start">
              <i className="bi bi-lightbulb me-2"></i>
              {pct >= 80 ? 'Excellent! Try a harder difficulty or a new chapter.'
                : pct >= 60 ? 'Good work! Practice this topic once more to strengthen it.'
                : 'This topic needs more practice. Generate a new set of questions and use AI explanations to learn the concepts.'}
            </div>
            <div className="d-flex gap-2 justify-content-center">
              <button className="btn btn-primary" onClick={startSession}>
                <i className="bi bi-arrow-repeat me-2"></i>Practice Again (New Questions)
              </button>
              <button className="btn btn-outline-secondary" onClick={resetSession}>
                <i className="bi bi-gear me-2"></i>Change Topic
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── PRACTICE ──
  const q = practiceQuestions[currentIndex];
  const options = [q.option1, q.option2, q.option3, q.option4];

  return (
    <div className="container" style={{ maxWidth: 800 }}>
      <div className="card border-0 shadow">
        {/* Header: progress + timer */}
        <div className="card-header d-flex justify-content-between align-items-center bg-white">
          <span className="badge bg-primary fs-6">
            Question {currentIndex + 1} / {practiceQuestions.length}
          </span>
          <span className="text-muted small">
            {subjectObj?.name} — {chapterObj?.name}
            <span className={`badge ms-2 bg-${config.difficulty === 'easy' ? 'success' : config.difficulty === 'hard' ? 'danger' : 'warning'}`}>
              {config.difficulty}
            </span>
          </span>
          {config.timed && (
            <span className={`badge fs-6 ${timer <= 30 ? 'bg-danger' : 'bg-dark'}`}>
              <i className="bi bi-stopwatch me-1"></i>{formatTime(timer)}
            </span>
          )}
        </div>

        <div className="card-body p-4">
          {/* Score strip */}
          <div className="d-flex gap-1 mb-3">
            {practiceQuestions.map((_, i) => (
              <div key={i} style={{
                flex: 1, height: 6, borderRadius: 3,
                backgroundColor: i < results.length
                  ? (results[i].correct ? '#28a745' : '#dc3545')
                  : i === currentIndex ? '#007bff' : '#e9ecef'
              }} />
            ))}
          </div>

          <h5 className="mb-4">{q.question_statement}</h5>

          {options.map((opt, i) => {
            const optNum = i + 1;
            const isSelected = selectedOption === optNum;
            const isCorrect = q.correct_option === optNum;
            let cls = 'list-group-item list-group-item-action d-flex align-items-center';
            let style = { cursor: checked ? 'default' : 'pointer' };
            if (checked) {
              if (isCorrect) style = { ...style, backgroundColor: '#d4edda', borderColor: '#28a745' };
              else if (isSelected) style = { ...style, backgroundColor: '#f8d7da', borderColor: '#dc3545' };
            } else if (isSelected) {
              style = { ...style, backgroundColor: '#e3f2fd', borderColor: '#007bff' };
            }
            return (
              <button key={i} type="button" className={`${cls} mb-2 rounded border`}
                style={style}
                onClick={() => !checked && setSelectedOption(optNum)}>
                <span className="badge bg-secondary me-3">{optNum}</span>
                <span className="flex-grow-1 text-start">{opt}</span>
                {checked && isCorrect && <i className="bi bi-check-circle-fill text-success fs-5"></i>}
                {checked && isSelected && !isCorrect && <i className="bi bi-x-circle-fill text-danger fs-5"></i>}
              </button>
            );
          })}

          {/* Instant feedback */}
          {checked && (
            <div className={`alert ${selectedOption === q.correct_option ? 'alert-success' : 'alert-danger'} mt-3 mb-0`}>
              {selectedOption === q.correct_option
                ? <><i className="bi bi-check-circle me-2"></i><strong>Correct!</strong> Well done.</>
                : <><i className="bi bi-x-circle me-2"></i><strong>Incorrect.</strong> The correct answer is option {q.correct_option}. Use "Explain" to understand why.</>}
            </div>
          )}

          {/* AI explanation */}
          {(explanation || explaining) && (
            <div className="mt-3 p-3 rounded" style={{ backgroundColor: '#fffbf0', border: '2px solid #ffc107' }}>
              <div className="d-flex align-items-center mb-2">
                <strong style={{ color: '#856404' }}>🤖 AI Explanation</strong>
                {explanation && (
                  <button className="btn btn-sm ms-auto" onClick={() => setExplanation(null)}
                    style={{ color: '#856404' }}>✕</button>
                )}
              </div>
              {explaining
                ? <em style={{ color: '#856404' }}>Generating step-by-step explanation...</em>
                : <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{explanation}</div>}
            </div>
          )}
        </div>

        <div className="card-footer bg-white d-flex gap-2 justify-content-between">
          <button className="btn btn-outline-danger" onClick={resetSession}>
            <i className="bi bi-x-lg me-1"></i>End Session
          </button>
          <div className="d-flex gap-2">
            {checked && (
              <button className="btn btn-warning" onClick={getExplanation} disabled={explaining}>
                {explaining ? 'Explaining...' : <><i className="bi bi-lightbulb me-1"></i>Explain</>}
              </button>
            )}
            {!checked ? (
              <button className="btn btn-primary" onClick={checkAnswer} disabled={selectedOption === null}>
                <i className="bi bi-check-lg me-1"></i>Check Answer
              </button>
            ) : (
              <button className="btn btn-success" onClick={nextQuestion}>
                {currentIndex < practiceQuestions.length - 1
                  ? <>Next Question<i className="bi bi-arrow-right ms-1"></i></>
                  : <>Finish<i className="bi bi-flag ms-1"></i></>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PracticeSession;
