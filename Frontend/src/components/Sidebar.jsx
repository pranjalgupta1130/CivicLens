import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  BarChart3, 
  PieChart, 
  Bot, 
  AlertTriangle, 
  UploadCloud, 
  ShieldCheck, 
  ChevronRight 
} from 'lucide-react';
import { aiAlertsData } from '../data/mockData';
import { useLanguage } from '../context/LanguageContext';

export default function Sidebar() {
  const activeAlertsCount = aiAlertsData.filter(a => a.status === 'Active').length;
  const { t } = useLanguage();

  const navItems = [
    { label: t('nav_home', 'Home Overview'), path: '/', icon: Home },
    { label: t('nav_dashboard', 'Civic Financial Dashboard'), path: '/dashboard', icon: BarChart3 },
    { label: t('nav_explorer', 'Budget Explorer'), path: '/budget-explorer', icon: PieChart },
    { label: t('nav_assistant', 'Civic AI Assistant'), path: '/ai-assistant', icon: Bot, badge: 'Smart' },
    { 
      label: t('nav_alerts', 'Spending Alerts & Risks'), 
      path: '/ai-alerts', 
      icon: AlertTriangle, 
      count: activeAlertsCount, 
      badgeColor: 'bg-rose-500 text-white' 
    },
    { label: t('nav_admin', 'Admin Upload Portal'), path: '/admin-upload', icon: UploadCloud }
  ];


  return (
    <aside className="hidden lg:flex flex-col w-64 glass-panel border-r border-slate-800/80 min-h-[calc(100vh-4rem)] p-4 space-y-6">
      
      {/* Platform Navigation */}
      <div className="space-y-1">
        <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
          Navigation Menu
        </p>
        
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/10 text-cyan-400 border border-cyan-500/30 shadow-inner'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                <span>{item.label}</span>
              </div>
              
              <div className="flex items-center gap-1.5">
                {item.count !== undefined && (
                  <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${item.badgeColor}`}>
                    {item.count}
                  </span>
                )}
                {item.badge && (
                  <span className="px-2 py-0.5 text-[10px] font-semibold uppercase rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/50">
                    {item.badge}
                  </span>
                )}
                <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-slate-500" />
              </div>
            </NavLink>
          );
        })}
      </div>

      {/* System Governance Status Card */}
      <div className="mt-auto glass-card rounded-2xl p-4 border border-slate-800 bg-slate-900/50">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold text-slate-200">Governance Engine</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
          CivicLens AI is actively auditing fiscal ledgers against municipal transparency rules.
        </p>
        <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-800/80 pt-2">
          <span>Status: Active</span>
          <span className="text-emerald-400 font-mono">v2.4 Online</span>
        </div>
      </div>
    </aside>
  );
}
