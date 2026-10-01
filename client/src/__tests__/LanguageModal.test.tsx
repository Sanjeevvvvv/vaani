import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { LanguageModal } from '../components/LanguageModal';
import { AudioProvider } from '../context/AudioContext';
import { LanguageProvider, useLanguage } from '../context/LanguageContext';

const TestWrapper: React.FC = () => {
  const { setShowLanguageGrid } = useLanguage();
  return (
    <div>
      <button onClick={() => setShowLanguageGrid(true)}>Open Modal</button>
      <LanguageModal />
    </div>
  );
};

describe('LanguageModal Component', () => {
  it('opens and renders 8 regional Indian languages', () => {
    render(
      <AudioProvider>
        <LanguageProvider>
          <TestWrapper />
        </LanguageProvider>
      </AudioProvider>
    );

    fireEvent.click(screen.getByText('Open Modal'));

    expect(screen.getByText('తెలుగు')).toBeInTheDocument();
    expect(screen.getByText('हिन्दी')).toBeInTheDocument();
    expect(screen.getByText('தமிழ்')).toBeInTheDocument();
    expect(screen.getByText('ಕನ್ನಡ')).toBeInTheDocument();
    expect(screen.getByText('മലയാളം')).toBeInTheDocument();
    expect(screen.getByText('বাংলা')).toBeInTheDocument();
    expect(screen.getByText('मराठी')).toBeInTheDocument();
    expect(screen.getAllByText('English')[0]).toBeInTheDocument();
  });
});
