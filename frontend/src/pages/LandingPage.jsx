import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, ShieldAlert, Sparkles, ArrowRight, CheckCircle2, 
  FileText, Cpu, AlertTriangle, Lock, Search, Eye, BarChart3,
  BadgeAlert, BookOpen, Layers, Terminal, ChevronRight
} from 'lucide-react';

export default function LandingPage({ onNavigate }) {
  
  const steps = [
    {
      num: "01",
      title: "Enter Internship Details",
      desc: "Paste the job offer text, recruiter email, stipend claims, and any declared registration fee.",
      icon: FileText
    },
    {
      num: "02",
      title: "Text Preprocessing",
      desc: "NLP engine cleans HTML noise, extracts domains, lowercases terms, and removes stop words.",
      icon: Terminal
    },
    {
      num: "03",
      title: "TF-IDF Feature Extraction",
      desc: "Converts linguistic patterns and red-flag phrases into high-dimensional numerical vectors.",
      icon: Layers
    },
    {
      num: "04",
      title: "Machine Learning Analysis",
      desc: "Supervised models (Logistic Regression, Naive Bayes, SVM) evaluate scam probability.",
      icon: Cpu
    },
    {
      num: "05",
      title: "Risk Score Calculation",
      desc: "Calculates an interpretable composite score from 0 to 100 based on model confidence and heuristics.",
      icon: BarChart3
    },
    {
      num: "06",
      title: "Final Prediction & Reasons",
      desc: "Delivers a clear verdict (Real vs Fake), itemized warning cards, and safety guidelines.",
      icon: ShieldCheck
    }
  ];

  const features = [
    {
      title: "Fake Internship Detection",
      desc: "Trained on hundreds of real and fraudulent employment postings from the EMSCAD benchmark dataset.",
      icon: ShieldAlert,
      color: "from-blue-500 to-indigo-500"
    },
    {
      title: "Registration Fee Detection",
      desc: "Flags upfront training costs, security deposits, and processing charges that genuine employers never ask for.",
      icon: AlertTriangle,
      color: "from-amber-500 to-orange-500"
    },
    {
      title: "Suspicious Email Inspection",
      desc: "Verifies corporate email domains against public free mailboxes (Gmail, Yahoo, Outlook) used by impersonators.",
      icon: Lock,
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "Unrealistic Stipend Detection",
      desc: "Detects too-good-to-be-true claims like ₹50,000/mo for simple data entry or part-time typing tasks.",
      icon: BadgeAlert,
      color: "from-emerald-500 to-teal-500"
    },
    {
      title: "Company Information Analysis",
      desc: "Cross-checks missing web presence, vague company names, and urgent high-pressure application tactics.",
      icon: Eye,
      color: "from-cyan-500 to-blue-500"
    },
    {
      title: "Explainable AI Results",
      desc: "Transparent reasoning: see exactly which words, policies, and signals swayed the prediction towards Fake or Real.",
      icon: Sparkles,
      color: "from-violet-500 to-indigo-500"
    }
  ];

  return (
    <div className="space-y-24 pb-16">
      
      {/* HERO SECTION */}
      <section className="relative pt-12 pb-16 lg:pt-20 lg:pb-24 overflow-hidden">
        
        {/* Subtle decorative glow balls */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-blue-600/20 via-indigo-600/15 to-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-10 right-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Headlines & CTA */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs font-semibold tracking-wide shadow-sm">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
                <span>AI-POWERED RECRUITMENT VERIFICATION</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.12]">
                Don't Fall for Fake Internships. <br />
                <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                  Verify Before You Apply.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed mx-auto lg:mx-0">
                An intelligent AI-powered platform that analyses internship offers and detects suspicious recruitment activities to protect students from fraud.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-3">
                <button
                  onClick={() => onNavigate('analyze')}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 shadow-xl shadow-blue-600/30 hover:shadow-blue-600/50 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex items-center justify-center gap-3 text-base"
                >
                  <Search className="w-5 h-5" />
                  <span>Analyse an Internship</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>

                <a
                  href="#how-it-works"
                  className="w-full sm:w-auto px-6 py-4 rounded-xl font-semibold text-slate-300 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 hover:border-blue-500/40 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-2 text-base shadow-sm"
                >
                  <BookOpen className="w-4 h-4 text-blue-400" />
                  <span>Explore How It Works</span>
                </a>
              </div>

              {/* Micro-Trust Signals */}
              <div className="pt-6 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-400">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  EMSCAD Benchmark Trained
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Zero Upfront Fee Policy
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Instant Explainable Risk
                </span>
              </div>

            </div>

            {/* Right Column: AI Security Illustration */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-md">
                
                {/* Orbit Rings */}
                <div className="absolute inset-0 rounded-full border border-blue-500/20 animate-pulse pointer-events-none" />
                <div className="absolute -inset-4 rounded-full border border-purple-500/10 pointer-events-none" />

                {/* Central Futuristic Cyber Shield Glass Card */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8 }}
                  className="glass-panel rounded-3xl p-8 relative overflow-hidden border border-blue-500/30 glow-blue text-center"
                >
                  
                  {/* Glowing Shield Visual */}
                  <div className="relative mx-auto w-32 h-32 mb-6 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 opacity-30 blur-xl animate-pulse" />
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#0B132B] to-[#1C2541] border border-blue-400/40 flex items-center justify-center shadow-2xl relative z-10">
                      <ShieldCheck className="w-14 h-14 text-blue-400 drop-shadow-[0_0_15px_rgba(59,130,246,0.8)]" />
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-white tracking-tight mb-1">
                    AI Guardian Engine
                  </h3>
                  <p className="text-xs text-slate-400 mb-6">
                    Multi-Model Fraud Classification Active
                  </p>

                  {/* Real-Time Mock Inspection Badges */}
                  <div className="space-y-2.5 text-left text-xs">
                    
                    <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                      <span className="text-slate-300 font-medium">Fee Solicitation Check</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        PROTECTED
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                      <span className="text-slate-300 font-medium">Recruiter Email Domain</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                        VERIFIED
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                      <span className="text-slate-300 font-medium">NLP Scam Pattern Score</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30">
                        97.8% F1
                      </span>
                    </div>

                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      Real-Time Heuristic Guard
                    </span>
                    <span className="font-mono text-blue-400">v1.0.0</span>
                  </div>

                </motion.div>

              </div>
            </div>

          </div>
        </div>

      </section>


      {/* STATS SECTION (Descriptive & Demo Benchmark) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-blue-500/20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-slate-800">
            
            <div className="pt-4 md:pt-0">
              <div className="text-3xl sm:text-4xl font-extrabold text-blue-400 tracking-tight font-sans">
                AI-Powered
              </div>
              <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">Supervised Learning</p>
              <p className="text-[11px] text-slate-500 mt-0.5">TF-IDF & Logistic Regression</p>
            </div>

            <div className="pt-4 md:pt-0">
              <div className="text-3xl sm:text-4xl font-extrabold text-indigo-400 tracking-tight font-sans">
                0 to 100
              </div>
              <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">Risk Score Detection</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Application-level bands</p>
            </div>

            <div className="pt-4 md:pt-0">
              <div className="text-3xl sm:text-4xl font-extrabold text-purple-400 tracking-tight font-sans">
                NLP-Based
              </div>
              <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">Text Analysis Engine</p>
              <p className="text-[11px] text-slate-500 mt-0.5">N-Gram linguistic vectors</p>
            </div>

            <div className="pt-4 md:pt-0">
              <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400 tracking-tight font-sans">
                Student Safety
              </div>
              <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">Fraud Prevention Focused</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Catching fee & data theft scams</p>
            </div>

          </div>
          <p className="text-[10px] text-slate-500 text-center mt-6">
            *Descriptive platform capability metrics based on EMSCAD benchmark testing.
          </p>
        </div>
      </section>


      {/* HOW IT WORKS (6 STEPS) */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Layers className="w-3.5 h-3.5" />
            <span>Step-by-Step Architecture</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            How InternShield AI Works
          </h2>
          <p className="text-sm sm:text-base text-slate-400 mt-2">
            From raw text input to an explainable verdict — a transparent 6-stage machine learning & heuristic pipeline.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="glass-panel glass-panel-hover rounded-2xl p-6 relative group border border-slate-800"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-110 group-hover:bg-blue-600/25 transition-all">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-2xl font-black text-slate-700 font-mono group-hover:text-blue-500/40 transition-colors">
                    {step.num}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white mb-2 tracking-tight group-hover:text-blue-300 transition-colors">
                  {step.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>

      </section>


      {/* FEATURES SECTION (6 Core Features) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/25 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Comprehensive Defense Capabilities</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Engineered to Expose Recruitment Scams
          </h2>
          <p className="text-sm sm:text-base text-slate-400 mt-2">
            Every layer addresses a known deception technique identified across fake internship cases.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="glass-panel glass-panel-hover rounded-2xl p-6 border border-slate-800 relative"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 flex items-center justify-center text-blue-400 mb-4 shadow-sm">
                  <Icon className="w-6 h-6 text-blue-400" />
                </div>

                <h3 className="text-base font-bold text-white mb-2 tracking-tight">
                  {feat.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            );
          })}
        </div>

      </section>


      {/* CALL TO ACTION BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel rounded-3xl p-8 sm:p-12 border border-blue-500/30 relative overflow-hidden text-center bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-purple-950/40">
          
          <div className="max-w-2xl mx-auto space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 mx-auto">
              <ShieldCheck className="w-8 h-8" />
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Received an Offer? Don't Risk Your Career or Savings.
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Run a complete NLP safety check in seconds before replying to recruiters, transferring money, or sending ID documents.
            </p>

            <div className="pt-2">
              <button
                onClick={() => onNavigate('analyze')}
                className="px-8 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-xl shadow-blue-600/30 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer inline-flex items-center gap-2 text-base"
              >
                <span>Analyse Your Offer Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
