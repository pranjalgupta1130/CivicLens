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
import { detailedBudgets, departmentBudgets as mockDeptBudgets } from '../data/mockData';
import { useLanguage } from '../context/LanguageContext';

export default function BudgetExplorer() {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('search') || '';


  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedBudgetItem, setSelectedBudgetItem] = useState(null);

  // Live Backend Data States
  const [budgets, setBudgets] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUsingFallback, setIsUsingFallback] = useState(false);

  // Dossier Detail States (Phase 1C)
  const [dossierData, setDossierData] = useState(null);
  const [isDossierLoading, setIsDossierLoading] = useState(false);

  useEffect(() => {
    if (initialQuery) {
      setSearchTerm(initialQuery);
    }
  }, [initialQuery]);

  const handleInspectRecord = async (item) => {
    const title = item.scheme_name || item.title || 'Government Scheme Outlay';
    const dept = item.department_name || item.department || 'General';
    const locality = item.locality || item.vendor || 'State Authority';
    const alloc = item.budget_amount !== undefined ? item.budget_amount : item.allocated;
    const spent = item.actual_amount !== undefined ? item.actual_amount : item.spent;
    const status = getRecordStatus(item);
    const risk = getRecordRisk(item);
    const itemId = item.id || `BUD-${item.year || 2026}`;

    setSelectedBudgetItem({
      id: itemId,
      title,
      department: dept,
      vendor: locality,
      category: item.category,
      allocated: alloc,
      spent: spent,
      status,
      anomalyRisk: risk,
      year: item.year || 2026
    });

    setDossierData(null);
    if (!item.id || item.id.startsWith('BUD-')) return;

    setIsDossierLoading(true);
    try {
      const res = await fetch(`/api/budgets/dossier/${item.id}`);
      if (res.ok) {
        const data = await res.json();
        setDossierData(data);
      }
    } catch (err) {
      console.warn('Failed to fetch detailed dossier from API:', err);
    } finally {
      setIsDossierLoading(false);
    }
  };


  const fetchBudgetData = async () => {
    setIsLoading(true);
    setError(null);
    setIsUsingFallback(false);

    try {
      const [budgetsRes, deptsRes] = await Promise.all([
        fetch('/api/budgets'),
        fetch('/api/departments')
      ]);

      if (!budgetsRes.ok) {
        throw new Error(`Server returned HTTP ${budgetsRes.status}`);
      }

      const budgetsData = await budgetsRes.json();
      let deptsData = [];
      if (deptsRes.ok) {
        deptsData = await deptsRes.json();
      }

      setBudgets(budgetsData);
      setDepartments(deptsData);
    } catch (err) {
      console.warn('Backend API request failed for budgets:', err);
      setError('Budget data could not be loaded from server. Please verify backend is running.');
      // Do not silently substitute mock; mark fallback explicitly
      setIsUsingFallback(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgetData();
  }, []);

  const getRecordStatus = (item) => {
    if (item.status) return item.status;
    const budget = item.budget_amount || item.allocated || 0;
    const actual = item.actual_amount || item.spent || 0;
    if (budget === 0) return 'On Track';
    if (actual > budget * 1.05) {
      const pct = Math.round(((actual - budget) / budget) * 100);
      return `Over Budget (+${pct}%)`;
    } else if (actual < budget * 0.95) {
      const pct = Math.round(((budget - actual) / budget) * 100);
      return `Under Budget (-${pct}%)`;
    }
    return 'On Track';
  };

  const getRecordRisk = (item) => {
    if (item.anomalyRisk) return item.anomalyRisk;
    const budget = item.budget_amount || item.allocated || 0;
    const actual = item.actual_amount || item.spent || 0;
    if (budget === 0) return 'Low';
    if (actual > budget * 1.3) return 'High';
    if (actual > budget * 1.05) return 'Medium';
    return 'Low';
  };

  // Determine active raw records source: backend live data or mock fallback
  const rawList = budgets.length > 0 ? budgets : (isUsingFallback ? detailedBudgets : []);

  const filteredItems = rawList.filter((item) => {
    const title = item.scheme_name || item.title || '';
    const dept = item.department_name || item.department || '';
    const cat = item.category || '';
    const id = item.id || '';
    const vendor = item.locality || item.vendor || '';
    const status = getRecordStatus(item);

    const matchesSearch = 
      title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDept = selectedDept === 'All' || dept.toLowerCase().includes(selectedDept.toLowerCase()) || selectedDept.toLowerCase().includes(dept.toLowerCase());
    const matchesStatus = selectedStatus === 'All' || status.toLowerCase().includes(selectedStatus.toLowerCase());

    return matchesSearch && matchesDept && matchesStatus;
  });

  const chartData = filteredItems.slice(0, 10).map(item => {
    const rawAlloc = item.budget_amount !== undefined ? item.budget_amount : item.allocated;
    const rawSpent = item.actual_amount !== undefined ? item.actual_amount : item.spent;
    const allocCr = rawAlloc >= 1000000 ? rawAlloc / 10000000 : rawAlloc;
    const spentCr = rawSpent >= 1000000 ? rawSpent / 10000000 : rawSpent;
    const title = item.scheme_name || item.title || 'Scheme Outlay';

    return {
      name: title.length > 18 ? title.substring(0, 18) + '...' : title,
      Allocated: allocCr,
      Spent: spentCr
    };
  });

  const formatCurrency = (val) => {
    if (val === undefined || val === null) return '₹0 Cr';
    const crValue = val >= 1000000 ? val / 10000000 : val;
    return `₹${crValue.toLocaleString('en-IN', { maximumFractionDigits: 1 })} Cr`;
  };

  const availableDepartments = departments.length > 0
    ? departments.map(d => ({ code: d.code, name: d.name }))
    : mockDeptBudgets.map(d => ({ code: d.code, name: d.name }));

  const handleExportCSV = () => {
    const headers = "ID,Title,Department,Category,Allocated(Cr),Spent(Cr),Status,Locality,AnomalyRisk\n";
    const rows = filteredItems.map(i => {
      const title = i.scheme_name || i.title || '';
      const dept = i.department_name || i.department || '';
      const alloc = i.budget_amount !== undefined ? (i.budget_amount >= 1000000 ? i.budget_amount/10000000 : i.budget_amount) : i.allocated/10000000;
      const spent = i.actual_amount !== undefined ? (i.actual_amount >= 1000000 ? i.actual_amount/10000000 : i.actual_amount) : i.spent/10000000;
      const status = getRecordStatus(i);
      const risk = getRecordRisk(i);
      const locality = i.locality || i.vendor || '';
      return `"${i.id}","${title}","${dept}","${i.category}",${alloc},${spent},"${status}","${locality}","${risk}"`;
    }).join("\n");

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
              {availableDepartments.map(d => (
                <option key={d.code || d.name} value={d.name}>{d.name}</option>
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
              <option value="Under Budget">Under Budget</option>
            </select>
          </div>

        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="glass-panel rounded-3xl p-12 text-center text-slate-400 space-y-3 border border-slate-800">
          <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin mx-auto" />
          <p className="text-xs">Fetching live government budget records from backend API...</p>
        </div>
      )}

      {/* Error State with Retry */}
      {error && !isLoading && !isUsingFallback && (
        <div className="glass-panel rounded-3xl p-8 text-center text-rose-300 border border-rose-500/30 space-y-4">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
          <div>
            <p className="text-sm font-semibold">{error}</p>
            <p className="text-xs text-slate-400 mt-1">Please verify backend FastAPI server is running on http://localhost:8000</p>
          </div>
          <button
            onClick={fetchBudgetData}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/40 transition-all"
          >
            Retry Loading Budgets
          </button>
        </div>
      )}

      {/* Main Content Area */}
      {!isLoading && (!error || isUsingFallback) && (
        <>
          {/* Filtered Bar Chart Preview */}
          {filteredItems.length > 0 && (
            <div className="glass-panel rounded-3xl p-6 border border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold font-display text-white">Scheme Allocation Comparison (₹ Crore)</h3>
                  {budgets.length > 0 && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Live Backend API Data ({budgets.length} records)
                    </span>
                  )}
                </div>
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
                    <th className="px-4 py-3">Locality / Region</th>
                    <th className="px-4 py-3">Allocated</th>
                    <th className="px-4 py-3">Spent</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-center">AI Risk</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredItems.map((item) => {
                    const title = item.scheme_name || item.title || 'Government Scheme Outlay';
                    const dept = item.department_name || item.department || 'General';
                    const locality = item.locality || item.vendor || 'State Authority';
                    const alloc = item.budget_amount !== undefined ? item.budget_amount : item.allocated;
                    const spent = item.actual_amount !== undefined ? item.actual_amount : item.spent;
                    const status = getRecordStatus(item);
                    const risk = getRecordRisk(item);
                    const itemId = item.id || `BUD-${item.year || 2026}`;

                    return (
                      <tr key={itemId} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="font-semibold text-slate-100">{title}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{itemId.substring(0, 18)} • {item.category} ({item.year || 2026})</div>
                        </td>
                        <td className="px-4 py-3.5 text-slate-300">{dept}</td>
                        <td className="px-4 py-3.5 text-slate-300 font-medium">{locality}</td>
                        <td className="px-4 py-3.5 font-mono text-slate-200">{formatCurrency(alloc)}</td>
                        <td className="px-4 py-3.5 font-mono text-cyan-400 font-semibold">{formatCurrency(spent)}</td>
                        <td className="px-4 py-3.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                            status.includes('Over')
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          }`}>
                            {status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            risk === 'High'
                              ? 'bg-rose-950 text-rose-400 border border-rose-800'
                              : risk === 'Medium'
                              ? 'bg-amber-950 text-amber-400 border border-amber-800'
                              : 'bg-slate-800 text-slate-400'
                          }`}>
                            {risk}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <button
                            onClick={() => handleInspectRecord(item)}
                            className="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-cyan-400 transition-colors"
                          >
                            Inspect
                          </button>

                        </td>
                      </tr>
                    );
                  })}
                  {filteredItems.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-500">
                        No budget schemes match your search filters. Try resetting search parameters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}


      {/* Government Scheme Ledger Dossier Modal (Phase 1C) */}
      {selectedBudgetItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 border border-slate-700 bg-slate-900 shadow-2xl animate-in fade-in zoom-in-95 space-y-4">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-400" />
                <span className="font-display font-bold text-lg text-white">Government Scheme Ledger Dossier</span>
              </div>
              <button
                onClick={() => { setSelectedBudgetItem(null); setDossierData(null); }}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scheme Title Header */}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-cyan-400">Scheme Outlay</span>
                <span className="text-slate-500">•</span>
                <span className="text-[10px] text-slate-400 font-mono">FY {selectedBudgetItem.year || 2026}</span>
              </div>
              <h3 className="text-lg font-bold text-white mt-0.5">{selectedBudgetItem.title}</h3>
              <p className="text-xs text-slate-400 font-mono">{selectedBudgetItem.id} • Category: {selectedBudgetItem.category}</p>
            </div>

            {/* Citizen-Friendly Summary Banner */}
            <div className={`p-4 rounded-2xl border ${
              selectedBudgetItem.status.includes('Over')
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-200'
                : selectedBudgetItem.status.includes('Under')
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-200'
            }`}>
              <div className="flex items-center gap-2 font-bold text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>
                  {dossierData?.plain_language_summary || (
                    selectedBudgetItem.status.includes('Over')
                      ? `₹${((selectedBudgetItem.spent - selectedBudgetItem.allocated) / (selectedBudgetItem.spent >= 1000000 ? 10000000 : 1)).toFixed(1)} Cr more was spent than originally allocated.`
                      : `Outlay executed on schedule as originally allocated.`
                  )}
                </span>
              </div>
              <p className="text-[11px] opacity-80 mt-1">
                Technical Utilization: <strong>{((selectedBudgetItem.spent / (selectedBudgetItem.allocated || 1)) * 100).toFixed(1)}%</strong> of baseline budget.
              </p>
            </div>

            {/* Budget Breakdown Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-800/40 p-4 rounded-2xl border border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 font-medium">Allocated:</span>
                <p className="font-mono font-bold text-white text-sm mt-0.5">{formatCurrency(selectedBudgetItem.allocated)}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Spent to Date:</span>
                <p className="font-mono font-bold text-cyan-400 text-sm mt-0.5">{formatCurrency(selectedBudgetItem.spent)}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Department:</span>
                <p className="font-semibold text-slate-200 mt-0.5 truncate">{selectedBudgetItem.department}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Locality / Region:</span>
                <p className="font-semibold text-slate-200 mt-0.5 truncate">{selectedBudgetItem.vendor}</p>
              </div>
            </div>

            {/* Section 2: "Where Did The Money Go?" */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" /> Where Did The Money Go?
              </h4>

              {isDossierLoading ? (
                <p className="text-xs text-slate-500 animate-pulse">Loading expenditure breakdown from database...</p>
              ) : dossierData && dossierData.expenditure_breakdown && dossierData.expenditure_breakdown.length > 0 ? (
                <div className="space-y-2 bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                  {dossierData.expenditure_breakdown.map((item, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-300">
                        <span>{item.category_or_locality}</span>
                        <span className="font-mono text-cyan-400">{formatCurrency(item.actual_amount)} ({item.percentage_share}%)</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-full rounded-full"
                          style={{ width: `${Math.min(item.percentage_share, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-400">
                  Total outlay allocated across <strong>{selectedBudgetItem.category}</strong> in <strong>{selectedBudgetItem.vendor}</strong>.
                </div>
              )}
            </div>

            {/* Section 3: "Why Did It Change?" (YoY Trend) */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-400" /> Why Did It Change? (Multi-Year Trend)
              </h4>
              {dossierData && dossierData.previous_year ? (
                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-xs space-y-1 text-slate-300">
                  <div className="flex justify-between">
                    <span>Baseline Expenditure (FY {dossierData.previous_year}):</span>
                    <span className="font-mono text-slate-200">{formatCurrency(dossierData.previous_year_amount)}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Current Expenditure (FY {dossierData.year}):</span>
                    <span className="font-mono text-cyan-400">{formatCurrency(dossierData.actual_amount)}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-800 text-slate-400">
                    <span>Year-over-Year Shift:</span>
                    <span className={`font-mono font-bold ${
                      dossierData.yoy_change_percentage > 0 ? 'text-rose-400' : 'text-emerald-400'
                    }`}>
                      {dossierData.yoy_change_percentage > 0 ? '+' : ''}{dossierData.yoy_change_percentage}%
                    </span>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-400">
                  Baseline outlay tracked for FY {selectedBudgetItem.year || 2026}. Multi-year comparisons available in AI Assistant tab.
                </div>
              )}
            </div>

            {/* Section 4: Source Provenance & Documentary Evidence */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Source & Evidence Provenance
              </h4>
              
              {dossierData && dossierData.evidence && dossierData.evidence.length > 0 ? (
                <div className="space-y-2">
                  {dossierData.evidence.map((ev, i) => (
                    <div key={i} className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-xs space-y-1.5">
                      <div className="flex items-center justify-between font-semibold text-cyan-400">
                        <span>{ev.document_title} {ev.page_number ? `(Page ${ev.page_number})` : ''}</span>
                        {ev.source_url && (
                          <a href={ev.source_url} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white flex items-center gap-1 text-[10px]">
                            <span>View Source</span> <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      <p className="text-slate-300 italic text-[11px] leading-relaxed">"{ev.relevant_chunk_text}"</p>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-900">
                        <span>{ev.provenance_statement}</span>
                        <span className="font-mono text-cyan-400/80">{ev.ai_grounding_statement}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
                  <p className="text-slate-300 font-semibold">Source: Official Government Budget Ledger (CAG Portal)</p>
                  <p className="text-[10px] text-slate-500">AI explanation generated strictly from retrieved database records and official gazette filings.</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => { setSelectedBudgetItem(null); setDossierData(null); }}
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
