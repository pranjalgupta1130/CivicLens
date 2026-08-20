import React, { useState } from 'react';
import { Map, Info, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../context/ThemeContext';

const districtMapData = [
  { id: 'pune', name: 'Pune', state: 'Maharashtra', budget: '₹2,430 Cr', spent: '₹2,201 Cr', remaining: '₹229 Cr', status: 'Moderate', color: 'bg-amber-500', alertCount: 7 },
  { id: 'mumbai', name: 'Mumbai', state: 'Maharashtra', budget: '₹4,850 Cr', spent: '₹3,910 Cr', remaining: '₹940 Cr', status: 'High Risk', color: 'bg-rose-500', alertCount: 12 },
  { id: 'nagpur', name: 'Nagpur', state: 'Maharashtra', budget: '₹1,920 Cr', spent: '₹1,540 Cr', remaining: '₹380 Cr', status: 'Normal', color: 'bg-emerald-500', alertCount: 3 },
  { id: 'thane', name: 'Thane', state: 'Maharashtra', budget: '₹2,100 Cr', spent: '₹1,780 Cr', remaining: '₹320 Cr', status: 'Moderate', color: 'bg-amber-500', alertCount: 5 },
  { id: 'nashik', name: 'Nashik', state: 'Maharashtra', budget: '₹1,450 Cr', spent: '₹1,120 Cr', remaining: '₹330 Cr', status: 'Normal', color: 'bg-emerald-500', alertCount: 2 },
  { id: 'delhi', name: 'New Delhi', state: 'Delhi', budget: '₹3,500 Cr', spent: '₹2,950 Cr', remaining: '₹550 Cr', status: 'Moderate', color: 'bg-amber-500', alertCount: 6 },
  { id: 'bengaluru', name: 'Bengaluru', state: 'Karnataka', budget: '₹4,200 Cr', spent: '₹3,400 Cr', remaining: '₹800 Cr', status: 'High Risk', color: 'bg-rose-500', alertCount: 9 }
];

export default function GeographicMap() {
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const [activeDistrict, setActiveDistrict] = useState(districtMapData[0]);

  return (
    <section className={`rounded-3xl p-6 sm:p-8 border shadow-sm ${
      isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
    }`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-display flex items-center gap-2">
            <Map className="w-6 h-6 text-blue-600 dark:text-cyan-400" />
            <span>{t.geoTitle}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Interactive district breakdown showing budget distribution and unusual spending risk levels.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-semibold">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500" /> {t.normal}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500" /> {t.moderate}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500" /> {t.highRisk}
          </span>
        </div>
      </div>

      {/* Grid of Interactive District Nodes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {districtMapData.map((d) => {
            const isSelected = activeDistrict.id === d.id;
            return (
              <button
                key={d.id}
                onClick={() => setActiveDistrict(d)}
                className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-2 ${
                  isSelected
                    ? isDark
                      ? 'bg-slate-800 border-cyan-500 ring-2 ring-cyan-500/30'
                      : 'bg-blue-50 border-blue-600 ring-2 ring-blue-500/20'
                    : isDark
                    ? 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm">{d.name}</span>
                  <span className={`w-2.5 h-2.5 rounded-full ${d.color}`} />
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">{d.budget}</span>
                <span className="text-[10px] font-semibold uppercase text-slate-400">{d.status}</span>
              </button>
            );
          })}
        </div>

        {/* Selected District Dossier Panel */}
        <div className={`p-6 rounded-2xl border flex flex-col justify-between space-y-4 ${
          isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-lg font-display">{activeDistrict.name} District</h3>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white ${activeDistrict.color}`}>
                {activeDistrict.status}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-500">{t.allocatedMoney}:</span>
                <span className="font-bold">{activeDistrict.budget}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-500">{t.spentMoney}:</span>
                <span className="font-bold text-blue-600 dark:text-cyan-400">{activeDistrict.spent}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-500">{t.remainingMoney}:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{activeDistrict.remaining}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">{t.unusualAlerts}:</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">{activeDistrict.alertCount} Flags</span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            Click any district node to inspect localized spending records and audit status.
          </p>
        </div>
      </div>
    </section>
  );
}
