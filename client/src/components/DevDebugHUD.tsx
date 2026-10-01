import React, { useState } from 'react';

export interface DebugPipelineInfo {
  mimeType: string;
  byteSize: number;
  geminiLanguage: string;
  geminiConfidence: number;
  scriptLanguage: string;
  dominantScript: string;
  finalLanguage: string;
  replyLanguage: string;
  voiceUsed: string;
}

interface DevDebugHUDProps {
  debugInfo: DebugPipelineInfo | null;
}

export const DevDebugHUD: React.FC<DevDebugHUDProps> = ({ debugInfo }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Only render in dev mode or localhost
  const isDev =
    process.env.NODE_ENV !== 'production' ||
    (typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'));

  if (!isDev || !debugInfo) return null;

  return (
    <div className="w-full max-w-md mx-auto my-2 px-1">
      <div className="bg-surface-container-high rounded-xl border border-outline-variant/40 overflow-hidden text-xs">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3 py-1.5 flex items-center justify-between bg-surface-container-highest text-ink font-mono font-bold hover:bg-surface-container-lowest transition-colors"
        >
          <span className="flex items-center gap-1.5 text-primary">
            <span className="material-symbols-outlined text-[14px]">bug_report</span>
            <span>DEV 2-STEP PIPELINE HUD</span>
          </span>
          <span className="text-[10px] text-muted">
            {isOpen ? '▲ Hide' : `▼ Lang: ${debugInfo.finalLanguage.toUpperCase()} (${Math.round(debugInfo.geminiConfidence * 100)}%)`}
          </span>
        </button>

        {isOpen && (
          <div className="p-3 bg-surface-container-lowest flex flex-col gap-1.5 font-mono text-[11px] text-ink leading-tight">
            <div className="flex justify-between border-b border-surface-container-high pb-1">
              <span className="text-muted">Audio Transport:</span>
              <span className="font-bold text-ink">
                {debugInfo.mimeType} ({Math.round(debugInfo.byteSize / 1024)} KB)
              </span>
            </div>
            <div className="flex justify-between border-b border-surface-container-high pb-1">
              <span className="text-muted">Step 1 Gemini Tag:</span>
              <span className="font-bold text-secondary">
                {debugInfo.geminiLanguage} (conf: {debugInfo.geminiConfidence.toFixed(2)})
              </span>
            </div>
            <div className="flex justify-between border-b border-surface-container-high pb-1">
              <span className="text-muted">Step 2 Script Dominant:</span>
              <span className="font-bold text-tertiary">
                {debugInfo.dominantScript} ({debugInfo.scriptLanguage})
              </span>
            </div>
            <div className="flex justify-between border-b border-surface-container-high pb-1">
              <span className="text-muted">Step 2 Final Resolved:</span>
              <span className="font-bold text-primary">
                {debugInfo.finalLanguage.toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Step 3 Synthesis & TTS:</span>
              <span className="font-bold text-ink">
                {debugInfo.voiceUsed}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
