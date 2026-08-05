import * as rewrite from './rewrite.js';
import * as imagery from './imagery.js';
import * as ideas from './ideas.js';
import * as metaphor from './metaphor.js';
import * as titles from './titles.js';
import * as polish from './polish.js';
import * as rhyme from './rhyme.js';

const SKILLS = { rewrite, imagery, ideas, metaphor, titles, polish, rhyme };

export function getSkill(name) {
  return SKILLS[name] ?? null;
}

export function listSkills() {
  return Object.values(SKILLS).map((s) => s.definition);
}
