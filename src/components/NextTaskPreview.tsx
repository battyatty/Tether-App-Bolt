import React from 'react';
import { Task } from '../types';
import { ArrowRight, Clock } from 'lucide-react';
import { formatTime } from '../utils/helpers';

interface NextTaskPreviewProps {
  task: Task;
}

const NextTaskPreview: React.FC<NextTaskPreviewProps> = ({ task }) => {
  return (
    <div className="bg-gray-50 rounded-lg p-4 mt-4 border border-gray-100">
      <div className="flex items-center text-gray-500 mb-2">
        <ArrowRight size={16} className="mr-1" />
        <span className="text-sm font-medium">Up Next</span>
      </div>
      
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-800 truncate">{task.name}</h3>
        <div className="flex items-center text-gray-500 ml-3">
          <Clock size={14} className="mr-1" />
          <span className="text-sm">{formatTime(task.duration)}</span>
        </div>
      </div>
      
      {task.notes && (
        <p className="text-sm text-gray-500 mt-2 line-clamp-2">
          {task.notes}
        </p>
      )}
    </div>
  );
};

export default NextTaskPreview;