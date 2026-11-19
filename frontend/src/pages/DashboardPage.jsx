import React, { useState } from 'react';
import { Search, Trash2, Plus, ArrowUpRight } from 'lucide-react';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, ReferenceLine, Tooltip, ResponsiveContainer } from 'recharts';
import { riskBand, BAND, isSampleRecord, pct } from '../lib/risk';
import { Panel, PageHeader, Tag } from '../components/ui';

const BAND_FILL = { low: '#0F766E', medium: '#D97706', high: '#DC2626' };
const BAND_BG = { low: 'bg-teal-600', medium: 'bg-amber-500', high: 'bg-red-600' };
const FILTERS = [
  ['all', 'All'],
  ['low', 'Low'],
  ['medium', 'Medium'],
  ['high', 'High'],
];

export default function DashboardPage({ history = [], onSelectHistoryItem, onQuickAnalyze, onClearHistory }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [includeSamples, setIncludeSamples] = useState(false);

  const realCount = history.filter((h) => !isSampleRecord(h)).length;
  const sampleCount = history.length - realCount;
  const counted = includeSamples ? history : history.filter((h) => !isSampleRecord(h));
  const counts = { low: 0, medium: 0, high: 0 };
  counted.forEach((h) => { counts[riskBand(h.risk_score)] += 1; });
  const total = counted.length;

  const barData = counted
    .slice(0, 8)
    .reverse()
    .map((h, i) => ({ label: `#${i + 1}`, score: h.risk_score, title: h.title, company: h.company }));

  const rows = history.filter((item) => {
    const q = searchTerm.toLowerCase();
    const matches = (item.title || '').toLowerCase().includes(q) || (item.company || '').toLowerCase().includes(q);
    return matches && (filter === 'all' || riskBand(item.risk_score) === filter);
  });

  const stats = [
    ['Total', total, '', 'border-t-stone-800', 'text-stone-900'],
    ['High risk', counts.high, pct(counts.high, total), 'border-t-red-600', 'text-red-700'],
    ['Medium risk', counts.medium, pct(counts.medium, total), 'border-t-amber-500', 'text-amber-700'],
    ['Low risk', counts.low, pct(counts.low, total), 'border-t-teal-600', 'text-teal-700'],
  ];

  return (
    <div className="page space-y-6 py-8">
      <PageHeader
        eyebrow="History"
        title="Analysis ledger"
        description="Offers you have checked on this device."
        actions={
          <button
            type="button"
            onClick={onQuickAnalyze}
            className="inline-flex items-center gap-1.5 rounded-md bg-[#0F4C5C] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0B3A47]"
          >
            <Plus className="h-4 w-4" />
            Analyse offer
          </button>
        }
      />

      {/* Summary strip */}
      <section aria-label="Summary" className="overflow-hidden rounded-lg border border-stone-200 bg-white">
        <dl className="grid grid-cols-2 divide-y divide-stone-200 lg:grid-cols-4 lg:divide-x lg:divide-y-0">
          {stats.map(([label, value, share, borderTop, color]) => (
            <div key={label} className={`border-t-[3px] p-5 ${borderTop}`}>
              <dt className="font-mono text-[11px] uppercase tracking-wider text-stone-500">{label}</dt>
              <dd className="mt-2 flex items-baseline gap-2">
                <span className={`num text-3xl font-bold ${color}`}>{value}</span>
                {share && <span className="font-mono text-xs text-stone-400">{share}</span>}
              </dd>
            </div>
          ))}
        </dl>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-200 bg-stone-50 px-5 py-2.5 text-xs text-stone-500">
          <span>
            {includeSamples
              ? `Counting ${realCount} real and ${sampleCount} sample records.`
              : `Counting ${realCount} real ${realCount === 1 ? 'analysis' : 'analyses'}. ${sampleCount} sample ${sampleCount === 1 ? 'record is' : 'records are'} excluded.`}
          </span>
          {sampleCount > 0 && (
            <label className="inline-flex cursor-pointer items-center gap-2 font-medium text-stone-700">
              <input type="checkbox" checked={includeSamples} onChange={(e) => setIncludeSamples(e.target.checked)} className="h-3.5 w-3.5 accent-[#0F4C5C]" />
              Include sample records
            </label>
          )}
        </div>
      </section>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <Panel title="Risk distribution" description="Share of analyses per band.">
          {total === 0 ? (
            <p className="py-10 text-center text-sm text-stone-500">No analyses to chart yet.</p>
          ) : (
            <>
              <div className="flex h-2.5 gap-0.5 overflow-hidden rounded-[2px] bg-stone-100" role="img" aria-label={`${counts.high} high, ${counts.medium} medium, ${counts.low} low risk`}>
                {['high', 'medium', 'low'].map((b) => counts[b] > 0 && <div key={b} className={BAND_BG[b]} style={{ width: `${(counts[b] / total) * 100}%` }} />)}
              </div>
              <table className="mt-5 w-full text-sm">
                <thead className="text-left font-mono text-[11px] uppercase text-stone-400">
                  <tr>
                    <th className="pb-2 font-medium">Band</th>
                    <th className="pb-2 text-right font-medium">Count</th>
                    <th className="pb-2 text-right font-medium">Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 border-t border-stone-200">
                  {['high', 'medium', 'low'].map((b) => (
                    <tr key={b}>
                      <td className="py-2 font-medium text-stone-800">
                        <span className="inline-flex items-center gap-2">
                          <span className={`h-2 w-2 rounded-[1px] ${BAND_BG[b]}`} aria-hidden="true" />
                          {BAND[b].label}
                        </span>
                      </td>
                      <td className="num py-2 text-right font-semibold text-stone-900">{counts[b]}</td>
                      <td className="num py-2 text-right text-stone-500">{pct(counts[b], total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </Panel>

        <Panel title="Recent risk scores" description="Last 8 analyses. Dashed lines mark 30 and 60 thresholds.">
          {barData.length === 0 ? (
            <p className="py-10 text-center text-sm text-stone-500">No analyses to chart yet.</p>
          ) : (
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="#E7E5E4" />
                  <XAxis dataKey="label" tickLine={false} axisLine={{ stroke: '#E7E5E4' }} tick={{ fill: '#78716C', fontSize: 11, fontFamily: 'IBM Plex Mono' }} />
                  <YAxis domain={[0, 100]} ticks={[0, 30, 60, 100]} tickLine={false} axisLine={false} tick={{ fill: '#78716C', fontSize: 11, fontFamily: 'IBM Plex Mono' }} />
                  <ReferenceLine y={30} stroke="#0F766E" strokeDasharray="3 3" />
                  <ReferenceLine y={60} stroke="#DC2626" strokeDasharray="3 3" />
                  <Tooltip
                    cursor={{ fill: '#FAF9F6' }}
                    contentStyle={{ border: '1px solid #D6D3D1', borderRadius: 4, fontSize: 12, boxShadow: 'none' }}
                    labelFormatter={(_, p) => p?.[0]?.payload?.title || ''}
                    formatter={(v, _n, item) => [`${v} / 100`, item?.payload?.company || 'Risk score']}
                  />
                  <Bar dataKey="score" maxBarSize={32} radius={[2, 2, 0, 0]} isAnimationActive={false}>
                    {barData.map((d, i) => <Cell key={i} fill={BAND_FILL[riskBand(d.score)]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Panel>
      </div>

      {/* History Table */}
      <Panel
        title="Saved analyses"
        description="Open any row to review its evidence."
        bodyClassName=""
        action={
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" aria-hidden="true" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search title or company"
                aria-label="Search history"
                className="field w-48 bg-white py-1.5 pl-8 text-xs"
              />
            </div>
            <div className="inline-flex rounded border border-stone-200 bg-stone-100 p-0.5" role="group" aria-label="Filter by risk">
              {FILTERS.map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={filter === id}
                  onClick={() => setFilter(id)}
                  className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                    filter === id ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            {history.length > 0 && (
              <button
                type="button"
                onClick={onClearHistory}
                className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-stone-500 transition-colors hover:bg-red-50 hover:text-red-700"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Clear
              </button>
            )}
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[34rem] text-left text-sm">
            <thead className="border-b border-stone-200 bg-stone-50 font-mono text-[11px] uppercase tracking-wider text-stone-500">
              <tr>
                <th className="px-5 py-2.5 font-medium">Internship</th>
                <th className="hidden px-3 py-2.5 font-medium sm:table-cell">Organisation</th>
                <th className="px-3 py-2.5 font-medium">Score</th>
                <th className="px-3 py-2.5 font-medium">Risk</th>
                <th className="hidden px-3 py-2.5 font-medium md:table-cell">Date</th>
                <th className="px-5 py-2.5 text-right font-medium"><span className="sr-only">Open</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {rows.length > 0 ? (
                rows.map((item) => {
                  const band = riskBand(item.risk_score);
                  const sample = isSampleRecord(item);
                  const rowTint = band === 'high' ? 'bg-red-50/40 hover:bg-red-50/70' : 'hover:bg-stone-50';
                  return (
                    <tr key={item.id} className={`transition-colors ${rowTint}`}>
                      <td className="max-w-xs px-5 py-3">
                        <p className="truncate font-semibold text-stone-900">{item.title}</p>
                        <p className="truncate text-xs text-stone-500 sm:hidden">{item.company}</p>
                        {sample && <span className="mt-1 inline-block"><Tag>Sample</Tag></span>}
                      </td>
                      <td className="hidden max-w-[12rem] truncate px-3 py-3 text-stone-600 sm:table-cell">{item.company}</td>
                      <td className="num px-3 py-3 font-semibold text-stone-900">{item.risk_score}</td>
                      <td className="px-3 py-3"><Tag tone={BAND[band].tone}>{BAND[band].label}</Tag></td>
                      <td className="hidden whitespace-nowrap px-3 py-3 font-mono text-xs text-stone-500 md:table-cell">{item.created_at}</td>
                      <td className="px-5 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => onSelectHistoryItem(item)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#0F4C5C] hover:underline"
                        >
                          Open
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-stone-500">
                    {history.length === 0 ? 'No analyses yet. Analyse an offer and it will appear here.' : 'No records match your search or filter.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="border-t border-stone-200 bg-stone-50 px-5 py-2.5 text-xs text-stone-500">
          Stored locally in your browser (latest 50 analyses).
        </p>
      </Panel>
    </div>
  );
}