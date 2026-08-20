import React, { useState, useEffect } from 'react';
<<<<<<< HEAD
import { Link } from 'react-router-dom';
=======
import { useSearchParams, Link } from 'react-router-dom';
>>>>>>> 9f930c6 (Frontend Updates and languages Addition)
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar 
} from 'recharts';
import { 
  Building2,
  TrendingUp, 
  Download, 
  Calendar,
  HelpCircle,
  CheckCircle2,
  Mic,
  Send,
  Sparkles,
  Bot,
  User,
  Database,
  Route
} from 'lucide-react';
import StatCard from '../components/StatCard';
<<<<<<< HEAD
import { useLanguage } from '../context/LanguageContext';

export default function Dashboard() {
  const { t } = useLanguage();
  const [selectedYear, setSelectedYear] = useState('2026');


  // Live Backend Data States
  const [dashboardData, setDashboardData] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const iconsMap = [Building2, HeartPulse, Route, Sprout];
  const deptColors = ['#06b6d4', '#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ec4899'];

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [dashRes, deptsRes, anomalyRes] = await Promise.all([
        fetch('/api/dashboard'),
        fetch('/api/departments'),
        fetch('/api/anomalies')
      ]);

      if (!dashRes.ok) {
        throw new Error(`Server returned HTTP ${dashRes.status}`);
      }

      const dashJson = await dashRes.json();
      let deptsJson = [];
      if (deptsRes.ok) deptsJson = await deptsRes.json();

      let anomalyJson = [];
      if (anomalyRes.ok) anomalyJson = await anomalyRes.json();

      setDashboardData(dashJson);
      setDepartments(deptsJson);
      setAnomalies(anomalyJson);
    } catch (err) {
      console.warn('Backend API request failed for dashboard:', err);
      setError('Civic financial data could not be loaded. Please verify backend server is running on http://localhost:8000.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formatCr = (val) => {
    if (val === undefined || val === null) return '₹0 Cr';
    const cr = val >= 1000000 ? val / 10000000 : val;
    return `₹${cr.toLocaleString('en-IN', { maximumFractionDigits: 1 })} Cr`;
=======
import WhyExplanationModal from '../components/WhyExplanationModal';
import VoiceInputModal from '../components/VoiceInputModal';
import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { budgetService } from '../services/budgetService';
import { monthlySpendingData, departmentBudgets } from '../data/mockData';

export default function Dashboard() {
  const { t } = useLanguage();
  const { isDark } = useTheme();

  const [searchParams] = useSearchParams();
  const initialQueryFromUrl = searchParams.get('q') || '';

  const [selectedYear, setSelectedYear] = useState('2026');
  const [whyModalTopic, setWhyModalTopic] = useState(null);
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  
  // Ask CivicLens Section State
  const [askQuery, setAskQuery] = useState('');
  const [activeAnswer, setActiveAnswer] = useState(null);
  const [isAnswering, setIsAnswering] = useState(false);

  const [deptList, setDeptList] = useState(departmentBudgets);
  const [kpiStats, setKpiStats] = useState({
    totalBudget: t.totalBudgetVal,
    spentAmount: t.moneySpentVal,
    moneyRemaining: t.moneyRemainingVal,
    budgetUsed: t.budgetUsedVal
  });

  const citizenQuickQuestions = [
    "How much money was given to education?",
    "Why did healthcare spending increase?",
    "Which sector received the most funding?",
    "How much was spent on roads?",
    "How much money is left?",
    "Show me my district's budget."
  ];

  useEffect(() => {
    budgetService.getOverviewKPIs().then(res => {
      if (res) {
        setKpiStats({
          totalBudget: res.totalBudget,
          spentAmount: res.spentAmount,
          moneyRemaining: res.moneyRemaining,
          budgetUsed: res.budgetUsed
        });
      }
    });
    budgetService.getDepartmentList().then(res => {
      if (res) setDeptList(res);
    });

    if (initialQueryFromUrl) {
      handleAskQuestionSubmit(initialQueryFromUrl);
    }
  }, [t, initialQueryFromUrl]);

  const yearTrendData = [
    { year: '2022', Education: 2400, Healthcare: 1800, Roads: 1500, Agriculture: 1200 },
    { year: '2023', Education: 2650, Healthcare: 2100, Roads: 1650, Agriculture: 1300 },
    { year: '2024', Education: 2900, Healthcare: 2400, Roads: 1850, Agriculture: 1400 },
    { year: '2025', Education: 3000, Healthcare: 2500, Roads: 1950, Agriculture: 1510 },
    { year: '2026', Education: 3240, Healthcare: 2850, Roads: 2100, Agriculture: 1450 }
  ];

  const handleAskQuestionSubmit = (queryToSubmit) => {
    const q = queryToSubmit || askQuery;
    if (!q.trim()) return;

    setIsAnswering(true);
    setActiveAnswer(null);

    setTimeout(() => {
      const lower = q.toLowerCase();
      let responseText = "";
      let topicKey = "default";

      if (lower.includes('education') || lower.includes('school')) {
        responseText = "Government allocated ₹3,240 Cr to education this year (26% of total public budget). ₹2,680 Cr has already been spent on modernizing 250 schools and digital labs.";
        topicKey = "education";
      } else if (lower.includes('healthcare') || lower.includes('hospital')) {
        responseText = "Healthcare spending increased by ₹840 Cr this year. A major reason was additional funding for district hospital construction and emergency medical equipment across 12 districts.";
        topicKey = "healthcare";
      } else if (lower.includes('most money') || lower.includes('highest')) {
        responseText = "Education received the most money (₹3,240 Cr), followed by Healthcare (₹2,850 Cr), Roads & Highways (₹2,100 Cr), and Agriculture (₹1,450 Cr).";
        topicKey = "education";
      } else if (lower.includes('road') || lower.includes('highway')) {
        responseText = "₹2,100 Cr was allocated to roads and expressways. ₹1,890 Cr has already been spent on 84 approved road infrastructure projects.";
        topicKey = "roads";
      } else if (lower.includes('left') || lower.includes('remaining')) {
        responseText = "₹4,450 Cr (31% of the total budget) remains available in unspent government reserves for ongoing public works.";
        topicKey = "default";
      } else if (lower.includes('district') || lower.includes('pune') || lower.includes('my area')) {
        responseText = "Pune district was allocated ₹2,430 Cr. ₹2,201 Cr (91%) has been spent so far, leaving ₹229 Cr available for district projects.";
        topicKey = "default";
      } else {
        responseText = `Official record for "${q}": Total budget allocation is ₹14,290 Cr. ₹9,840 Cr (69%) has been spent across all public services in FY 2026.`;
        topicKey = "default";
      }

      setActiveAnswer({
        question: q,
        text: responseText,
        topicKey: topicKey,
        source: "Government Budget Data - Public Record"
      });
      setIsAnswering(false);
      setAskQuery('');
    }, 500);
>>>>>>> 9f930c6 (Frontend Updates and languages Addition)
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className={`p-3 rounded-xl shadow-xl text-xs border ${
          isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}>
          <p className="font-bold mb-1">{label}</p>
          {payload.map((entry, index) => (
            <div key={`item-${index}`} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="capitalize">{entry.name}:</span>
              <span className="font-bold">₹{entry.value} Cr</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

<<<<<<< HEAD

  const totalBudget = dashboardData?.total_budget_amount || 0;
  const totalActual = dashboardData?.total_actual_amount || 0;
  const totalDepts = dashboardData?.total_departments || departments.length || 0;
  const totalSchemes = dashboardData?.total_schemes || 0;
  const totalAnomalies = dashboardData?.total_anomalies_count || anomalies.length || 0;
  const highAnomalies = dashboardData?.high_severity_anomalies_count || anomalies.filter(a => a.severity === 'HIGH').length || 0;

  const topSpender = dashboardData?.top_spending_departments?.[0] || null;

  const kpiCardsData = [
    {
      title: t('total_budget', "Total Government Allocation"),
      value: formatCr(totalBudget),
      share: `${totalDepts} Sectors • ${totalSchemes} Active Schemes`,
      change: "Approved Allocations",
      changeType: "increase",
      icon: Building2
    },
    {
      title: t('total_spent', "Total Money Spent"),
      value: formatCr(totalActual),
      share: `${((totalActual / (totalBudget || 1)) * 100).toFixed(1)}% of Allocation Spent`,
      change: totalActual > totalBudget ? `+${((totalActual - totalBudget)/(totalBudget||1)*100).toFixed(1)}% over budget` : "On Schedule",
      changeType: totalActual > totalBudget ? "increase" : "decrease",
      icon: TrendingUp
    },
    {
      title: "Highest Spending Sector",
      value: topSpender ? formatCr(topSpender.total_actual) : formatCr(totalActual),
      share: topSpender ? topSpender.department_name : "Public Sector Outlay",
      change: topSpender && topSpender.yoy_change_percentage ? `${topSpender.yoy_change_percentage > 0 ? '↑' : '↓'} ${Math.abs(topSpender.yoy_change_percentage)}% YoY` : "Active",
      changeType: topSpender && topSpender.yoy_change_percentage < 0 ? "decrease" : "increase",
      icon: HeartPulse
    },
    {
      title: t('audit_flags', "Unexplained Spending Surges"),
      value: `${totalAnomalies} Flags`,
      share: `${highAnomalies} High Severity Anomalies`,
      change: "Flagged by AI Engine",
      changeType: "increase",
      icon: AlertTriangle
    }
  ];


  const chartYearlyTrend = dashboardData?.yearly_trend?.map(item => ({
    period: `FY ${item.year}`,
    budget: item.total_budget >= 1000000 ? item.total_budget / 10000000 : item.total_budget,
    spent: item.total_actual >= 1000000 ? item.total_actual / 10000000 : item.total_actual,
  })) || [];

  const pieChartData = departments.map((d, idx) => ({
    name: d.name.length > 18 ? d.name.substring(0, 18) + '...' : d.name,
    fullName: d.name,
    allocated: d.total_budget_amount >= 1000000 ? d.total_budget_amount / 10000000 : d.total_budget_amount,
    spent: d.total_actual_amount >= 1000000 ? d.total_actual_amount / 10000000 : d.total_actual_amount,
    color: deptColors[idx % deptColors.length],
    code: d.code
  }));

=======
  const handleDownload = (type) => {
    alert(`Downloading ${type} for citizen audit (PDF/CSV)...`);
  };
>>>>>>> 9f930c6 (Frontend Updates and languages Addition)

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header & Download Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
<<<<<<< HEAD
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
              Civic Financial Dashboard
            </h1>
            {dashboardData && (
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Live Backend API Connected
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time fiscal monitoring, sector expenditure vs allocation tracking, and CAG ledgers.
=======
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display">
            Citizen Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Understand where government money is allocated and spent.
>>>>>>> 9f930c6 (Frontend Updates and languages Addition)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <Calendar className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
            <span>Year:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-transparent font-bold focus:outline-none cursor-pointer"
            >
              <option value="2026" className="dark:bg-slate-900">FY 2026</option>
              <option value="2025" className="dark:bg-slate-900">FY 2025</option>
              <option value="2024" className="dark:bg-slate-900">FY 2024</option>
            </select>
          </div>

<<<<<<< HEAD
          <button 
            onClick={() => alert("Exporting Executive Financial Ledger Report (CSV)...")}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
=======
          <button
            onClick={() => handleDownload('Budget Report')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-colors"
>>>>>>> 9f930c6 (Frontend Updates and languages Addition)
          >
            <Download className="w-4 h-4" />
            <span>{t.downloadReport}</span>
          </button>
        </div>
      </div>

<<<<<<< HEAD
      {/* Loading State */}
      {isLoading && (
        <div className="glass-panel rounded-3xl p-12 text-center text-slate-400 space-y-3 border border-slate-800">
          <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin mx-auto" />
          <p className="text-xs">Fetching live civic financial metrics from backend server...</p>
=======
      {/* Requirement 2 & 7: Prominent CITIZEN-FRIENDLY ASK CIVICLENS SECTION */}
      <section className={`rounded-3xl p-6 sm:p-8 border shadow-md transition-all ${
        isDark
          ? 'bg-slate-900 border-slate-800 text-slate-100'
          : 'bg-gradient-to-r from-blue-50/90 via-white to-emerald-50/80 border-blue-200 text-slate-900'
      }`}>
        <div className="space-y-4 max-w-4xl">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
              <h2 className="text-xl sm:text-2xl font-extrabold font-display">
                {t.askCivicLensTitle || "Ask CivicLens"}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              {t.askCivicLensSubtitle || "Ask a question about your government's budget."}
            </p>
          </div>

          {/* Search/Ask Input & Voice Button Bar */}
          <form
            onSubmit={(e) => { e.preventDefault(); handleAskQuestionSubmit(); }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
          >
            <input
              type="text"
              value={askQuery}
              onChange={(e) => setAskQuery(e.target.value)}
              placeholder={t.askQuestionPlaceholder}
              className={`flex-1 px-4 py-3 text-xs sm:text-sm rounded-2xl border focus:outline-none ${
                isDark
                  ? 'bg-slate-950 border-slate-700 text-slate-100 placeholder-slate-500'
                  : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 shadow-sm'
              }`}
            />

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setVoiceModalOpen(true)}
                className={`px-4 py-3 rounded-2xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                  isDark
                    ? 'bg-slate-800 border-slate-700 text-cyan-400 hover:bg-slate-700'
                    : 'bg-white border-slate-300 text-blue-700 hover:bg-blue-50 shadow-sm'
                }`}
              >
                <Mic className="w-4 h-4 text-blue-600 dark:text-cyan-400 animate-pulse" />
                <span>{t.askVoice}</span>
              </button>

              <button
                type="submit"
                disabled={!askQuery.trim()}
                className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md disabled:opacity-40 transition-all"
              >
                <span>Ask</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>

          {/* Quick Citizen Prompts */}
          <div className="flex flex-wrap gap-2 pt-1">
            {citizenQuickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleAskQuestionSubmit(q)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border text-left transition-all ${
                  isDark
                    ? 'bg-slate-950 border-slate-800 text-slate-300 hover:text-cyan-400 hover:border-slate-700'
                    : 'bg-white border-slate-200 text-slate-700 hover:text-blue-600 hover:border-blue-300 shadow-sm'
                }`}
              >
                "{q}"
              </button>
            ))}
          </div>

          {/* Answering Loading State */}
          {isAnswering && (
            <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 flex items-center gap-2 animate-pulse">
              <Bot className="w-4 h-4 text-blue-600 dark:text-cyan-400 animate-spin" />
              <span>Fetching public budget record...</span>
            </div>
          )}

          {/* Active Question Response Card */}
          {activeAnswer && (
            <div className={`p-5 rounded-2xl border shadow-sm space-y-3 animate-in fade-in ${
              isDark ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
            }`}>
              <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-cyan-400 pb-2 border-b border-slate-100 dark:border-slate-800">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Q: "{activeAnswer.question}"</span>
              </div>

              <p className="text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                {activeAnswer.text}
              </p>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                <span className="text-slate-500 font-semibold flex items-center gap-1">
                  <Database className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                  {t.sourceGovtData}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setWhyModalTopic(activeAnswer.topicKey)}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 dark:bg-slate-800 text-blue-700 dark:text-cyan-400 border border-blue-200 dark:border-slate-700"
                  >
                    {t.whyThisAnswer}
                  </button>
                  <Link
                    to="/budget-explorer"
                    className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:underline"
                  >
                    {t.viewBudgetData}
                  </Link>
                </div>
              </div>
            </div>
          )}

        </div>
      </section>

      {/* Main Citizen KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title={t.totalBudget}
          value={kpiStats.totalBudget}
          change={t.spentMoreThisYear}
          changeType="increase"
          icon={Building2}
          description="Total Allocation Across All Sectors"
          topicKey="Total Budget"
        />
        <StatCard
          title={t.moneySpent}
          value={kpiStats.spentAmount}
          change="Spent So Far"
          changeType="increase"
          icon={CheckCircle2}
          description="Disbursed Funds"
          topicKey="Money Spent"
        />
        <StatCard
          title={t.moneyRemaining}
          value={kpiStats.moneyRemaining}
          change="Available Unspent"
          changeType="decrease"
          icon={Route}
          description="Remaining State Reserve"
          topicKey="Money Remaining"
        />
        <StatCard
          title={t.budgetUsed}
          value={kpiStats.budgetUsed}
          change="+8% Progress"
          changeType="increase"
          icon={TrendingUp}
          description="Current Utilization Rate"
          topicKey="Budget Used"
        />
      </div>

      {/* Meaningful Citizen Question Graphs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Question 1: "Where is the government spending money?" */}
        <div className={`lg:col-span-2 rounded-3xl p-6 border shadow-sm ${
          isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h2 className="text-base sm:text-lg font-bold font-display flex items-center gap-2">
                <span>{t.chartWhereSpending}</span>
                <button onClick={() => setWhyModalTopic("Monthly Spending")} className="text-blue-600 dark:text-cyan-400">
                  <HelpCircle className="w-4 h-4" />
                </button>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Comparing actual spending vs monthly budget target (in ₹ Crore)</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1 text-blue-600 dark:text-cyan-400">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 dark:bg-cyan-400" /> {t.moneySpent}
              </span>
              <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 dark:bg-indigo-400" /> Target
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlySpendingData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorBudget" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#1f293d" : "#e2e8f0"} vertical={false} />
                <XAxis dataKey="month" stroke={isDark ? "#64748b" : "#64748b"} fontSize={11} tickLine={false} />
                <YAxis stroke={isDark ? "#64748b" : "#64748b"} fontSize={11} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="spent" name="Spent" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorSpent)" />
                <Area type="monotone" dataKey="budget" name="Target" stroke="#6366f1" strokeWidth={2} strokeDasharray="4 4" fillOpacity={1} fill="url(#colorBudget)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
>>>>>>> 9f930c6 (Frontend Updates and languages Addition)
        </div>
      )}

<<<<<<< HEAD
      {/* Error State with Retry */}
      {error && !isLoading && (
        <div className="glass-panel rounded-3xl p-8 text-center text-rose-300 border border-rose-500/30 space-y-4">
          <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto" />
          <div>
            <p className="text-sm font-semibold">{error}</p>
            <p className="text-xs text-slate-400 mt-1">Check backend FastAPI server running on http://localhost:8000</p>
          </div>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/40 transition-all"
          >
            Retry Loading Dashboard
          </button>
        </div>
      )}

      {!isLoading && !error && (
        <>
          {/* Specified KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {kpiCardsData.map((card) => {
              const Icon = card.icon;
              const isRiskCard = card.icon === AlertTriangle;

              const content = (
                <StatCard
                  key={card.title}
                  title={card.title}
                  value={card.value}
                  change={card.change}
                  changeType={card.changeType}
                  icon={Icon}
                  description={`${card.share}`}
                />
              );

              return isRiskCard ? (
                <Link key={card.title} to="/ai-alerts" className="block hover:scale-[1.02] transition-transform">
                  {content}
                </Link>
              ) : (
                <React.Fragment key={card.title}>
                  {content}
                </React.Fragment>
              );
            })}
          </div>



          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Multi-Year Expenditure Trajectory Area Chart */}
            <div className="lg:col-span-2 glass-panel rounded-3xl p-6 border border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                <div>
                  <h2 className="text-base font-bold font-display text-white">Multi-Year Fiscal Trajectory (₹ Crore)</h2>
                  <p className="text-xs text-slate-400">Comparing total allocated budget vs actual spent across fiscal years</p>
                </div>
                <div className="flex items-center gap-4 text-xs font-medium">
                  <span className="flex items-center gap-1 text-cyan-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" /> Spent
                  </span>
                  <span className="flex items-center gap-1 text-indigo-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" /> Allocated Outlay
                  </span>
                </div>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartYearlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorBudget" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" vertical={false} />
                    <XAxis dataKey="period" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="spent" name="Spent" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorSpent)" />
                    <Area type="monotone" dataKey="budget" name="Budget" stroke="#6366f1" strokeWidth={2} strokeDasharray="4 4" fillOpacity={1} fill="url(#colorBudget)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Plain Language Chart Explanation */}
              <div className="mt-4 p-3 rounded-2xl bg-cyan-950/20 border border-cyan-800/40 text-xs text-slate-300 flex items-start gap-2">
                <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <p>
                  <strong>What this means for citizens:</strong> Total government spending grew from ₹1,000 Cr in FY 2023 to ₹1,340.5 Cr in FY 2026. In FY 2026, actual money spent exceeded approved allocations by ₹30.5 Cr (+2.3%), driven primarily by a 70% increase in health infrastructure outlay.
                </p>
=======
        {/* Question 2: "Which sector received the most funding?" */}
        <div className={`rounded-3xl p-6 border shadow-sm flex flex-col justify-between ${
          isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}>
          <div>
            <h2 className="text-base font-bold font-display mb-1 flex items-center justify-between">
              <span>{t.chartWhichSectorMost}</span>
              <button onClick={() => setWhyModalTopic("Sector Allocation")} className="text-blue-600 dark:text-cyan-400">
                <HelpCircle className="w-4 h-4" />
              </button>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Distribution across key government sectors</p>
            
            <div className="h-56 w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deptList}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="allocated"
                  >
                    {deptList.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke={isDark ? "#0b0f19" : "#ffffff"} strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => `₹${val} Cr`} />
                </PieChart>
              </ResponsiveContainer>

              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-[10px] uppercase font-semibold text-slate-400">Total Outlay</span>
                <span className="font-display font-bold text-base">₹14,290 Cr</span>
>>>>>>> 9f930c6 (Frontend Updates and languages Addition)
              </div>
            </div>

<<<<<<< HEAD
            {/* Budget Allocation by Sector Pie Chart */}
            <div className="glass-panel rounded-3xl p-6 border border-slate-800 flex flex-col justify-between">
              <div>
                <h2 className="text-base font-bold font-display text-white mb-1">Sector Outlay Share</h2>
                <p className="text-xs text-slate-400 mb-4">Distribution across government departments</p>
                
                <div className="h-56 w-full relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                        dataKey="allocated"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="#0b0f19" strokeWidth={2} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCr(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
=======
          <div className="grid grid-cols-2 gap-2 text-[11px] pt-4 border-t border-slate-200 dark:border-slate-800">
            {deptList.slice(0, 4).map((d) => (
              <div key={d.code} className="flex items-center gap-1.5 truncate">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                <span className="truncate font-medium">{d.name}: ₹{d.allocated} Cr</span>
>>>>>>> 9f930c6 (Frontend Updates and languages Addition)
              </div>

              {/* Plain Language Pie Chart Explanation */}
              <div className="mt-4 p-3 rounded-2xl bg-indigo-950/20 border border-indigo-800/40 text-xs text-slate-300 flex items-start gap-2">
                <Info className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                <p>
                  <strong>Sector Summary:</strong> Public Works (Roads & Bridges) receives the largest share of public money (₹450 Cr), followed by Public Education (₹350 Cr) and Healthcare (₹170 Cr).
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] pt-4 border-t border-slate-800">
                {pieChartData.map((d) => (
                  <div key={d.code} className="flex items-center gap-1.5 truncate">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                    <span className="text-slate-300 truncate">{d.name}: ₹{d.allocated.toFixed(0)} Cr</span>
                  </div>
                ))}
              </div>
            </div>

          </div>


<<<<<<< HEAD
          {/* Department Breakdown Table */}
          <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold font-display text-white">Government Department Financial Ledger</h2>
                <p className="text-xs text-slate-400">Compare allocated outlay versus actual expenditures per sector</p>
              </div>
              <span className="text-xs text-slate-400 font-mono">{departments.length} Sectors Active</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/80 uppercase text-[10px] font-semibold tracking-wider text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Sector / Department</th>
                    <th className="px-4 py-3">Code</th>
                    <th className="px-4 py-3">Allocated Outlay</th>
                    <th className="px-4 py-3">Actual Spent</th>
                    <th className="px-4 py-3">Utilization Rate</th>
                    <th className="px-4 py-3 text-right">Status</th>
=======
      {/* Question 3: "Education spending over the last 5 years" */}
      <div className={`rounded-3xl p-6 border shadow-sm ${
        isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold font-display">{t.chartEducation5Years}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Comparing sector budget allocation growth over the last 5 years (₹ Cr)</p>
          </div>
          <button
            onClick={() => handleDownload('Sector Data')}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-blue-700 dark:text-cyan-400 border border-slate-200 dark:border-slate-700"
          >
            {t.downloadSectorData}
          </button>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={yearTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#1f293d" : "#e2e8f0"} vertical={false} />
              <XAxis dataKey="year" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
              <Tooltip formatter={(val) => `₹${val} Cr`} />
              <Bar dataKey="Education" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Healthcare" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Roads" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Agriculture" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Citizen Spending Records Table */}
      <div className={`rounded-3xl p-6 border shadow-sm space-y-4 ${
        isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold font-display">{t.governmentSpendingRecords}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Simple citizen comparison of allocated money versus actual money spent</p>
          </div>
          <span className="text-xs text-slate-400 font-mono">8 Sectors Listed</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className={`uppercase text-[10px] font-bold tracking-wider border-b ${
              isDark ? 'bg-slate-950 text-slate-400 border-slate-800' : 'bg-slate-50 text-slate-600 border-slate-200'
            }`}>
              <tr>
                <th className="px-4 py-3">Sector</th>
                <th className="px-4 py-3">Allocated Money</th>
                <th className="px-4 py-3">Money Already Spent</th>
                <th className="px-4 py-3">Spending Progress</th>
                <th className="px-4 py-3 text-right">Why Changed?</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {deptList.map((dept) => {
                const percent = Math.round((dept.spent / dept.allocated) * 100);
                return (
                  <tr key={dept.code} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3.5 font-bold flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: dept.color }} />
                      <span>{dept.name}</span>
                    </td>
                    <td className="px-4 py-3.5 font-bold">₹{dept.allocated} Cr</td>
                    <td className="px-4 py-3.5 text-blue-600 dark:text-cyan-400 font-bold">₹{dept.spent} Cr</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-blue-600 dark:bg-cyan-400 h-full rounded-full"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">{percent}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => setWhyModalTopic(dept.name)}
                        className="px-3 py-1 rounded-lg text-[11px] font-bold bg-blue-50 dark:bg-slate-800 text-blue-700 dark:text-cyan-400 border border-blue-200 dark:border-slate-700 hover:bg-blue-100 dark:hover:bg-slate-700 transition-colors"
                      >
                        {t.whyBtn}
                      </button>
                    </td>
>>>>>>> 9f930c6 (Frontend Updates and languages Addition)
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {departments.map((dept, idx) => {
                    const alloc = dept.total_budget_amount;
                    const spent = dept.total_actual_amount;
                    const percent = alloc > 0 ? Math.round((spent / alloc) * 100) : 0;
                    const isOver = spent > alloc * 1.02;

                    return (
                      <tr key={dept.id || dept.code} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-4 py-3.5 font-semibold text-slate-100 flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: deptColors[idx % deptColors.length] }} />
                          <span>{dept.name}</span>
                        </td>
                        <td className="px-4 py-3.5 font-mono text-slate-400">{dept.code}</td>
                        <td className="px-4 py-3.5 font-semibold text-slate-200">{formatCr(alloc)}</td>
                        <td className="px-4 py-3.5 text-cyan-400 font-semibold">{formatCr(spent)}</td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-slate-800 rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${isOver ? 'bg-rose-500' : 'bg-gradient-to-r from-cyan-500 to-indigo-500'}`}
                                style={{ width: `${Math.min(percent, 100)}%` }}
                              />
                            </div>
                            <span className="font-mono text-[11px] text-slate-300">{percent}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                            isOver ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          }`}>
                            {isOver ? 'Over Budget' : 'On Track'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Voice Recognition Modal */}
      <VoiceInputModal
        isOpen={voiceModalOpen}
        onClose={() => setVoiceModalOpen(false)}
        onResult={(text) => handleAskQuestionSubmit(text)}
      />

      <WhyExplanationModal
        isOpen={!!whyModalTopic}
        onClose={() => setWhyModalTopic(null)}
        topicKey={whyModalTopic}
      />

    </div>
  );
}

