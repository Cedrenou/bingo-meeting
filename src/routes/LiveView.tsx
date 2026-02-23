import { useState, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { BingoGrid } from '../components/bingo/BingoGrid';
import { ProgressBar } from '../components/bingo/ProgressBar';
import { ConfettiEffect } from '../components/bingo/ConfettiEffect';
import { ThemeModal } from '../components/theme/ThemeModal';
import { Spinner } from '../components/ui/Spinner';
import { useMeetingByShareCode } from '../hooks/useMeeting';
import { useThemes } from '../hooks/useThemes';
import type { Theme } from '../types';

export function LiveView() {
  const { shareCode } = useParams<{ shareCode: string }>();
  const { meeting, loading: meetingLoading } = useMeetingByShareCode(shareCode);
  const { themes, loading: themesLoading, refetch } = useThemes(meeting?.id);
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);

  const doneCount = useMemo(() => themes.filter((t) => t.is_done).length, [themes]);
  const allDone = themes.length > 0 && doneCount === themes.length;

  const handleThemeClick = useCallback((theme: Theme) => {
    if (theme.is_done) {
      setSelectedTheme(theme);
    }
  }, []);

  if (meetingLoading || themesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <span className="text-6xl">🔍</span>
        <p className="text-white/50 text-lg">Réunion introuvable</p>
        <p className="text-white/30 text-sm">Vérifiez le code de partage</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-[#0f0a2e]/90 backdrop-blur-md border-b border-white/10 px-4 py-3">
        <div className="max-w-6xl mx-auto space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl md:text-2xl font-extrabold text-white truncate">
              {meeting.title}
            </h1>
            <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 text-red-300 text-sm font-medium">
              <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
              En direct
            </span>
          </div>
          <ProgressBar done={doneCount} total={themes.length} />
        </div>
      </div>

      {/* Board */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        {meeting.status === 'completed' || allDone ? (
          <div className="text-center space-y-4">
            <span className="text-6xl">🎉</span>
            <h2 className="text-3xl font-extrabold text-white">Réunion terminée !</h2>
            <p className="text-white/50">Tous les sujets ont été traités.</p>
          </div>
        ) : (
          <BingoGrid
            themes={themes}
            gridCols={meeting.grid_cols}
            onThemeClick={handleThemeClick}
            readOnly
          />
        )}
      </div>

      {/* Theme modal (read-only) */}
      <ThemeModal
        theme={selectedTheme ? themes.find((t) => t.id === selectedTheme.id) || selectedTheme : null}
        meetingId={meeting.id}
        isOpen={selectedTheme !== null}
        onClose={() => setSelectedTheme(null)}
        onThemeUpdated={refetch}
        readOnly
      />

      {/* Confetti */}
      <ConfettiEffect trigger={allDone} />
    </div>
  );
}
