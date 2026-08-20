import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  FileText, 
  ShieldCheck, 
  AlertTriangle, 
  Copy, 
  Check, 
  Printer, 
  Edit3, 
  Send, 
  ArrowLeft, 
  Building2, 
  Clock, 
  BookOpen, 
  Sparkles,
  Info,
  CheckCircle2,
  FileCheck
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function RTIGenerator() {
  const { t, selectedLang } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  // Incoming state from AIAlerts investigation CTA
  const incomingData = location.state || {};

  const [mode, setMode] = useState(incomingData.mode || 'RTI'); // 'RTI' or 'CONCERN'
  const [department, setDepartment] = useState(incomingData.department || 'Health');
  const [anomalyId, setAnomalyId] = useState(incomingData.anomalyId || '');
  const [scheme, setScheme] = useState(incomingData.scheme || 'Hospital Infrastructure Expansion');
  const [year, setYear] = useState(incomingData.year || 2026);

  // Applicant Editable Info
  const [applicantName, setApplicantName] = useState('Concerned Citizen');
  const [applicantAddress, setApplicantAddress] = useState('State Capital Region, India');
  const [applicantEmail, setApplicantEmail] = useState('citizen@civiclens.org');
  const [applicantPhone, setApplicantPhone] = useState('+91 98765 43210');

  // RTI API Response State
  const [rtiData, setRtiData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  // Editing & Tracking State
  const [isEditing, setIsEditing] = useState(false);
  const [editableText, setEditableText] = useState('');
  const [trackerStatus, setTrackerStatus] = useState('DRAFT'); // DRAFT, READY_TO_SUBMIT, SUBMITTED, UNDER_REVIEW

  const fetchRTI = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/rti/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          department,
          scheme,
          year: Number(year),
          anomaly_id: anomalyId || undefined,
          applicant_name: applicantName,
          applicant_address: applicantAddress,
          language: selectedLang
        })
      });

      if (!response.ok) {
        throw new Error(`RTI API failed with status ${response.status}`);
      }

      const data = await response.json();
      setRtiData(data);
      setEditableText(data.formatted_rti_text);
      if (data.status === 'SUPPORTED') {
        setTrackerStatus('READY_TO_SUBMIT');
      } else {
        setTrackerStatus('DRAFT');
      }
    } catch (err) {
      console.error("Error generating RTI:", err);
      setError("Failed to connect to backend RTI service. Please check API server.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRTI();
  }, [department, anomalyId, selectedLang]);

  const handleCopyText = () => {
    navigator.clipboard.writeText(editableText || rtiData?.formatted_rti_text || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSimulateSubmit = () => {
    setTrackerStatus('SUBMITTED');
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800">
        <div>
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-1.5 text-xs text-cyan-400 hover:underline font-semibold mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Investigation
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-display text-white">
                {mode === 'RTI' ? t('nav_rti', 'RTI & Petitions') : t('raise_concern', 'Raise a Concern')}
              </h1>
              <p className="text-xs text-slate-400">
                Evidence-backed Right to Information draft based on verified public budget records
              </p>
            </div>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => setMode('RTI')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              mode === 'RTI' ? 'bg-emerald-500 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Right to Information (RTI)
          </button>
          <button
            onClick={() => setMode('CONCERN')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              mode === 'CONCERN' ? 'bg-amber-500 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Citizen Concern
          </button>
        </div>
      </div>

      {/* Demo Status Tracking Stepper */}
      <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-400 uppercase tracking-wider">Petition Lifecycle Status</span>
          <span className="font-mono text-cyan-400 font-bold">{rtiData?.rti_application_id || 'RTI-DRAFT-2026'}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          {[
            { key: 'DRAFT', label: '1. Draft Generated', color: 'bg-slate-800 text-slate-300' },
            { key: 'READY_TO_SUBMIT', label: '2. Ready to Submit', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' },
            { key: 'SUBMITTED', label: '3. Submitted (Demo)', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
            { key: 'UNDER_REVIEW', label: '4. Under Review', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
          ].map((step) => {
            const isActive = trackerStatus === step.key;
            return (
              <div
                key={step.key}
                className={`p-3 rounded-2xl border text-center text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 border-cyan-500 text-white ring-1 ring-cyan-500'
                    : 'bg-slate-900/60 border-slate-800 text-slate-500'
                }`}
              >
                {step.label}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Form Controls & Live RTI Wording */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column: Applicant & Evidence Parameters */}
        <div className="space-y-6">
          
          {/* Target Department / Anomaly Selector */}
          <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4 text-cyan-400" /> Public Authority Details
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Target Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-semibold focus:outline-none focus:border-cyan-500"
                >
                  <option value="Health">Department of Health & Family Welfare</option>
                  <option value="Infrastructure">Department of Public Works & Roads</option>
                  <option value="Education">Department of Elementary Education</option>
                  <option value="Agriculture">Department of Agriculture & Farmers Welfare</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Target Scheme</label>
                <input
                  type="text"
                  value={scheme}
                  onChange={(e) => setScheme(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-semibold focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Applicant Info (Editable) */}
          <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Applicant Details
            </h3>
            <p className="text-[11px] text-slate-400">
              Personal placeholders for petition delivery. Real submission is not performed automatically.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Postal Address</label>
                <input
                  type="text"
                  value={applicantAddress}
                  onChange={(e) => setApplicantAddress(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Evidence Provenance Box (Visually Distinguished) */}
          <div className="glass-panel p-5 rounded-3xl border border-emerald-500/30 bg-emerald-950/10 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" /> Verified Evidence Used
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Every question in this draft is generated exclusively from verified public repository data.
            </p>
            {rtiData?.evidence_sources && rtiData.evidence_sources.length > 0 ? (
              <div className="space-y-1.5 pt-2 border-t border-emerald-900/50">
                {rtiData.evidence_sources.map((src, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] font-mono text-cyan-300">
                    {src}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 italic">
                Source: Official government budget ledgers (FY 2025–2026)
              </div>
            )}
            <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800">
              Note: AI assists in structuring queries; it does not authenticate government document legality.
            </div>
          </div>
        </div>

        {/* Right Column (2 Cols): Live RTI Wording & Controls */}
        <div className="lg:col-span-2 space-y-6">

          {/* Action Button Bar */}
          <div className="glass-panel p-4 rounded-3xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-colors flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditing ? 'View Formatted' : 'Edit Wording'}</span>
              </button>

              <button
                onClick={handleCopyText}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-colors flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Request'}</span>
              </button>

              <button
                onClick={handlePrint}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-colors flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Download / Print</span>
              </button>
            </div>

            {trackerStatus !== 'SUBMITTED' ? (
              <button
                onClick={handleSimulateSubmit}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Petition (Demo)</span>
              </button>
            ) : (
              <div className="px-3 py-1.5 rounded-xl bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-purple-400" />
                <span>Submitted to Department Log</span>
              </div>
            )}
          </div>

          {/* RTI Petition Wording Preview Card */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-slate-950 space-y-6">
            
            {/* Header / Notice */}
            <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-800/50 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-slate-300 space-y-1">
                <span className="font-bold text-white block">AI-Generated Legal Wording Notice:</span>
                <p>
                  The questions below were formulated neutrally without accusatory language based on verified repository evidence. Review carefully before submission.
                </p>
              </div>
            </div>

            {isLoading ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-8 h-8 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin mx-auto" />
                <p className="text-xs text-slate-400">Generating evidence-grounded RTI petition...</p>
              </div>
            ) : error ? (
              <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-800 text-xs text-rose-300">
                {error}
              </div>
            ) : isEditing ? (
              <textarea
                value={editableText}
                onChange={(e) => setEditableText(e.target.value)}
                rows={20}
                className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-4 text-xs font-mono text-slate-200 leading-relaxed focus:outline-none focus:border-cyan-500"
              />
            ) : (
              <div className="space-y-6 font-sans text-xs text-slate-300 leading-relaxed">
                
                {/* Subject */}
                <div className="pb-4 border-b border-slate-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Subject of Request</span>
                  <h2 className="text-base font-bold text-white font-display">
                    {rtiData?.subject || `Application under RTI Act 2005 for records regarding ${department} expenditures`}
                  </h2>
                </div>

                {/* Target Authority */}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Target Public Authority</span>
                  <p className="font-semibold text-cyan-300">{rtiData?.public_authority}</p>
                </div>

                {/* Background Facts */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Verified Background & Facts</span>
                  <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2 text-slate-300">
                    {rtiData?.background_facts?.map((fact, idx) => (
                      <p key={idx}>• {fact}</p>
                    ))}
                  </div>
                </div>

                {/* Information Requested */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Specific Information Requested (Section 6(1))</span>
                  <ol className="list-decimal list-inside space-y-2 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-200">
                    {rtiData?.information_requested?.map((item, idx) => (
                      <li key={idx} className="pl-1"><strong className="text-white">{item}</strong></li>
                    ))}
                  </ol>
                </div>

                {/* Certified Records Requested */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Certified Records Requested</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {rtiData?.documents_requested?.map((doc, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                        <p className="font-semibold text-white">{doc.record_description}</p>
                        <p className="text-[10px] text-slate-500">Period: {doc.period_covered}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Raw Petition Box Preview */}
                <div className="pt-4 border-t border-slate-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-2">Complete Legal Petition Text</span>
                  <pre className="p-4 rounded-2xl bg-slate-900 border border-slate-800 font-mono text-[11px] text-slate-300 whitespace-pre-wrap leading-relaxed overflow-x-auto">
                    {rtiData?.formatted_rti_text}
                  </pre>
                </div>

              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
