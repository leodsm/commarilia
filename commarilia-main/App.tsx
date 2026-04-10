import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Views
import PublicApp from './components/PublicApp';
import Login from './components/auth/Login';
import DashboardLayout from './components/dashboard/DashboardLayout';
import Overview from './components/dashboard/Overview';
import CardBuilder from './components/dashboard/CardBuilder/CardBuilder';
import StoriesCMS from './components/dashboard/stories/StoriesCMS';
import StoryEditor from './components/dashboard/stories/StoryEditor';
import Billing from './components/dashboard/settings/Billing';

const App: React.FC = () => {
  return (
    <Routes>
      {/* SaaS Dashboard Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<Overview />} />
        <Route path="card-builder" element={<CardBuilder />} />
        <Route path="stories" element={<StoriesCMS />} />
        <Route path="stories/:id" element={<StoryEditor />} />
        <Route path="settings" element={<Billing />} />
      </Route>
      
      {/* Public Player at root */}
      <Route path="/*" element={<PublicApp />} />
    </Routes>
  );
};

export default App;