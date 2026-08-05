import { Router } from 'express';
import { getHealthStatus } from '../services/openaiService.js';

const router = Router();

router.get('/health', (_req, res) => {
  res.json(getHealthStatus());
});

export default router;
