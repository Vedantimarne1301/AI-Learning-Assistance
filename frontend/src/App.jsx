import { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import axios from 'axios';
import HomePage from './pages/HomePage';
import LessonPage from './pages/LessonPage';
import QuizPage from './pages/QuizPage';

export default function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lessonData, setLessonData] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async ({ topic, grade }) => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('/api/learn', { topic, grade });
      setLessonData(res.data);
      navigate('/lesson');
    } catch (e) {
      setError(e.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Routes>
      <Route path="/" element={
        <HomePage onSubmit={handleSubmit} loading={loading} error={error} />
      } />
      <Route path="/lesson" element={
        lessonData ? <LessonPage data={lessonData} onRegenerate={handleSubmit} /> : null
      } />
      <Route path="/quiz" element={
        lessonData ? <QuizPage data={lessonData} /> : null
      } />
    </Routes>
  );
}