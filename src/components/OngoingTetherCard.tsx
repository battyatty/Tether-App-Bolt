import React from 'react';
import { Clock, Anchor } from 'lucide-react';
import { ActiveTether } from '../types';
import { formatTimerDisplay } from '../utils/helpers';

interface OngoingTetherCardProps {
  tether: ActiveTether;
  currentTaskName: string;
  elapsedTime: number;
  isAnchored?: boolean;
  isPaused?: boolean;
  isOvertime?: boolean;
  onClick: () => void;
}

const OngoingTetherCard: React.FC<OngoingTetherCardProps> = ({
  tether,
  currentTaskName,
  elapsedTime,
  isAnchored,
  isPaused,
  isOvertime,
  onClick,
}) => {
  const getVariantStyles = () => {
    if (isOvertime) {
      return {
        bg: 'bg-Tidewake-alert bg-opacity-10',
        border: 'border-Tidewake-alert',
        text: 'text-Tidewake-alert',
        subtext: 'text-Tidewake-alert text-opacity-80'
      };
    }
    if (isPaused) {
      return {
        bg: 'bg-Tidewake-paused bg-opacity-10',
        border: 'border-Tidewake-paused',
        text: 'text-Tidewake-paused',
        subtext: 'text-Tidewake-paused text-opacity-80'
      };
    }
    if (isAnchored) {
      return {
        bg: 'bg-Tidewake-anchor bg-opacity-10',
        border: 'border-Tidewake-anchor',
        text: 'text-Tidewake-anchor',
        subtext: 'text-Tidewake-anchor text-opacity-80'
      };
    }
    return {
      bg: 'bg-Tidewake-timer bg-opacity-10',
      border: 'border-Tidewake-timer',
      text: 'text-Tidewake-timer',
      subtext: 'text-Tidewake-timer text-opacity-80'
    };
  };

  const styles = getVariantStyles();

  return (
    <div
      onClick={onClick}
      className={`w-full sm:w-[90%] md:w-[80%] lg:w-[372px] max-w-full mx-auto h-[77px] px-5 py-4 rounded-2xl ${styles.bg} border-l-4 ${styles.border} cursor-pointer transition-all duration-200 hover:bg-opacity-20`}
    >
      <div className="flex items-center justify-between h-full">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className={`text-base font-medium ${styles.text} truncate`}>
              {tether.name}
            </h2>
            {isAnchored && <Anchor size={14} className={styles.text} />}
          </div>
          <div className="flex items-center text-sm mt-0.5">
            <Clock size={14} className={`mr-1 flex-shrink-0 ${styles.subtext}`} />
            <span className={`truncate ${styles.subtext}`}>
              Now: {currentTaskName}
            </span>
          </div>
        </div>

        <div className={`font-mono text-lg ${styles.text}`}>
          {formatTimerDisplay(Math.max(elapsedTime, 0))}
        </div>
      </div>
    </div>
  );
};

export default OngoingTetherCard;