import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAudio } from '../context/AudioContext';
import { CivicTrustBanner } from '../components/CivicTrustBanner';

interface StepItem {
  step: number;
  title: string;
  subTitle: string;
  spokenText: string;
  description: string;
  icon: string;
  illustrationDesc: string;
}

export const StepsScreen: React.FC = () => {
  const { currentLanguage } = useLanguage();
  const activeLang = currentLanguage === 'none' ? 'en' : currentLanguage;
  const { speak, isUnlocked, unlockAudio } = useAudio();
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  const steps: StepItem[] = [
    {
      step: 1,
      title: 'పత్రాలు సిద్ధం చేయండి',
      subTitle: 'STEP 1: PREPARE PAPERS',
      spokenText:
        'మొదటి దశ: మీ కుటుంబ రేషన్ కార్డు, మహిళా యజమాని ఆధార్ కార్డు మరియు బ్యాంకు పాస్బుక్ జిరాక్స్ కాపీలు దగ్గర ఉంచుకోండి.',
      description:
        'మీ కుటుంబ రేషన్ కార్డు, మహిళా యజమాని ఆధార్ కార్డు మరియు బ్యాంకు పాస్‌బుక్ జిరాక్స్ కాపీలు ఒక ఫోటో సిద్ధంగా ఉంచుకోండి.',
      icon: 'badge',
      illustrationDesc: 'Ration card, Aadhaar and bank passbook copies',
    },
    {
      step: 2,
      title: 'సమీప గ్యాస్ ఏజెన్సీకి వెళ్లండి',
      subTitle: 'STEP 2: VISIT GAS AGENCY',
      spokenText:
        'రెండవ దశ: మీ ఊరిలోని భారత్ గ్యాస్, ఇండేన్ లేదా హెచ్పి గ్యాస్ ఏజెన్సీ లేదా గ్రామ సిఎస్సి కేంద్రానికి వెళ్లండి.',
      description:
        'మీ గ్రామ పంచాయతీలోని కామన్ సర్వీస్ సెంటర్ (CSC) లేదా సమీపంలోని భారత్ గ్యాస్, ఇండేన్ లేదా హెచ్‌పీ గ్యాస్ ఏజెన్సీని సందర్శించండి.',
      icon: 'storefront',
      illustrationDesc: 'Local LPG gas distributor counter',
    },
    {
      step: 3,
      title: 'దరఖాస్తు ఫారమ్ సమర్పించండి',
      subTitle: 'STEP 3: SUBMIT FREE FORM',
      spokenText:
        'మూడవ దశ: ఉజ్జ్వల ఉచిత దరఖాస్తు ఫారమ్ నింపి పత్రాలు జతచేసి సమర్పించండి. ఎలాంటి డబ్బులు ఇవ్వవద్దు.',
      description:
        'డిస్ట్రిబ్యూటర్ వద్ద ఉచిత ఉజ్జ్వల 2.0 ఫారమ్ తీసుకోండి. పత్రాల కాపీలు జతచేసి ఇవ్వండి. దరఖాస్తుకు ఎలాంటి ఫీజు లేదు.',
      icon: 'description',
      illustrationDesc: 'Free PMUY 2.0 application form submission',
    },
    {
      step: 4,
      title: 'పరిశీలన & ఆమోదం',
      subTitle: 'STEP 4: VERIFICATION',
      spokenText:
        'నాల్గవ దశ: మీ పత్రాలు కంపెనీ ద్వారా ఆన్‌లైన్‌లో పరిశీలించబడతాయి మరియు ఆమోదం పొందుతాయి.',
      description:
        'గ్యాస్ కంపెనీ మీ పత్రాలను నిబంధనల ప్రకారం ఆన్‌లైన్ ద్వారా పరిశీలించి మీ పేరిట కనెక్షన్ నమోదు చేస్తుంది.',
      icon: 'how_to_reg',
      illustrationDesc: 'Document de-duplication check by oil company',
    },
    {
      step: 5,
      title: 'ఉచిత సిలిండర్ & పొయ్యి పొందండి',
      subTitle: 'STEP 5: RECEIVE GAS KIT',
      spokenText:
        'ఐదవ దశ: ఉచిత కనెక్షన్, నింపిన గ్యాస్ సిలిండర్, స్టవ్ మరియు రెగ్యులేటర్ అందుకోండి.',
      description:
        'ఆమోదం పూర్తయిన తర్వాత డిస్ట్రిబ్యూటర్ నుండి నింపిన గ్యాస్ సిలిండర్, డబుల్ బర్నర్ స్టవ్, రెగ్యులేటర్ మరియు గ్యాస్ పాస్‌బుక్ ఉచితంగా అందుతాయి.',
      icon: 'local_fire_department',
      illustrationDesc: 'Free filled cylinder and gas stove delivery',
    },
  ];

  const currentStep = steps[currentStepIdx];

  const handleStepChange = (newIdx: number) => {
    if (newIdx < 0 || newIdx >= steps.length) return;
    setCurrentStepIdx(newIdx);
    if (!isUnlocked) unlockAudio();
    speak(steps[newIdx].spokenText, activeLang);
  };

  const handlePlayCurrentStep = () => {
    if (!isUnlocked) unlockAudio();
    speak(currentStep.spokenText, activeLang);
  };

  return (
    <div className="flex flex-col w-full max-w-md mx-auto px-4 py-2 pb-24">
      {/* Header Stepper Title */}
      <div className="flex flex-col gap-1 mb-3">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed text-xs font-bold shadow-xs">
            <span className="material-symbols-outlined text-[16px]">local_fire_department</span>
            <span>ఉచిత గ్యాస్ పథకం</span>
          </span>
          <span className="text-xs font-bold text-primary bg-surface-container-high px-2.5 py-1 rounded-full">
            దశ {currentStep.step} / {steps.length}
          </span>
        </div>
        <h1 className="text-xl font-bold text-primary leading-tight mt-1">
          ప్రధాన మంత్రి ఉజ్జ్వల యోజన
        </h1>
        <p className="text-xs text-muted">
          5 సులభమైన దశల్లో కొత్త గ్యాస్ కనెక్షన్ పొందండి
        </p>
      </div>

      {/* 5-Stage Stepper Progress Tracker (Zero-literacy pictorial icons) */}
      <div className="w-full bg-surface-container-lowest rounded-20 p-3 shadow-xs border border-surface-container-high mb-3">
        <div className="grid grid-cols-5 gap-1 items-center">
          {steps.map((s, idx) => {
            const isCompleted = idx < currentStepIdx;
            const isCurrent = idx === currentStepIdx;

            return (
              <button
                key={s.step}
                type="button"
                onClick={() => handleStepChange(idx)}
                className="flex flex-col items-center gap-1 p-1 rounded-xl transition-all active:scale-95"
                title={`Step ${s.step}: ${s.title}`}
                aria-label={`Step ${s.step}: ${s.title}`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    isCompleted
                      ? 'bg-primary text-on-primary shadow-xs'
                      : isCurrent
                      ? 'bg-secondary text-on-secondary ring-2 ring-secondary-fixed scale-110 shadow-sm'
                      : 'bg-surface-container-high text-muted'
                  }`}
                >
                  <span
                    className="material-symbols-outlined text-[20px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {isCompleted ? 'check' : s.icon}
                  </span>
                </div>
                <span
                  className={`text-[10px] font-bold truncate max-w-full ${
                    isCurrent ? 'text-secondary' : isCompleted ? 'text-primary' : 'text-muted'
                  }`}
                >
                  {s.step}. {s.title.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Current Step Active Card */}
      <div className="bg-surface-container-lowest rounded-20 p-4 shadow-sm border border-surface-container-high flex flex-col gap-3 mb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center shrink-0 shadow-xs">
              <span
                className="material-symbols-outlined text-[28px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {currentStep.icon}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-secondary">{currentStep.subTitle}</span>
              <h2 className="text-base font-bold text-ink leading-tight">
                {currentStep.title}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={handlePlayCurrentStep}
            className="w-11 h-11 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-primary flex items-center justify-center active:scale-90 transition-transform shadow-xs"
            aria-label="Listen to this step"
          >
            <span className="material-symbols-outlined text-[22px]">volume_up</span>
          </button>
        </div>

        {/* Step Explanation Text */}
        <div className="p-3 bg-surface-container rounded-xl">
          <p className="text-xs text-ink leading-relaxed font-medium">
            {currentStep.description}
          </p>
        </div>

        {/* Navigation Arrows (Prev / Next) */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            type="button"
            disabled={currentStepIdx === 0}
            onClick={() => handleStepChange(currentStepIdx - 1)}
            className="flex-1 min-h-[48px] rounded-full bg-surface-container-high hover:bg-surface-container-highest disabled:opacity-30 text-ink font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>మునుపటిది (Back)</span>
          </button>

          <button
            type="button"
            disabled={currentStepIdx === steps.length - 1}
            onClick={() => handleStepChange(currentStepIdx + 1)}
            className="flex-1 min-h-[48px] rounded-full bg-primary hover:bg-primary-hover disabled:opacity-30 text-on-primary font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-xs"
          >
            <span>తరువాతి దశ (Next)</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* Near Me Google Maps Search Links */}
      <div className="bg-surface-container-lowest rounded-20 p-3.5 shadow-xs border border-surface-container-high flex flex-col gap-2.5 mb-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[20px]">near_me</span>
          <span className="text-xs font-bold text-primary">సమీప కేంద్రాలను కనుగొనండి (Find Nearest):</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <a
            href="https://www.google.com/maps/search/LPG+distributor+near+me"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-ink text-xs font-bold flex items-center gap-2 active:scale-98 transition-all"
          >
            <span className="material-symbols-outlined text-secondary text-[18px]">local_gas_station</span>
            <span className="truncate">గ్యాస్ ఏజెన్సీలు</span>
          </a>

          <a
            href="https://www.google.com/maps/search/Common+Service+Centre+near+me"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-ink text-xs font-bold flex items-center gap-2 active:scale-98 transition-all"
          >
            <span className="material-symbols-outlined text-primary text-[18px]">store</span>
            <span className="truncate">CSC కేంద్రాలు</span>
          </a>
        </div>
      </div>

      {/* Official Helplines */}
      <div className="bg-surface-container-low rounded-20 p-3.5 shadow-xs border border-outline-variant/30 flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-secondary-fixed text-secondary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[20px]">call</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-primary">ఉచిత హెల్ప్‌లైన్: 1800 266 6696</span>
            <span className="text-[11px] text-muted">24x7 National Support (Toll Free)</span>
          </div>
        </div>
        <a
          href="tel:18002666696"
          className="px-3.5 py-1.5 rounded-full bg-secondary text-on-secondary text-xs font-bold active:scale-95 shadow-xs"
        >
          కాల్ చేయండి
        </a>
      </div>

      {/* Civic Trust Notice */}
      <CivicTrustBanner />
    </div>
  );
};
