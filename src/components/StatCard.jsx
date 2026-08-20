import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export default function StatCard({ title, value, change, changeType, icon: Icon, description, accentColor = 'cyan' }) {
  const getBadgeStyle = () => {
    if (changeType === 'increase') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (changeType === 'decrease') return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    return 'bg-slate-800 text-slate-400 border-slate-700';
  };

  const renderTrendIcon = () => {
    if (changeType === 'increase') return <ArrowUpRight className="w-3.5 h-3.5" />;
    if (changeType === 'decrease') return <ArrowDownRight className="w-3.5 h-3.5" />;
    return <Minus className="w-3.5 h-3.5" />;
  };

  return (
    <div className="glass-panel glass-panel-hover rounded-2xl p-5 border border-slate-800 relative overflow-hidden group">
      
      {/* Background Accent Radial Light */}
      <div className="absolute -top-12 -right-12 w-24 h-24 rounded-full bg-cyan-500/10 blur-xl group-hover:bg-cyan-500/20 transition-all pointer-events-none" />

      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {title}
        </span>
        {Icon && (
          <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/60 text-cyan-400 group-hover:scale-110 transition-transform">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <h3 className="font-display text-2xl font-bold text-white tracking-tight">
          {value}
        </h3>
        {change && (
          <div className={`flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-semibold border ${getBadgeStyle()}`}>
            {renderTrendIcon()}
            <span>{change}</span>
          </div>
        )}
      </div>

      {description && (
        <p className="text-xs text-slate-400 mt-2 line-clamp-1">
          {description}
        </p>
      )}
    </div>
  );
}
