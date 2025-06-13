// Export all task-related types
export * from './task';

// Export all common types
export * from './common';

// Constants that might be shared across services
export const CONSTANTS = {
  // API Endpoints
  API_ENDPOINTS: {
    TASKS: '/api/tasks',
    NLP_PARSE: '/api/nlp/parse',
    HEALTH: '/health',
  },

  // Validation Rules
  VALIDATION: {
    TASK_NAME: {
      MIN_LENGTH: 1,
      MAX_LENGTH: 255,
    },
    ASSIGNEE: {
      MIN_LENGTH: 1,
      MAX_LENGTH: 100,
    },
    NATURAL_LANGUAGE: {
      MIN_LENGTH: 5,
      MAX_LENGTH: 2000,
    },
  },

  // Default Values
  DEFAULTS: {
    PRIORITY: 'P3' as const,
    STATUS: 'todo' as const,
    DUE_TIME: '17:00',
    PAGE_SIZE: 20,
  },

  // Priority Colors for UI
  PRIORITY_COLORS: {
    P1: '#ef4444', // Red
    P2: '#f97316', // Orange
    P3: '#3b82f6', // Blue
    P4: '#6b7280', // Gray
  },

  // Status Colors for UI
  STATUS_COLORS: {
    'todo': '#6b7280',        // Gray
    'in-progress': '#f59e0b', // Yellow
    'completed': '#10b981',   // Green
  },

  // Date Formats
  DATE_FORMATS: {
    ISO: 'YYYY-MM-DD',
    DISPLAY: 'MMM DD, YYYY',
    TIME: 'HH:mm',
    TIME_12H: 'h:mm A',
    DATETIME: 'YYYY-MM-DD HH:mm',
  },

  // HTTP Status Codes
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503,
  },

  // Local Storage Keys
  STORAGE_KEYS: {
    THEME: 'task-manager-theme',
    USER_PREFERENCES: 'task-manager-preferences',
    FILTERS: 'task-manager-filters',
  },
} as const;

// Type guards for runtime type checking
export const TypeGuards = {
  isTask: (obj: any): obj is import('./task').Task => {
    return obj &&
      typeof obj.id === 'string' &&
      typeof obj.taskName === 'string' &&
      typeof obj.assignee === 'string' &&
      typeof obj.dueDate === 'string' &&
      typeof obj.dueTime === 'string' &&
      ['P1', 'P2', 'P3', 'P4'].includes(obj.priority) &&
      ['todo', 'in-progress', 'completed'].includes(obj.status);
  },

  isPriority: (value: any): value is import('./task').Priority => {
    return ['P1', 'P2', 'P3', 'P4'].includes(value);
  },

  isTaskStatus: (value: any): value is import('./task').TaskStatus => {
    return ['todo', 'in-progress', 'completed'].includes(value);
  },

  isApiResponse: (obj: any): obj is import('./common').ApiResponse => {
    return obj && typeof obj.success === 'boolean' && obj.data !== undefined;
  },
};

// Utility functions that might be shared
export const Utils = {
  // Format priority for display
  formatPriority: (priority: import('./task').Priority): string => {
    const labels = {
      P1: 'Critical',
      P2: 'High',
      P3: 'Medium',
      P4: 'Low',
    };
    return labels[priority];
  },

  // Format status for display
  formatStatus: (status: import('./task').TaskStatus): string => {
    const labels = {
      'todo': 'To Do',
      'in-progress': 'In Progress',
      'completed': 'Completed',
    };
    return labels[status];
  },

  // Get priority color
  getPriorityColor: (priority: import('./task').Priority): string => {
    return CONSTANTS.PRIORITY_COLORS[priority];
  },

  // Get status color
  getStatusColor: (status: import('./task').TaskStatus): string => {
    return CONSTANTS.STATUS_COLORS[status];
  },

  // Validate task data
  validateTask: (task: Partial<import('./task').Task>): string[] => {
    const errors: string[] = [];

    if (!task.taskName || task.taskName.length < CONSTANTS.VALIDATION.TASK_NAME.MIN_LENGTH) {
      errors.push('Task name is required');
    }

    if (!task.assignee || task.assignee.length < CONSTANTS.VALIDATION.ASSIGNEE.MIN_LENGTH) {
      errors.push('Assignee is required');
    }

    if (!task.dueDate) {
      errors.push('Due date is required');
    }

    if (!task.dueTime) {
      errors.push('Due time is required');
    }

    if (task.priority && !TypeGuards.isPriority(task.priority)) {
      errors.push('Invalid priority');
    }

    if (task.status && !TypeGuards.isTaskStatus(task.status)) {
      errors.push('Invalid status');
    }

    return errors;
  },
};