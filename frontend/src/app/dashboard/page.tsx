'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Bell } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import RiskPredictionCard from '@/components/RiskPredictionCard';
import AiClinicalAssessment from '@/components/AiClinicalAssessment';
import PatientForm from '@/components/PatientForm';
import PatientHistory from '@/components/PatientHistory';
import {
  getPredictions, runPrediction, createPatient, deletePrediction,
  getPredictionReport, logout, getToken, getUser,
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

  useEffect(() => {
    if (!getToken()) { router.replace('/login'); return; }
    const u = getUser();
    if (u) setUser(u);
    if (window.location.hash === '#assess-form') {
      setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);
    }
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
    setPredicting(true); setError('');
    try {
      await createPatient({
        patient_id: data.patient_id, age: data.age, gender: data.gender, bmi: data.bmi,
        mallampati: String(data.mallampati_score), tmd: data.tmd, neck_circumference: data.neck_circumference,
      });
      const result: PredictionResponse = await runPrediction(data);
      setPredictionResult(result);
      handleClearSelection();
      fetchPredictions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Prediction failed. Please try again.');
    } finally { setPredicting(false); }
  };

  if (!user) return null;

  const activePrediction = selectedPrediction || predictionResult?.prediction || null;
  const activeRiskScore = selectedPrediction ? selectedPrediction.risk_score : predictionResult?.prediction.risk_score ?? null;
  const activeConfidence = selectedPrediction ? selectedPrediction.confidence : predictionResult?.prediction.confidence ?? null;
  const activeProbabilities = selectedPrediction ? selectedPrediction.probabilities : predictionResult?.prediction.probabilities ?? null;
  const activePredictionLabel = selectedPrediction ? selectedPrediction.prediction : predictionResult?.prediction.prediction ?? null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <Sidebar />

      <div className="lg:pl-64 transition-all duration-300">
        {/* Top Bar */}
        <header className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="lg:hidden w-10" />
              <div>
                <h1 className="text-lg font-semibold text-gray-800 dark:text-slate-100">
                  Airway Assessment
                </h1>
                <p className="text-xs text-gray-400 dark:text-slate-500 capitalize">
                  {user.role} · {user.username}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="h-9 w-9 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 flex items-center justify-center text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition-smooth relative">
                <Bell className="h-4 w-4" />
                <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-danger-500 border-2 border-white dark:border-slate-900" />
              </button>
              <button onClick={handleLogout}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm text-gray-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-smooth border border-transparent hover:border-red-200 dark:hover:border-red-800">
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-medical-400 to-medical-600 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                {user.username.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Error banner */}
          {error && (
            <div className="p-3 bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-xl flex items-start gap-2.5 animate-fade-in">
              <div className="h-4 w-4 rounded-full bg-danger-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-[10px] font-bold">!</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-danger-800 dark:text-danger-300">Assessment Error</p>
                <p className="text-xs text-danger-600 dark:text-danger-400 mt-0.5">{error}</p>
              </div>
              <button onClick={() => setError('')} className="text-danger-400 hover:text-danger-600">&times;</button>
            </div>
          )}

          {/* Two-column layout: Form (left) | Results (right) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Patient Assessment Form */}
            <div ref={formRef} id="assess-form">
              <PatientForm onSubmit={handleSubmit} loading={predicting} />
            </div>

            {/* Right: Risk Prediction + AI Summary */}
            <div className="space-y-6">
              {activeRiskScore !== null ? (
                <>
                  <RiskPredictionCard
                    riskScore={activeRiskScore}
                    prediction={activePredictionLabel || ''}
                    confidence={activeConfidence || 0}
                    probabilities={activeProbabilities || {}}
                  />
                  <AiClinicalAssessment
                    summary={selectedReport ? selectedReport.summary : predictionResult?.clinical_summary || ''}
                    recommendations={selectedReport ? selectedReport.recommendations : predictionResult?.recommendations || ''}
                    loading={predicting || loadingReport}
                    prediction={activePredictionLabel || undefined}
                  />
                </>
              ) : (
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-5 h-full flex items-center justify-center min-h-[280px]">
                  <div className="text-center">
                    <div className="h-16 w-16 rounded-full bg-gray-50 dark:bg-slate-800 border-2 border-dashed border-gray-200 dark:border-slate-700 flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold text-gray-300 dark:text-slate-600">?</span>
                    </div>
                    <p className="text-sm text-gray-400 dark:text-slate-500 font-medium">No assessment results</p>
                    <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">Run an assessment to see the prediction</p>
                  </div>
                </div>
              )}

              {/* Selected record indicator */}
              {selectedPrediction && (
                <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg animate-fade-in">
                  <span className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                    Viewing record for <strong>{selectedPrediction.patient_id}</strong>
                  </span>
                  <button onClick={handleClearSelection} className="ml-auto text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 font-semibold underline">Clear</button>
                </div>
              )}
            </div>
          </div>

          {/* Patient History — full width below */}
          <PatientHistory
            predictions={predictions}
            loading={loadingHistory}
            selectedId={selectedPrediction?.id}
            onSelect={handleSelectPrediction}
            onDelete={async (id) => {
              try { await deletePrediction(id); } catch { /* 404 ok */ }
              setPredictions((prev) => prev.filter((p) => p.id !== id));
              if (selectedPrediction?.id === id) handleClearSelection();
            }}
          />
        </main>
      </div>
    </div>
  );
}
