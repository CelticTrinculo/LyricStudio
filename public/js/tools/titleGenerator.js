import { requestAssistant } from '../api.js';
import { stripInlineMarkdownFormatting } from '../textCleanup.js';

const TITLE_STOP_WORDS = new Set([
  'the',
  'and',
  'for',
  'with',
  'that',
  'this',
  'your',
  'from',
  'into',
  'over',
  'like',
  'have',
  'when',
  'then',
  'they',
  'them',
  'their',
  'there',
  'where',
  'what',
  'are',
  'was',
  'were',
  'will',
  'just',
  'only',
  'but',
  'our',
  'out',
  'all',
  'too',
  'not',
  'had',
  'has',
  'his',
  'her',
  'its',
  'who',
  'why',
  'how',
  'can',
  'let',
  'get',
  'got',
  'off',
  'a',
  'an',
  'it',
  'i',
  'you',
  'me',
  'we',
  'us',
  'so',
  'if',
  'as',
  'at',
  'by',
  'on',
  'to',
  'of',
  'in',
  'is',
  'be',
]);

function cleanTitleLine(line = '') {
  return stripInlineMarkdownFormatting(
    line.replace(/^\s*(?:[-*]|\d+[.)])\s*/, '').replace(/[.,!?;:"'()]+$/g, '').trim(),
  );
}

function cleanTitleList(text) {
  const seen = new Set();
  const titles = [];

  for (const line of text.split('\n')) {
    const title = cleanTitleLine(line);

    if (!title || title.length > 48) {
      continue;
    }

    const key = title.toLowerCase();

    if (!seen.has(key)) {
      seen.add(key);
      titles.push(title);
    }

    if (titles.length === 6) {
      break;
    }
  }

  return titles;
}

function capitalize(value = '') {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
}

function localTitles(text) {
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) {
    return [];
  }

  const clean = (value) => cleanTitleLine(value);
  const first = clean(lines[0]);
  const last = clean(lines[lines.length - 1]);

  const words = text.toLowerCase().match(/[a-z][a-z']{2,}/g) || [];
  const counts = new Map();

  for (const word of words) {
    if (!TITLE_STOP_WORDS.has(word)) {
      counts.set(word, (counts.get(word) || 0) + 1);
    }
  }

  let topWord = '';
  let topCount = 0;

  for (const [word, count] of counts) {
    if (count > topCount) {
      topWord = word;
      topCount = count;
    }
  }

  const top = topWord ? capitalize(topWord.replace(/'/g, '')) : '';
  const out = [];
  const add = (title) => {
    if (title && title.length <= 48 && !out.includes(title)) {
      out.push(title);
    }
  };

  add(first);
  add(last);
  if (top) {
    add(top);
  }
  if (top && last) {
    add(`${top} · ${last}`);
  }
  if (top && first) {
    add(`${first} · ${top}`);
  }
  if (first && last && first !== last) {
    add(`${first} / ${last}`);
  }

  return out.slice(0, 6);
}

export async function suggestTitles({ text, genre = '', aiAvailable = false }) {
  if (aiAvailable) {
    try {
      const response = await requestAssistant({
        tool: 'titles',
        text,
        genre,
      });

      return {
        source: 'openai',
        note: `Generated with ${response.model}.`,
        titles: cleanTitleList(response.result),
      };
    } catch (error) {
      return {
        source: 'fallback',
        note: error.message,
        titles: localTitles(text),
      };
    }
  }

  return {
    source: 'fallback',
    note: 'OpenAI is not configured yet, so these titles are drawn from the draft itself.',
    titles: localTitles(text),
  };
}
