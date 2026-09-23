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

const selectClasses = 'h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring';

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

const getRecommendations = (crop: string, stage: string, condition: string, irrigation: string) => {
  const tips = [
    `For ${crop}, keep the ${stage.toLowerCase()} stage protected from sudden rain, heat, and strong wind changes.`,
    irrigation === 'Rainfed'
      ? 'Use field bunds and mulching to conserve soil moisture during dry spells.'
      : `Schedule ${irrigation.toLowerCase()} only after checking soil moisture near the root zone.`,
    'Inspect leaves, stem, and root zone every morning for pest or disease signs.',
  ];

  if (condition.includes('Waterlogging')) {
    tips.unshift('Open drainage channels immediately and avoid extra irrigation until standing water clears.');
  } else if (condition.includes('Dry Soil')) {
    tips.unshift('Prioritize light irrigation or moisture conservation before applying fertilizer.');
  } else if (condition.includes('Pest')) {
    tips.unshift('Check pest density before spraying and prefer local agriculture officer guidance for dose selection.');
  } else if (condition.includes('Disease')) {
    tips.unshift('Remove badly infected plant parts and avoid overhead irrigation to reduce disease spread.');
  } else if (condition.includes('Heat')) {
    tips.unshift('Irrigate during early morning or evening and avoid fertilizer spray in peak afternoon heat.');
  } else if (condition.includes('Cold')) {
    tips.unshift('Use light irrigation or smoke cover only where locally recommended to reduce frost injury.');
  }

  if (stage.includes('Flowering')) {
    tips.push('Avoid pesticide spray during active pollination hours unless absolutely necessary.');
  }

  if (stage.includes('Harvesting')) {
    tips.push('Harvest only after dew dries and keep produce covered from unexpected rain.');
  }

  return tips;
};

export default function AgricultureIntelligence() {
  const firstCrop = cropGroups[0].crops[0];
  const [crop, setCrop] = useState(firstCrop);
  const [stage, setStage] = useState(cropStages[0]);
  const [condition, setCondition] = useState(farmConditions[0]);
  const [irrigation, setIrrigation] = useState(irrigationTypes[0]);
  const [analyzed, setAnalyzed] = useState(false);
  const navigate = useNavigate();
  const { location, locating, refreshLocation } = useUserLocation();

  const risk = useMemo(() => getRiskProfile(stage, condition), [stage, condition]);
  const recommendations = useMemo(() => getRecommendations(crop, stage, condition, irrigation), [crop, stage, condition, irrigation]);

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    setAnalyzed(true);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-green-600 dark:text-green-500 flex items-center gap-2">
            <Sprout className="h-8 w-8" /> Smart Agriculture Advisory
          </h1>
          <p className="text-muted-foreground mt-2">Select crop and stage to get weather-aware farming guidance.</p>
        </div>
        <Button variant="outline" onClick={refreshLocation} className="md:self-center">
          <MapPin className="mr-2 h-4 w-4" />
          {locating ? 'Detecting...' : location.name}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 shadow-sm">
          <CardHeader>
            <CardTitle>Crop Profile</CardTitle>
            <CardDescription>Choose from ready options</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAnalyze} className="space-y-4">
              <div className="space-y-2 text-left">
                <Label htmlFor="crop">Crop Type</Label>
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
                <Label htmlFor="stage">Crop Stage</Label>
                <select id="stage" value={stage} onChange={e => setStage(e.target.value)} className={selectClasses}>
                  {cropStages.map(item => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 text-left">
                <Label htmlFor="condition">Field Condition</Label>
                <select id="condition" value={condition} onChange={e => setCondition(e.target.value)} className={selectClasses}>
                  {farmConditions.map(item => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 text-left">
                <Label htmlFor="irrigation">Irrigation Source</Label>
                <select id="irrigation" value={irrigation} onChange={e => setIrrigation(e.target.value)} className={selectClasses}>
                  {irrigationTypes.map(item => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>

              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                Analyze Risk
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
                  <p className="text-sm text-muted-foreground">Crop</p>
                  <p className="font-semibold">{crop}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5 flex items-center gap-3">
                <Leaf className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Stage</p>
                  <p className="font-semibold">{stage}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5 flex items-center gap-3">
                <ShieldAlert className={`h-8 w-8 ${risk.color}`} />
                <div>
                  <p className="text-sm text-muted-foreground">Risk</p>
                  <p className={`font-semibold ${risk.color}`}>{risk.level}</p>
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
                      <CloudRain className="h-5 w-5 text-blue-500" /> Advisory for {location.name}
                    </CardTitle>
                    <Badge variant={risk.badge}>{risk.level} Risk</Badge>
                  </div>
                  <CardDescription>{risk.headline}</CardDescription>
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
                    <Droplets className="h-5 w-5 text-cyan-500" /> Irrigation Decision
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-base">
                    For {crop} at {stage.toLowerCase()} stage, use short and controlled irrigation if soil is dry. If rain clouds are active or the field is wet, postpone irrigation and keep drainage ready.
                  </p>
                  <div className="mt-4 p-3 bg-muted rounded-md text-sm text-muted-foreground border">
                    AI-generated advisory - confirm critical spray, fertilizer, and disease treatment with local agriculture experts.
                  </div>
                </CardContent>
              </Card>

              <Button variant="outline" className="w-full border-green-200 text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 py-6" onClick={() => navigate('/chat')}>
                Ask WeatherGPT about {crop} <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </>
          ) : (
            <div className="min-h-[330px] flex items-center justify-center border-2 border-dashed rounded-xl p-8 text-center text-muted-foreground bg-muted/20">
              Select crop, stage, field condition, and irrigation source, then analyze risk.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
