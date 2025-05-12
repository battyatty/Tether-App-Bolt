import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Task } from '../types';
import TaskCard from './TaskCard';
import TaskForm from './TaskForm';
import { duplicateTask } from '../utils/helpers';
import { Save } from 'lucide-react';

interface KitblockFormProps {
  block?: Kitblock;
  onSave: (name: string, description: string | undefined, tasks: Task[]) => void;
  onCancel: () => void;
}

const KitblockForm: React.FC<KitblockFormProps> = ({ block, onSave, onCancel }) => {
  const [name, setName] = useState(block?.name || '');
  const [description, setDescription] = useState(block?.description || '');
  const [tasks, setTasks] = useState<Task[]>(block?.tasks || []);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(tasks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setTasks(items);
  };

  const handleAddTask = (task: Task) => {
    setTasks([...tasks, task]);
  };

  const handleEditTask = (task: Task) => {
    setTasks(tasks.map(t => t.id === task.id ? task : t));
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const handleDuplicateTask = (id: string) => {
    const taskToDuplicate = tasks.find(t => t.id === id);
    if (!taskToDuplicate) return;

    const duplicatedTask = duplicateTask(taskToDuplicate);
    const index = tasks.findIndex(t => t.id === id);
    const newTasks = [...tasks];
    newTasks.splice(index + 1, 0, duplicatedTask);
    setTasks(newTasks);
  };

  const handleSubmit = () => {
    if (!name.trim() || tasks.length === 0) return;
    onSave(name.trim(), description.trim() || undefined, tasks);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <label htmlFor="blockName" className="block text-sm font-medium text-gray-700 mb-1">
          Block Name*
        </label>
        <input
          type="text"
          id="blockName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="Enter block name"
          required
        />
      </div>

      <div className="mb-6">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          rows={2}
          placeholder="Describe the purpose of this block..."
        />
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Tasks</h3>
        
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="tasks">
            {(provided) => (
              <div 
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-3 mb-4"
              >
                {tasks.map((task, index) => (
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
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        <TaskForm onSave={handleAddTask} onCancel={() => {}} />
      </div>

      <div className="flex justify-end space-x-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={!name.trim() || tasks.length === 0}
          className={`px-4 py-2 text-sm font-medium text-white rounded-md flex items-center focus:outline-none focus:ring-2 ${
            !name.trim() || tasks.length === 0
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-purple-500 hover:bg-purple-600 focus:ring-purple-500'
          }`}
        >
          <Save size={16} className="mr-2" />
          Save Block
        </button>
      </div>
    </div>
  );
};

export default KitblockForm;