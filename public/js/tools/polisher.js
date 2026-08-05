import { requestAssistant } from '../api.js';
import { stripInlineMarkdownFormatting } from '../textCleanup.js';

export function cleanSections(text) {
  return text
    .split(/\n{2,}/)
    .map((section) => stripInlineMarkdownFormatting(section.trim()))
    .filter(Boolean)
    .slice(0, 4);
}

function countOccurrences(values) {
  const counts = new Map();

  for (const value of values) {
    const key = value.toLowerCase();

    if (key) {
      counts.set(key, (counts.get(key) || 0) + 1);
    }
  }

  return counts;
}

function findRepeatedEndings(lines) {
  const endings = lines.map((line) => {
    const words = line.text.trim().match(/[a-zA-Z']+$/);
    return words ? words[0].toLowerCase() : '';
  });
  const counts = countOccurrences(endings);

  return [...counts.entries()]
    .filter(([, count]) => count > 1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([ending, count]) => `“${ending}” ends ${count} lines`);
}

function findLongestAndShortest(lines) {
  const withLength = lines
    .map((line) => ({ line, length: line.text.trim().length }))
    .filter(({ length }) => length > 0);

  if (!withLength.length) {
    return [];
  }

  withLength.sort((a, b) => b.length - a.length);

  const longest = withLength[0];
  const shortest = withLength[withLength.length - 1];

  return [
    `The longest line is line ${longest.line.number} (${longest.length} characters). ` +
      `If it carries the emotional peak, keep it; if it just carries words, it is the first place to cut.`,
    `The shortest line is line ${shortest.line.number} (${shortest.length} characters). ` +
      `Short lines can land hard — check that it is landing on purpose.`,
  ];
}

function localEditorialNote(lines) {
  const nonEmpty = lines.filter((line) => line.text.trim());

  if (nonEmpty.length < 2) {
    return [
      'Add a few more lines before a full review — right now there is barely a shape to read.',
      'Once you have two or three stanzas, the review can say something useful about rhythm, repetition, and structure.',
    ];
  }

  const repeatedEndings = findRepeatedEndings(nonEmpty);
  const extremes = findLongestAndShortest(nonEmpty);

  return [
    `The draft has ${nonEmpty.length} written lines. That is ${nonEmpty.length <= 4 ? 'still a fragment — keep going' : nonEmpty.length <= 12 ? 'a working sketch — a full draft is within reach' : 'a substantial draft — the shape is worth protecting'}.`,
    ...extremes,
    ...(repeatedEndings.length
      ? [`Watch the line endings: ${repeatedEndings.join('; ')}. Repeats can be a deliberate hook or an accidental tic.`]
      : ['Line endings are varied — no accidental rhyme or repetition tics right now.']),
    'Overall note: read the draft aloud once. The ear will find the two or three lines worth keeping before the eye will.',
  ];
}

export async function reviewDraft({ text, genre = '', aiAvailable = false }) {
  const lines = text.split('\n').map((lineText, index) => ({
    number: index + 1,
    text: lineText,
  }));

  if (aiAvailable) {
    try {
      const response = await requestAssistant({
        tool: 'polish',
        text,
        genre,
      });

      return {
        source: 'openai',
        note: `Reviewed with ${response.model}.`,
        sections: cleanSections(response.result),
      };
    } catch (error) {
      return {
        source: 'fallback',
        note: error.message,
        sections: localEditorialNote(lines),
      };
    }
  }

  return {
    source: 'fallback',
    note: 'OpenAI is not configured yet, so this is a browser-side structural read of the draft.',
    sections: localEditorialNote(lines),
  };
}
