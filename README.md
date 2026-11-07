# Lyric Studio

Lyric Studio is a lightweight creative-writing app for poets, lyricists, and songwriters. It combines a focused line-based editor, practical revision tools, whole-draft analysis, and optional AI assistance designed to spark ideas without taking over the writing.

> Official Live home: [lyricstudio.trinculo.xyz](https://lyricstudio.trinculo.xyz)

## Highlights

- **Line-based writing studio** with numbered lines and quick navigation
- **Local-first writing tools** for rhymes, syllables, clichés, and draft analysis
- **AI-assisted creative tools** for rewrites, imagery, metaphors, idea sparks, and parody
- **Autosave protection** with one-hour local draft recovery
- **Import, export, and copy** tools for moving drafts in and out quickly
- **Light / dark / system theme support**
- **Responsive single-page app** built with plain HTML, CSS, and JavaScript

## Feature overview

### Writing workspace

- Clean central editor for poetry and lyrics
- Line-number gutter aligned with the draft
- Hover any line for its syllable count — or hold a line number on touchscreens
- Keyboard shortcut hints and writing-focused controls
- Save draft as `.txt`
- Load `.txt` drafts back into the editor
- Copy the full draft to the clipboard
- **Export menu** — print / PDF lyric sheet (clean black-on-white layout with section headings), ChordPro (`.cho`), and Markdown (`.md`)

### Creative tools

- **Rhyme finder** with perfect and near rhymes from the free [Datamuse](https://www.datamuse.com/api/) API (only the selected word is sent), plus safe RhymeZone link-outs and a built-in fallback list when Datamuse is unavailable
- **Word Finder** for synonyms, antonyms, and "means like" ideas for a selected word or phrase (Datamuse)
- **Syllable counter** for line-by-line sound checks
- **Rewriter** for alternate phrasings and tone changes
- **Imagery expander** for more vivid lines
- **Metaphor generator** for fresh comparisons
- **Idea Starter** modal for section-specific line sparks
- **Parody** tool that turns the whole draft into a playful parody on a new subject

### Analysis tools

- Repetition spotting
- Sound-device spotting: alliteration, assonance, consonance, and internal rhymes, shown line by line (spelling-based, so treat it as a guide)
- Cliché detection
- Cadence and line-shape insights
- Section labels ([Verse], [Chorus], [Pre-Chorus], [Bridge], [Intro], [Outro]…) with per-section stats
- Per-stanza rhyme-scheme detection (AABB, ABAB…)
- Structural cues to help read the draft at a glance

### AI behaviour

Lyric Studio uses AI as a **creative partner**, not an auto-writer. The goal is to generate options, fragments, and prompts that the writer can cherry-pick from.

If no valid OpenAI API key is configured, the app still works and uses lightweight local fallbacks for AI-assisted features where possible.

## Tech stack

- **Bun**
- **Express 5**
- **OpenAI JavaScript SDK**
- **Vanilla HTML / CSS / JavaScript** frontend

## Getting started

### Requirements

- Bun 1.x

### Installation

1. Install dependencies:
   - `bun install`
2. Copy the example environment file:
   - `cp .env.example .env`
3. Update `.env` with your real OpenAI API key if you want AI features enabled.
4. Start the app:
   - `bun run start`
5. Open:
   - `http://localhost:3000`

For development with automatic restarts:

- `bun run dev`

## Environment variables

The project includes `.env.example` with the expected values:

- `OPENAI_API_KEY` — required for live OpenAI-assisted tools
- `OPENAI_MODEL` — model to use for assistant requests, example default: `gpt-5.4-mini`
- `PORT` — server port, defaults to `3000`

## Available scripts

- `bun run start` — start the production-style server
- `bun run dev` — run the server in watch mode

## Project structure

- `src/server.js` — Express server and AI API endpoints
- `public/index.html` — main app shell
- `public/styles.css` — app styling and theme system
- `public/js/` — editor, UI, analysis, and tool logic
- `public/js/tools/datamuse.js` — browser client for Datamuse rhyme and word lookups
- `public/js/tools/soundDevices.js` — alliteration, assonance, consonance, and internal-rhyme detection
- `public/js/tools/exporters.js` — Markdown, ChordPro, and print-sheet export

## API notes

Lyric Studio exposes a small internal API for the frontend:

- `GET /api/health` — reports server and AI availability
- `POST /api/assist` — handles AI-assisted writing requests

## Deployment notes

- The app serves the static frontend directly from Express.
- It can be deployed to any Bun-compatible host or VPS with environment variables configured.
- When you point your domain later, the intended public URL is:
  - `https://lyricstudio.trinculo.xyz`

## License

This project is licensed under the **Apache License 2.0**. See [`LICENSE`](./LICENSE).

## Support Me

- Ko-fi: <https://ko-fi.com/hbidamian> — The project is free, but AI usage is paid for out of pocket. If you fancy chucking in a quid or two, that would be lovely.
