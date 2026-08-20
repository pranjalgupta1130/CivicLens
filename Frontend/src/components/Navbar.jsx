import React, { useState } from 'react';
<<<<<<< HEAD
import { Link, useNavigate } from 'react-router-dom';
import { Eye, Bell, Search, Sparkles, Menu, X, ShieldAlert, CheckCircle2, Globe } from 'lucide-react';
import { aiAlertsData } from '../data/mockData';
import { useLanguage } from '../context/LanguageContext';
=======
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { 
  Eye, 
  Bell, 
  Search, 
  Menu, 
  X, 
  ShieldAlert, 
  Mic, 
  Sun, 
  Moon, 
  Globe,
  Lock
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { aiAlertsData } from '../data/mockData';
import VoiceInputModal from './VoiceInputModal';
>>>>>>> 9f930c6 (Frontend Updates and languages Addition)

export default function Navbar() {
  const { lang, setLang, t } = useLanguage();
  const { theme, toggleTheme, isDark } = useTheme();
  const { isAdminAuthenticated } = useAuth();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const navigate = useNavigate();
<<<<<<< HEAD
  const { selectedLang, setSelectedLang, SUPPORTED_LANGUAGES, t } = useLanguage();

=======
>>>>>>> 9f930c6 (Frontend Updates and languages Addition)
  const activeAlerts = aiAlertsData.filter(a => a.status === 'Active');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/budget-explorer?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  const handleVoiceSearchResult = (text) => {
    navigate(`/dashboard?q=${encodeURIComponent(text)}`);
  };

  const navLinks = [
    { label: t.navHome, path: '/' },
    { label: t.navDashboard, path: '/dashboard' },
    { label: t.navBudgetExplorer, path: '/budget-explorer' },
    { label: t.navAiAssistant, path: '/ai-assistant' },
    { label: t.navAiAlerts, path: '/ai-alerts', badge: activeAlerts.length },
    { label: t.navAdminUpload, path: '/admin-upload', isProtected: true }
  ];

  // Requirement 4: 10 Indian Languages List
  const languageOptions = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिंदी (Hindi)' },
    { code: 'mr', label: 'मराठी (Marathi)' },
    { code: 'ta', label: 'தமிழ் (Tamil)' },
    { code: 'bn', label: 'বাংলা (Bengali)' },
    { code: 'te', label: 'తెలుగు (Telugu)' },
    { code: 'gu', label: 'ગુજરાતી (Gujarati)' },
    { code: 'kn', label: 'ಕನ್ನಡ (Kannada)' },
    { code: 'ml', label: 'മലയാളം (Malayalam)' },
    { code: 'pa', label: 'ਪੰਜਾਬੀ (Punjabi)' }
  ];

  return (
<<<<<<< HEAD
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800 bg-[#0b0f19]/80 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
                <Eye className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-display text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-cyan-400">
                    CivicLens
                  </span>
                  <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded bg-cyan-950 text-cyan-400 border border-cyan-800/50">
                    AI Governance
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 hidden sm:block">Public Budget Transparency Platform</p>
              </div>
            </Link>
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-6">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('search_placeholder', "Search budgets, sectors, or departments...")}
                className="w-full pl-9 pr-4 py-2 text-sm bg-slate-900/90 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
              />
            </div>
          </form>

          {/* Right Action Icons & AI Shortcut */}
          <div className="flex items-center gap-3">
            
            {/* Global Language Selector */}
            <div className="flex items-center gap-1.5 glass-panel px-2.5 py-1.5 rounded-xl text-xs text-slate-300 border border-slate-700">
              <Globe className="w-4 h-4 text-cyan-400" />
              <select
                aria-label="Select Application Language"
                value={selectedLang}
                onChange={(e) => setSelectedLang(e.target.value)}
                className="bg-transparent text-white font-bold focus:outline-none cursor-pointer text-xs"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code} className="bg-slate-900 text-slate-200">
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>

            <Link
              to="/ai-assistant"
              className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-500 to-indigo-600 text-white hover:from-cyan-400 hover:to-indigo-500 shadow-md shadow-cyan-500/20 transition-all hover:scale-105"
            >
              <Sparkles className="w-4 h-4 text-cyan-200 animate-pulse" />
              <span>{t('ask_ai', 'Ask AI Assistant')}</span>
            </Link>


            {/* Notification bell dropdown */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 text-slate-300 hover:text-white rounded-xl hover:bg-slate-800 transition-colors focus:outline-none"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {activeAlerts.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-[#0b0f19] animate-pulse" />
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 glass-panel rounded-2xl shadow-2xl border border-slate-700/80 p-4 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-rose-400" />
                      <span className="font-semibold text-sm text-slate-200">Active AI Anomaly Flags</span>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-medium">
                      {activeAlerts.length} Active
                    </span>
                  </div>

                  <div className="divide-y divide-slate-800/60 my-2 max-h-64 overflow-y-auto">
                    {activeAlerts.slice(0, 3).map((alert) => (
                      <div key={alert.id} className="py-2.5 hover:bg-slate-800/40 rounded-lg px-2 transition-colors">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-medium text-cyan-400">{alert.department}</span>
                          <span className="text-slate-500">{alert.date}</span>
                        </div>
                        <p className="text-xs font-semibold text-slate-200 line-clamp-1">{alert.title}</p>
                        <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">{alert.description}</p>
                      </div>
                    ))}
                  </div>

                  <Link
                    to="/ai-alerts"
                    onClick={() => setNotificationsOpen(false)}
                    className="block w-full text-center py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-cyan-400 transition-colors"
                  >
                    View All Anomaly Alerts &rarr;
                  </Link>
=======
    <>
      <header className={`sticky top-0 z-40 w-full border-b transition-colors ${
        isDark
          ? 'bg-[#0b0f19]/90 border-slate-800 text-slate-100 backdrop-blur-md'
          : 'bg-white/95 border-slate-200 text-slate-900 shadow-sm backdrop-blur-md'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3">
            
            {/* Logo & Government Brand */}
            <div className="flex items-center gap-6">
              <Link to="/" className="flex items-center gap-2.5 group">
                <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex-shrink-0">
                  Govt Portal
                </span>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-emerald-600 flex items-center justify-center shadow-md text-white group-hover:scale-105 transition-transform flex-shrink-0">
                  <Eye className="w-5 h-5" />
>>>>>>> 9f930c6 (Frontend Updates and languages Addition)
                </div>
                <div>
                  <span className="font-display text-xl font-extrabold tracking-tight block">
                    {t.brandName}
                  </span>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:block">
                    {t.brandSubtitle}
                  </p>
                </div>
              </Link>

              {/* Desktop Navigation Links */}
              <nav className="hidden lg:flex items-center gap-1 text-xs font-semibold">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    className={({ isActive }) =>
                      `px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                        isActive
                          ? isDark
                            ? 'bg-slate-800 text-cyan-400 font-bold border border-slate-700'
                            : 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                          : isDark
                          ? 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`
                    }
                  >
                    <span>{link.label}</span>
                    {link.badge !== undefined && link.badge > 0 && (
                      <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-rose-500 text-white">
                        {link.badge}
                      </span>
                    )}
                    {link.isProtected && (
                      <Lock className="w-3 h-3 text-slate-400" />
                    )}
                  </NavLink>
                ))}
              </nav>
            </div>

            {/* Right Actions: Search, Voice, Language, Theme, Notifications */}
            <div className="flex items-center gap-2 sm:gap-3">
              
              {/* Search Bar */}
              <form onSubmit={handleSearch} className="hidden xl:flex items-center relative">
                <Search className="w-3.5 h-3.5 absolute left-3 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className={`w-56 pl-8 pr-3 py-1.5 text-xs rounded-xl border focus:outline-none transition-all ${
                    isDark
                      ? 'bg-slate-900 border-slate-700 text-slate-100 placeholder-slate-500 focus:border-cyan-500'
                      : 'bg-slate-50 border-slate-300 text-slate-800 placeholder-slate-400 focus:border-blue-500'
                  }`}
                />
              </form>

              {/* Voice Button */}
              <button
                onClick={() => setVoiceModalOpen(true)}
                className={`p-2 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition-all ${
                  isDark
                    ? 'bg-slate-800 border-slate-700 text-cyan-400 hover:bg-slate-700'
                    : 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
                }`}
                title={t.askVoice}
              >
                <Mic className="w-4 h-4 text-blue-600 dark:text-cyan-400 animate-pulse" />
                <span className="hidden md:inline">{t.askVoice}</span>
              </button>

              {/* 10 Indian Languages Selector */}
              <div className="relative flex items-center gap-1">
                <Globe className="w-4 h-4 text-slate-400 hidden sm:block" />
                <select
                  value={lang}
                  onChange={(e) => setLang(e.target.value)}
                  className={`py-1.5 px-2 text-xs font-bold rounded-xl border cursor-pointer ${
                    isDark
                      ? 'bg-slate-900 border-slate-700 text-slate-200'
                      : 'bg-slate-50 border-slate-300 text-slate-800'
                  }`}
                >
                  {languageOptions.map((opt) => (
                    <option key={opt.code} value={opt.code}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Day / Night Mode Toggle */}
              <button
                onClick={toggleTheme}
                className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                  isDark
                    ? 'bg-slate-800 border-slate-700 text-amber-300 hover:bg-slate-700'
                    : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                }`}
                title="Toggle Light / Dark Mode"
              >
                {isDark ? (
                  <>
                    <Moon className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="hidden sm:inline">🌙 {t.nightMode}</span>
                  </>
                ) : (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                    <span className="hidden sm:inline">☀ {t.dayMode}</span>
                  </>
                )}
              </button>

              {/* Notifications Bell Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className={`relative p-2 rounded-xl border transition-colors ${
                    isDark
                      ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                      : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                  }`}
                  aria-label={t.notifications}
                >
                  <Bell className="w-4 h-4" />
                  {activeAlerts.length > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse" />
                  )}
                </button>

                {notificationsOpen && (
                  <div className={`absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl p-4 shadow-2xl border z-50 animate-in fade-in ${
                    isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
                  }`}>
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-rose-500" />
                        <span className="font-bold text-xs sm:text-sm">{t.activeAlertsCount}</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-600 dark:text-rose-300 font-bold">
                        {activeAlerts.length}
                      </span>
                    </div>

                    <div className="divide-y divide-slate-100 dark:divide-slate-800 my-2 max-h-60 overflow-y-auto text-xs">
                      {activeAlerts.slice(0, 3).map((alert) => (
                        <div key={alert.id} className="py-2 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-lg px-1 transition-colors">
                          <div className="flex items-center justify-between text-[11px] mb-1">
                            <span className="font-bold text-blue-600 dark:text-cyan-400">{alert.department}</span>
                            <span className="text-slate-400">{alert.date}</span>
                          </div>
                          <p className="font-semibold line-clamp-1">{alert.title}</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">{alert.description}</p>
                        </div>
                      ))}
                    </div>

                    <Link
                      to="/ai-alerts"
                      onClick={() => setNotificationsOpen(false)}
                      className="block w-full text-center py-2 rounded-xl text-xs font-bold bg-blue-50 dark:bg-slate-800 text-blue-700 dark:text-cyan-400 hover:bg-blue-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      View All Flags &rarr;
                    </Link>
                  </div>
                )}
              </div>

              {/* Mobile Hamburger Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>

            </div>
          </div>

          {/* Mobile Drawer */}
          {mobileMenuOpen && (
            <div className="lg:hidden pb-4 pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2 animate-in fade-in">
              <form onSubmit={handleSearch} className="px-2 mb-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.searchPlaceholder}
                    className="w-full pl-9 pr-4 py-2 text-xs bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                  />
                </div>
              </form>

              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <span>{link.label}</span>
                  {link.isProtected && <Lock className="w-3.5 h-3.5 text-slate-400" />}
                </Link>
              ))}
            </div>
          )}

        </div>
      </header>

      <VoiceInputModal
        isOpen={voiceModalOpen}
        onClose={() => setVoiceModalOpen(false)}
        onResult={handleVoiceSearchResult}
      />
    </>
  );
}
