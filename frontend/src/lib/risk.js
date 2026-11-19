/**
 * Shared risk vocabulary: score bands, finding status, next-step guidance, formatting.
 * Bands match the thresholds already used by the analysis engine (>60 high, >30 medium).
 */

// Records seeded by DEMO_HISTORY_SEED have ids like "hist-001". Real analyses never do.
export const isSampleRecord = (item) => Boolean(item?.sample) || /^hist-\d{3}$/.test(item?.id || '');

export function riskBand(score) {
  const s = Number(score) || 0;
  if (s > 60) return 'high';
  if (s > 30) return 'medium';
  return 'low';
}

export const BAND = {
  high: {
    key: 'high',
    label: 'High risk',
    tone: 'danger',
    headline: 'Multiple scam indicators found',
    summary:
      'This offer shows patterns commonly seen in internship fee and data-harvesting scams. Treat it as unsafe until the company confirms it through an official channel.',
  },
  medium: {
    key: 'medium',
    label: 'Medium risk',
    tone: 'caution',
    headline: 'Some indicators need checking',
    summary:
      'Nothing here proves fraud, but several details are irregular. Verify the company and the recruiter independently before replying or sharing documents.',
  },
  low: {
    key: 'low',
    label: 'Low risk',
    tone: 'verified',
    headline: 'No major scam indicators found',
    summary:
      'No strong scam signals were detected in the details you submitted. This is not proof that the company or the offer is genuine, so confirm both before sharing personal documents.',
  },
};

export const DEFAULT_ACTIONS = {
  high: [
    'Do not pay any fee, deposit or "refundable" amount, and do not send ID or bank documents.',
    'Report the posting to your college placement cell.',
    'Verify the company through its official website, LinkedIn page or the MCA company registry.',
  ],
  medium: [
    'Verify the company through its official website, LinkedIn page or the MCA company registry.',
    'Ask the recruiter to write from an official company email address.',
    'Do not share Aadhaar, PAN or bank details until you hold a formal offer from a verified company.',
  ],
  low: [
    'Confirm the recruiter is listed on the company\'s official careers page.',
    'Never pay money to secure an internship.',
    'Share ID documents only after you have received a formal offer.',
  ],
};

/* ---------- findings ---------- */

const SEVERITY_RANK = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3, POSITIVE: 4 };
export const sortFindings = (list = []) =>
  [...list].sort((a, b) => (SEVERITY_RANK[a.severity] ?? 3) - (SEVERITY_RANK[b.severity] ?? 3));

// Only findings backed by an actual lookup are "verified". A website that was merely listed is not.
const VERIFIED_IDS = new Set(['live_website', 'domain_established']);

export function findingStatus(f) {
  if (f.severity === 'POSITIVE') return VERIFIED_IDS.has(f.id) ? 'verified' : 'unknown';
  return 'suspicious';
}

export const findingTone = (f) => (f.severity === 'MEDIUM' || f.severity === 'LOW' ? 'caution' : 'danger');

const NEXT_STEPS = {
  fee_requested:
    'Do not pay. Genuine internships do not charge applicants. Ask for the offer on company letterhead and confirm it with the company\'s official HR contact.',
  free_email_domain:
    'Find the company\'s official careers page and check that this recruiter is listed, or write to the company\'s published HR address.',
  sensitive_docs_requested:
    'Do not send Aadhaar, PAN or bank details yet. Share ID documents only after you have verified the company and received a formal offer.',
  whatsapp_only_hiring:
    'Ask for an email from an official company domain. Do not continue only over WhatsApp or Telegram.',
  urgency_pressure:
    'Take your time. Genuine employers let candidates verify an offer before replying.',
  unrealistic_stipend:
    'Compare with typical stipends for this role. A very high stipend for simple work is a common hook.',
  website_present:
    'Open the website yourself and check that it matches the recruiter, role and contact details.',
  lookalike_domain:
    'Do not reply. Type the real company\'s address into your browser yourself and look for this role there.',
  domain_not_resolving:
    'Do not reply to this address. Mail sent to a domain that does not exist cannot reach a real recruiter.',
  no_live_website:
    'Search for the company independently and look for a working website, LinkedIn page or registry entry.',
  live_website:
    'Open the site and check that it describes a real organisation matching the offer.',
  domain_very_new:
    'Verify the company through LinkedIn, the MCA company registry or your placement cell before engaging.',
  domain_new:
    'Verify the company through LinkedIn, the MCA company registry or your placement cell before engaging.',
  domain_young:
    'Check the company through other channels. A young domain is not conclusive on its own.',
  domain_established:
    'Domain age alone does not prove the sender is genuine. Keep checking the other details.',
  domain_mismatch:
    'Confirm which domain is official. A recruiter email that does not match the company website is a common impersonation pattern.',
};

const SEVERITY_NEXT = {
  CRITICAL: 'Do not proceed until the company confirms this through an official channel.',
  HIGH: 'Verify this with the company directly before replying.',
  MEDIUM: 'Check this independently before relying on the offer.',
  POSITIVE: 'No action needed. Keep verifying the other details.',
};

export const nextStep = (f) => NEXT_STEPS[f.id] || SEVERITY_NEXT[f.severity] || SEVERITY_NEXT.MEDIUM;

/* ---------- formatting ---------- */

// Plain numbers are shown as rupees (the app targets Indian students); anything the user typed is shown as-is.
export function formatMoney(v) {
  if (v === undefined || v === null || v === '') return '';
  const s = String(v).trim();
  return /^\d+(\.\d+)?$/.test(s) ? `₹${Number(s).toLocaleString('en-IN')}` : s;
}

export const pct = (n, total) =>
  typeof n === 'number' && typeof total === 'number' && total > 0 ? `${((n / total) * 100).toFixed(1)}%` : '';
