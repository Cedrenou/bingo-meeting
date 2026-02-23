import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useToast } from '../hooks/useToast';

export function AuthPage() {
  const { user, loading, signInWithEmail, signInWithGoogle } = useAuth();
  const { addToast } = useToast();
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setSending(true);
    const { error } = await signInWithEmail(email.trim());
    setSending(false);

    if (error) {
      addToast('Erreur lors de l\'envoi du lien', 'error');
    } else {
      setSent(true);
    }
  };

  const handleGoogle = async () => {
    const { error } = await signInWithGoogle();
    if (error) {
      addToast('Erreur lors de la connexion Google', 'error');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md glass p-8 space-y-6">
        <div className="text-center">
          <span className="text-4xl">🎯</span>
          <h1 className="text-2xl font-extrabold text-white mt-3">Connexion</h1>
          <p className="text-white/50 mt-1">Connectez-vous pour créer vos réunions bingo</p>
        </div>

        {sent ? (
          <div className="text-center space-y-4 py-4">
            <span className="text-5xl">📧</span>
            <h2 className="text-lg font-bold text-white">Vérifiez vos emails !</h2>
            <p className="text-white/60">
              Un lien de connexion a été envoyé à <strong className="text-white">{email}</strong>
            </p>
            <Button variant="ghost" onClick={() => setSent(false)}>
              Utiliser une autre adresse
            </Button>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="email"
                label="Adresse email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@exemple.com"
                required
              />
              <Button type="submit" className="w-full" loading={sending}>
                Envoyer un lien magique
              </Button>
            </form>

          </>
        )}
      </div>
    </div>
  );
}
