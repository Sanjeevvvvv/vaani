import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export const CivicTrustBanner: React.FC = () => {
  const { t } = useLanguage();

  return (
    <aside
      aria-label="Civic Notice & Government Verification"
      className="w-full rounded-2xl bg-tertiary-fixed/35 border border-tertiary/20 p-4 shadow-xs flex items-start gap-3 my-4"
    >
      <div className="w-10 h-10 rounded-full bg-surface-container-lowest flex items-center justify-center shrink-0 shadow-xs text-tertiary mt-0.5">
        <span
          className="material-symbols-outlined text-[24px]"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          verified_user
        </span>
      </div>
      <div className="flex flex-col gap-1 min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-tertiary uppercase tracking-wider">
            {t('trust_banner')}
          </span>
          <a
            href="https://www.myscheme.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
            aria-label="Visit official national scheme portal myscheme.gov.in"
          >
            <span>myscheme.gov.in</span>
            <span className="material-symbols-outlined text-[13px]">open_in_new</span>
          </a>
        </div>
        <p className="text-xs text-ink/90 font-medium leading-relaxed">
          {t('tagline')}
        </p>
        <p className="text-[11px] text-muted leading-tight">
          Vaani is an AI spoken guide for official government schemes. Always verify final procedures at authorized offices or myscheme.gov.in.
        </p>
      </div>
    </aside>
  );
};
