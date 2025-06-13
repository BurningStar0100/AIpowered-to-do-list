export interface Task {
  id: string;
  taskName: string;
  assignee: string;
  dueDate: string;
  dueTime: string;
  priority: Priority;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
}

export type Priority = 'P1' | 'P2' | 'P3' | 'P4';

export type TaskStatus = 'todo' | 'in-progress' | 'completed';

export interface CreateTaskRequest {
  taskName: string;
  assignee: string;
  dueDate: string;
  dueTime: string;
  priority: Priority;
}

export interface UpdateTaskRequest extends Partial<CreateTaskRequest> {
  id: string;
  status?: TaskStatus;
}