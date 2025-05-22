import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Task } from '../types';
import TaskCard from './TaskCard';
import TaskForm from './TaskForm';
import { duplicateTask, formatDateTime, recalculateEstimatedEndTime } from '../utils/helpers';
import { useTether } from '../context/TetherContext';

interface LiveTetherEditorProps {
  tasks: Task[];
  currentTaskIndex: number;
  onSave: (tasks: Task[]) => void;
  onClose: () => void;
}

const LiveTetherEditor: React.FC<LiveTetherEditorProps> = ({
  tasks,
  currentTaskIndex,
  onSave,
  onClose,
}) => {
  const [currentTasks, setCurrentTasks] = useState<Task[]>(tasks);
  const [estimatedEnd, setEstimatedEnd] = useState(() => recalculateEstimatedEndTime(tasks));
  const { activeTether, updateTether } = useTether();

  useEffect(() => {
    setEstimatedEnd(recalculateEstimatedEndTime(currentTasks));
  }, [currentTasks]);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(currentTasks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setCurrentTasks(items);
  };

  const handleAddTask = (task: Task) => {
    setCurrentTasks([...currentTasks, task]);
  };

  const handleEditTask = (task: Task) => {
    setCurrentTasks(currentTasks.map(t => t.id === task.id ? task : t));
  };

  const handleDeleteTask = (id: string) => {
    setCurrentTasks(currentTasks.filter(task => task.id !== id));
  };

  const handleDuplicateTask = (id: string) => {
    const taskToDuplicate = currentTasks.find(t => t.id === id);
    if (!taskToDuplicate) return;

    const duplicatedTask = duplicateTask(taskToDuplicate);
    const index = currentTasks.findIndex(t => t.id === id);
    const newTasks = [...currentTasks];
    newTasks.splice(index + 1, 0, duplicatedTask);
    setCurrentTasks(newTasks);
  };

  const handleSaveChanges = () => {
    if (!activeTether) return;

    const updatedTasks = currentTasks.map((task, index) => ({
      ...task,
      completed: index < currentTaskIndex,
      status: index < currentTaskIndex ? 'completed' : 'pending'
    }));

    // Update the active tether in context
    updateTether(
      activeTether.id,
      activeTether.name,
      updatedTasks,
      activeTether.startTime
    );

    // Call the original onSave prop
    onSave(updatedTasks);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Edit Tasks</h2>
          <span className="text-sm text-gray-600">
            New End Time: {formatDateTime(estimatedEnd.toISOString())}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="tasks">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-3 mb-6"
                >
                  {currentTasks.map((task, index) => {
                    const isCompleted = index < currentTaskIndex;
                    const isSkipped = task.status === 'skipped';
                    const isCurrent = index === currentTaskIndex;

                  const getStatusVariant = (task: Task, index: number): 'current' | 'completed' | 'skipped' | 'upcoming' => {
                  if (index === currentTaskIndex) return 'current';
                  if (task.status === 'skipped') return 'skipped';
                  if (index < currentTaskIndex) return 'completed';
                  return 'upcoming';
                };
                  
                    return (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <TaskCard
                            task={task}
                            index={index}
                            onEdit={handleEditTask}
                            onDelete={handleDeleteTask}
                            onDuplicate={handleDuplicateTask}
                            onToggleLock={() => {}}
                            isDragging={snapshot.isDragging}
                            statusVariant={getStatusVariant(task, index)}
                          />
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          <TaskForm onSave={handleAddTask} onCancel={() => {}} />
        </div>

        <div className="p-4 border-t border-gray-200">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveChanges}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveTetherEditor;