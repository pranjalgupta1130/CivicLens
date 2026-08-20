import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Download, 
  ExternalLink, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Building2, 
  X,
  Layers,
  FileText
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { detailedBudgets, departmentBudgets } from '../data/mockData';

export default function BudgetExplorer() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('search') || '';

  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedBudgetItem, setSelectedBudgetItem] = useState(null);

  useEffect(() => {
    if (initialQuery) {
      setSearchTerm(initialQuery);
    }
  }, [initialQuery]);

  const filteredItems = detailedBudgets.filter((item) => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDept = selectedDept === 'All' || item.department === selectedDept;
    const matchesStatus = selectedStatus === 'All' || item.status.includes(selectedStatus);

    return matchesSearch && matchesDept && matchesStatus;
  });

  const chartData = filteredItems.map(item => ({
    name: item.title.length > 18 ? item.title.substring(0, 18) + '...' : item.title,
    Allocated: item.allocated / 10000000, // ₹ Crore
    Spent: item.spent / 10000000
  }));

  const formatCurrency = (val) => {
    const crValue = val / 10000000;
    return `₹${crValue.toLocaleString('en-IN', { maximumFractionDigits: 1 })} Cr`;
  };

  const handleExportCSV = () => {
    const headers = "ID,Title,Department,Category,Allocated(Cr),Spent(Cr),Status,Vendor,AnomalyRisk\n";
    const rows = filteredItems.map(i => `"${i.id}","${i.title}","${i.department}","${i.category}",${i.allocated/10000000},${i.spent/10000000},"${i.status}","${i.vendor}","${i.anomalyRisk}"`).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CivicLens_Budget_Export_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
            Line-Item Budget Explorer
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Audit capital schemes, government contractor tenders, and spending line-items.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-lg shadow-cyan-500/20 hover:scale-105 transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Export Filtered CSV</span>
        </button>
      </div>

      {/* Filter Controls Bar */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          
          {/* Search Input */}
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search schemes, vendors, project names..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-900 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-3 top-2.5 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Department Filter */}
          <div className="relative">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full py-2 px-3 text-xs bg-slate-900 border border-slate-700/80 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="All">All Departments</option>
              {departmentBudgets.map(d => (
                <option key={d.code} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full py-2 px-3 text-xs bg-slate-900 border border-slate-700/80 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="All">All Execution Statuses</option>
              <option value="On Track">On Track</option>
              <option value="Over Budget">Over Budget</option>
              <option value="Completed">Completed</option>
              <option value="Under Budget">Under Budget</option>
            </select>
          </div>

        </div>
      </div>

      {/* Filtered Bar Chart Preview */}
      {filteredItems.length > 0 && (
        <div className="glass-panel rounded-3xl p-6 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold font-display text-white">Scheme Allocation Comparison (₹ Crore)</h3>
            <span className="text-xs text-slate-400">Showing {filteredItems.length} matching government schemes</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} angle={-15} textAnchor="end" />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip formatter={(val) => `₹${val} Cr`} />
                <Bar dataKey="Allocated" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Spent" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Budget Table */}
      <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 uppercase text-[10px] font-semibold tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Scheme Title & ID</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Vendor / Contractor</th>
                <th className="px-4 py-3">Allocated</th>
                <th className="px-4 py-3">Spent</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-center">AI Risk</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="font-semibold text-slate-100">{item.title}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{item.id} • {item.category}</div>
                  </td>
                  <td className="px-4 py-3.5 text-slate-300">{item.department}</td>
                  <td className="px-4 py-3.5 text-slate-300 font-medium">{item.vendor}</td>
                  <td className="px-4 py-3.5 font-mono text-slate-200">{formatCurrency(item.allocated)}</td>
                  <td className="px-4 py-3.5 font-mono text-cyan-400 font-semibold">{formatCurrency(item.spent)}</td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                      item.status.includes('Over')
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      item.anomalyRisk === 'High'
                        ? 'bg-rose-950 text-rose-400 border border-rose-800'
                        : item.anomalyRisk === 'Medium'
                        ? 'bg-amber-950 text-amber-400 border border-amber-800'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {item.anomalyRisk}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <button
                      onClick={() => setSelectedBudgetItem(item)}
                      className="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-cyan-400 transition-colors"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No schemes match your search filters. Try resetting search parameters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Contract Detail Modal */}
      {selectedBudgetItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-2xl rounded-3xl p-6 border border-slate-700 bg-slate-900 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-400" />
                <span className="font-display font-bold text-lg text-white">Government Scheme Ledger Dossier</span>
              </div>
              <button
                onClick={() => setSelectedBudgetItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs text-slate-300">
              <div>
                <span className="text-[10px] font-semibold uppercase text-slate-400">Scheme Name</span>
                <h3 className="text-base font-bold text-white">{selectedBudgetItem.title}</h3>
                <p className="text-slate-400 font-mono">{selectedBudgetItem.id} • Category: {selectedBudgetItem.category}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-slate-800/40 p-4 rounded-2xl border border-slate-800">
                <div>
                  <span className="text-slate-400">Department:</span>
                  <p className="font-semibold text-slate-200 mt-0.5">{selectedBudgetItem.department}</p>
                </div>
                <div>
                  <span className="text-slate-400">Awarded Contractor:</span>
                  <p className="font-semibold text-cyan-400 mt-0.5">{selectedBudgetItem.vendor}</p>
                </div>
                <div>
                  <span className="text-slate-400">Total Outlay Allocation:</span>
                  <p className="font-mono font-bold text-white text-sm mt-0.5">{formatCurrency(selectedBudgetItem.allocated)}</p>
                </div>
                <div>
                  <span className="text-slate-400">Current Expenditure:</span>
                  <p className="font-mono font-bold text-cyan-400 text-sm mt-0.5">{formatCurrency(selectedBudgetItem.spent)}</p>
                </div>
              </div>

              <div className="space-y-2">
                <span className="font-semibold text-slate-200">AI Risk Assessment Audit:</span>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 leading-relaxed">
                  Ledger hash verified on CAG open transparency portal. Anomaly risk rated <strong className="text-cyan-400">{selectedBudgetItem.anomalyRisk}</strong> based on milestone payment schedules and historical public sector benchmarks.
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
              <button
                onClick={() => setSelectedBudgetItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
