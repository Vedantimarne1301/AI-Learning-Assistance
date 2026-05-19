const Groq = require('groq-sdk');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { question, userAnswer, correctAnswer, topic, keyPoints } = req.body;

  if (!question || !userAnswer || !correctAnswer || !topic)
    return res.status(400).json({ error: 'Missing required fields' });

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
    const client = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const completion = await client.chat.completions.create({
      model: 'llama3-8b-8192',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.6,
      max_tokens: 600,
    });

    const raw = completion.choices[0].message.content
      .trim()
      .replace(/^```json\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();

    const parsed = JSON.parse(raw);
    return res.status(200).json(parsed);
  } catch (err) {
    console.error('Feedback error:', err.message);
    return res.status(500).json({ error: 'Could not generate feedback' });
  }
};