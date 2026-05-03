import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react';

export default function LessonPage({ data, onRegenerate }) {
  const navigate = useNavigate();
  const [simplified, setSimplified] = useState(false);

  return (
    <div className="lesson-wrap">
      <nav className="lesson-nav">
        <button className="back-btn" onClick={() => navigate('/')}>
          <ArrowLeft size={16} /> Back
        </button>
        <div className="nav-topic">
          <span className="topic-chip">{data.topic}</span>
          <span className="topic-grade">Grade {data.grade}</span>
        </div>
        <button className="regen-link" onClick={() => onRegenerate({ topic: data.topic, grade: data.grade })}>
          <RotateCcw size={14} /> Regenerate
        </button>
      </nav>

      <div className="lesson-header">
        <h2 className="lesson-title">{data.topic}</h2>
        <div className="toggle-pill">
          <button className={`tpill ${!simplified ? 'tpill-on' : ''}`} onClick={() => setSimplified(false)}>Normal</button>
          <button className={`tpill ${simplified ? 'tpill-on' : ''}`} onClick={() => setSimplified(true)}>Simplified</button>
        </div>
      </div>

      <section className="lesson-card summary-card">
        <div className="section-tag">Summary</div>
        <p className="summary-body">{simplified ? data.simplifiedSummary : data.summary}</p>
      </section>

      <section className="lesson-card">
        <div className="section-tag">Key Points</div>
        <ul className="kp-list">
          {data.keyPoints.map((pt, i) => (
            <li key={i} className="kp-item">
              <span className="kp-num">{String(i+1).padStart(2,'0')}</span>
              <span>{pt}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="quiz-cta">
        <div className="cta-text">
          <strong>Ready to test yourself?</strong>
          <p>{data.quiz.length} questions · Instant feedback · Detailed explanations</p>
        </div>
        <button className="cta-btn" onClick={() => navigate('/quiz')}>
          Take the Quiz <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}