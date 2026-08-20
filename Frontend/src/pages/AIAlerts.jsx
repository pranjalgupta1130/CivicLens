import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
<<<<<<< HEAD
  Info, 
  Filter, 
  ArrowUpRight, 
  FileSearch, 
  FileText,
  Check, 
  Clock, 
  X,
  ChevronRight,
  ShieldCheck,
  Zap,
  ExternalLink,
  Sparkles
} from 'lucide-react';

import { useLanguage } from '../context/LanguageContext';

export default function AIAlerts() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedAnomalyId = searchParams.get('anomaly');


  const [anomalies, setAnomalies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filterSeverity, setFilterSeverity] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
=======
  X, 
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import WhyExplanationModal from '../components/WhyExplanationModal';
import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { aiAlertsData } from '../data/mockData';

export default function AIAlerts() {
  const { t } = useLanguage();
  const { isDark } = useTheme();

  const [alertsList, setAlertsList] = useState(aiAlertsData);
  const [filterSeverity, setFilterSeverity] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [activeModalAlert, setActiveModalAlert] = useState(null);
  const [whyTopic, setWhyTopic] = useState(null);
>>>>>>> 9f930c6 (Frontend Updates and languages Addition)

  const [activeModalAlert, setActiveModalAlert] = useState(null);
  const [activeInvestigation, setActiveInvestigation] = useState(null);
  const [isInvestigating, setIsInvestigating] = useState(false);

  const fetchAnomalies = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/anomalies');
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      setAnomalies(data);

      if (selectedAnomalyId) {
        const target = data.find(a => a.id === selectedAnomalyId);
        if (target) {
          handleInvestigateAnomaly(target);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch anomalies from server:', err);
      setError('Could not load anomaly risk flags from server. Please verify backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnomalies();
  }, []);

  const handleInvestigateAnomaly = async (anomaly) => {
    setActiveModalAlert(anomaly);
    setIsInvestigating(true);
    setActiveInvestigation(null);

    try {
      const res = await fetch(`/api/investigations/run/${anomaly.id}`, {
        method: 'POST'
      });
      if (res.ok) {
        const invData = await res.json();
        setActiveInvestigation(invData);
      }
    } catch (err) {
      console.warn('Investigation trigger failed:', err);
    } finally {
      setIsInvestigating(false);
    }
  };

  const formatCr = (val) => {
    if (val === undefined || val === null) return '₹0 Cr';
    const cr = val >= 1000000 ? val / 10000000 : val;
    return `₹${cr.toLocaleString('en-IN', { maximumFractionDigits: 1 })} Cr`;
  };

  const filteredAlerts = anomalies.filter((alert) => {
    const matchesSeverity = filterSeverity === 'All' || alert.severity.toUpperCase() === filterSeverity.toUpperCase();
    const matchesStatus = filterStatus === 'All' || alert.status.toUpperCase() === filterStatus.toUpperCase();
    return matchesSeverity && matchesStatus;
  });

  const criticalCount = anomalies.filter(a => a.severity === 'HIGH').length;
  const warningCount = anomalies.filter(a => a.severity === 'MEDIUM').length;
  const resolvedCount = anomalies.filter(a => a.status === 'INVESTIGATED' || a.status === 'RESOLVED').length;

<<<<<<< HEAD
  const getSeverityBadge = (severity) => {
    const s = severity?.toUpperCase();
    if (s === 'HIGH' || s === 'CRITICAL') {
      return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    }
    if (s === 'MEDIUM' || s === 'WARNING') {
      return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    }
    return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
  };

  const getRiskScore = (alert) => {
    const s = alert.severity?.toUpperCase();
    const pct = Math.abs(alert.percentage_change || 0);
    if (s === 'HIGH') return Math.min(85 + Math.round(pct / 10), 99);
    if (s === 'MEDIUM') return Math.min(60 + Math.round(pct / 10), 84);
    return Math.min(30 + Math.round(pct / 10), 59);
  };

=======
>>>>>>> 9f930c6 (Frontend Updates and languages Addition)
  return (
    <div className="space-y-8 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
<<<<<<< HEAD
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
              AI Anomaly & Risk Monitor
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
              LangGraph Audit Engine Active
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Algorithmic flags generated by continuous ledger pattern recognition, spending spikes, and baseline benchmarks.
=======
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display">
            {t.unusualSpendingFound}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Public sector spending flags identified by CivicLens automated audit.
>>>>>>> 9f930c6 (Frontend Updates and languages Addition)
          </p>
        </div>

        <div className="flex items-center gap-2">
<<<<<<< HEAD
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
            <span>{criticalCount} High Risk Flags</span>
=======
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span>{criticalCount} Critical Flags Active</span>
>>>>>>> 9f930c6 (Frontend Updates and languages Addition)
          </span>
        </div>
      </div>

<<<<<<< HEAD
      {/* Loading & Error States */}
      {isLoading && (
        <div className="glass-panel rounded-3xl p-12 text-center text-slate-400 space-y-3 border border-slate-800">
          <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin mx-auto" />
          <p className="text-xs">Fetching live spending anomalies and risk scores from backend API...</p>
        </div>
      )}

      {error && !isLoading && (
        <div className="glass-panel rounded-3xl p-8 text-center text-rose-300 border border-rose-500/30 space-y-4">
          <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto" />
          <div>
            <p className="text-sm font-semibold">{error}</p>
            <p className="text-xs text-slate-400 mt-1">Verify backend FastAPI server is running on http://localhost:8000</p>
          </div>
          <button
            onClick={fetchAnomalies}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-500/20 text-rose-200 border border-rose-500/40"
          >
            Retry Loading Anomalies
          </button>
        </div>
      )}

      {!isLoading && !error && (
        <>
          {/* Summary KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs uppercase font-semibold text-slate-400">High Risk Anomalies</span>
                <h3 className="text-2xl font-bold font-display text-rose-400 mt-1">{criticalCount} Active</h3>
                <p className="text-[11px] text-slate-400 mt-1">Severe expenditure deviation</p>
              </div>
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
                <ShieldAlert className="w-6 h-6" />
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs uppercase font-semibold text-slate-400">Medium Risk Surges</span>
                <h3 className="text-2xl font-bold font-display text-amber-400 mt-1">{warningCount} Active</h3>
                <p className="text-[11px] text-slate-400 mt-1">Pattern & velocity shifts</p>
=======
      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        
        <div className={`rounded-2xl p-5 border shadow-sm flex items-center justify-between ${
          isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}>
          <div>
            <span className="text-xs uppercase font-bold text-slate-500">{t.highRisk}</span>
            <h3 className="text-2xl font-bold font-display text-rose-600 dark:text-rose-400 mt-1">{criticalCount} Active</h3>
            <p className="text-[11px] text-slate-400 mt-1">Requires immediate public audit</p>
          </div>
          <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>

        <div className={`rounded-2xl p-5 border shadow-sm flex items-center justify-between ${
          isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}>
          <div>
            <span className="text-xs uppercase font-bold text-slate-500">{t.moderate}</span>
            <h3 className="text-2xl font-bold font-display text-amber-600 dark:text-amber-400 mt-1">{warningCount} Active</h3>
            <p className="text-[11px] text-slate-400 mt-1">Spending velocity spikes</p>
          </div>
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className={`rounded-2xl p-5 border shadow-sm flex items-center justify-between ${
          isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}>
          <div>
            <span className="text-xs uppercase font-bold text-slate-500">Audited & Resolved</span>
            <h3 className="text-2xl font-bold font-display text-emerald-600 dark:text-emerald-400 mt-1">{resolvedCount} Cleared</h3>
            <p className="text-[11px] text-slate-400 mt-1">Verified by district audit committee</p>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Filter Bar */}
      <div className={`rounded-2xl p-4 border shadow-sm flex flex-wrap items-center justify-between gap-4 ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500 mr-2">Severity:</span>
          {['All', 'Critical', 'Warning'].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterSeverity === sev
                  ? 'bg-blue-600 text-white shadow-md'
                  : isDark
                  ? 'bg-slate-950 text-slate-300 border border-slate-800'
                  : 'bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500 mr-2">Status:</span>
          {['All', 'Active', 'Under Review', 'Resolved'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterStatus === st
                  ? 'bg-indigo-600 text-white shadow-md'
                  : isDark
                  ? 'bg-slate-950 text-slate-300 border border-slate-800'
                  : 'bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Alert Feed Cards */}
      <div className="space-y-4">
        {filteredAlerts.map((alert) => (
          <div
            key={alert.id}
            className={`rounded-2xl p-5 border shadow-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
              isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                  {alert.severity} Flag
                </span>
                <span className="text-xs font-mono text-blue-600 dark:text-cyan-400 font-bold">{alert.id}</span>
                <span className="text-xs text-slate-500">• {alert.department}</span>
                <span className="text-[11px] text-slate-400 ml-auto md:ml-0">{alert.date}</span>
              </div>

              <h3 className="text-base font-bold font-display">{alert.title}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">{alert.description}</p>
              
              <div className="flex items-center gap-2 text-xs bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="font-bold text-blue-600 dark:text-cyan-400">Citizen Recommendation:</span>
                <span className="text-slate-600 dark:text-slate-300">{alert.recommendation}</span>
              </div>
            </div>

            <div className="flex flex-row md:flex-col items-end justify-between md:justify-center gap-3 border-t md:border-t-0 border-slate-200 dark:border-slate-800 pt-3 md:pt-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400">Status:</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                  {alert.status}
                </span>
>>>>>>> 9f930c6 (Frontend Updates and languages Addition)
              </div>
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
            </div>

<<<<<<< HEAD
            <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs uppercase font-semibold text-slate-400">Audited / Investigated</span>
                <h3 className="text-2xl font-bold font-display text-emerald-400 mt-1">{resolvedCount} Processed</h3>
                <p className="text-[11px] text-slate-400 mt-1">LangGraph evidence verified</p>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 mr-2">Severity:</span>
              {['All', 'HIGH', 'MEDIUM', 'LOW'].map((sev) => (
                <button
                  key={sev}
                  onClick={() => setFilterSeverity(sev)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    filterSeverity === sev
                      ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {sev}
=======
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setWhyTopic(alert.department)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 dark:bg-slate-800 text-blue-700 dark:text-cyan-400 border border-blue-200 dark:border-slate-700"
                >
                  {t.whyBtn}
                </button>
                <button
                  onClick={() => setActiveModalAlert(alert)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 text-white dark:bg-slate-700"
                >
                  {t.inspectDetails}
>>>>>>> 9f930c6 (Frontend Updates and languages Addition)
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 mr-2">Status:</span>
              {['All', 'DETECTED', 'INVESTIGATED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    filterStatus === st
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
<<<<<<< HEAD

          {/* Anomaly Feed Cards */}
          <div className="space-y-4">
            {filteredAlerts.map((alert) => {
              const riskScore = getRiskScore(alert);
              const isOver = alert.current_value > alert.previous_value;
              const diffVal = Math.abs(alert.current_value - alert.previous_value);

              return (
                <div
                  key={alert.id}
                  className="glass-panel glass-panel-hover rounded-2xl p-5 border border-slate-800 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getSeverityBadge(alert.severity)}`}>
                        {alert.severity} • Score {riskScore}/100
                      </span>
                      <span className="text-xs font-mono text-cyan-400 font-semibold">{alert.id.substring(0, 18)}</span>
                      <span className="text-xs text-slate-400">• {alert.department_name}</span>
                      <span className="text-[11px] text-slate-500 ml-auto md:ml-0">FY {alert.year}</span>
                    </div>

                    <h3 className="text-base font-bold text-white font-display">
                      {alert.scheme_name || `${alert.department_name} Expenditure Shift`}
                    </h3>

                    {/* What Changed Plain Language */}
                    <p className="text-xs text-slate-300 leading-relaxed font-medium">
                      Spending changed from <strong className="text-white">{formatCr(alert.previous_value)}</strong> to <strong className="text-cyan-400">{formatCr(alert.current_value)}</strong> ({isOver ? '+' : '-'}{formatCr(diffVal)}, {isOver ? '+' : ''}{alert.percentage_change}% shift).
                    </p>

                    <p className="text-xs text-slate-400 leading-relaxed">{alert.description}</p>
                  </div>

                  <div className="flex flex-row md:flex-col items-end justify-between md:justify-center gap-3 border-t md:border-t-0 border-slate-800 pt-3 md:pt-0">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        alert.status === 'INVESTIGATED'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}>
                        {alert.status}
                      </span>
                    </div>

                    <button
                      onClick={() => handleInvestigateAnomaly(alert)}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-lg shadow-cyan-500/20 transition-all hover:scale-105"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>{t('investigate_btn', 'Investigate Spending')}</span>
                    </button>

                  </div>
                </div>
              );
            })}

            {filteredAlerts.length === 0 && (
              <div className="glass-panel rounded-3xl p-12 text-center text-slate-500">
                No anomaly risk flags match your selected filters.
              </div>
            )}
          </div>
        </>
      )}

      {/* Anomaly Investigation Dossier Modal (Phase 2) */}
      {activeModalAlert && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 border border-slate-700 bg-slate-900 shadow-2xl animate-in fade-in zoom-in-95 space-y-4">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-400" />
                <span className="font-display font-bold text-lg text-white">AI Anomaly Investigation Dossier</span>
              </div>
              <button onClick={() => { setActiveModalAlert(null); setActiveInvestigation(null); }} className="p-1 text-slate-400 hover:text-white">
=======
        ))}
      </div>

      {/* Alert Modal */}
      {activeModalAlert && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-lg rounded-3xl p-6 shadow-2xl border transition-all animate-in fade-in zoom-in-95 space-y-4 ${
            isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-500" />
                <h3 className="font-bold text-base font-display">Unusual Spending Record Audit</h3>
              </div>
              <button onClick={() => setActiveModalAlert(null)} className="p-1 text-slate-400 hover:text-slate-600">
>>>>>>> 9f930c6 (Frontend Updates and languages Addition)
                <X className="w-5 h-5" />
              </button>
            </div>

<<<<<<< HEAD
            {/* Section 1: Anomaly Details Header */}
            <div>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase border ${getSeverityBadge(activeModalAlert.severity)}`}>
                  {activeModalAlert.severity} SEVERITY
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-xs font-mono text-cyan-400">{activeModalAlert.id}</span>
              </div>
              <h3 className="text-lg font-bold text-white mt-1">
                {activeModalAlert.scheme_name || `${activeModalAlert.department_name} Audit Flag`}
              </h3>
              <p className="text-xs text-slate-400">Department: {activeModalAlert.department_name} • FY {activeModalAlert.year}</p>
            </div>

            {/* Risk Score Card */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400">Risk Assessment Score</span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-3xl font-extrabold font-display text-rose-400">{getRiskScore(activeModalAlert)}</span>
                  <span className="text-xs text-slate-400">/ 100 ({activeModalAlert.severity} RISK)</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Risk Factors: +{activeModalAlert.percentage_change}% spending shift, baseline anomaly detection.
                </p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                <ShieldAlert className="w-7 h-7" />
              </div>
            </div>

            {/* Section 2: WHAT CHANGED? */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">What Changed?</h4>
              <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-800 text-xs text-slate-200 leading-relaxed">
                Spending shifted from <strong>{formatCr(activeModalAlert.previous_value)}</strong> to <strong>{formatCr(activeModalAlert.current_value)}</strong>. That is a net difference of <strong>{formatCr(Math.abs(activeModalAlert.current_value - activeModalAlert.previous_value))}</strong> ({activeModalAlert.percentage_change > 0 ? '+' : ''}{activeModalAlert.percentage_change}% YoY change).
              </div>
            </div>

            {/* Section 3: WHY IS THIS FLAGGED? */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Why Is This Flagged?</h4>
              <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-800 text-xs text-slate-300 space-y-1">
                <p><strong>Primary Signal:</strong> {activeModalAlert.anomaly_type || 'SPENDING_SPIKE'}</p>
                <p><strong>Description:</strong> {activeModalAlert.description}</p>
              </div>
            </div>

            {/* Section 4: LANGGRAPH INVESTIGATION & LLM-AS-JUDGE GROUNDING */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-cyan-400" /> LangGraph AI Investigation & Grounding Check
              </h4>

              {isInvestigating ? (
                <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2">
                  <div className="w-6 h-6 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin mx-auto" />
                  <p className="text-xs text-slate-400">Executing LangGraph 6-node state graph & retrieving documentary evidence...</p>
                </div>
              ) : activeInvestigation ? (
                <div className="space-y-3">
                  {/* LLM-as-a-Judge Badge */}
                  <div className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs font-semibold ${
                    activeInvestigation.evidence_strength === 'STRONG' || activeInvestigation.evidence_strength === 'MODERATE'
                      ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                      : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                  }`}>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                      <span>
                        {activeInvestigation.evidence_strength === 'STRONG' || activeInvestigation.evidence_strength === 'MODERATE'
                          ? '✓ GROUNDING CHECK: Supported by retrieved document evidence'
                          : '⚠ GROUNDING CHECK: Insufficient documentary evidence found in dataset'}
                      </span>
                    </div>
                    <span className="font-mono text-[10px]">
                      Confidence: {activeInvestigation.confidence > 0 ? `${(activeInvestigation.confidence * 100).toFixed(0)}%` : 'LOW'}
                    </span>
                  </div>

                  {/* AI Explanation */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed space-y-2">
                    <span className="font-bold text-white block">LangGraph Investigation Summary:</span>
                    <p>{activeInvestigation.ai_explanation}</p>
                  </div>

                  {/* Evidence / Source Chunks */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-semibold uppercase text-slate-400">Retrieved Documentary Evidence</span>
                    {activeInvestigation.source_chunks && activeInvestigation.source_chunks.length > 0 ? (
                      activeInvestigation.source_chunks.map((src, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                          <p className="font-mono text-cyan-400 font-semibold">{src}</p>
                          <div className="flex justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-900">
                            <span>Source: Official government document</span>
                            <span>AI explanation generated from retrieved evidence</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-1">
                        <p className="italic">No specific document citations found matching this anomaly in current dataset.</p>
                        <div className="flex justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-900">
                          <span>Source: Official government budget database</span>
                          <span>AI explanation generated from database records</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => handleInvestigateAnomaly(activeModalAlert)}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold text-xs shadow-lg"
                >
                  Run Deep LangGraph Investigation
                </button>
              )}
            </div>

            {/* Section 5: WHAT CAN YOU DO? CITIZEN ACTION SECTION */}
            <div className="space-y-3 pt-3 border-t border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                What Can You Do?
              </h4>
              <p className="text-xs text-slate-400">
                This spending issue has been investigated using available government records. You can request official documents or submit a citizen concern.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => navigate('/rti', {
                    state: {
                      anomalyId: activeModalAlert.id,
                      department: activeModalAlert.department_name,
                      scheme: activeModalAlert.scheme_name || 'General Sector Expenditure',
                      year: activeModalAlert.year,
                      mode: 'RTI'
                    }
                  })}
                  className="flex-1 py-3 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>{t('generate_rti', 'Generate RTI Request')}</span>
                </button>

                <button
                  onClick={() => navigate('/rti', {
                    state: {
                      anomalyId: activeModalAlert.id,
                      department: activeModalAlert.department_name,
                      scheme: activeModalAlert.scheme_name || 'General Sector Expenditure',
                      year: activeModalAlert.year,
                      mode: 'CONCERN'
                    }
                  })}
                  className="flex-1 py-3 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white shadow-lg shadow-amber-500/20 transition-all hover:scale-105 flex items-center justify-center gap-2"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>{t('raise_concern', 'Raise a Concern')}</span>
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => { setActiveModalAlert(null); setActiveInvestigation(null); }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                Close Dossier
=======
            <div className="space-y-3 text-xs">
              <h4 className="text-base font-bold">{activeModalAlert.title}</h4>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{activeModalAlert.description}</p>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="font-bold text-blue-600 dark:text-cyan-400 block mb-1">Recommended Citizen Action:</span>
                <p className="text-slate-600 dark:text-slate-300">{activeModalAlert.recommendation}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setActiveModalAlert(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
              >
                {t.closeBtn}
>>>>>>> 9f930c6 (Frontend Updates and languages Addition)
              </button>
            </div>


          </div>
        </div>
      )}

      <WhyExplanationModal
        isOpen={!!whyTopic}
        onClose={() => setWhyTopic(null)}
        topicKey={whyTopic}
      />

    </div>
  );
}

