import React from 'react';
import { AlertOctagon, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { StatusTag } from './ui';
import { sortFindings, findingStatus, findingTone, nextStep } from '../lib/risk';

function alertStyle(finding) {
  const sev = String(finding.severity || '').toUpperCase();
  const status = findingStatus(finding);

  if (sev === 'CRITICAL' || sev === 'HIGH' || (status === 'suspicious' && findingTone(finding) === 'danger')) {
    return {
      row: 'border-l-[3px] border-l-red-600 bg-red-50/45',
      icon: 'text-red-600',
      badge: 'bg-red-100 text-red-800',
      Icon: AlertOctagon,
      evidence: 'bg-white border-red-200 text-red-950',
    };
  }
  if (sev === 'MEDIUM' || status === 'suspicious') {
    return {
      row: 'border-l-[3px] border-l-amber-600 bg-amber-50/45',
      icon: 'text-amber-700',
      badge: 'bg-amber-100 text-amber-900',
      Icon: AlertTriangle,
      evidence: 'bg-white border-amber-200 text-amber-950',
    };
  }
  if (sev === 'POSITIVE' || status === 'verified' || status === 'clear') {
    return {
      row: 'border-l-[3px] border-l-teal-600 bg-teal-50/35',
      icon: 'text-teal-700',
      badge: 'bg-teal-100 text-teal-800',
      Icon: CheckCircle2,
      evidence: 'bg-white border-teal-200 text-stone-800',
    };
  }
  return {
    row: 'border-l-[3px] border-l-stone-300 bg-white',
    icon: 'text-stone-400',
    badge: 'bg-stone-100 text-stone-700',
    Icon: Info,
    evidence: 'bg-stone-50 border-stone-200 text-stone-800',
  };
}

export default function FindingsList({ reasons = [] }) {
  const rows = sortFindings(reasons);
  if (!rows.length) return null;

  return (
    <ul className="divide-y divide-stone-200">
      {rows.map((f, i) => {
        const style = alertStyle(f);
        const { Icon } = style;
        const status = findingStatus(f);

        return (
          <li key={f.id || i} className={`px-5 py-4 ${style.row}`}>
            <div className="flex items-start gap-3.5">
              <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${style.icon}`} aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-stone-900">{f.title}</h3>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusTag status={status} tone={status === 'suspicious' ? findingTone(f) : undefined} />
                    {f.severity && (
                      <span className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide ${style.badge}`}>
                        {f.severity}
                      </span>
                    )}
                  </div>
                </div>

                <p className="mt-1 text-sm leading-relaxed text-stone-600">{f.explanation}</p>

                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <div className={`rounded border px-3 py-2 ${style.evidence}`}>
                    <span className="block font-mono text-[10px] uppercase tracking-wider text-stone-400">Evidence</span>
                    <p className="mt-0.5 break-words font-mono text-xs leading-5">{f.evidence || '—'}</p>
                  </div>
                  <div className="rounded border border-stone-200 bg-white px-3 py-2">
                    <span className="block font-mono text-[10px] uppercase tracking-wider text-[#0F4C5C]">Next step</span>
                    <p className="mt-0.5 text-xs leading-5 text-stone-800">{nextStep(f)}</p>
                  </div>
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}