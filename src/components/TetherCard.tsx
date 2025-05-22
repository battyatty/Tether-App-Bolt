import React from 'react';
import { Clock, MoreVertical, Play } from 'lucide-react';
import { Draggable } from '@hello-pangea/dnd';
import { Tether, ActiveTether } from '../types';
import { formatTime, getEstimatedEndTime, getTotalDuration } from '../utils/helpers';

interface TetherCardProps {
  tether: Tether;
  index: number;
  isDragging: boolean;
  openMenuId: string | null;
  activeTether: ActiveTether | null;
  onClick: (e: React.MouseEvent, id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onStart: (id: string) => void;
  setOpenMenu: (id: string | null) => void;
}

const TetherCard: React.FC<TetherCardProps> = ({
  tether,
  index,
  isDragging,
  openMenuId,
  activeTether,
  onClick,
  onEdit,
  onDelete,
  onDuplicate,
  onStart,
  setOpenMenu,
}) => {
  const formatTimeRange = (startTime: string) => {
    const [hours, minutes] = startTime.split(':');
    const start = new Date();
    start.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
    
    const end = new Date(start.getTime() + getTotalDuration(tether) * 60 * 1000);
    
    return `${start.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} – ${end.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
  };

  return (
    <Draggable draggableId={tether.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={(e) => onClick(e, tether.id)}
          className={`w-full sm:w-[90%] md:w-[80%] lg:w-[372px] max-w-full mx-auto h-[77px] px-5 py-4 rounded-2xl bg-Tidewake-card border-l-4 ${
            snapshot.isDragging || isDragging ? 'opacity-75' : ''
          } ${tether.startTime ? 'border-Tidewake-anchor' : 'border-Tidewake-accentSoft'}`}
        >
          <div className="flex items-center justify-between h-full">
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-medium text-Tidewake-text truncate">{tether.name}</h2>
              <div className="flex items-center text-sm text-Tidewake-textAlt mt-0.5">
                <Clock size={14} className="mr-1 flex-shrink-0" />
                <span className="truncate">
                  {tether.startTime ? (
                    formatTimeRange(tether.startTime)
                  ) : (
                    `${formatTime(getTotalDuration(tether))} • ${tether.tasks.length} tasks`
                  )}
                </span>
              </div>
            </div>

            <div className="flex items-center ml-4">
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenMenu(openMenuId === tether.id ? null : tether.id);
                  }}
                  className="p-1.5 text-Tidewake-icon hover:text-Tidewake-text hover:bg-Tidewake-noteBackground rounded-full transition-colors"
                >
                  <MoreVertical size={16} />
                </button>

                {openMenuId === tether.id && (
                  <div className="absolute right-0 mt-1 w-48 bg-Tidewake-card rounded-md shadow-lg py-1 z-10">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(tether.id);
                        setOpenMenu(null);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-Tidewake-text hover:bg-Tidewake-noteBackground"
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDuplicate(tether.id);
                        setOpenMenu(null);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-Tidewake-text hover:bg-Tidewake-noteBackground"
                    >
                      Duplicate
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(tether.id);
                        setOpenMenu(null);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-alert hover:bg-Tidewake-noteBackground"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onStart(tether.id);
                }}
                className={`ml-2 p-1.5 rounded-full transition-colors ${
                  activeTether
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-Tidewake-playRing text-Tidewake-playIcon hover:bg-Tidewake-tealAccent'
                }`}
                disabled={!!activeTether}
                aria-label="Start Tether"
              >
                <Play size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default TetherCard;