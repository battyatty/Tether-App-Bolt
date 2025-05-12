import React from 'react';
import { TetherSummary, TaskStatus } from '../types';
import { formatDateTime, getTimeDiff } from '../utils/helpers';
import { Clock, CheckCircle, AlertTriangle, XCircle, MinusCircle } from 'lucide-react';

interface SummaryViewProps {
  summary: TetherSummary;
  onClose: () => void;
}

const TaskStatusIcon = ({ status }: { status?: TaskStatus }) => {
  switch (status) {
    case 'completed':
      return <CheckCircle size={16} className="text-green-500" />;
    case 'skipped':
      return <XCircle size={16} className="text-red-500" />;
    case 'partial':
      return <MinusCircle size={16} className="text-yellow-500" />;
    default:
      return null;
  }
};

const SummaryView: React.FC<SummaryViewProps> = ({ summary, onClose }) => {
  const diffMinutes = summary.actualDuration - summary.plannedDuration;
  const isOvertime = diffMinutes > 0;
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">{summary.tetherName} - Summary</h2>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 p-3 rounded-lg">
          <span className="text-sm text-gray-500">Started</span>
          <p className="font-medium">{formatDateTime(summary.startTime)}</p>
        </div>
        
        <div className="bg-gray-50 p-3 rounded-lg">
          <span className="text-sm text-gray-500">Ended</span>
          <p className="font-medium">{formatDateTime(summary.endTime)}</p>
        </div>
        
        <div className="bg-gray-50 p-3 rounded-lg">
          <span className="text-sm text-gray-500">Planned Duration</span>
          <p className="font-medium">{Math.floor(summary.plannedDuration / 60)}h {summary.plannedDuration % 60}m</p>
        </div>
        
        <div className="bg-gray-50 p-3 rounded-lg">
          <span className="text-sm text-gray-500">Actual Duration</span>
          <p className="font-medium">{Math.floor(summary.actualDuration / 60)}h {Math.floor(summary.actualDuration) % 60}m</p>
        </div>
      </div>
      
      <div className={`mb-6 p-3 rounded-lg flex items-center ${
        isOvertime ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
      }`}>
        {isOvertime ? (
          <>
            <AlertTriangle size={18} className="mr-2" />
            <span>You went over by {Math.floor(diffMinutes / 60)}h {Math.floor(diffMinutes) % 60}m</span>
          </>
        ) : (
          <>
            <CheckCircle size={18} className="mr-2" />
            <span>You finished {Math.floor(Math.abs(diffMinutes) / 60)}h {Math.floor(Math.abs(diffMinutes)) % 60}m early</span>
          </>
        )}
      </div>
      
      <h3 className="text-md font-medium text-gray-700 mb-3">Task Breakdown</h3>
      
      <div className="mb-6 space-y-3">
        {summary.tasks.map((task) => {
          const diff = task.actualDuration - task.plannedDuration;
          const isTaskOvertime = diff > 0;
          
          return (
            <div key={task.id} className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-800 flex items-center">
                  <TaskStatusIcon status={task.status} />
                  <span className="ml-2">{task.name}</span>
                </h4>
                <span className={`text-xs px-2 py-1 rounded ${
                  task.status === 'completed' ? 'bg-green-100 text-green-700' :
                  task.status === 'skipped' ? 'bg-red-100 text-red-700' :
                  task.status === 'partial' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {task.status || 'pending'}
                </span>
              </div>
              
              <div className="flex justify-between items-center mt-2 text-sm">
                <div className="flex items-center">
                  <Clock size={14} className="mr-1 text-gray-500" />
                  <span className="text-gray-500">Planned: {Math.floor(task.plannedDuration / 60)}h {task.plannedDuration % 60}m</span>
                </div>
                
                <div className="flex items-center">
                  <Clock size={14} className={`mr-1 ${isTaskOvertime ? 'text-red-500' : 'text-green-500'}`} />
                  <span className={isTaskOvertime ? 'text-red-500' : 'text-green-500'}>
                    Actual: {Math.floor(task.actualDuration / 60)}h {Math.floor(task.actualDuration) % 60}m
                  </span>
                </div>
              </div>
              
              {task.status !== 'skipped' && diff !== 0 && (
                <div className={`text-xs mt-1 ${isTaskOvertime ? 'text-red-500' : 'text-green-500'}`}>
                  {isTaskOvertime ? (
                    <span>+{Math.floor(diff / 60)}h {Math.floor(diff) % 60}m</span>
                  ) : (
                    <span>-{Math.floor(Math.abs(diff) / 60)}h {Math.floor(Math.abs(diff)) % 60}m</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <button
        onClick={onClose}
        className="w-full py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
      >
        Close Summary
      </button>
    </div>
  );
};

export default SummaryView;