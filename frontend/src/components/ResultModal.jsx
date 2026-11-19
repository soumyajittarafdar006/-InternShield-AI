import React from 'react';
import jsPDF from 'jspdf';
import { ArrowLeft, Download, RotateCcw, Info, Building2, Mail, ShieldAlert, CheckCircle2, AlertTriangle } from 'lucide-react';
import RiskGauge from './RiskGauge';
import FindingsList from './FindingsList';
import { Panel, Tag, StatusTag, DL, Notice } from './ui';
import { riskBand, BAND, DEFAULT_ACTIONS, sortFindings, formatMoney } from '../lib/risk';
import { extractEmailDomain, FREE_DOMAINS } from '../services/domainCheck';

const BAND_THEME = {
  high: {
    topBar: 'bg-red-600',
    callout: 'border-red-300 bg-red-50 text-red-950',
    calloutIcon: 'text-red-600',
    Icon: ShieldAlert,
  },
  medium: {
    topBar: 'bg-amber-500',
    callout: 'border-amber-300 bg-amber-50 text-amber-950',
    calloutIcon: 'text-amber-700',
    Icon: AlertTriangle,
  },
  low: {
    topBar: 'bg-teal-600',
    callout: 'border-teal-300 bg-teal-50 text-teal-950',
    calloutIcon: 'text-teal-700',
    Icon: CheckCircle2,
  },
};

const CHECK_COLS = 'md:grid-cols-[12rem_minmax(0,1fr)_8rem_minmax(0,1.3fr)]';

function ageText(days) {
  if (days < 60) return `${days} day${days === 1 ? '' : 's'}`;
  if (days < 730) return `${Math.round(days / 30)} months`;
  return `${(days / 365).toFixed(1)} years`;
}

function buildChecks(result) {
  const m = result.metadata || {};
  const intel = result.domain_intel || null;
  const reasons = result.reasons || [];
  const email = (m.recruiter_email || '').trim();
  const hasEmail = email.includes('@');
  const domain = hasEmail ? extractEmailDomain({ email }) : '';
  const isFree = Boolean(domain) && FREE_DOMAINS.includes(domain);
  const corporate = Boolean(domain) && !isFree;
  const rows = [];

  if (!hasEmail) {
    rows.push({ label: 'Recruiter email', value: 'Not provided', status: 'unknown', note: 'No recruiter email was supplied, so email-domain checks could not run.' });
  } else if (isFree) {
    rows.push({ label: 'Recruiter email', value: email, status: 'suspicious', tone: 'danger', note: `${domain} is a free public mailbox, not a company domain.` });
  } else {
    rows.push({ label: 'Recruiter email', value: email, status: 'unknown', note: `Company domain (${domain}). This check does not prove who owns the domain.` });
  }

  if (corporate) {
    const dns = intel?.dns_resolves;
    rows.push({
      label: 'Domain resolves (DNS)',
      value: domain,
      status: dns === true ? 'verified' : dns === false ? 'suspicious' : 'unknown',
      tone: dns === false ? 'danger' : undefined,
      note:
        dns === true ? 'The domain has DNS records.'
        : dns === false ? 'No DNS records found. A real company email domain always resolves.'
        : 'The lookup did not complete, so this is unknown.',
    });

    const live = intel?.site_live;
    rows.push({
      label: 'Website at email domain',
      value: `https://${domain}`,
      status: live === true ? 'verified' : live === false ? 'suspicious' : 'unknown',
      note:
        live === true ? 'A server answered at this address. That does not confirm the site belongs to the company named in the offer.'
        : live === false ? 'Nothing answered at this address.'
        : 'Not determined.',
    });

    const age = intel?.age_days;
    if (typeof age === 'number') {
      rows.push({
        label: 'Domain registration',
        value: `${intel.created || 'Date unknown'} · ${ageText(age)} old`,
        status: age >= 1825 ? 'verified' : age < 180 ? 'suspicious' : 'unknown',
        tone: age < 60 ? 'danger' : 'caution',
        note:
          age < 60 ? 'Very recent registrations are common in throwaway scam infrastructure.'
          : age < 180 ? 'A fairly new domain. Verify the company through other channels.'
          : age >= 1825 ? 'A long-lived domain is hard for a short-term scam to fake, but it is not proof of identity.'
          : 'Age alone neither confirms nor rules out legitimacy.',
      });
    } else {
      rows.push({ label: 'Domain registration', value: 'Not available', status: 'unknown', note: 'The registration date could not be retrieved.' });
    }
  }

  const look = intel?.lookalike;
  if (look) {
    rows.push({ label: 'Brand lookalike check', value: `${look.host} ≈ ${look.brand}`, status: 'suspicious', tone: 'danger', note: `Imitates ${look.brand}. Official domain(s): ${(look.official || []).join(', ')}.` });
  } else if (corporate && intel) {
    rows.push({ label: 'Brand lookalike check', value: 'No match', status: 'clear', note: 'No match against the built-in list of well-known brands.' });
  }

  if (!result.summary_only) {
    const feeFlag = reasons.some((r) => r.id === 'fee_requested');
    rows.push({
      label: 'Registration or training fee',
      value: formatMoney(m.registration_fee) || 'None declared',
      status: feeFlag ? 'suspicious' : 'clear',
      tone: feeFlag ? 'danger' : undefined,
      note: feeFlag ? 'A fee or deposit demand was detected. Genuine internships do not charge applicants.' : 'No fee demand was detected in the submitted text.',
    });
  }
  return rows;
}

const pdfSafe = (s) => String(s ?? '').replace(/₹/g, 'Rs ').replace(/≈/g, '~').replace(/[^\x00-\xFF]/g, '?');

function downloadPdf(result) {
  try {
    const band = riskBand(result.risk_score);
    const meta = BAND[band];
    const m = result.metadata || {};
    const doc = new jsPDF();
    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();
    const M = 15;
    let y = 0;
    const ensure = (h) => {
      if (y + h > H - 22) {
        doc.addPage();
        y = 20;
      }
    };
    const write = (text, x, size, style, color, width) => {
      doc.setFontSize(size);
      doc.setFont('helvetica', style);
      doc.setTextColor(...color);
      const lines = doc.splitTextToSize(pdfSafe(text), width);
      lines.forEach((ln) => {
        ensure(size * 0.5);
        doc.text(ln, x, y);
        y += size * 0.5;
      });
    };

    doc.setFillColor(15, 76, 92);
    doc.rect(0, 0, W, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('InternShield', M, 14);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Internship offer analysis report', M, 21);
    doc.text(pdfSafe(`Generated: ${result.timestamp || new Date().toLocaleString()}`), W - M, 21, { align: 'right' });

    const fill = { high: [220, 38, 38], medium: [217, 119, 6], low: [15, 118, 110] }[band];
    doc.setFillColor(...fill);
    doc.roundedRect(M, 38, W - 2 * M, 22, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text(`${meta.label.toUpperCase()}  |  Score ${Math.round(result.risk_score)} / 100`, M + 6, 48);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(pdfSafe(meta.headline), M + 6, 55);

    y = 72;
    write('Offer details', M, 12, 'bold', [22, 22, 21], W - 2 * M);
    y += 2;
    [
      ['Role', m.title],
      ['Company', m.company],
      ['Recruiter email', m.recruiter_email],
      ['Stipend', formatMoney(m.stipend)],
      ['Fee declared', formatMoney(m.registration_fee)],
    ].forEach(([k, v]) => write(`${k}: ${v || 'Not provided'}`, M, 10, 'normal', [68, 64, 60], W - 2 * M));

    y += 6;
    const findings = sortFindings(result.reasons || []).slice(0, 8);
    write('Findings', M, 12, 'bold', [22, 22, 21], W - 2 * M);
    y += 2;
    if (!findings.length) {
      write(result.summary_only ? 'Detailed findings were not saved for this record.' : 'No scam indicators were detected in the submitted details.', M, 10, 'normal', [68, 64, 60], W - 2 * M);
    }
    findings.forEach((f) => {
      ensure(24);
      const c = f.severity === 'POSITIVE' ? [15, 118, 110] : f.severity === 'MEDIUM' ? [180, 83, 9] : [185, 28, 28];
      write(`[${f.severity}] ${f.title}`, M, 10, 'bold', c, W - 2 * M);
      write(f.explanation, M + 3, 9, 'normal', [68, 64, 60], W - 2 * M - 3);
      if (f.evidence) write(`Evidence: ${f.evidence}`, M + 3, 9, 'normal', [120, 113, 108], W - 2 * M - 3);
      y += 3;
    });

    y += 3;
    write('Recommended actions', M, 12, 'bold', [22, 22, 21], W - 2 * M);
    y += 2;
    const actions = (result.safety_recommendations || []).length ? result.safety_recommendations : DEFAULT_ACTIONS[band];
    actions.slice(0, 5).forEach((a) => write(`- ${a}`, M, 9, 'normal', [68, 64, 60], W - 2 * M));

    const pages = doc.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i);
      doc.setDrawColor(231, 229, 228);
      doc.line(M, H - 16, W - M, H - 16);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(120, 113, 108);
      doc.text('Heuristic assessment. It does not replace independent verification of the company.', M, H - 10);
      doc.text(`${i} / ${pages}`, W - M, H - 10, { align: 'right' });
    }

    doc.save(`InternShield_Report_${(m.title || 'Internship').replace(/[^a-z0-9]/gi, '_')}.pdf`);
  } catch (err) {
    console.error('PDF generation failed:', err);
    alert('Could not generate the PDF. Use your browser print dialog (Ctrl+P) to save this page instead.');
  }
}

export default function ResultModal({ result, onReset, onGoToDashboard }) {
  if (!result) return null;

  const band = riskBand(result.risk_score);
  const meta = BAND[band];
  const theme = BAND_THEME[band];
  const VerdictIcon = theme.Icon;
  const m = result.metadata || {};
  const reasons = result.reasons || [];
  const summaryOnly = Boolean(result.summary_only);
  const checks = summaryOnly ? [] : buildChecks(result);
  const actions = (result.safety_recommendations || []).length ? result.safety_recommendations : DEFAULT_ACTIONS[band];
  const confidence = typeof result.model_confidence === 'number' ? `${result.model_confidence}%` : '';
  const engine = result.is_demo_mode
    ? 'Built-in rule engine (analysis server was unreachable)'
    : result.model_used || 'Not recorded';

  return (
    <div className="page space-y-6 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button type="button" onClick={onReset} className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 transition-colors hover:text-[#0F4C5C]">
          <ArrowLeft className="h-4 w-4" />
          Analyse another offer
        </button>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => downloadPdf(result)} className="btn btn-secondary">
            <Download className="h-4 w-4" />
            Download PDF
          </button>
          <button type="button" onClick={onGoToDashboard} className="btn btn-secondary">
            View history
          </button>
        </div>
      </div>

      {/* Verdict */}
      <section className="overflow-hidden rounded-lg border border-stone-300 bg-white">
        <div className={`h-1.5 w-full ${theme.topBar}`} />
        <div className="grid gap-8 p-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:p-7">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Tag tone={meta.tone}>{meta.label}</Tag>
              {result.is_demo_mode && <Tag>Rule-based fallback</Tag>}
              {result.is_sample && <Tag>Sample record</Tag>}
              {summaryOnly && <Tag>Summary record</Tag>}
            </div>

            <h1 className="display mt-3.5 text-2xl font-bold text-stone-900 sm:text-3xl">
              {m.title || 'Internship offer'}
            </h1>

            <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-stone-600">
              <span className="inline-flex items-center gap-1.5 font-medium text-stone-800">
                <Building2 className="h-4 w-4 text-stone-400" aria-hidden="true" />
                {m.company || 'Unspecified organisation'}
              </span>
              {m.recruiter_email && m.recruiter_email.includes('@') && (
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="h-4 w-4 text-stone-400" aria-hidden="true" />
                  <span className="font-mono text-xs text-stone-700">{m.recruiter_email}</span>
                </span>
              )}
            </div>

            <div className={`mt-5 flex items-start gap-3 rounded-md border p-3.5 ${theme.callout}`}>
              <VerdictIcon className={`mt-0.5 h-4 w-4 shrink-0 ${theme.calloutIcon}`} aria-hidden="true" />
              <div>
                <p className="text-sm font-bold">{meta.headline}</p>
                <p className="mt-0.5 text-xs leading-5 opacity-90">{meta.summary}</p>
              </div>
            </div>

            <p className="mt-4 font-mono text-[11px] text-stone-400">
              {result.analysis_id ? `ID ${result.analysis_id}` : ''}
              {result.analysis_id && result.timestamp ? ' · ' : ''}
              {result.timestamp || ''}
            </p>
          </div>

          <div className="border-t border-stone-200 pt-5 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0 lg:self-center">
            <RiskGauge score={result.risk_score} />
          </div>
        </div>
      </section>

      {result.is_demo_mode && (
        <Notice tone="caution" title="Result from built-in rule engine">
          The analysis server could not be reached, so no machine-learning model was used. The score reflects fixed rules plus any domain lookups that completed.
        </Notice>
      )}

      {summaryOnly && (
        <Notice icon={Info} title="Summary-only record">
          {result.is_sample
            ? 'This is a placeholder sample record, not a real analysis. '
            : 'Detailed findings were not stored when this entry was created. '}
          Run the offer through Analyse again to get the full evidence.
        </Notice>
      )}

      {/* Alerts & Findings */}
      {!summaryOnly && (
        <Panel
          title="Alerts & evidence"
          description="Sorted by severity so urgent warnings appear first."
          action={
            <span className="font-mono text-xs text-stone-500">
              {reasons.length} {reasons.length === 1 ? 'finding' : 'findings'}
            </span>
          }
          bodyClassName=""
        >
          {reasons.length ? (
            <FindingsList reasons={reasons} />
          ) : (
            <div className="flex items-center gap-2.5 bg-teal-50/50 px-5 py-5 text-sm text-teal-900">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-700" />
              No scam indicators were detected in the submitted details. Confirm the company independently.
            </div>
          )}
        </Panel>
      )}

      {/* Verification checks */}
      {checks.length > 0 && (
        <Panel title="Verification checks" description="What was looked up or tested." bodyClassName="">
          <div className={`hidden gap-6 border-b border-stone-200 bg-stone-50 px-5 py-2 font-mono text-[11px] uppercase tracking-wider text-stone-500 md:grid ${CHECK_COLS}`}>
            <div>Check</div>
            <div>Result</div>
            <div>Status</div>
            <div>Note</div>
          </div>
          <ul className="divide-y divide-stone-200">
            {checks.map((c) => {
              const rowTint =
                c.status === 'suspicious'
                  ? 'bg-red-50/45'
                  : c.status === 'verified'
                  ? 'bg-teal-50/30'
                  : 'bg-white';
              return (
                <li key={c.label} className={`grid gap-2 px-5 py-3.5 md:items-start md:gap-6 ${rowTint} ${CHECK_COLS}`}>
                  <div className="text-sm font-semibold text-stone-900">{c.label}</div>
                  <div className="break-all font-mono text-xs leading-5 text-stone-800">{c.value}</div>
                  <div>
                    <StatusTag status={c.status} tone={c.status === 'suspicious' ? c.tone : undefined} />
                  </div>
                  <div className="text-xs leading-5 text-stone-600">{c.note}</div>
                </li>
              );
            })}
          </ul>
        </Panel>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <Panel title="Recommended actions">
            <ol className="-my-2 divide-y divide-stone-100">
              {actions.map((a, i) => (
                <li key={i} className="flex items-start gap-3 py-2.5 text-sm text-stone-700">
                  <span className="font-mono text-xs font-semibold text-[#0F4C5C] leading-6">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="leading-6">{a}</span>
                </li>
              ))}
            </ol>
          </Panel>

          {!summaryOnly && result.top_keywords?.length > 0 && (
            <Panel
              title="Text-model vocabulary influence"
              description="Terms that pushed the TF-IDF classifier toward scam or genuine."
            >
              <div className="flex flex-wrap gap-2">
                {result.top_keywords.map((kw, i) => (
                  <Tag key={i} tone={kw.direction === 'fake' ? 'danger' : 'verified'} mono>
                    {kw.word} {kw.weight > 0 ? `+${kw.weight}` : kw.weight}
                  </Tag>
                ))}
              </div>
            </Panel>
          )}
        </div>

        <div className="space-y-6">
          <Panel title="Submitted details">
            <DL
              items={[
                { label: 'Role', value: m.title },
                { label: 'Company', value: m.company },
                { label: 'Email', value: m.recruiter_email, mono: true },
                { label: 'Stipend', value: formatMoney(m.stipend), mono: true },
                { label: 'Fee declared', value: formatMoney(m.registration_fee), mono: true },
                { label: 'Duration', value: m.duration },
              ]}
            />
          </Panel>
          <Panel title="How this was produced">
            <DL
              items={[
                { label: 'Engine', value: engine },
                { label: 'Model label', value: result.is_demo_mode ? '' : result.prediction, mono: true },
                { label: 'Model confidence', value: confidence, mono: true },
                { label: 'Domain lookups', value: result.domain_intel ? (result.domain_intel.source === 'backend' ? 'Analysis server' : 'Browser (public DNS and RDAP)') : 'Not run' },
              ]}
            />
          </Panel>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-stone-200 pt-6">
        <p className="max-w-xl text-xs leading-5 text-stone-500">
          Heuristic assessment from a text classifier, rule checks, and domain lookups. It does not replace verifying the company yourself.
        </p>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-2 rounded-md bg-[#0F4C5C] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0B3A47]"
        >
          <RotateCcw className="h-4 w-4" />
          Analyse another offer
        </button>
      </div>
    </div>
  );
}