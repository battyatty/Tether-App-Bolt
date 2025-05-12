import React, { useState, useEffect } from 'react';
import { Task } from '../types';
import Timer from './Timer';
import { formatDateTime } from '../utils/helpers';
import { CheckCircle, SkipForward, Clock, FileText } from 'lucide-react';

interface ActiveTaskProps {
  task: Task;
  isRunning: boolean;
  onComplete: () => void;
  onSkip: () => void;
  currentTime: string;
  estimatedEndTime: string;
  isOverdue: boolean;
}

const ActiveTask: React.FC<ActiveTaskProps> = ({
  task,
  isRunning,
  onComplete,
  onSkip,
  currentTime,
  estimatedEndTime,
  isOverdue,
}) => {
  const [showAlert, setShowAlert] = useState(false);
  
  useEffect(() => {
    if (isOverdue) {
      setShowAlert(true);
    }
  }, [isOverdue]);

  return (
    <div className="flex flex-col items-center">
      <div className="w-full bg-white rounded-lg shadow-sm p-6 mb-4">
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-gray-500 flex items-center">
            <Clock size={14} className="mr-1" />
            <span>Current: {formatDateTime(currentTime)}</span>
          </div>
          <div className="text-sm text-gray-500 flex items-center">
            <Clock size={14} className="mr-1" />
            <span>End: {formatDateTime(estimatedEndTime)}</span>
          </div>
        </div>
        
        <h2 className="text-2xl font-semibold text-gray-800 text-center mb-8">
          {task.name}
        </h2>
        
        <div className="flex justify-center mb-8">
          <Timer
            key={task.id} //forces new instance of Timer on task switch
            duration={task.duration}
            isRunning={isRunning}
            onComplete={() => {}}
            showAlert={showAlert}
            taskStartTimestamp={task.actualStartTime || ''}
            pausedDuration={task.pausedDuration || 0}
          />
        </div>
        
        {task.notes && (
          <div className="mb-6 bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 flex items-center mb-2">
              <FileText size={14} className="mr-1" />
              Notes
            </h3>
            <p className="text-gray-600 text-sm whitespace-pre-line">{task.notes}</p>
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onSkip}
            className="flex items-center justify-center py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            <SkipForward size={16} className="mr-2" />
            Skip
          </button>
          
          <button
            onClick={onComplete}
            className="flex items-center justify-center py-2.5 px-4 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
          >
            <CheckCircle size={16} className="mr-2" />
            Complete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActiveTask;