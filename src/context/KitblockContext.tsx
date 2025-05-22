import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Kitblock, Task } from '../types';
import { generateId } from '../utils/helpers';

interface KitblockContextType {
  Kitblocks: Kitblock[];
  createKitblock: (name: string, description: string | undefined, tasks: Task[]) => void;
  updateKitblock: (id: string, name: string, description: string | undefined, tasks: Task[]) => void;
  deleteKitblock: (id: string) => void;
  duplicateKitblock: (id: string) => void;
}

const KitblockContext = createContext<KitblockContextType | undefined>(undefined);

const STORAGE_KEY = 'tether_app_Kitblocks';

export const KitblockProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [Kitblocks, setKitblocks] = useState<Kitblock[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const loadStoredData = () => {
      try {
        const storedBlocks = localStorage.getItem(STORAGE_KEY);
        
        if (storedBlocks) {
          const parsedBlocks = JSON.parse(storedBlocks);
          if (Array.isArray(parsedBlocks) && parsedBlocks.every(block => 
            block.id && block.name && Array.isArray(block.tasks)
          )) {
            setKitblocks(parsedBlocks);
          }
        }

        setIsInitialized(true);
      } catch (error) {
        console.error('Error loading Kitblocks from localStorage:', error);
        setIsInitialized(true);
      }
    };

    loadStoredData();
  }, []);

  useEffect(() => {
    if (!isInitialized) return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Kitblocks));
    } catch (error) {
      console.error('Error saving Kitblocks to localStorage:', error);
    }
  }, [Kitblocks, isInitialized]);

  const createKitblock = (name: string, description: string | undefined, tasks: Task[]) => {
    const newBlock: Kitblock = {
      id: generateId(),
      name,
      description,
      tasks,
      createdAt: new Date().toISOString(),
    };

    setKitblocks(prev => [...prev, newBlock]);
  };

  const updateKitblock = (id: string, name: string, description: string | undefined, tasks: Task[]) => {
    setKitblocks(prev =>
      prev.map(block =>
        block.id === id
          ? { 
              ...block, 
              name, 
              description, 
              tasks, 
              lastUsed: new Date().toISOString() 
            }
          : block
      )
    );
  };

  const deleteKitblock = (id: string) => {
    // Get all tethers from localStorage
    const tethersStr = localStorage.getItem('tether_app_tethers');
    if (tethersStr) {
      try {
        const tethers = JSON.parse(tethersStr);
        
        // Update tasks in all tethers
        const updatedTethers = tethers.map((tether: any) => ({
          ...tether,
          tasks: tether.tasks.map((task: Task) => {
            if (task.KitblockId === id) {
              // Convert KitBlock tasks to regular grouped tasks
              return {
                ...task,
                KitblockId: undefined,
                KitblockName: undefined,
                // Keep the group label to maintain visual grouping
                groupLabel: task.groupLabel
              };
            }
            return task;
          })
        }));

        // Save updated tethers back to localStorage
        localStorage.setItem('tether_app_tethers', JSON.stringify(updatedTethers));
      } catch (error) {
        console.error('Error updating tethers after KitBlock deletion:', error);
      }
    }

    // Remove the KitBlock from the library
    setKitblocks(prev => prev.filter(block => block.id !== id));
  };

  const duplicateKitblock = (id: string) => {
    const blockToDuplicate = Kitblocks.find(block => block.id === id);
    
    if (blockToDuplicate) {
      const duplicatedTasks = blockToDuplicate.tasks.map(task => ({
        ...task,
        id: generateId(),
        completed: false,
        actualDuration: undefined,
      }));

      const duplicatedBlock: Kitblock = {
        id: generateId(),
        name: `${blockToDuplicate.name} (Copy)`,
        description: blockToDuplicate.description,
        tasks: duplicatedTasks,
        createdAt: new Date().toISOString(),
      };

      setKitblocks(prev => [...prev, duplicatedBlock]);
    }
  };

  return (
    <KitblockContext.Provider
      value={{
        Kitblocks,
        createKitblock,
        updateKitblock,
        deleteKitblock,
        duplicateKitblock,
      }}
    >
      {children}
    </KitblockContext.Provider>
  );
};

export const useKitblock = () => {
  const context = useContext(KitblockContext);
  if (context === undefined) {
    throw new Error('useKitblock must be used within a KitblockProvider');
  }
  return context;
};