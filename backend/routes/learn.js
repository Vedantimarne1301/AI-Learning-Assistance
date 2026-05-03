const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { generateLearningContent } = require('../services/groqService');
const { validateAndParse, paraphraseSummary } = require('../services/processingService');

router.post(
  '/learn',
  [
    body('topic').trim().notEmpty().withMessage('Topic is required'),
    body('grade')
      .isInt({ min: 1, max: 12 })
      .withMessage('Grade must be a number between 1 and 12'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ error: errors.array()[0].msg });

    const { topic, grade } = req.body;

    try {
      const rawResponse = await generateLearningContent(topic, grade);
      const parsed = validateAndParse(rawResponse);
      const simplifiedSummary = paraphraseSummary(parsed.summary, parseInt(grade));

      return res.json({
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
  }
);

router.post('/feedback', [
  body('question').notEmpty(),
  body('userAnswer').notEmpty(),
  body('correctAnswer').notEmpty(),
  body('topic').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

  const { question, userAnswer, correctAnswer, topic, keyPoints } = req.body;

  const prompt = `
A student answered a quiz question incorrectly on the topic "${topic}".

Question: ${question}
Student's answer: ${userAnswer}
Correct answer: ${correctAnswer}
Key points from the lesson: ${keyPoints?.join(', ') || 'not provided'}

Give a helpful, friendly explanation in 3 parts. Respond ONLY with valid JSON, no extra text:
{
  "mistake": "In 1-2 sentences, explain specifically why their answer was wrong",
  "explanation": "In 2-3 sentences, explain the correct concept clearly for a student",
  "pointsToCover": ["specific topic to review 1", "specific topic to review 2", "specific topic to review 3"]
}
`;

  try {
    const Groq = require('groq-sdk');
    const client = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const completion = await client.chat.completions.create({
      model: 'llama3-8b-8192',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.6,
      max_tokens: 600,
    });

    const raw = completion.choices[0].message.content.trim()
      .replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
    const parsed = JSON.parse(raw);
    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: 'Could not generate feedback' });
  }
});

module.exports = router;