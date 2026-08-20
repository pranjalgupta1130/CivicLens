import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowRight, 
  ShieldAlert, 
  Building2, 
  CheckCircle2, 
  TrendingUp, 
  Route, 
  Check 
} from 'lucide-react';
import StatCard from '../components/StatCard';
import MyDistrictSection from '../components/MyDistrictSection';
import GeographicMap from '../components/GeographicMap';
import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { aiAlertsData, budgetHighlights } from '../data/mockData';

export default function Home() {
  const { t } = useLanguage();
  const { isDark } = useTheme();

  const activeAlerts = aiAlertsData.filter(a => a.status === 'Active');

  return (
    <div className="space-y-10 pb-12">
      
      {/* Government Portal Light Hero Header */}
      <section className="rounded-3xl p-8 sm:p-12 border border-slate-200 bg-gradient-to-r from-white via-blue-50 to-emerald-50 text-slate-900 shadow-sm relative overflow-hidden">
        <div className="max-w-3xl space-y-6 relative z-10">
          
          {/* Government Portal Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border bg-white/90 text-blue-900 border-blue-200 shadow-xs">
            <span>🇮🇳 {t.heroTag}</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-slate-900">
            {t.heroTitle}
          </h1>

          <p className="text-sm sm:text-base text-slate-700 leading-relaxed max-w-2xl font-medium">
            {t.heroSubtitle}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              to="/dashboard"
              className="px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md flex items-center gap-2 transition-all hover:scale-[1.02]"
            >
              <span>{t.navDashboard}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/ai-assistant"
              className="px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-bold border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 shadow-sm flex items-center gap-2 transition-all"
            >
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>{t.navAiAssistant}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* CivicLens USP Central Product Story Banner */}
      <section className="glass-panel rounded-3xl p-6 sm:p-8 border border-cyan-500/30 bg-gradient-to-r from-cyan-950/40 via-slate-900 to-indigo-950/40 space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            CivicLens Unique Product Story
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
            From Raw Government Budget Data to Real Citizen Action
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Unlike generic analytics dashboards, CivicLens turns complex public ledgers into verified evidence and actionable RTI petitions.
          </p>
        </div>

        {/* Product Pipeline Diagram */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2">
          {[
            { step: '1. Government Data', desc: 'Raw financial ledgers & official reports', color: 'from-cyan-500/20 to-cyan-500/10 text-cyan-400 border-cyan-500/30' },
            { step: '2. AI Analysis', desc: 'Anomaly detection & spending shifts', color: 'from-indigo-500/20 to-indigo-500/10 text-indigo-400 border-indigo-500/30' },
            { step: '3. Evidence Grounding', desc: 'Verified against official report chunks', color: 'from-purple-500/20 to-purple-500/10 text-purple-400 border-purple-500/30' },
            { step: '4. Citizen Wording', desc: 'Plain-language rural explanations', color: 'from-emerald-500/20 to-emerald-500/10 text-emerald-400 border-emerald-500/30' },
            { step: '5. Citizen Action', desc: 'AI-drafted legal RTI & petitions', color: 'from-amber-500/20 to-amber-500/10 text-amber-400 border-amber-500/30' }
          ].map((item, idx) => (
            <div key={idx} className={`p-4 rounded-2xl border bg-gradient-to-b ${item.color} space-y-1.5 flex flex-col justify-between`}>
              <span className="text-xs font-bold font-display block">{item.step}</span>
              <p className="text-[11px] text-slate-300 leading-tight">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="space-y-4">

        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold font-display">{t.heroTag} Summary FY 2026</h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">CAG Verified Public Record</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title={t.totalBudget}
            value={t.totalBudgetVal}
            change={t.spentMoreThisYear}
            changeType="increase"
            icon={Building2}
            description="FY 2026 Total Public Allocation"
            topicKey="Total Budget"
          />
          <StatCard
            title={t.moneySpent}
            value={t.moneySpentVal}
            change="69% Used So Far"
            changeType="increase"
            icon={CheckCircle2}
            description="Actual Disbursed Money"
            topicKey="Money Spent"
          />
          <StatCard
            title={t.moneyRemaining}
            value={t.moneyRemainingVal}
            change="31% Available"
            changeType="decrease"
            icon={Route}
            description="Unspent Balance Available"
            topicKey="Money Remaining"
          />
          <StatCard
            title={t.budgetUsed}
            value={t.budgetUsedVal}
            change="+8% vs Last Quarter"
            changeType="increase"
            icon={TrendingUp}
            description="Overall Utilization Percentage"
            topicKey="Budget Used"
          />
        </div>
      </section>

      {/* 📍 Prominent MY AREA / MY DISTRICT Section */}
      <MyDistrictSection />

      {/* 🟢 Geographic District Risk & Budget Map */}
      <GeographicMap />

      {/* Budget Highlights */}
      <section className={`rounded-3xl p-6 sm:p-8 border shadow-sm ${
        isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-blue-50 dark:bg-slate-800 text-blue-700 dark:text-cyan-400 border border-blue-200 dark:border-slate-700">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-display">FY 2026 Budget Achievements</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Major public infrastructure commitments completed this year</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgetHighlights.map((highlight, idx) => (
            <div key={idx} className={`rounded-2xl p-4 border flex items-start gap-3 ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="p-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mt-0.5">
                <Check className="w-4 h-4" />
              </div>
              <span className="text-xs sm:text-sm font-medium leading-relaxed">
                {highlight}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Live Unusual Spending Flags Section */}
      <section className={`rounded-3xl p-6 sm:p-8 border shadow-sm ${
        isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-display">{t.unusualSpendingFound}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Public spending flags automatically audited by CivicLens AI</p>
            </div>
          </div>
          <Link
            to="/ai-alerts"
            className="text-xs font-bold text-blue-700 dark:text-cyan-400 hover:underline flex items-center gap-1"
          >
            <span>View All {activeAlerts.length} Active Flags</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeAlerts.slice(0, 2).map((alert) => (
            <div key={alert.id} className={`rounded-2xl p-5 border flex flex-col justify-between space-y-3 ${
              isDark ? 'bg-slate-950 border-rose-900/40' : 'bg-rose-50/50 border-rose-200'
            }`}>
              <div className="flex items-center justify-between text-xs">
                <span className="px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] bg-rose-500/20 text-rose-700 dark:text-rose-300">
                  {alert.severity} Flag
                </span>
                <span className="font-mono text-slate-400">{alert.id}</span>
              </div>
              <h4 className="font-bold text-sm">{alert.title}</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{alert.description}</p>
              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200 dark:border-slate-800">
                <span className="font-semibold text-blue-700 dark:text-cyan-400">{alert.department}</span>
                <Link to="/ai-alerts" className="text-slate-600 dark:text-slate-300 hover:underline">{t.inspectDetails}</Link>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
