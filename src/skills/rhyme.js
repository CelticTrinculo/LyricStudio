import { chat, streamChat } from '../services/openaiService.js';

export const definition = {
  name: 'rhyme',
  description: 'Find contextually appropriate rhymes for a word, matched to genre and tone.',
};

const SYSTEM = 'You are a rhyme consultant for a lyric writing assistant. Output only the requested list — no explanation, no preamble.';

function buildMessages({ text, tone = '', genre = '' }) {
  // Use the last word of the selection as the target
  const target = text.trim().split(/\s+/).at(-1).replace(/[^a-z']/gi, '').toLowerCase();

  const userContent = [
    `Find rhymes for the word: "${target}"`,
    '',
    'Return two labeled groups:',
    'PERFECT RHYMES — 6-8 words sharing the exact ending vowel+consonant sound.',
    'NEAR RHYMES — 6-8 words with a similar but not identical ending sound.',
    '',
    tone ? `Tone context: ${tone} — prefer words that fit this emotional register.` : '',
    genre ? `Genre context: ${genre} — prefer vocabulary natural to this genre.` : '',
    'Words only in each group, comma-separated.',
  ].filter(Boolean).join('\n');

  return {
    messages: [{ role: 'system', content: SYSTEM }, { role: 'user', content: userContent }],
    options: { temperature: 0.45, max_completion_tokens: 250 },
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
