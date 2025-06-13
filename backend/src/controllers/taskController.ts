import { Request, Response } from 'express';
import { TaskService } from '../services/taskService';
import { ApiResponse } from '../models/task';
import { asyncHandler } from '../middleware/errorHandler';

const taskService = new TaskService();

export const getTasks = asyncHandler(async (req: Request, res: Response) => {
  const tasks = await taskService.getAllTasks();
  
  const response: ApiResponse<typeof tasks> = {
    success: true,
    data: tasks,
    message: 'Tasks retrieved successfully'
  };
  
  res.json(response);
});

export const getTask = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const task = await taskService.getTaskById(id);
  
  const response: ApiResponse<typeof task> = {
    success: true,
    data: task,
    message: 'Task retrieved successfully'
  };
  
  res.json(response);
});

export const createTask = asyncHandler(async (req: Request, res: Response) => {
  const task = await taskService.createTask(req.body);
  
  const response: ApiResponse<typeof task> = {
    success: true,
    data: task,
    message: 'Task created successfully'
  };
  
  res.status(201).json(response);
});

export const updateTask = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const task = await taskService.updateTask(id, req.body);
  
  const response: ApiResponse<typeof task> = {
    success: true,
    data: task,
    message: 'Task updated successfully'
  };
  
  res.json(response);
});

export const deleteTask = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await taskService.deleteTask(id);
  
  const response: ApiResponse<null> = {
    success: true,
    data: null,
    message: 'Task deleted successfully'
  };
  
  res.json(response);
});