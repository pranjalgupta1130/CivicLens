import React from 'react';
import { Eye, ShieldCheck, Heart } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../context/ThemeContext';

export default function Footer() {
  const { t } = useLanguage();
  const { isDark } = useTheme();

  return (
    <footer className={`w-full border-t transition-colors mt-auto ${
      isDark
        ? 'bg-[#090d16] border-slate-800 text-slate-400'
        : 'bg-slate-100 border-slate-200 text-slate-600'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-700 text-white flex items-center justify-center font-bold">
                <Eye className="w-4 h-4" />
              </div>
              <span className="font-display text-lg font-extrabold text-slate-900 dark:text-slate-100">
                {t.brandName}
              </span>
            </div>
            <p className="text-xs leading-relaxed max-w-md text-slate-500 dark:text-slate-400">
              Public Budget Transparency Platform dedicated to empowering Indian citizens, journalists, and auditors with open government budget data and RAG explanations.
            </p>
          </div>

          <div className="space-y-2 text-xs">
            <h4 className="font-bold text-slate-900 dark:text-slate-200 font-display">Government Portals</h4>
            <ul className="space-y-1.5 text-slate-500 dark:text-slate-400">
              <li><a href="https://india.gov.in" target="_blank" rel="noreferrer" className="hover:underline">India.gov.in National Portal</a></li>
              <li><a href="https://cag.gov.in" target="_blank" rel="noreferrer" className="hover:underline">CAG Open Audit Data</a></li>
              <li><a href="https://finmin.nic.in" target="_blank" rel="noreferrer" className="hover:underline">Ministry of Finance</a></li>
              <li><a href="https://mygov.in" target="_blank" rel="noreferrer" className="hover:underline">MyGov Citizen Engagement</a></li>
            </ul>
          </div>

          <div className="space-y-2 text-xs">
            <h4 className="font-bold text-slate-900 dark:text-slate-200 font-display">Transparency Guidelines</h4>
            <ul className="space-y-1.5 text-slate-500 dark:text-slate-400">
              <li>Open Data License v2.0</li>
              <li>Public Ledger Verification</li>
              <li>Accessibility & Multilingual Standard</li>
              <li>Report Fiscal Discrepancies</li>
            </ul>
          </div>

        </div>

        <div className="pt-6 border-t border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>CivicLens Portal • Verified Public Record FY 2026</span>
          </div>

          <div className="text-slate-400 text-[11px]">
            Designed for Citizens • Powered by Open Data & RAG Architecture
          </div>
        </div>
      </div>
    </footer>
  );
}
