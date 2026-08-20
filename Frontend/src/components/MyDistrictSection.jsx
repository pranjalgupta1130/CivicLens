import React, { useState } from 'react';
import { MapPin, ShieldAlert, CheckCircle2, AlertTriangle, ArrowRight, HelpCircle } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import WhyExplanationModal from './WhyExplanationModal';

const statesAndDistricts = {
  Maharashtra: [
    { name: 'Pune', allocated: '₹2,430 Cr', spent: '₹2,201 Cr', remaining: '₹229 Cr', used: '91%', alerts: 7, highRisk: 2, status: 'Moderate', sectors: ['Education', 'Hospitals', 'Roads'] },
    { name: 'Mumbai City', allocated: '₹4,850 Cr', spent: '₹3,910 Cr', remaining: '₹940 Cr', used: '80%', alerts: 12, highRisk: 4, status: 'High Risk', sectors: ['Metro Transport', 'Coastal Road', 'Health'] },
    { name: 'Nagpur', allocated: '₹1,920 Cr', spent: '₹1,540 Cr', remaining: '₹380 Cr', used: '80%', alerts: 3, highRisk: 0, status: 'Normal', sectors: ['Rural Irrigation', 'Schools'] },
    { name: 'Thane', allocated: '₹2,100 Cr', spent: '₹1,780 Cr', remaining: '₹320 Cr', used: '84%', alerts: 5, highRisk: 1, status: 'Moderate', sectors: ['Water Supply', 'Highways'] },
    { name: 'Nashik', allocated: '₹1,450 Cr', spent: '₹1,120 Cr', remaining: '₹330 Cr', used: '77%', alerts: 2, highRisk: 0, status: 'Normal', sectors: ['Agriculture', 'District Hospitals'] }
  ],
  Delhi: [
    { name: 'New Delhi', allocated: '₹3,500 Cr', spent: '₹2,950 Cr', remaining: '₹550 Cr', used: '84%', alerts: 6, highRisk: 1, status: 'Moderate', sectors: ['Flyovers', 'Schools', 'Hospitals'] }
  ],
  Karnataka: [
    { name: 'Bengaluru Urban', allocated: '₹4,200 Cr', spent: '₹3,400 Cr', remaining: '₹800 Cr', used: '80%', alerts: 9, highRisk: 3, status: 'High Risk', sectors: ['Suburban Rail', 'Roads'] }
  ]
};

export default function MyDistrictSection() {
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const [selectedState, setSelectedState] = useState('Maharashtra');
  const [selectedDistrictName, setSelectedDistrictName] = useState('Pune');
  const [whyOpen, setWhyOpen] = useState(false);

  const districts = statesAndDistricts[selectedState] || statesAndDistricts.Maharashtra;
  const activeDistrict = districts.find(d => d.name === selectedDistrictName) || districts[0];

  const getStatusBadge = (st) => {
    if (st === 'High Risk') return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800';
    if (st === 'Moderate') return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800';
    return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
  };

  const getStatusDot = (st) => {
    if (st === 'High Risk') return '🔴';
    if (st === 'Moderate') return '🟡';
    return '🟢';
  };

  return (
    <section className={`rounded-3xl p-6 sm:p-8 border shadow-sm transition-all ${
      isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
    }`}>
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-start gap-3">
          <div className={`p-3 rounded-2xl ${
            isDark ? 'bg-slate-800 text-cyan-400 border border-slate-700' : 'bg-blue-50 text-blue-600 border border-blue-100'
          }`}>
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-display">{t.myAreaTitle}</h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">{t.myAreaSubtitle}</p>
          </div>
        </div>

        {/* State & District Selectors */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-col">
            <label className="text-[10px] uppercase font-semibold text-slate-400 mb-1">{t.selectState}</label>
            <select
              value={selectedState}
              onChange={(e) => {
                setSelectedState(e.target.value);
                const firstDist = statesAndDistricts[e.target.value][0].name;
                setSelectedDistrictName(firstDist);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border cursor-pointer ${
                isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-800'
              }`}
            >
              {Object.keys(statesAndDistricts).map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-[10px] uppercase font-semibold text-slate-400 mb-1">{t.selectDistrict}</label>
            <select
              value={selectedDistrictName}
              onChange={(e) => setSelectedDistrictName(e.target.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border cursor-pointer ${
                isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-800'
              }`}
            >
              {districts.map(d => (
                <option key={d.name} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* District Cards Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main District Overview Box */}
        <div className={`lg:col-span-2 rounded-2xl p-6 border flex flex-col justify-between space-y-6 ${
          isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">{getStatusDot(activeDistrict.status)}</span>
                <h3 className="text-xl font-bold font-display">
                  {activeDistrict.name} {t.districtBudgetTitle}
                </h3>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(activeDistrict.status)}`}>
                {activeDistrict.status === 'High Risk' ? t.highRisk : activeDistrict.status === 'Moderate' ? t.moderate : t.normal}
              </span>
            </div>

            {/* Key District Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">{t.allocatedMoney}</span>
                <span className="font-display font-bold text-base sm:text-lg text-slate-900 dark:text-slate-100">{activeDistrict.allocated}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">{t.spentMoney}</span>
                <span className="font-display font-bold text-base sm:text-lg text-blue-600 dark:text-cyan-400">{activeDistrict.spent}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">{t.remainingMoney}</span>
                <span className="font-display font-bold text-base sm:text-lg text-emerald-600 dark:text-emerald-400">{activeDistrict.remaining}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">{t.budgetUsed}</span>
                <span className="font-display font-bold text-base sm:text-lg text-indigo-600 dark:text-indigo-400">{activeDistrict.used}</span>
              </div>
            </div>

            {/* Simple Citizen Sentence */}
            <div className="p-4 rounded-xl bg-blue-50 dark:bg-slate-900/80 border border-blue-200 dark:border-slate-800 text-xs sm:text-sm text-blue-900 dark:text-slate-200 flex items-center justify-between">
              <div>
                <strong>{activeDistrict.remaining}</strong> {t.stillAvailable} ({activeDistrict.used} {t.moneySpent.toLowerCase()}).
              </div>
              <button
                onClick={() => setWhyOpen(true)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex items-center gap-1"
              >
                <span>{t.whyBtn}</span>
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs pt-3 border-t border-slate-200 dark:border-slate-800">
            <span className="text-slate-500">Focus Sectors:</span>
            {activeDistrict.sectors.map(sec => (
              <span key={sec} className="px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 font-medium">
                {sec}
              </span>
            ))}
          </div>
        </div>

        {/* District Risk & Alerts Box */}
        <div className={`rounded-2xl p-6 border flex flex-col justify-between space-y-4 ${
          isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="space-y-4">
            <h4 className="font-bold text-base font-display flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-500" />
              <span>{t.unusualAlerts}</span>
            </h4>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400">{t.unusualAlerts}:</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">{activeDistrict.alerts} Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400">{t.highRiskItems}:</span>
                <span className="font-bold text-rose-600 dark:text-rose-400">{activeDistrict.highRisk} Priority</span>
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              CivicLens flags unusual cost variations in district contractor disbursements compared to state averages.
            </p>
          </div>

          <div className="pt-2">
            <div className="flex items-center gap-2 text-xs font-medium text-blue-600 dark:text-cyan-400">
              <span>Inspect all district flags in AI Alerts</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>

      </div>

      <WhyExplanationModal
        isOpen={whyOpen}
        onClose={() => setWhyOpen(false)}
        topicKey={activeDistrict.name}
        customTitle={`${activeDistrict.name} District Budget`}
        customValue={`${activeDistrict.allocated} allocated • ${activeDistrict.spent} spent`}
      />
    </section>
  );
}
