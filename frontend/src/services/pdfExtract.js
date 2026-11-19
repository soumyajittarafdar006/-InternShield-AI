/**
 * Reads text out of a PDF in the browser (nothing is uploaded anywhere)
 * and guesses the form fields from it. The user always reviews the result.
 */

export async function extractPdfText(file) {
  const pdfjs = await import('pdfjs-dist');
  const worker = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default;
  pdfjs.GlobalWorkerOptions.workerSrc = worker;

  const data = new Uint8Array(await file.arrayBuffer());
  const pdf = await pdfjs.getDocument({ data }).promise;
  let text = '';
  const pages = Math.min(pdf.numPages, 15);
  for (let p = 1; p <= pages; p++) {
    const page = await pdf.getPage(p);
    const content = await page.getTextContent();
    content.items.forEach((it) => {
      text += it.str + (it.hasEOL ? '\n' : ' ');
    });
    text += '\n';
  }
  return { text: text.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim(), pages };
}

const NEGATION = /(no|nil|zero|without|free of|not charge[sd]?|never)\s+(?:\w+\s+){0,2}$/i;

function firstMatch(text, re) {
  const m = text.match(re);
  return m ? m[1].trim() : '';
}

function findFee(raw) {
  const text = raw.replace(/\s+/g, ' ');
  const re = /(registration|security|training|processing|onboarding|documentation|refundable|enrol?lment|joining)[^.\n]{0,40}?(fee|deposit|charges?)([^.\n]{0,40}?(?:rs\.?|inr|₹)\s*([\d,]+))?/gi;
  let m;
  while ((m = re.exec(text))) {
    const before = text.slice(Math.max(0, m.index - 25), m.index);
    if (NEGATION.test(before)) continue;
    if (m[4]) return m[4].replace(/,/g, '');
    return 'Mentioned in the offer';
  }
  return '';
}

function findStipend(raw) {
  const text = raw.replace(/\s+/g, ' ');
  const re = /(stipend|salary|earn|compensation|payout|pay)[^0-9₹\n]{0,30}(?:rs\.?|inr|₹)?\s*([\d,]+)(?:\s*(?:to|-|–)\s*(?:rs\.?|inr|₹)?\s*([\d,]+))?/i;
  const m = text.match(re);
  if (!m) return '';
  const a = parseInt(m[2].replace(/,/g, ''), 10);
  const b = m[3] ? parseInt(m[3].replace(/,/g, ''), 10) : 0;
  const top = Math.max(a || 0, b || 0);
  return top ? String(top) : '';
}

function findDuration(text) {
  const m = text.match(/(\d+)\s*(?:-|to)?\s*(\d+)?\s*(months?|weeks?)/i);
  if (!m) return '';
  const n = m[2] || m[1];
  const unit = m[3].toLowerCase().startsWith('m') ? 'Months' : 'Weeks';
  return `${n} ${unit}`;
}

function findTitle(lines) {
  const labelled = lines.find((l) => /^(position|role|title|job title|internship)\s*[:\-]/i.test(l));
  if (labelled) return labelled.replace(/^[^:\-]+[:\-]\s*/, '').slice(0, 120);
  const intern = lines.find((l) => /intern/i.test(l) && l.length < 100);
  return (intern || lines[0] || '').slice(0, 120);
}

function findCompany(lines) {
  const labelled = lines.find((l) => /^(company|organi[sz]ation|employer|firm)\s*(name)?\s*[:\-]/i.test(l));
  if (labelled) return labelled.replace(/^[^:\-]+[:\-]\s*/, '').slice(0, 100);
  const named = lines.find((l) => l.length < 70 && /\b(pvt|ltd|inc|llp|technologies|solutions|services|studio|agency|systems|labs)\b/i.test(l));
  return named || '';
}

function findRequirements(text) {
  const m = text.match(/(?:requirements?|eligibility|qualifications?|skills required)\s*[:\-]?\s*\n?([\s\S]{20,600}?)(?:\n\s*\n|$)/i);
  return m ? m[1].replace(/\s+/g, ' ').trim() : '';
}

/** Returns only the fields it found, so the rest of the form is left alone. */
export function parseOfferText(text) {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const found = {
    title: findTitle(lines),
    company: findCompany(lines),
    email: firstMatch(text, /([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/),
    website: firstMatch(text, /((?:https?:\/\/|www\.)[^\s)>,]+)/),
    registration_fee: findFee(text),
    stipend: findStipend(text),
    duration: findDuration(text),
    requirements: findRequirements(text),
    description: text.replace(/\s+/g, ' ').slice(0, 3000),
    full_text: text.slice(0, 6000),
  };
  Object.keys(found).forEach((k) => { if (!found[k]) delete found[k]; });
  return found;
}