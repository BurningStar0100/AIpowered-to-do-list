// Core Task Interface
export interface Task {
  id: string;
  taskName: string;
  assignee: string;
  dueDate: string; // ISO date string (YYYY-MM-DD)
  dueTime: string; // Time string (HH:MM)
  priority: Priority;
  status: TaskStatus;
  createdAt: string; // ISO datetime string
  updatedAt: string; // ISO datetime string
}

// Priority Levels
export type Priority = 'P1' | 'P2' | 'P3' | 'P4';

// Task Status Types
export type TaskStatus = 'todo' | 'in-progress' | 'completed';

// Priority Options for UI Components
export interface PriorityOption {
  value: Priority;
  label: string;
  color: string;
  description: string;
}

// Task Status Options for UI Components
export interface TaskStatusOption {
  value: TaskStatus;
  label: string;
  color: string;
  description: string;
}

// Request/Response Types for API
export interface CreateTaskRequest {
  taskName: string;
  assignee: string;
  dueDate: string;
  dueTime: string;
  priority: Priority;
}

export interface UpdateTaskRequest {
  id: string;
  taskName?: string;
  assignee?: string;
  dueDate?: string;
  dueTime?: string;
  priority?: Priority;
  status?: TaskStatus;
}

// Natural Language Processing Types
export interface ParseTasksRequest {
  text: string;
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

// Task Filtering and Sorting
export interface TaskFilters {
  status?: TaskStatus[];
  priority?: Priority[];
  assignee?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
}

export type TaskSortField = 'taskName' | 'assignee' | 'dueDate' | 'priority' | 'status' | 'createdAt';
export type SortDirection = 'asc' | 'desc';

export interface TaskSortOptions {
  field: TaskSortField;
  direction: SortDirection;
}

// Task Statistics
export interface TaskStats {
  total: number;
  completed: number;
  inProgress: number;
  todo: number;
  overdue: number;
  byPriority: {
    P1: number;
    P2: number;
    P3: number;
    P4: number;
  };
  byAssignee: Record<string, number>;
}

// Task Validation Rules
export interface TaskValidationRules {
  taskName: {
    minLength: number;
    maxLength: number;
    required: boolean;
  };
  assignee: {
    minLength: number;
    maxLength: number;
    required: boolean;
  };
  dueDate: {
    required: boolean;
    futureOnly: boolean;
  };
  dueTime: {
    required: boolean;
    format: string; // HH:MM
  };
}

// Task Operations
export type TaskOperation = 'create' | 'update' | 'delete' | 'status_change' | 'bulk_update';

export interface TaskOperationResult {
  success: boolean;
  operation: TaskOperation;
  taskId?: string;
  taskIds?: string[];
  message?: string;
  errors?: string[];
}

// Bulk Operations
export interface BulkTaskOperation {
  operation: 'delete' | 'update_status' | 'update_priority' | 'update_assignee';
  taskIds: string[];
  payload?: {
    status?: TaskStatus;
    priority?: Priority;
    assignee?: string;
  };
}

export interface BulkOperationResult {
  success: boolean;
  operation: BulkTaskOperation['operation'];
  successCount: number;
  failureCount: number;
  errors: Array<{
    taskId: string;
    error: string;
  }>;
}