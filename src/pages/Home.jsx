import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowRight, 
  ShieldAlert, 
  PieChart, 
  Bot, 
  UploadCloud, 
  CheckCircle2, 
  TrendingUp,
  Search,
  Eye,
  Zap,
  Building2,
  HeartPulse,
  Route,
  Sprout,
  Check
} from 'lucide-react';
import StatCard from '../components/StatCard';
import { civicKPIs, aiAlertsData, budgetHighlights } from '../data/mockData';

export default function Home() {
  const activeAlerts = aiAlertsData.filter(a => a.status === 'Active');

  return (
    <div className="space-y-12 pb-10">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl glass-panel p-8 sm:p-12 border border-slate-800 bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-[#0b0f19]">
        
        {/* Decorative Glow Orbs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-24 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 backdrop-blur-md">
            <Zap className="w-3.5 h-3.5 text-cyan-400 animate-bounce" />
            <span>Civic Lens Engine v2.4 Active • Real-Time Fiscal Audit</span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
            Transparent Civic Governance powered by <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-indigo-300 to-violet-400">AI Intelligence</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            Democratizing public budget data for citizens, journalists, auditors, and policy analysts. Explore sector outlays, track scheme expenditures, and spot anomalies with automated AI ledger audits.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              to="/dashboard"
              className="px-6 py-3.5 rounded-2xl text-sm font-semibold bg-gradient-to-r from-cyan-500 to-indigo-600 text-white hover:from-cyan-400 hover:to-indigo-500 shadow-xl shadow-cyan-500/25 flex items-center gap-2 transition-all hover:scale-105"
            >
              <span>Open Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/ai-assistant"
              className="px-6 py-3.5 rounded-2xl text-sm font-semibold glass-panel text-slate-200 hover:text-white hover:bg-slate-800/80 border border-slate-700 flex items-center gap-2 transition-all"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Ask AI Assistant</span>
            </Link>
          </div>
        </div>
      </section>

      {/* KPI Stats Grid - Top Sector Budget Metrics */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold font-display text-white">Government Sector Allocations FY 2026</h2>
          <span className="text-xs text-slate-400">Synced with CAG Portal</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Education Budget"
            value={civicKPIs.educationBudget}
            change="↑ 12%"
            changeType="increase"
            icon={Building2}
            description="26% of Total Allocation"
          />
          <StatCard
            title="Healthcare Budget"
            value={civicKPIs.healthcareBudget}
            change="↑ 18%"
            changeType="increase"
            icon={HeartPulse}
            description="23% of Total Allocation"
          />
          <StatCard
            title="Roads & Highways"
            value={civicKPIs.roadsBudget}
            change="↑ 8%"
            changeType="increase"
            icon={Route}
            description="17% of Total Allocation"
          />
          <StatCard
            title="Agriculture Budget"
            value={civicKPIs.agricultureBudget}
            change="↓ 4%"
            changeType="decrease"
            icon={Sprout}
            description="12% of Total Allocation"
          />
        </div>
      </section>

      {/* FY 2026 Budget Highlights Section */}
      <section className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 bg-gradient-to-r from-slate-900/90 via-[#111827] to-slate-900/90">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-display text-white">FY 2026 Budget Highlights</h3>
            <p className="text-xs text-slate-400">Major policy achievements and public infrastructure commitments</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgetHighlights.map((highlight, idx) => (
            <div key={idx} className="glass-card rounded-2xl p-4 border border-slate-800 flex items-start gap-3 hover:border-cyan-500/30 transition-all">
              <div className="p-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mt-0.5">
                <Check className="w-4 h-4" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-slate-200 leading-relaxed">
                {highlight}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Live Anomaly Feed Highlight */}
      <section className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 bg-gradient-to-r from-slate-900 via-[#101726] to-slate-900">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-display text-white">Live AI Anomaly & Risk Alerts</h3>
              <p className="text-xs text-slate-400">Real-time flags generated by public ledger auditing models</p>
            </div>
          </div>
          <Link
            to="/ai-alerts"
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5"
          >
            <span>View All {activeAlerts.length} Active Alerts</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeAlerts.slice(0, 2).map((alert) => (
            <div key={alert.id} className="glass-card rounded-2xl p-5 border border-rose-900/40 bg-rose-950/10 hover:border-rose-700/60 transition-all">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {alert.severity} • Risk Score: {alert.score}
                </span>
                <span className="text-xs text-slate-400 font-mono">{alert.id}</span>
              </div>
              <h4 className="font-semibold text-slate-100 text-sm mb-1">{alert.title}</h4>
              <p className="text-xs text-slate-400 mb-3">{alert.description}</p>
              <div className="flex items-center justify-between text-xs border-t border-slate-800/80 pt-2.5">
                <span className="text-cyan-400 font-medium">{alert.department}</span>
                <Link to="/ai-alerts" className="text-slate-300 hover:text-white underline text-[11px]">Inspect Details</Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Platform Pillars */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl font-bold font-display text-white">Public Governance Tools</h2>
          <p className="text-sm text-slate-400">Everything citizens, auditors, and policy analysts need to inspect public spending.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="glass-panel glass-panel-hover rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <PieChart className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-white font-display">Line-Item Budget Explorer</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Filter by department schemes, inspect awarded contractor tenders, and view budget versus spending line-items.
              </p>
            </div>
            <Link to="/budget-explorer" className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300">
              Explore Budgets &rarr;
            </Link>
          </div>

          <div className="glass-panel glass-panel-hover rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-white font-display">Conversational AI Assistant</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Query government financial databases in plain English. Get instant sector breakdowns, scheme answers, and policy comparisons.
              </p>
            </div>
            <Link to="/ai-assistant" className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300">
              Launch AI Chat &rarr;
            </Link>
          </div>

          <div className="glass-panel glass-panel-hover rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <UploadCloud className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-white font-display">Admin Data Ingestion</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Upload government expenditure records, department allocation CSVs, and trigger automated AI risk validation.
              </p>
            </div>
            <Link to="/admin-upload" className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300">
              Upload Datasets &rarr;
            </Link>
          </div>

        </div>
      </section>

    </div>
  );
}
