import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit, Trash2, Clock, User } from 'lucide-react';
import { Task, Priority } from '../../types/task';
import { formatDateTime } from '../../utils/dateUtils';
import { PRIORITIES } from '../../utils/constants';
import { Button } from '../ui/Button';
import { TaskEditor } from './TaskEditor';
import { useTasks } from '../../hooks/useTasks';

interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, isDragging = false }) => {
  const { deleteTask } = useTasks();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const priorityInfo = PRIORITIES.find(p => p.value === task.priority);
  
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setIsDeleting(true);
      try {
        await deleteTask(task.id);
      } catch (error) {
        console.error('Error deleting task:', error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'P1': return 'border-l-red-500 bg-red-50';
      case 'P2': return 'border-l-orange-500 bg-orange-50';
      case 'P3': return 'border-l-blue-500 bg-blue-50';
      case 'P4': return 'border-l-gray-500 bg-gray-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        whileHover={{ scale: 1.02 }}
        className={`bg-white rounded-lg border-l-4 shadow-sm hover:shadow-md transition-all duration-200 p-4 ${getPriorityColor(task.priority)} ${
          isDragging ? 'rotate-3 shadow-lg' : ''
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-medium text-gray-900 mb-2">{task.taskName}</h3>
            
            <div className="space-y-1">
              <div className="flex items-center text-sm text-gray-600">
                <User className="h-4 w-4 mr-1" />
                <span>{task.assignee}</span>
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="h-4 w-4 mr-1" />
                <span>{formatDateTime(task.dueDate, task.dueTime)}</span>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${priorityInfo?.color} bg-opacity-10`}>
                {priorityInfo?.label}
              </span>
              
              <div className="flex items-center space-x-1">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="p-1"
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleDelete}
                  loading={isDeleting}
                  className="p-1"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {isEditing && (
        <TaskEditor
          task={task}
          isOpen={isEditing}
          onClose={() => setIsEditing(false)}
        />
      )}
    </>
  );
};