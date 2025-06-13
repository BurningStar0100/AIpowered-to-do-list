import { z } from 'zod';

// Validation schemas
export const PrioritySchema = z.enum(['P1', 'P2', 'P3', 'P4']);
export const StatusSchema = z.enum(['todo', 'in-progress', 'completed']);

export const CreateTaskSchema = z.object({
  taskName: z.string().min(1, 'Task name is required').max(255, 'Task name too long'),
  assignee: z.string().min(1, 'Assignee is required').max(100, 'Assignee name too long'),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  dueTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:MM)'),
  priority: PrioritySchema.default('P3'),
});

export const UpdateTaskSchema = z.object({
  taskName: z.string().min(1).max(255).optional(),
  assignee: z.string().min(1).max(100).optional(),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  dueTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  priority: PrioritySchema.optional(),
  status: StatusSchema.optional(),
});

export const ParseTasksSchema = z.object({
  text: z.string().min(1, 'Text input is required'),
});

// TypeScript types
export type Priority = z.infer<typeof PrioritySchema>;
export type TaskStatus = z.infer<typeof StatusSchema>;
export type CreateTaskRequest = z.infer<typeof CreateTaskSchema>;
export type UpdateTaskRequest = z.infer<typeof UpdateTaskSchema>;
export type ParseTasksRequest = z.infer<typeof ParseTasksSchema>;

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ParsedTask {
  taskName: string;
  assignee: string;
  dueDate: string;
  dueTime: string;
  priority: string;
}

export interface ParseTasksResponse {
  tasks: ParsedTask[];
}