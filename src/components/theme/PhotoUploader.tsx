import { useCallback, useRef, useState } from 'react';
import clsx from 'clsx';
import { validateImageFile } from '../../lib/imageUtils';
import { useToast } from '../../hooks/useToast';

interface PhotoUploaderProps {
  onUpload: (files: File[]) => void;
  disabled?: boolean;
}

export function PhotoUploader({ onUpload, disabled = false }: PhotoUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  const handleFiles = useCallback((files: FileList | File[]) => {
    const validFiles: File[] = [];
    const fileArray = Array.from(files);

    for (const file of fileArray) {
      const error = validateImageFile(file);
      if (error) {
        addToast(`${file.name}: ${error}`, 'error');
      } else {
        validFiles.push(file);
      }
    }

    if (validFiles.length > 0) {
      onUpload(validFiles);
    }
  }, [onUpload, addToast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!disabled) {
      handleFiles(e.dataTransfer.files);
    }
  }, [disabled, handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) handleFiles(e.target.files);
          e.target.value = '';
        }}
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        disabled={disabled}
        className={clsx(
          'aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all duration-200',
          isDragging
            ? 'border-indigo-400 bg-indigo-500/20'
            : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        aria-label="Ajouter des photos"
      >
        <span className="text-3xl">📷</span>
        <span className="text-xs text-white/50 text-center px-2">
          {isDragging ? 'Déposez ici' : 'Ajouter'}
        </span>
      </button>
    </>
  );
}
