import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Sprout, CloudRain, Droplets, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AgricultureIntelligence() {
  const [crop, setCrop] = useState('');
  const [stage, setStage] = useState('');
  const [analyzed, setAnalyzed] = useState(false);
  const navigate = useNavigate();

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    setAnalyzed(true);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-green-600 dark:text-green-500 flex items-center gap-2">
          <Sprout className="h-8 w-8" /> Smart Agriculture Advisory
        </h1>
        <p className="text-muted-foreground mt-2">Get AI-generated crop risk assessments based on hyper-local weather data.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 shadow-sm">
          <CardHeader>
            <CardTitle>Crop Profile</CardTitle>
            <CardDescription>Enter your crop details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAnalyze} className="space-y-4">
              <div className="space-y-2 text-left">
                <Label htmlFor="crop">Crop Type</Label>
                <Input id="crop" placeholder="e.g. Wheat, Rice, Maize" value={crop} onChange={e => setCrop(e.target.value)} required />
              </div>
              <div className="space-y-2 text-left">
                <Label htmlFor="stage">Crop Stage</Label>
                <Input id="stage" placeholder="e.g. Sowing, Flowering" value={stage} onChange={e => setStage(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">Analyze Risk</Button>
            </form>
          </CardContent>
        </Card>

        {analyzed ? (
          <div className="md:col-span-2 space-y-4">
            <Card className="border-l-4 border-l-yellow-500 shadow-md">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2"><Droplets className="h-5 w-5 text-yellow-500" /> Irrigation Advisory</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg">Rain is expected in the next 24 hours (80% probability). Consider postponing irrigation to prevent waterlogging.</p>
                <div className="mt-4 p-3 bg-muted rounded-md text-sm text-muted-foreground border">
                  <strong>AI-generated advisory</strong> — not a substitute for official agricultural guidance.
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-xl">Weather Impact on {crop || 'Crop'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg bg-background">
                  <div className="flex items-center gap-4">
                    <CloudRain className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="font-medium text-lg">Heavy Rainfall</p>
                      <p className="text-sm text-muted-foreground">Expected tomorrow</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-500 text-lg">High Risk</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button variant="outline" className="w-full border-green-200 text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 py-6" onClick={() => navigate('/chat')}>
              Ask WeatherGPT about my crop <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        ) : (
          <div className="md:col-span-2 flex items-center justify-center border-2 border-dashed rounded-xl p-12 text-muted-foreground bg-muted/20">
            Enter your crop details and click analyze to see AI-generated weather advisory.
          </div>
        )}
      </div>
    </div>
  );
}
