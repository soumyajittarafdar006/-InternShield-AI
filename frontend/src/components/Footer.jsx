import React from 'react';

const LINKS = [
  { id: 'home', label: 'Overview' },
  { id: 'analyze', label: 'Analyse Offer' },
  { id: 'dashboard', label: 'History' },
  { id: 'ml-performance', label: 'Benchmarks' },
];

const CHECKS = [
  'Registration and training fee demands',
  'Free or mismatched recruiter email domains',
  'Lookalike domains imitating known brands',
  'Early requests for ID or banking details',
  'Domain age and reachability',
];

export default function Footer({ setActiveTab }) {
  const go = (id) => {
    setActiveTab(id);
    window.scrollTo(0, 0);
  };

  return (
    <footer className="border-t border-stone-200 bg-white">
      <div className="page py-12">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1.4fr]">
          <div>
            <span className="display text-base font-bold tracking-tight text-stone-900">
              Intern<span className="text-[#0F4C5C]">Shield</span>
            </span>
            <p className="mt-2.5 max-w-xs text-sm leading-relaxed text-stone-500">
              Analyses internship offers and shows the evidence behind every alert, so you can verify before sharing personal information.
            </p>
          </div>

          <nav aria-label="Footer">
            <p className="mb-3 font-mono text-[11px] font-medium uppercase tracking-wider text-stone-400">Pages</p>
            <ul className="space-y-2 text-sm">
              {LINKS.map((l) => (
                <li key={l.id}>
                  <button type="button" onClick={() => go(l.id)} className="text-stone-700 transition-colors hover:text-[#0F4C5C] hover:underline">
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="mb-3 font-mono text-[11px] font-medium uppercase tracking-wider text-stone-400">Signals checked</p>
            <ul className="space-y-1.5 text-sm text-stone-500">
              {CHECKS.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-stone-200 pt-6 text-xs leading-5 text-stone-500">
          <p>
            <strong className="font-semibold text-stone-800">Not a legal background check.</strong> InternShield gives probabilistic risk assessments and flags known scam patterns. Never pay money for an internship, and verify any recruiter independently before sending identity documents.
          </p>
          <p className="mt-2 font-mono text-[11px] text-stone-400">© {new Date().getFullYear()} InternShield</p>
        </div>
      </div>
    </footer>
  );
}