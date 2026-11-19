import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Trash2, Sparkles, AlertCircle, FileText, Building, 
  Mail, Globe, IndianRupee, Clock, CheckCircle2, ChevronRight,
  ShieldCheck, Loader2, RefreshCw, Upload, X
} from 'lucide-react';
import { SAMPLE_OFFERS } from '../data/samples';
import { analyzeInternship } from '../services/api';
import { extractPdfText, parseOfferText } from '../services/pdfExtract';
import ResultModal from '../components/ResultModal';

export default function AnalyzePage({ onAnalysisComplete, onGoToDashboard }) {
  const [formData, setFormData] = useState({
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
    model_name: 'Logistic Regression'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [validationError, setValidationError] = useState('');
  const [activeTab, setActiveTab] = useState('form'); // 'form' | 'paste'
  const [currentResult, setCurrentResult] = useState(null);
  const [pdfState, setPdfState] = useState({ status: 'idle' }); // idle | reading | done | error
  const [dragOver, setDragOver] = useState(false);

  const loadingStages = [
    "Pre-processing text & removing formatting noise...",
    "Extracting n-gram vocabulary features via TF-IDF...",
    "Scanning red flags: fees, free email domains & document harvesting...",
    "Evaluating with trained Logistic Regression model...",
    "Generating explainable risk score & recommendations..."
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (validationError) setValidationError('');
  };

  const handleClear = () => {
    setFormData({
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
      model_name: 'Logistic Regression'
    });
    setValidationError('');
    setCurrentResult(null);
    setPdfState({ status: 'idle' });
  };

  const handleLoadSample = (sampleId) => {
    const sample = SAMPLE_OFFERS.find(s => s.id === sampleId);
    if (sample) {
      setFormData({
        ...sample.data,
        model_name: 'Logistic Regression'
      });
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
    } catch (err) {
      setPdfState({ status: 'error', message: 'We could not read this PDF. It may be password-protected or damaged. You can paste the text instead.' });
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    // Validation: Require either title or description or pasted text
    const hasEnoughData = 
      (formData.title.trim().length > 0 && formData.description.trim().length > 0) ||
      formData.full_text.trim().length > 20;

    if (!hasEnoughData) {
      setValidationError('Please provide at least a Job Title & Description, or paste the internship offer letter into the Quick Paste tab.');
      return;
    }

    setValidationError('');
    setIsLoading(true);
    setLoadingStep(0);

    // Simulate realistic progressive pipeline steps
    const stepInterval = setInterval(() => {
      setLoadingStep(prev => (prev < loadingStages.length - 1 ? prev + 1 : prev));
    }, 400);

    try {
      const result = await analyzeInternship(formData);
      clearInterval(stepInterval);
      setLoadingStep(loadingStages.length - 1);
      
      setTimeout(() => {
        setIsLoading(false);
        setCurrentResult(result);
        if (onAnalysisComplete) {
          onAnalysisComplete(result);
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 500);

    } catch (err) {
      clearInterval(stepInterval);
      setIsLoading(false);
      setValidationError(err.message || 'An error occurred during internship analysis.');
    }
  };

  if (currentResult) {
    return (
      <ResultModal 
        result={currentResult}
        onReset={() => setCurrentResult(null)}
        onGoToDashboard={onGoToDashboard}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      
      {/* Page Title & Subtitle */}
      <div className="text-center max-w-3xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Detection Pipeline</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Analyse Internship Offer
        </h1>
        <p className="text-sm sm:text-base text-slate-400 mt-2">
          Submit the internship details or paste the offer letter. Our NLP engine will cross-examine linguistic features, registration fee demands, and recruiter authenticity.
        </p>
      </div>

      {/* Upload a PDF offer letter */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 mb-6">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-400 shrink-0">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Got the offer as a PDF? Upload it</h3>
            <p className="text-sm text-slate-400">
              We read the text on your own device and fill the form for you. Check the details, then press Analyse. Your PDF is never sent to a server.
            </p>
          </div>
        </div>
        <label
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handlePdf(e.dataTransfer.files[0]); }}
          className={`flex flex-col items-center justify-center gap-1 text-center px-4 py-6 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
            dragOver ? 'border-blue-500 bg-blue-500/10' : 'border-slate-700 hover:border-blue-500/60 bg-slate-950/40'
          }`}
        >
          <input
            type="file"
            accept="application/pdf,.pdf"
            className="sr-only"
            onChange={(e) => { handlePdf(e.target.files[0]); e.target.value = ''; }}
          />
          {pdfState.status === 'reading' ? (
            <span className="flex items-center gap-2 text-sm font-semibold text-slate-200">
              <Loader2 className="w-4 h-4 animate-spin" /> Reading {pdfState.name}...
            </span>
          ) : (
            <>
              <span className="text-sm font-semibold text-slate-200">Click to choose a PDF, or drag it here</span>
              <span className="text-xs text-slate-400">PDF only, up to 10 MB</span>
            </>
          )}
        </label>
        {pdfState.status === 'done' && (
          <div className="mt-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Read <strong>{pdfState.name}</strong> ({pdfState.pages} {pdfState.pages === 1 ? 'page' : 'pages'}) and filled {pdfState.filled} fields. Please check them below before you analyse.
            </span>
          </div>
        )}
        {pdfState.status === 'error' && (
          <div className="mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{pdfState.message}</span>
          </div>
        )}
      </div>

      {/* Sample Quick-Selector Pills */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-blue-400" />
            Quick Test Samples (Click to Pre-fill):
          </span>
          <span className="text-[11px] text-slate-400">
            Realistic test cases based on actual recruitment fraud reports
          </span>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {SAMPLE_OFFERS.map((sample) => (
            <button
              key={sample.id}
              type="button"
              onClick={() => handleLoadSample(sample.id)}
              className="text-xs px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-blue-500/50 transition-all duration-150 cursor-pointer flex items-center gap-2 shadow-sm"
            >
              <span>{sample.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Analysis Form Container */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 relative">

        {/* Tab Toggle: Form Fields vs Paste Raw Text */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('form')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'form'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Structured Form
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('paste')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'paste'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Paste Full Offer Text
            </button>
          </div>

          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-slate-400 hover:text-red-400 flex items-center gap-1.5 transition-colors cursor-pointer py-1 px-2.5 rounded hover:bg-slate-800"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Form</span>
          </button>
        </div>

        {/* Validation Error Banner */}
        {validationError && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold">Incomplete Details:</strong> {validationError}
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-6">

          {activeTab === 'form' ? (
            <>
              {/* Row 1: Title & Company */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Internship Title <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="e.g. Software Engineering Intern / Data Entry"
                      className="glass-input w-full px-4 py-3 rounded-xl text-sm placeholder:text-slate-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Company / Organization Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      placeholder="e.g. TechCorp Solutions / Global Recruiters"
                      className="glass-input w-full px-4 py-3 rounded-xl text-sm placeholder:text-slate-500"
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Internship Description / Role Overview <span className="text-red-400">*</span>
                </label>
                <textarea
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Provide role description, responsibilities, work hours, or daily tasks..."
                  className="glass-input w-full px-4 py-3 rounded-xl text-sm placeholder:text-slate-500 resize-y"
                />
              </div>

              {/* Row 3: Requirements & Duration */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Job Requirements / Eligibility
                  </label>
                  <input
                    type="text"
                    name="requirements"
                    value={formData.requirements}
                    onChange={handleInputChange}
                    placeholder="e.g. CS degree, Python skills, or 'No technical skills required'"
                    className="glass-input w-full px-4 py-3 rounded-xl text-sm placeholder:text-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Internship Duration
                  </label>
                  <input
                    type="text"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    placeholder="e.g. 3 Months / Immediate"
                    className="glass-input w-full px-4 py-3 rounded-xl text-sm placeholder:text-slate-500"
                  />
                </div>
              </div>

              {/* Row 4: Recruiter Email & Company Website */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>Recruiter Contact Email</span>
                    <span className="text-[10px] text-slate-400 font-normal">Checks domain authenticity</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="e.g. hr@company.com or candidate@gmail.com"
                      className="glass-input w-full px-4 py-3 rounded-xl text-sm placeholder:text-slate-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Company Website (Optional)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      placeholder="e.g. https://company.com"
                      className="glass-input w-full px-4 py-3 rounded-xl text-sm placeholder:text-slate-500"
                    />
                  </div>
                </div>
              </div>

              {/* Row 5: Offered Stipend & Registration / Training Fee */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Offered Stipend Amount
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="stipend"
                      value={formData.stipend}
                      onChange={handleInputChange}
                      placeholder="e.g. ₹25,000 / month or $3,000"
                      className="glass-input w-full px-4 py-3 rounded-xl text-sm placeholder:text-slate-500"
                    />
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Unrealistically high stipends for low effort are a major scam indicator.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-amber-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Registration / Training Fee Demanded</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="registration_fee"
                      value={formData.registration_fee}
                      onChange={handleInputChange}
                      placeholder="e.g. ₹0 (Free) or ₹1,500 security deposit"
                      className="glass-input w-full px-4 py-3 rounded-xl text-sm placeholder:text-slate-500 border-amber-500/30 focus:border-amber-400"
                    />
                  </div>
                  <span className="text-[11px] text-amber-300/80 mt-1 block">
                    Genuine employers NEVER charge interns. Any upfront fee is a critical red flag.
                  </span>
                </div>
              </div>

              {/* Optional: Model Algorithm Selector */}
              <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
                <span>Machine Learning Model:</span>
                <select
                  name="model_name"
                  value={formData.model_name}
                  onChange={handleInputChange}
                  className="bg-slate-900 border border-slate-700 text-slate-300 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-blue-500"
                >
                  <option value="Logistic Regression">Logistic Regression (Primary Default)</option>
                  <option value="Naive Bayes">Multinomial Naive Bayes</option>
                  <option value="Random Forest">Random Forest Classifier</option>
                  <option value="Support Vector Machine">Support Vector Machine (LinearSVC)</option>
                </select>
              </div>
            </>
          ) : (
            /* Quick Paste Tab */
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Paste Full Internship Offer, WhatsApp Message, or Email Notice
                </label>
                <textarea
                  name="full_text"
                  rows={10}
                  value={formData.full_text}
                  onChange={handleInputChange}
                  placeholder="Paste the full recruitment text here... e.g. 'URGENT HIRING!! Earn Rs 45,000 working from home... Pay registration fee Rs 999 to start...'"
                  className="glass-input w-full px-4 py-3 rounded-xl text-sm placeholder:text-slate-500 font-mono text-xs resize-y"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Recruiter Email (if mentioned)
                  </label>
                  <input
                    type="text"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="e.g. hr@company.com"
                    className="glass-input w-full px-3 py-2 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Registration Fee Mentioned
                  </label>
                  <input
                    type="text"
                    name="registration_fee"
                    value={formData.registration_fee}
                    onChange={handleInputChange}
                    placeholder="e.g. 0 or 1500"
                    className="glass-input w-full px-3 py-2 rounded-lg text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 shadow-xl shadow-blue-600/30 hover:shadow-blue-600/50 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed text-base"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Analyzing With AI Engine...</span>
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  <span>Analyse Internship with AI Shield</span>
                </>
              )}
            </button>
          </div>

        </form>

        {/* Loading Overlay Animation */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#080D1A]/95 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center p-6 z-20"
            >
              <div className="relative mb-6">
                <div className="w-20 h-20 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <ShieldCheck className="w-8 h-8 text-blue-400 animate-pulse" />
                </div>
              </div>

              <h3 className="text-xl font-bold text-white mb-2 tracking-tight">
                AI NLP Inspection in Progress
              </h3>

              <div className="w-full max-w-md bg-slate-900 rounded-full h-2 overflow-hidden mb-4 border border-slate-800">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                  initial={{ width: "10%" }}
                  animate={{ width: `${((loadingStep + 1) / loadingStages.length) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              <p className="text-xs text-blue-300 font-mono h-6 text-center animate-pulse">
                {loadingStages[loadingStep]}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

    </div>
  );
}