import React, { useMemo } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, Map, AlertTriangle, Sprout, BarChart, LogOut, CloudRain } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';
import { useUserLocation } from '../../contexts/LocationContext';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { location: userLocation, locating, refreshLocation } = useUserLocation();
  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  }, []);
  const initials = (currentUser.name || currentUser.email || 'User')
    .split(/[ @._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part: string) => part[0]?.toUpperCase())
    .join('') || 'U';

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'WeatherGPT AI', path: '/chat', icon: MessageSquare },
    { name: 'Live Map', path: '/map', icon: Map },
    { name: 'Alert Center', path: '/alerts', icon: AlertTriangle },
    { name: 'Agriculture', path: '/agriculture', icon: Sprout },
    { name: 'Climate Analytics', path: '/climate', icon: BarChart },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card flex flex-col">
        <div className="h-16 flex items-center px-6 border-b cursor-pointer" onClick={() => navigate('/')}>
          <CloudRain className="h-6 w-6 text-primary mr-2" />
          <span className="font-bold text-lg">WeatherGPT</span>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t space-y-2">
          <Button variant="ghost" className="w-full justify-start text-muted-foreground" onClick={() => navigate('/')}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 border-b bg-background flex items-center justify-between px-6 shrink-0">
          <div className="font-semibold text-lg capitalize">{location.pathname.split('/')[1] || 'Dashboard'}</div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={refreshLocation}
              className="text-sm font-medium px-3 py-1 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
              title="Refresh location"
            >
              {locating ? 'Detecting location...' : `Location: ${userLocation.name}`}
            </button>
            <div
              className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm"
              title={currentUser.name || currentUser.email || 'User'}
            >
              {initials}
            </div>
          </div>
        </header>
        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-muted/20">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
