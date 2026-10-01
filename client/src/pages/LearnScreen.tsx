import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAudio } from '../context/AudioContext';
import { CivicTrustBanner } from '../components/CivicTrustBanner';

interface LearnScreenProps {
  onOpenEligibility: () => void;
  onOpenSteps: () => void;
}

interface DashboardCard {
  id: string;
  title: string;
  subTitle: string;
  summary: string;
  detail: string;
  icon: string;
  iconBg: string;
  badge: string;
}

export const LearnScreen: React.FC<LearnScreenProps> = ({
  onOpenEligibility,
  onOpenSteps,
}) => {
  const { currentLanguage } = useLanguage();
  const activeLang = currentLanguage === 'none' ? 'en' : currentLanguage;
  const { speak, isUnlocked, unlockAudio } = useAudio();
  const [activeModalCard, setActiveModalCard] = useState<DashboardCard | null>(null);

  const cards: DashboardCard[] = [
    {
      id: 'what',
      title: 'సిలిండర్ & పొయ్యి',
      subTitle: 'What is this?',
      summary:
        'ప్రధాన మంత్రి ఉజ్జ్వల యోజన కింద ఉచిత గ్యాస్ కనెక్షన్, నింపిన సిలిండర్ మరియు రెండు బర్నర్ల పొయ్యి ఉచితంగా లభిస్తాయి.',
      detail:
        'కేంద్ర ప్రభుత్వం సిలిండర్ మరియు రెగ్యులేటర్ డిపాజిట్ ఫీజును పూర్తిగా రద్దు చేసింది. మొదటి సిలిండర్ రీఫిల్ మరియు డబుల్ బర్నర్ గ్యాస్ స్టవ్ లబ్ధిదారు మహిళకు ఉచితంగా అందుతాయి. ఎలాంటి రుసుము చెల్లించాల్సిన అవసరం లేదు.',
      icon: 'propane_tank',
      iconBg: 'bg-tertiary-fixed text-tertiary',
      badge: 'పూర్తి కిట్ ఉచితం',
    },
    {
      id: 'who',
      title: 'ఎవరు అర్హులు?',
      subTitle: 'Who may be eligible?',
      summary:
        '18 సంవత్సరాలు నిండిన గ్రామీణ మహిళలు మరియు రేషన్ కార్డు ఉన్న పేద కుటుంబాలు అర్హులు.',
      detail:
        'అర్హతలు: 1) దరఖాస్తుదారు మహిళకు 18 ఏళ్లు నిండి ఉండాలి. 2) కుటుంబంలో ఎవరి పేరు మీదా మరొక గ్యాస్ కనెక్షన్ ఉండకూడదు. 3) ఎస్సీ, ఎస్టీ, లేదా అంత్యోదయ/బీపీఎల్ పేదరిక వర్గానికి చెందినవారై ఉండాలి. 4) స్వంత బ్యాంక్ ఖాతా ఉండాలి.',
      icon: 'family_restroom',
      iconBg: 'bg-primary-fixed text-primary',
      badge: '18+ మహిళలు',
    },
    {
      id: 'documents',
      title: 'కావలసిన పత్రాలు',
      subTitle: 'What may I need?',
      summary:
        'మహిళ ఆధార్ కార్డు, కుటుంబ రేషన్ కార్డు, బ్యాంక్ పాస్ బుక్ మరియు పాస్‌పోర్ట్ సైజు ఫోటో.',
      detail:
        'సిద్ధం చేసుకోవలసినవి: 1) మహిళా దరఖాస్తుదారు ఆధార్ కార్డు జిరాక్స్. 2) కుటుంబ రేషన్ కార్డు జిరాక్స్. 3) కుటుంబంలోని ఇతర పెద్దల ఆధార్ కార్డులు. 4) సబ్సిడీ కొరకు బ్యాంక్ పాస్ బుక్ జిరాక్స్. 5) ఒక పాస్‌పోర్ట్ సైజు ఫోటో.',
      icon: 'badge',
      iconBg: 'bg-secondary-fixed text-secondary',
      badge: '4 ముఖ్య కాగితాలు',
    },
    {
      id: 'steps',
      title: 'దరఖాస్తు 5 దశలు',
      subTitle: 'How does it work?',
      summary:
        'కాగితాలు సిద్ధం చేయడం నుండి సమీప గ్యాస్ ఏజెన్సీలో ఫారమ్ సమర్పించి సిలిండర్ పొందడం వరకు 5 సులభ దశలు.',
      detail:
        '1వ దశ: పత్రాలు సిద్ధం చేయండి. 2వ దశ: సమీప గ్యాస్ ఏజెన్సీకి వెళ్లండి. 3వ దశ: ఉచిత ఫారమ్ నింపి సమర్పించండి. 4వ దశ: అధికారులు పరిశీలించి ఆమోదిస్తారు. 5వ దశ: ఉచిత సిలిండర్ మరియు పొయ్యిని ఇంటికి తీసుకురండి.',
      icon: 'fact_check',
      iconBg: 'bg-surface-container-high text-primary',
      badge: 'సులభ విధానం',
    },
    {
      id: 'where',
      title: 'సమీప కేంద్రాలు',
      subTitle: 'Where do I apply?',
      summary:
        'మీ ఊరిలోని భారత్ గ్యాస్, ఇండేన్ లేదా హెచ్పి గ్యాస్ ఏజెన్సీ లేదా గ్రామ సిఎస్సి కేంద్రం.',
      detail:
        'మీ గ్రామ పంచాయతీ, కామన్ సర్వీస్ సెంటర్ (CSC) లేదా దగ్గరలోని భారత్ గ్యాస్, ఇండియన్ ఆయిల్ (ఇండేన్), హెచ్‌పీ గ్యాస్ డిస్ట్రిబ్యూటర్ వద్ద దరఖాస్తు చేసుకోవచ్చు. లేదా pmuy.gov.in ద్వారా ఆన్‌లైన్‌లో దరఖాస్తు చేయవచ్చు.',
      icon: 'storefront',
      iconBg: 'bg-primary-fixed-dim text-primary',
      badge: 'గ్యాస్ ఏజెన్సీలు',
    },
    {
      id: 'helpline',
      title: 'హెల్ప్‌లైన్ నంబర్',
      subTitle: 'Need help?',
      summary:
        'ఏదైనా సందేహం ఉంటే 1800 266 6696 ఉచిత నంబరుకు ఫోన్ చేసి నేరుగా మాట్లాడవచ్చు.',
      detail:
        'జాతీయ టోల్ ఫ్రీ నంబర్: 1800-266-6696 (24x7 ఉచిత సేవ). పెట్రోలియం శాఖ నంబర్: 1800-233-3555. గ్యాస్ లీకేజ్ అత్యవసర నంబర్: 1906. ఎవరైనా డబ్బులు అడిగితే వెంటనే ఈ నంబరుకు ఫిర్యాదు చేయండి.',
      icon: 'support_agent',
      iconBg: 'bg-secondary-fixed-dim text-secondary',
      badge: '1800 266 6696',
    },
  ];

  const handleCardClick = (card: DashboardCard) => {
    if (!isUnlocked) unlockAudio();
    speak(card.summary, activeLang);
  };

  const handleOpenDetail = (e: React.MouseEvent, card: DashboardCard) => {
    e.stopPropagation();
    setActiveModalCard(card);
    if (!isUnlocked) unlockAudio();
    speak(card.detail, activeLang);
  };

  const handlePlayMasterOverview = () => {
    if (!isUnlocked) unlockAudio();
    const overview =
      activeLang === 'te'
        ? 'ప్రధాన మంత్రి ఉజ్జ్వల యోజన: పేద కుటుంబాల మహిళలకు కేంద్ర ప్రభుత్వం ఇచ్చే ఉచిత గ్యాస్ కనెక్షన్ పథకం. ఇందులో సిలిండర్, పొయ్యి, రెగ్యులేటర్ పూర్తిగా ఉచితం. మీ రేషన్ కార్డు, ఆధార్, బ్యాంక్ పాస్ బుక్ తీసుకుని గ్యాస్ ఏజెన్సీకి వెళ్లండి.'
        : 'Pradhan Mantri Ujjwala Yojana provides free LPG connections to women from eligible households. Cylinder, stove, and first refill are provided free of cost.';
    speak(overview, activeLang);
  };

  return (
    <div className="flex flex-col w-full max-w-md mx-auto px-4 py-2 pb-24">
      {/* Scheme Master Hero Card */}
      <section className="bg-surface-container-lowest rounded-20 p-4 shadow-sm border border-surface-container-high flex flex-col gap-3 relative overflow-hidden mb-3">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
            <span className="material-symbols-outlined text-[16px]">assured_workload</span>
            <span>కేంద్ర ప్రభుత్వ పథకం</span>
          </span>
          <span className="px-2.5 py-1 rounded-full bg-primary-container text-on-primary text-[11px] font-bold">
            100% ఉచితం
          </span>
        </div>

        <div className="flex items-start justify-between gap-3 mt-0.5">
          <div className="flex flex-col flex-1">
            <h1 className="text-xl font-bold text-primary leading-tight">
              ప్రధాన మంత్రి ఉజ్జ్వల యోజన
            </h1>
            <span className="text-xs text-muted font-medium mt-0.5">
              PM Ujjwala Yojana (PMUY 2.0)
            </span>
            <p className="text-xs text-ink/90 mt-1 leading-snug">
              గ్రామీణ మహిళలకు ఉచిత గ్యాస్ సిలిండర్ & డబుల్ పొయ్యి కనెక్షన్.
            </p>
          </div>

          <div className="w-16 h-16 rounded-2xl bg-tertiary-fixed shrink-0 overflow-hidden flex items-center justify-center p-1 border border-tertiary/20">
            <span
              className="material-symbols-outlined text-[36px] text-tertiary"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              propane_tank
            </span>
          </div>
        </div>

        {/* Master Audio Overview Trigger */}
        <div className="bg-surface-container rounded-2xl p-2.5 flex items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={handlePlayMasterOverview}
            className="flex items-center gap-2 text-left active:scale-98 transition-transform"
          >
            <div className="w-10 h-10 rounded-full bg-secondary text-on-secondary flex items-center justify-center shrink-0 shadow-xs">
              <span
                className="material-symbols-outlined text-[24px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                play_arrow
              </span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-primary leading-tight">
                పథకం ముఖ్యాంశాలు వినండి
              </span>
              <span className="text-[11px] text-muted">
                Listen to complete scheme overview (Audio)
              </span>
            </div>
          </button>
        </div>
      </section>

      {/* Grid Headline */}
      <div className="flex items-center justify-between px-1 mb-2">
        <h2 className="text-sm font-bold text-primary">పథకం ముఖ్యాంశాలు (6 విభాగాలు)</h2>
        <span className="text-[11px] text-muted">Tap speaker to hear</span>
      </div>

      {/* 6 Illustrated Cards (2-Column Grid) */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {cards.map((card) => (
          <div
            key={card.id}
            role="button"
            tabIndex={0}
            onClick={() => handleCardClick(card)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') handleCardClick(card);
            }}
            className="bg-surface-container-lowest hover:bg-surface-container-low active:scale-98 rounded-20 p-3.5 shadow-xs border border-surface-container-high flex flex-col justify-between min-h-[160px] cursor-pointer transition-all"
          >
            <div className="flex items-start justify-between w-full">
              <div
                className={`w-11 h-11 rounded-2xl ${card.iconBg} flex items-center justify-center shadow-xs`}
              >
                <span
                  className="material-symbols-outlined text-[24px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {card.icon}
                </span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCardClick(card);
                }}
                className="w-9 h-9 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-primary flex items-center justify-center active:scale-90 shadow-xs"
                aria-label={`Listen to ${card.title}`}
              >
                <span className="material-symbols-outlined text-[18px]">volume_up</span>
              </button>
            </div>

            <div className="flex flex-col mt-2">
              <span className="text-sm font-bold text-primary leading-tight">
                {card.title}
              </span>
              <span className="text-[11px] font-bold text-secondary mt-0.5">
                {card.badge}
              </span>
              <span className="text-[10px] text-muted line-clamp-1">{card.subTitle}</span>

              <button
                type="button"
                onClick={(e) => handleOpenDetail(e, card)}
                className="mt-2 text-[11px] font-bold text-primary underline underline-offset-2 flex items-center gap-0.5"
              >
                <span>వివరాలు • Open</span>
                <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons: Eligibility & 5-Step Guide */}
      <div className="flex flex-col gap-2.5 mb-4">
        {/* Do I qualify? Flow to Screen 10 */}
        <button
          type="button"
          onClick={onOpenEligibility}
          className="w-full bg-primary hover:bg-primary-hover text-on-primary rounded-20 p-3.5 shadow-md flex items-center justify-between active:scale-98 transition-all text-left min-h-[64px]"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[24px]">how_to_reg</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-on-primary leading-tight">
                నాకు అర్హత ఉందా? పరిశీలించండి
              </span>
              <span className="text-[11px] text-primary-fixed opacity-95">
                Do I qualify? (2 నిమిషాల సులభ పరీక్ష)
              </span>
            </div>
          </div>
          <span className="material-symbols-outlined text-on-primary text-[22px]">
            arrow_forward
          </span>
        </button>

        {/* 5-Step Guide Flow */}
        <button
          type="button"
          onClick={onOpenSteps}
          className="w-full bg-surface-container-low hover:bg-surface-container text-primary rounded-20 p-3 shadow-xs border border-outline-variant/30 flex items-center justify-between active:scale-98 transition-all text-left min-h-[56px]"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-surface-container-high text-primary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">checklist_rtl</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-primary">
                దశల వారీ గైడ్ చూడండి
              </span>
              <span className="text-[10px] text-muted">
                Open visual 5-step application process
              </span>
            </div>
          </div>
          <span className="material-symbols-outlined text-muted text-[20px]">
            chevron_right
          </span>
        </button>
      </div>

      {/* Helpline Quick Tap-to-Call */}
      <div className="mb-4">
        <a
          href="tel:18002666696"
          className="w-full min-h-[52px] rounded-20 bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center gap-2.5 font-bold text-xs shadow-xs active:scale-98 transition-all p-3"
        >
          <span className="material-symbols-outlined text-[22px]">call</span>
          <span>సహాయం కోసం ఉచిత నంబర్: 1800 266 6696</span>
        </a>
      </div>

      {/* Scam Warning Banner (Rural Safety Focus) */}
      <section className="bg-secondary-fixed/35 border border-secondary/20 rounded-20 p-3.5 flex items-start gap-2.5 shadow-xs mb-3">
        <div className="w-8 h-8 rounded-full bg-secondary text-on-secondary flex items-center justify-center shrink-0 mt-0.5">
          <span className="material-symbols-outlined text-[18px]">gpp_maybe</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-secondary">
            ముఖ్య గమనిక: దరఖాస్తుకు ఎలాంటి రుసుము చెల్లించవద్దు!
          </span>
          <p className="text-[11px] text-ink mt-0.5 leading-snug">
            ఈ ప్రభుత్వ పథకం పూర్తిగా ఉచితం. ఏ దళారికీ డబ్బులు ఇవ్వకండి. ఎవరైనా అడిగితే 1800 266 6696 కు ఫిర్యాదు చేయండి.
          </p>
        </div>
      </section>

      {/* Civic Trust Banner */}
      <CivicTrustBanner />

      {/* Detail Modal Dialog */}
      {activeModalCard && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/70 backdrop-blur-xs"
        >
          <div className="w-full max-w-md bg-surface rounded-20 shadow-2xl p-5 border border-outline-variant/30 flex flex-col gap-3 animate-pulse-subtle">
            <div className="flex items-center justify-between pb-2 border-b border-surface-container-high">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-9 h-9 rounded-xl ${activeModalCard.iconBg} flex items-center justify-center`}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {activeModalCard.icon}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-base text-primary leading-tight">
                    {activeModalCard.title}
                  </h3>
                  <span className="text-[11px] text-muted">{activeModalCard.subTitle}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModalCard(null)}
                className="w-8 h-8 rounded-full bg-surface-container-high hover:bg-surface-container-highest flex items-center justify-center text-ink"
                aria-label="Close"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="p-3 bg-surface-container-lowest rounded-xl border border-surface-container-high">
              <p className="text-xs text-ink leading-relaxed font-medium">
                {activeModalCard.detail}
              </p>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => speak(activeModalCard.detail, activeLang)}
                className="flex-1 min-h-[44px] rounded-full bg-primary hover:bg-primary-hover text-on-primary font-bold text-xs flex items-center justify-center gap-2 shadow-xs active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">volume_up</span>
                <span>మళ్ళీ వినండి • Hear again</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveModalCard(null)}
                className="px-4 min-h-[44px] rounded-full bg-surface-container-high hover:bg-surface-container-highest text-ink font-bold text-xs"
              >
                ముగించు
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
