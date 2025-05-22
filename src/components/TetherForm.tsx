import React, { useState, useEffect, useRef } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Task } from '../types';
import TaskCard from './TaskCard';
import TaskForm from './TaskForm';
import CalendarImport from './CalendarImport';
import { Plus, Blocks, Clock, ChevronDown, ChevronRight, Copy, X, CalendarPlus, Trash, ArrowLeft, Settings, CheckSquare, Save, FolderPlus, Library } from 'lucide-react';
import { generateId, formatTime, calculateEstimatedEndTime } from '../utils/helpers';
import { useKitblock } from '../context/KitblockContext';

interface KitBlockSelectorProps {
  onSelect: (kitblock: Kitblock) => void;
  onClose: () => void;
}

const KitBlockSelector: React.FC<KitBlockSelectorProps> = ({ onSelect, onClose }) => {
  const { Kitblocks } = useKitblock();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Select KitBlock</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {Kitblocks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No KitBlocks available
            </div>
          ) : (
            <div className="space-y-3">
              {Kitblocks.map(block => (
                <button
                  key={block.id}
                  onClick={() => onSelect(block)}
                  className="w-full p-4 bg-gray-50 hover:bg-gray-100 rounded-lg text-left transition-colors"
                >
                  <div className="font-medium text-gray-800">{block.name}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {block.tasks.length} tasks • {formatTime(block.tasks.reduce((sum, task) => sum + task.duration, 0))}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface TetherFormProps {
  tether?: Tether;
  onSave: (name: string, tasks: Task[], startTime?: string) => void;
  onCancel: () => void;
  onDelete?: (id: string) => void;
}

const TetherForm: React.FC<TetherFormProps> = ({ tether, onSave, onCancel, onDelete }) => {
  const { Kitblocks, createKitblock } = useKitblock();
  const [name, setName] = useState(tether?.name || '');
  const [tasks, setTasks] = useState<Task[]>(tether?.tasks || []);
  const [totalDuration, setTotalDuration] = useState(0);
  const [startTime, setStartTime] = useState<string>(tether?.startTime || '');
  const [useFixedStartTime, setUseFixedStartTime] = useState(!!tether?.startTime);
  const [showKitblockModal, setShowKitblockModal] = useState(false);
  const [showCalendarImport, setShowCalendarImport] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [lastSelectedTask, setLastSelectedTask] = useState<string | null>(null);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showGroupNameInput, setShowGroupNameInput] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [showKitblockNameInput, setShowKitblockNameInput] = useState(false);
  const [newKitblockName, setNewKitblockName] = useState('');
  const [showKitblockSelector, setShowKitblockSelector] = useState(false);
  const [estimatedEndTime, setEstimatedEndTime] = useState<string>('');
  
  // Quick add task state
  const [taskName, setTaskName] = useState('');
  const [taskHours, setTaskHours] = useState('0');
  const [taskMinutes, setTaskMinutes] = useState('0');

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

  useEffect(() => {
    if (useFixedStartTime && startTime && tasks.length > 0) {
      const endTime = calculateEstimatedEndTime(startTime, tasks);
      setEstimatedEndTime(endTime);
    } else {
      setEstimatedEndTime('');
    }
  }, [useFixedStartTime, startTime, tasks]);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    
    // Get the dragged task
    const draggedTask = tasks[sourceIndex];
    
    // If the dragged task is selected, move all selected tasks
    if (selectedTasks.has(draggedTask.id)) {
      const selectedTasksList = tasks.filter(task => selectedTasks.has(task.id));
      const unselectedTasks = tasks.filter(task => !selectedTasks.has(task.id));
      
      // Calculate the target group based on drop position
      const targetTask = tasks[destinationIndex];
      const targetKitblockId = targetTask?.KitblockId;
      const targetKitblockName = targetTask?.KitblockName;
      const targetGroupLabel = targetTask?.groupLabel;
      
      // Update selected tasks with new group/kitblock info
      const updatedSelectedTasks = selectedTasksList.map(task => ({
        ...task,
        groupLabel: targetGroupLabel,
        KitblockId: targetKitblockId,
        KitblockName: targetKitblockName
      }));
      
      // Create new task array with updated positions
      let newTasks = [...unselectedTasks];
      newTasks.splice(destinationIndex, 0, ...updatedSelectedTasks);
      
      setTasks(newTasks);
    } else {
      // Handle single task drag
      const updatedTasks = Array.from(tasks);
      const [movedTask] = updatedTasks.splice(sourceIndex, 1);
      
      // Update group/kitblock info based on drop position
      const targetTask = tasks[destinationIndex];
      movedTask.groupLabel = targetTask?.groupLabel;
      movedTask.KitblockId = targetTask?.KitblockId;
      movedTask.KitblockName = targetTask?.KitblockName;
      
      updatedTasks.splice(destinationIndex, 0, movedTask);
      setTasks(updatedTasks);
    }
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

  const handleTaskSelect = (taskId: string, event?: React.MouseEvent) => {
    const newSelected = new Set(selectedTasks);
    
    if (event?.shiftKey && lastSelectedTask) {
      const startIdx = tasks.findIndex(t => t.id === lastSelectedTask);
      const endIdx = tasks.findIndex(t => t.id === taskId);
      const [start, end] = [Math.min(startIdx, endIdx), Math.max(startIdx, endIdx)];
      
      tasks.slice(start, end + 1).forEach(t => newSelected.add(t.id));
    } else if (event?.metaKey || event?.ctrlKey) {
      if (newSelected.has(taskId)) {
        newSelected.delete(taskId);
      } else {
        newSelected.add(taskId);
      }
    } else {
      if (newSelected.size === 1 && newSelected.has(taskId)) {
        newSelected.clear();
      } else {
        newSelected.clear();
        newSelected.add(taskId);
      }
    }
    
    setSelectedTasks(newSelected);
    setLastSelectedTask(taskId);
  };

  const handleEditTask = (task: Task) => {
    setTasks(prev => prev.map(t => t.id === task.id ? task : t));
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleDuplicateTask = (id: string) => {
    const taskToDuplicate = tasks.find(t => t.id === id);
    if (!taskToDuplicate) return;

    const duplicatedTask = {
      ...taskToDuplicate,
      id: generateId(),
      name: `${taskToDuplicate.name} (copy)`,
      completed: false,
      actualDuration: undefined,
    };
    
    setTasks(prev => [...prev, duplicatedTask]);
  };

  const handleToggleLock = (id: string) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === id ? { ...task, isAnchored: !task.isAnchored } : task
      )
    );
  };
  
  const handleBulkDelete = () => {
    setTasks(tasks.filter(task => !selectedTasks.has(task.id)));
    setSelectedTasks(new Set());
    setShowBulkActions(false);
  };

  const handleBulkDuplicate = () => {
    const selectedTasksList = tasks.filter(task => selectedTasks.has(task.id));
    const duplicatedTasks = selectedTasksList.map(task => ({
      ...task,
      id: generateId(),
      name: `${task.name} (copy)`,
      completed: false,
      actualDuration: undefined,
    }));
    
    setTasks([...tasks, ...duplicatedTasks]);
    setSelectedTasks(new Set());
    setShowBulkActions(false);
  };

  const handleCreateGroup = () => {
    if (!newGroupName.trim() || selectedTasks.size === 0) return;

    setTasks(prev => prev.map(task => {
      if (selectedTasks.has(task.id)) {
        return {
          ...task,
          groupLabel: newGroupName.trim(),
          // Clear any existing KitBlock association
          KitblockId: undefined,
          KitblockName: undefined
        };
      }
      return task;
    }));

    setNewGroupName('');
    setShowGroupNameInput(false);
    setSelectedTasks(new Set());
    setShowBulkActions(false);
  };

  const handleCreateKitblock = () => {
    if (!newKitblockName.trim() || selectedTasks.size === 0) return;

    const selectedTasksList = tasks.filter(task => selectedTasks.has(task.id));
    const kitblockTasks = selectedTasksList.map(task => ({
      ...task,
      id: generateId(),
      completed: false,
      actualDuration: undefined,
      groupLabel: undefined,
      KitblockId: undefined,
      KitblockName: undefined
    }));

    const newKitblock = {
      id: generateId(),
      name: newKitblockName.trim(),
      tasks: kitblockTasks,
      createdAt: new Date().toISOString()
    };

    createKitblock(newKitblock.name, undefined, kitblockTasks);

    // Update the selected tasks to be part of the new KitBlock
    setTasks(prev => prev.map(task => {
      if (selectedTasks.has(task.id)) {
        return {
          ...task,
          KitblockId: newKitblock.id,
          KitblockName: newKitblock.name,
          groupLabel: newKitblock.name
        };
      }
      return task;
    }));

    setNewKitblockName('');
    setShowKitblockNameInput(false);
    setSelectedTasks(new Set());
    setShowBulkActions(false);
  };

  const handleGroupToKitblock = (groupLabel: string) => {
    const groupTasks = tasks.filter(task => task.groupLabel === groupLabel);
    
    // Create clean tasks for the KitBlock library
    const kitblockTasks = groupTasks.map(task => ({
      ...task,
      id: generateId(),
      completed: false,
      actualDuration: undefined,
      groupLabel: undefined,
      KitblockId: undefined,
      KitblockName: undefined
    }));

    // Create new KitBlock
    const newKitblock = {
      id: generateId(),
      name: groupLabel,
      tasks: kitblockTasks,
      createdAt: new Date().toISOString()
    };

    // Save to KitBlock library
    createKitblock(newKitblock.name, undefined, kitblockTasks);

    // Update the group tasks to be part of the new KitBlock
    setTasks(prev => prev.map(task => {
      if (task.groupLabel === groupLabel) {
        return {
          ...task,
          KitblockId: newKitblock.id,
          KitblockName: newKitblock.name,
          groupLabel: newKitblock.name // Keep group label same as KitBlock name
        };
      }
      return task;
    }));
  };

  const handleKitblockSelect = (kitblock: Kitblock) => {
    const newTasks = kitblock.tasks.map(task => ({
      ...task,
      id: generateId(),
      completed: false,
      actualDuration: undefined,
      KitblockId: kitblock.id,
      KitblockName: kitblock.name,
      groupLabel: kitblock.name
    }));

    setTasks([...tasks, ...newTasks]);
    setShowKitblockSelector(false);
  };

  const handleCalendarImport = (importedTasks: Task[]) => {
    setTasks(prev => [...prev, ...importedTasks]);
    setShowCalendarImport(false);
  };

  const toggleGroupCollapse = (groupLabel: string) => {
    setCollapsedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupLabel)) {
        newSet.delete(groupLabel);
      } else {
        newSet.add(groupLabel);
      }
      return newSet;
    });
  };

  const getGroupedTasks = () => {
    const groups = new Map<string, { tasks: Task[], isKitBlock: boolean }>();
    const ungroupedTasks: Task[] = [];

    tasks.forEach(task => {
      if (task.groupLabel) {
        if (!groups.has(task.groupLabel)) {
          groups.set(task.groupLabel, {
            tasks: [],
            isKitBlock: !!task.KitblockId
          });
        }
        groups.get(task.groupLabel)!.tasks.push(task);
      } else {
        ungroupedTasks.push(task);
      }
    });

    return {
      groups,
      ungroupedTasks
    };
  };

  const toggleBulkActions = () => {
    if (showBulkActions) {
      setSelectedTasks(new Set());
    }
    setShowBulkActions(!showBulkActions);
  };

  const renderGroupedTasks = () => {
    const { groups, ungroupedTasks } = getGroupedTasks();

    return (
      <>
        {/* Render groups first */}
        {Array.from(groups.entries()).map(([groupLabel, { tasks: groupTasks, isKitBlock }]) => (
          <div key={groupLabel} className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={() => toggleGroupCollapse(groupLabel)}
                className={`flex-1 flex items-center gap-2 py-2 px-3 rounded-lg text-left transition-colors ${
                  isKitBlock
                    ? 'bg-Tidewake-accentKB text-white hover:bg-opacity-90'
                    : 'bg-rope-100 text-navy-800 hover:bg-rope-200'
                }`}
              >
                {collapsedGroups.has(groupLabel) ? (
                  <ChevronRight size={16} className={isKitBlock ? 'text-white' : 'text-navy-500'} />
                ) : (
                  <ChevronDown size={16} className={isKitBlock ? 'text-white' : 'text-navy-500'} />
                )}
                <div className="flex items-center gap-2">
                  {isKitBlock && <Blocks size={16} className="text-white" />}
                  <span className={`text-sm font-medium ${isKitBlock ? 'text-white' : 'text-navy-800'}`}>
                    {groupLabel}
                  </span>
                </div>
                <span className={`text-xs ml-2 ${isKitBlock ? 'text-white text-opacity-80' : 'text-navy-600'}`}>
                  ({groupTasks.length} tasks)
                </span>
              </button>
              {!isKitBlock && (
                <button
                  onClick={() => handleGroupToKitblock(groupLabel)}
                  className="ml-2 p-2 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap"
                  title="Convert to KitBlock"
                >
                   <span className="text-xs font-bold">+</span>
                  <Blocks size={16} />
                </button>
              )}
            </div>

            {!collapsedGroups.has(groupLabel) && (
              <div className="space-y-2 pl-4">
                {groupTasks.map(task => (
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
                          isSelected={selectedTasks.has(task.id)}
                          onSelect={(e) => handleTaskSelect(task.id, e)}
                          selectionMode={showBulkActions}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Then render ungrouped tasks */}
        {ungroupedTasks.map(task => (
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
                  isSelected={selectedTasks.has(task.id)}
                  onSelect={(e) => handleTaskSelect(task.id, e)}
                  selectionMode={showBulkActions}
                />
              </div>
            )}
          </Draggable>
        ))}
      </>
    );
  };
  
  return (
    <div className="min-h-screen bg-rope-50">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b border-rope-200 z-50">
        <div className="container mx-auto max-w-2xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={onCancel}
                className="w-10 h-10 rounded-full bg-rope-100 text-navy-600 hover:bg-rope-200 flex items-center justify-center transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <h1 className="text-xl font-semibold text-navy-800">
                {tether ? 'Edit Tether' : 'Create Tether'}
              </h1>
            </div>
            <button
              onClick={() => setShowSettings(true)}
              className="w-10 h-10 rounded-full bg-rope-100 text-navy-600 hover:bg-rope-200 flex items-center justify-center transition-colors"
            >
              <Settings size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto max-w-2xl px-6 pt-24 pb-32">
        <div className="bg-white rounded-lg shadow-sm p-6">
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
                  <div className="text-sm text-navy-600 mt-1 flex items-center">
                    <Clock size={14} className="mr-1" />
                    Estimated end: {estimatedEndTime}
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-navy-800">Tasks</h3>
            <div className="flex items-center text-navy-600">
              <Clock className="mr-1" size={16} />
              <span className="text-sm">Total: {formatTime(totalDuration)}</span>
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
                  {renderGroupedTasks()}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
          
          <div className="sticky bottom-[70px] bg-rope-50 pt-4 border-t border-rope-100">
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
          </div>
        </div>
      </div>

      {/* Fixed Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-rope-200 px-4 py-3 z-50">
        <div className="container mx-auto max-w-2xl">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {showBulkActions ? (
                <>
                  <button
                    onClick={handleBulkDelete}
                    disabled={selectedTasks.size === 0}
                    className="px-4 py-2 text-red-500 bg-red-50 rounded-full hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1 whitespace-nowra"
                    title="Delete selected tasks"
                  >
                    <Trash size={16} />
                    <span className="text-sm">({selectedTasks.size})</span>
                  </button>
                  <button
                    onClick={handleBulkDuplicate}
                    disabled={selectedTasks.size === 0}
                    className="px-4 py-2 text-blue-500 bg-blue-50 rounded-full hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1 whitespace-nowrap"
                    title="Duplicate selected tasks"
                  >
                    <Copy size={16} />
                    <span className="text-sm">({selectedTasks.size})</span>
                  </button>
                  <button
                    onClick={() => setShowGroupNameInput(true)}
                    disabled={selectedTasks.size === 0}
                    className="px-4 py-2 text-purple-500 bg-purple-50 rounded-full hover:bg-purple-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    <FolderPlus size={16} />
                    Group ({selectedTasks.size})
                  </button>
                  <button
                    onClick={() => setShowKitblockNameInput(true)}
                    disabled={selectedTasks.size === 0}
                    className="px-4 py-2 text-emerald-500 bg-emerald-50 rounded-full hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    <Blocks size={16} />
                    New KitBlock ({selectedTasks.size})
                  </button>
                </>
              ) : (
                <>
                  {onDelete && tether && (
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="w-10 h-10 rounded-full bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors"
                    >
                      <Trash size={18} />
                    </button> 
                  )}
                  <button
                    onClick={toggleBulkActions}
                    className="w-10 h-10 rounded-full bg-rope-100 text-navy-600 hover:bg-rope-200 flex items-center justify-center transition-colors"
                  >
                    <CheckSquare size={18} />
                  </button>
                  <button
                    onClick={() => setShowCalendarImport(true)}
                    className="w-10 h-10 rounded-full bg-rope-100 text-navy-600 hover:bg-rope-200 flex items-center justify-center transition-colors"
                  >
                    <CalendarPlus size={18} />
                  </button>
                  <button
                    onClick={() => setShowKitblockSelector(true)}
                    className="w-10 h-10 rounded-full bg-rope-100 text-navy-600 hover:bg-rope-200 flex items-center justify-center transition-colors"
                  >
                    <Blocks size={18} />
                  </button>
                </>
              )}
            </div>

            {showBulkActions ? (
              <button
                onClick={toggleBulkActions}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            ) : (
              <button
                onClick={() => onSave(name, tasks, useFixedStartTime ? startTime : undefined)}
                disabled={!name.trim() || tasks.length === 0}
                className={`px-4 py-2 rounded-full text-sm font-semibold shadow flex items-center ${
                  !name.trim() || tasks.length === 0
                    ? 'bg-rope-200 text-navy-400 cursor-not-allowed'
                    : 'bg-navy-500 text-white hover:bg-navy-600'
                }`}
              >
                <Save size={16} className="mr-2" />
                Save
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Calendar Import Modal */}
      {showCalendarImport && (
        <CalendarImport
          onImport={handleCalendarImport}
          onClose={() => setShowCalendarImport(false)}
        />
      )}

      {/* Group Name Input Modal */}
      {showGroupNameInput && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Create Group</h2>
              <input
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Enter group name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
                autoFocus
              />
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowGroupNameInput(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateGroup}
                  className="px-4 py-2 text-sm font-medium text-white bg-purple-500 rounded-md hover:bg-purple-600"
                  disabled={!newGroupName.trim()}
                >
                  Create Group
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KitBlock Name Input Modal */}
      {showKitblockNameInput && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-800  mb-4">Save as KitBlock</h2>
              <input
                type="text"
                value={newKitblockName}
                onChange={(e) => setNewKitblockName(e.target.value)}
                placeholder="Enter KitBlock name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-4"
                autoFocus
              />
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowKitblockNameInput(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateKitblock}
                  className="px-4 py-2 text-sm font-medium text-white bg-emerald-500 rounded-md hover:bg-emerald-600"
                  disabled={!newKitblockName.trim()}
                >
                  Create KitBlock
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KitBlock Selector Modal */}
      {showKitblockSelector && (
        <KitBlockSelector
          onSelect={handleKitblockSelect}
          onClose={() => setShowKitblockSelector(false)}
        />
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Delete Tether?</h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this tether? This action cannot be undone.
              </p>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (onDelete && tether) {
                      onDelete(tether.id);
                    }
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TetherForm;