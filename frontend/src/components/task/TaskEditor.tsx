import React from 'react';
import { useForm } from 'react-hook-form';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Dropdown } from '../ui/Dropdown';
import { Button } from '../ui/Button';
import { Task, Priority, TaskStatus, UpdateTaskRequest } from '../../types/task';
import { PRIORITIES, TASK_STATUSES } from '../../utils/constants';
import { useTasks } from '../../hooks/useTasks';

interface TaskEditorProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
}

interface TaskEditorForm {
  taskName: string;
  assignee: string;
  dueDate: string;
  dueTime: string;
  priority: Priority;
  status: TaskStatus;
}

export const TaskEditor: React.FC<TaskEditorProps> = ({ task, isOpen, onClose }) => {
  const { updateTask, loading } = useTasks();
  
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<TaskEditorForm>({
    defaultValues: {
      taskName: task.taskName,
      assignee: task.assignee,
      dueDate: task.dueDate,
      dueTime: task.dueTime,
      priority: task.priority,
      status: task.status,
    }
  });

  const watchedPriority = watch('priority');
  const watchedStatus = watch('status');

  const onSubmit = async (data: TaskEditorForm) => {
    try {
      const updateData: UpdateTaskRequest = {
        id: task.id,
        ...data,
      };
      await updateTask(updateData);
      onClose();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Task">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Task Name"
          {...register('taskName', {
            required: 'Task name is required',
            minLength: {
              value: 3,
              message: 'Task name must be at least 3 characters'
            }
          })}
          error={errors.taskName?.message}
        />

        <Input
          label="Assignee"
          {...register('assignee', {
            required: 'Assignee is required',
            minLength: {
              value: 2,
              message: 'Assignee name must be at least 2 characters'
            }
          })}
          error={errors.assignee?.message}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Due Date"
            type="date"
            {...register('dueDate', {
              required: 'Due date is required'
            })}
            error={errors.dueDate?.message}
          />

          <Input
            label="Due Time"
            type="time"
            {...register('dueTime', {
              required: 'Due time is required'
            })}
            error={errors.dueTime?.message}
          />
        </div>

        <Dropdown
          label="Priority"
          options={PRIORITIES}
          value={watchedPriority}
          onChange={(value) => setValue('priority', value as Priority)}
        />

        <Dropdown
          label="Status"
          options={TASK_STATUSES}
          value={watchedStatus}
          onChange={(value) => setValue('status', value as TaskStatus)}
        />

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={loading}
            disabled={loading}
          >
            Update Task
          </Button>
        </div>
      </form>
    </Modal>
  );
};