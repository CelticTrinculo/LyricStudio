import { analyzeLines } from './tools/syllableCounter.js';
import { getEndRhymeKey, sharedSuffixLength } from './tools/rhymeFinder.js';
import { describeSoundDevices, findSoundDevices } from './tools/soundDevices.js';

const STOP_WORDS = new Set([
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
  'you',
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
  'don',
  'ain',
]);

function average(values) {
  if (!values.length) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function variance(values) {
  if (values.length < 2) {
    return 0;
  }

  const mean = average(values);
  return values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
}

function findLineBySyllableCount(lines, comparator) {
  return lines.reduce((candidate, line) => {
    if (!candidate) {
      return line;
    }

    return comparator(line.syllables, candidate.syllables) ? line : candidate;
  }, null);
}

function extractWords(text) {
  return text.toLowerCase().match(/[a-z']+/g) || [];
}

function getRepeatedWords(lines) {
  const frequencies = new Map();

  lines
    .flatMap((line) => extractWords(line.text))
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word))
    .forEach((word) => {
      frequencies.set(word, (frequencies.get(word) || 0) + 1);
    });

  return [...frequencies.entries()]
    .filter(([, count]) => count > 1)
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, 6)
    .map(([word, count]) => `${word} ×${count}`);
}

function getRepeatedEndings(lines) {
  const endings = new Map();

  lines.forEach((line) => {
    const words = extractWords(line.text);
    const endWord = words.at(-1);

    if (!endWord) {
      return;
    }

    endings.set(endWord, (endings.get(endWord) || 0) + 1);
  });

  return [...endings.entries()]
    .filter(([, count]) => count > 1)
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, 4)
    .map(([word, count]) => `${word} ×${count}`);
}

function getStanzaCount(lines) {
  let stanzaCount = 0;
  let insideStanza = false;

  lines.forEach((line) => {
    // Section labels act as stanza boundaries without counting as content.
    if (line.text.trim() && !isSectionHeaderLine(line.text)) {
      if (!insideStanza) {
        stanzaCount += 1;
        insideStanza = true;
      }

      return;
    }

    insideStanza = false;
  });

  return stanzaCount;
}

/* ---------- Section labels ---------- */

const SECTION_ALIASES = {
  // Verses and core structure
  verse: 'Verse',
  v: 'Verse',
  vrs: 'Verse',
  vse: 'Verse',
  chorus: 'Chorus',
  c: 'Chorus',
  ch: 'Chorus',
  hook: 'Hook',
  h: 'Hook',
  hk: 'Hook',
  prechorus: 'Pre-Chorus',
  pre: 'Pre-Chorus',
  pc: 'Pre-Chorus',
  pch: 'Pre-Chorus',
  prehook: 'Pre-Hook',
  postchorus: 'Post-Chorus',
  post: 'Post-Chorus',
  posthook: 'Post-Hook',
  bridge: 'Bridge',
  b: 'Bridge',
  br: 'Bridge',
  brg: 'Bridge',
  middleeight: 'Middle Eight',
  middle: 'Middle Eight',
  mid: 'Middle Eight',
  m8: 'Middle Eight',
  mid8: 'Middle Eight',
  refrain: 'Refrain',
  finalchorus: 'Final Chorus',
  lastchorus: 'Last Chorus',
  repeatchorus: 'Chorus (Repeat)',
  repeatverse: 'Verse (Repeat)',
  // Beginnings, endings, and breaks
  intro: 'Intro',
  in: 'Intro',
  opening: 'Opening',
  prologue: 'Prologue',
  outro: 'Outro',
  out: 'Outro',
  ending: 'Ending',
  epilogue: 'Epilogue',
  coda: 'Coda',
  tag: 'Tag',
  fadein: 'Fade In',
  fadeout: 'Fade Out',
  interlude: 'Interlude',
  intermission: 'Intermission',
  break: 'Break',
  pause: 'Pause',
  stop: 'Stop',
  // Instrumental and performance moments
  solo: 'Solo',
  instrumental: 'Instrumental',
  instrumentalbreak: 'Instrumental Break',
  head: 'Head',
  vamp: 'Vamp',
  turnaround: 'Turnaround',
  breakdown: 'Breakdown',
  drop: 'Drop',
  buildup: 'Build-Up',
  riser: 'Riser',
  lift: 'Lift',
  keychange: 'Key Change',
  modulation: 'Modulation',
  // Vocal textures
  adlib: 'Ad-Libs',
  adlibs: 'Ad-Libs',
  vocal: 'Vocals',
  vocals: 'Vocals',
  backingvocals: 'Backing Vocals',
  harmony: 'Harmonies',
  harmonies: 'Harmonies',
  acapella: 'A Cappella',
  acappella: 'A Cappella',
  chant: 'Chant',
  callresponse: 'Call & Response',
  freestyle: 'Freestyle',
  spoken: 'Spoken',
  spokenword: 'Spoken Word',
  skit: 'Skit',
  sample: 'Sample',
  scratch: 'Scratch',
  // Longer forms
  movement: 'Movement',
  act: 'Act',
  scene: 'Scene',
  section: 'Section',
  part: 'Part',
};

const SECTION_NUMBER_PATTERN = /^(?:#?\d+|i{1,3}|iv|v|vi{0,3}|ix|x|one|two|three|four|five|six|seven|eight|nine|ten|[a-h])$/i;

const SECTION_REPEAT_PATTERNS = [
  /^(.*?)[\s(]*[x×]\s*(\d+)\s*[)]*$/i, // "Chorus x2", "Chorus ×2", "Chorus (x2)"
  /^(.*?)[\s(]*(\d+)\s*[x×]\s*[)]*$/i, // "Chorus 2x", "Chorus (2x)"
];
const SECTION_WORD_REPEAT_PATTERN = /^(.*?)\s+(twice|thrice)$/i;

function findRepeatMarker(value, requireBracket = false) {
  for (const pattern of SECTION_REPEAT_PATTERNS) {
    const match = value.match(pattern);

    if (match && match[1].trim() && (!requireBracket || match[1].includes('['))) {
      return {
        text: match[1].trim(),
        repeatCount: Number.parseInt(match[2], 10),
      };
    }
  }

  return null;
}

function normalizeSectionName(value = '') {
  return value
    .toLowerCase()
    .replace(/and/g, '')
    .replace(/[\s\-&/,:;.!…]+/g, '');
}

function formatSectionNumber(value = '') {
  if (!value) {
    return '';
  }

  // Romans (II, VII) and letter suffixes (A, B) read uppercase.
  if (/^[ivx]+$/i.test(value) || /^[a-h]$/i.test(value)) {
    return value.toUpperCase();
  }

  // Word numbers read capitalized (One, Two…).
  if (/^[a-z]+$/i.test(value)) {
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
  }

  return value;
}

export function parseSectionHeader(text = '') {
  let working = text.trim();
  let repeatCount = null;

  // Repeat markers outside the brackets: "[Chorus] (x2)", "[Chorus] ×2", "[Chorus] (2x)".
  const outsideRepeat = findRepeatMarker(working, true);

  if (outsideRepeat) {
    working = outsideRepeat.text;
    repeatCount = outsideRepeat.repeatCount;
  }

  if (!working.startsWith('[') || !working.endsWith(']')) {
    return null;
  }

  let inner = working.slice(1, -1).trim();

  // LRC-style leading timestamps: "[00:12.34][Verse 1]".
  inner = inner
    .replace(/^\s*\[?\d{1,3}:\d{2}(?:[.,]\d{1,3})?\]?\s*/, '')
    .replace(/^\[+|\]+$/g, '')
    .trim();

  if (!inner) {
    return null;
  }

  // Repeat markers inside the brackets: "[Chorus x2]", "[Chorus ×2]", "[Chorus 2x]".
  const insideRepeat = findRepeatMarker(inner);

  if (insideRepeat) {
    inner = insideRepeat.text;
    repeatCount ??= insideRepeat.repeatCount;
  } else {
    const wordRepeat = inner.match(SECTION_WORD_REPEAT_PATTERN);

    if (wordRepeat) {
      inner = wordRepeat[1].trim();
      repeatCount ??= wordRepeat[2].toLowerCase() === 'twice' ? 2 : 3;
    }
  }

  const parts = inner.split(/\s+/);
  let number = null;
  let namePart = inner;

  // Numeric, roman, or letter suffixes: "Verse 2", "Verse II", "Verse A".
  if (parts.length > 1 && SECTION_NUMBER_PATTERN.test(parts.at(-1))) {
    number = parts.at(-1).replace(/^#/, '');
    namePart = parts.slice(0, -1).join(' ');
  }

  // Compact forms: "V2", "Chorus3", "PC1".
  if (!number) {
    const compactMatch = namePart.match(/^([a-z]+)(\d+)$/i);

    if (compactMatch && SECTION_ALIASES[normalizeSectionName(compactMatch[1])]) {
      number = compactMatch[2];
      namePart = compactMatch[1];
    }
  }

  const canonicalName = SECTION_ALIASES[normalizeSectionName(namePart)];

  if (!canonicalName) {
    return null;
  }

  let numberLabel = formatSectionNumber(number);

  // "Middle 8" and "Middle Eight" already carry their number in the name.
  if (numberLabel && ['middle', 'mid'].includes(normalizeSectionName(namePart)) && /^(?:8|eight)$/i.test(numberLabel)) {
    numberLabel = '';
  }

  const label = numberLabel ? `${canonicalName} ${numberLabel}` : canonicalName;

  return {
    name: canonicalName,
    number: numberLabel || null,
    label: repeatCount ? `${label} ×${repeatCount}` : label,
    repeatCount,
  };
}

export function isSectionHeaderLine(text = '') {
  return parseSectionHeader(text) !== null;
}

function detectSections(lines) {
  if (!lines.some((line) => isSectionHeaderLine(line.text))) {
    return [];
  }

  const sections = [];
  let current = null;

  const finishCurrent = () => {
    if (current) {
      sections.push(current);
    }

    current = null;
  };

  for (const line of lines) {
    const header = parseSectionHeader(line.text);

    if (header) {
      finishCurrent();
      current = {
        name: header.name,
        number: header.number,
        label: header.label,
        firstLine: line.number,
        lastLine: line.number,
        contentLines: [],
      };
      continue;
    }

    if (line.text.trim()) {
      if (!current) {
        // Content before the first label becomes an unlabeled opening.
        current = {
          name: 'Opening',
          number: null,
          label: 'Opening',
          firstLine: line.number,
          lastLine: line.number,
          contentLines: [],
        };
      }

      current.contentLines.push(line);
      current.lastLine = line.number;
    }
  }

  finishCurrent();

  return sections.map((section) => {
    const analyzedLines = analyzeLines(section.contentLines);
    const syllableTotal = analyzedLines.reduce((sum, entry) => sum + entry.syllables, 0);
    const syllableAverage = section.contentLines.length
      ? syllableTotal / section.contentLines.length
      : 0;

    return {
      name: section.name,
      label: section.label,
      firstLine: section.firstLine,
      lastLine: section.lastLine,
      lineCount: section.contentLines.length,
      syllableAverage,
    };
  });
}

/* ---------- Rhyme schemes ---------- */

function detectRhymeSchemes(lines) {
  const stanzas = [];
  let current = [];

  const flush = () => {
    if (current.length >= 2) {
      stanzas.push(current);
    }

    current = [];
  };

  for (const line of lines) {
    if (isSectionHeaderLine(line.text)) {
      flush();
      continue;
    }

    if (line.text.trim()) {
      current.push(line);
    } else {
      flush();
    }
  }

  flush();

  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  return stanzas
    .map((stanzaLines, index) => {
      const groups = [];
      const scheme = [];

      for (const line of stanzaLines) {
        const { word, key } = getEndRhymeKey(line.text);

        if (!key) {
          scheme.push('·');
          continue;
        }

        const matchingGroup = groups.find((group) => (
          group.key === key
          && (group.key.length >= 2 || sharedSuffixLength(group.word, word) >= 2)
        ));

        if (!matchingGroup) {
          groups.push({ key, word, letter: letters[groups.length] ?? '?' });
        }

        scheme.push(matchingGroup ? matchingGroup.letter : groups.at(-1).letter);
      }

      if (!groups.length) {
        return null;
      }

      const hasRhyme = scheme.some((letter, index) => (
        letter !== '·' && scheme.indexOf(letter) !== index
      ));

      if (!hasRhyme) {
        return null;
      }

      return {
        stanza: index + 1,
        scheme: scheme.join(''),
      };
    })
    .filter(Boolean);
}

const CHORUS_FAMILY = new Set(['Chorus', 'Final Chorus', 'Last Chorus', 'Chorus (Repeat)']);

function buildSectionsSummary(sections, hasSectionHeaders) {
  if (!sections.length) {
    return hasSectionHeaders
      ? 'Section labels found — add a few lines under them to see per-section stats.'
      : 'No section labels yet — add [Verse], [Chorus], [Pre-Chorus], [Bridge], [Intro], [Outro], and more on their own lines to read the draft by part.';
  }

  const flow = sections.map((section) => section.label).join(' → ');
  const chorusCount = sections.filter((section) => CHORUS_FAMILY.has(section.name)).length;
  const chorusNote = chorusCount > 1 ? ` · the chorus lands ${chorusCount}×` : '';

  return `${sections.length} section${sections.length === 1 ? '' : 's'} · ${flow}${chorusNote}.`;
}

function buildSchemeSummary(schemes) {
  if (!schemes.length) {
    return 'No clear end-rhyme patterns yet — a couplet or two and they will show up here.';
  }

  return `${schemes.length} stanza${schemes.length === 1 ? '' : 's'} with a readable rhyme scheme.`;
}

export function buildDraftAnalysis(lines) {
  const nonEmptyLines = lines.filter((line) => line.text.trim());
  // Section labels describe the draft but aren't sung content — keep them out
  // of cadence, repetition, and structure metrics (the Sections card owns them).
  const contentLines = nonEmptyLines.filter((line) => !isSectionHeaderLine(line.text));
  const hasSectionHeaders = nonEmptyLines.length > contentLines.length;
  const hasContent = contentLines.length > 0;

  if (!nonEmptyLines.length) {
    return {
      rhythmSummary: 'Add a few lines to see rhythmic balance.',
      rhythmLines: [],
      repetitionSummary: 'Repeated words and line endings will appear here.',
      repeatedWords: [],
      repeatedEndings: [],
      structureSummary: 'Line count, stanza breaks, and shape cues live here.',
      structureItems: [],
      sectionsSummary: 'Add section labels on their own lines — [Verse], [Chorus], [Pre-Chorus], [Bridge], [Intro], [Outro], and more — to read the draft by part.',
      sections: [],
      schemeSummary: 'End-rhyme patterns will appear here once a stanza takes shape.',
      schemes: [],
      soundSummary: 'Alliteration, assonance, and internal rhymes will appear here.',
      soundLines: [],
    };
  }

  const syllableLines = analyzeLines(contentLines);
  const syllableCounts = syllableLines.map((line) => line.syllables);
  const syllableAverage = average(syllableCounts);
  const rhythmVariance = variance(syllableCounts);
  const minSyllableLine = findLineBySyllableCount(syllableLines, (left, right) => left < right);
  const maxSyllableLine = findLineBySyllableCount(syllableLines, (left, right) => left > right);
  const syllableRange = (maxSyllableLine?.syllables ?? 0) - (minSyllableLine?.syllables ?? 0);
  const totalWords = contentLines.reduce((sum, line) => sum + extractWords(line.text).length, 0);
  const averageWords = hasContent ? totalWords / contentLines.length : 0;
  const stanzaCount = getStanzaCount(lines);
  const longestLine = contentLines.reduce((longest, line) => {
    if (!longest || line.text.length > longest.text.length) {
      return line;
    }

    return longest;
  }, null);
  const sections = detectSections(lines);
  const schemes = detectRhymeSchemes(lines);
  const soundDevices = hasContent ? findSoundDevices(contentLines) : { lines: [], counts: {} };

  const rhythmMood = rhythmVariance < 5
    ? 'steady and song-like'
    : rhythmVariance < 12
      ? 'loosely balanced with a natural sway'
      : 'intentionally jagged and free-form';

  return {
    rhythmSummary: hasContent
      ? `Average ${syllableAverage.toFixed(1)} syllables per content line — the draft feels ${rhythmMood}.`
      : 'Section labels found — add a few lines under them to see rhythmic balance.',
    rhythmLines: hasContent
      ? [
          { label: 'Avg. syllables / line', value: syllableAverage.toFixed(1) },
          { label: 'Rhythm range', value: `${minSyllableLine?.syllables ?? 0}–${maxSyllableLine?.syllables ?? 0} syllables` },
          {
            label: 'Tightest line',
            value: minSyllableLine ? `#${minSyllableLine.number} · ${minSyllableLine.syllables} syllables` : '—',
          },
          {
            label: 'Broadest line',
            value: maxSyllableLine ? `#${maxSyllableLine.number} · ${maxSyllableLine.syllables} syllables` : '—',
          },
          {
            label: 'Pulse swing',
            value: `${syllableRange.toFixed(0)} syllable ${syllableRange === 1 ? 'step' : 'steps'}`,
          },
        ]
      : [],
    repetitionSummary: !hasContent
      ? 'Repeated words and line endings will appear here.'
      : getRepeatedWords(contentLines).length || getRepeatedEndings(contentLines).length
        ? 'A few words or endings are recurring enough to shape the draft’s texture.'
        : 'Repetition is light right now, so the language feels relatively varied.',
    repeatedWords: hasContent ? getRepeatedWords(contentLines) : [],
    repeatedEndings: hasContent ? getRepeatedEndings(contentLines) : [],
    structureSummary: hasContent
      ? `${contentLines.length} content line${contentLines.length === 1 ? '' : 's'}, ${stanzaCount || 1} stanza${stanzaCount === 1 ? '' : 's'}, and about ${averageWords.toFixed(1)} words per active line.`
      : 'Content lines, stanza breaks, and shape cues will appear here.',
    structureItems: hasContent
      ? [
          { label: 'Total lines', value: String(lines.length) },
          { label: 'Content lines', value: String(contentLines.length) },
          ...(hasSectionHeaders ? [{ label: 'Section labels', value: String(nonEmptyLines.length - contentLines.length) }] : []),
          { label: 'Stanzas', value: String(stanzaCount || 1) },
          { label: 'Avg. words / line', value: averageWords.toFixed(1) },
          {
            label: 'Longest line',
            value: longestLine ? `#${longestLine.number} · ${longestLine.text.length} chars` : '—',
          },
        ]
      : [
          { label: 'Total lines', value: String(lines.length) },
          { label: 'Section labels', value: String(nonEmptyLines.length - contentLines.length) },
        ],
    sectionsSummary: buildSectionsSummary(sections, hasSectionHeaders),
    sections: sections.map((section) => ({
      label: section.firstLine === section.lastLine
        ? `${section.label} · #${section.firstLine}`
        : `${section.label} · #${section.firstLine}–#${section.lastLine}`,
      value: section.lineCount
        ? `${section.lineCount} line${section.lineCount === 1 ? '' : 's'} · ${section.syllableAverage.toFixed(1)} syll/line`
        : 'No lines under this label yet',
    })),
    soundSummary: hasContent
      ? describeSoundDevices(soundDevices)
      : 'Alliteration, assonance, and internal rhymes will appear here.',
    soundLines: soundDevices.lines.map((line) => ({
      label: `Line ${line.number}`,
      value: line.devices.map((device) => `${device.label}: ${device.detail}`).join(' · '),
    })),
    schemeSummary: buildSchemeSummary(schemes),
    schemes: schemes.map((scheme) => ({
      label: `Stanza ${scheme.stanza}`,
      value: scheme.scheme.split('').join(' '),
    })),
  };
}
