// components/TetherCard.tsx – Tidewake Themed (Cleaned UI-only)

import React from 'react';
import { PlayIcon, MoreVerticalIcon, ClockIcon } from 'lucide-react';
import { Tether } from '../types';
import { formatTime, formatTimeRange } from '../utils/helpers';

interface TetherCardProps {
  tether: Tether;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onStart: (id: string) => void;
}

const TetherCard: React.FC<TetherCardProps> = ({ tether, onEdit, onDelete, onDuplicate, onStart }) => {
  const getTotalDuration = () =>
    tether.tasks.reduce((total, task) => total + task.duration, 0);

  const getEstimatedEndTime = (): string | null => {
    if (!tether.startTime) return null;
    const [h, m] = tether.startTime.split(':');
    const start = new Date();
    start.setHours(+h, +m, 0, 0);
    const end = new Date(start.getTime() + getTotalDuration() * 60 * 1000);
    return formatTimeRange(start.toISOString(), end.toISOString());
  };

  return (
    <div className="bg-theme-card p-4 mb-3 rounded-2xl flex-row flex items-center justify-between shadow-[0_2px_4px] shadow-theme-cardShadow cursor-pointer">
      <div className="flex flex-col flex-grow min-w-0">
        <h3 className="text-theme-text text-base font-semibold truncate">{tether.name}</h3>
        <p className="text-theme-textAlt text-sm mt-1 flex items-center">
          <ClockIcon size={14} className="mr-1" />
          {tether.startTime
            ? getEstimatedEndTime()
            : `${formatTime(getTotalDuration())} · ${tether.tasks.length} tasks`}
        </p>
      </div>

      <div className="flex items-center gap-2 ml-4">
        <button
          onClick={() => onEdit(tether.id)}
          className="text-theme-icon hover:text-theme-accentSoft transition-colors"
        >
          <MoreVerticalIcon size={20} />
        </button>
        <button
          onClick={() => onStart(tether.id)}
          className="bg-theme.timer p-2 rounded-full flex items-center justify-center hover:scale-105 transition-transform"
        >
          <PlayIcon size={18} color="white" />
        </button>
      </div>
    </div>
  );
};

export default TetherCard;
