import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowRight, 
  ShieldAlert, 
  Building2, 
  HeartPulse, 
  Route, 
  Sprout, 
  Check, 
  FileText, 
  HelpCircle,
  Eye,
  Send
} from 'lucide-react';
import MyDistrictSection from '../components/MyDistrictSection';
import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { aiAlertsData, budgetHighlights } from '../data/mockData';

export default function Home() {
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const [showGuide, setShowGuide] = React.useState(true);

  const activeAlerts = aiAlertsData.filter(a => a.status === 'Active');

  const workflowSteps = [
    {
      number: '1',
      title: t.wf1Title || 'Government Money',
      subtitle: t.wf1Sub || 'Money given to public services',
      icon: Building2,
      path: '/dashboard',
      color: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800'
    },
    {
      number: '2',
      title: t.wf2Title || 'See Where It Goes',
      subtitle: t.wf2Sub || 'Track spending by sector & district',
      icon: Eye,
      path: '/budget-explorer',
      color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800'
    },
    {
      number: '3',
      title: t.wf3Title || 'Find Unusual Spending',
      subtitle: t.wf3Sub || 'Automatic flags for price spikes',
      icon: ShieldAlert,
      path: '/ai-alerts',
      color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800'
    },
    {
      number: '4',
      title: t.wf4Title || 'Check Evidence',
      subtitle: t.wf4Sub || 'Inspect official government reports',
      icon: FileText,
      path: '/ai-alerts',
      color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
    },
    {
      number: '5',
      title: t.wf5Title || 'Take Action',
      subtitle: t.wf5Sub || 'Create a legal RTI petition in 1 click',
      icon: Send,
      path: '/rti-generator',
      color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800'
    }
  ];

  return (
    <div className="space-y-8 pb-12">
      
      {/* Optional Dismissible Citizen Guide */}
      {showGuide && (
        <div className="rounded-2xl p-4 border bg-blue-50/90 dark:bg-slate-800/80 border-blue-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 flex items-start justify-between gap-4 text-xs sm:text-sm">
          <div className="flex items-start gap-3">
            <HelpCircle className="w-5 h-5 text-blue-600 dark:text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-extrabold text-blue-900 dark:text-cyan-300">{t.newToCivicLens || "New to CivicLens?"}</p>
              <p className="mt-0.5 text-slate-600 dark:text-slate-300 leading-relaxed">
                {t.newToCivicLensDesc || "CivicLens helps you track public money in simple language. Pick a sector to see how much was spent, inspect unusual spending flags, or ask questions in your language."}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowGuide(false)}
            className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white px-2 py-1 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-700 transition-colors shrink-0"
          >
            {t.skipGuide || "Skip guide ✕"}
          </button>
        </div>
      )}

      {/* 1. Welcoming Hero Header with 2 Obvious Primary Actions */}
      <section className="rounded-3xl p-8 sm:p-12 border border-slate-200 dark:border-slate-800 bg-gradient-to-r from-white via-blue-50 to-emerald-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 text-slate-900 dark:text-slate-100 shadow-sm relative overflow-hidden">
        <div className="max-w-3xl space-y-6 relative z-10">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border bg-white/90 dark:bg-slate-800 text-blue-900 dark:text-cyan-300 border-blue-200 dark:border-slate-700 shadow-xs">
            <span>🇮🇳 {t.heroTag}</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
            {t.heroTitle}
          </h1>

          <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed max-w-2xl font-medium">
            {t.heroSubtitle}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              to="/dashboard"
              className="px-6 py-4 rounded-2xl text-sm font-extrabold bg-blue-600 hover:bg-blue-700 text-white shadow-lg flex items-center gap-2 transition-all hover:scale-[1.02] cursor-pointer min-h-[48px]"
            >
              <span>{t.exploreDashboardBtn || "Explore Citizen Dashboard"}</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              to="/ai-assistant"
              className="px-6 py-4 rounded-2xl text-sm font-extrabold border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm flex items-center gap-2 transition-all cursor-pointer min-h-[48px]"
            >
              <Sparkles className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
              <span>{t.askQuestionBtn || "Ask a Question"}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Large Visual 5-Step CivicLens Citizen Workflow */}
      <section className={`rounded-3xl p-6 sm:p-8 border shadow-sm space-y-6 ${
        isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-cyan-400 border border-blue-200 dark:border-slate-700">
            {t.workflowTag || "5-Step Citizen Workflow"}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-display">
            {t.workflowTitle || "How CivicLens Works For You"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {t.workflowSubtitle || "Follow government money from raw public allocations to verified evidence and legal action."}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-2">
          {workflowSteps.map((step) => {
            const IconComponent = step.icon;
            return (
              <Link
                key={step.number}
                to={step.path}
                className={`p-5 rounded-2xl border transition-all hover:scale-[1.03] hover:shadow-md flex flex-col justify-between space-y-4 ${step.color}`}
              >
                <div className="flex items-center justify-between">
                  <span className="w-7 h-7 rounded-full bg-slate-900/10 dark:bg-white/10 flex items-center justify-center text-xs font-black">
                    {step.number}
                  </span>
                  <IconComponent className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm leading-tight text-slate-900 dark:text-slate-100">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-snug">
                    {step.subtitle}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-cyan-400">
                  <span>{t.openBtn || "Open"}</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3. District / Search Entry */}
      <MyDistrictSection />

      {/* 4. Visual Key Sectors Overview */}
      <section className={`rounded-3xl p-6 sm:p-8 border shadow-sm space-y-6 ${
        isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold font-display">{t.majorSectorsTitle || "Major Public Sectors"}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t.majorSectorsSub || "Track key government spending areas in simple terms"}</p>
          </div>
          <Link
            to="/dashboard"
            className="text-xs font-bold text-blue-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
          >
            <span>{t.viewAllDashboard || "View All Financial Data on Dashboard"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: t.education, desc: 'School upgrades, digital labs & teacher training', icon: Building2, color: 'text-cyan-500' },
            { title: t.healthcare, desc: 'District hospital expansion & medical equipment', icon: HeartPulse, color: 'text-rose-500' },
            { title: t.roads, desc: 'Highway construction & rural connectivity roads', icon: Route, color: 'text-indigo-500' },
            { title: t.agriculture, desc: 'Water grid, irrigation & farmer welfare schemes', icon: Sprout, color: 'text-emerald-500' }
          ].map((sec, idx) => {
            const IconComp = sec.icon;
            return (
              <div key={idx} className={`p-5 rounded-2xl border flex flex-col justify-between space-y-3 ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 ${sec.color}`}>
                    <IconComp className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-sm">{sec.title}</h4>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{sec.desc}</p>
                <Link to="/dashboard" className="text-[11px] font-bold text-blue-600 dark:text-cyan-400 hover:underline">
                  {t.checkSectorSpending || "Check sector spending ➔"}
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. Live Spending Flags Preview */}
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
              <p className="text-xs text-slate-500 dark:text-slate-400">{t.autoditedFlags || "Public spending flags automatically audited by CivicLens"}</p>
            </div>
          </div>
          <Link
            to="/ai-alerts"
            className="text-xs font-bold text-blue-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
          >
            <span>{t.viewAllFlags || "View All Active Flags"}</span>
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
                <span className="font-semibold text-blue-600 dark:text-cyan-400">{alert.department}</span>
                <Link to="/ai-alerts" className="text-slate-600 dark:text-slate-300 hover:underline">{t.checkThisSpending}</Link>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}

