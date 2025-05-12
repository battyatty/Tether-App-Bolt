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
  const [timeLeft, setTimeLeft] = useState(
    duration * 60 - pausedDuration
  );
  const [isOvertime, setIsOvertime] = useState(timeLeft <= 0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

 useEffect(() => {
  if (!taskStartTimestamp || isNaN(new Date(taskStartTimestamp).getTime())) {
    console.warn('Invalid or missing taskStartTimestamp:', taskStartTimestamp);
    return;
  }

  const secondsSinceStart = Math.floor(
    (Date.now() - new Date(taskStartTimestamp).getTime()) / 1000
  );

  const updatedTimeLeft = Math.max(duration * 60 - secondsSinceStart, -3600);

  setTimeLeft(updatedTimeLeft);
  setIsOvertime(updatedTimeLeft <= 0);
}, [taskStartTimestamp, duration]);
  
  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev > 0 && !isOvertime) return prev - 1;
        setIsOvertime(true);
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, isOvertime]);

  useEffect(() => {
    if (timeLeft === 0 && showAlert && audioRef.current) {
      audioRef.current.play().catch(err => console.error('Sound error:', err));
    }
  }, [timeLeft, showAlert]);

  const displayTime = formatTimerDisplay(Math.abs(timeLeft));

  return (
    <div className="w-full flex flex-col items-center">
      <audio
        ref={audioRef}
        src="https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3"
      />
      <RadialTimer
        timeLeft={timeLeft}
        duration={duration}
        isOvertime={isOvertime}
        displayTime={displayTime}
        isRunning={isRunning}
      />
    </div>
  );
};

export default Timer;