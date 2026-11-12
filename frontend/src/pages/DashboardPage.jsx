import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, Search, ShieldAlert, ShieldCheck, AlertTriangle, 
  Trash2, Plus, Clock, Building2, Eye, Filter, ArrowUpRight
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

export default function DashboardPage({ history = [], onSelectHistoryItem, onQuickAnalyze, onClearHistory }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState('ALL'); // 'ALL' | 'REAL' | 'FAKE' | 'MEDIUM'

  // Metric aggregates
  const total = history.length;
  const fakeCount = history.filter(h => h.prediction === 'Fake' || h.risk_score > 60).length;
  const realCount = history.filter(h => h.prediction === 'Real' || h.risk_score <= 30).length;
  const mediumCount = total - fakeCount - realCount;
  const highRiskCount = history.filter(h => h.risk_score > 60).length;

  // Chart data: Risk Distribution
  const pieData = [
    { name: 'Low Risk (Real)', value: Math.max(1, realCount), color: '#10B981' },
    { name: 'Medium Risk (Caution)', value: Math.max(0, mediumCount), color: '#F59E0B' },
    { name: 'High Risk (Fake)', value: Math.max(1, fakeCount), color: '#EF4444' }
  ];

  // Chart data: Recent Activity
  const barData = history.slice(0, 7).reverse().map((item, idx) => ({
    name: item.company && item.company !== 'Not Specified' 
      ? item.company.substring(0, 10) 
      : `Offer #${idx + 1}`,
    score: item.risk_score
  }));

  // Filter history
  const filteredHistory = history.filter(item => {
    const matchesSearch = 
      (item.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.company || '').toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filterRisk === 'REAL') return item.risk_score <= 30;
    if (filterRisk === 'FAKE') return item.risk_score > 60;
    if (filterRisk === 'MEDIUM') return item.risk_score > 30 && item.risk_score <= 60;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              User Analysis Dashboard
            </h1>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/30">
              Demo Storage
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Monitor real vs fraudulent submissions, historical scans, and threat severity trends.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onQuickAnalyze}
            className="px-5 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-600/25 transition-all duration-200 cursor-pointer flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Quick Analyse Offer</span>
          </button>
        </div>
      </div>

      {/* METRIC OVERVIEW CARDS (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Total Analyses */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Analyses
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center">
              <LayoutDashboard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-sans">{total}</span>
            <span className="text-xs text-slate-500">Inspections logged</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Saved in browser session history</p>
        </div>

        {/* Card 2: Real-Looking Offers */}
        <div className="glass-panel rounded-2xl p-5 border border-emerald-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Real-Looking Offers
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-sans">{realCount}</span>
            <span className="text-xs text-emerald-400 font-medium">
              {total > 0 ? `${Math.round((realCount / total) * 100)}%` : '0%'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Low risk, verified characteristics</p>
        </div>

        {/* Card 3: Fake-Looking Offers */}
        <div className="glass-panel rounded-2xl p-5 border border-red-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">
              Fake-Looking Offers
            </span>
            <div className="w-8 h-8 rounded-lg bg-red-500/15 text-red-400 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-sans">{fakeCount}</span>
            <span className="text-xs text-red-400 font-medium">
              {total > 0 ? `${Math.round((fakeCount / total) * 100)}%` : '0%'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Critical scam indicators identified</p>
        </div>

        {/* Card 4: High-Risk Offers */}
        <div className="glass-panel rounded-2xl p-5 border border-amber-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
              High-Risk Offers
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-sans">{highRiskCount}</span>
            <span className="text-xs text-amber-400 font-medium">Score &gt; 60</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Severe fee or document theft alerts</p>
        </div>

      </div>


      {/* VISUAL CHARTS SECTION (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Risk Category Distribution (Donut Chart) */}
        <div className="lg:col-span-5 glass-panel rounded-2xl p-6 border border-slate-800">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Risk Distribution Breakdown</span>
            <span className="text-[11px] text-slate-400 font-normal">All Time</span>
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Proportion of low, medium, and high-risk internships.
          </p>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#0B132B', borderColor: '#1E293B', borderRadius: '8px', fontSize: '12px' }}
                  itemStyle={{ color: '#E2E8F0' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-around text-xs text-slate-400 pt-2 border-t border-slate-800">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>Real ({realCount})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span>Caution ({mediumCount})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
              <span>Fake ({fakeCount})</span>
            </div>
          </div>
        </div>

        {/* Right: Recent Threat Severity Trend (Bar Chart) */}
        <div className="lg:col-span-7 glass-panel rounded-2xl p-6 border border-slate-800">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Recent Scan Risk Scores</span>
            <span className="text-[11px] text-slate-400 font-normal">Last 7 Inspections</span>
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Risk score comparison (0 = Completely Safe, 100 = Critical Scam).
          </p>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                <YAxis domain={[0, 100]} stroke="#64748B" fontSize={11} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#0B132B', borderColor: '#1E293B', borderRadius: '8px', fontSize: '12px' }}
                  itemStyle={{ color: '#E2E8F0' }}
                />
                <Bar dataKey="score" radius={[6, 6, 0, 0]} fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-800">
            <span>Score 0–30: Safe</span>
            <span>Score 31–60: Review Needed</span>
            <span className="text-red-400 font-semibold">Score 61+: Fraud Warning</span>
          </div>
        </div>

      </div>


      {/* RECENT ANALYSIS HISTORY TABLE */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        
        {/* Table Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white">
              Recent Analysis History
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Inspect past scans, review verdicts, or re-open full analysis reports.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by title or company..."
                className="glass-input pl-9 pr-3 py-1.5 rounded-lg text-xs w-56"
              />
            </div>

            {/* Filter Pill */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
              {['ALL', 'REAL', 'FAKE', 'MEDIUM'].map(mode => (
                <button
                  key={mode}
                  onClick={() => setFilterRisk(mode)}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                    filterRisk === mode
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            {/* Clear History */}
            {history.length > 0 && (
              <button
                onClick={onClearHistory}
                title="Clear local scan history"
                className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* History Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider border-y border-slate-800 font-semibold">
              <tr>
                <th className="py-3 px-4">Internship Details</th>
                <th className="py-3 px-4">Organization</th>
                <th className="py-3 px-4">Risk Score</th>
                <th className="py-3 px-4">Verdict</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredHistory.length > 0 ? (
                filteredHistory.map((item) => {
                  const isFake = item.risk_score > 60;
                  const isMedium = item.risk_score > 30 && item.risk_score <= 60;

                  return (
                    <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4 font-medium text-white max-w-xs truncate">
                        {item.title}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        <span className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          {item.company}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`font-mono font-bold ${
                            isFake ? 'text-red-400' : isMedium ? 'text-amber-400' : 'text-emerald-400'
                          }`}>
                            {item.risk_score}
                          </span>
                          <span className="text-[10px] text-slate-500">/100</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                          isFake ? 'bg-red-500/15 text-red-400 border-red-500/30' :
                          isMedium ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' :
                          'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        }`}>
                          {item.prediction}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          {item.created_at}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => onSelectHistoryItem(item)}
                          className="text-xs text-blue-400 hover:text-blue-300 font-semibold cursor-pointer inline-flex items-center gap-1"
                        >
                          <span>Inspect</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No history entries found matching your query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-800/80 flex items-center justify-between">
          <span>*Demo analysis records are preserved locally in browser storage.</span>
          <span>Ready for production database sync (PostgreSQL / MongoDB).</span>
        </div>

      </div>

    </div>
  );
}
