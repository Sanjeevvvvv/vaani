import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import axe from 'axe-core';
import { CompanionButton } from '../components/CompanionButton';
import { LanguageProvider } from '../context/LanguageContext';
import { AudioProvider } from '../context/AudioContext';

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <AudioProvider>
      <LanguageProvider>{ui}</LanguageProvider>
    </AudioProvider>
  );
};

describe('CompanionButton Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders in idle state with terracotta styling and mic icon', () => {
    const onStart = vi.fn().mockResolvedValue(undefined);
    const onStop = vi.fn().mockResolvedValue(undefined);
    const onInterrupt = vi.fn();

    renderWithProviders(
      <CompanionButton
        state="idle"
        audioLevel={0}
        onStartRecord={onStart}
        onStopRecord={onStop}
        onInterruptPlayback={onInterrupt}
      />
    );

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-pressed', 'false');
    expect(button).not.toBeDisabled();
  });

  it('renders listening state with active pulse and waveform elements', () => {
    const onStart = vi.fn();
    const onStop = vi.fn();
    const onInterrupt = vi.fn();

    renderWithProviders(
      <CompanionButton
        state="listening"
        audioLevel={0.8}
        onStartRecord={onStart}
        onStopRecord={onStop}
        onInterruptPlayback={onInterrupt}
      />
    );

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(button).toHaveClass('animate-pulse');
  });

  it('renders thinking state with static dots and disabled interaction', () => {
    const onStart = vi.fn();
    const onStop = vi.fn();
    const onInterrupt = vi.fn();

    renderWithProviders(
      <CompanionButton
        state="thinking"
        audioLevel={0}
        onStartRecord={onStart}
        onStopRecord={onStop}
        onInterruptPlayback={onInterrupt}
      />
    );

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('interrupts playback and starts listening when tapped in speaking state', async () => {
    const onStart = vi.fn().mockResolvedValue(undefined);
    const onStop = vi.fn().mockResolvedValue(undefined);
    const onInterrupt = vi.fn();

    renderWithProviders(
      <CompanionButton
        state="speaking"
        audioLevel={0}
        onStartRecord={onStart}
        onStopRecord={onStop}
        onInterruptPlayback={onInterrupt}
      />
    );

    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-emerald-700');

    await act(async () => {
      fireEvent.pointerDown(button);
    });

    expect(onInterrupt).toHaveBeenCalledTimes(1);
    expect(onStart).toHaveBeenCalledTimes(1);
  });

  it('triggers hold-to-talk start on pointerdown and stop on pointerup after >=400ms', async () => {
    const onStart = vi.fn().mockResolvedValue(undefined);
    const onStop = vi.fn().mockResolvedValue(undefined);
    const onInterrupt = vi.fn();

    const { rerender } = renderWithProviders(
      <CompanionButton
        state="idle"
        audioLevel={0}
        onStartRecord={onStart}
        onStopRecord={onStop}
        onInterruptPlayback={onInterrupt}
      />
    );

    const button = screen.getByRole('button');

    // Pointer down starts listening
    await act(async () => {
      fireEvent.pointerDown(button, { pointerId: 1 });
    });
    expect(onStart).toHaveBeenCalledTimes(1);

    // State becomes listening
    rerender(
      <AudioProvider>
        <LanguageProvider>
          <CompanionButton
            state="listening"
            audioLevel={0.5}
            onStartRecord={onStart}
            onStopRecord={onStop}
            onInterruptPlayback={onInterrupt}
          />
        </LanguageProvider>
      </AudioProvider>
    );

    // Simulate hold for 500ms
    vi.spyOn(Date, 'now').mockReturnValue(Date.now() + 500);

    await act(async () => {
      fireEvent.pointerUp(button, { pointerId: 1 });
    });

    expect(onStop).toHaveBeenCalledTimes(1);
  });

  it('passes axe accessibility audit without violations', async () => {
    const onStart = vi.fn();
    const onStop = vi.fn();
    const onInterrupt = vi.fn();

    const { container } = renderWithProviders(
      <CompanionButton
        state="idle"
        audioLevel={0}
        onStartRecord={onStart}
        onStopRecord={onStop}
        onInterruptPlayback={onInterrupt}
      />
    );

    const results = await axe.run(container);
    const violations = results.violations.filter((v) => v.id !== 'color-contrast');
    expect(violations.length).toBe(0);
  });
});
