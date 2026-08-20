import React, { useState } from 'react';
import { HelpCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import WhyExplanationModal from './WhyExplanationModal';

export default function StatCard({ title, value, change, changeType, icon: Icon, description, topicKey }) {
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const [whyOpen, setWhyOpen] = useState(false);

  const isIncrease = changeType === 'increase';

  return (
    <>
      <div className={`rounded-2xl p-5 border transition-all shadow-sm ${
        isDark
          ? 'bg-slate-900/90 border-slate-800 text-slate-100'
          : 'bg-white border-slate-200 text-slate-900 hover:border-slate-300'
      }`}>
        <div className="flex items-start justify-between gap-3 mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {title}
          </span>
          {Icon && (
            <div className={`p-2.5 rounded-xl ${
              isDark ? 'bg-slate-800 text-cyan-400 border border-slate-700' : 'bg-blue-50 text-blue-700 border border-blue-100'
            }`}>
              <Icon className="w-5 h-5" />
            </div>
          )}
        </div>

        <div className="space-y-1 mb-3">
          <div className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">
            {value}
          </div>
          {description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">{description}</p>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          {change ? (
            <span className={`inline-flex items-center gap-1 font-semibold ${
              isIncrease ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
            }`}>
              {isIncrease ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              <span>{change}</span>
            </span>
          ) : (
            <span className="text-slate-400">FY 2026</span>
          )}

          <button
            onClick={() => setWhyOpen(true)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-50 dark:bg-slate-800 text-blue-700 dark:text-cyan-400 border border-blue-200 dark:border-slate-700 hover:bg-blue-100 dark:hover:bg-slate-700 transition-colors"
          >
            <span>{t.whyBtn}</span>
            <HelpCircle className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <WhyExplanationModal
        isOpen={whyOpen}
        onClose={() => setWhyOpen(false)}
        topicKey={topicKey || title}
        customTitle={title}
        customValue={value}
      />
    </>
  );
}
