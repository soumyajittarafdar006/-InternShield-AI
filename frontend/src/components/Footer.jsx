import React from 'react';
import { ShieldCheck, ShieldAlert, Heart, Code2, Mail, ExternalLink, AlertOctagon } from 'lucide-react';

export default function Footer({ setActiveTab }) {
  const currentYear = 2026;

  return (
    <footer className="border-t border-blue-500/15 bg-[#050811] text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Brand info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">InternShield AI</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              "Your AI Shield Against Fake Internships."
              <br />
              Intelligent NLP and machine learning platform engineered to safeguard college students from recruitment fraud and fake stipends.
            </p>
            <div className="flex items-center gap-3 pt-2 text-slate-400">
              <span className="inline-flex items-center gap-1.5 text-xs text-blue-400 bg-blue-950/40 px-2.5 py-1 rounded-md border border-blue-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
                EMSCAD NLP Pipeline v1.0
              </span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm tracking-wide uppercase">Navigation</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button onClick={() => { setActiveTab('home'); window.scrollTo(0,0); }} className="hover:text-blue-400 transition-colors">
                  Home Overview
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveTab('analyze'); window.scrollTo(0,0); }} className="hover:text-blue-400 transition-colors">
                  Analyse Internship
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveTab('dashboard'); window.scrollTo(0,0); }} className="hover:text-blue-400 transition-colors">
                  User Dashboard & History
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveTab('ml-performance'); window.scrollTo(0,0); }} className="hover:text-blue-400 transition-colors">
                  Machine Learning Benchmark
                </button>
              </li>
            </ul>
          </div>

          {/* Red Flag Indicators */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm tracking-wide uppercase">Core Detection Signals</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2 text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                Registration & Training Fees
              </li>
              <li className="flex items-center gap-2 text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                Free Public Email Domains
              </li>
              <li className="flex items-center gap-2 text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                Urgent High-Pressure Language
              </li>
              <li className="flex items-center gap-2 text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                Early Aadhaar / Banking Demands
              </li>
              <li className="flex items-center gap-2 text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                TF-IDF Linguistic N-Grams
              </li>
            </ul>
          </div>

          {/* Academic & Disclaimer */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm tracking-wide uppercase">Academic Project</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Built as a college engineering project for AI-Based Fake Internship Detection. Developed with React.js, Tailwind CSS, Python Flask, and Scikit-Learn.
            </p>
            <div className="p-3 rounded-lg bg-blue-950/20 border border-blue-500/20 text-[11px] text-slate-300">
              <span className="font-semibold text-blue-300">Model Split:</span> 80:20 Stratified on EMSCAD benchmark.
            </div>
          </div>

        </div>

        {/* Legal Disclaimer Box */}
        <div className="mt-10 p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-start gap-3">
          <AlertOctagon className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-slate-300">Important Disclaimer:</strong> InternShield AI provides probabilistic risk assessments and NLP pattern warnings. It does not replace formal corporate due diligence or represent legally binding background verification. Students should never pay money for any internship and must independently verify recruiters before sharing identity credentials.
          </p>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {currentYear} InternShield AI. All rights reserved. Engineering Capstone Project.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-300 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-300 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-300 cursor-pointer">Student Safety Guide</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
