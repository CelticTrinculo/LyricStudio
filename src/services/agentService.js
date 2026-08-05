import { getSkill } from '../skills/registry.js';
import { isAiAvailable, getAiModel } from './openaiService.js';
import { ValidationError, ExternalServiceError } from '../utils/errors.js';
import logger from '../utils/logger.js';

export async function runAgent({ tool, ...skillParams }) {
  if (!isAiAvailable()) {
    return {
      available: false,
      reason: 'missing',
      model: null,
    };
  }

  const skill = getSkill(tool);

  if (!skill) {
    throw new ValidationError(`Unknown skill: "${tool}"`);
  }

  logger.info({ tool }, 'Agent dispatching to skill');

  const result = await skill.run(skillParams);

  if (!result) {
    throw new ExternalServiceError('The AI returned an empty response.');
  }

  logger.info({ tool, model: getAiModel() }, 'Skill completed');

  return {
    available: true,
    model: getAiModel(),
    result,
  };
}
