export interface SensitiveFilterResult {
  hasSensitiveData: boolean;
  sanitizedText: string;
  detectedTypes: ('aadhaar' | 'bank_account' | 'otp_password' | 'phone')[];
  warningMessage: string;
}

// 12-digit Aadhaar pattern (with spaces, hyphens, or continuous)
const AADHAAR_REGEX = /\b[2-9]\d{3}[ -]?\d{4}[ -]?\d{4}\b/g;

// Bank account numbers (9 to 18 digits in sequence)
const BANK_ACCOUNT_REGEX = /\b\d{9,18}\b/g;

// OTP or Password references followed by numbers
const OTP_PASSWORD_REGEX = /(?:otp|password|pin|code|పాస్వర్డ్|ఓటిపి|पिन|ओटीपी|கடவுச்சொல்|ಗುಪ್ತಪದ|രഹസ്യവാക്ക്|পাসওয়ার্ড)\s*(?:is|:|-)?\s*([0-9]{4,8})/gi;

const WARNING_TEXTS: Record<string, string> = {
  te: 'మీ ఆధార్ లేదా బ్యాంక్ వివరాలు, పాస్‌వర్డ్‌లను ఎవరితోనూ పంచుకోవద్దు. మీ భద్రత కొరకు ఆ వివరాలు తొలగించబడ్డాయి. ఉజ్జ్వల యోజన గురించి ఏదైనా ప్రశ్న అడగండి.',
  hi: 'कृपया अपना आधार नंबर, बैंक विवरण या ओटीपी किसी के साथ साझा न करें. आपकी सुरक्षा के लिए ये विवरण हटा दिए गए हैं. उज्ज्वला योजना से जुड़ा कोई भी सवाल पूछें.',
  ta: 'உங்கள் ஆதார், வங்கி விவரங்கள் அல்லது கடவுச்சொல்லைப் பகிர வேண்டாம். உங்கள் பாதுகாப்பிற்காக அவை அகற்றப்பட்டன.',
  kn: 'ದಯವಿಟ್ಟು ನಿಮ್ಮ ಆಧಾರ್, ಬ್ಯಾಂಕ್ ವಿವರ ಅಥವಾ ಪಾಸ್‌ವರ್ಡ್ ಹಂಚಿಕೊಳ್ಳಬೇಡಿ. ನಿಮ್ಮ ಸುರಕ್ಷತೆಗಾಗಿ ಅವುಗಳನ್ನು ತೆಗೆದುಹಾಕಲಾಗಿದೆ.',
  ml: 'ദയവായി നിങ്ങളുടെ ആധാർ, ബാങ്ക് വിവരങ്ങൾ അല്ലെങ്കിൽ പാസ്‌വേഡ് പങ്കിടരുത്. നിങ്ങളുടെ സുരക്ഷയ്ക്കായി അവ നീക്കംചെയ്തു.',
  bn: 'অনুগ্রহ করে আপনার আধার, ব্যাঙ্ক বিবরণ বা পাসওয়ার্ড শেয়ার করবেন না. আপনার সুরক্ষার জন্য সেগুলি সরানো হয়েছে.',
  mr: 'कृपया आपला आधार क्रमांक, बँक तपशील किंवा पासवर्ड कोणाशीही शेअर करू नका. आपल्या सुरक्षेसाठी ते वगळण्यात आले आहेत.',
  en: 'Please do not share your Aadhaar number, bank details, or passwords. For your safety, these details have been masked. Please ask your question about PM Ujjwala Yojana.',
};

export function filterSensitiveData(text: string, language = 'en'): SensitiveFilterResult {
  let sanitized = text;
  const detectedTypes: ('aadhaar' | 'bank_account' | 'otp_password' | 'phone')[] = [];

  // Check OTP / Password patterns first
  if (OTP_PASSWORD_REGEX.test(sanitized)) {
    detectedTypes.push('otp_password');
    sanitized = sanitized.replace(OTP_PASSWORD_REGEX, '[PROTECTED_OTP]');
  }

  // Check Aadhaar
  if (AADHAAR_REGEX.test(sanitized)) {
    detectedTypes.push('aadhaar');
    sanitized = sanitized.replace(AADHAAR_REGEX, '[PROTECTED_AADHAAR]');
  }

  // Check Bank Account (if not already matched)
  if (BANK_ACCOUNT_REGEX.test(sanitized)) {
    detectedTypes.push('bank_account');
    sanitized = sanitized.replace(BANK_ACCOUNT_REGEX, '[PROTECTED_NUMBER]');
  }

  const hasSensitiveData = detectedTypes.length > 0;
  const warningMessage = hasSensitiveData ? WARNING_TEXTS[language] || WARNING_TEXTS.en : '';

  return {
    hasSensitiveData,
    sanitizedText: sanitized,
    detectedTypes,
    warningMessage,
  };
}
