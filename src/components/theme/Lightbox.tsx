import { useEffect, useCallback, useState, useRef } from 'react';
import type { Photo } from '../../types';

interface LightboxProps {
  photos: Photo[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
  onCaptionChange?: (photoId: string, caption: string) => void;
  readOnly?: boolean;
}

export function Lightbox({
  photos,
  currentIndex,
  onClose,
  onNavigate,
  onCaptionChange,
  readOnly = false,
}: LightboxProps) {
  const photo = photos[currentIndex];
  const [caption, setCaption] = useState(photo?.caption || '');
  const touchStartRef = useRef<number>(0);
  const captionInputRef = useRef<HTMLInputElement>(null);
  const currentPhotoIdRef = useRef(photo?.id);

  // Only reset caption when navigating to a different photo, not on prop updates
  useEffect(() => {
    if (photo?.id !== currentPhotoIdRef.current) {
      currentPhotoIdRef.current = photo?.id;
      setCaption(photo?.caption || '');
    }
  }, [photo?.id, photo?.caption]);

  const goNext = useCallback(() => {
    if (currentIndex < photos.length - 1) onNavigate(currentIndex + 1);
  }, [currentIndex, photos.length, onNavigate]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) onNavigate(currentIndex - 1);
  }, [currentIndex, onNavigate]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept arrows when typing in the caption input
      if (document.activeElement === captionInputRef.current) {
        if (e.key === 'Escape') {
          captionInputRef.current?.blur();
        }
        return;
      }
      if (e.key === 'ArrowRight') goNext();
      else if (e.key === 'ArrowLeft') goPrev();
      else if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [goNext, goPrev, onClose]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartRef.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext();
      else goPrev();
    }
  };

  const handleCaptionBlur = () => {
    if (caption !== (photo?.caption || '') && onCaptionChange && photo) {
      onCaptionChange(photo.id, caption);
    }
  };

  const handleCaptionKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      captionInputRef.current?.blur();
    }
    // Stop propagation so arrows don't navigate photos while typing
    e.stopPropagation();
  };

  if (!photo) return null;

  return (
    <div
      className="fixed inset-0 z-[70] bg-black/95 flex flex-col animate-fade-in"
      onClick={onClose}
    >
      {/* Top bar */}
      <div className="shrink-0 flex items-center justify-between px-4 py-3">
        <div />
        <span className="text-white/60 text-sm font-mono tabular-nums">
          {currentIndex + 1} / {photos.length}
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          aria-label="Fermer"
        >
          ✕
        </button>
      </div>

      {/* Navigation arrows */}
      {currentIndex > 0 && (
        <button
          onClick={(e) => { e.stopPropagation(); goPrev(); }}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-xl transition-colors z-10"
          aria-label="Photo précédente"
        >
          ‹
        </button>
      )}
      {currentIndex < photos.length - 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); goNext(); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-xl transition-colors z-10"
          aria-label="Photo suivante"
        >
          ›
        </button>
      )}

      {/* Image area — takes remaining space but never pushes caption out */}
      <div
        className="flex-1 min-h-0 flex items-center justify-center px-16"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={photo.url}
          alt={photo.caption || photo.filename}
          className="max-w-full max-h-full object-contain rounded-lg"
        />
      </div>

      {/* Caption — always visible at bottom */}
      <div
        className="shrink-0 w-full max-w-xl mx-auto px-4 py-4"
        onClick={(e) => e.stopPropagation()}
      >
        {readOnly ? (
          photo.caption && (
            <p className="text-center text-white/70 text-sm">{photo.caption}</p>
          )
        ) : (
          <input
            ref={captionInputRef}
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            onBlur={handleCaptionBlur}
            onKeyDown={handleCaptionKeyDown}
            placeholder="Ajouter une légende..."
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-center placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 text-sm"
          />
        )}
      </div>
    </div>
  );
}
