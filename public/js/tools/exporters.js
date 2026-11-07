import { isSectionHeaderLine, parseSectionHeader } from '../analysis.js';

const CHORDPRO_ENVIRONMENTS = [
  { pattern: /chorus/i, env: 'chorus' },
  { pattern: /verse/i, env: 'verse' },
  { pattern: /bridge/i, env: 'bridge' },
];

export function parseDraftBlocks(text = '') {
  const blocks = [];

  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim();

    if (!line) {
      blocks.push({ type: 'break' });
    } else if (isSectionHeaderLine(line)) {
      const header = parseSectionHeader(line);
      blocks.push({ type: 'section', name: header.name, label: header.label });
    } else {
      blocks.push({ type: 'line', text: line });
    }
  }

  // Collapse runs of blank lines and drop leading or trailing ones.
  return blocks.filter((block, index) => {
    if (block.type !== 'break') {
      return true;
    }

    const previous = blocks[index - 1];
    return index > 0 && index < blocks.length - 1 && previous?.type !== 'break';
  });
}

export function getDraftTitle(blocks) {
  return blocks.find((block) => block.type === 'line')?.text ?? 'Untitled lyric';
}

function escapeMarkdown(text) {
  return text.replace(/[\\`*_{}[\]<>#]/g, '\\$&');
}

export function toMarkdown(blocks) {
  const out = [];
  let stanza = [];

  const flush = () => {
    if (stanza.length) {
      // Two trailing spaces keep each lyric line on its own line in Markdown.
      out.push(stanza.map((line, index) => (index < stanza.length - 1 ? `${line}  ` : line)).join('\n'));
      stanza = [];
    }
  };

  for (const block of blocks) {
    if (block.type === 'section') {
      flush();
      out.push(`## ${escapeMarkdown(block.label)}`);
    } else if (block.type === 'break') {
      flush();
    } else {
      stanza.push(escapeMarkdown(block.text));
    }
  }

  flush();
  return `${out.join('\n\n')}\n`;
}

function sanitizeChordPro(text) {
  // Braces delimit ChordPro directives, so they cannot appear in lyric text.
  return text.replaceAll('{', '(').replaceAll('}', ')').replace(/\s+/g, ' ').trim();
}

function getChordProEnvironment(name = '') {
  return CHORDPRO_ENVIRONMENTS.find(({ pattern }) => pattern.test(name))?.env ?? null;
}

export function toChordPro(blocks, title = getDraftTitle(blocks)) {
  const out = [`{title: ${sanitizeChordPro(title)}}`, ''];
  let openEnv = null;

  const closeEnv = () => {
    if (openEnv) {
      out.push(`{end_of_${openEnv}}`, '');
      openEnv = null;
    }
  };

  for (const block of blocks) {
    if (block.type === 'section') {
      closeEnv();
      const env = getChordProEnvironment(block.name);

      if (env) {
        out.push(`{start_of_${env}: ${sanitizeChordPro(block.label)}}`);
        openEnv = env;
      } else {
        out.push(`{comment: ${sanitizeChordPro(block.label)}}`);
      }
    } else if (block.type === 'break') {
      out.push('');
    } else {
      out.push(sanitizeChordPro(block.text));
    }
  }

  closeEnv();
  return `${out.join('\n').trimEnd()}\n`;
}

export function buildPrintSheet(blocks, title = getDraftTitle(blocks)) {
  const sheet = document.createElement('article');
  const heading = document.createElement('h1');
  let stanza = null;

  sheet.id = 'print-sheet';
  sheet.setAttribute('aria-hidden', 'true');
  heading.textContent = title;
  sheet.append(heading);

  const startStanza = () => {
    stanza = document.createElement('section');
    stanza.className = 'print-stanza';
    sheet.append(stanza);
    return stanza;
  };

  for (const block of blocks) {
    if (block.type === 'section') {
      const label = document.createElement('h2');
      label.className = 'print-section-label';
      label.textContent = block.label;
      startStanza().append(label);
    } else if (block.type === 'break') {
      stanza = null;
    } else {
      const line = document.createElement('p');
      line.textContent = block.text;
      (stanza ?? startStanza()).append(line);
    }
  }

  return sheet;
}
