import { useState, useEffect, useMemo, useRef } from 'react';
import { PhotoUploader } from './PhotoUploader';
import { Lightbox } from './Lightbox';
import { usePhotos } from '../../hooks/usePhotos';
import { Spinner } from '../ui/Spinner';
import type { Photo } from '../../types';

interface PhotoGalleryProps {
  photos: Photo[];
  meetingId: string;
  themeId: string;
  readOnly?: boolean;
  onPhotosChange?: () => void;
}

export function PhotoGallery({ photos, meetingId, themeId, readOnly = false, onPhotosChange }: PhotoGalleryProps) {
  const { uploadPhoto, deletePhoto, updateCaption, getSignedUrls } = usePhotos();
  const [resolvedPhotos, setResolvedPhotos] = useState<Photo[]>([]);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const resolvedIdsRef = useRef<Set<string>>(new Set());

  // Stable key based on photo IDs to avoid re-triggering on reference changes
  const photosKey = useMemo(
    () => photos.map((p) => p.id).join(','),
    [photos]
  );

  useEffect(() => {
    if (photos.length === 0) {
      setResolvedPhotos([]);
      setInitialLoading(false);
      return;
    }

    let cancelled = false;

    // Only resolve photos we haven't resolved yet
    const newPhotos = photos.filter((p) => !resolvedIdsRef.current.has(p.id));
    const existingPhotos = resolvedPhotos.filter((p) =>
      photos.some((pp) => pp.id === p.id)
    );

    if (newPhotos.length === 0) {
      // No new photos, just sync removals
      setResolvedPhotos(existingPhotos);
      setInitialLoading(false);
      return;
    }

    getSignedUrls(newPhotos).then((resolved) => {
      if (cancelled) return;

      const newIds = new Set(resolved.map((p) => p.id));
      resolved.forEach((p) => resolvedIdsRef.current.add(p.id));

      // Merge: keep existing resolved + add newly resolved, in original order
      const merged = photos.map((p) => {
        if (newIds.has(p.id)) return resolved.find((r) => r.id === p.id)!;
        return existingPhotos.find((r) => r.id === p.id) || p;
      });

      setResolvedPhotos(merged);
      setInitialLoading(false);
    });

    return () => { cancelled = true; };
  }, [photosKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleUpload = async (files: File[]) => {
    setUploadingCount((c) => c + files.length);

    for (let i = 0; i < files.length; i++) {
      await uploadPhoto(files[i], meetingId, themeId, photos.length + i);
    }

    setUploadingCount(0);
    onPhotosChange?.();
  };

  const handleDelete = async (photo: Photo) => {
    // Optimistic removal
    resolvedIdsRef.current.delete(photo.id);
    setResolvedPhotos((prev) => prev.filter((p) => p.id !== photo.id));

    const success = await deletePhoto(photo);
    if (success) onPhotosChange?.();
  };

  const handleCaptionChange = async (photoId: string, caption: string) => {
    // Update caption locally without triggering a full refetch
    setResolvedPhotos((prev) =>
      prev.map((p) => (p.id === photoId ? { ...p, caption } : p))
    );
    await updateCaption(photoId, caption);
  };

  if (initialLoading && photos.length > 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner />
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3">
        {!readOnly && <PhotoUploader onUpload={handleUpload} disabled={uploadingCount > 0} />}

        {uploadingCount > 0 &&
          Array.from({ length: uploadingCount }).map((_, i) => (
            <div
              key={`uploading-${i}`}
              className="aspect-square rounded-xl bg-white/5 flex items-center justify-center border border-white/10"
            >
              <Spinner size="sm" />
            </div>
          ))}

        {resolvedPhotos.map((photo, index) => (
          <div key={photo.id} className="relative group aspect-square">
            <button
              onClick={() => setLightboxIndex(index)}
              className="w-full h-full overflow-hidden rounded-xl border border-white/10 hover:border-white/30 transition-all"
            >
              <img
                src={photo.url}
                alt={photo.caption || photo.filename}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
            {!readOnly && (
              <button
                onClick={() => handleDelete(photo)}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500/80 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                aria-label="Supprimer la photo"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          photos={resolvedPhotos}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
          onCaptionChange={readOnly ? undefined : handleCaptionChange}
          readOnly={readOnly}
        />
      )}
    </>
  );
}
