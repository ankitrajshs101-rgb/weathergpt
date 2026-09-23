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
  'bn-IN': { ...agricultureCopy['hi-IN'], title: 'স্মার্ট কৃষি পরামর্শ', analyzeRisk: 'ঝুঁকি বিশ্লেষণ করুন' },
  'ta-IN': { ...agricultureCopy['hi-IN'], title: 'ஸ்மார்ட் வேளாண் ஆலோசனை', analyzeRisk: 'ஆபத்தை பகுப்பாய்வு செய்யவும்' },
  'te-IN': { ...agricultureCopy['hi-IN'], title: 'స్మార్ట్ వ్యవసాయ సలహా', analyzeRisk: 'రిస్క్ విశ్లేషించండి' },
  'mr-IN': { ...agricultureCopy['hi-IN'], title: 'स्मार्ट कृषी सल्ला', analyzeRisk: 'जोखीम विश्लेषण करा' },
  'gu-IN': { ...agricultureCopy['hi-IN'], title: 'સ્માર્ટ કૃષિ સલાહ', analyzeRisk: 'જોખમ વિશ્લેષણ કરો' },
  'kn-IN': { ...agricultureCopy['hi-IN'], title: 'ಸ್ಮಾರ್ಟ್ ಕೃಷಿ ಸಲಹೆ', analyzeRisk: 'ಅಪಾಯ ವಿಶ್ಲೇಷಿಸಿ' },
  'ml-IN': { ...agricultureCopy['hi-IN'], title: 'സ്മാർട്ട് കാർഷിക ഉപദേശം', analyzeRisk: 'റിസ്ക് വിശകലനം ചെയ്യുക' },
  'pa-IN': { ...agricultureCopy['hi-IN'], title: 'ਸਮਾਰਟ ਖੇਤੀ ਸਲਾਹ', analyzeRisk: 'ਖਤਰੇ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ ਕਰੋ' },
  'ur-IN': { ...agricultureCopy['hi-IN'], title: 'اسمارٹ زرعی مشورہ', analyzeRisk: 'خطرے کا تجزیہ کریں' },
  'or-IN': { ...agricultureCopy['hi-IN'], title: 'ସ୍ମାର୍ଟ କୃଷି ପରାମର୍ଶ', analyzeRisk: 'ଜୋଖିମ ବିଶ୍ଳେଷଣ କରନ୍ତୁ' },
  'as-IN': { ...agricultureCopy['hi-IN'], title: 'স্মাৰ্ট কৃষি পৰামৰ্শ', analyzeRisk: 'ঝুঁকি বিশ্লেষণ কৰক' },
  'kok-IN': { ...agricultureCopy['hi-IN'], title: 'स्मार्ट शेती सल्लो', analyzeRisk: 'धोका तपासा' },
  'mai-IN': { ...agricultureCopy['hi-IN'], title: 'स्मार्ट कृषि सलाह', analyzeRisk: 'जोखिम विश्लेषण करू' },
  'ne-IN': { ...agricultureCopy['hi-IN'], title: 'स्मार्ट कृषि सल्लाह', analyzeRisk: 'जोखिम विश्लेषण गर्नुहोस्' },
  'sa-IN': { ...agricultureCopy['hi-IN'], title: 'स्मार्ट कृषिः परामर्शः', analyzeRisk: 'जोखिमं विश्लेषयतु' },
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

  const risk = useMemo(() => getRiskProfile(stage, condition), [stage, condition]);
  const riskLevelText = risk.level === 'High' ? copy.high : risk.level === 'Moderate' ? copy.moderate : copy.low;
  const riskHeadline = risk.level === 'High' ? copy.headlineHigh : risk.level === 'Moderate' ? copy.headlineModerate : copy.headlineLow;
  const recommendations = useMemo(() => copy.tips(crop, stage, condition, irrigation), [copy, crop, stage, condition, irrigation]);

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    setAnalyzed(true);
  };

  const askWeatherGptAboutCrop = () => {
    const prompt = [
      copy.promptIntro,
      `Crop: ${crop}`,
      `Crop stage: ${stage}`,
      `Field condition: ${condition}`,
      `Irrigation source: ${irrigation}`,
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
          crop,
          stage,
          condition,
          irrigation,
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
                    <optgroup key={group.group} label={group.group}>
                      {group.crops.map(item => (
                        <option key={item} value={item}>{item}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div className="space-y-2 text-left">
                <Label htmlFor="stage">{copy.cropStage}</Label>
                <select id="stage" value={stage} onChange={e => setStage(e.target.value)} className={selectClasses}>
                  {cropStages.map(item => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 text-left">
                <Label htmlFor="condition">{copy.fieldCondition}</Label>
                <select id="condition" value={condition} onChange={e => setCondition(e.target.value)} className={selectClasses}>
                  {farmConditions.map(item => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 text-left">
                <Label htmlFor="irrigation">{copy.irrigationSource}</Label>
                <select id="irrigation" value={irrigation} onChange={e => setIrrigation(e.target.value)} className={selectClasses}>
                  {irrigationTypes.map(item => (
                    <option key={item} value={item}>{item}</option>
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
                  <p className="font-semibold">{crop}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5 flex items-center gap-3">
                <Leaf className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">{copy.stage}</p>
                  <p className="font-semibold">{stage}</p>
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
                    {copy.irrigationText(crop, stage)}
                  </p>
                  <div className="mt-4 p-3 bg-muted rounded-md text-sm text-muted-foreground border">
                    {copy.disclaimer}
                  </div>
                </CardContent>
              </Card>

              <Button variant="outline" className="w-full border-green-200 text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 py-6" onClick={askWeatherGptAboutCrop}>
                {copy.ask} {crop} <ArrowRight className="ml-2 h-5 w-5" />
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
