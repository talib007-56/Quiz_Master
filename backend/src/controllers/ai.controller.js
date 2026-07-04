const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

exports.explainAnswer = async (req, res) => {
  try {
    const { questionStatement, options, correctOption, subject, chapter } = req.body;

    if (!questionStatement || !options || correctOption === undefined) {
      return res.status(400).json({ message: 'questionStatement, options, and correctOption are required' });
    }

    const optionLabels = ['A', 'B', 'C', 'D'];
    const optionsList = options.map((opt, i) => `${optionLabels[i]}) ${opt}`).join('\n');
    const correctLabel = optionLabels[correctOption - 1];

    const prompt = `You are a helpful tutor for BCA (Bachelor of Computer Application) students at University of Ladakh.

A student just answered the following exam question:

Subject: ${subject || 'BCA'}
Topic: ${chapter || 'General'}

Question: ${questionStatement}

Options:
${optionsList}

Correct Answer: ${correctLabel}) ${options[correctOption - 1]}

Please provide a clear, student-friendly explanation:
1. Why the correct answer (${correctLabel}) is right
2. Why each of the other options is incorrect
3. A brief summary of the underlying concept

Keep your explanation concise and easy to understand for a BCA student.`;

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      messages: [{ role: 'user', content: prompt }]
    });

    const explanation = message.content[0].text;

    res.status(200).json({ explanation });
  } catch (error) {
    console.error('AI explanation error:', error);
    res.status(500).json({ message: 'Failed to generate explanation', error: error.message });
  }
};

exports.generateQuestions = async (req, res) => {
  try {
    const { subject, chapter, count = 5, difficulty = 'medium' } = req.body;

    if (!subject || !chapter) {
      return res.status(400).json({ message: 'subject and chapter are required' });
    }

    const prompt = `You are an expert BCA exam question creator for University of Ladakh.

Generate exactly ${count} multiple-choice questions for:
- Subject: ${subject}
- Topic/Chapter: ${chapter}
- Difficulty: ${difficulty}

Return ONLY a valid JSON array with this exact structure (no extra text):
[
  {
    "question_title": "Short title",
    "question_statement": "Full question text",
    "option1": "First option",
    "option2": "Second option",
    "option3": "Third option",
    "option4": "Fourth option",
    "correct_option": 1
  }
]

Rules:
- correct_option must be a number 1-4 indicating which option is correct
- Questions must be relevant to BCA syllabus
- All options must be plausible
- No duplicate questions`;

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }]
    });

    const text = message.content[0].text;

    let questions;
    try {
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      questions = JSON.parse(jsonMatch ? jsonMatch[0] : text);
    } catch {
      return res.status(500).json({ message: 'AI returned invalid JSON', raw: text });
    }

    res.status(200).json({ questions, count: questions.length });
  } catch (error) {
    console.error('AI question generation error:', error);
    res.status(500).json({ message: 'Failed to generate questions', error: error.message });
  }
};
