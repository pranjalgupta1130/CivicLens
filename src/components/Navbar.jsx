import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, Bell, Search, Sparkles, Menu, X, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { aiAlertsData } from '../data/mockData';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const activeAlerts = aiAlertsData.filter(a => a.status === 'Active');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/budget-explorer?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  return (
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
                placeholder="Search budgets, vendors, departments (e.g. Infrastructure)..."
                className="w-full pl-9 pr-4 py-2 text-sm bg-slate-900/90 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
              />
            </div>
          </form>

          {/* Right Action Icons & AI Shortcut */}
          <div className="flex items-center gap-3">
            
            <Link
              to="/ai-assistant"
              className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-500 to-indigo-600 text-white hover:from-cyan-400 hover:to-indigo-500 shadow-md shadow-cyan-500/20 transition-all hover:scale-105"
            >
              <Sparkles className="w-4 h-4 text-cyan-200 animate-pulse" />
              <span>Ask AI Lens</span>
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
                </div>
              )}
            </div>

            {/* Mobile menu hamburger button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-300 hover:text-white rounded-xl hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 pt-2 border-t border-slate-800/80 space-y-2 animate-in fade-in">
            <form onSubmit={handleSearch} className="mb-3 px-1">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search budgets..."
                  className="w-full pl-9 pr-4 py-2 text-sm bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500"
                />
              </div>
            </form>
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800">Home</Link>
            <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800">Dashboard</Link>
            <Link to="/budget-explorer" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800">Budget Explorer</Link>
            <Link to="/ai-assistant" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800">AI Assistant</Link>
            <Link to="/ai-alerts" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800">AI Alerts</Link>
            <Link to="/admin-upload" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800">Admin Upload</Link>
          </div>
        )}

      </div>
    </header>
  );
}
