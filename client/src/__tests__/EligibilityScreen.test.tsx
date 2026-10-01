import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { EligibilityScreen } from '../pages/EligibilityScreen';
import { AudioProvider } from '../context/AudioContext';
import { LanguageProvider } from '../context/LanguageContext';

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <AudioProvider>
      <LanguageProvider>{ui}</LanguageProvider>
    </AudioProvider>
  );
}

describe('EligibilityScreen Component', () => {
  it('renders first question with Yes / No / Not sure options', () => {
    const onBack = vi.fn();
    const onOpenSteps = vi.fn();
    renderWithProviders(<EligibilityScreen onBack={onBack} onOpenSteps={onOpenSteps} />);

    expect(screen.getByText(/Is the woman applicant 18 years/i)).toBeInTheDocument();
    expect(screen.getByText(/అవును \(Yes\)/i)).toBeInTheDocument();
    expect(screen.getByText(/కాదు \(No\)/i)).toBeInTheDocument();
  });

  it('completes the 4 questions and displays qualification result', () => {
    const onBack = vi.fn();
    const onOpenSteps = vi.fn();
    renderWithProviders(<EligibilityScreen onBack={onBack} onOpenSteps={onOpenSteps} />);

    // Q1: 18 years? Yes
    fireEvent.click(screen.getByText(/అవును \(Yes\)/i));

    // Q2: Prior LPG? No
    fireEvent.click(screen.getByText(/కాదు \(No\)/i));

    // Q3: Ration card? Yes
    fireEvent.click(screen.getByText(/అవును \(Yes\)/i));

    // Q4: Aadhaar & Bank? Yes
    fireEvent.click(screen.getByText(/అవును \(Yes\)/i));

    // Result should show likely eligible
    expect(screen.getByText(/Likely Eligible/i)).toBeInTheDocument();
  });
});
