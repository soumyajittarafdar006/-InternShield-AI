import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import AnalyzePage from './pages/AnalyzePage';
import DashboardPage from './pages/DashboardPage';
import ModelPerformancePage from './pages/ModelPerformancePage';
import ResultModal from './components/ResultModal';
import { DEMO_HISTORY_SEED } from './data/samples';
import { checkBackendHealth } from './services/api';
import { isSampleRecord } from './lib/risk';

const LOCAL_STORAGE_KEY = 'internshield_analysis_history_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [backendStatus, setBackendStatus] = useState(null);
  const [selectedHistoryResult, setSelectedHistoryResult] = useState(null);

  // History comes from localStorage; first-time visitors get clearly marked sample records.
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed reading history from localStorage:', e);
    }
    return DEMO_HISTORY_SEED.map((h) => ({ ...h, sample: true }));
  });

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
      console.warn('Failed writing history to localStorage:', e);
    }
  }, [history]);

  // Probe the analysis server on mount and every 30s
  useEffect(() => {
    let mounted = true;
    const probe = async () => {
      const status = await checkBackendHealth();
      if (mounted) setBackendStatus(status);
    };
    probe();
    const interval = setInterval(probe, 30000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const navigate = (tab) => {
    setSelectedHistoryResult(null);
    setActiveTab(tab);
  };

  const handleAnalysisComplete = (result) => {
    const entry = {
      id: result.analysis_id || 'scan-' + Date.now(),
      created_at: result.timestamp || new Date().toLocaleString(),
      title: result.metadata?.title || 'Internship Offer',
      company: result.metadata?.company || 'Unspecified Organization',
      prediction: result.prediction,
      risk_score: result.risk_score,
      risk_level: result.risk_level,
      model_used: result.model_used,
      full_result: result,
    };
    setHistory((prev) => [entry, ...prev.slice(0, 49)]);
  };

  const handleClearHistory = () => {
    if (window.confirm('Clear your local analysis history? This cannot be undone.')) {
      setHistory([]);
      try {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      } catch {
        /* storage unavailable */
      }
    }
  };

  const handleSelectHistoryItem = (item) => {
    if (item.full_result) {
      setSelectedHistoryResult(item.full_result);
      return;
    }
    // Older and sample records only kept a summary. Show that summary and say so; never invent findings.
    setSelectedHistoryResult({
      summary_only: true,
      is_sample: isSampleRecord(item),
      prediction: item.prediction,
      risk_score: item.risk_score,
      risk_level: item.risk_level,
      model_used: item.model_used,
      model_confidence: null,
      metadata: { title: item.title, company: item.company },
      reasons: [],
      safety_recommendations: [],
      top_keywords: [],
      timestamp: item.created_at,
      analysis_id: item.id,
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-canvas text-ink">
      <Navbar activeTab={activeTab} setActiveTab={navigate} backendStatus={backendStatus} />

      <main className="flex-1">
        {selectedHistoryResult ? (
          <ResultModal
            result={selectedHistoryResult}
            onReset={() => navigate('analyze')}
            onGoToDashboard={() => navigate('dashboard')}
          />
        ) : (
          <>
            {activeTab === 'home' && (
              <LandingPage
                onNavigate={(tab) => {
                  navigate(tab);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )}
            {activeTab === 'analyze' && (
              <AnalyzePage onAnalysisComplete={handleAnalysisComplete} onGoToDashboard={() => navigate('dashboard')} />
            )}
            {activeTab === 'dashboard' && (
              <DashboardPage
                history={history}
                onSelectHistoryItem={handleSelectHistoryItem}
                onQuickAnalyze={() => navigate('analyze')}
                onClearHistory={handleClearHistory}
              />
            )}
            {activeTab === 'ml-performance' && <ModelPerformancePage />}
          </>
        )}
      </main>

      <Footer setActiveTab={navigate} />
    </div>
  );
}
