import { requestAssistant } from '../api.js';
import { stripInlineMarkdownFormatting } from '../textCleanup.js';

const PARODY_NOISE_PATTERN = /^(parody|parody version|version|title|original|note)\s*[:#-]*$/i;

function cleanParodyLine(line = '') {
  return stripInlineMarkdownFormatting(
    line.replace(/^\s*(?:[-*]|\d+[.)])\s*/, '').trim(),
  );
}

export function cleanParody(text) {
  return text
    .split('\n')
    .map(cleanParodyLine)
    .filter((line) => line && !PARODY_NOISE_PATTERN.test(line))
    .join('\n')
    .trim();
}

function localParody({ text, topic = '', words = '', tone = '' }) {
  const sourceLines = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  if (!sourceLines.length) {
    const seedWords = extraWords.length ? extraWords.join(', ') : subject;

    return [
      `Somebody told me that ${subject} would save me,`,
      `but all I got was ${seedWords} and a hole in my day.`,
      '',
      `— a ${style.toLowerCase()} parody, improvised without a source draft —`,
    ].join('\n');
  }

  const subject = topic.trim() || 'the snack drawer at 3 AM';
  const style = tone.trim() || 'playful';
  const extraWords = words
    .split(/[,\n;]+/)
    .map((word) => word.trim())
    .filter(Boolean);

  const replacements = [subject, ...extraWords];
  const swappables = [
    /\b(heart|love|soul|baby|darling)\b/gi,
    /\b(night|midnight|sky|stars|moon|sun|rain|fire|sea)\b/gi,
    /\b(dark|light|cold|wild|lonely)\b/gi,
  ];

  let replacementIndex = 0;

  const swapped = sourceLines.map((line) => {
    let out = line;

    for (const pattern of swappables) {
      out = out.replace(pattern, () => {
        const replacement = replacements[replacementIndex % Math.max(1, replacements.length)];
        replacementIndex += 1;
        return replacement;
      });
    }

    return out;
  });

  const flavorNote = style.toLowerCase() === 'deadpan' ? 'delivered straight-faced' : 'delivered with a wink';

  return [
    ...swapped,
    '',
    `— a ${style.toLowerCase()} parody of your draft, ${flavorNote} —`,
  ].join('\n');
}

export async function generateParody({
  text,
  topic = '',
  words = '',
  tone = '',
  genre = '',
  aiAvailable = false,
}) {
  if (aiAvailable) {
    try {
      const response = await requestAssistant({
        tool: 'parody',
        text,
        topic,
        words,
        tone,
        genre,
      });

      return {
        source: 'openai',
        note: `Generated with ${response.model}. Keep what lands — the original draft is untouched.`,
        parody: cleanParody(response.result),
      };
    } catch (error) {
      return {
        source: 'fallback',
        note: error.message,
        parody: localParody({ text, topic, words, tone }),
      };
    }
  }

  return {
    source: 'fallback',
    note: 'OpenAI is not configured yet, so this is a lightweight browser-side word-swap parody.',
    parody: localParody({ text, topic, words, tone }),
  };
}
