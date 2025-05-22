import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Tether, Task, ActiveTether, TetherSummary, TaskStatus, TaskGroup } from '../types';
import { generateId, formatTimerDisplay } from '../utils/helpers';

interface TetherContextType {
  tethers: Tether[];
  activeTether: ActiveTether | null;
  history: TetherSummary[];
  taskStartTime: Date | null;
  createTether: (name: string, tasks: Task[], startTime?: string, groups?: TaskGroup[]) => void;
  updateTether: (id: string, name: string, tasks: Task[], startTime?: string, groups?: TaskGroup[]) => void;
  deleteTether: (id: string) => void;
  duplicateTether: (id: string) => void;
  startTether: (id: string) => Promise<void>;
  stopTether: () => TetherSummary | null;
  pauseTether: () => void;
  resumeTether: () => void;
  completeTask: () => void;
  skipTask: () => void;
  getCurrentTaskTime: () => number;
  getElapsedTime: () => number;
  getCurrentTaskTimeLeft: () => number;
}

const TetherContext = createContext<TetherContextType | undefined>(undefined);

const STORAGE_KEYS = {
  TETHERS: 'tether_app_tethers',
  HISTORY: 'tether_app_history',
  ACTIVE_TETHER: 'tether_app_active',
  LAST_SYNC: 'tether_app_last_sync',
  TASK_START: 'tether_app_task_start',
  ACTIVE_ID: 'tether_app_active_id',
  PAUSED_AT: 'tether_app_paused_at'
} as const;

export const TetherProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tethers, setTethers] = useState<Tether[]>([]);
  const [activeTether, setActiveTether] = useState<ActiveTether | null>(null);
  const [history, setHistory] = useState<TetherSummary[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [taskStartTime, setTaskStartTime] = useState<Date | null>(null);

  useEffect(() => {
    const loadStoredData = () => {
      try {
        const storedTethers = localStorage.getItem(STORAGE_KEYS.TETHERS);
        const storedHistory = localStorage.getItem(STORAGE_KEYS.HISTORY);
        const storedActiveTether = localStorage.getItem(STORAGE_KEYS.ACTIVE_TETHER);
        const storedTaskStart = localStorage.getItem(STORAGE_KEYS.TASK_START);
        const storedActiveId = localStorage.getItem(STORAGE_KEYS.ACTIVE_ID);
        const storedPausedAt = localStorage.getItem(STORAGE_KEYS.PAUSED_AT);
        
        if (storedTethers) {
          const parsedTethers = JSON.parse(storedTethers);
          if (Array.isArray(parsedTethers) && parsedTethers.every(tether => 
            tether.id && tether.name && Array.isArray(tether.tasks)
          )) {
            setTethers(parsedTethers);
          }
        }
        
        if (storedHistory) {
          const parsedHistory = JSON.parse(storedHistory);
          if (Array.isArray(parsedHistory) && parsedHistory.every(summary => 
            summary.tetherId && summary.tetherName && summary.startTime && summary.endTime
          )) {
            setHistory(parsedHistory);
          }
        }
        
        if (storedActiveTether && storedTaskStart && storedActiveId) {
          const parsedActiveTether = JSON.parse(storedActiveTether);
          if (parsedActiveTether && 
              parsedActiveTether.id && 
              parsedActiveTether.startTime && 
              parsedActiveTether.endTime) {
            
            // Only restore if IDs match
            if (parsedActiveTether.id === storedActiveId) {
              setActiveTether({
                ...parsedActiveTether,
                actualStartTime: storedTaskStart,
                pausedAt: storedPausedAt ? new Date(storedPausedAt).toISOString() : undefined
              });
              setTaskStartTime(new Date(storedTaskStart));
            }
          }
        }

        setIsInitialized(true);
      } catch (error) {
        console.error('Error loading data from localStorage:', error);
        setIsInitialized(true);
      }
    };

    loadStoredData();
  }, []);

  useEffect(() => {
    if (!isInitialized) return;

    try {
      localStorage.setItem(STORAGE_KEYS.TETHERS, JSON.stringify(tethers));
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
    } catch (error) {
      console.error('Error saving tethers to localStorage:', error);
    }
  }, [tethers, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;

    try {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
    } catch (error) {
      console.error('Error saving history to localStorage:', error);
    }
  }, [history, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;

    try {
      if (activeTether) {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_TETHER, JSON.stringify(activeTether));
        localStorage.setItem(STORAGE_KEYS.ACTIVE_ID, activeTether.id);
        if (activeTether.actualStartTime) {
          localStorage.setItem(STORAGE_KEYS.TASK_START, activeTether.actualStartTime);
        }
        if (activeTether.pausedAt) {
          localStorage.setItem(STORAGE_KEYS.PAUSED_AT, activeTether.pausedAt);
        } else {
          localStorage.removeItem(STORAGE_KEYS.PAUSED_AT);
        }
      } else {
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_TETHER);
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_ID);
        localStorage.removeItem(STORAGE_KEYS.TASK_START);
        localStorage.removeItem(STORAGE_KEYS.PAUSED_AT);
      }
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
    } catch (error) {
      console.error('Error saving active tether to localStorage:', error);
    }
  }, [activeTether, isInitialized]);

  const createTether = (name: string, tasks: Task[], startTime?: string, groups?: TaskGroup[]) => {
    const newTether: Tether = {
      id: generateId(),
      name,
      tasks,
      groups,
      startTime,
      createdAt: new Date().toISOString(),
    };

    setTethers((prev) => [...prev, newTether]);
  };

  const updateTether = (id: string, name: string, tasks: Task[], startTime?: string, groups?: TaskGroup[]) => {
    setTethers((prev) =>
      prev.map((tether) =>
        tether.id === id
          ? { ...tether, name, tasks, startTime, groups, lastUsed: new Date().toISOString() }
          : tether
      )
    );
  };

  const deleteTether = (id: string) => {
    setTethers((prev) => prev.filter((tether) => tether.id !== id));
  };

  const duplicateTether = (id: string) => {
    const tetherToDuplicate = tethers.find((tether) => tether.id === id);
    
    if (tetherToDuplicate) {
      const duplicatedTasks = tetherToDuplicate.tasks.map((task) => ({
        ...task,
        id: generateId(),
        completed: false,
        actualDuration: undefined,
      }));

      const duplicatedGroups = tetherToDuplicate.groups?.map(group => ({
        ...group,
        id: generateId(),
        tasks: group.tasks.map(taskId => {
          const originalTask = tetherToDuplicate.tasks.find(t => t.id === taskId);
          if (!originalTask) return '';
          const duplicatedTask = duplicatedTasks.find(t => t.name === originalTask.name);
          return duplicatedTask?.id || '';
        }).filter(Boolean)
      }));

      const duplicatedTether: Tether = {
        id: generateId(),
        name: `${tetherToDuplicate.name} (Copy)`,
        tasks: duplicatedTasks,
        groups: duplicatedGroups,
        startTime: tetherToDuplicate.startTime,
        createdAt: new Date().toISOString(),
      };

      setTethers((prev) => [...prev, duplicatedTether]);
    }
  };

  const calculateEndTime = (startTimeString: string, tasks: Task[]): string => {
    const startTime = new Date(startTimeString);
    const totalMinutes = tasks.reduce((total, task) => total + task.duration, 0);
    const endTime = new Date(startTime.getTime() + totalMinutes * 60 * 1000);
    
    return endTime.toISOString();
  };

  const startTether = async (id: string) => {
    if (activeTether) {
      throw new Error("⚠️ Tether already running\n\nYou can't run more than one tether at a time. Please end your current tether session before starting a new one.");
    }

    const tetherToStart = tethers.find((tether) => tether.id === id);
    
    if (tetherToStart) {
      const now = new Date();
      let startTime = now.toISOString();
      
      if (tetherToStart.startTime) {
        const [hours, minutes] = tetherToStart.startTime.split(':');
        const fixedStartTime = new Date();
        fixedStartTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
        
        if (fixedStartTime > now) {
          startTime = fixedStartTime.toISOString();
        }
      }
      
      const activeTasks = tetherToStart.tasks.map(task => ({
        ...task,
        completed: false,
        actualDuration: undefined,
        status: 'pending' as TaskStatus
      }));
      
      const newActiveTether: ActiveTether = {
        ...tetherToStart,
        tasks: activeTasks,
        startTime,
        actualStartTime: now.toISOString(),
        endTime: calculateEndTime(startTime, activeTasks),
        currentTaskIndex: 0,
        isRunning: true,
        isPaused: false,
      };

      setActiveTether(newActiveTether);
      setTaskStartTime(now);
      updateTether(id, tetherToStart.name, tetherToStart.tasks, tetherToStart.startTime, tetherToStart.groups);
      
      localStorage.setItem(STORAGE_KEYS.TASK_START, now.toISOString());
      localStorage.setItem(STORAGE_KEYS.ACTIVE_ID, id);
    }
  };

  const stopTether = () => {
    if (!activeTether) return null;

    const now = new Date();
    const startTime = new Date(activeTether.startTime);
    const actualDuration = (now.getTime() - startTime.getTime()) / (1000 * 60);
    
    const plannedDuration = activeTether.tasks.reduce(
      (total, task) => total + task.duration,
      0
    );

    const updatedTasks = activeTether.tasks.map((task, index) => {
      if (index < activeTether.currentTaskIndex) {
        return task;
      } else if (index === activeTether.currentTaskIndex) {
        const taskDuration = (now.getTime() - taskStartTime!.getTime()) / (1000 * 60);
        return {
          ...task,
          status: 'partial' as TaskStatus,
          actualDuration: taskDuration
        };
      } else {
        return {
          ...task,
          status: 'skipped' as TaskStatus,
          actualDuration: 0
        };
      }
    });

    const taskSummaries = updatedTasks.map((task) => ({
      id: task.id,
      name: task.name,
      plannedDuration: task.duration,
      actualDuration: task.actualDuration || 0,
      status: task.status
    }));

    const summary: TetherSummary = {
      tetherId: activeTether.id,
      tetherName: activeTether.name,
      date: new Date().toISOString().split('T')[0],
      startTime: activeTether.startTime,
      endTime: now.toISOString(),
      plannedDuration,
      actualDuration,
      tasks: taskSummaries,
    };

    setHistory((prev) => [...prev, summary]);
    setActiveTether(null);
    setTaskStartTime(null);
    
    localStorage.removeItem(STORAGE_KEYS.TASK_START);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_ID);
    localStorage.removeItem(STORAGE_KEYS.PAUSED_AT);

    return summary;
  };

  const pauseTether = () => {
    if (!activeTether || activeTether.isPaused) return;

    const pausedAt = new Date().toISOString();

    setActiveTether((prev) =>
      prev
        ? {
            ...prev,
            isRunning: false,
            isPaused: true,
            pausedAt,
          }
        : null
    );

    localStorage.setItem(STORAGE_KEYS.PAUSED_AT, pausedAt);
  };

  const resumeTether = () => {
    if (!activeTether || !activeTether.isPaused || !activeTether.pausedAt) return;

    const now = new Date();
    const pausedAt = new Date(activeTether.pausedAt);
    const secondsPaused = Math.floor((now.getTime() - pausedAt.getTime()) / 1000);

    const updatedTasks = activeTether.tasks.map((task, index) => {
      if (index === activeTether.currentTaskIndex) {
        return {
          ...task,
          pausedDuration: (task.pausedDuration || 0) + secondsPaused,
        };
      }
      return task;
    });

    setActiveTether((prev) =>
      prev
        ? {
            ...prev,
            isRunning: true,
            isPaused: false,
            pausedAt: undefined,
            tasks: updatedTasks,
          }
        : null
    );

    localStorage.removeItem(STORAGE_KEYS.PAUSED_AT);
  };

  const completeTask = () => {
    if (!activeTether || !taskStartTime) return;

    const now = new Date();
    const currentTaskIndex = activeTether.currentTaskIndex;
    const actualDuration = (now.getTime() - taskStartTime.getTime()) / (1000 * 60);
    
    const updatedTasks = activeTether.tasks.map((task, index) => 
      index === currentTaskIndex 
        ? { ...task, completed: true, actualDuration, status: 'completed' as TaskStatus }
        : task
    );
    
    if (currentTaskIndex === activeTether.tasks.length - 1) {
      setActiveTether((prev) => 
        prev ? { ...prev, tasks: updatedTasks } : null
      );
      stopTether();
      return;
    }
    
    const nextTaskIndex = currentTaskIndex + 1;
    
    const startTime = new Date(activeTether.startTime);
    const completedDuration = updatedTasks
      .slice(0, nextTaskIndex)
      .reduce((total, task) => total + (task.actualDuration || 0), 0);
    
    const remainingDuration = updatedTasks
      .slice(nextTaskIndex)
      .reduce((total, task) => total + task.duration, 0);
    
    const newEndTime = new Date(
      startTime.getTime() + (completedDuration + remainingDuration) * 60 * 1000
    ).toISOString();
    
    const newTaskStartTime = new Date(now.getTime());
    setTaskStartTime(newTaskStartTime);
    localStorage.setItem(STORAGE_KEYS.TASK_START, newTaskStartTime.toISOString());
    
    setActiveTether((prev) => 
      prev ? {
        ...prev,
        tasks: updatedTasks,
        currentTaskIndex: nextTaskIndex,
        endTime: newEndTime,
      } : null
    );
  };

  const skipTask = () => {
    if (!activeTether) return;

    const currentTaskIndex = activeTether.currentTaskIndex;
    
    if (currentTaskIndex === activeTether.tasks.length - 1) {
      stopTether();
      return;
    }
    
    const nextTaskIndex = currentTaskIndex + 1;
    const now = new Date();
    setTaskStartTime(now);
    localStorage.setItem(STORAGE_KEYS.TASK_START, now.toISOString());

    const updatedTasks = activeTether.tasks.map((task, index) => 
      index === currentTaskIndex 
        ? { ...task, completed: false, status: 'skipped' as TaskStatus, actualDuration: 0 }
        : task
    );
    
    setActiveTether((prev) => 
      prev ? {
        ...prev,
        tasks: updatedTasks,
        currentTaskIndex: nextTaskIndex,
      } : null
    );
  };

  const getCurrentTaskTime = () => {
    if (!activeTether) return 0;
    
    const currentTask = activeTether.tasks[activeTether.currentTaskIndex];
    return currentTask.duration;
  };

  const getElapsedTime = () => {
    if (!activeTether) return 0;
    
    const currentTaskIndex = activeTether.currentTaskIndex;
    const previousTasksDuration = activeTether.tasks
      .slice(0, currentTaskIndex)
      .reduce((total, task) => total + (task.actualDuration || task.duration), 0);
    
    return previousTasksDuration;
  };

  const getCurrentTaskTimeLeft = () => {
    if (!activeTether || !taskStartTime || !activeTether.isRunning) return 0;
    
    const currentTask = activeTether.tasks[activeTether.currentTaskIndex];
    const now = new Date();
    const elapsedSeconds = Math.floor((now.getTime() - taskStartTime.getTime()) / 1000);
    const totalSeconds = currentTask.duration * 60;
    
    return totalSeconds - elapsedSeconds;
  };

  return (
    <TetherContext.Provider
      value={{
        tethers,
        activeTether,
        history,
        taskStartTime,
        createTether,
        updateTether,
        deleteTether,
        duplicateTether,
        startTether,
        stopTether,
        pauseTether,
        resumeTether,
        completeTask,
        skipTask,
        getCurrentTaskTime,
        getElapsedTime,
        getCurrentTaskTimeLeft,
      }}
    >
      {children}
    </TetherContext.Provider>
  );
};

export const useTether = () => {
  const context = useContext(TetherContext);
  if (context === undefined) {
    throw new Error('useTether must be used within a TetherProvider');
  }
  return context;
};