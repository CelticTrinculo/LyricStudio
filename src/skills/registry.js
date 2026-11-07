import * as rewrite from './rewrite.js';
import * as imagery from './imagery.js';
import * as ideas from './ideas.js';
import * as metaphor from './metaphor.js';
import * as titles from './titles.js';
import * as polish from './polish.js';
import * as rhyme from './rhyme.js';
import * as parody from './parody.js';

const SKILLS = { rewrite, imagery, ideas, metaphor, titles, polish, rhyme, parody };

export function getSkill(name) {
  return SKILLS[name] ?? null;
}
