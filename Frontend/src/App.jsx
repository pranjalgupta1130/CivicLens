import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { useTheme } from './context/ThemeContext';

// Pages
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import BudgetExplorer from './pages/BudgetExplorer';
import AIAssistant from './pages/AIAssistant';
import AIAlerts from './pages/AIAlerts';
import RTIGenerator from './pages/RTIGenerator';
import AdminUpload from './pages/AdminUpload';

export default function App() {
  const { isDark } = useTheme();

  return (
<<<<<<< HEAD
    <LanguageProvider>
      <div className="min-h-screen flex flex-col bg-[#0b0f19] text-slate-100 selection:bg-cyan-500 selection:text-white">
        {/* Top Navbar */}
        <Navbar />

=======
    <div className={`min-h-screen flex flex-col transition-colors duration-200 ${
      isDark
        ? 'bg-[#0b0f19] text-slate-100 selection:bg-cyan-500 selection:text-white'
        : 'bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white'
    }`}>
      {/* Top Navbar Only */}
      <Navbar />
>>>>>>> 9f930c6 (Frontend Updates and languages Addition)

      {/* Main Body Content Shell */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/budget-explorer" element={<BudgetExplorer />} />
          <Route path="/ai-assistant" element={<AIAssistant />} />
          <Route path="/ai-alerts" element={<AIAlerts />} />
          <Route path="/admin-upload" element={<AdminUpload />} />
        </Routes>
      </main>

<<<<<<< HEAD
        {/* Dynamic Route Content */}
        <main className="flex-1 min-w-0">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/budget-explorer" element={<BudgetExplorer />} />
            <Route path="/ai-assistant" element={<AIAssistant />} />
            <Route path="/ai-alerts" element={<AIAlerts />} />
            <Route path="/rti" element={<RTIGenerator />} />
            <Route path="/admin-upload" element={<AdminUpload />} />
          </Routes>
        </main>
      </div>


      {/* Footer */}
=======
      {/* Trustworthy Government Portal Footer */}
>>>>>>> 9f930c6 (Frontend Updates and languages Addition)
      <Footer />
    </div>
    </LanguageProvider>
  );
}

