import { chat, streamChat } from '../services/openaiService.js';
import { buildSystemPrompt } from '../services/promptBuilder.js';

export const definition = {
  name: 'titles',
  description: 'Generate song or poem title ideas from the draft content.',
};

function buildMessages({ text, tone = '', genre = '' }) {
  const system = buildSystemPrompt({ tone, genre });

  const userContent = [
    'Generate 6 distinct title ideas for the draft below.',
    'Each title should be short (1–5 words), evocative, and match the piece\'s emotional register.',
    'Return as a numbered list. No explanation — just the titles.',
    tone ? `Tone: ${tone}` : '',
    genre ? `Genre: ${genre}` : '',
    `Draft:\n${text.slice(0, 1500)}`,
  ].filter(Boolean).join('\n\n');

  return {
    messages: [{ role: 'system', content: system }, { role: 'user', content: userContent }],
    options: { temperature: 0.92, max_completion_tokens: 250 },
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
