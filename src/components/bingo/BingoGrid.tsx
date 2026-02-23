import { BingoCell } from './BingoCell';
import type { Theme } from '../../types';

interface BingoGridProps {
  themes: Theme[];
  gridCols: number;
  onThemeClick: (theme: Theme) => void;
  readOnly?: boolean;
}

export function BingoGrid({ themes, gridCols, onThemeClick, readOnly = false }: BingoGridProps) {
  return (
    <div
      className="grid gap-3 md:gap-4 w-full max-w-5xl mx-auto"
      style={{
        gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
      }}
    >
      {themes.map((theme) => (
        <BingoCell
          key={theme.id}
          theme={theme}
          onClick={() => onThemeClick(theme)}
          readOnly={readOnly}
        />
      ))}
    </div>
  );
}
