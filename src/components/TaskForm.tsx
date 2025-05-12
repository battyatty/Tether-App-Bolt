import React, { useState, useEffect } from 'react';
import { Task } from '../types';
import { generateId } from '../utils/helpers';
import { Plus, FileText, Lock, ChevronUp, ChevronDown } from 'lucide-react';

interface TaskFormProps {
  task?: Task;
  onSave: (task: Task) => void;
  onCancel: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ task, onSave, onCancel }) => {
  const [name, setName] = useState('');
  const [hours, setHours] = useState('0');
  const [minutes, setMinutes] = useState('0');
  const [showDetails, setShowDetails] = useState(false);
  const [notes, setNotes] = useState('');
  const [isAnchored, setIsAnchored] = useState(false);
  const [anchoredStartTime, setAnchoredStartTime] = useState('');

  useEffect(() => {
    if (task) {
      setName(task.name);
      setHours(Math.floor(task.duration / 60).toString());
      setMinutes((task.duration % 60).toString());
      setNotes(task.notes || '');
      setIsAnchored(task.isAnchored);
      setAnchoredStartTime(task.anchoredStartTime || '');
      setShowDetails(true);
    }
  }, [task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) return;
    
    const totalMinutes = (parseInt(hours) * 60) + parseInt(minutes);
    if (totalMinutes <= 0) return;
    
    const newTask: Task = {
      id: task?.id || generateId(),
      name: name.trim(),
      duration: totalMinutes,
      notes: notes.trim() || undefined,
      isAnchored,
      anchoredStartTime: isAnchored ? anchoredStartTime : undefined,
      completed: task?.completed || false,
    };
    
    onSave(newTask);
    resetForm();
  };
  
  const resetForm = () => {
    setName('');
    setHours('0');
    setMinutes('0');
    setNotes('');
    setIsAnchored(false);
    setAnchoredStartTime('');
    setShowDetails(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleTimeChange = (value: string, type: 'hours' | 'minutes') => {
    const num = parseInt(value) || 0;
    if (type === 'hours') {
      setHours(Math.max(0, Math.min(23, num)).toString());
    } else {
      setMinutes(Math.max(0, Math.min(59, num)).toString());
    }
  };

  const handleStepperClick = (type: 'hours' | 'minutes', increment: boolean) => {
    const currentValue = parseInt(type === 'hours' ? hours : minutes) || 0;
    const maxValue = type === 'hours' ? 23 : 59;
    const newValue = increment 
      ? Math.min(currentValue + 1, maxValue)
      : Math.max(currentValue - 1, 0);
    
    if (type === 'hours') {
      setHours(newValue.toString());
    } else {
      setMinutes(newValue.toString());
    }
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-[1fr,auto,auto,auto] gap-2 items-start">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter task name"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            autoFocus
          />
          
          <div className="flex items-center gap-3">
            {/* Hours Stepper */}
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={() => handleStepperClick('hours', true)}
                className="p-1 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
              >
                <ChevronUp size={16} />
              </button>
              <div className="flex items-center">
                <input
                  type="text"
                  value={hours}
                  onChange={(e) => handleTimeChange(e.target.value, 'hours')}
                  className="w-8 text-center py-0.5 text-sm border-0 focus:outline-none focus:ring-0"
                  min="0"
                  max="23"
                />
                <span className="text-sm text-gray-500">h</span>
              </div>
              <button
                type="button"
                onClick={() => handleStepperClick('hours', false)}
                className="p-1 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
              >
                <ChevronDown size={16} />
              </button>
            </div>

            {/* Minutes Stepper */}
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={() => handleStepperClick('minutes', true)}
                className="p-1 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
              >
                <ChevronUp size={16} />
              </button>
              <div className="flex items-center">
                <input
                  type="text"
                  value={minutes}
                  onChange={(e) => handleTimeChange(e.target.value, 'minutes')}
                  className="w-8 text-center py-0.5 text-sm border-0 focus:outline-none focus:ring-0"
                  min="0"
                  max="59"
                />
                <span className="text-sm text-gray-500">m</span>
              </div>
              <button
                type="button"
                onClick={() => handleStepperClick('minutes', false)}
                className="p-1 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
              >
                <ChevronDown size={16} />
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors"
            aria-label="Show details"
          >
            <FileText size={18} />
          </button>
          
          <button
            type="submit"
            className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:bg-gray-300"
            aria-label="Add task"
            disabled={!name.trim() || (parseInt(hours) === 0 && parseInt(minutes) === 0)}
          >
            <Plus size={18} />
          </button>
        </div>

        {showDetails && (
          <div className="space-y-3 pt-2 border-t border-gray-100">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center min-w-0">
                <input
                  type="checkbox"
                  id="isAnchored"
                  checked={isAnchored}
                  onChange={(e) => setIsAnchored(e.target.checked)}
                  className="h-4 w-4 text-blue-500 rounded border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor="isAnchored" className="ml-2 text-sm text-gray-600 flex items-center whitespace-nowrap">
                  <Lock size={14} className="mr-1" />
                  Anchor to time
                </label>
              </div>
              
              {isAnchored && (
                <input
                  type="time"
                  value={anchoredStartTime}
                  onChange={(e) => setAnchoredStartTime(e.target.value)}
                  className="px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              )}
            </div>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes (optional)"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 resize-y"
              rows={2}
            />
          </div>
        )}
      </form>
    </div>
  );
};

export default TaskForm;