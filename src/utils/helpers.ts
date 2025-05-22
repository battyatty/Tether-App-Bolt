// Generate a unique ID
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, '9');
};

// Format time from minutes to "Xh Xm"
export const formatTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);
  
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
};

// Format time for timer display (HH:MM:SS)
export const formatTimerDisplay = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// Format datetime for 12-hour display with AM/PM
export const formatDateTime = (isoString: string): string => {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) {
      return 'Invalid time';
    }
    return date.toLocaleTimeString([], { 
      hour: 'numeric',
      minute: '2-digit',
      hour12: true 
    });
  } catch {
    return 'Invalid time';
  }
};

// Get readable time difference
export const getTimeDiff = (startTime: string, endTime: string): string => {
  try {
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return '0m';
    }
    
    const diffMs = end.getTime() - start.getTime();
    const diffMinutes = diffMs / (1000 * 60);
    
    const hours = Math.floor(diffMinutes / 60);
    const minutes = Math.floor(diffMinutes % 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  } catch {
    return '0m';
  }
};

// Format time range in 12-hour format (e.g., "9:00 AM - 10:30 AM")
export const formatTimeRange = (startTime: string, endTime: string): string => {
  try {
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return 'Invalid time range';
    }
    
    const startStr = start.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    
    const endStr = end.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    
    return `${startStr} - ${endStr}`;
  } catch {
    return 'Invalid time range';
  }
};

// Create a duplicate task with reset anchor status
export const duplicateTask = (task: Task): Task => {
  return {
    ...task,
    id: generateId(),
    name: `${task.name} (copy)`,
    isAnchored: false,
    anchoredStartTime: undefined,
    completed: false,
    actualDuration: undefined,
    status: undefined
  };
};

// Get estimated end time for a tether
export const getEstimatedEndTime = (tether: Tether): string | null => {
  try {
    if (!tether.startTime) return null;
    
    const start = new Date(tether.startTime);
    if (isNaN(start.getTime())) return null;
    
    const totalDuration = getTotalDuration(tether);
    const endTime = new Date(start.getTime() + totalDuration * 60000); // Add duration in milliseconds
    
    if (isNaN(endTime.getTime())) return null;
    
    return formatDateTime(endTime.toISOString());
  } catch {
    return null;
  }
};

// Calculate total duration of all tasks in a tether
export const getTotalDuration = (tether: Tether): number => {
  return tether.tasks.reduce((total, task) => {
    return total + (task.duration || 0);
  }, 0);
};

// Calculate estimated end time based on tasks
export const recalculateEstimatedEndTime = (tasks: Task[]): Date => {
  const now = new Date();
  const totalMs = tasks.reduce((sum, task) => sum + (task.duration || 0) * 60000, 0);
  return new Date(now.getTime() + totalMs);
};