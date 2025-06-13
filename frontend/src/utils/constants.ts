export const PRIORITIES = [
  { value: 'P1', label: 'P1 - Critical', color: 'text-red-600' },
  { value: 'P2', label: 'P2 - High', color: 'text-orange-600' },
  { value: 'P3', label: 'P3 - Medium', color: 'text-blue-600' },
  { value: 'P4', label: 'P4 - Low', color: 'text-gray-600' },
] as const;

export const TASK_STATUSES = [
  { value: 'todo', label: 'To Do' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
] as const;

export const API_ENDPOINTS = {
  TASKS: '/api/tasks',
  PARSE_TASKS: '/api/nlp/parse',
} as const;