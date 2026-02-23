import { useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BingoGrid } from '../components/bingo/BingoGrid';
import { ProgressBar } from '../components/bingo/ProgressBar';
import { ConfettiEffect } from '../components/bingo/ConfettiEffect';
import { ThemeModal } from '../components/theme/ThemeModal';
import { ShareButton } from '../components/layout/ShareButton';
import { Spinner } from '../components/ui/Spinner';
import { Button } from '../components/ui/Button';
import { useMeeting, useMeetingActions } from '../hooks/useMeeting';
import { useThemes } from '../hooks/useThemes';
import type { Theme } from '../types';

export function BingoBoard() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { meeting, loading: meetingLoading } = useMeeting(id);
  const { themes, loading: themesLoading, refetch } = useThemes(id);
  const { updateMeeting } = useMeetingActions();
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);

  const doneCount = useMemo(() => themes.filter((t) => t.is_done).length, [themes]);
  const allDone = themes.length > 0 && doneCount === themes.length;

  const handleThemeClick = useCallback((theme: Theme) => {
    setSelectedTheme(theme);
  }, []);

  const handleThemeUpdated = useCallback(() => {
    refetch();
    // Re-select theme with fresh data
    setSelectedTheme((prev) => {
      if (!prev) return null;
      return themes.find((t) => t.id === prev.id) || prev;
    });
  }, [refetch, themes]);

  const handleComplete = useCallback(async () => {
    if (!meeting) return;
    await updateMeeting(meeting.id, { status: 'completed' });
    navigate('/dashboard');
  }, [meeting, updateMeeting, navigate]);

  if (meetingLoading || themesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-white/50 text-lg">Réunion introuvable</p>
        <Button onClick={() => navigate('/dashboard')}>Retour au dashboard</Button>
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
            <div className="flex items-center gap-2">
              <ShareButton shareCode={meeting.share_code} />
              {allDone ? (
                <Button variant="success" size="sm" onClick={handleComplete}>
                  Terminer
                </Button>
              ) : (
                <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
                  Quitter
                </Button>
              )}
            </div>
          </div>
          <ProgressBar done={doneCount} total={themes.length} />
        </div>
      </div>

      {/* Board */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <BingoGrid
          themes={themes}
          gridCols={meeting.grid_cols}
          onThemeClick={handleThemeClick}
        />
      </div>

      {/* Theme modal */}
      <ThemeModal
        theme={selectedTheme ? themes.find((t) => t.id === selectedTheme.id) || selectedTheme : null}
        meetingId={meeting.id}
        isOpen={selectedTheme !== null}
        onClose={() => setSelectedTheme(null)}
        onThemeUpdated={handleThemeUpdated}
      />

      {/* Confetti */}
      <ConfettiEffect trigger={allDone} />
    </div>
  );
}
