import { useCallback, useEffect, useRef, useState } from 'react';

interface TimerState {
  remaining: number;
  elapsed: number;
  isRunning: boolean;
  isExpired: boolean;
}

export function useTimer(durationSeconds: number | null, initialElapsed: number = 0) {
  const [state, setState] = useState<TimerState>({
    remaining: durationSeconds ? Math.max(0, durationSeconds - initialElapsed) : 0,
    elapsed: initialElapsed,
    isRunning: false,
    isExpired: durationSeconds ? initialElapsed >= durationSeconds : false,
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const baseElapsedRef = useRef<number>(initialElapsed);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setState((prev) => ({ ...prev, isRunning: false }));
  }, []);

  const start = useCallback(() => {
    if (!durationSeconds) return;

    startTimeRef.current = Date.now();
    baseElapsedRef.current = state.elapsed;

    setState((prev) => ({ ...prev, isRunning: true }));

    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const newElapsed = baseElapsedRef.current + Math.floor((now - startTimeRef.current) / 1000);
      const newRemaining = Math.max(0, durationSeconds - newElapsed);

      setState({
        elapsed: newElapsed,
        remaining: newRemaining,
        isRunning: true,
        isExpired: newRemaining === 0,
      });

      if (newRemaining === 0) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    }, 1000);
  }, [durationSeconds, state.elapsed]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    ...state,
    start,
    stop,
    formattedRemaining: formatTime(state.remaining),
    formattedElapsed: formatTime(state.elapsed),
  };
}
