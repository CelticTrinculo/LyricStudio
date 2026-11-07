const TONE_GUIDANCE = {
  poetic: 'Lean on luminous imagery and surprising word pairings. Sound should earn its beauty — alive, not ornate.',
  darker: 'Favor shadow, weight, and hard consonants. Edge toward what is unspoken rather than stated outright.',
  simpler: 'Plain words only. One clear thought per line. Remove any ornament that does not carry weight.',
  emotional: 'Raw and present-tense. Prioritize the ache before the image — confession, not summary.',
  hopeful: 'Forward-facing and open. Let light enter the frame without denying what the dark cost. Lift without lying.',
  nostalgic: 'Reach for specific sensory details from memory — a smell, a texture, a sound. The past should feel close enough to touch but impossible to hold.',
  haunting: 'Linger. Leave gaps the reader falls into. Repetition and near-silence are your tools — the image should stay after the line ends.',
  playful: 'Nimble and light-footed. Unexpected word pairings that surprise without straining. Wit earns its place — never at the expense of feeling.',
  absurd: 'Embrace the ridiculous. Collide the mundane with the grandiose and follow the nonsense where it leads — the joke works because the details stay specific.',
  deadpan: 'Flat, matter-of-fact delivery. Tell the joke without winking — the humor comes from treating the absurd as completely ordinary.',
  satirical: 'Aim the wit outward — at habits, institutions, and conventions. Exaggerate until the absurdity shows, without cruelty or name-calling.',
  silly: 'Light, harmless fun. Puns, sound-play, and goofy juxtapositions — nothing pointed, nothing mean.',
  defiant: 'Direct and unafraid. Short declarative lines. No hedging, no softening. The voice should feel like it is standing its ground.',
  melancholic: 'Slow and aching. Long vowels, unhurried pacing. Grief observed from the inside — precise but never overwrought.',
  tender: 'Close and unhurried. Small details that only someone paying full attention would notice. Intimacy over grandeur.',
  surreal: 'Logic bends but feeling stays true. Unexpected juxtapositions that reveal emotional truth sideways. The strange should illuminate, not just disorient.',
  triumphant: 'Expansive and earned. Lines that feel like breaking through into open air. Energy builds — the payoff must be worth the climb.',
  bittersweet: 'Two things at once: the joy and its shadow, the loss and its gift. Neither resolves the other — hold both without collapsing into one.',
};

// Per-genre conventions applied to every output when genre is set.
const GENRE_GUIDANCE = {
  pop: {
    label: 'Pop',
    syllables: 'Common songwriting range: 4–8 syllables per line; hook lines often tighten to 3–5. Post-chorus vocable hooks ("oh-oh", "yeah") have been standard since the mid-2010s.',
    structure: 'Verse → pre-chorus → chorus → verse → pre-chorus → chorus → bridge → chorus (optional outro) is the most common modern layout. The chorus carries the hook and repeats nearly verbatim; the post-chorus — an extension or second part of the chorus — often replaces the chorus as the climax.',
    rules: [
      'Short, punchy phrases built around a single hook idea.',
      'Everyday language — accessible vocabulary, no obscure references.',
      'Lines should feel singable: smooth vowel flow, natural spoken stress.',
      'One central image or feeling should echo across the whole piece.',
    ],
  },
  kpop: {
    label: 'K-Pop',
    syllables: '6–10 syllables per line; the post-chorus chant can drop to 2–4. English phrases and vocables are common in hooks — studies of charting K-pop show a significant share of English in lyrics.',
    structure: 'Verse → pre-chorus → chorus → post-chorus (chant/hook) → verse → chorus → bridge → final chorus. The post-chorus is a K-pop hallmark (popularized through the genre); energy escalates at every chorus return.',
    rules: [
      'Hook-first writing: every line should feel engineered to land on a melody.',
      'Bright, bold emotional colors — longing, excitement, devotion — stated with confidence.',
      'Mix Korean and English naturally if it helps the hook; keep the core singable.',
      'Repetition with escalation: the chorus should hit harder each time it returns.',
    ],
  },
  hiphop: {
    label: 'Hip-hop / Rap',
    syllables: 'Lyric density has risen over decades: analysis of charting rap shows roughly 3–4 syllables per second in the 1980s climbing past 5 in the 2010s — roughly 10–14 syllables per bar at typical tempos, fewer in older styles.',
    structure: 'Verse (typically 8–16 bars of 4 beats) → hook → verse → hook → verse → outro. End-rhymes often land on the 4th beat; internal and multi-syllabic rhymes are expected.',
    rules: [
      'Dense syllable packing — internal rhyme and multi-syllabic end-rhymes are expected.',
      'Vary line length to create rhythmic tension and release.',
      'Wordplay, double meanings, and cultural callbacks are welcome.',
      'Voice should feel present-tense and direct — address the listener head-on.',
    ],
  },
  country: {
    label: 'Country',
    syllables: '6–10 syllables per line at a conversational pace.',
    structure: 'Verse → chorus → verse → chorus → bridge → final chorus. Story in three acts: opening image, turn, earned resolution. Simple harmonies keep the words front and center.',
    rules: [
      'Ground every image in a specific, concrete detail — a truck, a road, a name, a season.',
      'Tell a story with a clear emotional arc: opening image, turn, earned resolution.',
      'Plain, honest language. Cut any ornament that rings false.',
      'A sense of place and time should be embedded in the imagery.',
    ],
  },
  rnb: {
    label: 'R&B / Soul',
    syllables: '5–9 syllables per line; melismas can stretch a single syllable across several notes.',
    structure: 'Verse → pre-chorus → chorus → verse → chorus → bridge → final chorus with ad-libs. Classic R&B ballads also use 32-bar AABA form.',
    rules: [
      'Lead with emotional vulnerability — the feeling arrives before the story.',
      'Extended metaphors and sensory language set the mood, not explanation.',
      'Phrasing should feel sung: let vowels carry weight, let syllables stretch.',
      'Repetition with variation (call-and-response) builds intensity and release.',
    ],
  },
  funk: {
    label: 'Funk',
    syllables: '4–8 syllables per line, locked to the pocket; shouts and chants can be shorter.',
    structure: 'The groove IS the form: one- or two-chord vamps (often minor 7th to dominant 7th, e.g. Am7–D7) with call-and-response. Emphasize "the One" — the first beat of the bar, a signature of James Brown-era funk.',
    rules: [
      'Rhythmic phrasing first — words should lock into a groove and stay there.',
      'Playful, confident, boastful energy; wit over aggression.',
      'Call-and-response and repeated chants create the pocket.',
      'Concrete, physical imagery: bodies, streets, lights, sweat, sound.',
    ],
  },
  disco: {
    label: 'Disco',
    syllables: '4–8 syllables per line; the chorus must be chantable immediately.',
    structure: 'Four-on-the-floor verse → chorus cycle with a breakdown/instrumental before the final chorus. The hook returns with added layers — repetition builds the dance floor.',
    rules: [
      'Pure escapism — nights, lights, dancing, and desire; leave worries outside.',
      'Short, euphoric phrases built to repeat and build.',
      'Inclusive, celebratory tone — everyone is invited to the floor.',
      'The hook should be a command: move, dance, stay, shine.',
    ],
  },
  folk: {
    label: 'Folk',
    syllables: '6–10 syllables per line; narrative stanzas breathe slowly.',
    structure: 'Verse → chorus, or strophic AAA form where each verse advances the story (traditional ballads follow this).',
    rules: [
      'Narrative clarity — the story should be followable on first listen.',
      'Conversational register, but every word chosen with precision.',
      'Imagery drawn from ordinary life given extraordinary weight.',
      'Restraint: one strong image is worth three clever lines.',
    ],
  },
  singer: {
    label: 'Singer-Songwriter',
    syllables: '5–9 syllables per line; breath-sized phrases.',
    structure: 'Verse → chorus → verse → chorus → bridge → chorus. Confessional first person; the chorus summarizes the feeling the verse just earned.',
    rules: [
      'First person, confessional register — one person telling the truth.',
      'Specific personal details beat general truths every time.',
      'Quiet, acoustic imagery: porches, cars, kitchens, highways, bedrooms.',
      'A gentle arc: start small, let the feeling open up, end somewhere honest.',
    ],
  },
  rock: {
    label: 'Rock',
    syllables: '4–9 syllables per line; the chorus tightens for mass sing-along.',
    structure: 'Verse → chorus → verse → chorus → bridge → guitar solo → final chorus. In rock (and metal) a guitar solo commonly appears after the middle chorus; energy escalates to the end.',
    rules: [
      'Anthemic quality — lines should feel like something to shout together.',
      'Strong, active verbs. Avoid passive or tentative phrasing.',
      'Build tension between verses and the release of a hook.',
      'Energy escalates: each section should feel more urgent than the last.',
    ],
  },
  indie: {
    label: 'Indie / Alternative',
    syllables: '5–10 syllables per line, often uneven and conversational.',
    structure: 'Verse → chorus → verse → chorus → bridge → final chorus — subversions are welcome; odd-length sections are a feature, not a bug.',
    rules: [
      'Quirky, observant, wry — a fresh angle on an ordinary feeling.',
      'Unusual but precise word choices; avoid the first word that comes to mind.',
      'Off-center imagery and small surreal touches are welcome.',
      'Singable but not obvious: the melody should feel found, not built.',
    ],
  },
  metal: {
    label: 'Metal',
    syllables: '6–14 syllables per line depending on riff speed; verses denser, chorus declamatory.',
    structure: 'Verse → chorus → verse → chorus → solo/breakdown section → final chorus. Breakdowns (often punctuated by a bass drop) are a staple; power ballads are commonly released as the album\'s second single.',
    rules: [
      'Big, theatrical stakes — scale every image toward the epic without losing specificity.',
      'Dense, driving syllable patterns; let internal rhyme and hard consonant attacks carry momentum.',
      'Dark imagery is welcome, but it must stay concrete — a blade, a storm, a cathedral — never vague doom.',
      'Build to a hook that detonates: the chorus should feel like release after tension.',
    ],
  },
  punk: {
    label: 'Punk',
    syllables: '3–7 syllables per line — short, fast, direct.',
    structure: 'Verse → chorus → verse → chorus → chorus. No bridge, no indulgence — say it and get out. Ska-punk and 2 Tone variants add an offbeat skank feel.',
    rules: [
      'Raw, direct, and immediate — write like there is no time to be clever.',
      'Short lines, short verses: say the thing and move on.',
      'Anger and dissatisfaction are fine, but aim them at something specific, not the void.',
      'The chorus should be repeatable instantly — simple, shoutable, and slightly defiant.',
    ],
  },
  grunge: {
    label: 'Grunge',
    syllables: '4–9 syllables per line; dynamics matter more than density.',
    structure: 'Quiet verse → loud chorus, alternating; the loud-quiet dynamic contrast is the signature. Grunge largely rejected the power ballad as a genre move.',
    rules: [
      'Slouched honesty — weary, direct, and unpolished on purpose.',
      'Gritty, urban, working-class imagery; avoid glamour.',
      'Anger and numbness coexist; the feeling can be contradictory.',
      'The chorus should feel like a shout you can barely keep down.',
    ],
  },
  blues: {
    label: 'Blues',
    syllables: '8–12 syllables per line — room to bend and hold notes.',
    structure: '12-bar blues over I–IV–V with lyrics in AA′B form: statement, repeat with variation, then the turn. Eight- and sixteen-bar blues also exist.',
    rules: [
      'Structure: a statement, its repetition with variation, then the turn — classic backbone.',
      'Hardship and longing are the emotional core, but resilience lives underneath.',
      'Imagery of travel, weather, and the body grounds the abstraction.',
      'Plain language. The weight comes from rhythm and repetition, not ornament.',
    ],
  },
  jazz: {
    label: 'Jazz',
    syllables: '5–11 syllables per line; phrasing is elastic.',
    structure: '32-bar AABA (or ABAC) for standards — often preceded by a ~16-bar introductory verse; performance follows head → solos → head. Ballads may run 16 or 32 bars per section.',
    rules: [
      'Allow the image to be oblique — trust the listener to feel the gap.',
      'Sophisticated vocabulary is welcome but must feel earned, not decorative.',
      'Non-linear structure: fragment, circle back, juxtapose.',
      'Rhythm is improvisational — vary line length as if playing a solo.',
    ],
  },
  reggae: {
    label: 'Reggae',
    syllables: '4–8 syllables per line, riding the offbeat.',
    structure: 'Verse → chorus in 4/4 with staccato offbeat "skank" chords and the drum\'s emphasis on beat 3 (one drop); the bassline drives the song. Call-and-response is common.',
    rules: [
      'Laid-back, rhythmic phrasing — let words ride the offbeat, not rush it.',
      'Social commentary and personal reflection can share the same song; keep both grounded.',
      'Warm, human imagery: sun, sea, roads, work, family — the everyday made dignified.',
      'Repetition with a smile: hooks return, but the feeling deepens each time.',
    ],
  },
  ska: {
    label: 'Ska',
    syllables: '4–9 syllables per line with staccato bounce.',
    structure: 'Verse → chorus in 4/4 with a walking bassline and offbeat guitar upstrokes (skank); horns often answer the vocal line. 2 Tone added faster tempos and a harder, punk-tinged edge.',
    rules: [
      'Upbeat, driving energy with a knowing grin — serious topics, light touch.',
      'Rhythmic, staccato phrasing that bounces between beats.',
      'Community-minded: working people, solidarity, good times despite hard times.',
      'The chorus should be easy to shout along with on the first listen.',
    ],
  },
  afrobeat: {
    label: 'Afrobeat',
    syllables: '6–12 syllables per line; phrases ride a rolling, hypnotic groove.',
    structure: 'Chanted call-and-response vocals over long, polyrhythmic instrumental vamps — songs often run 10+ minutes. Politics and celebration share the space; repetition is structural.',
    rules: [
      'Groove-forward, hypnotic repetition; lines should ride a rolling rhythm.',
      'Politics and celebration can share the song — the personal is political.',
      'Pidgin and English mix naturally; keep the energy warm and insistent.',
      'Call-and-response is structural, not decorative.',
    ],
  },
  gospel: {
    label: 'Gospel',
    syllables: '5–10 syllables per line; phrases build toward a climactic lift.',
    structure: 'Verse → chorus with call-and-response throughout, building to a final chorus with ad-libs and often a key change. Testimony — a specific lived experience — anchors the song.',
    rules: [
      'Repetition builds conviction — use it intentionally for cumulative force.',
      'Language should uplift: move from struggle toward transcendence.',
      'Call-and-response patterns invite the listener to participate.',
      'Concrete testimony (a specific lived experience) makes the spiritual feel universal.',
    ],
  },
  edm: {
    label: 'Electronic / EDM',
    syllables: '3–7 syllables per phrase — short and percussive.',
    structure: 'Build-up → drop → break → build → final drop. The drop is the loudest point, preceded by a build of rising drums, repeating sounds, and volume — sometimes a bar of silence. In vocal EDM the drop lands with the chorus; since 2016 the "pop-drop" has often taken the chorus\'s place as the climax in pop.',
    rules: [
      'One euphoric hook idea repeated with variation — the drop is the destination.',
      'Short phrases that lock to a beat; syllables should hit like percussion.',
      'Big, sweeping emotions — freedom, escape, connection — stated plainly and sung big.',
      'Let repetition build: each repeat adds one layer of meaning or energy.',
    ],
  },
  lofi: {
    label: 'Lo-fi / Chill',
    syllables: '4–9 syllables per line; unhurried and soft.',
    structure: 'Verse → chorus → verse → chorus → outro. Let lines trail off rather than resolve.',
    rules: [
      'Low-pressure intimacy — write like a late-night voice memo, not a performance.',
      'Small, worn-in details (rain on glass, a cold cup, a sleeping cat) carry the mood.',
      'Soft, unhurried phrasing; let the line trail off rather than resolve.',
      'Nostalgia is the default color, but it must feel specific, not generic.',
    ],
  },
  shoegaze: {
    label: 'Shoegaze / Dream Pop',
    syllables: '5–11 syllables per line; words blur into texture.',
    structure: 'Verse → chorus → verse → chorus with blurred seams — repetition washes over the listener; meaning accumulates slowly.',
    rules: [
      'Hazy, impressionistic imagery — feelings arrive through texture and light.',
      'Vague but evocative: distance, weather, blurred memory, soft static.',
      'Repetition washes over the listener; meaning accumulates slowly.',
      'Intimate loneliness, gently — the voice buried but present.',
    ],
  },
  latin: {
    label: 'Latin / Reggaetón',
    syllables: '5–10 syllables per line, written on the beat.',
    structure: 'Verse → pre-chorus → chorus → verse → chorus → bridge → chorus over the dembow rhythm (kick on 1 and 3, snare on 2 and 4, with a driving 16th-note feel). The hook must be instantly singable.',
    rules: [
      'Rhythm is everything — phrases should feel like they were written on the beat.',
      'Danceable sensuality and playful energy are welcome; keep the imagery vivid and concrete.',
      'Bilingual touches (Spanish/English) are fine if they feel natural, not forced.',
      'The hook should be melodic and easy to sing after one listen.',
    ],
  },
  tango: {
    label: 'Tango',
    syllables: '6–11 syllables per line; sharp rhythmic snaps.',
    structure: 'Often AABA or verse → chorus in 2/4 or 4/4; themes of love, loss, and fate. The ending should snap like a closing door.',
    rules: [
      'Passion with restraint — the feeling is controlled until it cannot be.',
      'Themes of love, loss, and fate; melancholy is the native tongue.',
      'Sharp, rhythmic phrasing; images of night, city streets, and dancing.',
      'The ending should snap — a final image that closes like a door.',
    ],
  },
  musical: {
    label: 'Musical Theatre',
    syllables: '6–12 syllables per line; room for melody and breath.',
    structure: '32-bar AABA form (four 8-bar sections) is the classic Broadway shape, often preceded by a speech-like ~16-bar sectional verse. Song types: “I want” numbers, charm songs, 11 o’clock numbers.',
    rules: [
      'Write for a character in a specific moment — every line must reveal or advance who they are.',
      'Dramatic escalation: the song should feel like it is heading somewhere by the end.',
      'Clear emotional beats — the audience should be able to follow the feeling in real time.',
      'Lyrics should leave room for melody: strong vowels, singable phrases, rhythmic clarity.',
    ],
  },
  cabaret: {
    label: 'Cabaret',
    syllables: '5–10 syllables per line; wit needs room to land.',
    structure: 'Verse → chorus with direct address to the audience; torch-song intimacy. The turn matters: delight that sours, glamour that cracks.',
    rules: [
      'Winking, theatrical, and a little dangerous — perform the emotion.',
      'Direct address to the audience; the fourth wall is optional and fun.',
      'Witty, precise wordplay; elegance with an edge.',
      'The turn matters: delight that sours, glamour that cracks.',
    ],
  },
  opera: {
    label: 'Opera / Aria',
    syllables: '7–14 syllables per line; open vowels for long notes.',
    structure: 'Da capo aria: ternary ABA — a complete A section, a contrasting B (new key and mood, sometimes tempo), then A repeated with ornamentation. Arias take two strophes of 3–6 lines each; recitative (speech-like) leads into the aria.',
    rules: [
      'Heightened emotion at full scale — love, grief, vengeance, glory.',
      'Archaic, elevated diction is welcome but must stay intelligible.',
      'Each phrase should be singable over long notes: open vowels, clear consonants.',
      'Structure builds: recitative-like exposition into soaring aria-like peaks.',
    ],
  },
  ballad: {
    label: 'Power Ballad',
    syllables: '6–12 syllables per line; lines breathe for big notes.',
    structure: 'Slow tempo, verse → chorus → verse → chorus → bridge → final chorus, each return bigger; the guitar solo is often the climax (“the power”). The last chorus should feel earned.',
    rules: [
      'Big emotional stakes, sung slowly: every line should have room to breathe.',
      'Sweeping, cinematic imagery — stadiums, oceans, years, distances.',
      'Build through the verses to a soaring, anthemic chorus.',
      'The final chorus should feel earned, not automatic.',
    ],
  },
  poetry: {
    label: 'Poetry',
    syllables: 'Variable — let the form or the breath decide; a line can be a single word or a full sentence.',
    structure: 'No fixed structure; line breaks are meaningful decisions. Let sound patterning guide the shape.',
    rules: [
      'Line breaks are meaningful — where a line ends shapes what is felt.',
      'Compression over explanation: trust the image to carry the emotion.',
      'Sound patterning (assonance, consonance) should be intentional throughout.',
      'Prefer the unexpected word choice over the obvious one.',
    ],
  },
  sonnet: {
    label: 'Sonnet',
    syllables: 'Exactly 10 syllables per line in English (iambic pentameter); 12 in French (alexandrine).',
    structure: '14 lines. Italian/Petrarchan: octave (ABBAABBA) + sestet (CDECDE or CDCCDC), with the volta at line 9. English/Shakespearean: three quatrains (ABAB CDCD EFEF) + closing couplet (GG).',
    rules: [
      'Fourteen lines divided into an octave (8) and a sestet (6), or three quatrains and a couplet.',
      'The volta — a turn in argument or feeling — must land at the sestet or final couplet.',
      'Iambic stress pattern preferred: soft-HARD, soft-HARD — feel the pulse in every line.',
      'End on a couplet that closes the argument with epigrammatic force.',
    ],
  },
  spokenword: {
    label: 'Spoken Word',
    syllables: '6–16 syllables per line, driven by breath and emphasis.',
    structure: 'No fixed chorus; build via rhythm, repetition, and escalation to a landing line. Write for the voice, not the melody.',
    rules: [
      'Write for the voice and breath, not for melody.',
      'Rhythm and repetition build momentum; line breaks are pauses, not thoughts.',
      'Direct, powerful address — the listener should feel spoken to.',
      'A clear emotional arc with a landing: the last line should hit.',
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

function buildRhymeConstraint(rhymePattern, lineCount) {
  const example = RHYME_EXAMPLES[rhymePattern]
    ?? `e.g. for ${rhymePattern}: choose end-words where matching letters share a perfect rhyme.`;

  return [
    `RHYME SCHEME ▸ Every ${lineCount}-line idea MUST follow the ${rhymePattern} scheme.`,
    '• Lines sharing a letter (A, B, etc.) must end on a perfect, exact rhyme. No slant rhyme, near rhyme, or assonance.',
    '• Lines with different letters must NOT rhyme with each other. Repeating the same end-word is also forbidden.',
    `• Process: for each idea, first commit to end-words that satisfy ${rhymePattern} (${example}), then write the full lines using those committed end-words. Do not output an idea whose end-words fail the scheme.`,
  ].join('\n');
}

function buildToneConstraint(tone) {
  const normalizedTone = tone.trim().toLowerCase();
  const guidance = TONE_GUIDANCE[normalizedTone]
    ?? `Apply the '${tone}' quality throughout — in word choice, pacing, and the feeling each line leaves behind.`;

  return [
    `TONE ▸ Every variation must be unmistakably ${tone}.`,
    guidance,
    `Verify the ${tone} quality is present in word choice, rhythm, and emotional register before outputting.`,
  ].join('\n');
}

function buildGenreConstraint(genre) {
  const entry = GENRE_GUIDANCE[genre.trim().toLowerCase()];

  if (!entry) {
    return `GENRE ▸ Write with the conventions and sensibility of the ${genre} genre.`;
  }

  return [
    `GENRE ▸ Write for the ${entry.label} genre. These conventions apply:`,
    `• SYLLABLES ▸ ${entry.syllables}`,
    `• STRUCTURE ▸ ${entry.structure}`,
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


