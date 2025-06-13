import { Router } from 'express';
import { parseTasks } from '../controllers/nlpController';
import { validateBody } from '../middleware/validation';
import { ParseTasksSchema } from '../models/task';

const router = Router();

// POST /api/nlp/parse - Parse natural language input
router.post('/parse', validateBody(ParseTasksSchema), parseTasks);

export default router;