import React from 'react';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';
import { CloudRain, Wind, AlertTriangle, Activity } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center">
      <header className="w-full max-w-6xl p-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <CloudRain className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold tracking-tighter">WeatherGPT</span>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/auth')}>Login</Button>
          <Button onClick={() => navigate('/dashboard')}>Open Dashboard</Button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center text-center px-4 mt-20 max-w-5xl">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
          AI-Powered Conversational<br/> Weather & Disaster Intelligence
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl">
          Turning complex meteorological data into simple, personalized and actionable intelligence.
        </p>
        <p className="text-lg font-medium text-foreground mb-10 max-w-3xl">
          WeatherGPT doesn't just tell you the weather. It helps you understand the risk and decide what to do next.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Button size="lg" className="h-14 px-8 text-lg w-full sm:w-auto" onClick={() => navigate('/chat')}>
            Ask WeatherGPT
          </Button>
          <Button size="lg" variant="outline" className="h-14 px-8 text-lg w-full sm:w-auto" onClick={() => navigate('/dashboard')}>
            View Live Weather
          </Button>
        </div>
        
        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8 text-left w-full mb-32">
          <div className="p-8 rounded-3xl bg-card border shadow-sm hover:shadow-md transition-shadow">
            <Activity className="h-12 w-12 text-blue-500 mb-6" />
            <h3 className="text-xl font-bold mb-3">Real-Time Analytics</h3>
            <p className="text-muted-foreground">Hyper-local weather forecasting with advanced historical climate intelligence.</p>
          </div>
          <div className="p-8 rounded-3xl bg-card border shadow-sm hover:shadow-md transition-shadow">
            <AlertTriangle className="h-12 w-12 text-red-500 mb-6" />
            <h3 className="text-xl font-bold mb-3">Early Warning System</h3>
            <p className="text-muted-foreground">Proactive disaster alert center tracking cyclones, floods, and extreme events.</p>
          </div>
          <div className="p-8 rounded-3xl bg-card border shadow-sm hover:shadow-md transition-shadow">
            <Wind className="h-12 w-12 text-indigo-500 mb-6" />
            <h3 className="text-xl font-bold mb-3">Conversational AI</h3>
            <p className="text-muted-foreground">Ask about weather and agriculture advisories naturally in multiple languages.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
