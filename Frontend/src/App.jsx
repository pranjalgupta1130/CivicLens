import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import BudgetExplorer from './pages/BudgetExplorer';
import AIAssistant from './pages/AIAssistant';
import AIAlerts from './pages/AIAlerts';
import RTIGenerator from './pages/RTIGenerator';
import AdminUpload from './pages/AdminUpload';

export default function App() {
  return (
    <LanguageProvider>
      <div className="min-h-screen flex flex-col bg-[#0b0f19] text-slate-100 selection:bg-cyan-500 selection:text-white">
        {/* Top Navbar */}
        <Navbar />


      {/* Main Body Shell */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex gap-6 px-4 sm:px-6 lg:px-8 pt-6">
        {/* Desktop Sidebar */}
        <Sidebar />

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
      <Footer />
    </div>
    </LanguageProvider>
  );
}

