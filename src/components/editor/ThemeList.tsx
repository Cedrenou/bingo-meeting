import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { ThemeRow } from './ThemeRow';
import { Button } from '../ui/Button';
import { THEME_COLORS, EMOJIS, MAX_THEMES } from '../../lib/constants';

interface ThemeData {
  id: string;
  title: string;
  emoji: string;
  color: string;
  timer_duration: number | null;
}

interface ThemeListProps {
  themes: ThemeData[];
  onChange: (themes: ThemeData[]) => void;
}

export function ThemeList({ themes, onChange }: ThemeListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = themes.findIndex((t) => t.id === active.id);
      const newIndex = themes.findIndex((t) => t.id === over.id);
      onChange(arrayMove(themes, oldIndex, newIndex));
    }
  };

  const addTheme = () => {
    if (themes.length >= MAX_THEMES) return;
    const newTheme: ThemeData = {
      id: `temp-${crypto.randomUUID()}`,
      title: '',
      emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
      color: THEME_COLORS[themes.length % THEME_COLORS.length],
      timer_duration: null,
    };
    onChange([...themes, newTheme]);
  };

  const updateTheme = (id: string, updates: Partial<ThemeData>) => {
    onChange(themes.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  const deleteTheme = (id: string) => {
    onChange(themes.filter((t) => t.id !== id));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">
          Thèmes ({themes.length}/{MAX_THEMES})
        </h3>
        <Button
          variant="secondary"
          size="sm"
          onClick={addTheme}
          disabled={themes.length >= MAX_THEMES}
        >
          + Ajouter un thème
        </Button>
      </div>

      {themes.length === 0 ? (
        <div className="text-center py-12 text-white/40">
          <p className="text-4xl mb-3">📋</p>
          <p>Aucun thème. Ajoutez-en un pour commencer.</p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={themes.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {themes.map((theme) => (
                <ThemeRow
                  key={theme.id}
                  theme={theme}
                  onUpdate={(updates) => updateTheme(theme.id, updates)}
                  onDelete={() => deleteTheme(theme.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
