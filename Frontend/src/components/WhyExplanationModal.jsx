import React, { useState, useEffect } from 'react';
import { HelpCircle, X, CheckCircle2, Database, ArrowRight, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { ragService } from '../services/ragService';

export default function WhyExplanationModal({ topicKey, isOpen, onClose, customTitle, customValue }) {
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      ragService.getWhyExplanation(topicKey).then((res) => {
        setData(res);
        setLoading(false);
      });
    }
  }, [isOpen, topicKey]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={`w-full max-w-lg rounded-3xl p-6 shadow-2xl border transition-all animate-in fade-in zoom-in-95 ${
        isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-cyan-400">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base font-display">
                {customTitle || data?.title || t.whyDidThisChange}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Simple Citizen Explanation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="py-5 space-y-4">
          {customValue && (
            <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-slate-800/60 border border-blue-100 dark:border-slate-700 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Amount / Metric:</span>
              <span className="font-display font-extrabold text-lg text-blue-700 dark:text-cyan-400">{customValue}</span>
            </div>
          )}

          {loading ? (
            <div className="py-8 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span>Fetching public explanation from RAG engine...</span>
            </div>
          ) : (
            <>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {data?.explanation}
              </div>

              {data?.districtDetails && (
                <div className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>{data.districtDetails}</span>
                </div>
              )}

              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                <span className="font-semibold flex items-center gap-1">
                  <Database className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                  {t.sourceGovtData}:
                </span>
                <span className="font-mono text-blue-700 dark:text-cyan-300 truncate max-w-[240px]">
                  {data?.source}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-colors"
          >
            {t.closeBtn}
          </button>
        </div>
      </div>
    </div>
  );
}
