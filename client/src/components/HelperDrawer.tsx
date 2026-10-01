import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

interface HelperDrawerProps {
  schemeId?: string;
  officialUrl?: string;
  helplineNumber?: string;
}

export const HelperDrawer: React.FC<HelperDrawerProps> = ({
  schemeId: _schemeId = 'ujjwala',
  officialUrl = 'https://www.pmuy.gov.in',
  helplineNumber = '1800-266-6696',
}) => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-lg mx-auto mt-4 px-4">
      {/* Accordion header button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-label="Official assistance and helpline drawer"
        className="w-full flex items-center justify-between p-3 rounded-20 bg-surface-container-low hover:bg-surface-container border border-outline-variant/30 text-ink transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <span className="material-symbols-outlined text-primary text-[20px]">
            contact_support
          </span>
          <span className="text-xs font-bold">{t('drawer_title')}</span>
        </div>
        <span className="material-symbols-outlined text-muted text-[20px] transition-transform duration-200">
          {isOpen ? 'expand_less' : 'expand_more'}
        </span>
      </button>

      {/* Collapsible Content */}
      {isOpen && (
        <div className="mt-2 p-4 rounded-20 bg-surface-container-high border border-outline-variant/40 shadow-xs flex flex-col gap-3 text-xs animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Helpline Call Button */}
          <a
            href={`tel:${helplineNumber.replace(/[^0-9]/g, '')}`}
            className="flex items-center justify-between p-3 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary font-bold transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">call</span>
              <span>{t('drawer_helpline')}: {helplineNumber}</span>
            </div>
            <span className="text-[10px] bg-primary text-on-primary px-2 py-0.5 rounded-full">
              Free 24x7
            </span>
          </a>

          {/* Official Website Link */}
          <a
            href={officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 rounded-xl bg-surface hover:bg-surface-container-highest text-ink border border-outline-variant/40 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-secondary">open_in_new</span>
              <span>{t('drawer_portal')}</span>
            </div>
            <span className="text-[10px] text-muted truncate max-w-[150px]">{officialUrl}</span>
          </a>

          {/* Human Helper Note */}
          <div className="flex items-start gap-2 p-3 rounded-xl bg-surface text-ink border border-outline-variant/40">
            <span className="material-symbols-outlined text-[18px] text-primary shrink-0">groups</span>
            <div className="flex flex-col">
              <span className="font-bold">{t('drawer_helper')}</span>
              <span className="text-[10px] text-muted">
                Anganwadi / ASHA workers and Common Service Centres provide free in-person application assistance.
              </span>
            </div>
          </div>

          {/* Print / Share Action */}
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-surface hover:bg-surface-container-highest text-muted border border-outline-variant/40 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">print</span>
            <span>{t('drawer_print')}</span>
          </button>
        </div>
      )}
    </div>
  );
};
