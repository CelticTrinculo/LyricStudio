import { Router } from 'express';
import { validateAssistRequest } from '../middleware/validate.js';
import { getSkill } from '../skills/registry.js';
import { isAiAvailable, getAiModel } from '../services/openaiService.js';
import logger from '../utils/logger.js';

const router = Router();

router.post('/stream', validateAssistRequest, async (req, res) => {
  if (!isAiAvailable()) {
    res.status(503).json({ error: 'AI tools are not available. Please configure a valid OPENAI_API_KEY.' });
    return;
  }

  const { tool, ...skillParams } = req.body;
  const skill = getSkill(tool);

  if (!skill) {
    res.status(400).json({ error: `Unknown skill: "${tool}"` });
    return;
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  const send = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`);

  // Fallback for skills that don't implement stream()
  const streamFn = skill.stream
    ? (p) => skill.stream(p)
    : async function* (p) { yield await skill.run(p); };

  logger.info({ tool, requestId: req.requestId }, 'AI stream request');

  try {
    for await (const delta of streamFn(skillParams)) {
      send({ delta });
    }
    send({ done: true, model: getAiModel() });
  } catch (err) {
    logger.error({ err, tool }, 'Stream error');
    send({ error: err.message || 'Stream failed.' });
  } finally {
    res.end();
  }
});

export default router;
