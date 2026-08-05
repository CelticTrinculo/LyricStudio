import { chat, streamChat } from '../services/openaiService.js';

export const definition = {
  name: 'polish',
  description: 'Review the full draft and flag weak lines, suggest sharper alternatives, and give an overall note.',
};

const SYSTEM = `You are a rigorous creative writing editor for poets and songwriters.
Return only the editorial response — no preamble, no markdown headers beyond the section labels below.`;

function buildMessages({ text, tone = '', genre = '' }) {
  const userContent = [
    'Review this draft and give a focused editorial response in exactly three sections:',
    '',
    'STRONG LINES',
    'Name 2-3 lines that are already working. For each: quote the line, then one sentence on why it earns its place.',
    '',
    'WEAK LINES',
    'Flag 2-4 lines that could be sharper. For each: quote the line, state the issue in one phrase, then give one concrete alternative.',
    '',
    'OVERALL NOTE',
    'One short paragraph on the draft\'s main opportunity — tone consistency, image freshness, structural gap, or pacing.',
    '',
    tone ? `Current tone: ${tone}` : '',
    genre ? `Genre context: ${genre}` : '',
    `Draft:\n${text.slice(0, 2500)}`,
  ].filter(Boolean).join('\n');

  return {
    messages: [{ role: 'system', content: SYSTEM }, { role: 'user', content: userContent }],
    options: { temperature: 0.55, max_completion_tokens: 800 },
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
