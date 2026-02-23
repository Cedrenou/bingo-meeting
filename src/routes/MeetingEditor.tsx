import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ThemeList } from '../components/editor/ThemeList';
import { Spinner } from '../components/ui/Spinner';
import { useMeeting, useMeetingActions } from '../hooks/useMeeting';
import { useThemes, useThemeActions } from '../hooks/useThemes';
import { useToast } from '../hooks/useToast';
import { MIN_GRID_COLS, MAX_GRID_COLS } from '../lib/constants';

interface ThemeData {
  id: string;
  title: string;
  emoji: string;
  color: string;
  timer_duration: number | null;
}

export function MeetingEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const isEdit = Boolean(id);

  const { meeting, loading: meetingLoading } = useMeeting(id);
  const { themes: existingThemes, loading: themesLoading } = useThemes(id);
  const { createMeeting, updateMeeting } = useMeetingActions();
  const { createTheme, updateTheme, deleteTheme, reorderThemes } = useThemeActions();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [gridCols, setGridCols] = useState(3);
  const [themes, setThemes] = useState<ThemeData[]>([]);
  const [saving, setSaving] = useState(false);

  // Initialize form from existing meeting data
  useEffect(() => {
    if (meeting) {
      setTitle(meeting.title);
      setDescription(meeting.description || '');
      setGridCols(meeting.grid_cols);
    }
  }, [meeting]);

  useEffect(() => {
    if (existingThemes.length > 0) {
      setThemes(
        existingThemes.map((t) => ({
          id: t.id,
          title: t.title,
          emoji: t.emoji,
          color: t.color,
          timer_duration: t.timer_duration,
        }))
      );
    }
  }, [existingThemes]);

  const handleSave = async (launch: boolean = false) => {
    if (!title.trim()) {
      addToast('Le titre est obligatoire', 'error');
      return;
    }

    const validThemes = themes.filter((t) => t.title.trim());
    if (validThemes.length === 0) {
      addToast('Ajoutez au moins un thème', 'error');
      return;
    }

    setSaving(true);

    try {
      let meetingId = id;

      if (isEdit && meetingId) {
        await updateMeeting(meetingId, {
          title: title.trim(),
          description: description.trim() || null,
          grid_cols: gridCols,
          ...(launch ? { status: 'in_progress' as const } : {}),
        });

        // Sync themes: delete removed, update existing, create new
        const existingIds = new Set(existingThemes.map((t) => t.id));
        const newIds = new Set(validThemes.map((t) => t.id));

        // Delete removed themes
        for (const existing of existingThemes) {
          if (!newIds.has(existing.id)) {
            await deleteTheme(existing.id);
          }
        }

        // Update or create themes
        for (let i = 0; i < validThemes.length; i++) {
          const t = validThemes[i];
          if (existingIds.has(t.id)) {
            await updateTheme(t.id, {
              title: t.title.trim(),
              emoji: t.emoji,
              color: t.color,
              position: i,
              timer_duration: t.timer_duration,
            });
          } else {
            await createTheme({
              meeting_id: meetingId,
              title: t.title.trim(),
              emoji: t.emoji,
              color: t.color,
              position: i,
              timer_duration: t.timer_duration,
            });
          }
        }

        // Reorder
        await reorderThemes(validThemes.map((t, i) => ({
          ...existingThemes.find((et) => et.id === t.id) || {} as never,
          id: t.id,
          meeting_id: meetingId!,
          title: t.title,
          position: i,
        })));
      } else {
        // Create new meeting
        const newMeeting = await createMeeting({
          title: title.trim(),
          description: description.trim() || null,
          grid_cols: gridCols,
        });

        if (!newMeeting) {
          setSaving(false);
          return;
        }

        meetingId = newMeeting.id;

        // Create themes
        for (let i = 0; i < validThemes.length; i++) {
          const t = validThemes[i];
          await createTheme({
            meeting_id: meetingId,
            title: t.title.trim(),
            emoji: t.emoji,
            color: t.color,
            position: i,
            timer_duration: t.timer_duration,
          });
        }

        if (launch) {
          await updateMeeting(meetingId, { status: 'in_progress' });
        }
      }

      if (launch) {
        navigate(`/meeting/${meetingId}/play`);
      } else {
        addToast('Sauvegardé !', 'success');
        if (!isEdit) {
          navigate(`/meeting/${meetingId}/edit`);
        }
      }
    } catch {
      addToast('Erreur lors de la sauvegarde', 'error');
    }

    setSaving(false);
  };

  if (isEdit && (meetingLoading || themesLoading)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-white">
          {isEdit ? 'Modifier la réunion' : 'Nouvelle réunion'}
        </h1>
        <Button variant="ghost" onClick={() => navigate('/dashboard')}>
          Retour
        </Button>
      </div>

      {/* General settings */}
      <div className="glass p-6 space-y-4">
        <h2 className="text-lg font-bold text-white">Paramètres généraux</h2>
        <Input
          label="Titre"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: Réunion d'équipe hebdomadaire"
          required
        />
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-white/70">Description (optionnel)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description de la réunion..."
            rows={3}
            className="input-field resize-none"
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-white/70">
            Colonnes de la grille ({gridCols})
          </label>
          <input
            type="range"
            min={MIN_GRID_COLS}
            max={MAX_GRID_COLS}
            value={gridCols}
            onChange={(e) => setGridCols(parseInt(e.target.value))}
            className="w-full accent-indigo-500"
          />
          <div className="flex justify-between text-xs text-white/40">
            {Array.from({ length: MAX_GRID_COLS - MIN_GRID_COLS + 1 }, (_, i) => (
              <span key={i}>{i + MIN_GRID_COLS}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Themes */}
      <div className="glass p-6">
        <ThemeList themes={themes} onChange={setThemes} />
      </div>

      {/* Preview hint */}
      {themes.filter((t) => t.title.trim()).length > 0 && (
        <div className="text-center text-white/40 text-sm">
          Aperçu : grille de {gridCols} colonnes avec {themes.filter((t) => t.title.trim()).length} thèmes
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-end">
        <Button variant="secondary" onClick={() => handleSave(false)} loading={saving}>
          Sauvegarder
        </Button>
        <Button variant="primary" onClick={() => handleSave(true)} loading={saving}>
          Lancer la réunion
        </Button>
      </div>
    </div>
  );
}
