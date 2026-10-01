import React, { useState, useEffect } from 'react';

const SCRIPTS = [
  { text: 'Vaani', lang: 'en' },
  { text: 'వాణి', lang: 'te' },
  { text: 'वाणी', lang: 'hi' },
  { text: 'வாணி', lang: 'ta' },
  { text: 'ವಾಣಿ', lang: 'kn' },
  { text: 'വാണി', lang: 'ml' },
  { text: 'বাণী', lang: 'bn' },
  { text: 'वाणी', lang: 'mr' },
];

export const Wordmark: React.FC<{ hasInteracted?: boolean }> = ({ hasInteracted = false }) => {
  const [index, setIndex] = useState(0);
  const [loopCount, setLoopCount] = useState(0);

  useEffect(() => {
    if (hasInteracted || loopCount >= 3) return;

    const interval = setInterval(() => {
      setIndex((prev) => {
        const next = (prev + 1) % SCRIPTS.length;
        if (next === 0) {
          setLoopCount((c) => c + 1);
        }
        return next;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [hasInteracted, loopCount]);

  const current = SCRIPTS[index];

  return (
    <div className="flex items-baseline gap-1.5 select-none" aria-label="Vaani">
      <span className="sr-only">Vaani</span>
      <span
        aria-hidden="true"
        className="font-bold text-2xl tracking-tight text-primary transition-opacity duration-500"
      >
        Vaani
      </span>
      <span
        aria-hidden="true"
        className="font-bold text-xl text-secondary transition-all duration-500 ease-in-out"
      >
        • {current.text}
      </span>
    </div>
  );
};
