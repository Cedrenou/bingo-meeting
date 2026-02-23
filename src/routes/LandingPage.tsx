import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';

export function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [shareCode, setShareCode] = useState('');

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (shareCode.trim()) {
      navigate(`/live/${shareCode.trim()}`);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-4 text-center">
      {/* Hero */}
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="space-y-4">
          <div className="text-6xl md:text-8xl">🎯</div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight text-balance">
            Animez vos réunions{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              comme un jeu
            </span>
          </h1>
          <p className="text-lg md:text-xl text-white/50 max-w-xl mx-auto text-balance">
            Transformez vos réunions en plateau de bingo interactif. Chaque case est un sujet à traiter, illustré par des photos. Couvrez tous les thèmes sans oubli !
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to={user ? '/meeting/new' : '/auth'}>
            <Button size="lg" className="w-full sm:w-auto text-base">
              Créer ma réunion
            </Button>
          </Link>
          {user && (
            <Link to="/dashboard">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto text-base">
                Mon dashboard
              </Button>
            </Link>
          )}
        </div>

        {/* Join a meeting */}
        <div className="pt-8 border-t border-white/10 max-w-md mx-auto">
          <p className="text-sm text-white/40 mb-3">Rejoindre une réunion en cours</p>
          <form onSubmit={handleJoin} className="flex gap-2">
            <input
              type="text"
              value={shareCode}
              onChange={(e) => setShareCode(e.target.value)}
              placeholder="Code de partage"
              className="input-field flex-1"
            />
            <Button type="submit" variant="secondary" disabled={!shareCode.trim()}>
              Rejoindre
            </Button>
          </form>
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-20 px-4">
        {[
          {
            emoji: '🎲',
            title: 'Grille interactive',
            desc: 'Un plateau de bingo personnalisable avec vos thèmes de réunion',
          },
          {
            emoji: '📷',
            title: 'Galeries photos',
            desc: 'Illustrez chaque sujet avec des photos uploadées en temps réel',
          },
          {
            emoji: '📡',
            title: 'Partage en direct',
            desc: 'Les participants suivent la progression en temps réel via un lien de partage',
          },
        ].map((feature) => (
          <div key={feature.title} className="glass p-6 text-center space-y-3">
            <span className="text-4xl">{feature.emoji}</span>
            <h3 className="font-bold text-white">{feature.title}</h3>
            <p className="text-sm text-white/40">{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
