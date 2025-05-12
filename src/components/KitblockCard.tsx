import React, { useState } from 'react';
import { Kitblock } from '../types';
import { Clock, MoreVertical, Play } from 'lucide-react';
import { formatTime } from '../utils/helpers';

interface KitblockCardProps {
  block: Kitblock;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onUse: (block: Kitblock) => void;
}

const KitblockCard: React.FC<KitblockCardProps> = ({
  block,
  onEdit,
  onDelete,
  onDuplicate,
  onUse,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  
  const getTotalDuration = () => {
    return block.tasks.reduce((total, task) => total + task.duration, 0);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    onEdit(block.id);
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow border-l-4 border-purple-500 cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-800 truncate">{block.name}</h3>
          <div className="flex items-center text-sm text-gray-500 mt-1">
            <Clock size={14} className="mr-1 flex-shrink-0" />
            <span className="truncate">
              {formatTime(getTotalDuration())} • {block.tasks.length} tasks
            </span>
          </div>
          {block.description && (
            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
              {block.description}
            </p>
          )}
        </div>
        
        <div className="flex items-center ml-4">
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            >
              <MoreVertical size={16} />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(block.id);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicate(block.id);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Duplicate
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(block.id);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUse(block);
            }}
            className="ml-2 p-1.5 bg-purple-500 hover:bg-purple-600 text-white rounded-full transition-colors"
            aria-label="Use Kitblock"
          >
            <Play size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default KitblockCard;