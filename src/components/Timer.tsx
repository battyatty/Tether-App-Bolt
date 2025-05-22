import React, { useState, useEffect, useRef } from 'react';
import { formatTimerDisplay } from '../utils/helpers';
import RadialTimer from './RadialTimer';

interface TimerProps {
  duration: number; // in minutes
  isRunning: boolean;
  onComplete: () => void;
  showAlert: boolean;
  taskStartTimestamp: string; // ISO string
  pausedDuration?: number; // Total seconds already elapsed (for pause)
}

const Timer: React.FC<TimerProps> = ({
  duration,
  isRunning,
  onComplete,
  showAlert,
  taskStartTimestamp,
  pausedDuration = 0
}) => {
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [isOvertime, setIsOvertime] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!isRunning || !taskStartTimestamp || isNaN(new Date(taskStartTimestamp).getTime())) {
      return;
    }

    const calculateTimeLeft = () => {
      const start = new Date(taskStartTimestamp).getTime();
      const now = Date.now();
      const elapsedSeconds = Math.floor((now - start) / 1000);
      const adjustedElapsed = elapsedSeconds - pausedDuration;
      const remaining = (duration * 60) - adjustedElapsed;
      
      setTimeLeft(remaining);
      setIsOvertime(remaining <= 0);

      if (remaining <= 0 && showAlert && audioRef.current) {
        audioRef.current.play().catch(err => console.error('Sound error:', err));
      }
    };

    // Initial calculation
    calculateTimeLeft();

    // Only start interval if running
    if (isRunning) {
      intervalRef.current = setInterval(calculateTimeLeft, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [taskStartTimestamp, duration, isRunning, pausedDuration, showAlert]);

  const progress = Math.max(0, Math.min(1, (duration * 60 - timeLeft) / (duration * 60)));

  return (
    <div className="w-full flex flex-col items-center">
      <audio
        ref={audioRef}
        src="https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3"
      />
      <RadialTimer
        timeLeft={timeLeft}
        duration={duration * 60}
        progress={progress}
        isOvertime={isOvertime}
        displayTime={formatTimerDisplay(Math.abs(timeLeft))}
        isRunning={isRunning}
      />
    </div>
  );
};

export default Timer;