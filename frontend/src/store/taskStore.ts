import { create } from 'zustand';
import { Task, CreateTaskRequest, UpdateTaskRequest, Priority } from '../types/task';
import { taskApi } from '../services/api';

interface TaskStore {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchTasks: () => Promise<void>;
  createTask: (task: CreateTaskRequest) => Promise<void>;
  updateTask: (task: UpdateTaskRequest) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  parseTasks: (text: string) => Promise<void>;
  clearError: () => void;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  loading: false,
  error: null,

  fetchTasks: async () => {
    set({ loading: true, error: null });
    try {
      const tasks = await taskApi.getTasks();
      set({ tasks, loading: false });
    } catch (error) {
      set({ error: 'Failed to fetch tasks', loading: false });
    }
  },

  createTask: async (taskData: CreateTaskRequest) => {
    set({ loading: true, error: null });
    try {
      const newTask = await taskApi.createTask(taskData);
      set(state => ({
        tasks: [...state.tasks, newTask],
        loading: false
      }));
    } catch (error) {
      set({ error: 'Failed to create task', loading: false });
    }
  },

  updateTask: async (taskData: UpdateTaskRequest) => {
    set({ loading: true, error: null });
    try {
      const updatedTask = await taskApi.updateTask(taskData);
      set(state => ({
        tasks: state.tasks.map(task => 
          task.id === updatedTask.id ? updatedTask : task
        ),
        loading: false
      }));
    } catch (error) {
      set({ error: 'Failed to update task', loading: false });
    }
  },

  deleteTask: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await taskApi.deleteTask(id);
      set(state => ({
        tasks: state.tasks.filter(task => task.id !== id),
        loading: false
      }));
    } catch (error) {
      set({ error: 'Failed to delete task', loading: false });
    }
  },

  parseTasks: async (text: string) => {
    set({ loading: true, error: null });
    try {
      const response = await taskApi.parseTasks(text);
      const tasksToCreate = response.tasks.map(task => ({
        taskName: task.taskName,
        assignee: task.assignee,
        dueDate: task.dueDate,
        dueTime: task.dueTime,
        priority: task.priority as Priority,
      }));

      // Create all parsed tasks
      for (const taskData of tasksToCreate) {
        await get().createTask(taskData);
      }
      
      set({ loading: false });
    } catch (error) {
      set({ error: 'Failed to parse tasks', loading: false });
    }
  },

  clearError: () => set({ error: null }),
}));