import { Router } from 'express';
import { z } from 'zod';
import {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask
} from '../controllers/taskController';
import { validateBody, validateParams } from '../middleware/validation';
import { CreateTaskSchema, UpdateTaskSchema } from '../models/task';

const router = Router();

// Parameter validation schema
const IdParamSchema = z.object({
  id: z.string().cuid('Invalid task ID format')
});

// GET /api/tasks - Get all tasks
router.get('/', getTasks);

// GET /api/tasks/:id - Get task by ID
router.get('/:id', validateParams(IdParamSchema), getTask);

// POST /api/tasks - Create new task
router.post('/', validateBody(CreateTaskSchema), createTask);

// PUT /api/tasks/:id - Update task
router.put(
  '/:id',
  validateParams(IdParamSchema),
  validateBody(UpdateTaskSchema),
  updateTask
);

// DELETE /api/tasks/:id - Delete task
router.delete('/:id', validateParams(IdParamSchema), deleteTask);

export default router;