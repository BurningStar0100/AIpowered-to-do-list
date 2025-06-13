import { Request, Response } from 'express';
import axios from 'axios';
import { env } from '../config/env';
import { TaskService } from '../services/taskService';
import { ApiResponse, ParseTasksResponse, CreateTaskRequest, Priority } from '../models/task';
import { asyncHandler } from '../middleware/errorHandler';

const taskService = new TaskService();

export const parseTasks = asyncHandler(async (req: Request, res: Response) => {
  const { text } = req.body;
  
  try {
    // Call Python NLP service
    const nlpResponse = await axios.post(`${env.NLP_SERVICE_URL}/parse`, {
      text
    }, {
      timeout: 30000, // 30 second timeout
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const parsedData: ParseTasksResponse = nlpResponse.data;
    
    // Validate and create tasks
    const tasksToCreate: CreateTaskRequest[] = parsedData.tasks.map(task => ({
      taskName: task.taskName,
      assignee: task.assignee,
      dueDate: task.dueDate,
      dueTime: task.dueTime,
      priority: (task.priority as Priority) || 'P3'
    }));

    // Create all tasks in database
    const createdTasks = await taskService.createMultipleTasks(tasksToCreate);
    
    const response: ApiResponse<ParseTasksResponse> = {
      success: true,
      data: {
        tasks: createdTasks.map(task => ({
          taskName: task.taskName,
          assignee: task.assignee,
          dueDate: task.dueDate,
          dueTime: task.dueTime,
          priority: task.priority
        }))
      },
      message: `Successfully parsed and created ${createdTasks.length} tasks`
    };
    
    res.json(response);
    
  } catch (error) {
    console.error('NLP Service Error:', error);
    
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNREFUSED') {
        return res.status(503).json({
          success: false,
          message: 'NLP service is unavailable. Please try again later.'
        });
      }
      
      if (error.response?.status === 400) {
        return res.status(400).json({
          success: false,
          message: 'Invalid input for natural language processing'
        });
      }
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to process natural language input'
    });
  }
});