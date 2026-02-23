import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Spinner } from '../components/ui/Spinner';
import { useMeetings, useMeetingActions } from '../hooks/useMeeting';
import type { Meeting } from '../types';
import clsx from 'clsx';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  draft: { label: 'Brouillon', color: 'bg-white/10 text-white/60' },
  in_progress: { label: 'En cours', color: 'bg-indigo-500/20 text-indigo-300' },
  completed: { label: 'Terminée', color: 'bg-emerald-500/20 text-emerald-300' },
};

export function Dashboard() {
  const navigate = useNavigate();
  const { meetings, loading, refetch } = useMeetings();
  const { deleteMeeting, duplicateMeeting } = useMeetingActions();
  const [deleteTarget, setDeleteTarget] = useState<Meeting | null>(null);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const success = await deleteMeeting(deleteTarget.id);
    if (success) refetch();
    setDeleteTarget(null);
  };

  const handleDuplicate = async (meeting: Meeting) => {
    const newMeeting = await duplicateMeeting(meeting);
    if (newMeeting) {
      refetch();
      navigate(`/meeting/${newMeeting.id}/edit`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-white">Mes réunions</h1>
        <Button onClick={() => navigate('/meeting/new')}>+ Nouvelle réunion</Button>
      </div>

      {meetings.length === 0 ? (
        <div className="text-center py-20 space-y-4">
          <span className="text-6xl">🎯</span>
          <h2 className="text-xl font-bold text-white">Aucune réunion</h2>
          <p className="text-white/50">Créez votre première réunion bingo !</p>
          <Button onClick={() => navigate('/meeting/new')}>Créer ma première réunion</Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {meetings.map((meeting) => (
            <MeetingCard
              key={meeting.id}
              meeting={meeting}
              onEdit={() => navigate(`/meeting/${meeting.id}/edit`)}
              onPlay={() => navigate(`/meeting/${meeting.id}/play`)}
              onDuplicate={() => handleDuplicate(meeting)}
              onDelete={() => setDeleteTarget(meeting)}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Supprimer la réunion"
        message={`Êtes-vous sûr de vouloir supprimer "${deleteTarget?.title}" ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
      />
    </div>
  );
}

interface MeetingCardProps {
  meeting: Meeting;
  onEdit: () => void;
  onPlay: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

function MeetingCard({ meeting, onEdit, onPlay, onDuplicate, onDelete }: MeetingCardProps) {
  const status = STATUS_LABELS[meeting.status] || STATUS_LABELS.draft;
  const date = new Date(meeting.created_at).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="glass-hover p-5 space-y-4 flex flex-col">
      <div className="flex items-start justify-between">
        <h3 className="font-bold text-white text-lg leading-tight flex-1 mr-2">
          {meeting.title}
        </h3>
        <span className={clsx('text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap', status.color)}>
          {status.label}
        </span>
      </div>

      {meeting.description && (
        <p className="text-sm text-white/40 line-clamp-2">{meeting.description}</p>
      )}

      <div className="text-xs text-white/30">
        Grille {meeting.grid_cols} colonnes &middot; {date}
      </div>

      <div className="flex-1" />

      <div className="flex gap-2 flex-wrap">
        <Button variant="secondary" size="sm" onClick={onEdit}>
          Éditer
        </Button>
        <Button variant="primary" size="sm" onClick={onPlay}>
          Lancer
        </Button>
        <Button variant="ghost" size="sm" onClick={onDuplicate}>
          Dupliquer
        </Button>
        <Button variant="ghost" size="sm" onClick={onDelete} className="!text-red-400 hover:!text-red-300">
          Supprimer
        </Button>
      </div>
    </div>
  );
}
