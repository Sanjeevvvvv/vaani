import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import { WelcomeScreen } from '../pages/WelcomeScreen';
import { AudioProvider } from '../context/AudioContext';
import { LanguageProvider } from '../context/LanguageContext';
import axe from 'axe-core';

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <AudioProvider>
      <LanguageProvider>{ui}</LanguageProvider>
    </AudioProvider>
  );
}

describe('WelcomeScreen Component', () => {
  it('renders tactile master orb and greeting prompt', () => {
    const onEnterApp = vi.fn();
    renderWithProviders(<WelcomeScreen onEnterApp={onEnterApp} />);

    expect(screen.getByText(/Welcome • వాణి/i)).toBeInTheDocument();
    expect(screen.getByText(/ఇక్కడ తాకండి/i)).toBeInTheDocument();
    expect(
      screen.getByLabelText(/Tap here to listen to Vaani/i)
    ).toBeInTheDocument();
  });

  it('triggers onEnterApp and unlocks audio when master orb is tapped', async () => {
    const onEnterApp = vi.fn();
    renderWithProviders(<WelcomeScreen onEnterApp={onEnterApp} />);

    const orbBtn = screen.getByLabelText(/Tap here to listen to Vaani/i);
    await act(async () => {
      fireEvent.click(orbBtn);
    });

    expect(onEnterApp).toHaveBeenCalledTimes(1);
    expect(window.speechSynthesis.speak).toHaveBeenCalled();
  });

  it('passes axe accessibility audit without violations', async () => {
    const onEnterApp = vi.fn();
    const { container } = renderWithProviders(<WelcomeScreen onEnterApp={onEnterApp} />);

    const results = await axe.run(container);
    // Ignore color contrast in test DOM since mock styles don't render complete stylesheets in jsdom
    const violations = results.violations.filter((v) => v.id !== 'color-contrast');
    expect(violations.length).toBe(0);
  });
});
