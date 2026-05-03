const Groq = require('groq-sdk');
const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function generateLearningContent(topic, grade) {
  const prompt = `
You are an educational content generator. Generate structured learning content for the topic "${topic}" for a grade ${grade} student.

Respond ONLY with a valid JSON object in this exact structure, no extra text:
{
  "summary": "A clear explanation of the topic suitable for grade ${grade}",
  "keyPoints": [
    "Point 1",
    "Point 2",
    "Point 3",
    "Point 4",
    "Point 5"
  ],
  "quiz": [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option A"
    },
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option B"
    },
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option C"
    }
  ]
}
`;

  const completion = await client.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 1500,
  });

  return completion.choices[0].message.content;
}

module.exports = { generateLearningContent };