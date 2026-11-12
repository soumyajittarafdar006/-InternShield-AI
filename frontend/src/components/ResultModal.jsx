import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldAlert, ShieldCheck, AlertTriangle, Download, RotateCcw, 
  ArrowLeft, CheckCircle2, XCircle, Info, ExternalLink, Building2, 
  Mail, DollarSign, Calendar, Sparkles, AlertCircle
} from 'lucide-react';
import jsPDF from 'jspdf';
import RiskGauge from './RiskGauge';

export default function ResultModal({ result, onReset, onGoToDashboard }) {
  if (!result) return null;

  const isFake = result.risk_score > 60;
  const isMedium = result.risk_score > 30 && result.risk_score <= 60;
  const isReal = result.risk_score <= 30;

  // Generate and download executive PDF report
  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // Header Banner
      doc.setFillColor(8, 13, 26);
      doc.rect(0, 0, pageWidth, 40, 'F');

      doc.setTextColor(59, 130, 246);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text("InternShield AI", 15, 20);

      doc.setTextColor(200, 200, 200);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text("AI-Based Fake Internship Detection Report", 15, 28);
      doc.text(`Generated: ${result.timestamp || new Date().toLocaleString()}`, pageWidth - 15, 28, { align: 'right' });

      // Assessment Summary Box
      let bannerColor = [16, 185, 129]; // Green
      if (isFake) bannerColor = [239, 68, 68];
      else if (isMedium) bannerColor = [245, 158, 11];

      doc.setFillColor(...bannerColor);
      doc.roundedRect(15, 48, pageWidth - 30, 26, 3, 3, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`PREDICTION VERDICT: ${result.prediction.toUpperCase()}`, 22, 60);

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(`Composite Risk Score: ${result.risk_score} / 100 (${result.risk_level})`, 22, 68);

      // Offer Metadata
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text("Internship Submission Details", 15, 88);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const meta = result.metadata || {};
      doc.text(`• Role Title: ${meta.title || 'N/A'}`, 15, 96);
      doc.text(`• Company: ${meta.company || 'Not specified'}`, 15, 103);
      doc.text(`• Recruiter Email: ${meta.recruiter_email || 'Not provided'}`, 15, 110);
      doc.text(`• Offered Stipend: ${meta.stipend || 'Not specified'}`, 15, 117);
      doc.text(`• Declared Fee: ${meta.registration_fee || 'None'}`, 15, 124);

      // Detection Reasons / Warnings
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text("Key Findings & Risk Indicators", 15, 138);

      let yPos = 146;
      if (result.reasons && result.reasons.length > 0) {
        result.reasons.slice(0, 4).forEach((r) => {
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(r.severity === 'CRITICAL' ? 220 : 70, 20, 20);
          doc.text(`[${r.severity}] ${r.title}`, 15, yPos);
          yPos += 5;

          doc.setFont('helvetica', 'normal');
          doc.setTextColor(70, 70, 70);
          const splitExplanation = doc.splitTextToSize(`• ${r.explanation}`, pageWidth - 35);
          doc.text(splitExplanation, 18, yPos);
          yPos += splitExplanation.length * 5 + 3;
        });
      } else {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(34, 197, 94);
        doc.text("No high-risk fraud signals detected in the provided submission.", 15, yPos);
        yPos += 10;
      }

      // Safety Recommendations
      yPos = Math.max(yPos + 4, 210);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text("Safety Recommendations for Applicant", 15, yPos);
      yPos += 8;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 60, 60);
      (result.safety_recommendations || []).slice(0, 3).forEach((rec) => {
        const splitRec = doc.splitTextToSize(`✔ ${rec}`, pageWidth - 30);
        doc.text(splitRec, 15, yPos);
        yPos += splitRec.length * 4.5 + 2;
      });

      // Academic Project Footer & Disclaimer
      doc.setDrawColor(200, 200, 200);
      doc.line(15, 270, pageWidth - 15, 270);
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text(
        "Disclaimer: This report is an AI-assisted heuristic assessment. It does not replace independent verification. InternShield AI Project.",
        15,
        276
      );

      doc.save(`InternShield_Report_${(meta.title || 'Internship').replace(/[^a-z0-9]/gi, '_')}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Could not generate PDF. Please use browser print (Ctrl+P) to save this page.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      
      {/* Top action bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Analyse Another Offer</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadPDF}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-blue-500/40 transition-all cursor-pointer shadow-sm"
          >
            <Download className="w-4 h-4 text-blue-400" />
            <span>Download PDF Report</span>
          </button>
          
          <button
            onClick={onGoToDashboard}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-blue-600/20 text-blue-400 border border-blue-500/40 hover:bg-blue-600/30 transition-all cursor-pointer"
          >
            <span>View Dashboard</span>
          </button>
        </div>
      </div>

      {/* Main Result Card */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={`glass-panel rounded-2xl p-6 sm:p-8 relative overflow-hidden border ${
          isFake ? 'border-red-500/40 shadow-2xl shadow-red-500/10' :
          isMedium ? 'border-amber-500/40 shadow-2xl shadow-amber-500/10' :
          'border-emerald-500/40 shadow-2xl shadow-emerald-500/10'
        }`}
      >
        
        {/* Glow ambient aura */}
        <div 
          className="absolute -top-32 -right-32 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ background: isFake ? '#EF4444' : isMedium ? '#F59E0B' : '#10B981' }}
        />

        {/* Header Verdict Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border-b border-slate-800/80 pb-8">
          
          {/* Left Column: Verdict Badge & Role Details */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Status Pill */}
            <div className="flex flex-wrap items-center gap-3">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-base font-bold tracking-wide uppercase shadow-lg ${
                isFake ? 'bg-red-500/20 text-red-400 border border-red-500/40 glow-red' :
                isMedium ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 glow-green'
              }`}>
                {isFake ? <ShieldAlert className="w-5 h-5 text-red-400 animate-pulse" /> :
                 isMedium ? <AlertTriangle className="w-5 h-5 text-amber-400" /> :
                 <ShieldCheck className="w-5 h-5 text-emerald-400" />}
                <span>{result.prediction} – {result.risk_level}</span>
              </div>

              {result.is_demo_mode && (
                <span className="text-xs px-2.5 py-1 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  Demo Rule Mode
                </span>
              )}
            </div>

            {/* Target Title & Company */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {result.metadata?.title || "Internship Offer"}
              </h2>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-slate-400">
                <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                  <Building2 className="w-4 h-4 text-blue-400" />
                  {result.metadata?.company || "Unspecified Organization"}
                </span>
                {result.metadata?.recruiter_email && (
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-slate-400" />
                    {result.metadata.recruiter_email}
                  </span>
                )}
                {result.metadata?.stipend && (
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    {result.metadata.stipend}
                  </span>
                )}
              </div>
            </div>

            {/* Verdict Explanation sentence */}
            <p className="text-sm text-slate-300 leading-relaxed bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
              {isFake ? (
                <span>
                  <strong className="text-red-400 font-semibold">Critical Threat Detected:</strong> This posting exhibits significant deceptive characteristics typical of internship fee fraud, suspicious recruiter channels, or identity credential harvesting.
                </span>
              ) : isMedium ? (
                <span>
                  <strong className="text-amber-400 font-semibold">Caution Advised:</strong> While not definitively fraudulent, several irregular signals (e.g., informal contact methods, vague job responsibilities, or free email domains) warrant thorough verification before replying.
                </span>
              ) : (
                <span>
                  <strong className="text-emerald-400 font-semibold">Legitimate Characteristics:</strong> The internship details align with standard corporate hiring standards, exhibiting transparent role scopes and zero upfront financial demands.
                </span>
              )}
            </p>

            {/* AI Model Attribution */}
            <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Evaluated with: <strong className="text-slate-300">{result.model_used || "Logistic Regression"}</strong> ({result.model_confidence || 95}% confidence)</span>
            </div>

          </div>

          {/* Right Column: Animated Circular Risk Gauge */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <RiskGauge 
              score={result.risk_score} 
              riskLevel={result.risk_level}
              size={220}
            />
          </div>

        </div>

        {/* Reasons Behind Prediction (Warning Cards) */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-blue-400" />
              <span>Reasons Behind Prediction & Detected Signals</span>
            </h3>
            <span className="text-xs text-slate-400">
              {result.reasons?.length || 0} signal{result.reasons?.length === 1 ? '' : 's'} identified
            </span>
          </div>

          {result.reasons && result.reasons.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.reasons.map((signal, idx) => {
                const isCritical = signal.severity === 'CRITICAL';
                const isHigh = signal.severity === 'HIGH';
                const isPos = signal.severity === 'POSITIVE';

                return (
                  <motion.div
                    key={signal.id || idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    className={`p-4 rounded-xl border text-sm transition-all ${
                      isCritical ? 'bg-red-950/20 border-red-500/30' :
                      isHigh ? 'bg-rose-950/20 border-rose-500/30' :
                      isPos ? 'bg-emerald-950/20 border-emerald-500/30' :
                      'bg-slate-900/60 border-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        {isPos ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <XCircle className={`w-4 h-4 shrink-0 ${isCritical ? 'text-red-400' : 'text-amber-400'}`} />
                        )}
                        <h4 className="font-semibold text-white text-sm">
                          {signal.title}
                        </h4>
                      </div>

                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider shrink-0 ${
                        isCritical ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                        isHigh ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                        isPos ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {signal.severity}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed mb-2">
                      {signal.explanation}
                    </p>

                    {signal.evidence && (
                      <div className="text-[11px] text-slate-400 bg-slate-950/50 p-2 rounded border border-slate-800/80">
                        <strong className="text-slate-300">Observation:</strong> {signal.evidence}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="p-6 rounded-xl bg-slate-900/40 border border-slate-800 text-center text-slate-400">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-200">No High-Risk Red Flags Detected</p>
              <p className="text-xs text-slate-400 mt-1">
                The NLP parser did not detect common scam keywords, deposit fees, or suspicious email patterns in the provided details.
              </p>
            </div>
          )}
        </div>

        {/* Explainability Keywords from TF-IDF */}
        {result.top_keywords && result.top_keywords.length > 0 && (
          <div className="mt-8 pt-6 border-t border-slate-800/80">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>NLP Vocabulary Influence (TF-IDF Coefficients)</span>
            </h4>
            <div className="flex flex-wrap gap-2">
              {result.top_keywords.map((kw, i) => (
                <span
                  key={i}
                  className={`text-xs px-2.5 py-1 rounded-lg border font-mono ${
                    kw.direction === 'fake'
                      ? 'bg-red-950/30 text-red-300 border-red-500/30'
                      : 'bg-emerald-950/30 text-emerald-300 border-emerald-500/30'
                  }`}
                >
                  {kw.word} <span className="opacity-60 text-[10px]">({kw.weight > 0 ? `+${kw.weight}` : kw.weight})</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Practical Safety Recommendations */}
        <div className="mt-8 pt-6 border-t border-slate-800/80">
          <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>Essential Student Safety Recommendations</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {result.safety_recommendations?.map((rec, i) => (
              <div 
                key={i} 
                className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-300"
              >
                <span className="text-emerald-400 font-bold shrink-0 mt-0.5">✔</span>
                <span className="leading-relaxed">{rec}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <p className="text-xs text-slate-500 max-w-md">
            *Assessment generated using TF-IDF n-gram vectorization and machine learning trained on the EMSCAD benchmark dataset.
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={onReset}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Analyse Another Internship</span>
            </button>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
