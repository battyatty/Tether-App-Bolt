import React, { useState, useEffect } from 'react';
import { Task } from '../types';
import { Clock, FileText, Lock, X, Trash, ChevronUp, ChevronDown } from 'lucide-react';

interface TaskDetailModalProps {
  task: Task;
  onSave: (task: Task) => void;
  onDelete: () => void;
  onClose: () => void;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, onSave, onDelete, onClose }) => {
  const [name, setName] = useState(task.name);
  const [hours, setHours] = useState(Math.floor(task.duration / 60).toString());
  const [minutes, setMinutes] = useState((task.duration % 60).toString());
  const [notes, setNotes] = useState(task.notes || '');
  const [isAnchored, setIsAnchored] = useState(task.isAnchored);
  const [anchoredStartTime, setAnchoredStartTime] = useState(task.anchoredStartTime || '');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) return;
    
    const totalMinutes = (parseInt(hours) * 60) + parseInt(minutes);
    if (totalMinutes <= 0) return;
    
    onSave({
      ...task,
      name: name.trim(),
      duration: totalMinutes,
      notes: notes.trim() || undefined,
      isAnchored,
      anchoredStartTime: isAnchored ? anchoredStartTime : undefined,
    });
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Edit Task</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="space-y-4">
            <div>
              <label htmlFor="taskName" className="block text-sm font-medium text-gray-700 mb-1">
                Task Name
              </label>
              <input
                id="taskName"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter task name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration
              </label>
              <div className="flex gap-6">
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
            </div>

            <div>
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  id="isAnchored"
                  checked={isAnchored}
                  onChange={(e) => setIsAnchored(e.target.checked)}
                  className="h-4 w-4 text-blue-500 rounded border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor="isAnchored" className="ml-2 text-sm text-gray-700 flex items-center">
                  <Lock size={14} className="mr-1" />
                  Anchor to specific time
                </label>
              </div>
              
              {isAnchored && (
                <input
                  type="time"
                  value={anchoredStartTime}
                  onChange={(e) => setAnchoredStartTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Add any additional notes..."
              />
            </div>
          </div>

          <div className="flex justify-between items-center gap-3 pt-4 border-t border-gray-200">
            {showDeleteConfirm ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Delete this task?</span>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1.5 text-sm text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={onDelete}
                  className="px-3 py-1.5 text-sm text-white bg-red-500 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-1 px-3 py-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
              >
                <Trash size={16} />
                <span>Delete Task</span>
              </button>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600"
                disabled={!name.trim() || (parseInt(hours) === 0 && parseInt(minutes) === 0)}
              >
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskDetailModal;