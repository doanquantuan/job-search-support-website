import { useState, useEffect, useRef, useCallback } from 'react';

export function useCountdown(initialSeconds = 300, autoStart = true, onExpire) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(autoStart);
  const totalSecondsRef = useRef(initialSeconds);
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    if (!isRunning) return;

    if (seconds <= 0) {
      setIsRunning(false);
      if (onExpireRef.current) {
        onExpireRef.current();
      }
      return;
    }

    const timer = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsRunning(false);
          if (onExpireRef.current) {
            onExpireRef.current();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, seconds]);

  const reset = useCallback((newSeconds) => {
    const sec = typeof newSeconds === 'number' ? newSeconds : totalSecondsRef.current;
    totalSecondsRef.current = sec;
    setSeconds(sec);
    setIsRunning(true);
  }, []);

  const stop = useCallback(() => {
    setIsRunning(false);
  }, []);

  const start = useCallback(() => {
    if (seconds > 0) {
      setIsRunning(true);
    }
  }, [seconds]);

  // Format as mm:ss
  const formatTime = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const percentage = (seconds / (totalSecondsRef.current || 1)) * 100;

  return {
    seconds,
    formattedTime: formatTime(seconds),
    isExpired: seconds <= 0,
    isRunning,
    percentage,
    reset,
    stop,
    start,
  };
}
