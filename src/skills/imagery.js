import { chat, streamChat } from '../services/openaiService.js';
import { buildSystemPrompt, extractContext } from '../services/promptBuilder.js';

export const definition = {
  name: 'imagery',
  description: 'Expand a word or phrase into vivid, sensory poetic imagery.',
};

function buildMessages({ text, genre = '', contextLines = [] }) {
  const context = extractContext(contextLines);
  const system = buildSystemPrompt({ genre });

  const userContent = [
    'Expand the selected text into vivid, sensory, poetic imagery.',
    'Return exactly 3 options. Each option should be 1 or 2 lines at most.',
    'Make each option distinct in its sensory angle — vary between visual, tactile/auditory, and emotional-abstract.',
    `Selected text: ${text}`,
    context ? `Nearby lines for context:\n${context}` : '',
  ].filter(Boolean).join('\n\n');

  return {
    messages: [{ role: 'system', content: system }, { role: 'user', content: userContent }],
    options: { temperature: 0.88, max_completion_tokens: 400 },
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
