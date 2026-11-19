import React from 'react';
import { CheckCircle2, AlertTriangle, ShieldAlert, Info, Loader2 } from 'lucide-react';

/* Small, flat building blocks shared by every page. */

const TONES = {
  danger: 'border-danger/25 bg-danger-soft text-danger-ink',
  caution: 'border-caution/30 bg-caution-soft text-caution-ink',
  verified: 'border-verified/30 bg-verified-soft text-verified-ink',
  neutral: 'border-line bg-canvas text-muted',
  navy: 'border-navy bg-navy text-white',
};

export function Tag({ tone = 'neutral', icon: Icon, mono = false, className = '', children }) {
  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded border px-1.5 py-0.5 text-xs font-semibold leading-4 ${
        mono ? 'font-mono' : ''
      } ${TONES[tone] || TONES.neutral} ${className}`}
    >
      {Icon && <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
      {children}
    </span>
  );
}

/**
 * Verification state of a single check or finding.
 *  verified   - confirmed by a lookup that actually ran
 *  clear      - the check ran and found nothing (not the same as verified)
 *  suspicious - a red flag
 *  unknown    - could not be determined, or not applicable
 */
const STATUS = {
  verified: { label: 'Verified', tone: 'verified', icon: CheckCircle2 },
  clear: { label: 'Clear', tone: 'neutral', icon: CheckCircle2 },
  suspicious: { label: 'Suspicious', tone: 'danger', icon: ShieldAlert },
  unknown: { label: 'Unknown', tone: 'neutral', icon: Info },
};
export const STATUS_META = STATUS;

export function StatusTag({ status, tone }) {
  const s = STATUS[status] || STATUS.unknown;
  const t = tone || s.tone;
  const Icon = status === 'suspicious' && t === 'caution' ? AlertTriangle : s.icon;
  return (
    <Tag tone={t} icon={Icon}>
      {s.label}
    </Tag>
  );
}

export function Panel({ title, description, action, children, className = '', bodyClassName = 'p-5' }) {
  return (
    <section className={`rounded-lg border border-line bg-surface ${className}`}>
      {(title || action) && (
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4">
          <div>
            {title && <h2 className="text-sm font-bold text-ink">{title}</h2>}
            {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
          </div>
          {action}
        </header>
      )}
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}

export function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h1 className="display text-4xl text-ink">{title}</h1>
        {description && <p className="mt-2 text-muted">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

/** Label / value list. items: [{ label, value, mono }] */
export function DL({ items, className = '' }) {
  return (
    <dl className={`divide-y divide-line ${className}`}>
      {items.map((it) => (
        <div key={it.label} className="grid grid-cols-[8rem_minmax(0,1fr)] gap-3 py-2.5 text-sm">
          <dt className="text-muted">{it.label}</dt>
          <dd className={`min-w-0 break-words ${it.mono ? 'font-mono text-[13px]' : ''}`}>{it.value || '—'}</dd>
        </div>
      ))}
    </dl>
  );
}

const NOTICE_TONES = {
  neutral: 'border-line bg-surface text-ink',
  caution: 'border-caution/30 bg-caution-soft text-caution-ink',
  danger: 'border-danger/25 bg-danger-soft text-danger-ink',
  verified: 'border-verified/30 bg-verified-soft text-verified-ink',
};

export function Notice({ tone = 'neutral', icon: Icon = Info, title, children, className = '' }) {
  return (
    <div className={`flex items-start gap-3 rounded-md border px-4 py-3 text-sm ${NOTICE_TONES[tone]} ${className}`} role="status">
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <div className="min-w-0">
        {title && <p className="font-semibold">{title}</p>}
        <div className={title ? 'mt-0.5' : ''}>{children}</div>
      </div>
    </div>
  );
}

export function Spinner({ className = 'h-4 w-4' }) {
  return <Loader2 className={`${className} animate-spin`} aria-hidden="true" />;
}
