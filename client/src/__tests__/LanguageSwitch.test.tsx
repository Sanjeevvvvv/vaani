import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { AskScreen } from '../pages/AskScreen';
import { LanguageProvider } from '../context/LanguageContext';
import { AudioProvider } from '../context/AudioContext';
import axe from 'axe-core';

// Mock fetch for voice & chat API
const mockFetch = vi.fn();
global.fetch = mockFetch;

const renderAskScreen = () => {
  return render(
    <AudioProvider>
      <LanguageProvider>
        <AskScreen />
      </LanguageProvider>
    </AudioProvider>
  );
};

describe('Whole-App Language Switching & Zero-Default Regression', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('starts with initial language none and switches whole UI to Hindi upon Hindi input', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        transcript: 'मुझे गैस कनेक्शन चाहिए',
        language: 'hi',
        confidence: 0.95,
        intent: 'question',
        schemeId: 'ujjwala',
        answerText: 'प्रधानमंत्री उज्ज्वला योजना के तहत मुफ्त गैस कनेक्शन मिलता है.',
        suggestedFollowUp: 'क्या मैं जरूरी कागजात बताऊँ? हाँ बोलें.',
        audioBase64: 'mock-audio',
        switched: true,
        needsLanguageChoice: false,
      }),
    });

    renderAskScreen();

    // Initial state is language-neutral (not hardcoded to Telugu)
    expect(localStorage.getItem('vaani_lang')).toBeNull();

    // Open typed input form
    fireEvent.click(screen.getByText(/type your question/i));

    // Submit typed question in Hindi
    const input = screen.getByPlaceholderText(/type your question/i);
    fireEvent.change(input, { target: { value: 'मुझे गैस कनेक्शन चाहिए' } });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Send/i }));
    });

    // Verify language changed to Hindi in DOM & localStorage
    expect(document.documentElement.lang).toBe('hi');
    expect(localStorage.getItem('vaani_lang')).toBe('hi');

    // Verify user message and Vaani response are preserved in the list
    expect(screen.getByText('मुझे गैस कनेक्शन चाहिए')).toBeInTheDocument();
    expect(
      screen.getByText(/प्रधानमंत्री उज्ज्वला योजना के तहत मुफ्त गैस कनेक्शन मिलता है/i)
    ).toBeInTheDocument();

    // Verify safety chip is updated to Hindi
    expect(screen.getByText(/हिन्दी/i)).toBeInTheDocument();
  });

  it('REGRESSION: switches to Bengali when Bengali speech is detected with no previous language', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        transcript: 'আমি গ্যাস সংযোগ চাই',
        language: 'bn',
        confidence: 0.95,
        intent: 'question',
        schemeId: 'ujjwala',
        answerText: 'প্রধানমন্ত্রী উজ্জ্বলা যোজনায় বিনামূল্যে গ্যাস সংযোগ পাওয়া যায়।',
        suggestedFollowUp: 'কি কি কাগজ লাগবে বলব?',
        audioBase64: 'mock-audio-bn',
        switched: true,
        needsLanguageChoice: false,
      }),
    });

    renderAskScreen();

    // Open typed input form
    fireEvent.click(screen.getByText(/type your question/i));

    const input = screen.getByPlaceholderText(/type your question/i);
    fireEvent.change(input, { target: { value: 'আমি গ্যাস সংযোগ চাই' } });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Send/i }));
    });

    // Verify language switched directly to Bengali, NOT Telugu
    expect(document.documentElement.lang).toBe('bn');
    expect(localStorage.getItem('vaani_lang')).toBe('bn');
    expect(screen.getByText(/বাংলা/i)).toBeInTheDocument();
  });

  it('passes axe accessibility audit on AskScreen', async () => {
    const { container } = renderAskScreen();
    const results = await axe.run(container);
    const violations = results.violations.filter((v) => v.id !== 'color-contrast');
    expect(violations.length).toBe(0);
  });
});
