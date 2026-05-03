import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, Search, Clock } from 'lucide-react';

const MAX_HISTORY = 3;

export default function HomePage({ onSubmit, loading, error }) {
  const [topic, setTopic] = useState('');
  const [grade, setGrade] = useState(6);
  const [listening, setListening] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem('learnHistory')) || []; }
    catch { return []; }
  });
  const recognitionRef = useRef(null);

  const submit = (t, g) => {
    const finalTopic = t || topic;
    if (!finalTopic.trim()) return;
    const entry = { topic: finalTopic.trim(), grade: g || grade };
    const updated = [entry, ...history.filter(h => h.topic !== entry.topic)].slice(0, MAX_HISTORY);
    setHistory(updated);
    localStorage.setItem('learnHistory', JSON.stringify(updated));
    onSubmit(entry);
  };

  const startVoice = () => {
    setVoiceError('');
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceError('Voice search not supported in this browser. Try Chrome.');
      return;
    }
    const recog = new SpeechRecognition();
    recog.lang = 'en-US';
    recog.continuous = false;
    recog.interimResults = false;
    recog.onstart = () => setListening(true);
    recog.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setTopic(transcript);
      setListening(false);
    };
    recog.onerror = () => { setVoiceError('Could not hear you. Try again.'); setListening(false); };
    recog.onend = () => setListening(false);
    recog.start();
    recognitionRef.current = recog;
  };

  const stopVoice = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  return (
    <div className="home-wrap">
      <div className="home-hero">
        <div className="hero-badge">AI-powered</div>
        <h1 className="hero-title">Learn anything,<br /><em>your way.</em></h1>
        <p className="hero-sub">Type a topic, pick your grade, and get a full lesson with a quiz — instantly.</p>
      </div>

      <div className="form-notebook">
        <div className="notebook-line-wrap">
          <label className="nb-label">What do you want to learn?</label>
          <div className="input-row">
            <input
              className="nb-input"
              placeholder="e.g. Photosynthesis, World War II, Gravity…"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submit()}
              disabled={loading || listening}
            />
            <button
              className={`voice-btn ${listening ? 'listening' : ''}`}
              type="button"
              onClick={listening ? stopVoice : startVoice}
              title={listening ? 'Stop listening' : 'Search by voice'}
            >
              {listening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
          </div>
          {listening && <p className="voice-hint">🎙 Listening… speak your topic</p>}
          {voiceError && <p className="voice-err">{voiceError}</p>}
        </div>

        <div className="notebook-line-wrap">
          <label className="nb-label">Grade level</label>
          <div className="grade-pills">
            {[4,5,6,7,8,9,10,11,12].map(g => (
              <button
                key={g}
                className={`grade-pill ${grade === g ? 'active' : ''}`}
                onClick={() => setGrade(g)}
                type="button"
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {error && <div className="nb-error">{error}</div>}

        <button
          className="nb-submit"
          onClick={() => submit()}
          disabled={loading || !topic.trim()}
        >
          {loading ? <span className="spin-dot" /> : <Search size={16} />}
          {loading ? 'Generating lesson…' : 'Generate my lesson'}
        </button>

        {history.length > 0 && (
          <div className="recent-wrap">
            <span className="recent-label"><Clock size={12} /> Recent</span>
            {history.map((h, i) => (
              <button key={i} className="recent-chip" onClick={() => { setTopic(h.topic); setGrade(h.grade); }}>
                {h.topic} · G{h.grade}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}