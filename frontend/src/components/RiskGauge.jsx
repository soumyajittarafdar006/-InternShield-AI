import React from 'react';
import { riskBand, BAND } from '../lib/risk';

const BAND_STYLES = {
  low: {
    score: 'text-teal-700',
    badge: 'bg-teal-50 text-teal-800 border-teal-300',
    marker: 'bg-teal-700',
  },
  medium: {
    score: 'text-amber-700',
    badge: 'bg-amber-50 text-amber-900 border-amber-300',
    marker: 'bg-amber-700',
  },
  high: {
    score: 'text-red-700',
    badge: 'bg-red-50 text-red-800 border-red-300',
    marker: 'bg-red-700',
  },
};

/** Sharp linear 0-100 risk instrument. */
export default function RiskGauge({ score = 0 }) {
  const s = Math.max(0, Math.min(100, Math.round(Number(score) || 0)));
  const band = riskBand(s);
  const meta = BAND[band];
  const style = BAND_STYLES[band];

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-baseline gap-1.5">
          <span className={`num text-4xl font-bold tracking-tight ${style.score}`}>{s}</span>
          <span className="font-mono text-xs text-stone-400">/ 100</span>
        </div>
        <span className={`inline-flex items-center rounded border px-2 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-wide ${style.badge}`}>
          {meta.label}
        </span>
      </div>

      <div className="relative mt-4 h-2" role="img" aria-label={`Risk score ${s} out of 100, ${meta.label}`}>
        <div className="absolute inset-0 flex gap-0.5 overflow-hidden rounded-[2px] bg-stone-200">
          <div className="h-full bg-teal-600/80" style={{ width: '30%' }} />
          <div className="h-full bg-amber-500/85" style={{ width: '30%' }} />
          <div className="h-full flex-1 bg-red-600/85" />
        </div>
        <div
          className={`absolute -top-1.5 h-5 w-1 -translate-x-1/2 rounded-[1px] ring-2 ring-white ${style.marker}`}
          style={{ left: `${s}%` }}
        />
      </div>

      <div className="relative mt-2 h-4 font-mono text-[10px] text-stone-400" aria-hidden="true">
        <span className="absolute left-0">0</span>
        <span className="absolute -translate-x-1/2" style={{ left: '30%' }}>30</span>
        <span className="absolute -translate-x-1/2" style={{ left: '60%' }}>60</span>
        <span className="absolute right-0">100</span>
      </div>

      <p className="mt-2 text-xs leading-5 text-stone-500">
        Heuristic score from text classification, rule checks, and domain lookups.
      </p>
    </div>
  );
}