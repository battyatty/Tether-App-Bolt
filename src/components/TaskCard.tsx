import React, { useState, useEffect, useRef } from 'react';
import { Task } from '../types';
import { formatTime } from '../utils/helpers';
import { Clock, Anchor, Copy, ChevronUp, ChevronDown, CheckCircle2 } from 'lucide-react';
import TaskDetailModal from './taskDetailModal';

interface TaskCardProps {
  task: Task;
  index: number;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onToggleLock: (id: string) => void;
  isDragging?: boolean;
  statusVariant?: 'current' | 'completed' | 'skipped' | 'upcoming';
  isSelected?: boolean;
  onSelect?: (event: React.MouseEvent) => void;
  selectionMode?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleLock,
  isDragging = false,
  statusVariant = 'upcoming',
  isSelected = false,
  onSelect,
  selectionMode = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(task.name);
  const [showTaskDetailModal, setShowTaskDetailModal] = useState(false);
  const [showDurationEdit, setShowDurationEdit] = useState(false);
  const [hours, setHours] = useState(Math.floor(task.duration / 60).toString());
  const [minutes, setMinutes] = useState((task.duration % 60).toString());
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isDraggingGesture, setIsDraggingGesture] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const startXRef = useRef(0);
  const swipeThreshold = 80;

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (isEditing) return;
      startXRef.current = e.touches[0].clientX;
      setIsDraggingGesture(true);

      if (onSelect) {
        const timer = setTimeout(() => {
          onSelect(new MouseEvent('click'));
        }, 500);
        setLongPressTimer(timer);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDraggingGesture || isEditing) return;
      const currentX = e.touches[0].clientX;
      const diff = currentX - startXRef.current;
      setSwipeOffset(diff);

      // Cancel long press if user starts swiping
      if (longPressTimer && Math.abs(diff) > 10) {
        clearTimeout(longPressTimer);
        setLongPressTimer(null);
      }
    };

    const handleTouchEnd = () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        setLongPressTimer(null);
      }

      if (!isDraggingGesture || isEditing) return;
      
      setIsDraggingGesture(false);
      
      if (Math.abs(swipeOffset) >= swipeThreshold) {
        if (swipeOffset > 0) {
          onDuplicate(task.id);
        } else {
          onDelete(task.id);
        }
      }
      
      setSwipeOffset(0);
    };

    const element = cardRef.current;
    if (element) {
      element.addEventListener('touchstart', handleTouchStart);
      element.addEventListener('touchmove', handleTouchMove);
      element.addEventListener('touchend', handleTouchEnd);

      return () => {
        element.removeEventListener('touchstart', handleTouchStart);
        element.removeEventListener('touchmove', handleTouchMove);
        element.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDraggingGesture, swipeOffset, task.id, onDelete, onDuplicate, isEditing, onSelect, longPressTimer]);

  const getSwipeIndicatorOpacity = () => {
    const progress = Math.abs(swipeOffset) / swipeThreshold;
    return Math.min(progress, 1);
  };

  const handleStartEditing = () => {
    setIsEditing(true);
    setEditedName(task.name);
  };

  const handleSaveEdit = () => {
    if (editedName.trim() && editedName !== task.name) {
      onEdit({
        ...task,
        name: editedName.trim()
      });
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedName(task.name);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
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

  const handleSaveDuration = () => {
    const totalMinutes = (parseInt(hours) * 60) + parseInt(minutes);
    if (totalMinutes > 0) {
      onEdit({
        ...task,
        duration: totalMinutes
      });
    }
    setShowDurationEdit(false);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (
      (e.target as HTMLElement).closest('button') ||
      (e.target as HTMLElement).closest('input') ||
      isEditing
    ) {
      return;
    }

    if (selectionMode && onSelect) {
      onSelect(e);
    } else {
      setShowTaskDetailModal(true);
    }
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDuplicate(task.id);
  };

  const handleToggleLock = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!task.isAnchored || task.anchoredStartTime) {
      onToggleLock(task.id);
    } else {
      setShowTaskDetailModal(true);
    }
  };

  return (
    <>
      <div className="relative overflow-hidden">
        {/* Swipe indicators */}
        <div 
          className="absolute inset-y-0 left-0 w-full bg-red-500 flex items-center justify-start px-4"
          style={{ opacity: swipeOffset < 0 ? getSwipeIndicatorOpacity() : 0 }}
        >
          <span className="text-white">Delete</span>
        </div>
        <div 
          className="absolute inset-y-0 right-0 w-full bg-green-500 flex items-center justify-end px-4"
          style={{ opacity: swipeOffset > 0 ? getSwipeIndicatorOpacity() : 0 }}
        >
          <span className="text-white">Duplicate</span>
        </div>

        {/* Task card */}
        <div
          ref={cardRef}
          onClick={handleCardClick}
          className={`relative rounded-lg shadow-sm border-l-4 ${
            task.isAnchored && task.anchoredStartTime ? 'border-purple-500' : 'border-blue-500'
          } ${isDragging ? 'opacity-50' : 'opacity-100'} ${
            isSelected ? 'bg-blue-50' : ''
          } transition-all cursor-pointer`}
          style={{
            transform: `translateX(${swipeOffset}px)`,
            transition: isDraggingGesture ? 'none' : 'transform 0.2s ease-out'
          }}
        >
          <div
            className={`p-3 rounded-lg transition-colors duration-200 ${
              statusVariant === 'current' ? 'bg-Tidewake-timer text-white border-none' : ''
            } ${statusVariant === 'completed' ? 'opacity-60 line-through' : ''} ${
              statusVariant === 'skipped' ? 'opacity-60' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center min-w-0 flex-1">
                {selectionMode && (
                  <div className={`mr-3 ${isSelected ? 'text-blue-500' : 'text-gray-300'}`}>
                    <CheckCircle2 size={20} />
                  </div>
                )}
                {isEditing ? (
                  <input
                    ref={inputRef}
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    onBlur={handleSaveEdit}
                    onKeyDown={handleKeyDown}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <h3 
                    className="font-medium text-gray-800 truncate cursor-pointer hover:text-blue-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartEditing();
                    }}
                  >
                    {task.name}
                  </h3>
                )}
              </div>
              
              <div className="flex items-center gap-2 ml-2">
                <div 
                  className="flex items-center text-gray-500 text-sm cursor-pointer hover:text-blue-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDurationEdit(true);
                  }}
                >
                  <Clock size={14} className="mr-1" />
                  <span>{formatTime(task.duration)}</span>
                </div>
                
                <button
                  onClick={handleToggleLock}
                  className={`p-1.5 rounded-full transition-colors ${
                    task.isAnchored && task.anchoredStartTime
                      ? 'text-purple-500 hover:bg-purple-50' 
                      : 'text-gray-400 hover:bg-gray-100'
                  }`}
                >
                  <Anchor size={14} />
                </button>

                <button
                  onClick={handleDuplicate}
                  className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                  title="Duplicate task"
                >
                  <Copy size={14} />
                </button>
              </div>
            </div>
            
            {task.isAnchored && task.anchoredStartTime && (
              <div className="mt-2 text-sm text-purple-600">
                <Clock size={12} className="inline-block mr-1" />
                Anchored to {task.anchoredStartTime}
              </div>
            )}
          </div>
        </div>
      </div>

      {showDurationEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Edit Duration</h3>
            </div>

            <div className="p-4">
              <div className="flex justify-center gap-6">
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

            <div className="flex justify-end gap-2 p-4 border-t border-gray-200">
              <button
                onClick={() => setShowDurationEdit(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveDuration}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600"
                disabled={parseInt(hours) === 0 && parseInt(minutes) === 0}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {showTaskDetailModal && (
        <TaskDetailModal
          task={task}
          onSave={(updatedTask) => {
            onEdit(updatedTask);
            setShowTaskDetailModal(false);
          }}
          onDelete={() => {
            onDelete(task.id);
            setShowTaskDetailModal(false);
          }}
          onClose={() => setShowTaskDetailModal(false)}
        />
      )}
    </>
  );
};

export default TaskCard;