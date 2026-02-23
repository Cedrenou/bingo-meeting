import { useEffect } from 'react';
import clsx from 'clsx';
import { useTimer } from '../../hooks/useTimer';

interface ThemeTimerProps {
  durationSeconds: number | null;
  initialElapsed?: number;
  autoStart?: boolean;
  onElapsedChange?: (elapsed: number) => void;
}

export function ThemeTimer({ durationSeconds, initialElapsed = 0, autoStart = true, onElapsedChange }: ThemeTimerProps) {
  const timer = useTimer(durationSeconds, initialElapsed);

  useEffect(() => {
    if (autoStart && durationSeconds && !timer.isRunning && !timer.isExpired) {
      timer.start();
    }
  }, [autoStart, durationSeconds]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    onElapsedChange?.(timer.elapsed);
  }, [timer.elapsed, onElapsedChange]);

  if (!durationSeconds) return null;

  return (
    <div
      className={clsx(
        'flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-sm font-bold transition-all',
        timer.isExpired
          ? 'bg-red-500/30 text-red-300 animate-pulse'
          : timer.remaining <= 60
            ? 'bg-orange-500/20 text-orange-300'
            : 'bg-white/10 text-white/70'
      )}
    >
      <span>⏱</span>
      <span>{timer.formattedRemaining}</span>
      {timer.isExpired && <span className="text-red-400">Temps écoulé !</span>}
    </div>
  );
}
