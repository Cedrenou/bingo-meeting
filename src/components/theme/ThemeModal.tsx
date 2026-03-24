import { useCallback } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { PhotoGallery } from './PhotoGallery';
import { useThemeActions } from '../../hooks/useThemes';
import type { Theme } from '../../types';

interface ThemeModalProps {
  theme: Theme | null;
  meetingId: string;
  isOpen: boolean;
  onClose: () => void;
  onThemeUpdated: () => void;
  readOnly?: boolean;
}

export function ThemeModal({ theme, meetingId, isOpen, onClose, onThemeUpdated, readOnly = false }: ThemeModalProps) {
  const { toggleThemeDone } = useThemeActions();

  const handleToggleDone = useCallback(async () => {
    if (!theme) return;
    const success = await toggleThemeDone(theme);
    if (success) {
      onThemeUpdated();
      if (!theme.is_done) {
        onClose();
      }
    }
  }, [theme, toggleThemeDone, onThemeUpdated, onClose]);

  if (!theme) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="!max-w-[95vw] !max-h-[95vh] !w-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{theme.emoji}</span>
          <div>
            <h2 className="text-xl font-bold text-white">{theme.title}</h2>
            <span className="text-sm text-white/50">
              {theme.photos?.length || 0} photo{(theme.photos?.length || 0) > 1 ? 's' : ''}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Body — Photo gallery */}
      <div className="flex-1 overflow-y-auto p-5">
        <PhotoGallery
          photos={theme.photos || []}
          meetingId={meetingId}
          themeId={theme.id}
          readOnly={readOnly}
          onPhotosChange={onThemeUpdated}
        />
      </div>

      {/* Footer */}
      {!readOnly && (
        <div className="flex items-center justify-between p-5 border-t border-white/10">
          <span className="text-sm text-white/50">
            {theme.is_done ? '✓ Thème traité' : 'En cours...'}
          </span>
          <Button
            variant={theme.is_done ? 'danger' : 'success'}
            onClick={handleToggleDone}
          >
            {theme.is_done ? 'Rouvrir le thème' : 'Marquer comme traité'}
          </Button>
        </div>
      )}
    </Modal>
  );
}
