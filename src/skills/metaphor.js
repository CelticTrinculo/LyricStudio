import { chat, streamChat } from '../services/openaiService.js';
import { buildSystemPrompt, extractContext } from '../services/promptBuilder.js';

export const definition = {
  name: 'metaphor',
  description: 'Generate compact metaphor ideas for a phrase or emotion.',
};

function buildMessages({ text, emotion = '', genre = '', contextLines = [] }) {
  const context = extractContext(contextLines);
  const system = buildSystemPrompt({ genre });

  const userContent = [
    'Generate 5 compact metaphor ideas for the selected text or emotion.',
    'Return them as a numbered list. Each metaphor on its own line — no explanation.',
    'Make each metaphor distinct: vary the domain (nature, body, architecture, sound, time).',
    emotion ? `Emotion to emphasize: ${emotion}` : '',
    `Selected text: ${text}`,
    context ? `Nearby lines for context:\n${context}` : '',
  ].filter(Boolean).join('\n\n');

  return {
    messages: [{ role: 'system', content: system }, { role: 'user', content: userContent }],
    options: { temperature: 0.9, max_completion_tokens: 400 },
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
