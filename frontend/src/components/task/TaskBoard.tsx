import React from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { motion } from 'framer-motion';
import { Task, TaskStatus } from '../../types/task';
import { TaskCard } from './TaskCard';
import { useTasks } from '../../hooks/useTasks';
import { Loading } from '../common/Loading';

interface TaskBoardProps {
  tasks: Task[];
  loading: boolean;
}

const COLUMNS: { id: TaskStatus; title: string; color: string }[] = [
  { id: 'todo', title: 'To Do', color: 'bg-gray-100' },
  { id: 'in-progress', title: 'In Progress', color: 'bg-yellow-100' },
  { id: 'completed', title: 'Completed', color: 'bg-green-100' },
];

export const TaskBoard: React.FC<TaskBoardProps> = ({ tasks, loading }) => {
  const { updateTask } = useTasks();

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;
    const newStatus = destination.droppableId as TaskStatus;
    
    const task = tasks.find(t => t.id === draggableId);
    if (!task || task.status === newStatus) return;

    try {
      await updateTask({
        id: task.id,
        status: newStatus,
      });
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const getTasksByStatus = (status: TaskStatus): Task[] => {
    return tasks.filter(task => task.status === status);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Task Board</h2>
        <p className="text-sm text-gray-600">Drag tasks between columns to update their status</p>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {COLUMNS.map((column) => {
            const columnTasks = getTasksByStatus(column.id);
            
            return (
              <div key={column.id} className="flex flex-col">
                <div className={`rounded-lg p-3 mb-4 ${column.color}`}>
                  <h3 className="font-medium text-gray-900 text-center">
                    {column.title} ({columnTasks.length})
                  </h3>
                </div>

                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 min-h-[200px] rounded-lg border-2 border-dashed p-2 transition-colors ${
                        snapshot.isDraggingOver
                          ? 'border-primary-400 bg-primary-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="space-y-3">
                        {columnTasks.map((task, index) => (
                          <Draggable
                            key={task.id}
                            draggableId={task.id}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              >
                                <TaskCard
                                  task={task}
                                  isDragging={snapshot.isDragging}
                                />
                              </div>
                            )}
                          </Draggable>
                        ))}
                      </div>
                      {provided.placeholder}
                      
                      {columnTasks.length === 0 && !snapshot.isDraggingOver && (
                        <div className="flex items-center justify-center h-32 text-gray-400">
                          <p className="text-sm">No tasks</p>
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
};