const { generateLearningContent } = require('./services/groqService');
const { validateAndParse, paraphraseSummary } = require('./services/processingService');

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { topic, grade } = req.body;

  if (!topic || !topic.trim())
    return res.status(400).json({ error: 'Topic is required' });
  if (!grade || isNaN(grade) || grade < 1 || grade > 12)
    return res.status(400).json({ error: 'Grade must be a number between 1 and 12' });

  try {
    const rawResponse = await generateLearningContent(topic, grade);
    const parsed = validateAndParse(rawResponse);
    const simplifiedSummary = paraphraseSummary(parsed.summary, parseInt(grade));

    return res.status(200).json({
      topic,
      grade,
      summary: parsed.summary,
      simplifiedSummary,
      keyPoints: parsed.keyPoints,
      quiz: parsed.quiz,
    });
  } catch (err) {
    console.error('Error:', err.message);
    return res.status(500).json({ error: err.message || 'Failed to generate content' });
  }
};