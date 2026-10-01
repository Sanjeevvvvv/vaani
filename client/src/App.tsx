import React, { useState } from 'react';
import { AudioProvider } from './context/AudioContext';
import { LanguageProvider } from './context/LanguageContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { AudioToast } from './components/AudioToast';
import { LanguageModal } from './components/LanguageModal';
import { ConfirmationModal } from './components/ConfirmationModal';
import { WelcomeScreen } from './pages/WelcomeScreen';
import { AskScreen } from './pages/AskScreen';
import { LearnScreen } from './pages/LearnScreen';
import { StepsScreen } from './pages/StepsScreen';
import { EligibilityScreen } from './pages/EligibilityScreen';
import { TabType, ScreenMode } from './types';

const MainAppContent: React.FC = () => {
  const [screenMode, setScreenMode] = useState<ScreenMode>('welcome');
  const [activeTab, setActiveTab] = useState<TabType>('ask');

  const handleEnterApp = () => {
    setScreenMode('main');
  };

  const handleOpenEligibility = () => {
    setScreenMode('eligibility');
  };

  const handleOpenSteps = () => {
    setScreenMode('main');
    setActiveTab('steps');
  };

  const handleLogoClick = () => {
    setScreenMode('welcome');
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col justify-between selection:bg-secondary-fixed selection:text-secondary">
      {/* Skip Link for Keyboard Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-primary focus:text-on-primary focus:p-2 focus:rounded-lg"
      >
        Skip to main content
      </a>

      {/* Persistent Header */}
      <Header onLogoClick={handleLogoClick} />

      {/* Floating Audio Captions / Player Status */}
      <AudioToast />

      {/* Modals */}
      <LanguageModal />
      <ConfirmationModal />

      {/* Main Dynamic View */}
      <main id="main-content" className="flex-1 flex flex-col">
        {screenMode === 'welcome' && <WelcomeScreen onEnterApp={handleEnterApp} />}

        {screenMode === 'main' && (
          <>
            {activeTab === 'ask' && <AskScreen />}
            {activeTab === 'learn' && (
              <LearnScreen
                onOpenEligibility={handleOpenEligibility}
                onOpenSteps={handleOpenSteps}
              />
            )}
            {activeTab === 'steps' && <StepsScreen />}
          </>
        )}

        {screenMode === 'eligibility' && (
          <EligibilityScreen
            onBack={() => setScreenMode('main')}
            onOpenSteps={handleOpenSteps}
          />
        )}
      </main>

      {/* Bottom Nav: Only visible when in main tabs mode */}
      {screenMode === 'main' && (
        <BottomNav currentTab={activeTab} onSelectTab={(tab) => setActiveTab(tab)} />
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AudioProvider>
      <LanguageProvider>
        <MainAppContent />
      </LanguageProvider>
    </AudioProvider>
  );
};

export default App;
