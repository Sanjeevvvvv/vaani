import { useState, useRef, useCallback, useEffect } from 'react';

export interface UseVoiceRecorderReturn {
  isRecording: boolean;
  audioLevel: number; // 0 to 1 for visualizer
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<{ blob: Blob; base64: string; mimeType: string; durationMs: number } | null>;
  isSupported: boolean;
  isBlocked: boolean;
  error: string | null;
}

export function useVoiceRecorder(): UseVoiceRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recordStartTimestampRef = useRef<number>(0);

  const isSupported =
    typeof window !== 'undefined' &&
    Boolean(navigator?.mediaDevices?.getUserMedia) &&
    Boolean(window.MediaRecorder);

  const cleanupAudio = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (maxTimerRef.current) {
      clearTimeout(maxTimerRef.current);
      maxTimerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    setAudioLevel(0);
  };

  const startRecording = useCallback(async () => {
    setError(null);
    setIsBlocked(false);
    audioChunksRef.current = [];

    if (!isSupported) {
      setError('Voice recording is not supported on this browser.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      // Determine best MIME type
      let selectedMime = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(selectedMime)) {
        if (MediaRecorder.isTypeSupported('audio/webm')) {
          selectedMime = 'audio/webm';
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          selectedMime = 'audio/mp4';
        } else {
          selectedMime = '';
        }
      }

      const recorder = selectedMime
        ? new MediaRecorder(stream, { mimeType: selectedMime })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      // Set up AudioContext Analyser for real-time waveform & silence detection
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const audioCtx = new AudioCtx();
        audioCtxRef.current = audioCtx;
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        analyserRef.current = analyser;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        let speechDetected = false;

        const checkAudioLevels = () => {
          if (!analyserRef.current) return;
          analyserRef.current.getByteFrequencyData(dataArray);

          // Compute RMS volume
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i] * dataArray[i];
          }
          const rms = Math.sqrt(sum / dataArray.length) / 255;
          setAudioLevel(Math.min(1, rms * 2.5));

          // Voice activity & silence detection
          if (rms > 0.08) {
            speechDetected = true;
            if (silenceTimerRef.current) {
              clearTimeout(silenceTimerRef.current);
              silenceTimerRef.current = null;
            }
          } else if (speechDetected && !silenceTimerRef.current) {
            // Silence detected after speech: auto-stop after 2.2 seconds
            silenceTimerRef.current = setTimeout(() => {
              if (mediaRecorderRef.current?.state === 'recording') {
                mediaRecorderRef.current.stop();
              }
            }, 2200);
          }

          animFrameRef.current = requestAnimationFrame(checkAudioLevels);
        };

        checkAudioLevels();
      }

      // Hard safety cap: auto-stop after 20 seconds maximum
      maxTimerRef.current = setTimeout(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
      }, 20000);

      recordStartTimestampRef.current = Date.now();
      recorder.start(250); // Emit chunks every 250ms
      setIsRecording(true);
    } catch (err: any) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setIsBlocked(true);
        setError('Microphone permission was denied. You can still use buttons or type below.');
      } else {
        setError('Could not access microphone.');
      }
      cleanupAudio();
    }
  }, [isSupported]);

  const stopRecording = useCallback((): Promise<{ blob: Blob; base64: string; mimeType: string; durationMs: number } | null> => {
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current;
      if (!recorder || recorder.state === 'inactive') {
        cleanupAudio();
        setIsRecording(false);
        resolve(null);
        return;
      }

      const durationMs = recordStartTimestampRef.current > 0 ? Date.now() - recordStartTimestampRef.current : 0;

      recorder.onstop = async () => {
        const mimeType = recorder.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        cleanupAudio();
        setIsRecording(false);

        if (audioBlob.size === 0) {
          resolve(null);
          return;
        }

        // Convert Blob to Base64
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Data = (reader.result as string).split(',')[1] || '';
          resolve({ blob: audioBlob, base64: base64Data, mimeType, durationMs });
        };
        reader.onerror = () => {
          resolve(null);
        };
        reader.readAsDataURL(audioBlob);
      };

      recorder.stop();
    });
  }, []);

  useEffect(() => {
    return () => {
      cleanupAudio();
    };
  }, []);

  return {
    isRecording,
    audioLevel,
    startRecording,
    stopRecording,
    isSupported,
    isBlocked,
    error,
  };
}
