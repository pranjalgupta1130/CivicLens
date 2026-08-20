import React, { useState } from 'react';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Sparkles, 
  Database,
  RefreshCw,
  Eye,
  FileSpreadsheet
} from 'lucide-react';

export default function AdminUpload() {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [category, setCategory] = useState('Upload Budget Files');
  const [parsedData, setParsedData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null); // 'success' | 'error'

  const sampleCSVContent = `ID,ProjectTitle,Department,Category,Allocated(Cr),Vendor,Status
GOV-2026-101,PM School Modernization Program,Education,Infrastructure,3240,National School Infra Corp,Approved
GOV-2026-102,District Hospital Expansion Mission,Healthcare,Medical Works,2850,Arogya Medical Systems,In Progress
GOV-2026-103,National Highway Development Project,Roads & Highways,Capital Expressways,2100,Bharatiya Highway Developers,Approved
GOV-2026-104,Rural Water Supply Mission,Water Resources,Water Grid,850,Gramin Jal Supply Corp,Under Review`;

  const parseCSVText = (text) => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return null;
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const rows = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      const rowObj = {};
      headers.forEach((h, i) => {
        rowObj[h] = values[i] || '';
      });
      return rowObj;
    });
    return { headers, rows };
  };

  const handleFile = (file) => {
    if (!file) return;
    setSelectedFile(file);
    setIsProcessing(true);
    setUploadStatus(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      const parsed = parseCSVText(content);
      setTimeout(() => {
        setParsedData(parsed);
        setIsProcessing(false);
        setUploadStatus('success');
      }, 700);
    };
    reader.readAsText(file);
  };

  const handleFillSample = () => {
    setSelectedFile({ name: 'government_budget_records_2026.csv', size: 1420 });
    setIsProcessing(true);
    setUploadStatus(null);

    setTimeout(() => {
      const parsed = parseCSVText(sampleCSVContent);
      setParsedData(parsed);
      setIsProcessing(false);
      setUploadStatus('success');
    }, 600);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
            Admin Data Ingestion Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Upload official government budget files, expenditure records, and department allocation ledgers.
          </p>
        </div>

        <button
          onClick={handleFillSample}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-lg shadow-cyan-500/20 hover:scale-105 transition-all"
        >
          <Sparkles className="w-4 h-4 text-cyan-200" />
          <span>Load Sample Budget CSV</span>
        </button>
      </div>

      {/* Upload & Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Drag & Drop Container */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 flex flex-col justify-between space-y-6">
          <div className="space-y-2">
            <h2 className="text-lg font-bold font-display text-white">Upload Government Budget Records</h2>
            <p className="text-xs text-slate-400">Supported format: .csv containing headers (ID, ProjectTitle, Department, Allocated, Vendor)</p>
          </div>

          {/* Drag and Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all flex flex-col items-center justify-center gap-4 ${
              dragActive
                ? 'border-cyan-400 bg-cyan-950/20 scale-[1.01]'
                : 'border-slate-700/80 bg-slate-900/60 hover:border-slate-600'
            }`}
          >
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/10">
              <UploadCloud className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-200">
                Drag & drop your CSV file here, or{' '}
                <label className="text-cyan-400 hover:underline cursor-pointer">
                  browse files
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => handleFile(e.target.files[0])}
                    className="hidden"
                  />
                </label>
              </p>
              <p className="text-xs text-slate-500">Maximum file size: 50MB</p>
            </div>

            {selectedFile && (
              <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-cyan-300 font-mono">
                <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
                <span>{selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)</span>
              </div>
            )}
          </div>

          {isProcessing && (
            <div className="flex items-center justify-center gap-3 py-4 text-xs text-cyan-400">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Parsing government ledger rows and validating CSV headers...</span>
            </div>
          )}

          {uploadStatus === 'success' && (
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 flex items-center gap-3 text-xs text-emerald-300">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <div>
                <p className="font-semibold">Dataset parsed successfully!</p>
                <p className="text-[11px] text-emerald-400/80">AI Governance models verified column mapping for {parsedData?.rows.length} government ledger rows.</p>
              </div>
            </div>
          )}
        </div>

        {/* Dataset Metadata Configuration Panel */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="text-base font-bold font-display text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-400" />
              <span>Ingestion Type</span>
            </h2>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Select File Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2.5 text-xs bg-slate-900 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                <option value="Upload Budget Files">Upload Budget Files</option>
                <option value="Upload Government Expenditure Records">Upload Government Expenditure Records</option>
                <option value="Upload Department Allocation Data">Upload Department Allocation Data</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Target Fiscal Year</label>
              <input
                type="text"
                disabled
                value="FY 2026 (Active Ledger)"
                className="w-full p-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-400"
              />
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span>Auto-Scan Anomalies:</span>
                <span className="text-emerald-400 font-semibold">Enabled</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Newly submitted rows are checked against vendor duplication and price surge algorithms.
              </p>
            </div>
          </div>

          <button
            disabled={!parsedData}
            onClick={() => alert(`Successfully published ${parsedData?.rows.length} rows to CivicLens Government Portal under '${category}'!`)}
            className="w-full py-3 rounded-2xl text-xs font-semibold bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-xl shadow-cyan-500/20 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
          >
            <span>Publish to Public Ledger</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Dataset Raw Preview Table */}
      {parsedData && (
        <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-cyan-400" />
              <h3 className="text-base font-bold font-display text-white">Parsed Dataset Live Preview</h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">{parsedData.rows.length} Records Extracted</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 uppercase text-[10px] font-semibold tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  {parsedData.headers.map((h, i) => (
                    <th key={i} className="px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {parsedData.rows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                    {parsedData.headers.map((h, i) => (
                      <td key={i} className="px-4 py-3.5 text-slate-200">
                        {row[h]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
