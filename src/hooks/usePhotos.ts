import { useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useToast } from './useToast';
import { resizeImage, validateImageFile, generateUUID, getFileExtension } from '../lib/imageUtils';
import type { Photo } from '../types';

export function usePhotos() {
  const { addToast } = useToast();

  const uploadPhoto = useCallback(async (
    file: File,
    meetingId: string,
    themeId: string,
    position: number
  ): Promise<Photo | null> => {
    const validationError = validateImageFile(file);
    if (validationError) {
      addToast(validationError, 'error');
      return null;
    }

    try {
      const resized = await resizeImage(file);
      const ext = getFileExtension(file.name);
      const uuid = generateUUID();
      const storagePath = `${meetingId}/${themeId}/${uuid}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('meeting-photos')
        .upload(storagePath, resized, {
          contentType: file.type,
          cacheControl: '3600',
        });

      if (uploadError) {
        addToast('Erreur lors de l\'upload', 'error');
        return null;
      }

      const { data: photo, error: insertError } = await supabase
        .from('photos')
        .insert({
          theme_id: themeId,
          storage_path: storagePath,
          filename: file.name,
          position,
        })
        .select()
        .single();

      if (insertError) {
        await supabase.storage.from('meeting-photos').remove([storagePath]);
        addToast('Erreur lors de l\'enregistrement', 'error');
        return null;
      }

      return photo;
    } catch {
      addToast('Erreur lors du traitement de l\'image', 'error');
      return null;
    }
  }, [addToast]);

  const deletePhoto = useCallback(async (photo: Photo): Promise<boolean> => {
    const { error: deleteError } = await supabase
      .from('photos')
      .delete()
      .eq('id', photo.id);

    if (deleteError) {
      addToast('Erreur lors de la suppression', 'error');
      return false;
    }

    await supabase.storage.from('meeting-photos').remove([photo.storage_path]);
    return true;
  }, [addToast]);

  const updateCaption = useCallback(async (photoId: string, caption: string): Promise<boolean> => {
    const { error } = await supabase
      .from('photos')
      .update({ caption })
      .eq('id', photoId);

    if (error) {
      addToast('Erreur lors de la mise à jour de la légende', 'error');
      return false;
    }
    return true;
  }, [addToast]);

  const getSignedUrl = useCallback(async (storagePath: string): Promise<string | null> => {
    const { data, error } = await supabase.storage
      .from('meeting-photos')
      .createSignedUrl(storagePath, 3600);

    if (error) return null;
    return data.signedUrl;
  }, []);

  const getSignedUrls = useCallback(async (photos: Photo[]): Promise<Photo[]> => {
    const results = await Promise.all(
      photos.map(async (photo) => {
        const url = await getSignedUrl(photo.storage_path);
        return { ...photo, url: url ?? undefined };
      })
    );
    return results;
  }, [getSignedUrl]);

  return { uploadPhoto, deletePhoto, updateCaption, getSignedUrl, getSignedUrls };
}
