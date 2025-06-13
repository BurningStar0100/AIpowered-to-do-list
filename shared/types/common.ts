// Generic API Response Structure
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  errors?: ApiError[];
  pagination?: PaginationInfo;
  timestamp?: string;
}

// Error Types
export interface ApiError {
  field?: string;
  message: string;
  code?: string;
}

export interface ValidationError extends ApiError {
  field: string;
  value?: any;
  constraint?: string;
}

// Pagination
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginationRequest {
  page?: number;
  limit?: number;
}

// Generic List Response
export interface ListResponse<T> {
  items: T[];
  pagination: PaginationInfo;
}

// Loading States
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// Generic Resource State
export interface ResourceState<T> {
  data: T | null;
  loading: LoadingState;
  error: string | null;
  lastUpdated?: string;
}

// HTTP Methods
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// Environment Types
export type Environment = 'development' | 'staging' | 'production';

// Application Configuration
export interface AppConfig {
  environment: Environment;
  version: string;
  apiUrl: string;
  nlpServiceUrl: string;
  features: {
    dragAndDrop: boolean;
    bulkOperations: boolean;
    analytics: boolean;
    notifications: boolean;
  };
  limits: {
    maxTasksPerUser: number;
    maxTaskNameLength: number;
    maxAssigneeNameLength: number;
    maxNaturalLanguageLength: number;
  };
}

// User/Authentication Types (for future use)
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'admin' | 'manager' | 'user';

// Notification Types
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  action: () => void;
  type: 'primary' | 'secondary';
}

// Theme and UI
export type Theme = 'light' | 'dark' | 'system';

export interface UIState {
  theme: Theme;
  sidebarCollapsed: boolean;
  notifications: Notification[];
  loading: {
    global: boolean;
    operations: Record<string, boolean>;
  };
}

// Search and Query
export interface SearchQuery {
  term: string;
  fields?: string[];
  filters?: Record<string, any>;
  sort?: {
    field: string;
    direction: 'asc' | 'desc';
  };
}

export interface SearchResult<T> {
  items: T[];
  total: number;
  query: SearchQuery;
  facets?: Record<string, Array<{ value: string; count: number }>>;
}

// Date and Time Utilities
export interface DateRange {
  start: string; // ISO date string
  end: string;   // ISO date string
}

export type DateFormat = 'ISO' | 'US' | 'EU' | 'RELATIVE';
export type TimeFormat = '12h' | '24h';

// Form Types
export interface FormField<T = any> {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'select' | 'textarea' | 'date' | 'time' | 'checkbox';
  required: boolean;
  placeholder?: string;
  defaultValue?: T;
  options?: Array<{ value: T; label: string }>;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    custom?: (value: T) => string | null;
  };
}

export interface FormState<T = Record<string, any>> {
  values: T;
  errors: Record<keyof T, string>;
  touched: Record<keyof T, boolean>;
  isValid: boolean;
  isSubmitting: boolean;
}

// Service Health
export interface ServiceHealth {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  details?: Record<string, any>;
  dependencies?: Array<{
    name: string;
    status: 'up' | 'down';
    responseTime?: number;
  }>;
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type OptionalExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;