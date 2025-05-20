import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { useTether } from '../context/TetherContext';
import { Settings, Plus, Blocks, Clock } from 'lucide-react';
import { formatTime, formatTimerDisplay } from '../utils/helpers';
import TetherCard from '../components/TetherCard';
import OngoingTetherCard from '../components/OngoingTetherCard';
import KitblocksPage from './KitblocksPage';

interface DashboardProps {
  onCreateNew: () => void;
  onEdit: (id: string) => void;
  onStart: (id: string) => void;
  onResumeActive?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onCreateNew, onEdit, onStart, onResumeActive }) => {
  const { tethers, deleteTether, duplicateTether, activeTether } = useTether();
  const [sortedTethers, setSortedTethers] = useState(tethers);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'tethers' | 'kitblocks'>('tethers');
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

  const handleCardClick = (e: React.MouseEvent, id: string) => {
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    onEdit(id);
  };

  const renderOngoingTether = () => {
    if (!activeTether) return null;

    const currentTask = activeTether.tasks[activeTether.currentTaskIndex];

    return (
      <div className="mb-6">
        <h2 className="text-lg font-medium text-Tidewake-textBright mb-3">Ongoing Tether</h2>
        <OngoingTetherCard
          tether={activeTether}
          currentTaskName={currentTask?.name || 'No task'}
          elapsedTime={elapsedTime}
          isAnchored={currentTask?.isAnchored}
          isPaused={!activeTether.isRunning}
          isOvertime={elapsedTime < 0}
          onClick={onResumeActive || (() => {})}
        />
      </div>
    );
  };

  const renderContent = () => {
    if (viewMode === 'kitblocks') {
      return <KitblocksPage />;
    }

    return (
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="tethers">
          {(provided) => (
            <div 
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-4"
            >
              {sortedTethers.map((tether, index) => (
                <TetherCard
                  key={tether.id}
                  tether={tether}
                  index={index}
                  isDragging={false}
                  openMenuId={openMenu}
                  onClick={handleCardClick}
                  onEdit={onEdit}
                  onDelete={deleteTether}
                  onDuplicate={duplicateTether}
                  onStart={onStart}
                  setOpenMenu={setOpenMenu}
                />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    );
  };

  return (
    <div className="relative h-screen bg-Tidewake-background">
      {/* Main scrollable area */}
      <div className="absolute top-0 left-0 right-0 bottom-[90px] overflow-y-auto z-10 pt-6 pb-[100px]">
        {/* Header */}
        <div className="px-6 mb-4">
          <h1 className="text-2xl font-bold text-Tidewake-textBright">
            My Tethers
          </h1>
          <p className="text-Tidewake-textMuted mt-1">
            {activeTether ? 'Gone Fishing 🎣' : 'Set Sail For Today...'}
          </p>
        </div>

        {/* Content */}
        <div className="px-6">
          {renderOngoingTether()}
          {renderContent()}
        </div>
      </div>

      {/* Scroll gradient */}
      <div className="absolute bottom-[90px] left-0 right-0 h-16 bg-gradient-to-t from-Tidewake-background to-transparent z-20" />

      {/* Bottom navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-Tidewake-background h-[90px] px-4 flex justify-between items-center">
        {/* Settings button */}
        <button className="w-10 h-10 bg-Tidewake-card text-Tidewake-icon rounded-full flex items-center justify-center">
          <Settings size={20} />
        </button>

        {/* View toggle */}
        <div className="bg-Tidewake-backgroundAlt border border-Tidewake-accentSoft p-1 rounded-full flex gap-1">
          <button
            onClick={() => setViewMode('tethers')}
            className={`px-3 py-1 rounded-full transition-colors ${
              viewMode === 'tethers'
                ? 'bg-Tidewake-accentSoft text-Tidewake-textAlt font-semibold'
                : 'text-Tidewake-textMuted'
            }`}
          >
            Tethers
          </button>
          <button
            onClick={() => setViewMode('kitblocks')}
            className={`px-3 py-1 rounded-full transition-colors ${
              viewMode === 'kitblocks'
                ? 'bg-Tidewake-accentSoft text-Tidewake-textAlt font-semibold'
                : 'text-Tidewake-textMuted'
            }`}
          >
            KitBlocks
          </button>
        </div>

        {/* Create new button */}
        <button
          onClick={onCreateNew}
          className="w-10 h-10 bg-Tidewake-card text-Tidewake-icon rounded-full flex items-center justify-center"
        >
          <Plus size={20} />
        </button>
      </div>
    </div>
  );
};

export default Dashboard;