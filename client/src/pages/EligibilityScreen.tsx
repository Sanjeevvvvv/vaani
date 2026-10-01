import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAudio } from '../context/AudioContext';
import { ELIGIBILITY_QUESTIONS } from '../utils/translations';
import { CivicTrustBanner } from '../components/CivicTrustBanner';

interface EligibilityScreenProps {
  onBack: () => void;
  onOpenSteps: () => void;
}

export const EligibilityScreen: React.FC<EligibilityScreenProps> = ({
  onBack,
  onOpenSteps,
}) => {
  const { currentLanguage } = useLanguage();
  const activeLang = currentLanguage === 'none' ? 'en' : currentLanguage;
  const { speak, isUnlocked, unlockAudio } = useAudio();

  const questions = ELIGIBILITY_QUESTIONS[activeLang] || ELIGIBILITY_QUESTIONS.en;
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, 'yes' | 'no' | 'unsure'>>({});
  const [isCompleted, setIsCompleted] = useState(false);

  const currentQ = questions[currentIdx];

  useEffect(() => {
    if (!isCompleted && currentQ) {
      if (!isUnlocked) unlockAudio();
      speak(currentQ.voiceText, activeLang);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIdx, isCompleted]);

  const handleAnswer = (val: 'yes' | 'no' | 'unsure') => {
    const updated = { ...answers, [currentQ.id]: val };
    setAnswers(updated);

    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      setIsCompleted(true);
      // Determine result message
      const isAdult = updated[1] === 'yes';
      const noPriorLPG = updated[2] === 'no';
      const hasRation = updated[3] === 'yes';
      const hasBankAndAadhaar = updated[4] === 'yes';

      let resultSpeech = '';
      if (isAdult && noPriorLPG && hasRation && hasBankAndAadhaar) {
        resultSpeech =
          activeLang === 'te'
            ? 'మీరు ఉజ్జ్వల యోజనకు అర్హులయ్యే అవకాశం ఉంది. మీ రేషన్ కార్డు, ఆధార్, బ్యాంక్ పాస్బుక్ తీసుకుని సమీప గ్యాస్ ఏజెన్సీకి వెళ్లండి.'
            : 'You appear to be eligible for PM Ujjwala Yojana. Please visit your nearest Gas Agency with your Ration card, Aadhaar, and Bank passbook.';
      } else if (!isAdult || !noPriorLPG) {
        resultSpeech =
          activeLang === 'te'
            ? 'ఈ నిబంధనల ప్రకారం మీరు అర్హులు కాకపోవచ్చు. పూర్తి వివరాలకు అధికారిక పోర్టల్ pmuy.gov.in లేదా గ్యాస్ ఏజెన్సీని సంప్రదించండి.'
            : 'According to these criteria, you may not be eligible. Please check the official portal pmuy.gov.in or consult your local gas agency.';
      } else {
        resultSpeech =
          activeLang === 'te'
            ? 'మీ అర్హతను నిర్ధారించడానికి మీ గ్రామ సచివాలయం లేదా సమీప గ్యాస్ ఏజెన్సీని సంప్రదించండి.'
            : 'Please consult your local Gram Panchayat, CSC, or Gas Agency to verify your eligibility documents.';
      }
      speak(resultSpeech, activeLang);
    }
  };

  const calculateResult = () => {
    const isAdult = answers[1] === 'yes';
    const noPriorLPG = answers[2] === 'no';
    const hasRation = answers[3] === 'yes';
    const hasBankAndAadhaar = answers[4] === 'yes';

    if (isAdult && noPriorLPG && hasRation && hasBankAndAadhaar) {
      return {
        status: 'likely',
        badge: 'అర్హత ఉండే అవకాశం ఉంది (Likely Eligible)',
        text: 'మీ సమాధానాల ప్రకారం మీరు ఉజ్జ్వల 2.0 కింద ఉచిత గ్యాస్ కనెక్షన్ పొందడానికి అర్హులయ్యే అవకాశం ఉంది.',
        color: 'bg-primary text-on-primary',
      };
    } else if (!isAdult || !noPriorLPG) {
      return {
        status: 'unlikely',
        badge: 'అర్హత ఉండకపోవచ్చు (May Not Qualify)',
        text: 'ఇంట్లో ఇప్పటికే గ్యాస్ కనెక్షన్ ఉండటం లేదా వయస్సు నిబంధన కారణంగా అర్హత లేకపోవచ్చు.',
        color: 'bg-secondary text-on-secondary',
      };
    } else {
      return {
        status: 'unsure',
        badge: 'సందేహాస్పదం (Need Verification)',
        text: 'మీ పత్రాలు లేదా కేటగిరీ ఆధారంగా నిర్ధారణ అవసరం. అధికారిక కేంద్రం మాత్రమే ధృవీకరించగలదు.',
        color: 'bg-tertiary-fixed text-on-tertiary-fixed',
      };
    }
  };

  return (
    <div className="flex flex-col w-full max-w-md mx-auto px-4 py-2 pb-24">
      {/* Top Header Row with Back button */}
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 text-xs font-bold text-primary hover:underline"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>వెనుకకు (Back)</span>
        </button>
        <span className="text-xs font-bold text-secondary bg-secondary-fixed/50 px-2.5 py-1 rounded-full">
          {isCompleted ? 'ఫలితం (Result)' : `ప్రశ్న ${currentIdx + 1} / ${questions.length}`}
        </span>
      </div>

      {!isCompleted ? (
        <div className="bg-surface-container-lowest rounded-20 p-5 shadow-sm border border-surface-container-high flex flex-col gap-4">
          {/* Question Icon & Spoken Title */}
          <div className="flex flex-col items-center text-center gap-2">
            <div className="w-16 h-16 rounded-full bg-primary-fixed text-primary flex items-center justify-center shadow-xs">
              <span
                className="material-symbols-outlined text-[36px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {currentQ.icon}
              </span>
            </div>

            <h2 className="text-lg font-bold text-ink leading-snug max-w-xs">
              {currentQ.question}
            </h2>
            <p className="text-xs text-muted font-medium">{currentQ.subtext}</p>

            <button
              type="button"
              onClick={() => speak(currentQ.voiceText, activeLang)}
              className="mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-high text-primary text-xs font-bold active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">volume_up</span>
              <span>ప్రశ్న వినండి (Hear question)</span>
            </button>
          </div>

          {/* 3 Large Tactile Choice Buttons (Yes, No, Not sure) */}
          <div className="flex flex-col gap-2.5 mt-2">
            {/* YES Button */}
            <button
              type="button"
              onClick={() => handleAnswer('yes')}
              className="w-full min-h-[58px] rounded-20 bg-primary hover:bg-primary-hover text-on-primary font-bold text-base flex items-center justify-center gap-3 shadow-xs active:scale-98 transition-all"
            >
              <div className="w-8 h-8 rounded-full bg-primary-fixed-dim/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px] font-bold">check</span>
              </div>
              <span>అవును (Yes)</span>
            </button>

            {/* NO Button */}
            <button
              type="button"
              onClick={() => handleAnswer('no')}
              className="w-full min-h-[58px] rounded-20 bg-secondary hover:bg-secondary-hover text-on-secondary font-bold text-base flex items-center justify-center gap-3 shadow-xs active:scale-98 transition-all"
            >
              <div className="w-8 h-8 rounded-full bg-secondary-fixed/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px] font-bold">close</span>
              </div>
              <span>కాదు (No)</span>
            </button>

            {/* NOT SURE Button */}
            <button
              type="button"
              onClick={() => handleAnswer('unsure')}
              className="w-full min-h-[52px] rounded-20 bg-surface-container-high hover:bg-surface-container-highest text-ink font-bold text-sm flex items-center justify-center gap-2 active:scale-98 transition-all"
            >
              <span className="material-symbols-outlined text-[20px] text-muted">
                help_outline
              </span>
              <span>తెలియదు / సందేహం (Not sure)</span>
            </button>
          </div>
        </div>
      ) : (
        /* Results View */
        <div className="bg-surface-container-lowest rounded-20 p-5 shadow-sm border border-surface-container-high flex flex-col gap-4 animate-pulse-subtle">
          {(() => {
            const res = calculateResult();
            return (
              <>
                <div className="flex flex-col items-center text-center gap-2">
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center shadow-xs ${res.color}`}
                  >
                    <span
                      className="material-symbols-outlined text-[36px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {res.status === 'likely'
                        ? 'verified'
                        : res.status === 'unlikely'
                        ? 'cancel'
                        : 'help'}
                    </span>
                  </div>

                  <span className="text-sm font-bold px-3 py-1 rounded-full bg-surface-container text-primary">
                    {res.badge}
                  </span>

                  <p className="text-sm text-ink font-semibold leading-relaxed mt-1">
                    {res.text}
                  </p>

                  <div className="p-3 bg-tertiary-fixed/30 rounded-xl text-left border border-tertiary/20 mt-1">
                    <p className="text-xs text-tertiary leading-snug">
                      <strong>గమనిక:</strong> వాణి కేవలం ప్రాథమిక అంచనా వేస్తుంది. మీ దరఖాస్తును సంబంధిత గ్యాస్ ఏజెన్సీ లేదా pmuy.gov.in మాత్రమే తుదిగా నిర్ధారించగలదు.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={onOpenSteps}
                    className="w-full min-h-btn rounded-full bg-primary hover:bg-primary-hover text-on-primary font-bold text-sm flex items-center justify-center gap-2 shadow-xs active:scale-98 transition-all"
                  >
                    <span>దరఖాస్తు 5 దశలు చూడండి (View 5 Steps)</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAnswers({});
                      setCurrentIdx(0);
                      setIsCompleted(false);
                    }}
                    className="w-full min-h-[46px] rounded-full bg-surface-container-high hover:bg-surface-container-highest text-ink font-bold text-xs flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">replay</span>
                    <span>మళ్ళీ పరిశీలించండి (Start Over)</span>
                  </button>
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* Civic Trust Notice */}
      <CivicTrustBanner />
    </div>
  );
};
