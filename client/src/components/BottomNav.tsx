import React from 'react';
import { TabType } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useAudio } from '../context/AudioContext';

interface BottomNavProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab }) => {
  const { t, currentLanguage } = useLanguage();
  const { speak, isUnlocked } = useAudio();

  const handleTabClick = (tab: TabType, label: string) => {
    onSelectTab(tab);
    if (isUnlocked) {
      speak(label, currentLanguage);
    }
  };

  const navItems: { tab: TabType; icon: string; label: string; enSubtitle: string }[] = [
    {
      tab: 'ask',
      icon: 'mic',
      label: t('nav_ask'),
      enSubtitle: 'Ask by Voice',
    },
    {
      tab: 'learn',
      icon: 'menu_book',
      label: t('nav_learn'),
      enSubtitle: 'Overview & Info',
    },
    {
      tab: 'steps',
      icon: 'checklist',
      label: t('nav_steps'),
      enSubtitle: 'Process & Steps',
    },
  ];

  return (
    <nav
      aria-label="Main Navigation"
      className="fixed bottom-0 inset-x-0 z-40 bg-surface/95 backdrop-blur-xl border-t border-surface-container-high pb-safe shadow-[0_-4px_20px_rgba(31,41,51,0.08)]"
    >
      <div className="max-w-md mx-auto flex items-center justify-around h-20 px-2">
        {navItems.map((item) => {
          const isActive = currentTab === item.tab;
          return (
            <button
              key={item.tab}
              type="button"
              onClick={() => handleTabClick(item.tab, item.label)}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-col items-center justify-center min-w-[80px] min-h-[56px] py-1.5 px-3 rounded-2xl transition-all ${
                isActive
                  ? 'text-primary font-bold'
                  : 'text-muted hover:text-ink active:scale-95'
              }`}
            >
              <div
                className={`w-12 h-9 flex items-center justify-center rounded-full transition-all ${
                  isActive
                    ? 'bg-primary-container text-on-primary shadow-xs'
                    : 'bg-transparent text-muted'
                }`}
              >
                <span
                  className="material-symbols-outlined text-[26px]"
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  {item.icon}
                </span>
              </div>
              <span className="text-[13px] tracking-tight leading-tight mt-0.5">
                {item.label}
              </span>
              <span className="text-[10px] text-muted/70 leading-none">
                {item.enSubtitle}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
