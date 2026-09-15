import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart as BarChartIcon, BrainCircuit } from 'lucide-react';
import { Button } from '../components/ui/button';

const mockClimateData = [
  { year: '2019', temp: 28.5, rainfall: 1200 },
  { year: '2020', temp: 28.7, rainfall: 1350 },
  { year: '2021', temp: 29.1, rainfall: 1100 },
  { year: '2022', temp: 29.4, rainfall: 950 },
  { year: '2023', temp: 29.8, rainfall: 1050 },
  { year: '2024', temp: 30.2, rainfall: 800 },
];

export default function ClimateAnalytics() {
  const [aiExplained, setAiExplained] = useState(false);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <BarChartIcon className="h-8 w-8 text-indigo-500" /> Climate Intelligence
          </h1>
          <p className="text-muted-foreground mt-2">Analyze historical weather trends and extreme events over time.</p>
        </div>
        <Button onClick={() => setAiExplained(true)} className="bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto shrink-0">
          <BrainCircuit className="mr-2 h-4 w-4" /> Explain Trend with AI
        </Button>
      </div>

      {aiExplained && (
        <Card className="border-indigo-200 bg-indigo-50 dark:bg-indigo-950/20 shadow-md transition-all">
          <CardHeader>
            <CardTitle className="text-indigo-700 dark:text-indigo-400 flex items-center gap-2">
              <BrainCircuit className="h-5 w-5" /> AI Climate Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground leading-relaxed">
              Over the past 5 years, the data shows a clear <strong>warming trend</strong> with average temperatures rising from 28.5°C to 30.2°C. 
              Concurrently, average annual rainfall has decreased by approximately 33%, from 1200mm to 800mm, indicating a shift towards drier and hotter conditions in this region. 
              This increases the long-term risk of drought and heatwaves.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Average Temperature Trend (5 Years)</CardTitle>
            <CardDescription>Historical mean temperature in °C</CardDescription>
          </CardHeader>
          <CardContent className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockClimateData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="year" />
                <YAxis domain={['auto', 'auto']} />
                <Tooltip />
                <Line type="monotone" dataKey="temp" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Annual Rainfall Trend (5 Years)</CardTitle>
            <CardDescription>Total precipitation in mm</CardDescription>
          </CardHeader>
          <CardContent className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockClimateData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="rainfall" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
