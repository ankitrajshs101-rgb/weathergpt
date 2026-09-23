import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { getMockAlerts } from '../services/alertService';
import { AlertTriangle, Clock, ShieldAlert } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { useUserLocation } from '../contexts/LocationContext';

export default function AlertCenter() {
  const { location } = useUserLocation();
  const alerts = getMockAlerts(location.name);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-red-600 dark:text-red-400 flex items-center gap-2">
          <ShieldAlert className="h-8 w-8" /> Alert Center
        </h1>
        <p className="text-muted-foreground mt-2">Active warnings and early detection systems for extreme weather events.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/50">
          <CardContent className="p-6 flex items-center gap-4">
            <AlertTriangle className="h-10 w-10 text-red-500" />
            <div>
              <p className="text-sm font-medium text-red-600/80 dark:text-red-400">Severe Warnings</p>
              <h4 className="text-3xl font-bold text-red-600 dark:text-red-400">
                {alerts.filter(a => a.severity === 'Warning' || a.severity === 'Severe').length}
              </h4>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {alerts.map(alert => (
          <Card key={alert.id} className="border-l-4 border-l-red-500 hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-6 w-6 text-red-500" />
                  <CardTitle className="text-xl">{alert.hazard}</CardTitle>
                </div>
                <Badge variant={alert.severity === 'Warning' ? 'destructive' : 'secondary'} className="uppercase">
                  {alert.severity}
                </Badge>
              </div>
              <CardDescription className="flex items-center gap-1 mt-1 text-red-600/70 dark:text-red-400 font-medium">
                📍 {alert.location}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-foreground">{alert.description}</p>
              
              <div className="bg-muted/50 p-4 rounded-lg space-y-2 mb-4 text-sm">
                <div><strong className="text-foreground">Risk:</strong> {alert.risk}</div>
                <div><strong className="text-foreground">Action Required:</strong> {alert.recommendedAction}</div>
              </div>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-4">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" /> Valid until {new Date(alert.endTime).toLocaleString()}
                </div>
                <div className="font-medium px-2 py-1 bg-secondary rounded">
                  Source: {alert.source}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
