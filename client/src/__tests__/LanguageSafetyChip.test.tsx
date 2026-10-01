import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LanguageSafetyChip } from '../components/LanguageSafetyChip';
import { AudioProvider } from '../context/AudioContext';

describe('LanguageSafetyChip Component', () => {
  it('renders correctly with detected language and script', () => {
    const onOpenGrid = vi.fn();
    render(
      <AudioProvider>
        <LanguageSafetyChip
          language="te"
          onOpenGrid={onOpenGrid}
        />
      </AudioProvider>
    );

    // Look for Telugu name
    expect(screen.getByText(/తెలుగు/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Current language: Telugu/i })).toBeInTheDocument();
  });

  it('triggers language selection callback on user click', () => {
    const onOpenGrid = vi.fn();
    render(
      <AudioProvider>
        <LanguageSafetyChip
          language="hi"
          onOpenGrid={onOpenGrid}
        />
      </AudioProvider>
    );

    const button = screen.getByRole('button', { name: /Current language: Hindi/i });
    fireEvent.click(button);

    expect(onOpenGrid).toHaveBeenCalledTimes(1);
  });
});
