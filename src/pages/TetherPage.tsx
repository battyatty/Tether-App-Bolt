import React, { useState, useEffect } from 'react';
import { useTether } from '../context/TetherContext';
import ActiveTask from '../components/ActiveTask';
import NextTaskPreview from '../components/NextTaskPreview';
import SummaryView from '../components/SummaryView';
import LiveTetherEditor from '../components/liveTetherEditor';
import { TetherSummary } from '../types';
import { Home, Pause, Play, List, X, StopCircle } from 'lucide-react';

interface TetherPageProps {
  onExit: () => void;
}

const TetherPage: React.FC<TetherPageProps> = ({ onExit }) => {
  const { 
    activeTether, 
    completeTask, 
    skipTask, 
    pauseTether,
    resumeTether,
    updateTether,
    stopTether 
  } = useTether();
  
  const [showSummary, setShowSummary] = useState(false);
  const [summary, setSummary] = useState<TetherSummary | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date().toISOString());
  const [isOverdue, setIsOverdue] = useState(false);
  const [showLiveTetherEditor, setShowLiveTetherEditor] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().toISOString());
      
      if (activeTether && activeTether.isRunning) {
        const currentTaskIndex = activeTether.currentTaskIndex;
        const currentTask = activeTether.tasks[currentTaskIndex];
        
        const taskStartIndex = currentTaskIndex === 0 ? 0 : currentTaskIndex - 1;
        let taskStartTime = new Date(activeTether.startTime);
        
        if (currentTaskIndex > 0) {
          const previousTasksDuration = activeTether.tasks
            .slice(0, currentTaskIndex)
            .reduce((total, task) => total + (task.actualDuration || task.duration), 0);
          
          taskStartTime = new Date(taskStartTime.getTime() + previousTasksDuration * 60 * 1000);
        }
        
        const taskEndTime = new Date(taskStartTime.getTime() + currentTask.duration * 60 * 1000);
        setIsOverdue(new Date() > taskEndTime);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [activeTether]);
  
  if (!activeTether) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No active tether.</p>
          <button
            onClick={onExit}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }
  
  const handleComplete = () => {
    completeTask();
  };
  
  const handleSkip = () => {
    skipTask();
  };
  
  const handleTogglePause = () => {
    if (activeTether.isRunning) {
      pauseTether();
    } else {
      resumeTether();
    }
  };

  const handleSaveTasks = (updatedTasks: Task[]) => {
    if (!activeTether) return;
    
    updateTether(
      activeTether.id,
      activeTether.name,
      updatedTasks,
      activeTether.startTime
    );
    
    setShowLiveTetherEditor(false);
  };

  const handleEndTether = () => {
    const tetherSummary = stopTether();
    if (tetherSummary) {
      setSummary(tetherSummary);
      setShowSummary(true);
    }
    setShowEndConfirm(false);
  };

  const handlePauseAndExit = () => {
    pauseTether();
    onExit();
    setShowEndConfirm(false);
  };
  
  const currentTask = activeTether.tasks[activeTether.currentTaskIndex];
  const nextTask = activeTether.tasks[activeTether.currentTaskIndex + 1];
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto max-w-2xl px-4 py-3 flex justify-between items-center">
          <h1 className="text-lg font-medium text-gray-800">{activeTether.name}</h1>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handleTogglePause}
              className={`p-2 ${
                activeTether.isRunning 
                  ? 'text-amber-500 hover:text-amber-600' 
                  : 'text-green-500 hover:text-green-600'
              } hover:bg-gray-100 rounded-full transition-colors`}
              aria-label={activeTether.isRunning ? "Pause" : "Resume"}
            >
              {activeTether.isRunning ? <Pause size={20} /> : <Play size={20} />}
            </button>

            <button
              onClick={() => setShowEndConfirm(true)}
              className="p-2 text-red-500 hover:text-red-600 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="End Tether"
            >
              <StopCircle size={20} />
            </button>
            
            <button
              onClick={onExit}
              className="p-2 text-gray-500 hover:text-blue-500 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Exit to home"
            >
              <Home size={20} />
            </button>
          </div>
        </div>
      </header>
      
      <div className="flex-1 container mx-auto max-w-2xl px-4 py-6">
        {showSummary && summary ? (
          <SummaryView 
            summary={summary}
            onClose={() => {
              setShowSummary(false);
              onExit();
            }}
          />
        ) : (
          <div>
            <ActiveTask
              task={currentTask}
              isRunning={activeTether.isRunning}
              onComplete={handleComplete}
              onSkip={handleSkip}
              currentTime={currentTime}
              estimatedEndTime={activeTether.endTime}
              isOverdue={isOverdue}
            />
            
            {nextTask && (
              <NextTaskPreview task={nextTask} />
            )}
          </div>
        )}
      </div>
      
      <button
        onClick={() => setShowLiveTetherEditor(true)}
        className="bg-white border-t border-gray-200 py-3 hover:bg-gray-50 transition-colors"
      >
        <div className="container mx-auto max-w-2xl px-4">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-sm flex items-center">
              <List size={14} className="mr-1" />
              Edit Tasks
            </span>
            <span className="text-sm">
              Task {activeTether.currentTaskIndex + 1} of {activeTether.tasks.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-blue-500 rounded-full transition-all duration-300"
              style={{ 
                width: `${(activeTether.currentTaskIndex / activeTether.tasks.length) * 100}%` 
              }}
            />
          </div>
        </div>
      </button>

      {showLiveTetherEditor && (
        <LiveTetherEditor
          tasks={activeTether.tasks}
          currentTaskIndex={activeTether.currentTaskIndex}
          onSave={handleSaveTasks}
          onClose={() => setShowLiveTetherEditor(false)}
        />
      )}

      {showEndConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">End Tether?</h2>
                <button
                  onClick={() => setShowEndConfirm(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>
              
              <p className="text-gray-600 mb-6">
                Choose how you'd like to end this tether:
              </p>

              <div className="space-y-3">
                <button
                  onClick={handlePauseAndExit}
                  className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-left"
                >
                  <div className="font-medium">Pause Tether</div>
                  <div className="text-sm text-gray-500">
                    Save current progress and return to home
                  </div>
                </button>

                <button
                  onClick={handleEndTether}
                  className="w-full px-4 py-3 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors text-left"
                >
                  <div className="font-medium">End Tether</div>
                  <div className="text-sm text-red-600">
                    End the tether and show session report
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TetherPage;