import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useToast } from '../hooks/useToast';

export function AuthPage() {
  const { user, loading, signInWithEmail, signUpWithEmail, resetPassword } = useAuth();
  const { addToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgot, setIsForgot] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setSubmitting(true);

    if (isForgot) {
      const { error } = await resetPassword(email.trim());
      setSubmitting(false);
      if (error) {
        addToast('Erreur lors de l\'envoi du mail', 'error');
      } else {
        addToast('Un email de réinitialisation a été envoyé !', 'success');
        setIsForgot(false);
      }
      return;
    }

    if (!password) {
      setSubmitting(false);
      return;
    }

    if (isSignUp) {
      if (password.length < 6) {
        addToast('Le mot de passe doit contenir au moins 6 caractères', 'error');
        setSubmitting(false);
        return;
      }
      const { error } = await signUpWithEmail(email.trim(), password);
      setSubmitting(false);
      if (error) {
        addToast('Erreur lors de l\'inscription', 'error');
      } else {
        addToast('Compte créé ! Vérifiez vos emails pour confirmer votre compte.', 'success');
        setIsSignUp(false);
      }
    } else {
      const { error } = await signInWithEmail(email.trim(), password);
      setSubmitting(false);
      if (error) {
        addToast('Email ou mot de passe incorrect', 'error');
      }
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md glass p-8 space-y-6">
        <div className="text-center">
          <span className="text-4xl">{isForgot ? '🔑' : '🎯'}</span>
          <h1 className="text-2xl font-extrabold text-white mt-3">
            {isForgot ? 'Mot de passe oublié' : isSignUp ? 'Créer un compte' : 'Connexion'}
          </h1>
          <p className="text-white/50 mt-1">
            {isForgot
              ? 'Entrez votre email pour recevoir un lien de réinitialisation'
              : isSignUp
                ? 'Inscrivez-vous pour créer vos réunions bingo'
                : 'Connectez-vous pour créer vos réunions bingo'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            label="Adresse email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vous@exemple.com"
            required
          />
          {!isForgot && (
            <Input
              type="password"
              label="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isSignUp ? '6 caractères minimum' : 'Votre mot de passe'}
              required
            />
          )}
          <Button type="submit" className="w-full" loading={submitting}>
            {isForgot ? 'Envoyer le lien' : isSignUp ? 'S\'inscrire' : 'Se connecter'}
          </Button>
        </form>

        <div className="text-center space-y-2">
          {!isForgot && !isSignUp && (
            <button
              type="button"
              onClick={() => setIsForgot(true)}
              className="text-white/60 hover:text-white text-sm transition-colors block w-full"
            >
              Mot de passe oublié ?
            </button>
          )}
          <button
            type="button"
            onClick={() => { setIsSignUp(!isSignUp); setIsForgot(false); }}
            className="text-white/60 hover:text-white text-sm transition-colors block w-full"
          >
            {isForgot
              ? 'Retour à la connexion'
              : isSignUp
                ? 'Déjà un compte ? Se connecter'
                : 'Pas encore de compte ? S\'inscrire'}
          </button>
        </div>
      </div>
    </div>
  );
}
