import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useToast } from './useToast';
import type { Theme, NewTheme } from '../types';

export function useThemes(meetingId: string | undefined) {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const fetchThemes = useCallback(async () => {
    if (!meetingId) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('themes')
      .select('*, photos(*)')
      .eq('meeting_id', meetingId)
      .order('position')
      .order('position', { referencedTable: 'photos' });

    if (error) {
      addToast('Erreur lors du chargement des thèmes', 'error');
    } else {
      setThemes(data ?? []);
    }
    setLoading(false);
  }, [meetingId, addToast]);

  useEffect(() => {
    fetchThemes();
  }, [fetchThemes]);

  // Realtime subscription
  useEffect(() => {
    if (!meetingId) return;

    const channel = supabase
      .channel(`themes-${meetingId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'themes',
        filter: `meeting_id=eq.${meetingId}`,
      }, () => {
        fetchThemes();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'photos',
      }, () => {
        fetchThemes();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [meetingId, fetchThemes]);

  return { themes, loading, setThemes, refetch: fetchThemes };
}

export function useThemeActions() {
  const { addToast } = useToast();

  const createTheme = useCallback(async (data: NewTheme): Promise<Theme | null> => {
    const { data: theme, error } = await supabase
      .from('themes')
      .insert(data)
      .select()
      .single();

    if (error) {
      addToast('Erreur lors de la création du thème', 'error');
      return null;
    }
    return theme;
  }, [addToast]);

  const updateTheme = useCallback(async (id: string, updates: Partial<Theme>): Promise<boolean> => {
    const { error } = await supabase
      .from('themes')
      .update(updates)
      .eq('id', id);

    if (error) {
      addToast('Erreur lors de la mise à jour du thème', 'error');
      return false;
    }
    return true;
  }, [addToast]);

  const deleteTheme = useCallback(async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('themes')
      .delete()
      .eq('id', id);

    if (error) {
      addToast('Erreur lors de la suppression du thème', 'error');
      return false;
    }
    return true;
  }, [addToast]);

  const toggleThemeDone = useCallback(async (theme: Theme): Promise<boolean> => {
    const updates: Partial<Theme> = {
      is_done: !theme.is_done,
      done_at: !theme.is_done ? new Date().toISOString() : null,
    };

    const { error } = await supabase
      .from('themes')
      .update(updates)
      .eq('id', theme.id);

    if (error) {
      addToast('Erreur lors de la mise à jour', 'error');
      return false;
    }
    return true;
  }, [addToast]);

  const reorderThemes = useCallback(async (themes: Theme[]): Promise<boolean> => {
    const updates = themes.map((t, index) => ({
      id: t.id,
      meeting_id: t.meeting_id,
      title: t.title,
      position: index,
    }));

    for (const update of updates) {
      const { error } = await supabase
        .from('themes')
        .update({ position: update.position })
        .eq('id', update.id);

      if (error) {
        addToast('Erreur lors de la réorganisation', 'error');
        return false;
      }
    }
    return true;
  }, [addToast]);

  return { createTheme, updateTheme, deleteTheme, toggleThemeDone, reorderThemes };
}
