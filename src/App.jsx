import React, { useState } from 'react';
import { AppProvider } from './context/AppState';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Calendar from './pages/Calendar';
import QuickAttendance from './pages/QuickAttendance';
import Reports from './pages/Reports';
import Analytics from './pages/Analytics';
import Shifts from './pages/Shifts';
import LeaveManager from './pages/LeaveManager';
import Notes from './pages/Notes';
import BackupRestore from './pages/BackupRestore';
import Settings from './pages/Settings';
import About from './pages/About';

export default function App() {
  const [activeScreen, setActiveScreen] = useState('dashboard');

  return (
    <AppProvider>
      <Layout activeScreen={activeScreen} setActiveScreen={setActiveScreen}>
        {activeScreen === 'dashboard' && <Dashboard />}
        {activeScreen === 'calendar' && <Calendar />}
        {activeScreen === 'quick' && <QuickAttendance />}
        {activeScreen === 'reports' && <Reports />}
        {activeScreen === 'analytics' && <Analytics />}
        {activeScreen === 'shifts' && <Shifts />}
        {activeScreen === 'leaves' && <LeaveManager />}
        {activeScreen === 'notes' && <Notes />}
        {activeScreen === 'backup' && <BackupRestore />}
        {activeScreen === 'settings' && <Settings />}
        {activeScreen === 'about' && <About />}
      </Layout>
    </AppProvider>
  );
}
