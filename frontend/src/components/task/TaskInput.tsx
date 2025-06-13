import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useTasks } from '../../hooks/useTasks';

interface TaskInputForm {
  naturalLanguageInput: string;
}

export const TaskInput: React.FC = () => {
  const { parseTasks, loading } = useTasks();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<TaskInputForm>();

  const onSubmit = async (data: TaskInputForm) => {
    if (!data.naturalLanguageInput.trim()) return;
    
    setIsProcessing(true);
    try {
      await parseTasks(data.naturalLanguageInput);
      reset();
    } catch (error) {
      console.error('Error parsing tasks:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Tasks</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Input
            {...register('naturalLanguageInput', {
              required: 'Please enter task details',
              minLength: {
                value: 5,
                message: 'Task description must be at least 5 characters'
              }
            })}
            placeholder='e.g., "Finish landing page Aman by 11pm 20th June, Call client Rajeev tomorrow 5pm"'
            className="text-base"
            error={errors.naturalLanguageInput?.message}
          />
        </div>
        <div className="flex justify-end">
          <Button
            type="submit"
            loading={loading || isProcessing}
            disabled={loading || isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Parse & Add Tasks'}
          </Button>
        </div>
      </form>
      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Tip:</strong> You can add multiple tasks in one input. Mention assignee names and due dates/times for better parsing.</p>
      </div>
    </div>
  );
};