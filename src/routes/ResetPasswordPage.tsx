import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useToast } from '../hooks/useToast';

export function ResetPasswordPage() {
  const { updatePassword } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirm) return;

    if (password.length < 6) {
      addToast('Le mot de passe doit contenir au moins 6 caractères', 'error');
      return;
    }

    if (password !== confirm) {
      addToast('Les mots de passe ne correspondent pas', 'error');
      return;
    }

    setSubmitting(true);
    const { error } = await updatePassword(password);
    setSubmitting(false);

    if (error) {
      addToast('Erreur lors de la mise à jour du mot de passe', 'error');
    } else {
      addToast('Mot de passe mis à jour !', 'success');
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md glass p-8 space-y-6">
        <div className="text-center">
          <span className="text-4xl">🔑</span>
          <h1 className="text-2xl font-extrabold text-white mt-3">
            Nouveau mot de passe
          </h1>
          <p className="text-white/50 mt-1">
            Choisissez votre nouveau mot de passe
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="password"
            label="Nouveau mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="6 caractères minimum"
            required
          />
          <Input
            type="password"
            label="Confirmer le mot de passe"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Répétez le mot de passe"
            required
          />
          <Button type="submit" className="w-full" loading={submitting}>
            Mettre à jour
          </Button>
        </form>
      </div>
    </div>
  );
}
