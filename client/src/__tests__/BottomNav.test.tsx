import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { BottomNav } from '../components/BottomNav';
import { AudioProvider } from '../context/AudioContext';
import { LanguageProvider } from '../context/LanguageContext';

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <AudioProvider>
      <LanguageProvider>{ui}</LanguageProvider>
    </AudioProvider>
  );
}

describe('BottomNav Component', () => {
  it('renders 3 main navigation items (Ask, Learn, Steps)', () => {
    const onSelectTab = vi.fn();
    renderWithProviders(<BottomNav currentTab="ask" onSelectTab={onSelectTab} />);

    expect(screen.getByRole('button', { name: /Ask/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Learn/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Steps/i })).toBeInTheDocument();
  });

  it('calls onSelectTab when an item is tapped', () => {
    const onSelectTab = vi.fn();
    renderWithProviders(<BottomNav currentTab="ask" onSelectTab={onSelectTab} />);

    const learnTab = screen.getByText(/Learn/i);
    fireEvent.click(learnTab);

    expect(onSelectTab).toHaveBeenCalledWith('learn');
  });
});
