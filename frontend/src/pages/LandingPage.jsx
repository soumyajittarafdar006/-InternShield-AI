import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Search, AlertOctagon } from 'lucide-react';
import { SAMPLE_OFFERS } from '../data/samples';
import { fallbackAnalyze, getModelPerformance } from '../services/api';
import { extractEmailDomain, FREE_DOMAINS } from '../services/domainCheck';
import { riskBand, BAND, sortFindings, formatMoney } from '../lib/risk';
import RiskGauge from '../components/RiskGauge';
import FindingsList from '../components/FindingsList';
import { Tag, StatusTag } from '../components/ui';

const plainName = (name) => name.replace(/^[^A-Za-z0-9]+/, '');

const STEPS = [
  ['01', 'Add the offer', 'Drop a PDF, paste a WhatsApp/email message, or type the details. PDFs stay in your browser.'],
  ['02', 'Extract signals', 'Recruiter email, company domain, fee demands, stipend, and document requests are isolated.'],
  ['03', 'Run checks', 'A trained classifier scores the text while rules and live DNS/RDAP lookups inspect the domain.'],
  ['04', 'Read the evidence', 'Every flag shows what triggered it, its severity, and how to verify the recruiter.'],
];

const SIGNALS = [
  ['Fee & deposit demands', 'Registration, training, security, or "refundable" charges that real employers never ask interns to pay.'],
  ['Recruiter email domain', 'Free public mailboxes, domains without DNS records, and mismatches against the company site.'],
  ['Brand lookalikes', 'Domains that mimic or misspell established companies to trick applicants.'],
  ['New or unreachable domains', 'RDAP registration dates and live reachability checks to catch throwaway scam sites.'],
  ['Early ID & bank requests', 'Demands for Aadhaar, PAN, bank account numbers, cards, or OTPs before proper onboarding.'],
  ['Pressure tactics', 'Urgency deadlines, "no interview" selection, WhatsApp-only hiring, and unrealistic stipends.'],
];

const PRIVACY = [
  ['PDFs stay local', 'Text extraction runs inside your browser; the PDF file is never uploaded.'],
  ['Transparent fallback', 'Submitted text goes to the analysis server, or uses local browser rules if offline.'],
  ['Domain-only lookups', 'Only the recruiter email domain is queried via DNS and RDAP.'],
  ['Browser-only history', 'Past reports live in local storage and can be wiped from the History page.'],
];

function HeroDossier({ entry }) {
  const { sample, result } = entry;
  const d = sample.data;
  const domain = extractEmailDomain(d);
  const free = FREE_DOMAINS.includes(domain);
  const fee = formatMoney(d.registration_fee);
  const feeFlag = (result.reasons || []).some((r) => r.id === 'fee_requested');
  const top = sortFindings(result.reasons).slice(0, 2);

  const rows = [
    ['Recruiter email', d.email, free ? 'suspicious' : 'unknown'],
    ['Payment demand', fee || 'None', feeFlag ? 'suspicious' : 'clear'],
  ];

  return (
    <div className="overflow-hidden rounded-lg border border-stone-300 bg-white">
      <div className="flex items-center justify-between border-b border-stone-200 bg-stone-100/80 px-4 py-2.5">
        <span className="font-mono text-[11px] font-medium uppercase tracking-wider text-stone-600">
          Sample inspection · Fictional offer
        </span>
        <span className="font-mono text-[11px] text-stone-400">RULE ENGINE</span>
      </div>

      <div className="border-b border-stone-200 px-5 py-4">
        <p className="text-base font-bold text-stone-900">{d.title}</p>
        <p className="text-xs text-stone-500">{d.company}</p>
      </div>

      <div className="border-b border-stone-200 bg-[#FAF9F6] px-5 py-4">
        <RiskGauge score={result.risk_score} />
      </div>

      <ul className="divide-y divide-stone-200 border-b border-stone-200">
        {rows.map(([label, value, status]) => (
          <li
            key={label}
            className={`grid grid-cols-[7.5rem_minmax(0,1fr)_auto] items-center gap-3 px-5 py-2.5 text-xs ${
              status === 'suspicious' ? 'bg-red-50/50' : ''
            }`}
          >
            <span className="text-stone-500">{label}</span>
            <span className="truncate font-mono text-stone-800" title={value}>{value}</span>
            <StatusTag status={status} tone={status === 'suspicious' ? 'danger' : undefined} />
          </li>
        ))}
      </ul>

      <div className="divide-y divide-red-200/70 bg-red-50/40">
        {top.map((f) => (
          <div key={f.id} className="flex items-start gap-2.5 border-l-[3px] border-l-red-600 px-4 py-3">
            <AlertOctagon className="mt-0.5 h-4 w-4 shrink-0 text-red-600" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-xs font-bold text-stone-900">{f.title}</p>
              <p className="mt-0.5 truncate font-mono text-[11px] text-red-900">{f.evidence}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LandingPage({ onNavigate }) {
  const analyses = useMemo(() => SAMPLE_OFFERS.map((sample) => ({ sample, result: fallbackAnalyze(sample.data) })), []);
  const [sampleId, setSampleId] = useState(SAMPLE_OFFERS[1]?.id);
  const active = analyses.find((a) => a.sample.id === sampleId) || analyses[0];
  const activeBand = BAND[riskBand(active.result.risk_score)];

  const [perf, setPerf] = useState(undefined);
  useEffect(() => {
    let mounted = true;
    getModelPerformance()
      .then((p) => mounted && setPerf(p))
      .catch(() => mounted && setPerf(null));
    return () => {
      mounted = false;
    };
  }, []);

  const primaryName = perf?.primary_model || 'Logistic Regression';
  const pm = perf?.status === 'trained' ? perf.models?.[primaryName] : null;
  const testSize = perf?.dataset_info?.test_size;
  const fmt = (v) => (typeof v === 'number' ? `${v.toFixed(2)}%` : '—');

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-stone-200">
        <div className="page grid items-center gap-12 py-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:py-20">
          <div>
            <p className="font-mono text-xs font-medium uppercase tracking-wider text-[#0F4C5C]">
              Internship offer screening
            </p>
            <h1 className="display mt-3 text-4xl font-bold leading-[1.08] text-stone-900 sm:text-5xl">
              Verify an internship offer before you send money or documents.
            </h1>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-stone-600">
              Paste the message or drop the offer PDF. InternShield checks fee demands, recruiter email domains, brand lookalikes, and wording patterns, then shows the exact evidence.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onNavigate('analyze')}
                className="inline-flex items-center gap-2 rounded-md bg-[#0F4C5C] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0B3A47]"
              >
                <Search className="h-4 w-4" />
                Analyse an offer
              </button>
              <a
                href="#example"
                className="inline-flex items-center gap-1.5 rounded-md border border-stone-300 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 transition-colors hover:border-stone-400 hover:text-stone-900"
              >
                See an example
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
            <p className="mt-5 font-mono text-xs text-stone-500">
              PDFs are parsed locally in your browser · No account required
            </p>
          </div>

          <HeroDossier entry={analyses[0]} />
        </div>
      </section>

      {/* Process strip */}
      <section className="border-b border-stone-200 bg-white py-12">
        <div className="page">
          <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(([num, title, desc]) => (
              <li key={num} className="border-t-2 border-stone-900 pt-3.5">
                <span className="font-mono text-xs font-semibold text-[#0F4C5C]">{num}</span>
                <h2 className="mt-1 text-sm font-bold text-stone-900">{title}</h2>
                <p className="mt-1.5 text-xs leading-5 text-stone-600">{desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Interactive Example */}
      <section id="example" className="scroll-mt-16 border-b border-stone-200 py-16">
        <div className="page">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-xs font-medium uppercase tracking-wider text-[#0F4C5C]">Live example</p>
              <h2 className="display mt-1.5 text-2xl font-bold text-stone-900 sm:text-3xl">
                How alerts and evidence look.
              </h2>
            </div>

            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Choose a sample offer">
              {analyses.map(({ sample }) => {
                const isSelected = sample.id === active.sample.id;
                return (
                  <button
                    key={sample.id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setSampleId(sample.id)}
                    className={`rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors ${
                      isSelected
                        ? 'border-[#0F4C5C] bg-[#0F4C5C] text-white'
                        : 'border-stone-300 bg-white text-stone-700 hover:border-stone-400'
                    }`}
                  >
                    {plainName(sample.name)}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-lg border border-stone-300 bg-white">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 bg-stone-50 px-5 py-3.5">
              <div>
                <h3 className="text-sm font-bold text-stone-900">{active.sample.data.title}</h3>
                <p className="font-mono text-xs text-stone-500">
                  {active.sample.data.company} · {active.sample.data.email}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-bold text-stone-900">{active.result.risk_score}/100</span>
                <Tag tone={activeBand.tone}>{activeBand.label}</Tag>
              </div>
            </div>
            <FindingsList reasons={active.result.reasons} />
            {!active.result.reasons?.length && (
              <p className="px-5 py-6 text-sm text-stone-500">No alerts triggered for this sample.</p>
            )}
          </div>
        </div>
      </section>

      {/* What it checks + Privacy (Editorial two-column index, no icon card grid) */}
      <section className="border-b border-stone-200 bg-white py-16">
        <div className="page grid gap-12 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <div>
            <p className="font-mono text-xs font-medium uppercase tracking-wider text-[#0F4C5C]">Detection scope</p>
            <h2 className="display mt-1.5 text-2xl font-bold text-stone-900">What InternShield flags.</h2>
            <dl className="mt-6 grid gap-x-8 gap-y-5 sm:grid-cols-2">
              {SIGNALS.map(([title, desc]) => (
                <div key={title} className="border-t border-stone-200 pt-3.5">
                  <dt className="text-sm font-bold text-stone-900">{title}</dt>
                  <dd className="mt-1 text-xs leading-5 text-stone-600">{desc}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="rounded-lg border border-stone-200 bg-[#FAF9F6] p-6">
            <p className="font-mono text-xs font-medium uppercase tracking-wider text-teal-800">Data handling</p>
            <h2 className="display mt-1.5 text-xl font-bold text-stone-900">What stays on your device.</h2>
            <dl className="mt-5 divide-y divide-stone-200">
              {PRIVACY.map(([title, desc]) => (
                <div key={title} className="py-3 first:pt-0 last:pb-0">
                  <dt className="text-xs font-bold text-stone-900">{title}</dt>
                  <dd className="mt-0.5 text-xs leading-5 text-stone-600">{desc}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Model performance strip */}
      <section className="border-b border-stone-200 py-14">
        <div className="page">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-xs font-medium uppercase tracking-wider text-[#0F4C5C]">Model benchmark</p>
              <h2 className="display mt-1.5 text-2xl font-bold text-stone-900">Classifier evaluation</h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('ml-performance')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F4C5C] hover:underline"
            >
              Inspect confusion matrices
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {perf === undefined && <p className="mt-4 text-xs text-stone-500">Loading metrics…</p>}
          {perf !== undefined && !pm && (
            <p className="mt-4 text-xs text-stone-500">Metrics appear here once a trained model has been evaluated.</p>
          )}
          {pm && (
            <>
              <dl className="mt-6 grid grid-cols-2 divide-y divide-stone-200 overflow-hidden rounded-lg border border-stone-200 bg-white sm:grid-cols-5 sm:divide-x sm:divide-y-0">
                {[
                  ['Test posts', typeof testSize === 'number' ? String(testSize) : '—'],
                  ['Accuracy', fmt(pm.accuracy)],
                  ['Fake precision', fmt(pm.precision_fake)],
                  ['Fake recall', fmt(pm.recall_fake)],
                  ['Fake F1', fmt(pm.f1_fake)],
                ].map(([label, value]) => (
                  <div key={label} className="px-4 py-3.5">
                    <dt className="font-mono text-[11px] text-stone-500">{label}</dt>
                    <dd className="num mt-1 text-lg font-bold text-stone-900">{value}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-3 text-xs text-stone-500">
                {primaryName} on a held-out split{typeof testSize === 'number' ? ` (${testSize} postings)` : ''}.{' '}
                {perf.source === 'bundled_snapshot' ? 'Bundled snapshot (server offline).' : 'Live from server.'}
              </p>
            </>
          )}
        </div>
      </section>

      {/* Grounded dark editorial CTA */}
      <section className="page py-14">
        <div className="flex flex-col items-start justify-between gap-6 rounded-lg bg-[#161615] px-7 py-9 sm:flex-row sm:items-center sm:px-10">
          <div>
            <h2 className="display text-2xl font-bold text-white">Have an offer sitting in your inbox?</h2>
            <p className="mt-1.5 max-w-lg text-sm text-stone-300">
              Run a quick check before paying a fee or sharing identity documents.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('analyze')}
            className="inline-flex shrink-0 items-center gap-2 rounded-md bg-white px-5 py-2.5 text-sm font-semibold text-stone-900 transition-colors hover:bg-stone-100"
          >
            Analyse an offer
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>
    </div>
  );
}