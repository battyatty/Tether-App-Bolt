export interface Task {
  id: string;
  name: string;
  duration: number; // in minutes
  notes?: string;
  isAnchored: boolean;
  anchoredStartTime?: string;
  completed: boolean;
  actualDuration?: number;
  scheduledDate?: string;
  KitblockId?: string;
  KitblockName?: string;
  status?: TaskStatus;
}

export type TaskStatus = 'pending' | 'completed' | 'skipped' | 'partial';

export interface Kitblock {
  id: string;
  name: string;
  description?: string;
  tasks: Task[];
  createdAt: string;
  lastUsed?: string;
}

export interface Tether {
  id: string;
  name: string;
  tasks: Task[];
  createdAt: string;
  lastUsed?: string;
  startTime?: string;
}

export interface ActiveTether extends Tether {
  startTime: string;
  endTime: string;
  currentTaskIndex: number;
  isRunning: boolean;
  isPaused: boolean;
  actualStartTime?: string;
}

export interface TetherSummary {
  tetherId: string;
  tetherName: string;
  date: string;
  startTime: string;
  endTime: string;
  plannedDuration: number;
  actualDuration: number;
  tasks: {
    id: string;
    name: string;
    plannedDuration: number;
    actualDuration: number;
    status?: TaskStatus;
  }[];
}