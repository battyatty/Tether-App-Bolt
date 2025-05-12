import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Tether, Task } from '../types';
import TaskCard from './TaskCard';
import { Plus, Save, Clock, Blocks, ChevronDown, ChevronRight } from 'lucide-react';
import { generateId, formatDateTime } from '../utils/helpers';
import { useKitblock } from '../context/KitblockContext';

interface TetherFormProps {
  tether?: Tether;
  onSave: (name: string, tasks: Task[], startTime?: string) => void;
  onCancel: () => void;
}

const TetherForm: React.FC<TetherFormProps> = ({ tether, onSave, onCancel }) => {
  const { Kitblocks } = useKitblock();
  const [name, setName] = useState(tether?.name || '');
  const [tasks, setTasks] = useState<Task[]>(tether?.tasks || []);
  const [totalDuration, setTotalDuration] = useState(0);
  const [startTime, setStartTime] = useState<string>(tether?.startTime || '');
  const [useFixedStartTime, setUseFixedStartTime] = useState(!!tether?.startTime);
  const [showKitblockModal, setShowKitblockModal] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  
  // Quick add task state
  const [taskName, setTaskName] = useState('');
  const [taskHours, setTaskHours] = useState('0');
  const [taskMinutes, setTaskMinutes] = useState('0');

  const getEstimatedEndTime = () => {
    if (!startTime) return null;
    
    const [hours, minutes] = startTime.split(':');
    const startDate = new Date();
    startDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
    
    const endDate = new Date(startDate.getTime() + totalDuration * 60 * 1000);
    return endDate;
  };
  
  useEffect(() => {
    if (tether) {
      setName(tether.name);
      setTasks(tether.tasks);
      setStartTime(tether.startTime || '');
      setUseFixedStartTime(!!tether.startTime);
    }
  }, [tether]);
  
  useEffect(() => {
    const total = tasks.reduce((sum, task) => sum + task.duration, 0);
    setTotalDuration(total);
  }, [tasks]);

  const handleDuplicateTask = (id: string) => {
    const taskToDuplicate = tasks.find((t) => t.id === id);
    if (!taskToDuplicate) return;

    const duplicatedTask: Task = {
      ...taskToDuplicate,
      id: generateId(),
      name: `${taskToDuplicate.name} (copy)`,
      completed: false,
      actualDuration: undefined,
    };

    const index = tasks.findIndex((t) => t.id === id);
    const newTasks = [...tasks];
    newTasks.splice(index + 1, 0, duplicatedTask);
    setTasks(newTasks);
  };
  
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(tasks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setTasks(items);
  };

  const handleTimeChange = (value: string, type: 'hours' | 'minutes') => {
    const num = parseInt(value) || 0;
    if (type === 'hours') {
      setTaskHours(Math.max(0, num).toString());
    } else {
      setTaskMinutes(Math.min(Math.max(0, num), 59).toString());
    }
  };
  
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!taskName.trim()) return;
    
    const totalMinutes = (parseInt(taskHours) * 60) + parseInt(taskMinutes);
    if (totalMinutes <= 0) return;
    
    const newTask: Task = {
      id: generateId(),
      name: taskName.trim(),
      duration: totalMinutes,
      isAnchored: false,
      completed: false,
    };
    
    setTasks([...tasks, newTask]);
    resetTaskForm();
  };
  
  const resetTaskForm = () => {
    setTaskName('');
    setTaskHours('0');
    setTaskMinutes('0');
  };
  
  const handleEditTask = (task: Task) => {
    setTasks(tasks.map(t => t.id === task.id ? task : t));
  };
  
  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };
  
  const handleToggleLock = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id 
        ? { ...task, isAnchored: !task.isAnchored, anchoredStartTime: task.isAnchored ? undefined : task.anchoredStartTime } 
        : task
    ));
  };
  
  const handleSaveTether = () => {
    if (!name.trim() || tasks.length === 0) return;
    onSave(name.trim(), tasks, useFixedStartTime ? startTime : undefined);
  };
  
  const formatTotalDuration = () => {
    const hours = Math.floor(totalDuration / 60);
    const minutes = totalDuration % 60;
    return `${hours > 0 ? `${hours}h ` : ''}${minutes}m`;
  };

  const handleInsertKitblock = (blockId: string) => {
    const block = Kitblocks.find(b => b.id === blockId);
    if (!block) return;

    const newTasks = block.tasks.map(task => ({
      ...task,
      id: generateId(),
      completed: false,
      actualDuration: undefined,
      KitblockId: block.id,
      KitblockName: block.name,
    }));

    setTasks([...tasks, ...newTasks]);
    setShowKitblockModal(false);
  };

  const toggleGroupCollapse = (groupId: string) => {
    const newCollapsed = new Set(collapsedGroups);
    if (newCollapsed.has(groupId)) {
      newCollapsed.delete(groupId);
    } else {
      newCollapsed.add(groupId);
    }
    setCollapsedGroups(newCollapsed);
  };

  // Group tasks by Kitblock
  const groupedTasks = tasks.reduce((groups, task) => {
    const key = task.KitblockId || 'ungrouped';
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(task);
    return groups;
  }, {} as Record<string, Task[]>);

  const estimatedEndTime = getEstimatedEndTime();
  
  return (
    <div className="bg-rope-50 rounded-lg shadow-md p-6">
      <div className="mb-6">
        <label htmlFor="tetherName" className="block text-sm font-medium text-navy-800 mb-1">
          Tether Name*
        </label>
        <input
          type="text"
          id="tetherName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border border-rope-200 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500 bg-white"
          placeholder="Enter tether name"
          required
        />
      </div>
      
      <div className="mb-6">
        <div className="flex items-center mb-2">
          <input
            type="checkbox"
            id="useFixedStartTime"
            checked={useFixedStartTime}
            onChange={(e) => setUseFixedStartTime(e.target.checked)}
            className="h-4 w-4 text-navy-600 focus:ring-navy-500 border-rope-200 rounded"
          />
          <label htmlFor="useFixedStartTime" className="ml-2 block text-sm text-navy-800">
            Set planned start time
          </label>
        </div>
        
        {useFixedStartTime && (
          <div>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full p-2 border border-rope-200 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500 bg-white mb-2"
            />
            {estimatedEndTime && (
              <div className="text-sm text-navy-600">
                Estimated end time: {formatDateTime(estimatedEndTime.toISOString())}
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-navy-800">Tasks</h3>
        <div className="flex items-center text-navy-600">
          <Clock className="mr-1" size={16} />
          <span className="text-sm">Total: {formatTotalDuration()}</span>
        </div>
      </div>
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="tasks">
          {(provided) => (
            <div 
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="mb-6 space-y-3"
            >
              {Object.entries(groupedTasks).map(([groupId, groupTasks]) => (
                <div key={groupId}>
                  {groupId !== 'ungrouped' && groupTasks.length > 0 && (
                    <button
                      onClick={() => toggleGroupCollapse(groupId)}
                      className="flex items-center gap-2 py-2 px-3 bg-rope-100 rounded-lg mb-2 w-full text-left hover:bg-rope-200 transition-colors"
                    >
                      {collapsedGroups.has(groupId) ? (
                        <ChevronRight size={16} className="text-navy-500" />
                      ) : (
                        <ChevronDown size={16} className="text-navy-500" />
                      )}
                      <Blocks size={16} className="text-navy-500" />
                      <span className="text-sm font-medium text-navy-800">
                        {groupTasks[0].KitblockName}
                      </span>
                    </button>
                  )}
                  {(!collapsedGroups.has(groupId) || groupId === 'ungrouped') && (
                    groupTasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={tasks.indexOf(task)}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <TaskCard
                              task={task}
                              index={tasks.indexOf(task)}
                              onEdit={handleEditTask}
                              onDelete={handleDeleteTask}
                              onDuplicate={handleDuplicateTask}
                              onToggleLock={handleToggleLock}
                              isDragging={snapshot.isDragging}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))
                  )}
                </div>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      
      <div className="sticky bottom-0 bg-rope-50 pt-4 border-t border-rope-100">
        <form onSubmit={handleAddTask} className="grid grid-cols-[1fr,auto,auto,auto] gap-2 items-start mb-4">
          <input
            type="text"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            placeholder="Add a new task..."
            className="w-full px-3 py-2 text-sm border border-rope-200 rounded focus:outline-none focus:ring-1 focus:ring-navy-500 bg-white"
          />
          
          <div className="flex items-center gap-1">
            <input
              type="number"
              value={taskHours}
              onChange={(e) => handleTimeChange(e.target.value, 'hours')}
              placeholder="0"
              className="w-16 px-2 py-2 text-sm border border-rope-200 rounded focus:outline-none focus:ring-1 focus:ring-navy-500 bg-white"
              min="0"
            />
            <span className="text-sm text-navy-600">h</span>
          </div>
          
          <div className="flex items-center gap-1">
            <input
              type="number"
              value={taskMinutes}
              onChange={(e) => handleTimeChange(e.target.value, 'minutes')}
              placeholder="0"
              className="w-16 px-2 py-2 text-sm border border-rope-200 rounded focus:outline-none focus:ring-1 focus:ring-navy-500 bg-white"
              min="0"
              max="59"
            />
            <span className="text-sm text-navy-600">m</span>
          </div>
          
          <button
            type="submit"
            className="p-2 bg-navy-500 text-white rounded hover:bg-navy-600 transition-colors disabled:bg-navy-300"
            aria-label="Add task"
            disabled={!taskName.trim() || (parseInt(taskHours) === 0 && parseInt(taskMinutes) === 0)}
          >
            <Plus size={18} />
          </button>
        </form>

        <button
          onClick={() => setShowKitblockModal(true)}
          className="w-full flex items-center justify-center px-3 py-2 bg-navy-500 hover:bg-navy-600 text-white rounded-lg transition-colors text-sm mb-4"
        >
          <Blocks size={16} className="mr-1.5" />
          Insert Block
        </button>
      </div>
      
      <div className="flex justify-end space-x-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-navy-700 bg-rope-100 rounded-md hover:bg-rope-200 focus:outline-none focus:ring-2 focus:ring-navy-500"
        >
          Cancel
        </button>
        <button
          onClick={handleSaveTether}
          disabled={!name.trim() || tasks.length === 0}
          className={`px-4 py-2 text-sm font-medium text-white rounded-md flex items-center focus:outline-none focus:ring-2 ${
            !name.trim() || tasks.length === 0
              ? 'bg-navy-300 cursor-not-allowed'
              : 'bg-navy-500 hover:bg-navy-600 focus:ring-navy-500'
          }`}
        >
          <Save size={16} className="mr-2" />
          Save Tether
        </button>
      </div>

      {showKitblockModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-navy-800 mb-4">Insert Kitblock</h2>
              
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {Kitblocks.map(block => (
                  <button
                    key={block.id}
                    onClick={() => handleInsertKitblock(block.id)}
                    className="w-full text-left bg-rope-50 hover:bg-rope-100 p-3 rounded-lg transition-colors"
                  >
                    <h3 className="font-medium text-navy-800">{block.name}</h3>
                    {block.description && (
                      <p className="text-sm text-navy-600 mt-1">{block.description}</p>
                    )}
                    <div className="flex items-center text-sm text-navy-600 mt-2">
                      <Clock size={14} className="mr-1" />
                      <span>
                        {formatTotalDuration()} • {block.tasks.length} tasks
                      </span>
                    </div>
                  </button>
                ))}

                {Kitblocks.length === 0 && (
                  <div className="text-center py-8 text-navy-600">
                    <Blocks size={32} className="mx-auto mb-2 text-navy-400" />
                    <p>No Kitblocks available</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="border-t border-rope-200 p-4">
              <button
                onClick={() => setShowKitblockModal(false)}
                className="w-full px-4 py-2 text-sm font-medium text-navy-700 bg-rope-100 rounded-md hover:bg-rope-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TetherForm;