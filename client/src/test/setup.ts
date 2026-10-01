import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Web Audio API
class MockAudioContext {
  state = 'suspended';
  resume = vi.fn().mockResolvedValue(undefined);
  createBuffer = vi.fn().mockReturnValue({});
  createBufferSource = vi.fn().mockReturnValue({
    connect: vi.fn(),
    start: vi.fn(),
  });
  destination = {};
}
(window as any).AudioContext = MockAudioContext;
(window as any).webkitAudioContext = MockAudioContext;

// Mock SpeechSynthesis
class MockSpeechSynthesisUtterance {
  text: string;
  lang = 'te-IN';
  rate = 1.0;
  volume = 1.0;
  pitch = 1.0;
  onend: (() => void) | null = null;
  onerror: (() => void) | null = null;
  constructor(text: string) {
    this.text = text;
  }
}
(window as any).SpeechSynthesisUtterance = MockSpeechSynthesisUtterance;

(window as any).speechSynthesis = {
  speak: vi.fn((utterance: any) => {
    if (utterance.onend) setTimeout(utterance.onend, 10);
  }),
  cancel: vi.fn(),
  getVoices: vi.fn().mockReturnValue([]),
};

// Mock Audio element
class MockAudio {
  src = '';
  playbackRate = 1.0;
  onended: (() => void) | null = null;
  onerror: (() => void) | null = null;
  play = vi.fn().mockResolvedValue(undefined);
  pause = vi.fn();
  constructor(src?: string) {
    if (src) this.src = src;
  }
}
(window as any).Audio = MockAudio;

// Mock MediaRecorder
class MockMediaRecorder {
  state = 'inactive';
  ondataavailable: ((e: any) => void) | null = null;
  onstop: (() => void) | null = null;
  start = vi.fn(() => {
    this.state = 'recording';
  });
  stop = vi.fn(() => {
    this.state = 'inactive';
    if (this.onstop) this.onstop();
  });
  static isTypeSupported = vi.fn().mockReturnValue(true);
}
(window as any).MediaRecorder = MockMediaRecorder;

// Mock getUserMedia
if (!navigator.mediaDevices) {
  (navigator as any).mediaDevices = {};
}
navigator.mediaDevices.getUserMedia = vi.fn().mockResolvedValue({
  getTracks: () => [{ stop: vi.fn() }],
});
