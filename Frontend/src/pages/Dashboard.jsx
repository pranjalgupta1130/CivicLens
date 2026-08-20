import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  HeartPulse,
  Route,
  Sprout,
  TrendingUp, 
  AlertTriangle, 
  Layers, 
  Download, 
  Filter, 
  Calendar,
  CheckCircle2
} from 'lucide-react';
import StatCard from '../components/StatCard';
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
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel p-3 rounded-xl border border-slate-700 text-xs shadow-xl">
          <p className="font-bold text-slate-200 mb-1">{label} Fiscal Period</p>
          {payload.map((entry, index) => (
            <div key={`item-${index}`} className="flex items-center gap-2 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="capitalize">{entry.name}:</span>
              <span className="font-bold text-white">₹{entry.value} Cr</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };


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


  return (
    <div className="space-y-8 pb-12">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
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
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 glass-panel px-3 py-2 rounded-xl text-xs text-slate-300 border border-slate-700">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <span>Fiscal Year:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
            >
              <option value="2026" className="bg-slate-900">FY 2026</option>
              <option value="2025" className="bg-slate-900">FY 2025</option>
              <option value="2024" className="bg-slate-900">FY 2024</option>
            </select>
          </div>

          <button 
            onClick={() => alert("Exporting Executive Financial Ledger Report (CSV)...")}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Export Report</span>
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="glass-panel rounded-3xl p-12 text-center text-slate-400 space-y-3 border border-slate-800">
          <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin mx-auto" />
          <p className="text-xs">Fetching live civic financial metrics from backend server...</p>
        </div>
      )}

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
              </div>
            </div>

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

    </div>
  );
}

