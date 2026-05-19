import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, BookOpen, Loader } from 'lucide-react';
import axios from 'axios';

export default function QuizPage({ data }) {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [feedback, setFeedback] = useState({});
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [done, setDone] = useState(false);

  const q = data.quiz[current];
  const total = data.quiz.length;
  const chosen = answers[current];
  const isCorrect = chosen === q.correctAnswer;

  const pick = async (opt) => {
    if (answers[current] !== undefined) return;
    const correct = opt === q.correctAnswer;
    setAnswers(a => ({ ...a, [current]: opt }));

    if (!correct) {
      setLoadingFeedback(true);
      try {
        const res = await axios.post('/api/feedback', {
          question: q.question,
          userAnswer: opt,
          correctAnswer: q.correctAnswer,
          topic: data.topic,
          keyPoints: data.keyPoints,
        });
        setFeedback(f => ({ ...f, [current]: res.data }));
      } catch {
        setFeedback(f => ({ ...f, [current]: { mistake: 'That was incorrect.', explanation: `The correct answer is: ${q.correctAnswer}`, pointsToCover: [] } }));
      } finally {
        setLoadingFeedback(false);
      }
    }
  };

  const next = () => {
    if (current + 1 >= total) setDone(true);
    else setCurrent(c => c + 1);
  };

  const score = Object.keys(answers).filter(i => answers[i] === data.quiz[i].correctAnswer).length;

  if (done) {
    const pct = Math.round((score / total) * 100);
    return (
      <div className="quiz-wrap">
        <div className="score-card">
          <div className="score-circle">
            <span className="score-num">{pct}%</span>
            <span className="score-label">{score}/{total} correct</span>
          </div>
          <h2 className="score-title">
            {pct === 100 ? 'Perfect! 🎉' : pct >= 70 ? 'Well done! 👍' : 'Keep going! 📚'}
          </h2>
          <p className="score-sub">
            {pct === 100 ? "You nailed every question." : pct >= 70 ? "Solid understanding. Review the missed ones below." : "Check the explanations below — they'll help a lot."}
          </p>

          <div className="review-list">
            {data.quiz.map((qq, i) => {
              const correct = answers[i] === qq.correctAnswer;
              return (
                <div key={i} className={`review-item ${correct ? 'r-correct' : 'r-wrong'}`}>
                  <div className="review-q">
                    {correct ? <CheckCircle size={16} /> : <XCircle size={16} />}
                    <span>{qq.question}</span>
                  </div>
                  {!correct && feedback[i] && (
                    <div className="review-fb">
                      <p><strong>Your answer:</strong> {answers[i]}</p>
                      <p><strong>Correct:</strong> {qq.correctAnswer}</p>
                      <p className="fb-mistake">⚠ {feedback[i].mistake}</p>
                      <p className="fb-explain">💡 {feedback[i].explanation}</p>
                      {feedback[i].pointsToCover?.length > 0 && (
                        <div className="fb-points">
                          <span>Topics to review:</span>
                          {feedback[i].pointsToCover.map((pt, j) => <span key={j} className="pt-tag">{pt}</span>)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="score-actions">
            <button className="back-btn" onClick={() => navigate('/lesson')}><ArrowLeft size={14} /> Back to Lesson</button>
            <button className="nb-submit" onClick={() => navigate('/')}>New Topic</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-wrap">
      <nav className="lesson-nav">
        <button className="back-btn" onClick={() => navigate('/lesson')}><ArrowLeft size={16} /> Lesson</button>
        <span className="progress-label">Question {current + 1} of {total}</span>
      </nav>

      <div className="progress-bar-wrap">
        <div className="progress-bar" style={{ width: `${((current) / total) * 100}%` }} />
      </div>

      <div className="question-card">
        <p className="q-number">Q{current + 1}</p>
        <h3 className="q-text">{q.question}</h3>

        <div className="options-grid">
          {q.options.map((opt, i) => {
            let cls = 'q-option';
            if (chosen) {
              if (opt === q.correctAnswer) cls += ' opt-correct';
              else if (opt === chosen) cls += ' opt-wrong';
              else cls += ' opt-dim';
            }
            return (
              <button key={i} className={cls} onClick={() => pick(opt)} disabled={!!chosen}>
                <span className="opt-letter">{String.fromCharCode(65+i)}</span>
                {opt}
              </button>
            );
          })}
        </div>

        {chosen && (
          <div className={`inline-fb ${isCorrect ? 'fb-good' : 'fb-bad'}`}>
            {isCorrect ? (
              <><CheckCircle size={18} /> <strong>Correct!</strong> Great job.</>
            ) : loadingFeedback ? (
              <><Loader size={16} className="spin" /> Analyzing your answer…</>
            ) : feedback[current] ? (
              <div className="fb-detail">
                <p><XCircle size={16} /> <strong>Not quite.</strong> {feedback[current].mistake}</p>
                <p className="fb-exp"><BookOpen size={14} /> {feedback[current].explanation}</p>
                {feedback[current].pointsToCover?.length > 0 && (
                  <div className="fb-points">
                    <span>Review these:</span>
                    {feedback[current].pointsToCover.map((pt, j) => <span key={j} className="pt-tag">{pt}</span>)}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )}

        {chosen && (
          <button className="next-btn" onClick={next}>
            {current + 1 === total ? 'See Results' : 'Next Question'} →
          </button>
        )}
      </div>
    </div>
  );
}