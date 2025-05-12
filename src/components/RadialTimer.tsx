import React from 'react';
import { Bell } from 'lucide-react';

interface RadialTimerProps {
  timeLeft: number;
  duration: number;
  isOvertime: boolean;
  displayTime: string;
  isRunning: boolean;
}

const RadialTimer: React.FC<RadialTimerProps> = ({
  timeLeft,
  duration,
  isOvertime,
  displayTime,
  isRunning
}) => {
  const radius = 130;
  const circumference = 2 * Math.PI * radius;
  const progress = isOvertime
  ? 0
  : (Math.max(timeLeft, 0) / (duration * 60)) * circumference;

  const getTimerColor = () => {
    if (!isRunning) return 'text-amber-500';
    if (isOvertime) return 'text-red-500 animate-[pulse_2s_ease-in-out_infinite]';
    return 'text-blue-500';
  };

  return (
    <div className="relative w-[280px] h-[280px]">
     <svg className="w-[280px] h-[280px]">
  <circle
    cx="140"
    cy="140"
    r={radius}
    stroke="currentColor"
    strokeWidth="12"
    fill="none"
    className="text-gray-100"
    transform="rotate(-90 140 140)"
  />
  {!isOvertime ? (
   <circle
  cx="140"
  cy="140"
  r={radius}
  stroke="currentColor"
  strokeWidth="12"
  fill="none"
  strokeDasharray={circumference}
  strokeDashoffset={circumference - progress}
  className="text-blue-500 transition-all duration-1000 ease-linear"
  strokeLinecap="round"
  transform="rotate(-90 140 140)"
/>
  ) : (
    <circle
      cx="140"
      cy="140"
      r={radius}
      stroke="currentColor"
      strokeWidth="12"
      fill="none"
      className="text-red-500 animate-pulse"
      strokeLinecap="round"
      transform="rotate(-90 140 140)"
    />
  )}
</svg>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
        {isOvertime && isRunning && (
          <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
            <Bell className="w-8 h-8 text-red-500 animate-bounce" />
          </div>
        )}
        <span className={`text-6xl font-mono font-bold ${
          !isRunning ? 'text-amber-500' :
          isOvertime ? 'text-red-500 animate-[pulse_2s_ease-in-out_infinite]' : 
          'text-gray-800'
        }`}>
          {displayTime}
        </span>
        {isOvertime && isRunning && (
          <p className="text-red-500 mt-2 font-medium animate-[pulse_2s_ease-in-out_infinite]">
            Over time
          </p>
        )}
        {!isRunning && (
          <p className="text-amber-500 mt-2 font-medium">
            Paused
          </p>
        )}
      </div>
    </div>
  );
};

export default RadialTimer;