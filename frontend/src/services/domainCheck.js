/**
 * Domain intelligence for InternShield AI
 *  1. Email-to-website match: does the recruiter's email domain resolve and serve a site?
 *  2. Domain age: how old is the registration (RDAP, the modern WHOIS)?
 *
 * Order of preference:
 *   a) Flask backend  GET /api/domain-check?domain=...   (most reliable, no CORS limits)
 *   b) Browser-only   DNS-over-HTTPS + no-cors probe + RDAP
 * Every step fails soft: an unknown result never raises the risk score.
 */

import TRUSTED_BRANDS from './trustedBrands.json';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const FREE_DOMAINS = [
  'gmail.com', 'googlemail.com', 'yahoo.com', 'yahoo.in', 'outlook.com', 'hotmail.com',
  'live.com', 'rediffmail.com', 'ymail.com', 'protonmail.com', 'proton.me', 'icloud.com', 'aol.com',
];

const EMAIL_RE = /[A-Za-z0-9._%+-]+@([A-Za-z0-9.-]+\.[A-Za-z]{2,})/;

function withTimeout(ms) {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), ms);
  return { signal: c.signal, done: () => clearTimeout(t) };
}

export function extractEmailDomain(data = {}) {
  const email = (data.email || '').toLowerCase().trim();
  let m = email.match(EMAIL_RE);
  if (!m) m = `${data.full_text || ''} ${data.description || ''}`.toLowerCase().match(EMAIL_RE);
  return m ? m[1] : '';
}

export function extractWebsiteHost(website = '') {
  try {
    const u = new URL(/^https?:\/\//i.test(website) ? website : `https://${website}`);
    return u.hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return '';
  }
}

/** Registrable-ish domain: mail.acme.co.in -> acme.co.in (simple heuristic). */
function rootDomain(host) {
  const parts = host.split('.');
  if (parts.length <= 2) return host;
  const secondLevel = ['co', 'com', 'org', 'net', 'ac', 'gov', 'edu', 'in'];
  const tail = parts.slice(-2);
  return secondLevel.includes(tail[0]) && parts.length >= 3 ? parts.slice(-3).join('.') : tail.join('.');
}


// ---------------------------------------------------------------------------
// Lookalike / typosquatting detection (pure string matching, no network needed)
// Brand list lives in trustedBrands.json: key = brand token, value = official domains.
// ---------------------------------------------------------------------------

// Words scammers bolt onto a brand name. A brand may be "contained" only with these around it,
// so "intelligent-systems" or "postmanagement" are not mistaken for Intel / Postman.
const BRAND_FILLER = /^(?:careers?|jobs?|hr|hiring|recruit(?:ment|ing|er)?|internships?|intern|talent|campus|apply|official|india|in|global|group|portal|offers?|team|support|training|placement|online|work|vacanc(?:y|ies)|verify|verification|registration|corp|ltd|pvt|limited|tech|technologies|solutions|services|consulting|the|my|new|now)+$/;

function levenshtein(a, b) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
  }
  return dp[a.length][b.length];
}

/** inf0sys -> infosys, goog1e -> google / googie (digits swapped for look-alike letters). */
function leetVariants(label) {
  const base = label.replace(/0/g, 'o').replace(/3/g, 'e').replace(/4/g, 'a').replace(/5/g, 's').replace(/7/g, 't');
  const variants = new Set([label, base.replace(/1/g, 'i'), base.replace(/1/g, 'l')]);
  // look-alike letter pairs: rnyntra -> myntra, vvipro -> wipro
  for (const v of [...variants]) variants.add(v.replace(/rn/g, 'm').replace(/vv/g, 'w'));
  return [...variants];
}

/**
 * Returns { brand, official, kind, host, label } if the host imitates a known brand
 * without being one of that brand's official domains; otherwise null.
 */
export function detectLookalike(host) {
  host = (host || '').toLowerCase().replace(/^www\./, '');
  if (!host) return null;

  // Official domain or a subdomain of one -> trusted, never flagged
  for (const officials of Object.values(TRUSTED_BRANDS)) {
    if (officials.some((o) => host === o || host.endsWith(`.${o}`))) return null;
  }

  const label = rootDomain(host).split('.')[0];

  for (const [brand, official] of Object.entries(TRUSTED_BRANDS)) {
    for (const v of leetVariants(label)) {
      const parts = v.split(/[-_]+/).filter(Boolean);
      const joined = v.replace(/[-_]/g, '');
      const leet = v !== label;

      // Exact brand word inside the label: tcs-careers-india, infosys-hr, inf0sys-jobs
      const rest = joined.replace(brand, '');
      const embedded = brand.length >= 5 && joined.includes(brand) && (rest === '' || BRAND_FILLER.test(rest));
      if (parts.includes(brand) || embedded) {
        return { brand, official, host, label, kind: leet ? 'leet' : 'contains' };
      }

      // Near-miss spelling: infosis, gooogle, wiprro (only for longer brand names)
      if (brand.length >= 5) {
        const maxDist = brand.length >= 8 ? 2 : 1;
        const near = [...parts, joined].some(
          (p) => p.length >= brand.length - 1 && p.length <= brand.length + 2 && levenshtein(p, brand) <= maxDist,
        );
        if (near) return { brand, official, host, label, kind: 'typo' };
      }
    }
  }
  return null;
}

async function dnsResolves(domain) {
  const t = withTimeout(4000);
  try {
    const r = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=A`, { signal: t.signal });
    const j = await r.json();
    if (j.Status === 3) return false; // NXDOMAIN
    return Array.isArray(j.Answer) && j.Answer.length > 0;
  } catch {
    return null; // unknown
  } finally {
    t.done();
  }
}

async function siteIsLive(domain) {
  let timedOut = false;
  for (const host of [domain, `www.${domain}`]) {
    const t = withTimeout(5000);
    try {
      // no-cors: we can't read the response, but a resolved promise means a server answered.
      await fetch(`https://${host}`, { mode: 'no-cors', signal: t.signal });
      return true;
    } catch (e) {
      if (e && e.name === 'AbortError') timedOut = true; // slow network, not proof the site is down
    } finally {
      t.done();
    }
  }
  return timedOut ? null : false; // null = unknown
}

async function domainAge(domain) {
  const t = withTimeout(6000);
  try {
    const r = await fetch(`https://rdap.org/domain/${encodeURIComponent(domain)}`, { signal: t.signal });
    if (!r.ok) return null;
    const j = await r.json();
    const reg = (j.events || []).find((e) => e.eventAction === 'registration');
    if (!reg?.eventDate) return null;
    const created = new Date(reg.eventDate);
    const registrarEntity = (j.entities || []).find((e) => (e.roles || []).includes('registrar'));
    const registrar = registrarEntity?.vcardArray?.[1]?.find((v) => v[0] === 'fn')?.[3] || null;
    return {
      created: created.toISOString().slice(0, 10),
      age_days: Math.max(0, Math.floor((Date.now() - created.getTime()) / 86400000)),
      registrar,
    };
  } catch {
    return null;
  } finally {
    t.done();
  }
}

export async function checkDomain(domain) {
  if (!domain) return null;

  // a) Backend first
  const t = withTimeout(8000);
  try {
    const r = await fetch(`${API_BASE_URL}/domain-check?domain=${encodeURIComponent(domain)}`, { signal: t.signal });
    if (r.ok) return { ...(await r.json()), domain, source: 'backend' };
  } catch {
    /* fall through to browser checks */
  } finally {
    t.done();
  }

  // b) Browser-only
  const [dns, age] = await Promise.all([dnsResolves(domain), domainAge(domain)]);
  const live = dns === false ? false : await siteIsLive(domain);
  return {
    domain,
    dns_resolves: dns,
    site_live: live,
    age_days: age?.age_days ?? null,
    created: age?.created ?? null,
    registrar: age?.registrar ?? null,
    source: 'browser',
  };
}

function fmtAge(days) {
  if (days < 60) return `${days} day${days === 1 ? '' : 's'}`;
  if (days < 730) return `${Math.round(days / 30)} months`;
  return `${(days / 365).toFixed(1)} years`;
}

/** Turns a domain report into risk signals + a score delta. */
function buildSignals(intel, data, existingReasons, look) {
  const signals = [];
  let delta = 0;
  const { domain } = intel;
  const hasCritical = existingReasons.some((r) => r.severity === 'CRITICAL') || !!look;

  // 0. Brand impersonation / lookalike domain
  if (look) {
    const how = { contains: 'embeds the brand name', leet: 'swaps letters for look-alike digits', typo: 'is a near-miss spelling' }[look.kind];
    signals.push({
      id: 'lookalike_domain', title: 'Brand Impersonation / Lookalike Domain', severity: 'CRITICAL', weight: 45,
      explanation: `"${look.host}" ${how} of "${look.brand}" but is not an official ${look.brand} domain. Scammers register lookalike domains to pass as big-name recruiters.`,
      evidence: `Official domain(s): ${look.official.join(', ')} | Found: ${look.host}`,
    });
    delta += 45;
  }

  // 1. Email-to-website match
  if (intel.dns_resolves === false) {
    signals.push({
      id: 'domain_not_resolving', title: 'Recruiter Email Domain Does Not Exist', severity: 'CRITICAL', weight: 35,
      explanation: `The domain "${domain}" has no DNS records at all. A real company's email domain always resolves.`,
      evidence: `DNS lookup for ${domain}: not found (NXDOMAIN)`,
    });
    delta += 35;
  } else if (intel.site_live === false && intel.dns_resolves === true) {
    signals.push({
      id: 'no_live_website', title: 'No Working Website at Email Domain', severity: 'HIGH', weight: 20,
      explanation: `The domain "${domain}" exists, but nothing answers at https://${domain}. Scammers often register a domain only to send email from it.`,
      evidence: `https://${domain} and https://www.${domain} did not respond`,
    });
    delta += 20;
  } else if (intel.site_live === true) {
    signals.push({
      id: 'live_website', title: 'Email Domain Has a Live Website', severity: 'POSITIVE', weight: -5,
      explanation: `A website responds at ${domain}, which is consistent with a real organisation (it still needs manual checking).`,
      evidence: `https://${domain} responded`,
    });
    delta -= 5;
  }

  // 2. Domain age
  if (typeof intel.age_days === 'number') {
    const d = intel.age_days;
    const evidence = `Registered ${intel.created} (${fmtAge(d)} old)${intel.registrar ? ` via ${intel.registrar}` : ''}`;
    if (d < 30) {
      signals.push({
        id: 'domain_very_new', title: 'Brand-New Domain (under 30 days)', severity: 'CRITICAL', weight: 40,
        explanation: 'Scam campaigns typically use domains registered days before launch. Genuine employers rarely recruit from a domain this new.',
        evidence,
      });
      delta += 40;
    } else if (d < 60) {
      signals.push({
        id: 'domain_new', title: 'Very Recently Registered Domain (under 60 days)', severity: 'HIGH', weight: 30,
        explanation: 'The recruiter\'s domain is only weeks old, a common trait of throwaway scam infrastructure.',
        evidence,
      });
      delta += 30;
    } else if (d < 180) {
      signals.push({
        id: 'domain_young', title: 'Young Domain (under 6 months)', severity: 'MEDIUM', weight: 10,
        explanation: 'The domain is fairly new. Not conclusive, but verify the company through other channels.',
        evidence,
      });
      delta += 10;
    } else if (d >= 1825) {
      signals.push({
        id: 'domain_established', title: 'Established Domain (5+ years)', severity: 'POSITIVE', weight: -15,
        explanation: 'A long-lived domain is hard for a short-term scam to fake and counts in the company\'s favour.',
        evidence,
      });
      if (!hasCritical) delta -= 15; // never excuse explicit fee demands
    }
  }

  // 3. Website host differs from email domain
  const siteHost = extractWebsiteHost(data.website || '');
  if (siteHost && rootDomain(siteHost) !== rootDomain(domain)) {
    signals.push({
      id: 'domain_mismatch', title: 'Email Domain Differs From Company Website', severity: 'MEDIUM', weight: 10,
      explanation: 'The recruiter\'s email domain does not match the company website that was listed.',
      evidence: `Email domain: ${domain} | Website: ${siteHost}`,
    });
    delta += 10;
  }

  return { signals, delta };
}

/**
 * Enrich an analysis result with domain intelligence.
 * Returns the original result untouched if there is nothing to check.
 */
export async function applyDomainIntel(result, formData) {
  try {
    let domain = extractEmailDomain(formData);
    if (FREE_DOMAINS.includes(domain)) domain = '';
    const siteHost = extractWebsiteHost(formData.website || '');

    // Lookalike check is offline string matching: it works even if WHOIS/RDAP fail.
    const look = (domain && detectLookalike(domain)) || (siteHost && detectLookalike(siteHost)) || null;
    if (!domain && !look) return result;

    // Overall cap so slow networks never stall the analysis for long
    const capped = domain
      ? await Promise.race([checkDomain(domain), new Promise((r) => setTimeout(() => r(null), 10000))])
      : null;
    const intel = domain ? capped || { domain } : { domain: look.host };

    const reasons = result.reasons || [];
    const { signals, delta } = buildSignals(intel, formData, reasons, look);

    let score = Math.min(100, Math.max(0, Math.round((result.risk_score || 0) + delta)));
    // Keep the existing "explicit fee" floor, and floor brand impersonation at High Risk
    if (reasons.some((r) => r.id === 'fee_requested')) score = Math.max(score, 82);
    if (look) score = Math.max(score, 80);

    let risk_level = 'Low Risk', prediction = 'Real', status_color = 'green';
    if (score > 60) { risk_level = 'High Risk'; prediction = 'Fake'; status_color = 'red'; }
    else if (score > 30) { risk_level = 'Medium Risk'; prediction = 'Real (With Caution)'; status_color = 'yellow'; }

    return {
      ...result,
      risk_score: score,
      risk_level,
      prediction,
      status_color,
      reasons: [...signals, ...reasons],
      domain_intel: { ...intel, lookalike: look },
    };
  } catch (e) {
    console.warn('Domain intelligence skipped:', e);
    return result;
  }
}