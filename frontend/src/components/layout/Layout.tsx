import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Header } from './Header';
import { TaskInput } from '../task/TaskInput';
import { TaskTable } from '../task/TaskTable';
import { TaskBoard } from '../task/TaskBoard';
import { Button } from '../ui/Button';
import { useTasks } from '../../hooks/useTasks';
import { LayoutGrid, Table } from 'lucide-react';

type ViewMode = 'table' | 'board';

export const Layout: React.FC = () => {
  const { tasks, loading, error, clearError } = useTasks();
  const [viewMode, setViewMode] = useState<ViewMode>('table');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6"
          >
            <div className="flex items-center justify-between">
              <span>{error}</span>
              <button
                onClick={clearError}
                className="text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </div>
          </motion.div>
        )}

        <TaskInput />

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Your Tasks</h2>
          
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'table' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setViewMode('table')}
              className="flex items-center"
            >
              <Table className="h-4 w-4 mr-1" />
              Table
            </Button>
            <Button
              variant={viewMode === 'board' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setViewMode('board')}
              className="flex items-center"
            >
              <LayoutGrid className="h-4 w-4 mr-1" />
              Board
            </Button>
          </div>
        </div>

        <motion.div
          key={viewMode}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {viewMode === 'table' ? (
            <TaskTable tasks={tasks} loading={loading} />
          ) : (
            <TaskBoard tasks={tasks} loading={loading} />
          )}
        </motion.div>
      </main>
    </div>
  );
};