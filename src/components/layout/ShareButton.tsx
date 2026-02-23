import { useState } from 'react';
import { Button } from '../ui/Button';

interface ShareButtonProps {
  shareCode: string;
}

export function ShareButton({ shareCode }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const liveUrl = `${window.location.origin}/live/${shareCode}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(liveUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = liveUrl;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Button variant="secondary" size="sm" onClick={handleCopy} aria-label="Copier le lien de partage">
      {copied ? '✓ Copié !' : '🔗 Partager'}
    </Button>
  );
}
