import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validateAssistRequest } from '../middleware/validate.js';
import { runAgent } from '../services/agentService.js';
import { isAiAvailable } from '../services/openaiService.js';
import { ServiceUnavailableError } from '../utils/errors.js';
import logger from '../utils/logger.js';

const router = Router();

router.post(
  '/assist',
  validateAssistRequest,
  asyncHandler(async (req, res) => {
    const {
      tool,
      text,
      part,
      tone,
      emotion,
      format,
      mood,
      perspective,
      anchor,
      topic,
      words,
      lineCount,
      rhymePattern,
      contextLines,
    } = req.body;

    if (!isAiAvailable()) {
      throw new ServiceUnavailableError(
        'AI tools are not available. Please configure a valid OPENAI_API_KEY.',
      );
    }

    logger.info({ tool, requestId: req.requestId }, 'AI assist request');

    const { result, model } = await runAgent({
      tool,
      text,
      part,
      tone,
      emotion,
      format,
      mood,
      perspective,
      anchor,
      topic,
      words,
      lineCount,
      rhymePattern,
      contextLines,
    });

    res.json({ result, model, source: 'openai' });
  }),
);

export default router;
