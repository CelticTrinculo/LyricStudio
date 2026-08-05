import { chat, streamChat } from '../services/openaiService.js';
import {
  buildSystemPrompt,
  normalizeRhymePattern,
  extractContext,
  RHYME_EXAMPLES,
} from '../services/promptBuilder.js';
import logger from '../utils/logger.js';

export const definition = {
  name: 'ideas',
  description: 'Generate lyric ideas or fragments for a given topic, mood, or form.',
};

// Resolves to { messages, options } — runs planner first if rhyme-constrained.
async function resolveMessages({
  text = '', part = '', tone = '', genre = '', format = '',
  mood = '', perspective = '', anchor = '', lineCount = 1,
  rhymePattern = '', contextLines = [],
} = {}) {
  const normalizedLineCount = Math.min(4, Math.max(1, Number.parseInt(lineCount, 10) || 1));
  const normalized = normalizeRhymePattern(rhymePattern, normalizedLineCount);
  const context = extractContext(contextLines);
  const shared = { text, part, tone, genre, format, mood, perspective, anchor, context, lineCount: normalizedLineCount };

  if (normalized) {
    const plans = await planEndWords({ ...shared, rhymePattern: normalized });
    if (plans?.length) {
      return buildConstrainedMessages({ ...shared, rhymePattern: normalized, plans });
    }
  }

  return buildDirectMessages(shared);
}

export async function run(params) {
  const { messages, options } = await resolveMessages(params);
  return chat(messages, options);
}

export async function* stream(params) {
  const { messages, options } = await resolveMessages(params);
  yield* streamChat(messages, options);
}

function buildDirectMessages({ text, part, tone, genre, format, mood, perspective, anchor, context, lineCount }) {
  const system = buildSystemPrompt({ tone, genre, lineCount });

  const userContent = [
    'The writer is looking for inspiration, not a finished piece.',
    `Generate exactly 6 distinct lyric ideas or short fragments with exactly ${lineCount} line${lineCount > 1 ? 's' : ''} per idea.`,
    'Format as a numbered list. Each idea on its own block.',
    'Do not write a full verse, chorus, poem, or explanation.',
    'Keep each idea open-ended enough for the writer to continue from.',
    part ? `Target section / use-case: ${part}` : '',
    format ? `Writing form: ${format}` : '',
    genre ? `Genre: ${genre}` : '',
    text ? `What they want to write about: ${text}` : '',
    mood ? `Mood / atmosphere: ${mood}` : '',
    perspective ? `Voice / perspective: ${perspective}` : '',
    anchor ? `Image, phrase, or detail to weave in: ${anchor}` : '',
    context ? `Existing draft context:\n${context}` : '',
  ].filter(Boolean).join('\n\n');

  return {
    messages: [{ role: 'system', content: system }, { role: 'user', content: userContent }],
    options: { temperature: 0.9, max_completion_tokens: 800 },
  };
}

async function planEndWords({ text, part, format, genre, mood, anchor, rhymePattern, lineCount }) {
  const example = RHYME_EXAMPLES[rhymePattern] ?? `matching letters share a perfect rhyme`;
  const topic = [text, mood, anchor].filter(Boolean).join(' / ');

  const plannerUser = [
    `Commit to end-words for 6 lyric ideas, each with ${lineCount} line${lineCount > 1 ? 's' : ''}, following rhyme scheme ${rhymePattern}.`,
    `Example for ${rhymePattern}: ${example}`,
    '',
    'Rules:',
    '- Matching letters = PERFECT rhyme (identical ending vowel+consonant sounds). No slant rhyme.',
    '- Non-matching letters must NOT rhyme with each other. No reusing end-words across ideas.',
    '- End-words must feel natural for the subject.',
    '',
    topic ? `Topic / mood: ${topic}` : '',
    part ? `Section: ${part}` : '',
    format ? `Form: ${format}` : '',
    genre ? `Genre: ${genre}` : '',
    '',
    `Return JSON only: {"ideas": [{"endWords": [...]}, ...]} — 6 objects, each with ${lineCount} end-word(s).`,
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
      { temperature: 0.3, max_completion_tokens: 400, json: true },
    );
    return JSON.parse(planJson)?.ideas;
  } catch {
    logger.warn({ rhymePattern }, 'Ideas planner phase failed, falling back to direct');
    return null;
  }
}

function buildConstrainedMessages({ text, part, tone, genre, format, mood, perspective, anchor, context, lineCount, plans }) {
  const endWordInstructions = plans
    .slice(0, 6)
    .map((p, i) => `Idea ${i + 1} end-words (in line order): ${(p.endWords ?? []).join(', ')}`)
    .join('\n');

  const system = buildSystemPrompt({ tone, genre });

  const writerUser = [
    `Write 6 lyric ideas, each with exactly ${lineCount} line${lineCount > 1 ? 's' : ''}.`,
    'Use EXACTLY the committed end-words for each idea — do not change them.',
    'Keep each idea distinct, suggestive, and open-ended for the writer to continue from.',
    'Do not write a full verse, chorus, poem, or explanation.',
    tone ? `Apply ${tone} tone throughout.` : '',
    '',
    endWordInstructions,
    '',
    text ? `Topic: ${text}` : '',
    mood ? `Mood: ${mood}` : '',
    anchor ? `Anchor image/phrase: ${anchor}` : '',
    perspective ? `Voice / perspective: ${perspective}` : '',
    part ? `Target section: ${part}` : '',
    format ? `Form: ${format}` : '',
    genre ? `Genre: ${genre}` : '',
    context ? `Existing draft context:\n${context}` : '',
    '',
    'Format: numbered list, one idea per number, each on its own block.',
  ].filter(Boolean).join('\n');

  return {
    messages: [{ role: 'system', content: system }, { role: 'user', content: writerUser }],
    options: { temperature: 0.88, max_completion_tokens: 900 },
  };
}
