import React, { useRef, useState } from 'react';
import { Task } from '../types';
import { parseICSFile, convertEventsToTasks } from '../utils/calendar';
import { Calendar, Upload, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarImportProps {
  onImport: (tasks: Task[]) => void;
  onClose: () => void;
}

const CalendarImport: React.FC<CalendarImportProps> = ({ onImport, onClose }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFile = async (file: File) => {
    try {
      if (!file.name.endsWith('.ics')) {
        throw new Error('Please select a valid .ics file');
      }
      
      const events = await parseICSFile(file);
      const newTasks = convertEventsToTasks(events);
      setTasks(newTasks);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse calendar file');
      setTasks([]);
    }
  };
  
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      await handleFile(file);
    }
  };
  
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleFile(file);
    }
  };

  const isValidDate = (date: Date): boolean => {
    return date instanceof Date && !isNaN(date.getTime());
  };

  const toLocalISOString = (date: Date): string => {
    if (!isValidDate(date)) return '';
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60 * 1000);
    return localDate.toISOString().split('T')[0];
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days: Array<{ date: Date | null; hasEvents: boolean }> = [];
    
    // Add empty cells for days before the first of the month
    for (let i = 0; i < startingDay; i++) {
      days.push({ date: null, hasEvents: false });
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(year, month, i);
      if (!isValidDate(currentDate)) {
        continue;
      }
      
      const dateString = toLocalISOString(currentDate);
      const hasEvents = tasks.some(task => {
        if (!task.scheduledDate) return false;
        
        const taskDate = new Date(task.scheduledDate);
        taskDate.setHours(0, 0, 0, 0);
        return toLocalISOString(taskDate) === dateString;
      });
      
      days.push({ date: currentDate, hasEvents });
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getFilteredTasks = () => {
    if (!selectedDate) return [];
    
    return tasks.filter(task => {
      if (!task.scheduledDate) return false;
      
      const taskDate = new Date(task.scheduledDate);
      taskDate.setHours(0, 0, 0, 0);
      return toLocalISOString(taskDate) === selectedDate;
    });
  };

  const days = getDaysInMonth(currentMonth);
  const filteredTasks = getFilteredTasks();
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center">
            <Calendar size={20} className="mr-2" />
            Import from Calendar
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-full"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          {tasks.length === 0 ? (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center ${
                isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <Upload size={32} className="mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 mb-2">
                Drag and drop your .ics file here, or{' '}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-blue-500 hover:text-blue-600"
                >
                  browse
                </button>
              </p>
              <p className="text-sm text-gray-500">
                Supports .ics files exported from Google Calendar, Apple Calendar, etc.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".ics"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Calendar */}
              <div>
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={() => navigateMonth('prev')}
                      className="p-1 text-gray-400 hover:text-gray-600 rounded-full"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <h3 className="text-lg font-medium">
                      {currentMonth.toLocaleString('default', { 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </h3>
                    <button
                      onClick={() => navigateMonth('next')}
                      className="p-1 text-gray-400 hover:text-gray-600 rounded-full"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-7 gap-1">
                    {weekDays.map(day => (
                      <div 
                        key={day} 
                        className="text-center text-sm font-medium text-gray-500 py-1"
                      >
                        {day}
                      </div>
                    ))}
                    {days.map((day, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          if (day.date && isValidDate(day.date)) {
                            const dateString = toLocalISOString(day.date);
                            setSelectedDate(selectedDate === dateString ? null : dateString);
                          }
                        }}
                        disabled={!day.date || !day.hasEvents}
                        className={`
                          aspect-square p-1 rounded-lg text-sm
                          ${!day.date ? 'invisible' : ''}
                          ${day.hasEvents ? 'hover:bg-blue-50 cursor-pointer' : 'text-gray-300 cursor-not-allowed'}
                          ${day.date && selectedDate === toLocalISOString(day.date)
                            ? 'bg-blue-500 text-white hover:bg-blue-600'
                            : ''
                          }
                        `}
                      >
                        {day.date?.getDate()}
                        {day.hasEvents && (
                          <div className={`w-1 h-1 rounded-full mx-auto mt-1 ${
                            selectedDate === toLocalISOString(day.date)
                              ? 'bg-white'
                              : 'bg-blue-500'
                          }`} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Events List */}
              <div className="flex flex-col min-h-0">
                {selectedDate ? (
                  <>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      Events for {new Date(selectedDate).toLocaleDateString()}
                      {filteredTasks.length === 0 && " (No events)"}
                    </h3>
                    <div className="flex-1 overflow-y-auto">
                      {filteredTasks.map((task) => (
                        <div
                          key={task.id}
                          className="bg-gray-50 rounded p-3 mb-2"
                        >
                          <div className="font-medium">{task.name}</div>
                          <div className="text-sm text-gray-500 mt-1">
                            {task.anchoredStartTime && (
                              <div>
                                Start: {task.anchoredStartTime}
                              </div>
                            )}
                            <div>
                              Duration: {Math.floor(task.duration / 60)}h {task.duration % 60}m
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    Select a date to view events
                  </div>
                )}
              </div>
            </div>
          )}
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg">
              {error}
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-3 p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onImport(filteredTasks);
              onClose();
            }}
            disabled={!selectedDate || filteredTasks.length === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 disabled:bg-gray-300"
          >
            Import {filteredTasks.length} Tasks
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarImport;