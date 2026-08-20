import React, { useState } from 'react';
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
import { civicKPIs, monthlySpendingData, departmentBudgets, dashboardKPICards } from '../data/mockData';

export default function Dashboard() {
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('All');

  const iconsMap = [Building2, HeartPulse, Route, Sprout];

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

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
            Civic Financial Dashboard
          </h1>
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
            onClick={() => alert("Downloading FY 2026 Executive Financial Report (PDF)...")}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Export Report</span>
          </button>
        </div>
      </div>

      {/* Specified KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {dashboardKPICards.map((card, idx) => {
          const Icon = iconsMap[idx];
          return (
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
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Monthly Spending vs Budget (Area Chart) */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-6 border border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h2 className="text-base font-bold font-display text-white">Monthly Expenditure Trajectory (₹ Crore)</h2>
              <p className="text-xs text-slate-400">Comparing actual spending vs monthly budget target across all sectors</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1 text-cyan-400">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" /> Spent
              </span>
              <span className="flex items-center gap-1 text-indigo-400">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" /> Budget Target
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlySpendingData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="spent" name="Spent" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorSpent)" />
                <Area type="monotone" dataKey="budget" name="Budget" stroke="#6366f1" strokeWidth={2} strokeDasharray="4 4" fillOpacity={1} fill="url(#colorBudget)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Renamed: Budget Allocation by Sector (Pie Chart) */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-800 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold font-display text-white mb-1">Budget Allocation by Sector</h2>
            <p className="text-xs text-slate-400 mb-4">Distribution across key government sectors</p>
            
            <div className="h-56 w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={departmentBudgets}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="allocated"
                  >
                    {departmentBudgets.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#0b0f19" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => `₹${val} Cr`} />
                </PieChart>
              </ResponsiveContainer>

              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-[10px] uppercase font-semibold text-slate-400">Total Outlay</span>
                <span className="font-display font-bold text-white text-base">₹12,440 Cr</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] pt-4 border-t border-slate-800">
            {departmentBudgets.map((d) => (
              <div key={d.code} className="flex items-center gap-1.5 truncate">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                <span className="text-slate-300 truncate">{d.name}: ₹{d.allocated} Cr</span>
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
          <span className="text-xs text-slate-400 font-mono">8 Sectors Listed</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 uppercase text-[10px] font-semibold tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Sector / Department</th>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Allocated (₹ Cr)</th>
                <th className="px-4 py-3">Spent (₹ Cr)</th>
                <th className="px-4 py-3">Utilization Rate</th>
                <th className="px-4 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {departmentBudgets.map((dept) => {
                const percent = Math.round((dept.spent / dept.allocated) * 100);
                return (
                  <tr key={dept.code} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3.5 font-semibold text-slate-100 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: dept.color }} />
                      <span>{dept.name}</span>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-400">{dept.code}</td>
                    <td className="px-4 py-3.5 font-semibold text-slate-200">₹{dept.allocated} Cr</td>
                    <td className="px-4 py-3.5 text-cyan-400 font-semibold">₹{dept.spent} Cr</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-full rounded-full"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="font-mono text-[11px] text-slate-300">{percent}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Active
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
