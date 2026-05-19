// Data Processing Layer: validates, sanitizes, and paraphrases AI output

function validateAndParse(rawText) {
  // Strip markdown code fences if present
  let cleaned = rawText.trim();
  cleaned = cleaned.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (e) {
    // Attempt to extract JSON object from mixed text
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('AI response could not be parsed as JSON');
    parsed = JSON.parse(match[0]);
  }

  // Validate structure
  if (!parsed.summary || typeof parsed.summary !== 'string')
    throw new Error('Missing or invalid summary');
  if (!Array.isArray(parsed.keyPoints) || parsed.keyPoints.length < 3)
    throw new Error('keyPoints must be an array with at least 3 items');
  if (!Array.isArray(parsed.quiz) || parsed.quiz.length < 3)
    throw new Error('quiz must have at least 3 questions');

  for (const q of parsed.quiz) {
    if (!q.question || !Array.isArray(q.options) || q.options.length !== 4 || !q.correctAnswer)
      throw new Error('Each quiz question must have question, 4 options, and correctAnswer');
  }

  return parsed;
}

function paraphraseSummary(summary, grade) {
  // Rule-based simplification layer
  let simplified = summary
    .replace(/\b(utilize|utilizes)\b/gi, 'use')
    .replace(/\b(consequently)\b/gi, 'so')
    .replace(/\b(therefore)\b/gi, 'so')
    .replace(/\b(furthermore)\b/gi, 'also')
    .replace(/\b(in addition)\b/gi, 'also')
    .replace(/\b(however)\b/gi, 'but')
    .replace(/\b(subsequently)\b/gi, 'then')
    .replace(/\b(prior to)\b/gi, 'before')
    .replace(/\b(in order to)\b/gi, 'to')
    .replace(/\b(a large number of)\b/gi, 'many')
    .replace(/\b(demonstrates)\b/gi, 'shows')
    .replace(/\b(require[sd]?)\b/gi, 'need$1');

  // For younger grades, add a friendly prefix
  if (grade <= 6) {
    simplified = `Here's a simple way to think about it: ${simplified}`;
  } else if (grade <= 9) {
    simplified = `Let's break this down: ${simplified}`;
  }

  return simplified;
}

module.exports = { validateAndParse, paraphraseSummary };