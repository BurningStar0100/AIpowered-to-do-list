import { useEffect } from 'react';
import { useTaskStore } from '../store/taskStore';

export const useTasks = () => {
  const {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    parseTasks,
    clearError,
  } = useTaskStore();

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    parseTasks,
    clearError,
    refetch: fetchTasks,
  };
};