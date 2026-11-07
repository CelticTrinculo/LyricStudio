import { getRhymeKey } from './rhymeFinder.js';

const FUNCTION_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'of', 'to', 'in', 'on', 'at', 'by', 'for', 'with', 'from', 'into',
  'is', 'am', 'are', 'was', 'were', 'be', 'been', 'it', 'its', 'i', 'me', 'my', 'we', 'us', 'our', 'you',
  'your', 'he', 'him', 'his', 'she', 'her', 'they', 'them', 'their', 'that', 'this', 'so', 'as', 'if',
  'do', 'did', 'not', 'no', 'up', 'down', 'out', 'off', 'all', 'just', 'than', 'then', 'when', 'what',
]);

const VOWEL_PATTERN = /[aeiouy]/;

function extractWords(text = '') {
  return (text.toLowerCase().match(/[a-z']+/g) || [])
    .map((word) => word.replace(/[^a-z]/g, ''))
    .filter(Boolean);
}

function getContentWords(words) {
  return words.filter((word) => word.length > 1 && !FUNCTION_WORDS.has(word));
}

function groupBy(items, keyOf) {
  const groups = new Map();

  for (const item of items) {
    const key = keyOf(item);

    if (!key) {
      continue;
    }

    if (!groups.has(key)) {
      groups.set(key, []);
    }

    groups.get(key).push(item);
  }

  return groups;
}

function uniqueWords(words) {
  return [...new Set(words)];
}

function findAlliteration(contentWords) {
  const consonantInitial = contentWords.filter((word) => !VOWEL_PATTERN.test(word[0]));
  const devices = [];

  for (const [letter, words] of groupBy(consonantInitial, (word) => word[0])) {
    const unique = uniqueWords(words);

    if (unique.length >= 2) {
      devices.push({ type: 'alliteration', label: `Alliteration · “${letter}”`, detail: unique.join(', ') });
    }
  }

  return devices;
}

function findAssonance(contentWords) {
  const withVowel = contentWords.filter((word) => word.length >= 3 && /[aeiouy]/.test(word));
  const devices = [];

  for (const [vowel, words] of groupBy(withVowel, (word) => word.match(/[aeiouy]+/)[0])) {
    const unique = uniqueWords(words);
    // Words that share an ending are a rhyme, which is reported separately.
    const distinctEndings = new Set(unique.map(getRhymeKey));

    if (unique.length >= 2 && distinctEndings.size >= 2) {
      devices.push({ type: 'assonance', label: `Assonance · “${vowel}”`, detail: unique.join(', ') });
    }
  }

  return devices;
}

function findConsonance(contentWords) {
  const endingClusters = contentWords
    .filter((word) => word.length >= 3 && /[^aeiouy]$/.test(word))
    .map((word) => ({ word, cluster: word.match(/[^aeiouy]+$/)[0] }))
    .filter(({ cluster }) => cluster.length >= 2);
  const devices = [];

  for (const [cluster, entries] of groupBy(endingClusters, (entry) => entry.cluster)) {
    const unique = uniqueWords(entries.map((entry) => entry.word));

    if (unique.length >= 2) {
      devices.push({ type: 'consonance', label: `Consonance · “${cluster}”`, detail: unique.join(', ') });
    }
  }

  return devices;
}

function findInternalRhyme(words) {
  const last = words.at(-1);
  const lastKey = last ? getRhymeKey(last) : '';

  if (!lastKey || lastKey.length < 2) {
    return [];
  }

  const internal = uniqueWords(words.slice(0, -1).filter((word) => word !== last && getRhymeKey(word) === lastKey));

  if (!internal.length) {
    return [];
  }

  return [{ type: 'internal', label: `Internal rhyme · “${lastKey}”`, detail: `${internal.join(', ')} → ${last}` }];
}

export function findSoundDevices(lines = []) {
  const counts = { alliteration: 0, assonance: 0, consonance: 0, internal: 0 };

  const analyzed = lines.map((line) => {
    const words = extractWords(line.text);
    const contentWords = getContentWords(words);
    const devices = [
      ...findAlliteration(contentWords),
      ...findAssonance(contentWords),
      ...findConsonance(contentWords),
      ...findInternalRhyme(words),
    ];

    for (const device of devices) {
      counts[device.type] += 1;
    }

    return { number: line.number, text: line.text, devices };
  });

  return {
    lines: analyzed.filter((line) => line.devices.length),
    counts,
  };
}

const COUNT_LABELS = {
  alliteration: ['alliterative line', 'alliterative lines'],
  assonance: ['assonant line', 'assonant lines'],
  consonance: ['consonant ending', 'consonant endings'],
  internal: ['internal rhyme', 'internal rhymes'],
};

export function describeSoundDevices({ lines, counts }) {
  const parts = Object.entries(counts)
    .filter(([, count]) => count > 0)
    .map(([type, count]) => `${count} ${COUNT_LABELS[type][count === 1 ? 0 : 1]}`);

  if (!parts.length) {
    return 'No strong sound devices yet — alliteration, assonance, and internal rhymes will show up here as lines take shape.';
  }

  return `${parts.join(' · ')} across ${lines.length} line${lines.length === 1 ? '' : 's'}. Detection is spelling-based, so treat it as a guide.`;
}
