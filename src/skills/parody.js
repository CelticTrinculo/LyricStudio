import { chat, streamChat } from '../services/openaiService.js';
import { buildSystemPrompt } from '../services/promptBuilder.js';

export const definition = {
  name: 'parody',
  description: 'Turn the current draft into a playful parody on a different subject.',
};

function buildMessages({ text = '', topic = '', words = '', tone = '', genre = '' }) {
  const system = buildSystemPrompt({ tone, genre });

  const source = text.trim()
    ? `Original draft:
${text.slice(0, 2000)}`
    : 'No source draft was provided — write a short, self-aware parody-style lyric on the topic instead, weaving the required words in naturally.';

  const userContent = [
    'The writer wants a parody of their existing draft.',
    'Mirror the original closely: keep the same number of lines, the same line lengths and rhythm, the same rhyme scheme, and the same emotional arc — but shift the subject matter to the new topic.',
    'The parody should wink at the original without mocking the writer or being cruel to anyone.',
    'Keep every included word or phrase woven in naturally — never list them or call them out.',
    'Return only the parody lyrics, line for line. No preamble, no explanation, and no labels like "Parody:" or "Version:".',
    topic ? `What the parody should be about: ${topic}` : '',
    words ? `Words or phrases that must appear in the parody: ${words}` : '',
    source,
  ].filter(Boolean).join('\n\n');

  return {
    messages: [{ role: 'system', content: system }, { role: 'user', content: userContent }],
    options: { temperature: 0.9, max_completion_tokens: 900 },
  };
}

export async function run(params) {
  const { messages, options } = buildMessages(params);
  return chat(messages, options);
}

export async function* stream(params) {
  const { messages, options } = buildMessages(params);
  yield* streamChat(messages, options);
}
