import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useToast } from './useToast';
import type { Meeting, NewMeeting } from '../types';

export function useMeetings() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const fetchMeetings = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('meetings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      addToast('Erreur lors du chargement des réunions', 'error');
    } else {
      setMeetings(data ?? []);
    }
    setLoading(false);
  }, [addToast]);

  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  return { meetings, loading, refetch: fetchMeetings };
}

export function useMeeting(id: string | undefined) {
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    async function fetch() {
      const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        addToast('Réunion introuvable', 'error');
      } else {
        setMeeting(data);
      }
      setLoading(false);
    }

    fetch();
  }, [id, addToast]);

  return { meeting, loading, setMeeting };
}

export function useMeetingByShareCode(shareCode: string | undefined) {
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    if (!shareCode) {
      setLoading(false);
      return;
    }

    async function fetch() {
      const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .eq('share_code', shareCode)
        .single();

      if (error) {
        addToast('Réunion introuvable', 'error');
      } else {
        setMeeting(data);
      }
      setLoading(false);
    }

    fetch();
  }, [shareCode, addToast]);

  return { meeting, loading, setMeeting };
}

export function useMeetingActions() {
  const { addToast } = useToast();

  const createMeeting = useCallback(async (data: NewMeeting): Promise<Meeting | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      addToast('Vous devez être connecté', 'error');
      return null;
    }

    const { data: meeting, error } = await supabase
      .from('meetings')
      .insert({ ...data, created_by: user.id })
      .select()
      .single();

    if (error) {
      addToast('Erreur lors de la création', 'error');
      return null;
    }

    addToast('Réunion créée !', 'success');
    return meeting;
  }, [addToast]);

  const updateMeeting = useCallback(async (id: string, updates: Partial<Meeting>): Promise<boolean> => {
    const { error } = await supabase
      .from('meetings')
      .update(updates)
      .eq('id', id);

    if (error) {
      addToast('Erreur lors de la mise à jour', 'error');
      return false;
    }
    return true;
  }, [addToast]);

  const deleteMeeting = useCallback(async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('meetings')
      .delete()
      .eq('id', id);

    if (error) {
      addToast('Erreur lors de la suppression', 'error');
      return false;
    }

    addToast('Réunion supprimée', 'success');
    return true;
  }, [addToast]);

  const duplicateMeeting = useCallback(async (meeting: Meeting): Promise<Meeting | null> => {
    const newMeeting = await createMeeting({
      title: `${meeting.title} (copie)`,
      description: meeting.description,
      grid_cols: meeting.grid_cols,
    });

    if (!newMeeting) return null;

    const { data: themes } = await supabase
      .from('themes')
      .select('*')
      .eq('meeting_id', meeting.id)
      .order('position');

    if (themes && themes.length > 0) {
      const newThemes = themes.map((t) => ({
        meeting_id: newMeeting.id,
        title: t.title,
        emoji: t.emoji,
        color: t.color,
        position: t.position,
      }));

      await supabase.from('themes').insert(newThemes);
    }

    return newMeeting;
  }, [createMeeting]);

  return { createMeeting, updateMeeting, deleteMeeting, duplicateMeeting };
}
