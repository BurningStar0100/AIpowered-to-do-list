import axios from 'axios';
import { Task, CreateTaskRequest, UpdateTaskRequest } from '../types/task';
import { ApiResponse, ParseTasksRequest, ParseTasksResponse } from '../types/api';
import { API_ENDPOINTS } from '../utils/constants';

const api = axios.create({
  baseURL: 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const taskApi = {
  // Get all tasks
  getTasks: async (): Promise<Task[]> => {
    const response = await api.get<ApiResponse<Task[]>>(API_ENDPOINTS.TASKS);
    return response.data.data;
  },

  // Create a new task
  createTask: async (task: CreateTaskRequest): Promise<Task> => {
    const response = await api.post<ApiResponse<Task>>(API_ENDPOINTS.TASKS, task);
    return response.data.data;
  },

  // Update a task
  updateTask: async (task: UpdateTaskRequest): Promise<Task> => {
    const response = await api.put<ApiResponse<Task>>(`${API_ENDPOINTS.TASKS}/${task.id}`, task);
    return response.data.data;
  },

  // Delete a task
  deleteTask: async (id: string): Promise<void> => {
    await api.delete(`${API_ENDPOINTS.TASKS}/${id}`);
  },

  // Parse natural language input
  parseTasks: async (text: string): Promise<ParseTasksResponse> => {
    const response = await api.post<ApiResponse<ParseTasksResponse>>(
      API_ENDPOINTS.PARSE_TASKS,
      { text } as ParseTasksRequest
    );
    return response.data.data;
  },
};