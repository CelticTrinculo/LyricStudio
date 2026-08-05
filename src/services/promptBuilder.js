export const TONE_GUIDANCE = {
  poetic: 'Lean on luminous imagery and surprising word pairings. Sound should earn its beauty — alive, not ornate.',
  darker: 'Favor shadow, weight, and hard consonants. Edge toward what is unspoken rather than stated outright.',
  simpler: 'Plain words only. One clear thought per line. Remove any ornament that does not carry weight.',
  emotional: 'Raw and present-tense. Prioritize the ache before the image — confession, not summary.',
  hopeful: 'Forward-facing and open. Let light enter the frame without denying what the dark cost. Lift without lying.',
  nostalgic: 'Reach for specific sensory details from memory — a smell, a texture, a sound. The past should feel close enough to touch but impossible to hold.',
  haunting: 'Linger. Leave gaps the reader falls into. Repetition and near-silence are your tools — the image should stay after the line ends.',
  playful: 'Nimble and light-footed. Unexpected word pairings that surprise without straining. Wit earns its place — never at the expense of feeling.',
  defiant: 'Direct and unafraid. Short declarative lines. No hedging, no softening. The voice should feel like it is standing its ground.',
  melancholic: 'Slow and aching. Long vowels, unhurried pacing. Grief observed from the inside — precise but never overwrought.',
  tender: 'Close and unhurried. Small details that only someone paying full attention would notice. Intimacy over grandeur.',
  surreal: 'Logic bends but feeling stays true. Unexpected juxtapositions that reveal emotional truth sideways. The strange should illuminate, not just disorient.',
  triumphant: 'Expansive and earned. Lines that feel like breaking through into open air. Energy builds — the payoff must be worth the climb.',
  bittersweet: 'Two things at once: the joy and its shadow, the loss and its gift. Neither resolves the other — hold both without collapsing into one.',
};

// Per-genre conventions applied to every output when genre is set.
export const GENRE_GUIDANCE = {
  pop: {
    label: 'Pop',
    rules: [
      'Short, punchy phrases built around a single hook idea.',
      'Everyday language — accessible vocabulary, no obscure references.',
      'Lines should feel singable: smooth vowel flow, natural spoken stress.',
      'One central image or feeling should echo across the whole piece.',
    ],
  },
  hiphop: {
    label: 'Hip-hop / Rap',
    rules: [
      'Dense syllable packing — internal rhyme and multi-syllabic end-rhymes are expected.',
      'Vary line length to create rhythmic tension and release.',
      'Wordplay, double meanings, and cultural callbacks are welcome.',
      'Voice should feel present-tense and direct — address the listener head-on.',
    ],
  },
  country: {
    label: 'Country',
    rules: [
      'Ground every image in a specific, concrete detail — a truck, a road, a name, a season.',
      'Tell a story with a clear emotional arc: opening image, turn, earned resolution.',
      'Plain, honest language. Cut any ornament that rings false.',
      'A sense of place and time should be embedded in the imagery.',
    ],
  },
  rnb: {
    label: 'R&B / Soul',
    rules: [
      'Lead with emotional vulnerability — the feeling arrives before the story.',
      'Extended metaphors and sensory language set the mood, not explanation.',
      'Phrasing should feel sung: let vowels carry weight, let syllables stretch.',
      'Repetition with variation (call-and-response) builds intensity and release.',
    ],
  },
  folk: {
    label: 'Folk / Indie',
    rules: [
      'Narrative clarity — the story should be followable on first listen.',
      'Conversational register, but every word chosen with precision.',
      'Imagery drawn from ordinary life given extraordinary weight.',
      'Restraint: one strong image is worth three clever lines.',
    ],
  },
  rock: {
    label: 'Rock',
    rules: [
      'Anthemic quality — lines should feel like something to shout together.',
      'Strong, active verbs. Avoid passive or tentative phrasing.',
      'Build tension between verses and the release of a hook.',
      'Energy escalates: each section should feel more urgent than the last.',
    ],
  },
  blues: {
    label: 'Blues',
    rules: [
      'Structure: a statement, its repetition with variation, then the turn — classic backbone.',
      'Hardship and longing are the emotional core, but resilience lives underneath.',
      'Imagery of travel, weather, and the body grounds the abstraction.',
      'Plain language. The weight comes from rhythm and repetition, not ornament.',
    ],
  },
  jazz: {
    label: 'Jazz',
    rules: [
      'Allow the image to be oblique — trust the listener to feel the gap.',
      'Sophisticated vocabulary is welcome but must feel earned, not decorative.',
      'Non-linear structure: fragment, circle back, juxtapose.',
      'Rhythm is improvisational — vary line length as if playing a solo.',
    ],
  },
  gospel: {
    label: 'Gospel',
    rules: [
      'Repetition builds conviction — use it intentionally for cumulative force.',
      'Language should uplift: move from struggle toward transcendence.',
      'Call-and-response patterns invite the listener to participate.',
      'Concrete testimony (a specific lived experience) makes the spiritual feel universal.',
    ],
  },
  poetry: {
    label: 'Poetry',
    rules: [
      'Line breaks are meaningful — where a line ends shapes what is felt.',
      'Compression over explanation: trust the image to carry the emotion.',
      'Sound patterning (assonance, consonance) should be intentional throughout.',
      'Prefer the unexpected word choice over the obvious one.',
    ],
  },
  sonnet: {
    label: 'Sonnet',
    rules: [
      'Fourteen lines divided into an octave (8) and a sestet (6), or three quatrains and a couplet.',
      'The volta — a turn in argument or feeling — must land at the sestet or final couplet.',
      'Iambic stress pattern preferred: soft-HARD, soft-HARD — feel the pulse in every line.',
      'End on a couplet that closes the argument with epigrammatic force.',
    ],
  },
};

// Universal craft baseline applied to every output regardless of genre/tone.
const CRAFT_BASELINE = [
  'Show emotion through image and action — do not state the feeling outright.',
  'Prefer specific, concrete nouns over vague abstractions.',
  'Active verbs carry more weight than passive construction or adjective stacks.',
  'Avoid clichés; if a familiar phrase appears, subvert it.',
].join('\n• ');

export const RHYME_EXAMPLES = {
  AA: '"home / alone" → home and alone share an A rhyme.',
  AB: '"sky / rain" → sky (A) and rain (B) do not rhyme — correct for AB.',
  AAA: '"fire / desire / wire" → all three end on the same rhyme.',
  AAB: '"fire / desire / rain" → fire and desire share A; rain stands alone as B.',
  ABA: '"gone / light / dawn" → gone and dawn share A; light stands alone as B.',
  ABB: '"gone / night / light" → gone stands alone as A; night and light share B.',
  AAAA: '"fire / desire / wire / inspire" → all four end on the same rhyme.',
  AABB: '"away / stay / free / see" → away and stay share A; free and see share B.',
  ABAB: '"rain / night / pain / light" → rain and pain share A; night and light share B.',
  ABBA: '"night / dream / gleam / light" → night and light share A; dream and gleam share B.',
};

export function normalizeRhymePattern(rhymePattern = '', lineCount = 1) {
  const normalizedLineCount = Math.min(4, Math.max(1, Number.parseInt(lineCount, 10) || 1));
  const trimmedRhymePattern = typeof rhymePattern === 'string' ? rhymePattern.trim().toUpperCase() : '';

  return trimmedRhymePattern.length === normalizedLineCount && /^[A-Z]+$/.test(trimmedRhymePattern)
    ? trimmedRhymePattern
    : '';
}

export function buildRhymeConstraint(rhymePattern, lineCount) {
  const example = RHYME_EXAMPLES[rhymePattern]
    ?? `e.g. for ${rhymePattern}: choose end-words where matching letters share a perfect rhyme.`;

  return [
    `RHYME SCHEME ▸ Every ${lineCount}-line idea MUST follow the ${rhymePattern} scheme.`,
    '• Lines sharing a letter (A, B, etc.) must end on a perfect, exact rhyme. No slant rhyme, near rhyme, or assonance.',
    '• Lines with different letters must NOT rhyme with each other. Repeating the same end-word is also forbidden.',
    `• Process: for each idea, first commit to end-words that satisfy ${rhymePattern} (${example}), then write the full lines using those committed end-words. Do not output an idea whose end-words fail the scheme.`,
  ].join('\n');
}

export function buildToneConstraint(tone) {
  const normalizedTone = tone.trim().toLowerCase();
  const guidance = TONE_GUIDANCE[normalizedTone]
    ?? `Apply the '${tone}' quality throughout — in word choice, pacing, and the feeling each line leaves behind.`;

  return [
    `TONE ▸ Every variation must be unmistakably ${tone}.`,
    guidance,
    `Verify the ${tone} quality is present in word choice, rhythm, and emotional register before outputting.`,
  ].join('\n');
}

export function buildGenreConstraint(genre) {
  const entry = GENRE_GUIDANCE[genre.trim().toLowerCase()];

  if (!entry) {
    return `GENRE ▸ Write with the conventions and sensibility of the ${genre} genre.`;
  }

  return [
    `GENRE ▸ Write for the ${entry.label} genre. These conventions apply:`,
    ...entry.rules.map((r) => `• ${r}`),
  ].join('\n');
}

export function buildSystemPrompt({ rhymePattern = '', tone = '', genre = '', lineCount = 1 } = {}) {
  const rules = [
    rhymePattern ? buildRhymeConstraint(rhymePattern, lineCount) : '',
    tone ? buildToneConstraint(tone) : '',
    genre ? buildGenreConstraint(genre) : '',
  ].filter(Boolean);

  return [
    'You are Lyric Studio, a creative writing assistant for poets and songwriters.',
    'Return only the requested output — no explanation, no preamble, no markdown headers.',
    '',
    rules.length
      ? `[ACTIVE RULES — these take priority over all other instructions]\n${rules.join('\n\n')}\n[END RULES]`
      : '',
    '',
    `Craft principles (always apply):\n• ${CRAFT_BASELINE}`,
    '',
    'Keep all output lyrical, distinct, and open enough for the writer to continue from.',
  ].join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

export function extractContext(contextLines = []) {
  return contextLines
    .filter((line) => line && line.trim())
    .slice(0, 8)
    .join('\n');
}


