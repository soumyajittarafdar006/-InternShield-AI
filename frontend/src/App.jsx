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

const LOCAL_STORAGE_KEY = 'internshield_analysis_history_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [backendStatus, setBackendStatus] = useState(null);
  const [selectedHistoryResult, setSelectedHistoryResult] = useState(null);

  // Initialize history from localStorage or seed
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed reading history from localStorage:', e);
    }
    return DEMO_HISTORY_SEED;
  });

  // Save history to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
      console.warn('Failed writing history to localStorage:', e);
    }
  }, [history]);

  // Check backend health on mount and every 30s
  useEffect(() => {
    let isMounted = true;
    const probe = async () => {
      const status = await checkBackendHealth();
      if (isMounted) setBackendStatus(status);
    };
    probe();
    const interval = setInterval(probe, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // When a new analysis finishes in AnalyzePage
  const handleAnalysisComplete = (result) => {
    const newEntry = {
      id: result.analysis_id || 'scan-' + Date.now(),
      created_at: result.timestamp || new Date().toLocaleString(),
      title: result.metadata?.title || 'Internship Offer',
      company: result.metadata?.company || 'Unspecified Organization',
      prediction: result.prediction,
      risk_score: result.risk_score,
      risk_level: result.risk_level,
      model_used: result.model_used,
      full_result: result
    };
    setHistory(prev => [newEntry, ...prev.slice(0, 49)]);
  };

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to clear your local analysis history?")) {
      setHistory([]);
      try {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      } catch (e) {}
    }
  };

  const handleSelectHistoryItem = (item) => {
    // If we stored the full result, show it; else synthesize result modal
    if (item.full_result) {
      setSelectedHistoryResult(item.full_result);
    } else {
      setSelectedHistoryResult({
        prediction: item.prediction,
        risk_score: item.risk_score,
        risk_level: item.risk_level,
        model_used: item.model_used || "Logistic Regression (TF-IDF)",
        model_confidence: 94.0,
        metadata: {
          title: item.title,
          company: item.company,
          recruiter_email: "Recorded in historical scan",
          stipend: "See details",
          registration_fee: item.risk_score > 60 ? "Flagged fee" : "None"
        },
        reasons: item.risk_score > 60 ? [
          {
            id: "historical_flag",
            title: "Historical Scam Warning Signals",
            severity: "CRITICAL",
            explanation: "This posting contained high-risk linguistic patterns matching recruitment fee fraud.",
            evidence: `Recorded risk score: ${item.risk_score}/100`
          }
        ] : [
          {
            id: "safe_flag",
            title: "Verified Role Scope",
            severity: "POSITIVE",
            explanation: "Posting aligns with genuine corporate internship standards.",
            evidence: "No upfront fees requested."
          }
        ],
        safety_recommendations: [
          "Never transfer money or pay upfront fees for internship onboarding.",
          "Verify recruiter domain and check official company careers portal.",
          "Do not share confidential bank passbooks or Aadhaar/PAN cards early."
        ],
        top_keywords: [
          { word: "internship", weight: 2.1, direction: item.risk_score > 60 ? "fake" : "real" }
        ],
        timestamp: item.created_at
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#080D1A] text-slate-100 bg-grid-pattern selection:bg-blue-600 selection:text-white">
      
      {/* Top Sticky Navigation */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          setSelectedHistoryResult(null);
          setActiveTab(tab);
        }}
        backendStatus={backendStatus}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {selectedHistoryResult ? (
          <ResultModal 
            result={selectedHistoryResult}
            onReset={() => {
              setSelectedHistoryResult(null);
              setActiveTab('analyze');
            }}
            onGoToDashboard={() => {
              setSelectedHistoryResult(null);
              setActiveTab('dashboard');
            }}
          />
        ) : (
          <>
            {activeTab === 'home' && (
              <LandingPage onNavigate={(tab) => {
                setActiveTab(tab);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }} />
            )}

            {activeTab === 'analyze' && (
              <AnalyzePage 
                onAnalysisComplete={handleAnalysisComplete}
                onGoToDashboard={() => setActiveTab('dashboard')}
              />
            )}

            {activeTab === 'dashboard' && (
              <DashboardPage 
                history={history}
                onSelectHistoryItem={handleSelectHistoryItem}
                onQuickAnalyze={() => setActiveTab('analyze')}
                onClearHistory={handleClearHistory}
              />
            )}

            {activeTab === 'ml-performance' && (
              <ModelPerformancePage />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <Footer setActiveTab={setActiveTab} />

    </div>
  );
}
