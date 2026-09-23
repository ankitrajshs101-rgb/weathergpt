import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Auth from './pages/Auth';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import AiChat from './pages/AiChat';
import LiveMap from './pages/LiveMap';
import AlertCenter from './pages/AlertCenter';
import AgricultureIntelligence from './pages/AgricultureIntelligence';
import ClimateAnalytics from './pages/ClimateAnalytics';
import { LocationProvider } from './contexts/LocationContext';

// App.tsx is the frontend route map.
// Add new pages here, then add sidebar links in components/layout/Layout.tsx.
function App() {
  return (
    <LocationProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<Auth />} />
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/chat" element={<AiChat />} />
            <Route path="/map" element={<LiveMap />} />
            <Route path="/alerts" element={<AlertCenter />} />
            <Route path="/agriculture" element={<AgricultureIntelligence />} />
            <Route path="/climate" element={<ClimateAnalytics />} />
          </Route>
        </Routes>
      </Router>
    </LocationProvider>
  );
}

export default App;
