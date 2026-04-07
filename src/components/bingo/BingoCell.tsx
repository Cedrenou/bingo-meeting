import clsx from 'clsx';
import type { Theme } from '../../types';

interface BingoCellProps {
  theme: Theme;
  onClick: () => void;
  readOnly?: boolean;
}

export function BingoCell({ theme, onClick, readOnly = false }: BingoCellProps) {
  return (
    <button
      onClick={onClick}
      disabled={readOnly && !theme.is_done}
      className={clsx(
        'relative flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-colors duration-200 overflow-hidden aspect-square max-h-full',
        theme.is_done
          ? 'bg-emerald-900/30 border-emerald-500/30'
          : 'border-white/10 hover:border-white/30 cursor-pointer'
      )}
      style={
        !theme.is_done
          ? {
              background: `linear-gradient(135deg, ${theme.color}20, ${theme.color}40)`,
              boxShadow: `0 0 20px ${theme.color}15`,
            }
          : undefined
      }
      aria-label={`${theme.emoji} ${theme.title}${theme.is_done ? ' — traité' : ''}`}
    >
      {theme.is_done && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-6xl opacity-10">✓</span>
        </div>
      )}

      <span className={clsx('text-3xl md:text-4xl', theme.is_done && 'opacity-50')}>
        {theme.emoji}
      </span>

      <span
        className={clsx(
          'text-sm md:text-base font-bold text-center leading-tight',
          theme.is_done ? 'line-through text-white/40' : 'text-white'
        )}
      >
        {theme.title}
      </span>

      {theme.is_done && (
        <span className="absolute top-2 right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-xs font-bold">
          ✓
        </span>
      )}

      {!theme.is_done && theme.photos && theme.photos.length > 0 && (
        <span className="absolute top-2 right-2 bg-white/10 rounded-full px-2 py-0.5 text-xs text-white/60">
          📷 {theme.photos.length}
        </span>
      )}
    </button>
  );
}
