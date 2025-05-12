import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useTether } from '../context/TetherContext';
import { Clock, Plus, Play, MoreVertical, Calendar } from 'lucide-react';
import { formatTime, formatDateTime, formatTimerDisplay, formatTimeRange } from '../utils/helpers';
import CalendarImport from '../components/CalendarImport';

interface DashboardProps {
  onCreateNew: () => void;
  onEdit: (id: string) => void;
  onStart: (id: string) => void;
  onResumeActive?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onCreateNew, onEdit, onStart, onResumeActive }) => {
  const { tethers, deleteTether, duplicateTether, history, createTether, activeTether } = useTether();
  const [sortedTethers, setSortedTethers] = useState(tethers);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [showCalendarImport, setShowCalendarImport] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  useEffect(() => {
    if (!activeTether || !activeTether.isRunning) return;

    const interval = setInterval(() => {
      if (!activeTether.actualStartTime) return;
      
      const currentTask = activeTether.tasks[activeTether.currentTaskIndex];
      const taskStartTime = new Date(activeTether.actualStartTime);
      const now = new Date();
      const elapsed = Math.floor((now.getTime() - taskStartTime.getTime()) / 1000);
      const remaining = (currentTask.duration * 60) - elapsed;
      
      setElapsedTime(remaining);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTether]);
  
  useEffect(() => {
    const sorted = [...tethers].sort((a, b) => {
      if (!a.lastUsed && !b.lastUsed) return 0;
      if (!a.lastUsed) return 1;
      if (!b.lastUsed) return -1;
      return new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime();
    });
    setSortedTethers(sorted);
  }, [tethers]);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(sortedTethers);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setSortedTethers(items);
  };

  const getTotalDuration = (id: string) => {
    const tether = tethers.find(t => t.id === id);
    if (!tether) return 0;
    return tether.tasks.reduce((total, task) => total + task.duration, 0);
  };
  
  const handleImportTasks = (tasks: Task[]) => {
    if (tasks.length === 0) return;
    
    const name = `Imported Calendar (${new Date().toLocaleDateString()})`;
    createTether(name, tasks);
  };

  const handleCardClick = (e: React.MouseEvent, id: string) => {
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    onEdit(id);
  };

  const getEstimatedEndTime = (tether: Tether): string | null => {
    if (!tether.startTime) return null;
    
    const [hours, minutes] = tether.startTime.split(':');
    const startDate = new Date();
    startDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
    
    const totalDuration = getTotalDuration(tether.id);
    const endDate = new Date(startDate.getTime() + totalDuration * 60 * 1000);
    
    return formatTimeRange(startDate.toISOString(), endDate.toISOString());
  };
  
  const renderOngoingTether = () => {
    if (!activeTether) return null;

    const currentTask = activeTether.tasks[activeTether.currentTaskIndex];

    return (
      <div className="mb-6">
        <h2 className="text-lg font-medium text-navy-800 mb-3">Ongoing Tether</h2>
        <div 
          onClick={onResumeActive}
          className="cursor-pointer bg-mint-100 hover:bg-mint-200 rounded-lg shadow-sm p-4 border-l-4 border-mint-500 transition"
        >
          <p className="text-navy-700 font-semibold">{activeTether.name}</p>
          <div className="flex justify-between text-sm text-navy-600">
            <span>Now: {currentTask?.name || 'No task'}</span>
            <span className="font-mono">
              {formatTimerDisplay(Math.max(elapsedTime, 0))}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto max-w-2xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-navy-800">My Tethers</h1>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowCalendarImport(true)}
            className="flex items-center px-3 py-2 bg-navy-500 hover:bg-navy-600 text-white rounded-lg transition-colors"
          >
            <Calendar size={18} className="mr-2" />
            Import
          </button>
          <button
            onClick={onCreateNew}
            className="flex items-center px-3 py-2 bg-navy-500 hover:bg-navy-600 text-white rounded-lg transition-colors"
          >
            <Plus size={18} className="mr-2" />
            New Tether
          </button>
        </div>
      </div>

      {renderOngoingTether()}
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="tethers">
          {(provided) => (
            <div 
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-3"
            >
              {sortedTethers.map((tether, index) => (
                <Draggable 
                  key={tether.id} 
                  draggableId={tether.id} 
                  index={index}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      onClick={(e) => handleCardClick(e, tether.id)}
                      className={`bg-rope-100 rounded-lg shadow-sm p-3 hover:shadow-md transition-shadow cursor-pointer ${
                        snapshot.isDragging ? 'opacity-75' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h2 className="text-base font-medium text-navy-800 truncate">{tether.name}</h2>
                          <div className="flex items-center text-sm text-navy-600 mt-0.5">
                            <Clock size={14} className="mr-1 flex-shrink-0" />
                            <span className="truncate">
                              {tether.startTime ? (
                                getEstimatedEndTime(tether)
                              ) : (
                                `${formatTime(getTotalDuration(tether.id))} • ${tether.tasks.length} tasks`
                              )}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center ml-4">
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenu(openMenu === tether.id ? null : tether.id);
                              }}
                              className="p-1.5 text-navy-600 hover:text-navy-800 hover:bg-rope-200 rounded-full transition-colors"
                            >
                              <MoreVertical size={16} />
                            </button>
                            
                            {openMenu === tether.id && (
                              <div className="absolute right-0 mt-1 w-48 bg-rope-100 rounded-md shadow-lg py-1 z-10">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit(tether.id);
                                    setOpenMenu(null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-navy-800 hover:bg-rope-200"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    duplicateTether(tether.id);
                                    setOpenMenu(null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-navy-800 hover:bg-rope-200"
                                >
                                  Duplicate
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteTether(tether.id);
                                    setOpenMenu(null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-rope-200"
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onStart(tether.id);
                            }}
                            className="ml-2 p-1.5 bg-mint-200 hover:bg-mint-300 text-navy-800 rounded-full transition-colors"
                            aria-label="Start Tether"
                          >
                            <Play size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      
      {sortedTethers.length === 0 && (
        <div className="bg-rope-100 border border-rope-200 rounded-lg p-8 text-center">
          <p className="text-navy-800">No tethers yet. Create one to get started!</p>
        </div>
      )}

      {showCalendarImport && (
        <CalendarImport
          onImport={handleImportTasks}
          onClose={() => setShowCalendarImport(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;