import React from 'react';
import { ShieldCheck, Heart, Github, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-800/80 bg-[#080b12] text-slate-400 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Brand Column */}
        <div className="space-y-3 md:col-span-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center font-bold text-white text-xs">
              CL
            </div>
            <span className="font-display font-bold text-slate-100 text-lg">CivicLens</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            An open civic transparency and AI governance platform designed for public trust, auditability, and fiscal clarity.
          </p>
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium pt-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Open Data Standard compliant</span>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">Platform Pages</h4>
          <ul className="space-y-2 text-xs">
            <li><Link to="/" className="hover:text-cyan-400 transition-colors">Home Overview</Link></li>
            <li><Link to="/dashboard" className="hover:text-cyan-400 transition-colors">Executive Dashboard</Link></li>
            <li><Link to="/budget-explorer" className="hover:text-cyan-400 transition-colors">Budget Explorer</Link></li>
            <li><Link to="/ai-assistant" className="hover:text-cyan-400 transition-colors">AI Assistant</Link></li>
          </ul>
        </div>

        {/* Governance & Alerts */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">Governance</h4>
          <ul className="space-y-2 text-xs">
            <li><Link to="/ai-alerts" className="hover:text-cyan-400 transition-colors">AI Anomaly Feed</Link></li>
            <li><Link to="/admin-upload" className="hover:text-cyan-400 transition-colors">Admin Ingestion Portal</Link></li>
            <li><a href="#audit" className="hover:text-cyan-400 transition-colors inline-flex items-center gap-1">Audit Methodology <ExternalLink className="w-3 h-3"/></a></li>
            <li><a href="#api" className="hover:text-cyan-400 transition-colors inline-flex items-center gap-1">Public API Specs <ExternalLink className="w-3 h-3"/></a></li>
          </ul>
        </div>

        {/* Legal & Standards */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">Compliance</h4>
          <p className="text-xs text-slate-400 mb-3">
            CivicLens updates financial ledgers in real-time from verified municipal data streams.
          </p>
          <div className="flex items-center gap-3">
            <a href="https://github.com" target="_blank" rel="noreferrer" className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all">
              <Github className="w-4 h-4" />
            </a>
          </div>
        </div>

      </div>

      <div className="max-w-7xl mx-auto border-t border-slate-800/60 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <p>&copy; {new Date().getFullYear()} CivicLens AI Platform. Built for Transparent Governance.</p>
        <div className="flex items-center gap-1">
          <span>Crafted with precision for public accountability</span>
        </div>
      </div>
    </footer>
  );
}
