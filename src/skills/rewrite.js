import { chat, streamChat } from '../services/openaiService.js';
import {
  buildSystemPrompt,
  normalizeRhymePattern,
  extractContext,
  RHYME_EXAMPLES,
} from '../services/promptBuilder.js';
import logger from '../utils/logger.js';

export const definition = {
  name: 'rewrite',
  description: 'Rewrite a lyric line with tone and optional rhyme constraints.',
};

// Resolves to { messages, options } — runs the planner phase first if rhyme-constrained.
async function resolveMessages({ text, tone = '', genre = '', rhymePattern = '', lineCount = 1, contextLines = [] }) {
  const normalizedLineCount = Math.min(4, Math.max(1, Number.parseInt(lineCount, 10) || 1));
  const normalized = normalizeRhymePattern(rhymePattern, normalizedLineCount);
  const context = extractContext(contextLines);

  if (normalized) {
    const variations = await planEndWords({ text, rhymePattern: normalized, lineCount: normalizedLineCount, context });
    if (variations?.length) {
      return buildConstrainedMessages({ text, tone, genre, context, lineCount: normalizedLineCount, variations });
    }
  }

  return buildDirectMessages({ text, tone, genre, context });
}

export async function run(params) {
  const { messages, options } = await resolveMessages(params);
  return chat(messages, options);
}

export async function* stream(params) {
  const { messages, options } = await resolveMessages(params);
  yield* streamChat(messages, options);
}

function buildDirectMessages({ text, tone, genre, context }) {
  const system = buildSystemPrompt({ tone, genre });

  const content = [
    tone
      ? `Rewrite the selected text in a ${tone} tone while preserving its core meaning.`
      : 'Rewrite the selected text while preserving its core meaning.',
    'Return exactly 3 short variations as a numbered list. Each variation should be 1-2 lines.',
    `Selected text: ${text}`,
    context ? `Nearby lines for context:\n${context}` : '',
  ].filter(Boolean).join('\n\n');

  return {
    messages: [{ role: 'system', content: system }, { role: 'user', content }],
    options: { temperature: 0.82, max_completion_tokens: 500 },
  };
}

async function planEndWords({ text, rhymePattern, lineCount, context }) {
  const example = RHYME_EXAMPLES[rhymePattern] ?? `matching letters share a perfect rhyme`;

  const plannerUser = [
    `Commit to end-words for 3 rewrite variations of the text below.`,
    `Each variation has ${lineCount} line${lineCount > 1 ? 's' : ''}, following rhyme scheme ${rhymePattern}.`,
    `Example for ${rhymePattern}: ${example}`,
    '',
    'Rules:',
    '- Matching letters = PERFECT rhyme (identical ending vowel+consonant sounds). No slant rhyme.',
    '- Non-matching letters must NOT rhyme with each other. No reusing end-words.',
    '- End-words must fit the subject naturally.',
    '',
    `Original text: ${text}`,
    context ? `Nearby context:\n${context}` : '',
    '',
    `Return JSON only: {"variations": [{"endWords": [...]}, {"endWords": [...]}, {"endWords": [...]}]}`,
    `Each "endWords" array must have exactly ${lineCount} word(s), one per line in order.`,
  ].filter(Boolean).join('\n');

  try {
    const planJson = await chat(
      [
        {
          role: 'system',
          content: 'You are a rhyme-scheme planner for a lyric writing assistant. Output valid JSON only — no explanation, no markdown.',
        },
        { role: 'user', content: plannerUser },
      ],
      { temperature: 0.3, max_completion_tokens: 300, json: true },
    );
    return JSON.parse(planJson)?.variations;
  } catch {
    logger.warn({ rhymePattern }, 'Rewrite planner phase failed, falling back to direct');
    return null;
  }
}

function buildConstrainedMessages({ text, tone, genre, context, lineCount, variations }) {
  const endWordInstructions = variations
    .slice(0, 3)
    .map((v, i) => `Variation ${i + 1} end-words (in line order): ${(v.endWords ?? []).join(', ')}`)
    .join('\n');

  const writerUser = [
    'Rewrite the text below into 3 variations.',
    'Use EXACTLY the committed end-words listed for each variation — do not alter them.',
    tone ? `Apply ${tone} tone throughout.` : '',
    '',
    endWordInstructions,
    '',
    `Original text: ${text}`,
    context ? `Nearby context:\n${context}` : '',
    '',
    `Format: numbered list. Each variation on ${lineCount} line${lineCount > 1 ? 's' : ''}.`,
  ].filter(Boolean).join('\n');

  return {
    messages: [
      { role: 'system', content: buildSystemPrompt({ tone, genre }) },
      { role: 'user', content: writerUser },
    ],
    options: { temperature: 0.82, max_completion_tokens: 500 },
  };
}
