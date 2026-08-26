'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Sun, Moon, User, Edit3, Plus, Activity, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import Sidebar from '@/components/Sidebar';
import RiskPredictionCard from '@/components/RiskPredictionCard';
import AiClinicalAssessment from '@/components/AiClinicalAssessment';
import PatientForm from '@/components/PatientForm';
import PatientHistory from '@/components/PatientHistory';
import StatsCard from '@/components/StatsCard';
import MiniHistory from '@/components/MiniHistory';

import {
  getPredictions, runPrediction, createPatient, deletePrediction,
  getPredictionReport, logout, getToken, getUser, checkLlmStatus,
} from '@/lib/api';
import type { PredictionInput, PredictionResponse, PredictionHistory as PredictionHistoryType, LLMReport } from '@/types';

export default function DashboardPage() {
  const router = useRouter();
  const formRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<{ username: string; role: string } | null>(null);
  const [predicting, setPredicting] = useState(false);
  const [predictionResult, setPredictionResult] = useState<PredictionResponse | null>(null);
  const [predictions, setPredictions] = useState<PredictionHistoryType[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState('');
  const [selectedPrediction, setSelectedPrediction] = useState<PredictionHistoryType | null>(null);
  const [selectedReport, setSelectedReport] = useState<LLMReport | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [llmStatus, setLlmStatus] = useState<'checking' | 'connected' | 'offline'>('checking');
  const [predictingSlow, setPredictingSlow] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<'all' | 'easy' | 'moderate' | 'difficult'>('all');
  const [showForm, setShowForm] = useState(true);
  const [lastSubmittedPatient, setLastSubmittedPatient] = useState<PredictionInput | null>(null);

  const toggleTheme = useCallback(() => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    if (!getToken()) { router.replace('/login'); return; }
    const u = getUser();
    if (u) setUser(u);
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
    if (window.location.hash === '#assess-form') {
      setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);
    }
    checkLlmStatus()
      .then((s) => setLlmStatus(s.connected ? 'connected' : 'offline'))
      .catch(() => setLlmStatus('offline'));
  }, [router]);

  const fetchPredictions = useCallback(async () => {
    setLoadingHistory(true);
    try { const data = await getPredictions(); setPredictions(data); }
    catch { /* silent */ }
    finally { setLoadingHistory(false); }
  }, []);

  useEffect(() => { if (getToken()) fetchPredictions(); }, [fetchPredictions]);

  const handleSelectPrediction = useCallback(async (pred: PredictionHistoryType) => {
    setSelectedPrediction(pred);
    setLoadingReport(true);
    try { const report = await getPredictionReport(pred.id); setSelectedReport(report); }
    catch { setSelectedReport(null); }
    finally { setLoadingReport(false); }
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedPrediction(null);
    setSelectedReport(null);
  }, []);

  const handleLogout = () => { logout(); router.push('/login'); };

  const handleSubmit = async (data: PredictionInput) => {
    setPredicting(true);
    setPredictingSlow(false);
    setError('');
    const controller = new AbortController();
    const slowTimer = setTimeout(() => setPredictingSlow(true), 5000);
    const failTimer = setTimeout(() => controller.abort(), 35000);
    try {
      await createPatient({
        patient_id: data.patient_id, age: data.age, gender: data.gender, bmi: data.bmi,
        mallampati: String(data.mallampati_score), tmd: data.tmd, neck_circumference: data.neck_circumference,
      });
      const result: PredictionResponse = await runPrediction(data, controller.signal);
      setPredictionResult(result);
      setLastSubmittedPatient(data);
      handleClearSelection();
      fetchPredictions();
    } catch (err) {
      if (controller.signal.aborted) {
        setError('Time limit exceeded. There has been an error with the LLM response. Please wait for a while and try again.');
      } else {
        setError(err instanceof Error ? err.message : 'Prediction failed. Please try again.');
      }
    } finally {
      clearTimeout(slowTimer);
      clearTimeout(failTimer);
      setPredicting(false);
      setPredictingSlow(false);
    }
  };

  const handleNewAssessment = useCallback(() => {
    setPredictionResult(null);
    setSelectedPrediction(null);
    setSelectedReport(null);
    setLastSubmittedPatient(null);
    setShowForm(true);
  }, []);

  function FormStatusBar({ patient, onEdit, onNew }: { patient: PredictionInput; onEdit: () => void; onNew: () => void }) {
    return (
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-700 shadow-card animate-fade-in">
        <div className="px-5 py-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-black flex items-center justify-center shadow-soft">
              <User className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-50">{patient.patient_id}</span>
                <span className="text-[10px] font-medium text-neutral-400 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-sm">{patient.gender}</span>
              </div>
              <div className="flex items-center gap-3 mt-0.5 text-xs text-neutral-500 dark:text-neutral-300">
                <span>{patient.age}y</span>
                <span className="w-1 h-1 rounded-sm bg-neutral-300 dark:bg-neutral-600" />
                <span>BMI {patient.bmi}</span>
                <span className="w-1 h-1 rounded-sm bg-neutral-300 dark:bg-neutral-600" />
                <span>Mallampati {patient.mallampati_score}</span>
                <span className="w-1 h-1 rounded-sm bg-neutral-300 dark:bg-neutral-600" />
                <span>TMD {patient.tmd}cm</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onNew}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-brand-700 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/30 border border-brand-200 dark:border-brand-800 rounded-lg hover:bg-brand-100 dark:hover:bg-brand-950/50 transition-smooth">
              <Plus className="h-3.5 w-3.5" /> New
            </button>
            <button onClick={onEdit}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-smooth">
              <Edit3 className="h-3.5 w-3.5" /> Edit
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const activePrediction = selectedPrediction || predictionResult?.prediction || null;
  const activeRiskScore = selectedPrediction ? selectedPrediction.risk_score : predictionResult?.prediction.risk_score ?? null;
  const activeConfidence = selectedPrediction ? selectedPrediction.confidence : predictionResult?.prediction.confidence ?? null;
  const activeProbabilities = selectedPrediction ? selectedPrediction.probabilities : predictionResult?.prediction.probabilities ?? null;
  const activePredictionLabel = selectedPrediction ? selectedPrediction.prediction : predictionResult?.prediction.prediction ?? null;

  const easyCount = predictions.filter((p) => p.prediction.toLowerCase() === 'easy').length;
  const moderateCount = predictions.filter((p) => p.prediction.toLowerCase() === 'moderate').length;
  const difficultCount = predictions.filter((p) => p.prediction.toLowerCase() === 'difficult').length;

  const reportSources = selectedPrediction
    ? { summary: selectedReport?.summary_source, recommendations: selectedReport?.recommendations_source }
    : predictionResult?.report_sources;

  return (
    <div className="min-h-screen bg-[#F5F1DC] dark:bg-[#121212]">
      <Sidebar />

      <div className="lg:pl-64 transition-all duration-300">
        {/* Top Bar */}
        <header className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700 shadow-soft">
          <div className="px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="lg:hidden w-10" />
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-black flex items-center justify-center shadow-soft">
                  <Activity className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-neutral-800 dark:text-neutral-50">
                    Airway Assessment
                  </h1>
                  <p className="text-xs text-neutral-400 dark:text-neutral-400 capitalize">
                    {user.role} · {user.username}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={clsx(
                  'hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold border-2 border-black rounded-[4px]',
                  llmStatus === 'connected'
                    ? 'bg-success-50 text-success-700'
                    : llmStatus === 'offline'
                    ? 'bg-danger-50 text-danger-700'
                    : 'bg-white text-neutral-500'
                )}
              >
                <span
                  className={clsx(
                    'h-1.5 w-1.5 rounded-sm',
                    llmStatus === 'connected'
                      ? 'bg-success-500'
                      : llmStatus === 'offline'
                      ? 'bg-danger-500'
                      : 'bg-neutral-400'
                  )}
                />
                {llmStatus === 'connected' ? 'AI Connected' : llmStatus === 'offline' ? 'AI Offline' : 'AI Checking…'}
              </span>
              <button
                onClick={toggleTheme}
                className="h-9 w-9 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 flex items-center justify-center text-neutral-500 dark:text-neutral-300 hover:text-neutral-700 dark:hover:text-neutral-50 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-smooth"
                aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
              <button onClick={handleLogout}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm text-neutral-500 dark:text-neutral-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-smooth border border-transparent hover:border-red-200 dark:hover:border-red-800">
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
              <div className="h-8 w-8 rounded-sm bg-black flex items-center justify-center text-white text-sm font-semibold shadow-soft">
                {user.username.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-[1200px] mx-auto space-y-6">
          {/* Error banner */}
          {error && (
            <div className="p-3 bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-xl flex items-start gap-2.5 animate-fade-in">
              <div className="h-4 w-4 rounded-sm bg-danger-500 text-black flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-[10px] font-bold">!</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-danger-800 dark:text-danger-300">Assessment Error</p>
                <p className="text-xs text-danger-600 dark:text-danger-400 mt-0.5">{error}</p>
              </div>
              <button onClick={() => setError('')} className="text-danger-400 hover:text-danger-600">&times;</button>
            </div>
          )}

          {/* LLM slow warning */}
          {predicting && predictingSlow && (
            <div className="p-3 bg-warning-50 dark:bg-warning-900/20 border-2 border-black rounded-[6px] flex items-center gap-2.5 animate-fade-in">
              <Loader2 className="h-4 w-4 animate-spin text-warning-600 flex-shrink-0" />
              <p className="text-sm font-medium text-warning-800 dark:text-warning-300">
                The LLM response is taking longer than usual. Please wait…
              </p>
            </div>
          )}

          {/* Row 1 — Patient Entry + Risk Score side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            {/* LEFT — patient entry */}
            <div className="space-y-4">
              {showForm ? (
                <div ref={formRef} id="assess-form">
                  <PatientForm onSubmit={handleSubmit} loading={predicting} initialData={lastSubmittedPatient} />
                </div>
              ) : lastSubmittedPatient ? (
                <FormStatusBar patient={lastSubmittedPatient} onEdit={() => setShowForm(true)} onNew={handleNewAssessment} />
              ) : null}
            </div>

            {/* RIGHT — risk score, stretches to fill column height */}
            {activeRiskScore !== null ? (
              <div className="flex flex-col gap-4 h-full">
                {selectedPrediction && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 rounded-xl animate-fade-in">
                    <span className="text-xs text-brand-700 dark:text-brand-300 font-medium">
                      Viewing record for <strong>{selectedPrediction.patient_id}</strong>
                    </span>
                    <div className="ml-auto flex items-center gap-3">
                      <button onClick={handleNewAssessment}
                        className="text-xs text-brand-600 dark:text-brand-400 hover:text-brand-800 font-semibold underline">+ New</button>
                      <button onClick={handleClearSelection}
                        className="text-xs text-brand-600 dark:text-brand-400 hover:text-brand-800 font-semibold underline">Clear</button>
                    </div>
                  </div>
                )}
                <div className="flex-1 min-h-0">
                  <RiskPredictionCard
                    riskScore={activeRiskScore}
                    prediction={activePredictionLabel || ''}
                    confidence={activeConfidence || 0}
                    probabilities={activeProbabilities || {}}
                  />
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-700 shadow-card p-8 flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="h-20 w-20 rounded-sm bg-neutral-50 dark:bg-neutral-800 border-2 border-dashed border-neutral-200 dark:border-neutral-600 flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl font-bold text-neutral-300 dark:text-neutral-500">?</span>
                  </div>
                  <p className="text-sm text-neutral-400 dark:text-neutral-300 font-medium">No risk score yet</p>
                  <p className="text-xs text-neutral-400 dark:text-neutral-400 mt-1">Submit the form to see prediction</p>
                </div>
              </div>
            )}
          </div>

          {/* Row 2 — Recent Records (full width) */}
          <MiniHistory
            predictions={predictions}
            selectedId={selectedPrediction?.id}
            onSelect={handleSelectPrediction}
          />

          {/* Row 3 — Doctor's Recommendations (full width) */}
          {activeRiskScore !== null && (
            <AiClinicalAssessment
              summary={selectedReport ? selectedReport.summary : predictionResult?.clinical_summary || ''}
              recommendations={selectedReport ? selectedReport.recommendations : predictionResult?.recommendations || ''}
              loading={predicting || loadingReport}
              prediction={activePredictionLabel || undefined}
              slow={predictingSlow}
              sources={reportSources}
            />
          )}

          {/* Row 4 — Overview (full width) */}
          <StatsCard
            easy={easyCount}
            moderate={moderateCount}
            difficult={difficultCount}
            total={predictions.length}
          />

          {/* Row 5 — Patient History (full width) */}
          <PatientHistory
            predictions={predictions}
            loading={loadingHistory}
            selectedId={selectedPrediction?.id}
            onSelect={handleSelectPrediction}
            filter={historyFilter}
            onFilterChange={setHistoryFilter}
            onDelete={async (id) => {
              try { await deletePrediction(id); } catch { /* 404 ok */ }
              setPredictions((prev) => prev.filter((p) => p.id !== id));
              if (selectedPrediction?.id === id) handleClearSelection();
            }}
          />
          </div>
        </main>
      </div>
    </div>
  );
}
