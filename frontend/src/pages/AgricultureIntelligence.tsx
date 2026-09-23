import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CloudRain, Droplets, Leaf, MapPin, ShieldAlert, Sprout, Sun, Wheat } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { useUserLocation } from '../contexts/LocationContext';

const cropGroups = [
  {
    group: 'Cereals',
    crops: ['Rice / Paddy', 'Wheat', 'Maize', 'Barley', 'Sorghum / Jowar', 'Pearl Millet / Bajra', 'Finger Millet / Ragi'],
  },
  {
    group: 'Pulses',
    crops: ['Chickpea / Gram', 'Pigeon Pea / Arhar', 'Lentil / Masoor', 'Black Gram / Urad', 'Green Gram / Moong', 'Field Pea'],
  },
  {
    group: 'Oilseeds',
    crops: ['Mustard', 'Groundnut', 'Soybean', 'Sunflower', 'Sesame / Til', 'Castor', 'Linseed'],
  },
  {
    group: 'Cash Crops',
    crops: ['Sugarcane', 'Cotton', 'Jute', 'Tea', 'Coffee', 'Tobacco'],
  },
  {
    group: 'Vegetables',
    crops: ['Potato', 'Tomato', 'Onion', 'Brinjal', 'Okra', 'Cabbage', 'Cauliflower', 'Chilli', 'Cucumber', 'Pumpkin'],
  },
  {
    group: 'Fruits',
    crops: ['Mango', 'Banana', 'Guava', 'Papaya', 'Litchi', 'Apple', 'Grapes', 'Pomegranate', 'Citrus'],
  },
  {
    group: 'Spices and Plantation',
    crops: ['Turmeric', 'Ginger', 'Coriander', 'Cumin', 'Black Pepper', 'Cardamom', 'Coconut', 'Arecanut'],
  },
];

const cropStages = [
  'Land Preparation',
  'Nursery',
  'Sowing / Transplanting',
  'Germination',
  'Vegetative Growth',
  'Tillering / Branching',
  'Flowering',
  'Fruit / Pod Formation',
  'Grain / Bulb / Tuber Filling',
  'Ripening / Maturity',
  'Harvesting',
  'Post-Harvest Storage',
];

const farmConditions = ['Normal', 'Waterlogging Risk', 'Dry Soil', 'Pest Symptoms', 'Disease Symptoms', 'Heat Stress', 'Cold Stress'];
const irrigationTypes = ['Rainfed', 'Canal', 'Drip', 'Sprinkler', 'Tube Well', 'Flood Irrigation'];
const regionalLanguages = [
  { label: 'Hindi / हिन्दी', value: 'hi-IN' },
  { label: 'English', value: 'en-IN' },
  { label: 'Bengali / বাংলা', value: 'bn-IN' },
  { label: 'Tamil / தமிழ்', value: 'ta-IN' },
  { label: 'Telugu / తెలుగు', value: 'te-IN' },
  { label: 'Marathi / मराठी', value: 'mr-IN' },
  { label: 'Gujarati / ગુજરાતી', value: 'gu-IN' },
  { label: 'Kannada / ಕನ್ನಡ', value: 'kn-IN' },
  { label: 'Malayalam / മലയാളം', value: 'ml-IN' },
  { label: 'Punjabi / ਪੰਜਾਬੀ', value: 'pa-IN' },
  { label: 'Urdu / اردو', value: 'ur-IN' },
  { label: 'Odia / ଓଡ଼ିଆ', value: 'or-IN' },
  { label: 'Assamese / অসমীয়া', value: 'as-IN' },
  { label: 'Konkani / कोंकणी', value: 'kok-IN' },
  { label: 'Maithili / मैथिली', value: 'mai-IN' },
  { label: 'Nepali / नेपाली', value: 'ne-IN' },
  { label: 'Sanskrit / संस्कृत', value: 'sa-IN' },
];

const selectClasses = 'h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring';

const agricultureCopy = {
  'en-IN': {
    title: 'Smart Agriculture Advisory',
    subtitle: 'Select crop and stage to get weather-aware farming guidance.',
    cropProfile: 'Crop Profile',
    chooseOptions: 'Choose from ready options',
    cropType: 'Crop Type',
    cropStage: 'Crop Stage',
    fieldCondition: 'Field Condition',
    irrigationSource: 'Irrigation Source',
    advisoryLanguage: 'Advisory Language',
    analyzeRisk: 'Analyze Risk',
    crop: 'Crop',
    stage: 'Stage',
    risk: 'Risk',
    detecting: 'Detecting...',
    fallbackLocation: 'Location permission needed. Click the location button and allow browser location for accurate local weather.',
    empty: 'Select crop, stage, field condition, and irrigation source, then analyze risk.',
    advisoryFor: 'Advisory for',
    irrigationDecision: 'Irrigation Decision',
    disclaimer: 'AI-generated advisory - confirm critical spray, fertilizer, and disease treatment with local agriculture experts.',
    ask: 'Ask WeatherGPT about',
    low: 'Low',
    moderate: 'Moderate',
    high: 'High',
    headlineLow: 'Crop condition looks manageable',
    headlineModerate: 'Monitor field condition before the next operation',
    headlineHigh: 'Protect crop from stress in the next 24 hours',
    promptIntro: 'Please give a complete farmer advisory using this crop profile.',
    promptAction: 'Use live weather, explain risks, irrigation decision, pest/disease precautions, and next 24-48 hour action steps.',
    irrigationText: (crop: string, stage: string) => `For ${crop} at ${stage.toLowerCase()} stage, use short and controlled irrigation if soil is dry. If rain clouds are active or the field is wet, postpone irrigation and keep drainage ready.`,
    tips: (crop: string, stage: string, condition: string, irrigation: string) => {
      const tips = [
        `For ${crop}, keep the ${stage.toLowerCase()} stage protected from sudden rain, heat, and strong wind changes.`,
        irrigation === 'Rainfed'
          ? 'Use field bunds and mulching to conserve soil moisture during dry spells.'
          : `Schedule ${irrigation.toLowerCase()} only after checking soil moisture near the root zone.`,
        'Inspect leaves, stem, and root zone every morning for pest or disease signs.',
      ];

      if (condition.includes('Waterlogging')) tips.unshift('Open drainage channels immediately and avoid extra irrigation until standing water clears.');
      if (condition.includes('Dry Soil')) tips.unshift('Prioritize light irrigation or moisture conservation before applying fertilizer.');
      if (condition.includes('Pest')) tips.unshift('Check pest density before spraying and prefer local agriculture officer guidance for dose selection.');
      if (condition.includes('Disease')) tips.unshift('Remove badly infected plant parts and avoid overhead irrigation to reduce disease spread.');
      if (condition.includes('Heat')) tips.unshift('Irrigate during early morning or evening and avoid fertilizer spray in peak afternoon heat.');
      if (condition.includes('Cold')) tips.unshift('Use light irrigation or smoke cover only where locally recommended to reduce frost injury.');
      if (stage.includes('Flowering')) tips.push('Avoid pesticide spray during active pollination hours unless absolutely necessary.');
      if (stage.includes('Harvesting')) tips.push('Harvest only after dew dries and keep produce covered from unexpected rain.');

      return tips;
    },
  },
  'hi-IN': {
    title: 'स्मार्ट कृषि सलाह',
    subtitle: 'मौसम आधारित खेती सलाह के लिए फसल और अवस्था चुनें।',
    cropProfile: 'फसल प्रोफाइल',
    chooseOptions: 'तैयार विकल्पों में से चुनें',
    cropType: 'फसल प्रकार',
    cropStage: 'फसल अवस्था',
    fieldCondition: 'खेत की स्थिति',
    irrigationSource: 'सिंचाई स्रोत',
    advisoryLanguage: 'सलाह की भाषा',
    analyzeRisk: 'जोखिम विश्लेषण करें',
    crop: 'फसल',
    stage: 'अवस्था',
    risk: 'जोखिम',
    detecting: 'लोकेशन खोज रहे हैं...',
    fallbackLocation: 'सटीक स्थानीय मौसम के लिए लोकेशन बटन दबाकर ब्राउज़र लोकेशन अनुमति दें।',
    empty: 'फसल, अवस्था, खेत की स्थिति और सिंचाई स्रोत चुनकर जोखिम विश्लेषण करें।',
    advisoryFor: 'सलाह',
    irrigationDecision: 'सिंचाई निर्णय',
    disclaimer: 'यह AI सलाह है - स्प्रे, खाद और रोग उपचार के लिए स्थानीय कृषि विशेषज्ञ से पुष्टि करें।',
    ask: 'WeatherGPT से पूछें',
    low: 'कम',
    moderate: 'मध्यम',
    high: 'अधिक',
    headlineLow: 'फसल की स्थिति संभालने योग्य है',
    headlineModerate: 'अगले काम से पहले खेत की स्थिति देखें',
    headlineHigh: 'अगले 24 घंटे में फसल को तनाव से बचाएं',
    promptIntro: 'इस फसल प्रोफाइल के आधार पर पूरी किसान सलाह दें।',
    promptAction: 'लाइव मौसम का उपयोग करें और जोखिम, सिंचाई, कीट/रोग सावधानी तथा अगले 24-48 घंटे के कदम बताएं।',
    irrigationText: (crop: string, stage: string) => `${crop} की ${stage} अवस्था में मिट्टी सूखी हो तो हल्की और नियंत्रित सिंचाई करें। बादल या खेत में नमी हो तो सिंचाई रोकें और जल निकासी तैयार रखें।`,
    tips: (crop: string, stage: string, condition: string, irrigation: string) => {
      const tips = [
        `${crop} की ${stage} अवस्था को अचानक बारिश, गर्मी और तेज हवा से बचाएं।`,
        irrigation === 'Rainfed'
          ? 'सूखे समय में नमी बचाने के लिए मेड़ और मल्चिंग का उपयोग करें।'
          : 'जड़ क्षेत्र की नमी देखकर ही सिंचाई करें।',
        'हर सुबह पत्ते, तना और जड़ क्षेत्र में कीट या रोग के संकेत देखें।',
      ];

      if (condition.includes('Waterlogging')) tips.unshift('खेत में जल निकासी तुरंत खोलें और पानी हटने तक अतिरिक्त सिंचाई न करें।');
      if (condition.includes('Dry Soil')) tips.unshift('खाद डालने से पहले हल्की सिंचाई या नमी संरक्षण करें।');
      if (condition.includes('Pest')) tips.unshift('दवा छिड़काव से पहले कीट संख्या जांचें और मात्रा के लिए कृषि अधिकारी से सलाह लें।');
      if (condition.includes('Disease')) tips.unshift('बहुत संक्रमित हिस्से हटाएं और ऊपर से सिंचाई कम करें।');
      if (condition.includes('Heat')) tips.unshift('सुबह या शाम सिंचाई करें और दोपहर की गर्मी में स्प्रे न करें।');
      if (condition.includes('Cold')) tips.unshift('स्थानीय सलाह के अनुसार हल्की सिंचाई या धुआं कवर इस्तेमाल करें।');
      if (stage.includes('Flowering')) tips.push('परागण के समय कीटनाशक छिड़काव से बचें।');
      if (stage.includes('Harvesting')) tips.push('ओस सूखने के बाद कटाई करें और उपज को बारिश से ढककर रखें।');

      return tips;
    },
  },
};

const regionalCopy: Record<string, typeof agricultureCopy['en-IN']> = {
  'en-IN': agricultureCopy['en-IN'],
  'hi-IN': agricultureCopy['hi-IN'],
  'bn-IN': {
    ...agricultureCopy['hi-IN'],
    title: 'স্মার্ট কৃষি পরামর্শ',
    subtitle: 'আবহাওয়া-ভিত্তিক চাষের পরামর্শ পেতে ফসল ও পর্যায় নির্বাচন করুন।',
    cropProfile: 'ফসল প্রোফাইল',
    chooseOptions: 'প্রস্তুত বিকল্প থেকে নির্বাচন করুন',
    cropType: 'ফসলের ধরন',
    cropStage: 'ফসলের পর্যায়',
    fieldCondition: 'জমির অবস্থা',
    irrigationSource: 'সেচের উৎস',
    advisoryLanguage: 'পরামর্শের ভাষা',
    analyzeRisk: 'ঝুঁকি বিশ্লেষণ করুন',
    crop: 'ফসল',
    stage: 'পর্যায়',
    risk: 'ঝুঁকি',
    empty: 'ফসল, পর্যায়, জমির অবস্থা এবং সেচের উৎস নির্বাচন করে ঝুঁকি বিশ্লেষণ করুন।',
    advisoryFor: 'পরামর্শ',
    irrigationDecision: 'সেচ সিদ্ধান্ত',
    ask: 'WeatherGPT-কে জিজ্ঞাসা করুন',
    low: 'কম',
    moderate: 'মাঝারি',
    high: 'উচ্চ',
  },
  'ta-IN': {
    ...agricultureCopy['hi-IN'],
    title: 'ஸ்மார்ட் வேளாண் ஆலோசனை',
    subtitle: 'வானிலை சார்ந்த விவசாய ஆலோசனைக்கு பயிர் மற்றும் நிலையைத் தேர்ந்தெடுக்கவும்.',
    cropProfile: 'பயிர் விவரம்',
    chooseOptions: 'தயார் விருப்பங்களில் இருந்து தேர்வு செய்யவும்',
    cropType: 'பயிர் வகை',
    cropStage: 'பயிர் நிலை',
    fieldCondition: 'வயல் நிலை',
    irrigationSource: 'பாசன மூலம்',
    advisoryLanguage: 'ஆலோசனை மொழி',
    analyzeRisk: 'ஆபத்தை பகுப்பாய்வு செய்யவும்',
    crop: 'பயிர்',
    stage: 'நிலை',
    risk: 'ஆபத்து',
    empty: 'பயிர், நிலை, வயல் நிலை மற்றும் பாசன மூலத்தைத் தேர்ந்தெடுத்து ஆபத்தை பகுப்பாய்வு செய்யவும்.',
    advisoryFor: 'ஆலோசனை',
    irrigationDecision: 'பாசன முடிவு',
    ask: 'WeatherGPT-யிடம் கேளுங்கள்',
    low: 'குறைவு',
    moderate: 'மிதமான',
    high: 'அதிகம்',
  },
  'te-IN': {
    ...agricultureCopy['hi-IN'],
    title: 'స్మార్ట్ వ్యవసాయ సలహా',
    subtitle: 'వాతావరణ ఆధారిత సాగు సలహా కోసం పంట మరియు దశను ఎంచుకోండి.',
    cropProfile: 'పంట ప్రొఫైల్',
    chooseOptions: 'సిద్ధంగా ఉన్న ఎంపికల నుండి ఎంచుకోండి',
    cropType: 'పంట రకం',
    cropStage: 'పంట దశ',
    fieldCondition: 'పొలం పరిస్థితి',
    irrigationSource: 'నీటిపారుదల వనరు',
    advisoryLanguage: 'సలహా భాష',
    analyzeRisk: 'రిస్క్ విశ్లేషించండి',
    crop: 'పంట',
    stage: 'దశ',
    risk: 'రిస్క్',
    empty: 'పంట, దశ, పొలం పరిస్థితి మరియు నీటిపారుదల వనరును ఎంచుకుని రిస్క్ విశ్లేషించండి.',
    advisoryFor: 'సలహా',
    irrigationDecision: 'నీటిపారుదల నిర్ణయం',
    ask: 'WeatherGPTని అడగండి',
    low: 'తక్కువ',
    moderate: 'మధ్యస్థం',
    high: 'అధికం',
  },
  'mr-IN': {
    ...agricultureCopy['hi-IN'],
    title: 'स्मार्ट कृषी सल्ला',
    subtitle: 'हवामानाधारित शेती सल्ल्यासाठी पीक आणि अवस्था निवडा.',
    cropProfile: 'पीक प्रोफाइल',
    chooseOptions: 'तयार पर्यायांमधून निवडा',
    cropType: 'पीक प्रकार',
    cropStage: 'पीक अवस्था',
    fieldCondition: 'शेताची स्थिती',
    irrigationSource: 'सिंचन स्रोत',
    advisoryLanguage: 'सल्ल्याची भाषा',
    analyzeRisk: 'जोखीम विश्लेषण करा',
    crop: 'पीक',
    stage: 'अवस्था',
    risk: 'जोखीम',
    empty: 'पीक, अवस्था, शेताची स्थिती आणि सिंचन स्रोत निवडून जोखीम विश्लेषण करा.',
    advisoryFor: 'सल्ला',
    irrigationDecision: 'सिंचन निर्णय',
    ask: 'WeatherGPT ला विचारा',
    low: 'कमी',
    moderate: 'मध्यम',
    high: 'जास्त',
  },
  'gu-IN': {
    ...agricultureCopy['hi-IN'],
    title: 'સ્માર્ટ કૃષિ સલાહ',
    subtitle: 'હવામાન આધારિત ખેતી સલાહ માટે પાક અને અવસ્થા પસંદ કરો.',
    cropProfile: 'પાક પ્રોફાઇલ',
    chooseOptions: 'તૈયાર વિકલ્પોમાંથી પસંદ કરો',
    cropType: 'પાક પ્રકાર',
    cropStage: 'પાક અવસ્થા',
    fieldCondition: 'ખેતરની સ્થિતિ',
    irrigationSource: 'સિંચાઈ સ્ત્રોત',
    advisoryLanguage: 'સલાહની ભાષા',
    analyzeRisk: 'જોખમ વિશ્લેષણ કરો',
    crop: 'પાક',
    stage: 'અવસ્થા',
    risk: 'જોખમ',
    empty: 'પાક, અવસ્થા, ખેતરની સ્થિતિ અને સિંચાઈ સ્ત્રોત પસંદ કરીને જોખમ વિશ્લેષણ કરો.',
    advisoryFor: 'સલાહ',
    irrigationDecision: 'સિંચાઈ નિર્ણય',
    ask: 'WeatherGPT ને પૂછો',
    low: 'ઓછું',
    moderate: 'મધ્યમ',
    high: 'વધુ',
  },
  'kn-IN': {
    ...agricultureCopy['hi-IN'],
    title: 'ಸ್ಮಾರ್ಟ್ ಕೃಷಿ ಸಲಹೆ',
    subtitle: 'ಹವಾಮಾನ ಆಧಾರಿತ ಕೃಷಿ ಮಾರ್ಗದರ್ಶನಕ್ಕಾಗಿ ಬೆಳೆ ಮತ್ತು ಹಂತ ಆಯ್ಕೆಮಾಡಿ.',
    cropProfile: 'ಬೆಳೆ ವಿವರ',
    chooseOptions: 'ಸಿದ್ಧ ಆಯ್ಕೆಗಳಿಂದ ಆರಿಸಿ',
    cropType: 'ಬೆಳೆ ಪ್ರಕಾರ',
    cropStage: 'ಬೆಳೆ ಹಂತ',
    fieldCondition: 'ಕ್ಷೇತ್ರ ಸ್ಥಿತಿ',
    irrigationSource: 'ನೀರಾವರಿ ಮೂಲ',
    advisoryLanguage: 'ಸಲಹೆಯ ಭಾಷೆ',
    analyzeRisk: 'ಅಪಾಯ ವಿಶ್ಲೇಷಿಸಿ',
    crop: 'ಬೆಳೆ',
    stage: 'ಹಂತ',
    risk: 'ಅಪಾಯ',
    empty: 'ಬೆಳೆ, ಹಂತ, ಕ್ಷೇತ್ರ ಸ್ಥಿತಿ ಮತ್ತು ನೀರಾವರಿ ಮೂಲವನ್ನು ಆರಿಸಿ ಅಪಾಯ ವಿಶ್ಲೇಷಿಸಿ.',
    advisoryFor: 'ಸಲಹೆ',
    irrigationDecision: 'ನೀರಾವರಿ ನಿರ್ಧಾರ',
    ask: 'WeatherGPT ಅನ್ನು ಕೇಳಿ',
    low: 'ಕಡಿಮೆ',
    moderate: 'ಮಧ್ಯಮ',
    high: 'ಹೆಚ್ಚು',
  },
  'ml-IN': {
    ...agricultureCopy['hi-IN'],
    title: 'സ്മാർട്ട് കാർഷിക ഉപദേശം',
    subtitle: 'കാലാവസ്ഥ അടിസ്ഥാനത്തിലുള്ള കൃഷി മാർഗ്ഗനിർദ്ദേശത്തിന് വിളയും ഘട്ടവും തിരഞ്ഞെടുക്കുക.',
    cropProfile: 'വിള പ്രൊഫൈൽ',
    chooseOptions: 'തയ്യാറായ ഓപ്ഷനുകളിൽ നിന്ന് തിരഞ്ഞെടുക്കുക',
    cropType: 'വിള തരം',
    cropStage: 'വിള ഘട്ടം',
    fieldCondition: 'വയൽ സ്ഥിതി',
    irrigationSource: 'ജലസേചന ഉറവിടം',
    advisoryLanguage: 'ഉപദേശ ഭാഷ',
    analyzeRisk: 'റിസ്ക് വിശകലനം ചെയ്യുക',
    crop: 'വിള',
    stage: 'ഘട്ടം',
    risk: 'റിസ്ക്',
    empty: 'വിള, ഘട്ടം, വയൽ സ്ഥിതി, ജലസേചന ഉറവിടം എന്നിവ തിരഞ്ഞെടുത്ത് റിസ്ക് വിശകലനം ചെയ്യുക.',
    advisoryFor: 'ഉപദേശം',
    irrigationDecision: 'ജലസേചന തീരുമാനം',
    ask: 'WeatherGPT-നോട് ചോദിക്കുക',
    low: 'കുറവ്',
    moderate: 'മിതം',
    high: 'കൂടുതൽ',
  },
  'pa-IN': {
    ...agricultureCopy['hi-IN'],
    title: 'ਸਮਾਰਟ ਖੇਤੀ ਸਲਾਹ',
    subtitle: 'ਮੌਸਮ ਅਧਾਰਿਤ ਖੇਤੀ ਸਲਾਹ ਲਈ ਫਸਲ ਅਤੇ ਪੜਾਅ ਚੁਣੋ।',
    cropProfile: 'ਫਸਲ ਪ੍ਰੋਫਾਈਲ',
    chooseOptions: 'ਤਿਆਰ ਵਿਕਲਪਾਂ ਵਿੱਚੋਂ ਚੁਣੋ',
    cropType: 'ਫਸਲ ਕਿਸਮ',
    cropStage: 'ਫਸਲ ਪੜਾਅ',
    fieldCondition: 'ਖੇਤ ਦੀ ਸਥਿਤੀ',
    irrigationSource: 'ਸਿੰਚਾਈ ਸਰੋਤ',
    advisoryLanguage: 'ਸਲਾਹ ਦੀ ਭਾਸ਼ਾ',
    analyzeRisk: 'ਖਤਰੇ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ ਕਰੋ',
    crop: 'ਫਸਲ',
    stage: 'ਪੜਾਅ',
    risk: 'ਖਤਰਾ',
    empty: 'ਫਸਲ, ਪੜਾਅ, ਖੇਤ ਦੀ ਸਥਿਤੀ ਅਤੇ ਸਿੰਚਾਈ ਸਰੋਤ ਚੁਣਕੇ ਖਤਰੇ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ ਕਰੋ।',
    advisoryFor: 'ਸਲਾਹ',
    irrigationDecision: 'ਸਿੰਚਾਈ ਫੈਸਲਾ',
    ask: 'WeatherGPT ਨੂੰ ਪੁੱਛੋ',
    low: 'ਘੱਟ',
    moderate: 'ਦਰਮਿਆਨਾ',
    high: 'ਵੱਧ',
  },
  'ur-IN': {
    ...agricultureCopy['hi-IN'],
    title: 'اسمارٹ زرعی مشورہ',
    subtitle: 'موسم کی بنیاد پر کاشتکاری مشورے کے لیے فصل اور مرحلہ منتخب کریں۔',
    cropProfile: 'فصل پروفائل',
    chooseOptions: 'تیار اختیارات میں سے منتخب کریں',
    cropType: 'فصل کی قسم',
    cropStage: 'فصل کا مرحلہ',
    fieldCondition: 'کھیت کی حالت',
    irrigationSource: 'آبپاشی کا ذریعہ',
    advisoryLanguage: 'مشورے کی زبان',
    analyzeRisk: 'خطرے کا تجزیہ کریں',
    crop: 'فصل',
    stage: 'مرحلہ',
    risk: 'خطرہ',
    empty: 'فصل، مرحلہ، کھیت کی حالت اور آبپاشی کا ذریعہ منتخب کرکے خطرے کا تجزیہ کریں۔',
    advisoryFor: 'مشورہ',
    irrigationDecision: 'آبپاشی فیصلہ',
    ask: 'WeatherGPT سے پوچھیں',
    low: 'کم',
    moderate: 'درمیانہ',
    high: 'زیادہ',
  },
  'or-IN': {
    ...agricultureCopy['hi-IN'],
    title: 'ସ୍ମାର୍ଟ କୃଷି ପରାମର୍ଶ',
    subtitle: 'ପାଣିପାଗ ଆଧାରିତ କୃଷି ପରାମର୍ଶ ପାଇଁ ଫସଲ ଏବଂ ଅବସ୍ଥା ବାଛନ୍ତୁ।',
    cropProfile: 'ଫସଲ ପ୍ରୋଫାଇଲ',
    chooseOptions: 'ତିଆରି ବିକଳ୍ପରୁ ବାଛନ୍ତୁ',
    cropType: 'ଫସଲ ପ୍ରକାର',
    cropStage: 'ଫସଲ ଅବସ୍ଥା',
    fieldCondition: 'କ୍ଷେତ୍ର ଅବସ୍ଥା',
    irrigationSource: 'ସିଚାଇ ଉତ୍ସ',
    advisoryLanguage: 'ପରାମର୍ଶ ଭାଷା',
    analyzeRisk: 'ଜୋଖିମ ବିଶ୍ଳେଷଣ କରନ୍ତୁ',
    crop: 'ଫସଲ',
    stage: 'ଅବସ୍ଥା',
    risk: 'ଜୋଖିମ',
    empty: 'ଫସଲ, ଅବସ୍ଥା, କ୍ଷେତ୍ର ଅବସ୍ଥା ଏବଂ ସିଚାଇ ଉତ୍ସ ବାଛି ଜୋଖିମ ବିଶ୍ଳେଷଣ କରନ୍ତୁ।',
    advisoryFor: 'ପରାମର୍ଶ',
    irrigationDecision: 'ସିଚାଇ ନିଷ୍ପତ୍ତି',
    ask: 'WeatherGPT କୁ ପଚାରନ୍ତୁ',
    low: 'କମ',
    moderate: 'ମଧ୍ୟମ',
    high: 'ଅଧିକ',
  },
  'as-IN': {
    ...agricultureCopy['hi-IN'],
    title: 'স্মাৰ্ট কৃষি পৰামৰ্শ',
    subtitle: 'বতৰ-ভিত্তিক কৃষি পৰামৰ্শৰ বাবে শস্য আৰু পৰ্যায় বাছনি কৰক।',
    cropProfile: 'শস্য প্ৰফাইল',
    chooseOptions: 'সাজু বিকল্পৰ পৰা বাছনি কৰক',
    cropType: 'শস্যৰ ধৰণ',
    cropStage: 'শস্যৰ পৰ্যায়',
    fieldCondition: 'খেতিৰ অৱস্থা',
    irrigationSource: 'সেচৰ উৎস',
    advisoryLanguage: 'পৰামৰ্শৰ ভাষা',
    analyzeRisk: 'ঝুঁকি বিশ্লেষণ কৰক',
    crop: 'শস্য',
    stage: 'পৰ্যায়',
    risk: 'ঝুঁকি',
    empty: 'শস্য, পৰ্যায়, খেতিৰ অৱস্থা আৰু সেচৰ উৎস বাছি ঝুঁকি বিশ্লেষণ কৰক।',
    advisoryFor: 'পৰামৰ্শ',
    irrigationDecision: 'সেচ সিদ্ধান্ত',
    ask: 'WeatherGPT-ক সোধক',
    low: 'কম',
    moderate: 'মধ্যম',
    high: 'অধিক',
  },
  'kok-IN': {
    ...agricultureCopy['hi-IN'],
    title: 'स्मार्ट शेती सल्लो',
    subtitle: 'हवामानाचेर आदारीत शेती सल्ल्या खातीर पीक आनी पावंडो निवडात.',
    cropProfile: 'पीक प्रोफायल',
    chooseOptions: 'तयार पर्यायांतल्यान निवडात',
    cropType: 'पीक प्रकार',
    cropStage: 'पीक पावंडो',
    fieldCondition: 'शेताची स्थिती',
    irrigationSource: 'सिंचन स्रोत',
    advisoryLanguage: 'सल्ल्याची भास',
    analyzeRisk: 'धोका तपासा',
    crop: 'पीक',
    stage: 'पावंडो',
    risk: 'धोको',
    empty: 'पीक, पावंडो, शेताची स्थिती आनी सिंचन स्रोत निवडून धोका तपासा.',
    advisoryFor: 'सल्लो',
    irrigationDecision: 'सिंचन निर्णय',
    ask: 'WeatherGPT कडेन विचारात',
    low: 'उणो',
    moderate: 'मध्यम',
    high: 'चड',
  },
  'mai-IN': {
    ...agricultureCopy['hi-IN'],
    title: 'स्मार्ट कृषि सलाह',
    subtitle: 'मौसम आधारित खेती सलाह लेल फसल आ अवस्था चुनू।',
    cropProfile: 'फसल प्रोफाइल',
    chooseOptions: 'तैयार विकल्प मे सँ चुनू',
    cropType: 'फसल प्रकार',
    cropStage: 'फसल अवस्था',
    fieldCondition: 'खेतक स्थिति',
    irrigationSource: 'सिंचाई स्रोत',
    advisoryLanguage: 'सलाहक भाषा',
    analyzeRisk: 'जोखिम विश्लेषण करू',
    crop: 'फसल',
    stage: 'अवस्था',
    risk: 'जोखिम',
    empty: 'फसल, अवस्था, खेतक स्थिति आ सिंचाई स्रोत चुनि जोखिम विश्लेषण करू।',
    advisoryFor: 'सलाह',
    irrigationDecision: 'सिंचाई निर्णय',
    ask: 'WeatherGPT सँ पूछू',
    low: 'कम',
    moderate: 'मध्यम',
    high: 'बेसी',
  },
  'ne-IN': {
    ...agricultureCopy['hi-IN'],
    title: 'स्मार्ट कृषि सल्लाह',
    subtitle: 'मौसममा आधारित खेती सल्लाहका लागि बाली र चरण छान्नुहोस्।',
    cropProfile: 'बाली प्रोफाइल',
    chooseOptions: 'तयार विकल्पबाट छान्नुहोस्',
    cropType: 'बाली प्रकार',
    cropStage: 'बाली चरण',
    fieldCondition: 'खेतको अवस्था',
    irrigationSource: 'सिँचाइ स्रोत',
    advisoryLanguage: 'सल्लाह भाषा',
    analyzeRisk: 'जोखिम विश्लेषण गर्नुहोस्',
    crop: 'बाली',
    stage: 'चरण',
    risk: 'जोखिम',
    empty: 'बाली, चरण, खेतको अवस्था र सिँचाइ स्रोत छानेर जोखिम विश्लेषण गर्नुहोस्।',
    advisoryFor: 'सल्लाह',
    irrigationDecision: 'सिँचाइ निर्णय',
    ask: 'WeatherGPT लाई सोध्नुहोस्',
    low: 'कम',
    moderate: 'मध्यम',
    high: 'धेरै',
  },
  'sa-IN': {
    ...agricultureCopy['hi-IN'],
    title: 'स्मार्ट कृषिः परामर्शः',
    subtitle: 'वातावरणाधारितकृषिपरामर्शाय सस्यं अवस्थां च चिनुत।',
    cropProfile: 'सस्य विवरणम्',
    chooseOptions: 'सिद्धविकल्पेभ्यः चिनुत',
    cropType: 'सस्य प्रकारः',
    cropStage: 'सस्य अवस्था',
    fieldCondition: 'क्षेत्र स्थिति',
    irrigationSource: 'सिञ्चन स्रोतः',
    advisoryLanguage: 'परामर्श भाषा',
    analyzeRisk: 'जोखिमं विश्लेषयतु',
    crop: 'सस्यम्',
    stage: 'अवस्था',
    risk: 'जोखिमम्',
    empty: 'सस्यं, अवस्थां, क्षेत्रस्थितिं सिञ्चनस्रोतं च चित्वा जोखिमं विश्लेषयतु।',
    advisoryFor: 'परामर्शः',
    irrigationDecision: 'सिञ्चन निर्णयः',
    ask: 'WeatherGPT पृच्छतु',
    low: 'न्यूनम्',
    moderate: 'मध्यमम्',
    high: 'अधिकम्',
  },
};

const optionTranslations: Record<string, Record<string, string>> = {
  'hi-IN': {
    Cereals: 'अनाज',
    Pulses: 'दालें',
    Oilseeds: 'तिलहन',
    'Cash Crops': 'नकदी फसलें',
    Vegetables: 'सब्जियां',
    Fruits: 'फल',
    'Spices and Plantation': 'मसाले और बागान',
    'Rice / Paddy': 'धान',
    Wheat: 'गेहूं',
    Maize: 'मक्का',
    Barley: 'जौ',
    'Sorghum / Jowar': 'ज्वार',
    'Pearl Millet / Bajra': 'बाजरा',
    'Finger Millet / Ragi': 'रागी',
    'Chickpea / Gram': 'चना',
    'Pigeon Pea / Arhar': 'अरहर',
    'Lentil / Masoor': 'मसूर',
    'Black Gram / Urad': 'उड़द',
    'Green Gram / Moong': 'मूंग',
    'Field Pea': 'मटर',
    Mustard: 'सरसों',
    Groundnut: 'मूंगफली',
    Soybean: 'सोयाबीन',
    Sunflower: 'सूरजमुखी',
    'Sesame / Til': 'तिल',
    Castor: 'अरंडी',
    Linseed: 'अलसी',
    Sugarcane: 'गन्ना',
    Cotton: 'कपास',
    Jute: 'जूट',
    Tea: 'चाय',
    Coffee: 'कॉफी',
    Tobacco: 'तंबाकू',
    Potato: 'आलू',
    Tomato: 'टमाटर',
    Onion: 'प्याज',
    Brinjal: 'बैंगन',
    Okra: 'भिंडी',
    Cabbage: 'पत्ता गोभी',
    Cauliflower: 'फूलगोभी',
    Chilli: 'मिर्च',
    Cucumber: 'खीरा',
    Pumpkin: 'कद्दू',
    Mango: 'आम',
    Banana: 'केला',
    Guava: 'अमरूद',
    Papaya: 'पपीता',
    Litchi: 'लीची',
    Apple: 'सेब',
    Grapes: 'अंगूर',
    Pomegranate: 'अनार',
    Citrus: 'नींबू वर्गीय फल',
    Turmeric: 'हल्दी',
    Ginger: 'अदरक',
    Coriander: 'धनिया',
    Cumin: 'जीरा',
    'Black Pepper': 'काली मिर्च',
    Cardamom: 'इलायची',
    Coconut: 'नारियल',
    Arecanut: 'सुपारी',
    'Land Preparation': 'खेत तैयारी',
    Nursery: 'नर्सरी',
    'Sowing / Transplanting': 'बुवाई / रोपाई',
    Germination: 'अंकुरण',
    'Vegetative Growth': 'वनस्पतिक वृद्धि',
    'Tillering / Branching': 'टिलरिंग / शाखा बनना',
    Flowering: 'फूल आना',
    'Fruit / Pod Formation': 'फल / फली बनना',
    'Grain / Bulb / Tuber Filling': 'दाना / कंद भरना',
    'Ripening / Maturity': 'पकना / परिपक्वता',
    Harvesting: 'कटाई',
    'Post-Harvest Storage': 'कटाई के बाद भंडारण',
    Normal: 'सामान्य',
    'Waterlogging Risk': 'जलभराव का खतरा',
    'Dry Soil': 'सूखी मिट्टी',
    'Pest Symptoms': 'कीट के लक्षण',
    'Disease Symptoms': 'रोग के लक्षण',
    'Heat Stress': 'गर्मी का तनाव',
    'Cold Stress': 'ठंड का तनाव',
    Rainfed: 'वर्षा आधारित',
    Canal: 'नहर',
    Drip: 'ड्रिप',
    Sprinkler: 'स्प्रिंकलर',
    'Tube Well': 'ट्यूबवेल',
    'Flood Irrigation': 'बाढ़ सिंचाई',
  },
  'bn-IN': {
    Cereals: 'শস্য',
    Pulses: 'ডাল',
    Oilseeds: 'তেলবীজ',
    'Cash Crops': 'নগদ ফসল',
    Vegetables: 'সবজি',
    Fruits: 'ফল',
    'Spices and Plantation': 'মসলা ও বাগান',
    'Rice / Paddy': 'ধান',
    Wheat: 'গম',
    Maize: 'ভুট্টা',
    Potato: 'আলু',
    Tomato: 'টমেটো',
    Onion: 'পেঁয়াজ',
    Mango: 'আম',
    Banana: 'কলা',
    'Land Preparation': 'জমি প্রস্তুতি',
    Nursery: 'নার্সারি',
    'Sowing / Transplanting': 'বপন / রোপণ',
    Germination: 'অঙ্কুরোদগম',
    Flowering: 'ফুল আসা',
    Harvesting: 'ফসল কাটা',
    Normal: 'স্বাভাবিক',
    'Waterlogging Risk': 'জলাবদ্ধতার ঝুঁকি',
    'Dry Soil': 'শুকনো মাটি',
    'Pest Symptoms': 'পোকার লক্ষণ',
    'Disease Symptoms': 'রোগের লক্ষণ',
    'Heat Stress': 'তাপের চাপ',
    'Cold Stress': 'ঠান্ডার চাপ',
    Rainfed: 'বৃষ্টি নির্ভর',
    Canal: 'খাল',
    Drip: 'ড্রিপ',
    Sprinkler: 'স্প্রিংকলার',
    'Tube Well': 'টিউবওয়েল',
    'Flood Irrigation': 'বন্যা সেচ',
  },
  'ta-IN': {
    Cereals: 'தானியங்கள்',
    Pulses: 'பருப்பு வகைகள்',
    Oilseeds: 'எண்ணெய் விதைகள்',
    'Cash Crops': 'பணப் பயிர்கள்',
    Vegetables: 'காய்கறிகள்',
    Fruits: 'பழங்கள்',
    'Spices and Plantation': 'மசாலா மற்றும் தோட்டப் பயிர்கள்',
    'Rice / Paddy': 'நெல்',
    Wheat: 'கோதுமை',
    Maize: 'மக்காச்சோளம்',
    Potato: 'உருளைக்கிழங்கு',
    Tomato: 'தக்காளி',
    Onion: 'வெங்காயம்',
    Mango: 'மாம்பழம்',
    Banana: 'வாழைப்பழம்',
    'Land Preparation': 'நிலத் தயாரிப்பு',
    Nursery: 'நாற்றங்கால்',
    'Sowing / Transplanting': 'விதைப்பு / நடவு',
    Germination: 'முளைப்பு',
    Flowering: 'பூக்கும் நிலை',
    Harvesting: 'அறுவடை',
    Normal: 'சாதாரணம்',
    'Waterlogging Risk': 'நீர் தேங்கும் அபாயம்',
    'Dry Soil': 'உலர்ந்த மண்',
    'Pest Symptoms': 'பூச்சி அறிகுறிகள்',
    'Disease Symptoms': 'நோய் அறிகுறிகள்',
    'Heat Stress': 'வெப்ப அழுத்தம்',
    'Cold Stress': 'குளிர் அழுத்தம்',
    Rainfed: 'மழை சார்ந்தது',
    Canal: 'கால்வாய்',
    Drip: 'சொட்டு நீர்ப்பாசனம்',
    Sprinkler: 'தெளிப்பு நீர்ப்பாசனம்',
    'Tube Well': 'குழாய் கிணறு',
    'Flood Irrigation': 'வெள்ளப் பாசனம்',
  },
  'te-IN': {
    Cereals: 'ధాన్యాలు',
    Pulses: 'పప్పుధాన్యాలు',
    Oilseeds: 'నూనెగింజలు',
    'Cash Crops': 'నగదు పంటలు',
    Vegetables: 'కూరగాయలు',
    Fruits: 'పండ్లు',
    'Spices and Plantation': 'మసాలా మరియు తోట పంటలు',
    'Rice / Paddy': 'వరి',
    Wheat: 'గోధుమ',
    Maize: 'మొక్కజొన్న',
    Potato: 'బంగాళాదుంప',
    Tomato: 'టమాటా',
    Onion: 'ఉల్లిపాయ',
    Mango: 'మామిడి',
    Banana: 'అరటి',
    'Land Preparation': 'భూమి సిద్ధం',
    Nursery: 'నర్సరీ',
    'Sowing / Transplanting': 'విత్తడం / నాటడం',
    Germination: 'మొలకెత్తడం',
    Flowering: 'పుష్ప దశ',
    Harvesting: 'కోత',
    Normal: 'సాధారణం',
    'Waterlogging Risk': 'నీరు నిలిచే ప్రమాదం',
    'Dry Soil': 'ఎండిన నేల',
    'Pest Symptoms': 'పురుగు లక్షణాలు',
    'Disease Symptoms': 'రోగ లక్షణాలు',
    'Heat Stress': 'వేడి ఒత్తిడి',
    'Cold Stress': 'చలి ఒత్తిడి',
    Rainfed: 'వర్షాధారితం',
    Canal: 'కాలువ',
    Drip: 'డ్రిప్',
    Sprinkler: 'స్ప్రింక్లర్',
    'Tube Well': 'ట్యూబ్ వెల్',
    'Flood Irrigation': 'ముంపు నీటిపారుదల',
  },
  'mr-IN': {
    Cereals: 'धान्ये',
    Pulses: 'कडधान्ये',
    Oilseeds: 'तेलबिया',
    'Cash Crops': 'नगदी पिके',
    Vegetables: 'भाज्या',
    Fruits: 'फळे',
    'Spices and Plantation': 'मसाले आणि बागायती',
  },
  'gu-IN': {
    Cereals: 'અનાજ',
    Pulses: 'કઠોળ',
    Oilseeds: 'તેલબિયાં',
    'Cash Crops': 'રોકડ પાક',
    Vegetables: 'શાકભાજી',
    Fruits: 'ફળો',
    'Spices and Plantation': 'મસાલા અને બાગાયતી',
    'Rice / Paddy': 'ડાંગર',
    Wheat: 'ઘઉં',
    Maize: 'મકાઈ',
  },
  'kn-IN': {
    Cereals: 'ಧಾನ್ಯಗಳು',
    Pulses: 'ಬೇಳೆಗಳು',
    Oilseeds: 'ಎಣ್ಣೆ ಬೀಜಗಳು',
    'Cash Crops': 'ನಗದು ಬೆಳೆಗಳು',
    Vegetables: 'ತರಕಾರಿಗಳು',
    Fruits: 'ಹಣ್ಣುಗಳು',
    'Spices and Plantation': 'ಮಸಾಲೆ ಮತ್ತು ತೋಟ ಬೆಳೆಗಳು',
    'Rice / Paddy': 'ಭತ್ತ',
    Wheat: 'ಗೋಧಿ',
    Maize: 'ಮೆಕ್ಕೆಜೋಳ',
  },
  'ml-IN': {
    Cereals: 'ധാന്യങ്ങൾ',
    Pulses: 'പയർവർഗങ്ങൾ',
    Oilseeds: 'എണ്ണവിത്തുകൾ',
    'Cash Crops': 'നഗദുപയിരുകൾ',
    Vegetables: 'പച്ചക്കറികൾ',
    Fruits: 'പഴങ്ങൾ',
    'Spices and Plantation': 'മസാലയും തോട്ടവിളകളും',
    'Rice / Paddy': 'നെല്ല്',
    Wheat: 'ഗോതമ്പ്',
    Maize: 'ചോളം',
  },
  'pa-IN': {
    Cereals: 'ਅਨਾਜ',
    Pulses: 'ਦਾਲਾਂ',
    Oilseeds: 'ਤੇਲ ਬੀਜ',
    'Cash Crops': 'ਨਕਦੀ ਫਸਲਾਂ',
    Vegetables: 'ਸਬਜ਼ੀਆਂ',
    Fruits: 'ਫਲ',
    'Spices and Plantation': 'ਮਸਾਲੇ ਅਤੇ ਬਾਗਬਾਨੀ',
    'Rice / Paddy': 'ਝੋਨਾ',
    Wheat: 'ਕਣਕ',
    Maize: 'ਮੱਕੀ',
  },
  'ur-IN': {
    Cereals: 'اناج',
    Pulses: 'دالیں',
    Oilseeds: 'تیل دار بیج',
    'Cash Crops': 'نقدی فصلیں',
    Vegetables: 'سبزیاں',
    Fruits: 'پھل',
    'Spices and Plantation': 'مصالحے اور باغانی فصلیں',
    'Rice / Paddy': 'دھان',
    Wheat: 'گندم',
    Maize: 'مکئی',
  },
  'or-IN': {
    Cereals: 'ଶସ୍ୟ',
    Pulses: 'ଡାଲି',
    Oilseeds: 'ତେଲବୀଜ',
    'Cash Crops': 'ନଗଦ ଫସଲ',
    Vegetables: 'ସବ୍ଜି',
    Fruits: 'ଫଳ',
    'Spices and Plantation': 'ମସଲା ଏବଂ ବଗିଚା ଫସଲ',
    'Rice / Paddy': 'ଧାନ',
    Wheat: 'ଗହମ',
    Maize: 'ମକା',
  },
  'as-IN': {
    Cereals: 'শস্য',
    Pulses: 'দাইল',
    Oilseeds: 'তেলবীজ',
    'Cash Crops': 'নগদ শস্য',
    Vegetables: 'শাক-পাচলি',
    Fruits: 'ফল',
    'Spices and Plantation': 'মছলা আৰু বাগিচা শস্য',
    'Rice / Paddy': 'ধান',
    Wheat: 'গম',
    Maize: 'মাকৈ',
  },
};

const getOptionLabel = (value: string, language: string) => {
  if (language === 'en-IN') return value;
  const selectedLanguageLabel = optionTranslations[language]?.[value];
  const hindiLabel = optionTranslations['hi-IN']?.[value];

  if (selectedLanguageLabel) return selectedLanguageLabel;
  if (hindiLabel) return `${hindiLabel} / ${value}`;

  return value;
};

// Agriculture page flow:
// 1. Farmer selects crop, crop stage, field condition, and irrigation source.
// 2. getRiskProfile decides the risk level.
// 3. getRecommendations builds simple advisory points.
// 4. UI renders summary cards and action guidance.

const getRiskProfile = (stage: string, condition: string) => {
  if (condition.includes('Waterlogging') || stage.includes('Flowering')) {
    return {
      level: 'High',
      color: 'text-red-600',
      badge: 'destructive' as const,
      headline: 'Protect crop from stress in the next 24 hours',
    };
  }

  if (condition !== 'Normal' || stage.includes('Sowing') || stage.includes('Harvesting')) {
    return {
      level: 'Moderate',
      color: 'text-yellow-600',
      badge: 'secondary' as const,
      headline: 'Monitor field condition before the next operation',
    };
  }

  return {
    level: 'Low',
    color: 'text-green-600',
    badge: 'secondary' as const,
    headline: 'Crop condition looks manageable',
  };
};

export default function AgricultureIntelligence() {
  const firstCrop = cropGroups[0].crops[0];
  const [crop, setCrop] = useState(firstCrop);
  const [stage, setStage] = useState(cropStages[0]);
  const [condition, setCondition] = useState(farmConditions[0]);
  const [irrigation, setIrrigation] = useState(irrigationTypes[0]);
  const [language, setLanguage] = useState(regionalLanguages[0].value);
  const [analyzed, setAnalyzed] = useState(false);
  const navigate = useNavigate();
  const { location, locating, refreshLocation } = useUserLocation();
  const copy = regionalCopy[language] || regionalCopy['en-IN'];
  const cropLabel = getOptionLabel(crop, language);
  const stageLabel = getOptionLabel(stage, language);
  const conditionLabel = getOptionLabel(condition, language);
  const irrigationLabel = getOptionLabel(irrigation, language);

  const risk = useMemo(() => getRiskProfile(stage, condition), [stage, condition]);
  const riskLevelText = risk.level === 'High' ? copy.high : risk.level === 'Moderate' ? copy.moderate : copy.low;
  const riskHeadline = risk.level === 'High' ? copy.headlineHigh : risk.level === 'Moderate' ? copy.headlineModerate : copy.headlineLow;
  const recommendations = useMemo(() => copy.tips(cropLabel, stageLabel, condition, irrigation), [copy, cropLabel, stageLabel, condition, irrigation]);

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    setAnalyzed(true);
  };

  const askWeatherGptAboutCrop = () => {
    const prompt = [
      copy.promptIntro,
      `Crop: ${cropLabel} (${crop})`,
      `Crop stage: ${stageLabel} (${stage})`,
      `Field condition: ${conditionLabel} (${condition})`,
      `Irrigation source: ${irrigationLabel} (${irrigation})`,
      `Risk level: ${riskLevelText}`,
      `Risk headline: ${riskHeadline}`,
      `Location: ${location.name}`,
      `Current recommendations: ${recommendations.join(' ')}`,
      copy.promptAction,
    ].join('\n');

    navigate('/chat', {
      state: {
        agriculturePrompt: prompt,
        agricultureLanguage: language,
        agricultureProfile: {
          crop: cropLabel,
          stage: stageLabel,
          condition: conditionLabel,
          irrigation: irrigationLabel,
          riskLevel: riskLevelText,
          location: location.name,
        },
      },
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-green-600 dark:text-green-500 flex items-center gap-2">
            <Sprout className="h-8 w-8" /> {copy.title}
          </h1>
          <p className="text-muted-foreground mt-2">{copy.subtitle}</p>
        </div>
        <Button variant="outline" onClick={refreshLocation} className="md:self-center">
          <MapPin className="mr-2 h-4 w-4" />
          {locating ? copy.detecting : location.name}
        </Button>
      </div>
      {location.source === 'fallback' && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
          {copy.fallbackLocation}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 shadow-sm">
          <CardHeader>
            <CardTitle>{copy.cropProfile}</CardTitle>
            <CardDescription>{copy.chooseOptions}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAnalyze} className="space-y-4">
              <div className="space-y-2 text-left">
                <Label htmlFor="language">{copy.advisoryLanguage}</Label>
                <select id="language" value={language} onChange={e => setLanguage(e.target.value)} className={selectClasses}>
                  {regionalLanguages.map(item => (
                    <option key={item.value} value={item.value}>{item.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 text-left">
                <Label htmlFor="crop">{copy.cropType}</Label>
                <select id="crop" value={crop} onChange={e => setCrop(e.target.value)} className={selectClasses}>
                  {cropGroups.map(group => (
                    <optgroup key={group.group} label={getOptionLabel(group.group, language)}>
                      {group.crops.map(item => (
                        <option key={item} value={item}>{getOptionLabel(item, language)}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div className="space-y-2 text-left">
                <Label htmlFor="stage">{copy.cropStage}</Label>
                <select id="stage" value={stage} onChange={e => setStage(e.target.value)} className={selectClasses}>
                  {cropStages.map(item => (
                    <option key={item} value={item}>{getOptionLabel(item, language)}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 text-left">
                <Label htmlFor="condition">{copy.fieldCondition}</Label>
                <select id="condition" value={condition} onChange={e => setCondition(e.target.value)} className={selectClasses}>
                  {farmConditions.map(item => (
                    <option key={item} value={item}>{getOptionLabel(item, language)}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 text-left">
                <Label htmlFor="irrigation">{copy.irrigationSource}</Label>
                <select id="irrigation" value={irrigation} onChange={e => setIrrigation(e.target.value)} className={selectClasses}>
                  {irrigationTypes.map(item => (
                    <option key={item} value={item}>{getOptionLabel(item, language)}</option>
                  ))}
                </select>
              </div>

              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                {copy.analyzeRisk}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-5 flex items-center gap-3">
                <Wheat className="h-8 w-8 text-amber-500" />
                <div>
                  <p className="text-sm text-muted-foreground">{copy.crop}</p>
                  <p className="font-semibold">{cropLabel}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5 flex items-center gap-3">
                <Leaf className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">{copy.stage}</p>
                  <p className="font-semibold">{stageLabel}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5 flex items-center gap-3">
                <ShieldAlert className={`h-8 w-8 ${risk.color}`} />
                <div>
                  <p className="text-sm text-muted-foreground">{copy.risk}</p>
                  <p className={`font-semibold ${risk.color}`}>{riskLevelText}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {analyzed ? (
            <>
              <Card className="border-l-4 border-l-green-500 shadow-md">
                <CardHeader>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <CloudRain className="h-5 w-5 text-blue-500" /> {copy.advisoryFor} {location.name}
                    </CardTitle>
                    <Badge variant={risk.badge}>{riskLevelText}</Badge>
                  </div>
                  <CardDescription>{riskHeadline}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recommendations.map(tip => (
                    <div key={tip} className="flex gap-3 rounded-lg border bg-background p-3">
                      <Sun className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                      <p className="text-sm leading-relaxed">{tip}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Droplets className="h-5 w-5 text-cyan-500" /> {copy.irrigationDecision}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-base">
                    {copy.irrigationText(cropLabel, stageLabel)}
                  </p>
                  <div className="mt-4 p-3 bg-muted rounded-md text-sm text-muted-foreground border">
                    {copy.disclaimer}
                  </div>
                </CardContent>
              </Card>

              <Button variant="outline" className="w-full border-green-200 text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 py-6" onClick={askWeatherGptAboutCrop}>
                {copy.ask} {cropLabel} <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </>
          ) : (
            <div className="min-h-[330px] flex items-center justify-center border-2 border-dashed rounded-xl p-8 text-center text-muted-foreground bg-muted/20">
              {copy.empty}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
