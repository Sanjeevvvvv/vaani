/**
 * Static Narration Pre-Generation Script for Vaani
 * Run with: npx tsx scripts/generate-audio.ts
 *
 * Pre-synthesizes static speech clips for all 8 Indian languages:
 * - Screen welcoming intros
 * - Language tile greetings
 * - 6-card dashboard summaries
 * - 5-step stepper narration
 * - Eligibility questions
 *
 * Saves synthesized MP3 base64 or audio files to server/data/audio-cache.json
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new TextToSpeechClient();

const OUTPUT_FILE = path.resolve(__dirname, '../server/data/audio-cache.json');

const VOICE_MAP: Record<string, { languageCode: string; name: string }> = {
  te: { languageCode: 'te-IN', name: 'te-IN-Standard-A' },
  hi: { languageCode: 'hi-IN', name: 'hi-IN-Neural2-A' },
  ta: { languageCode: 'ta-IN', name: 'ta-IN-Standard-A' },
  kn: { languageCode: 'kn-IN', name: 'kn-IN-Standard-A' },
  ml: { languageCode: 'ml-IN', name: 'ml-IN-Standard-A' },
  bn: { languageCode: 'bn-IN', name: 'bn-IN-Standard-A' },
  mr: { languageCode: 'mr-IN', name: 'mr-IN-Standard-A' },
  en: { languageCode: 'en-IN', name: 'en-IN-Wavenet-D' },
};

const STATIC_TEXTS: Record<string, string[]> = {
  te: [
    'నమస్కారం! వాణి ప్రభుత్వ సేవలకు స్వాగతం.',
    'ఇక్కడ తాకండి, వాణి మీతో మాట్లాడుతుంది.',
    'ప్రధాన మంత్రి ఉజ్జ్వల యోజన కింద అర్హులైన పేద కుటుంబ మహిళలకు ఉచిత గ్యాస్ కనెక్షన్ లభిస్తుంది.',
    'మొదటి దశ: మీ కుటుంబ రేషన్ కార్డు, ఆధార్ కార్డు మరియు బ్యాంకు పాస్బుక్ సిద్ధం చేసుకోండి.',
  ],
  hi: [
    'नमस्ते! वाणी नागरिक सेवा में आपका स्वागत है.',
    'यहाँ छुएं, वाणी आपसे बात करेगी.',
    'प्रधानमंत्री उज्ज्वला योजना के तहत पात्र गरीब परिवार की महिलाओं को मुफ्त गैस कनेक्शन दिया जाता है.',
  ],
  ta: [
    'வணக்கம்! வாணி அரசு சேவைக்கு உங்களை வரவேற்கிறோம்.',
  ],
  kn: [
    'ನಮಸ್ಕಾರ! ವಾಣಿ ಸರ್ಕಾರಿ ಸೇವೆಗೆ ಸುಸ್ವಾಗತ.',
  ],
  ml: [
    'നമസ്കാരം! വാണി പൗരസേവനങ്ങളിലേക്ക് സ്വാഗതം.',
  ],
  bn: [
    'নমস্কার! বাণী নাগরিক সেবায় আপনাকে স্বাগত.',
  ],
  mr: [
    'नमस्कार! वाणी शासकीय सेवेत आपले स्वागत आहे.',
  ],
  en: [
    'Hello! Welcome to Vaani Government Assistance.',
    'Tap anywhere on the circle to start listening.',
  ],
};

async function main() {
  console.log('Starting static narration generation...');
  const cache: Record<string, string> = {};

  for (const [lang, texts] of Object.entries(STATIC_TEXTS)) {
    const voice = VOICE_MAP[lang] || VOICE_MAP.en;
    console.log(`Generating audio for language: ${lang} (${voice.name})`);

    for (const text of texts) {
      try {
        const [response] = await client.synthesizeSpeech({
          input: { text },
          voice: {
            languageCode: voice.languageCode,
            name: voice.name,
            ssmlGender: 'FEMALE',
          },
          audioConfig: {
            audioEncoding: 'MP3',
            speakingRate: 0.9,
          },
        });

        if (response.audioContent) {
          const key = `${lang}:${text.slice(0, 30)}`;
          cache[key] = Buffer.from(response.audioContent).toString('base64');
          console.log(`✓ Cached clip: "${text.slice(0, 30)}..."`);
        }
      } catch (err: any) {
        console.warn(`Could not synthesize: "${text}". (${err.message})`);
      }
    }
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(cache, null, 2));
  console.log(`Saved pre-generated audio cache to: ${OUTPUT_FILE}`);
}

main().catch(console.error);
