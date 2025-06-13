export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

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