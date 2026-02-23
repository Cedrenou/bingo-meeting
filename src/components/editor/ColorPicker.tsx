import { useState, useRef, useEffect } from 'react';
import { THEME_COLORS } from '../../lib/constants';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-lg border-2 border-white/20 hover:border-white/40 transition-colors"
        style={{ backgroundColor: value }}
        aria-label="Choisir une couleur"
      />
      {isOpen && (
        <div className="absolute top-12 left-0 z-50 p-2 glass grid grid-cols-4 gap-1.5 animate-fade-in">
          {THEME_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => {
                onChange(color);
                setIsOpen(false);
              }}
              className="w-8 h-8 rounded-lg border-2 transition-all hover:scale-110"
              style={{
                backgroundColor: color,
                borderColor: color === value ? 'white' : 'transparent',
              }}
            />
          ))}
          <div className="col-span-4 pt-1 border-t border-white/10 mt-1">
            <input
              type="color"
              value={value}
              onChange={(e) => {
                onChange(e.target.value);
                setIsOpen(false);
              }}
              className="w-full h-8 rounded cursor-pointer bg-transparent"
            />
          </div>
        </div>
      )}
    </div>
  );
}
