import { useEffect } from 'react';
import confetti from 'canvas-confetti';

interface ConfettiEffectProps {
  trigger: boolean;
}

export function ConfettiEffect({ trigger }: ConfettiEffectProps) {
  useEffect(() => {
    if (!trigger) return;

    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#22c55e'],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#22c55e'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, [trigger]);

  if (!trigger) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none animate-fade-in">
      <div className="text-center">
        <h2 className="text-5xl md:text-7xl font-extrabold bg-gradient-to-r from-emerald-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent mb-4">
          BINGO !
        </h2>
        <p className="text-xl md:text-2xl text-white/70">
          Tous les sujets ont été traités !
        </p>
      </div>
    </div>
  );
}
