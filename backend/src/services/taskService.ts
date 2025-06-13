import { prisma } from '../config/database';
import { CreateTaskRequest, UpdateTaskRequest, Priority, TaskStatus } from '../models/task';

// Convert Prisma enum to our string enum
const mapPrismaStatus = (status: any): TaskStatus => {
  switch (status) {
    case 'TODO': return 'todo';
    case 'IN_PROGRESS': return 'in-progress';
    case 'COMPLETED': return 'completed';
    default: return 'todo';
  }
};

const mapStringStatusToPrisma = (status: TaskStatus) => {
  switch (status) {
    case 'todo': return 'TODO';
    case 'in-progress': return 'IN_PROGRESS';
    case 'completed': return 'COMPLETED';
    default: return 'TODO';
  }
};

export class TaskService {
  async getAllTasks() {
    const tasks = await prisma.task.findMany({
      orderBy: [
        { priority: 'asc' },
        { dueDate: 'asc' },
        { dueTime: 'asc' }
      ]
    });

    return tasks.map(task => ({
      ...task,
      status: mapPrismaStatus(task.status)
    }));
  }

  async getTaskById(id: string) {
    const task = await prisma.task.findUnique({
      where: { id }
    });

    if (!task) {
      throw new Error('Task not found');
    }

    return {
      ...task,
      status: mapPrismaStatus(task.status)
    };
  }

  async createTask(data: CreateTaskRequest) {
    const task = await prisma.task.create({
      data: {
        taskName: data.taskName,
        assignee: data.assignee,
        dueDate: data.dueDate,
        dueTime: data.dueTime,
        priority: data.priority as any,
        status: 'TODO'
      }
    });

    return {
      ...task,
      status: mapPrismaStatus(task.status)
    };
  }

  async updateTask(id: string, data: UpdateTaskRequest) {
    const updateData: any = { ...data };
    
    if (data.status) {
      updateData.status = mapStringStatusToPrisma(data.status);
    }

    const task = await prisma.task.update({
      where: { id },
      data: updateData
    });

    return {
      ...task,
      status: mapPrismaStatus(task.status)
    };
  }

  async deleteTask(id: string) {
    await prisma.task.delete({
      where: { id }
    });
  }

  async createMultipleTasks(tasks: CreateTaskRequest[]) {
    const createdTasks = await Promise.all(
      tasks.map(task => this.createTask(task))
    );
    
    return createdTasks;
  }
}