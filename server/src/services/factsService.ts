import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface SchemeFactSheet {
  scheme_id: string;
  name: string;
  tagline: string;
  ministry: string;
  description: string;
  official_url: string;
  source_url: string;
  last_checked: string;
  verify: boolean;
  benefits: string[];
  eligibility: string[];
  documents: string[];
  steps: string[];
  helpline: {
    primary: string;
    secondary?: string;
    emergency_gas_leak?: string;
    hours?: string;
    [key: string]: string | undefined;
  };
  human_helpers: string[];
  suggested_followups: Record<string, string>;
}

let cachedSchemes: Map<string, SchemeFactSheet> | null = null;

function getSchemesDir(): string {
  const possibleDirs = [
    path.resolve(__dirname, '../../data/schemes'),
    path.resolve(process.cwd(), 'server/data/schemes'),
    path.resolve(process.cwd(), 'data/schemes'),
  ];

  for (const dir of possibleDirs) {
    if (fs.existsSync(dir)) {
      return dir;
    }
  }
  throw new Error('schemes directory not found in server/data/schemes');
}

export function loadAllSchemes(): Map<string, SchemeFactSheet> {
  if (cachedSchemes) {
    return cachedSchemes;
  }

  const dir = getSchemesDir();
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json'));
  const map = new Map<string, SchemeFactSheet>();

  for (const file of files) {
    const raw = fs.readFileSync(path.join(dir, file), 'utf-8');
    const parsed = JSON.parse(raw) as SchemeFactSheet;
    map.set(parsed.scheme_id, parsed);
  }

  cachedSchemes = map;
  return cachedSchemes;
}

export function getScheme(schemeId: string): SchemeFactSheet | null {
  const schemes = loadAllSchemes();
  return schemes.get(schemeId) || null;
}

export function listSchemes(): { id: string; name: string; ministry: string; official_url: string }[] {
  const schemes = loadAllSchemes();
  return Array.from(schemes.values()).map((s) => ({
    id: s.scheme_id,
    name: s.name,
    ministry: s.ministry,
    official_url: s.official_url,
  }));
}

export function getMultiSchemeGroundingText(): string {
  const schemes = loadAllSchemes();
  const sections: string[] = [];

  for (const [, s] of schemes) {
    sections.push(`
=== SCHEME ID: ${s.scheme_id} ===
Name: ${s.name}
Ministry: ${s.ministry}
Official Portal: ${s.official_url} (Source: ${s.source_url}, Verified: ${!s.verify}, Last Checked: ${s.last_checked})
Description: ${s.description}
Benefits:
${s.benefits.map((b) => `* ${b}`).join('\n')}
Eligibility Criteria:
${s.eligibility.map((e) => `* ${e}`).join('\n')}
Required Documents:
${s.documents.map((d) => `* ${d}`).join('\n')}
Application Steps:
${s.steps.map((st, i) => `${i + 1}. ${st}`).join('\n')}
Helpline: Primary: ${s.helpline.primary} (${s.helpline.hours || 'working hours'})
Human Helpers: ${s.human_helpers.join(', ')}
`.trim());
  }

  return sections.join('\n\n');
}

export function getUnknownSchemeAnswer(language: string): { answerText: string; followUp: string } {
  const responses: Record<string, { answerText: string; followUp: string }> = {
    te: {
      answerText: 'క్షమించండి, నేను ప్రస్తుతం ప్రధాన మంత్రి ఉజ్జ్వల యోజన, మాతృ వందన యోజన మరియు సుకన్య సమృద్ధి యోజన గురించి మాత్రమే ఖచ్చితమైన సమాచారం ఇవ్వగలను. ఇతర పథకాల కోసం అధికారిక జాతీయ పోర్టల్ myscheme.gov.in ను లేదా మీ గ్రామ సచివాలయాన్ని సంప్రదించండి.',
      followUp: 'నేను ఉజ్జ్వల లేదా సుకన్య సమృద్ధి పథకం గురించి వివరించమంటారా? బటన్ పట్టుకుని మాట్లాడండి.',
    },
    hi: {
      answerText: 'माफ कीजिए, मैं केवल प्रधानमंत्री उज्ज्वला योजना, मातृ वंदना योजना और सुकन्या समृद्धि योजना की सत्यापित जानकारी दे सकती हूँ. अन्य सरकारी योजनाओं के लिए राष्ट्रीय पोर्टल myscheme.gov.in देखें या नजदीकी सीएससी केंद्र पर संपर्क करें.',
      followUp: 'क्या आप उज्ज्वला या सुकन्या समृद्धि योजना के बारे में जानना चाहते हैं? बटन दबाकर बोलें.',
    },
    ta: {
      answerText: 'மன்னிக்கவும், என்னால் பிரதமர் உஜ்வாலா யோஜனா, மாத்ரு வந்தனா யோஜனா மற்றும் சுகன்யா சம்ரிதி யோஜனா பற்றிய தகவல்களை மட்டுமே வழங்க முடியும். பிற திட்டங்களுக்கு myscheme.gov.in என்ற அதிகாரப்பூர்வ தளத்தை அல்லது பொது சேவை மையத்தை அணுகவும்.',
      followUp: 'உஜ்வாலா அல்லது சுகன்யா சம்ரிதி திட்டம் பற்றி சொல்லட்டுமா? பொத்தானை அழுத்திப் பேசுங்கள்.',
    },
    kn: {
      answerText: 'ಕ್ಷಮಿಸಿ, ನಾನು ಕೇವಲ ಪ್ರಧಾನ ಮಂತ್ರಿ ಉಜ್ವಲ ಯೋಜನೆ, ಮಾತೃ ವಂದನಾ ಯೋಜನೆ ಮತ್ತು ಸುಕನ್ಯಾ ಸಮೃದ್ಧಿ ಯೋಜನೆ ಬಗ್ಗೆ ಮಾತ್ರ ನಿಖರ ಮಾಹಿತಿ ನೀಡಬಲ್ಲೆ. ಇತರ ಯೋಜನೆಗಳಿಗಾಗಿ ಅಧಿಕೃತ ಪೋರ್ಟಲ್ myscheme.gov.in ಅಥವಾ ಸಿಎಸ್‌ಸಿ ಕೇಂದ್ರವನ್ನು ಸಂಪರ್ಕಿಸಿ.',
      followUp: 'ನಾನು ಉಜ್ವಲ ಅಥವಾ ಸುಕನ್ಯಾ ಸಮೃದ್ಧಿ ಯೋಜನೆ ಬಗ್ಗೆ ವಿವರಿಸಲೇ? ಬಟನ್ ಒತ್ತಿ ಮಾತನಾಡಿ.',
    },
    ml: {
      answerText: 'ക്ഷമിക്കണം, എനിക്ക് പ്രധാനമന്ത്രി ഉജ്ജ്വല യോജന, മാതൃ വന്ദന യോജന, സുകന്യ സമൃദ്ധി യോജന എന്നിവയെക്കുറിച്ച് മാത്രമേ വ്യക്തമായ വിവരങ്ങൾ നൽകാൻ കഴിയൂ. മറ്റ് പദ്ധതികൾക്കായി myscheme.gov.in എന്ന ഔദ്യോഗിക പോർട്ടൽ അല്ലെങ്കിൽ അക്ഷയ കേന്ദ്രം സന്ദർശിക്കുക.',
      followUp: 'ഉജ്ജ്വല അല്ലെങ്കിൽ സുകന്യ സമൃദ്ധി പദ്ധതിയെക്കുറിച്ച് പറയണോ? ബട്ടൺ അമർത്തി സംസാരിക്കൂ.',
    },
    bn: {
      answerText: 'দুঃখিত, আমি কেবল প্রধানমন্ত্রী উজ্জ্বলা যোজনা, মাতৃ বন্দনা যোজনা এবং সুকন্যা সমৃদ্ধি যোজনা সম্পর্কে সঠিক তথ্য দিতে পারি। অন্যান্য সরকারি প্রকল্পের জন্য myscheme.gov.in পোর্টাল বা নিকটবর্তী সিএসসি কেন্দ্রে যোগাযোগ করুন।',
      followUp: 'আপনি কি উজ্জ্বলা বা সুকন্যা সমৃদ্ধি যোজনা সম্পর্কে জানতে চান? বোতাম চেপে বলুন।',
    },
    mr: {
      answerText: 'माफ करा, मी फक्त प्रधानमंत्री उज्ज्वला योजना, मातृ वंदना योजना आणि सुकन्या समृद्धी योजनेबद्दल अधिकृत माहिती देऊ शकते. इतर सरकारी योजनांसाठी राष्ट्रीय पोर्टल myscheme.gov.in किंवा जवळच्या सीएससी केंद्राला भेट द्या.',
      followUp: 'उज्ज्वला किंवा सुकन्या समृद्धी योजनेबद्दल सांगू का? बटण दाबून बोला.',
    },
    en: {
      answerText: 'I can currently explain Pradhan Mantri Ujjwala Yojana, PM Matru Vandana Yojana, and Sukanya Samriddhi Yojana. For information on other schemes, please check the official national portal myscheme.gov.in or consult your local Common Service Centre.',
      followUp: 'Would you like to hear about Ujjwala or Sukanya Samriddhi? Hold the button and speak.',
    },
  };

  return responses[language] || responses.en;
}

export function getFallbackAnswer(language: string, schemeId = 'ujjwala'): string {
  const scheme = getScheme(schemeId) || getScheme('ujjwala');
  if (!scheme) {
    return 'Government services assistance. Please visit your local service centre.';
  }

  const fallbacks: Record<string, Record<string, string>> = {
    ujjwala: {
      te: 'ప్రధాన మంత్రి ఉజ్జ్వల యోజన కింద అర్హులైన పేద కుటుంబ మహిళలకు ఉచిత గ్యాస్ కనెక్షన్, నింపిన సిలిండర్ మరియు రెండు బర్నర్ల పొయ్యి ఉచితంగా లభిస్తాయి. దరఖాస్తు కోసం రేషన్ కార్డు, ఆధార్ మరియు బ్యాంక్ ఖాతాతో సమీప గ్యాస్ ఏజెన్సీ లేదా గ్రామ కేంద్రాన్ని సంప్రదించండి. ఉచిత హెల్ప్‌లైన్ 1800 266 6696.',
      hi: 'प्रधानमंत्री उज्ज्वला योजना के तहत गरीब परिवारों की महिलाओं को मुफ्त गैस कनेक्शन, भरा हुआ सिलेंडर और चूल्हा मिलता है. आवेदन के लिए राशन कार्ड, आधार और बैंक पासबुक लेकर नजदीकी गैस एजेंसी जाएं. हेल्पलाइन 1800 266 6696.',
      ta: 'பிரதமர் உஜ்வாலா யோஜனா திட்டத்தின் கீழ் ஏழை குடும்ப பெண்களுக்கு இலவச எரிவாயு இணைப்பு, சிலிண்டர் மற்றும் அடுப்பு வழங்கப்படுகிறது. விண்ணப்பிக்க ரேஷன் அட்டை, ஆதார் மற்றும் வங்கி பாஸ்புத்தகத்துடன் அருகிலுள்ள எரிவாயு முகமைக்கு செல்லுங்கள். இலவச உதவிக்கு 1800 266 6696.',
      kn: 'ಪ್ರಧಾನ ಮಂತ್ರಿ ಉಜ್ವಲ ಯೋಜನೆಯಡಿ ಬಡ ಕುಟುಂಬದ ಮಹಿಳೆಯರಿಗೆ ಉಚಿತ ಗ್ಯಾಸ್ ಸಂಪರ್ಕ, ಸಿಲಿಂಡರ್ ಮತ್ತು ಒಲೆ ನೀಡಲಾಗುತ್ತದೆ. ಅರ್ಜಿಗಾಗಿ ರೇಷನ್ ಕಾರ್ಡ್, ಆಧಾರ್ ತೆಗೆದುಕೊಂಡು ಗ್ಯಾಸ್ ಏಜೆನ್ಸಿಗೆ ಭೇಟಿ ನೀಡಿ. ಸಹಾಯವಾಣಿ 1800 266 6696.',
      ml: 'പ്രധാനമന്ത്രി ഉജ്ജ്വല യോജന പ്രകാരം പാവപ്പെട്ട കുടുംബങ്ങളിലെ സ്ത്രീകൾക്ക് സൗജന്യ ഗ്യാസ് കണക്ഷൻ, സിലിണ്ടർ, സ്റ്റൗ എന്നിവ ലഭിക്കുന്നു. അപേക്ഷിക്കാൻ റേഷൻ കാർഡ്, ആധാർ എന്നിവയുമായി ഗ്യാസ് ഏജൻസി സന്ദർശിക്കുക. ഹെൽപ്പ്‌ലൈൻ 1800 266 6696.',
      bn: 'প্রধানমন্ত্রী উজ্জ্বলা যোজনায় দরিদ্র পরিবারের মহিলারা বিনামূল্যে গ্যাস সংযোগ, সিলিন্ডার এবং ওভেন পান। আবেদনের জন্য রেশন কার্ড ও আধার নিয়ে গ্যাস এজেন্সিতে যোগাযোগ করুন। হেল্পলাইন 1800 266 6696.',
      mr: 'प्रधानमंत्री उज्ज्वला योजनेअंतर्गत गरीब कुटुंबातील महिलांना मोफत गॅस कनेक्शन, सिलिंडर आणि शेगडी मिळते. अर्जासाठी रेशन कार्ड, आधार कार्ड घेऊन गॅस एजन्सीला भेट द्या. हेल्पलाइन 1800 266 6696.',
      en: 'Under PM Ujjwala Yojana, eligible women from poor households receive a free LPG gas connection, filled cylinder, and two-burner stove. Apply at your nearest LPG distributor with your Ration Card, Aadhaar Card, and Bank Passbook. Helpline: 1800 266 6696.',
    },
    pmmvvy: {
      te: 'ప్రధాన మంత్రి మాతృ వందన యోజన కింద గర్భిణీ స్త్రీలకు మరియు బాలింతలకు పోషకాహార సహాయంగా మొదటి బిడ్డకు రూ. 5,000, రెండవ బిడ్డ ఆడపిల్ల అయితే రూ. 6,000 నేరుగా బ్యాంక్ ఖాతాలో జమ చేస్తారు. దరఖాస్తు కోసం మీ స్థానిక అంగన్‌వాడీ కేంద్రాన్ని లేదా ఆశా కార్యకర్తను సంప్రదించండి.',
      hi: 'प्रधानमंत्री मातृ वंदना योजना के तहत गर्भवती और धात्री माताओं को पहले बच्चे पर 5,000 रुपये और दूसरी संतान बेटी होने पर 6,000 रुपये सीधे बैंक खाते में दिए जाते हैं. आवेदन के लिए अपने स्थानीय आंगनवाड़ी केंद्र या आशा कार्यकर्ता से मिलें.',
      ta: 'பிரதமர் மாத்ரு வந்தனா யோஜனா திட்டத்தின் கீழ் கர்ப்பிணி தாய்மார்களுக்கு முதல் குழந்தைக்கு ரூ. 5,000 மற்றும் இரண்டாவது பெண் குழந்தைக்கு ரூ. 6,000 வங்கி கணக்கில் வழங்கப்படுகிறது. உங்கள் அங்கன்வாடி மையத்தை அணுகவும்.',
      kn: 'ಪ್ರಧಾನ ಮಂತ್ರಿ ಮಾತೃ ವಂದನಾ ಯೋಜನೆಯಡಿ ಗರ್ಭಿಣಿಯರಿಗೆ ಮೊದಲ ಮಗುವಿಗೆ ರೂ. 5,000 ಮತ್ತು ಎರಡನೇ ಮಗು ಹೆಣ್ಣಾದರೆ ರೂ. 6,000 ಬ್ಯಾಂಕ್ ಖಾತೆಗೆ ನೀಡಲಾಗುತ್ತದೆ. ನಿಮ್ಮ ಅಂಗನವಾಡಿ ಕಾರ್ಯಕರ್ತೆಯನ್ನು ಸಂಪರ್ಕಿಸಿ.',
      ml: 'പ്രധാനമന്ത്രി മാതൃ വന്ദന യോജന വഴി ഗർഭിണികൾക്ക് ആദ്യ പ്രസവത്തിന് 5,000 രൂപയും രണ്ടാമത് പെൺകുഞ്ഞാണെങ്കിൽ 6,000 രൂപയും ബാങ്ക് അക്കൗണ്ടിൽ ലഭിക്കും. അങ്കണവാടി കേന്ദ്രവുമായി ബന്ധപ്പെടുക.',
      bn: 'প্রধানমন্ত্রী মাতৃ বন্দনা যোজনায় গর্ভবতী মহিলাদের প্রথম সন্তানের জন্য ৫,০০০ টাকা এবং দ্বিতীয় সন্তান কন্যা হলে ৬,০০০ টাকা সরাসরি ব্যাংকে দেওয়া হয়। নিকটস্থ অঙ্গনওয়াড়ি কেন্দ্রে যোগাযোগ করুন।',
      mr: 'प्रधानमंत्री मातृ वंदना योजनेअंतर्गत गरोदर महिलांना पहिल्या अपत्यासाठी ५,००০ रुपये आणि दुसरी मुलगी झाल्यास ६,००० रुपये थेट बँकेत मिळतात. अंगणवाडी केंद्राशी संपर्क साधा.',
      en: 'Under PM Matru Vandana Yojana, pregnant women receive Rs. 5,000 for the first child and Rs. 6,000 if the second child is a girl directly in their bank account. Contact your local Anganwadi worker to register.',
    },
    ssy: {
      te: 'సుకన్య సమృద్ధి యోజన కింద 10 సంవత్సరాలలోపు ఆడపిల్లల పేరున పోస్ట్ ఆఫీస్ లేదా బ్యాంకులో ఖాతా తెరిచి అత్యధిక ప్రభుత్వ వడ్డీతో పొదుపు చేసుకోవచ్చు. సంవత్సరానికి కనీసం రూ. 250 జమ చేయవచ్చు. దరఖాస్తు కోసం పాప జనన ధృవీకరణ పత్రం మరియు తల్లిదండ్రుల ఆధార్‌తో సమీప పోస్ట్ ఆఫీస్‌కు వెళ్లండి.',
      hi: 'सुकन्या समृद्धि योजना में 10 वर्ष तक की बेटियों के नाम डाकघर या बैंक में खाता खुलवाकर सुरक्षित भविष्य के लिए बचत कर सकते हैं. न्यूनतम जमा केवल 250 रुपये सालाना है. बालिका के जन्म प्रमाण पत्र और अभिभावक के आधार के साथ नजदीकी डाकघर जाएं.',
      ta: 'சுகன்யா சம்ரிதி யோஜனா திட்டத்தின் கீழ் 10 வயதுக்குட்பட்ட பெண் குழந்தைகளின் பெயரில் தபால் நிலையத்தில் கணக்கு தொடங்கி அதிக வட்டியுடன் சேமிக்கலாம். குழந்தையின் பிறப்பு சான்றிதழுடன் தபால் நிலையத்தை அணுகவும்.',
      kn: 'ಸುಕನ್ಯಾ ಸಮೃದ್ಧಿ ಯೋಜನೆಯಡಿ 10 ವರ್ಷದೊಳಗಿನ ಹೆಣ್ಣುಮಕ್ಕಳ ಹೆಸರಿನಲ್ಲಿ ಅಂಚೆ ಕಚೇರಿಯಲ್ಲಿ ಖಾತೆ ತೆರೆದು ಉಳಿತಾಯ ಮಾಡಬಹುದು. ಕನಿಷ್ಠ ವಾರ್ಷಿಕ ಠೇವಣಿ ಕೇವಲ ರೂ. 250. ಸಮೀಪದ ಅಂಚೆ ಕಚೇರಿಗೆ ಭೇಟಿ ನೀಡಿ.',
      ml: 'സുകന്യ സമൃദ്ധി യോജന പ്രകാരം 10 വയസ്സിൽ താഴെയുള്ള പെൺകുട്ടികൾക്കായി പോസ്റ്റ് ഓഫീസിൽ അക്കൗണ്ട് തുറന്ന് ഉയർന്ന പലിശയിൽ സമ്പാദ്യം ആരംഭിക്കാം. ജനന സർട്ടിഫിക്കറ്റുമായി അടുത്തുള്ള പോസ്റ്റ് ഓഫീസ് സന്ദർശിക്കുക.',
      bn: 'সুকন্যা সমৃদ্ধি যোজনায় ১০ বছর পর্যন্ত কন্যা সন্তানের নামে পোস্ট অফিসে অ্যাকাউন্ট খুলে উচ্চ সুদে সঞ্চয় করা যায়। ন্যূনতম বার্ষিক জমা মাত্র ২৫০ টাকা। নিকটস্থ পোস্ট অফিসে যোগাযোগ করুন।',
      mr: 'सुकन्या समृद्धी योजनेअंतर्गत १० वर्षांखालील मुलींच्या नावाने पोस्ट ऑफिसमध्ये खाते उघडून अधिक व्याजासह बचत करता येते. मुलीच्या जन्म दाखल्यासह जवळच्या पोस्ट ऑफिसला भेट द्या.',
      en: 'Under Sukanya Samriddhi Yojana, you can open a high-interest savings account for a girl child up to 10 years old at any Post Office or bank with a minimum deposit of Rs. 250 per year. Visit your nearest Post Office with the child birth certificate and guardian Aadhaar.',
    },
  };

  const schemeFallbacks = fallbacks[schemeId] || fallbacks.ujjwala;
  return schemeFallbacks[language] || schemeFallbacks.en;
}
