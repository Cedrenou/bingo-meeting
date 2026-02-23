import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { EmojiPicker } from './EmojiPicker';
import { ColorPicker } from './ColorPicker';
import { Button } from '../ui/Button';

interface ThemeRowData {
  id: string;
  title: string;
  emoji: string;
  color: string;
  timer_duration: number | null;
}

interface ThemeRowProps {
  theme: ThemeRowData;
  onUpdate: (updates: Partial<ThemeRowData>) => void;
  onDelete: () => void;
}

export function ThemeRow({ theme, onUpdate, onDelete }: ThemeRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: theme.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 glass rounded-xl group"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-white/30 hover:text-white/60 transition-colors touch-none"
        aria-label="Réorganiser"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <circle cx="5" cy="3" r="1.5" />
          <circle cx="11" cy="3" r="1.5" />
          <circle cx="5" cy="8" r="1.5" />
          <circle cx="11" cy="8" r="1.5" />
          <circle cx="5" cy="13" r="1.5" />
          <circle cx="11" cy="13" r="1.5" />
        </svg>
      </button>

      <EmojiPicker value={theme.emoji} onChange={(emoji) => onUpdate({ emoji })} />

      <input
        type="text"
        value={theme.title}
        onChange={(e) => onUpdate({ title: e.target.value })}
        placeholder="Titre du thème"
        className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 text-sm"
      />

      <ColorPicker value={theme.color} onChange={(color) => onUpdate({ color })} />

      <div className="flex items-center gap-1.5">
        <span className="text-white/40 text-xs">⏱</span>
        <input
          type="number"
          value={theme.timer_duration ? theme.timer_duration / 60 : ''}
          onChange={(e) => {
            const val = e.target.value;
            onUpdate({ timer_duration: val ? parseInt(val) * 60 : null });
          }}
          placeholder="min"
          min="1"
          max="120"
          className="w-16 px-2 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 text-sm text-center"
        />
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 !px-2"
        aria-label="Supprimer le thème"
      >
        ✕
      </Button>
    </div>
  );
}
