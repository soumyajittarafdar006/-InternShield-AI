import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, Sparkles, Activity, BarChart2, LayoutDashboard, Search, Menu, X, CheckCircle, AlertTriangle } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, backendStatus }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: Sparkles },
    { id: 'analyze', label: 'Analyse Offer', icon: Search, highlight: true },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'ml-performance', label: 'ML Performance', icon: BarChart2 },
  ];

  const handleNav = (id) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-[#080D1A]/85 border-b border-blue-500/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <div 
            onClick={() => handleNav('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-[1.5px] shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all duration-300">
              <div className="w-full h-full bg-[#080D1A] rounded-[10px] flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-blue-400 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight text-white font-sans">InternShield</span>
                <span className="text-xs font-black px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">AI</span>
              </div>
              <p className="text-[10px] tracking-wider text-slate-400 font-medium hidden sm:block">AI FAKE INTERNSHIP DEFENSE</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40 shadow-sm shadow-blue-500/10'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                  {item.label}
                  {item.highlight && (
                    <span className="inline-block w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Status Badge & Primary CTA */}
          <div className="hidden md:flex items-center gap-3">
            {/* Live Backend Indicator */}
            <div 
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${
                backendStatus?.status === 'healthy'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              }`}
              title={backendStatus?.status === 'healthy' ? "Flask Backend & Scikit-Learn Model Active" : "Operating in Client Demo Fallback Mode"}
            >
              <span className={`w-2 h-2 rounded-full ${backendStatus?.status === 'healthy' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
              <span>{backendStatus?.status === 'healthy' ? 'ML Engine Online' : 'Demo Fallback'}</span>
            </div>

            <button
              onClick={() => handleNav('analyze')}
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-600/25 hover:shadow-blue-600/40 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>Analyse Now</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-blue-500/20 bg-[#080D1A]/95 backdrop-blur-2xl px-4 pt-2 pb-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-5 h-5 text-blue-400" />
                {item.label}
              </button>
            );
          })}
          
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Engine: {backendStatus?.status === 'healthy' ? 'ML Model Online' : 'Client Demo'}
            </span>
            <button
              onClick={() => handleNav('analyze')}
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-blue-600 text-white"
            >
              Start Analysis
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
