import React, { useState } from 'react';
import { Search, Trash2, Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import { SAMPLE_OFFERS } from '../data/samples';
import { analyzeInternship } from '../services/api';
import { extractPdfText, parseOfferText } from '../services/pdfExtract';
import { extractEmailDomain, FREE_DOMAINS } from '../services/domainCheck';
import { formatMoney } from '../lib/risk';
import ResultModal from '../components/ResultModal';
import { Panel, PageHeader, DL, Notice, Spinner, Tag } from '../components/ui';

const EMPTY_FORM = {
  title: '',
  company: '',
  description: '',
  requirements: '',
  email: '',
  website: '',
  stipend: '',
  registration_fee: '',
  duration: '',
  full_text: '',
  model_name: 'Logistic Regression',
};

const plainName = (name) => name.replace(/^[^A-Za-z0-9]+/, '');

function FormSection({ step, title, children }) {
  return (
    <div className="border-t border-stone-200 pt-5 first:border-t-0 first:pt-0">
      <div className="mb-3.5 flex items-center gap-2">
        <span className="font-mono text-xs font-semibold text-[#0F4C5C]">{step}</span>
        <h3 className="text-sm font-bold text-stone-900">{title}</h3>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

export default function AnalyzePage({ onAnalysisComplete, onGoToDashboard }) {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [activeTab, setActiveTab] = useState('form');
  const [currentResult, setCurrentResult] = useState(null);
  const [pdfState, setPdfState] = useState({ status: 'idle' });
  const [dragOver, setDragOver] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (validationError) setValidationError('');
  };

  const handleClear = () => {
    setFormData(EMPTY_FORM);
    setValidationError('');
    setCurrentResult(null);
    setPdfState({ status: 'idle' });
  };

  const handleLoadSample = (sampleId) => {
    const sample = SAMPLE_OFFERS.find((s) => s.id === sampleId);
    if (sample) {
      setFormData({ ...sample.data, model_name: 'Logistic Regression' });
      setValidationError('');
      setCurrentResult(null);
    }
  };

  const handlePdf = async (file) => {
    if (!file) return;
    if (file.type !== 'application/pdf' && !/\.pdf$/i.test(file.name)) {
      setPdfState({ status: 'error', message: 'Please choose a PDF file.' });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setPdfState({ status: 'error', message: 'This PDF is larger than 10 MB. Please use a smaller file.' });
      return;
    }
    setPdfState({ status: 'reading', name: file.name });
    try {
      const { text, pages } = await extractPdfText(file);
      if (text.length < 20) {
        setPdfState({ status: 'error', message: 'This PDF has no readable text (it may be a scanned picture). Please paste the offer text instead.' });
        return;
      }
      const parsed = parseOfferText(text);
      setFormData((prev) => ({ ...prev, ...parsed }));
      setActiveTab('form');
      setValidationError('');
      setCurrentResult(null);
      setPdfState({ status: 'done', name: file.name, pages, filled: Object.keys(parsed).filter((k) => k !== 'full_text').length });
    } catch {
      setPdfState({ status: 'error', message: 'We could not read this PDF. It may be password-protected or damaged. You can paste the text instead.' });
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    const hasEnoughData =
      (formData.title.trim().length > 0 && formData.description.trim().length > 0) ||
      formData.full_text.trim().length > 20;

    if (!hasEnoughData) {
      setValidationError('Please provide at least a job title and description, or paste the offer text on the "Paste offer text" tab.');
      return;
    }

    setValidationError('');
    setIsLoading(true);
    try {
      const result = await analyzeInternship(formData);
      setCurrentResult(result);
      if (onAnalysisComplete) onAnalysisComplete(result);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setValidationError(err.message || 'An error occurred during analysis.');
    } finally {
      setIsLoading(false);
    }
  };

  if (currentResult) {
    return <ResultModal result={currentResult} onReset={() => setCurrentResult(null)} onGoToDashboard={onGoToDashboard} />;
  }

  const emailDomain = extractEmailDomain(formData);
  const domainType = !emailDomain ? '' : FREE_DOMAINS.includes(emailDomain) ? 'free public provider' : 'company domain';
  const textChars = (formData.description + formData.requirements + formData.full_text).length;

  return (
    <div className="page space-y-6 py-8">
      <PageHeader
        eyebrow="Analyse"
        title="Analyse an internship offer"
        description="Upload a PDF, paste the message, or fill in the fields below."
      />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_21rem]">
        <Panel
          title="Offer details"
          action={
            <button
              type="button"
              onClick={handleClear}
              className="inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium text-stone-500 transition-colors hover:bg-red-50 hover:text-red-700"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear
            </button>
          }
          bodyClassName="p-5 sm:p-6"
        >
          <div className="space-y-6">
            {/* PDF upload */}
            <div>
              <label
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); handlePdf(e.dataTransfer.files[0]); }}
                className={`flex cursor-pointer items-center gap-3.5 rounded-md border border-dashed px-4 py-3.5 transition-colors ${
                  dragOver
                    ? 'border-[#0F4C5C] bg-teal-50/50'
                    : 'border-stone-300 bg-[#FAF9F6] hover:border-[#0F4C5C]'
                }`}
              >
                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  className="sr-only"
                  onChange={(e) => { handlePdf(e.target.files[0]); e.target.value = ''; }}
                />
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-stone-200 bg-white text-[#0F4C5C]">
                  {pdfState.status === 'reading' ? <Spinner /> : <Upload className="h-4 w-4" aria-hidden="true" />}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-stone-900">
                    {pdfState.status === 'reading' ? `Reading ${pdfState.name}…` : 'Upload offer letter (PDF)'}
                  </span>
                  <span className="block text-xs text-stone-500">
                    Click or drop a file here. Parsed locally in your browser (up to 10 MB).
                  </span>
                </span>
              </label>

              {pdfState.status === 'done' && (
                <Notice tone="verified" icon={CheckCircle2} className="mt-3">
                  Read <strong>{pdfState.name}</strong> ({pdfState.pages} {pdfState.pages === 1 ? 'page' : 'pages'}) and filled {pdfState.filled} fields.
                </Notice>
              )}
              {pdfState.status === 'error' && (
                <Notice tone="danger" icon={AlertCircle} className="mt-3">
                  {pdfState.message}
                </Notice>
              )}
            </div>

            {/* Samples */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[11px] uppercase tracking-wider text-stone-400">Load sample:</span>
              {SAMPLE_OFFERS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleLoadSample(s.id)}
                  className="rounded border border-stone-300 bg-white px-2.5 py-1 text-xs font-medium text-stone-700 transition-colors hover:border-[#0F4C5C] hover:text-[#0F4C5C]"
                >
                  {plainName(s.name)}
                </button>
              ))}
            </div>

            {/* Mode switch */}
            <div className="inline-flex rounded-md border border-stone-200 bg-stone-100 p-0.5" role="group" aria-label="Input mode">
              {[
                ['form', 'Structured form'],
                ['paste', 'Paste offer text'],
              ].map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={activeTab === id}
                  onClick={() => setActiveTab(id)}
                  className={`rounded px-3.5 py-1 text-xs font-semibold transition-colors ${
                    activeTab === id ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {validationError && (
              <Notice tone="danger" icon={AlertCircle}>
                {validationError}
              </Notice>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {activeTab === 'form' ? (
                <>
                  <FormSection step="01" title="Role details">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="label" htmlFor="title">Internship title <span className="text-red-600">*</span></label>
                        <input id="title" className="field bg-white" type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="Software Engineering Intern" />
                      </div>
                      <div>
                        <label className="label" htmlFor="company">Company name</label>
                        <input id="company" className="field bg-white" type="text" name="company" value={formData.company} onChange={handleInputChange} placeholder="As written in the offer" />
                      </div>
                    </div>
                    <div>
                      <label className="label" htmlFor="description">Description <span className="text-red-600">*</span></label>
                      <textarea id="description" className="field resize-y bg-white" name="description" rows={4} value={formData.description} onChange={handleInputChange} placeholder="Responsibilities, work hours, daily tasks…" />
                    </div>
                    <div className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                      <div>
                        <label className="label" htmlFor="requirements">Requirements</label>
                        <input id="requirements" className="field bg-white" type="text" name="requirements" value={formData.requirements} onChange={handleInputChange} placeholder="Degree, skills, eligibility" />
                      </div>
                      <div>
                        <label className="label" htmlFor="duration">Duration</label>
                        <input id="duration" className="field bg-white" type="text" name="duration" value={formData.duration} onChange={handleInputChange} placeholder="3 months" />
                      </div>
                    </div>
                  </FormSection>

                  <FormSection step="02" title="Recruiter contact">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="label" htmlFor="email">Recruiter email</label>
                        <input id="email" className="field bg-white font-mono text-xs" type="text" name="email" value={formData.email} onChange={handleInputChange} placeholder="hr@company.com" />
                        <p className="hint">Checked for DNS, domain age, and brand lookalikes.</p>
                      </div>
                      <div>
                        <label className="label" htmlFor="website">Company website</label>
                        <input id="website" className="field bg-white font-mono text-xs" type="text" name="website" value={formData.website} onChange={handleInputChange} placeholder="https://company.com" />
                        <p className="hint">Optional. Compared with the email domain.</p>
                      </div>
                    </div>
                  </FormSection>

                  <FormSection step="03" title="Compensation & fees">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="label" htmlFor="stipend">Stipend offered</label>
                        <input id="stipend" className="field bg-white" type="text" name="stipend" value={formData.stipend} onChange={handleInputChange} placeholder="₹25,000 per month" />
                      </div>
                      <div>
                        <label className="label" htmlFor="registration_fee">Fee or deposit requested</label>
                        <input id="registration_fee" className="field bg-white" type="text" name="registration_fee" value={formData.registration_fee} onChange={handleInputChange} placeholder="0, or amount requested" />
                        <p className="hint text-red-700">Genuine internships never charge applicants.</p>
                      </div>
                    </div>
                  </FormSection>

                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-stone-200 pt-4">
                    <label className="text-xs font-medium text-stone-500" htmlFor="model_name">Classifier (when server is online)</label>
                    <select id="model_name" name="model_name" value={formData.model_name} onChange={handleInputChange} className="field w-auto bg-white py-1.5 text-xs">
                      <option value="Logistic Regression">Logistic Regression (default)</option>
                      <option value="Naive Bayes">Multinomial Naive Bayes</option>
                      <option value="Random Forest">Random Forest</option>
                      <option value="Support Vector Machine">Support Vector Machine (LinearSVC)</option>
                    </select>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="label" htmlFor="full_text">Offer text, WhatsApp message, or email</label>
                    <textarea
                      id="full_text"
                      className="field resize-y bg-white font-mono text-xs"
                      name="full_text"
                      rows={10}
                      value={formData.full_text}
                      onChange={handleInputChange}
                      placeholder="Paste the full message exactly as you received it."
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="label" htmlFor="paste_email">Recruiter email (if shown)</label>
                      <input id="paste_email" className="field bg-white font-mono text-xs" type="text" name="email" value={formData.email} onChange={handleInputChange} placeholder="hr@company.com" />
                    </div>
                    <div>
                      <label className="label" htmlFor="paste_fee">Fee mentioned</label>
                      <input id="paste_fee" className="field bg-white" type="text" name="registration_fee" value={formData.registration_fee} onChange={handleInputChange} placeholder="0, or the amount" />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-3 border-t border-stone-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="max-w-md text-xs leading-5 text-stone-500" aria-live="polite">
                  {isLoading
                    ? 'Running checks. Live domain lookups can take up to 10 seconds.'
                    : 'Sent to the analysis server, or evaluated locally in your browser if offline.'}
                </p>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#0F4C5C] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0B3A47] disabled:opacity-60 sm:w-auto"
                >
                  {isLoading ? <Spinner className="h-4 w-4" /> : <Search className="h-4 w-4" />}
                  {isLoading ? 'Analysing…' : 'Analyse offer'}
                </button>
              </div>
            </form>
          </div>
        </Panel>

        <aside className="space-y-6 lg:sticky lg:top-20">
          <Panel title="Offer preview" description="Summary of fields to be checked.">
            <DL
              items={[
                { label: 'Role', value: formData.title },
                { label: 'Company', value: formData.company },
                { label: 'Email', value: formData.email, mono: true },
                { label: 'Stipend', value: formatMoney(formData.stipend), mono: true },
                { label: 'Fee requested', value: formatMoney(formData.registration_fee), mono: true },
                { label: 'Text length', value: `${textChars.toLocaleString('en-IN')} chars`, mono: true },
              ]}
            />
            {emailDomain && (
              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-stone-200 pt-3 text-xs">
                <span className="text-stone-500">Domain</span>
                <span className="font-mono text-stone-800">{emailDomain}</span>
                <Tag tone={domainType === 'company domain' ? 'neutral' : 'caution'}>{domainType}</Tag>
              </div>
            )}
          </Panel>

          <Panel title="Checks performed">
            <ol className="space-y-2.5 text-xs leading-5 text-stone-600">
              <li className="flex gap-2.5"><span className="font-mono font-semibold text-[#0F4C5C]">01</span>Text classifier scores the offer wording.</li>
              <li className="flex gap-2.5"><span className="font-mono font-semibold text-red-700">02</span>Rules flag fees, free mailboxes, ID requests, and urgency.</li>
              <li className="flex gap-2.5"><span className="font-mono font-semibold text-teal-700">03</span>Email domain is checked for DNS, age, and lookalikes.</li>
            </ol>
          </Panel>
        </aside>
      </div>
    </div>
  );
}