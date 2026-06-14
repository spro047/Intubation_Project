'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Sun, Moon, User, Edit3, Plus, Activity, Stethoscope } from 'lucide-react';
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
  const [darkMode, setDarkMode] = useState(false);
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
      setLastSubmittedPatient(data);
      setShowForm(false);
      handleClearSelection();
      fetchPredictions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Prediction failed. Please try again.');
    } finally { setPredicting(false); }
  };

  const handleNewAssessment = useCallback(() => {
    setPredictionResult(null);
    setSelectedPrediction(null);
    setSelectedReport(null);
    setLastSubmittedPatient(null);
    setShowForm(true);
  }, []);

  function FormStatusBar({ patient, onEdit, onNew }: { patient: PredictionInput; onEdit: () => void; onNew: () => void }) {
    const bmiCat = patient.bmi < 25 ? 'Normal' : patient.bmi < 30 ? 'Overweight' : 'Obese';
    return (
      <div className="bg-white dark:bg-claude-900 rounded-xl border border-gray-200 dark:border-claude-600 shadow-sm animate-fade-in">
        <div className="px-5 py-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-medical-50 dark:bg-medical-950/30 flex items-center justify-center">
              <User className="h-5 w-5 text-medical-600 dark:text-medical-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-800 dark:text-claude-50">{patient.patient_id}</span>
                <span className="text-[10px] font-medium text-gray-400 dark:text-claude-400 bg-gray-100 dark:bg-claude-800 px-2 py-0.5 rounded-full">{patient.gender}</span>
              </div>
              <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500 dark:text-claude-300">
                <span>{patient.age}y</span>
                <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-claude-600" />
                <span>BMI {patient.bmi}</span>
                <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-claude-600" />
                <span>Mallampati {patient.mallampati_score}</span>
                <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-claude-600" />
                <span>TMD {patient.tmd}cm</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onNew}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-medical-700 dark:text-medical-400 bg-medical-50 dark:bg-medical-950/30 border border-medical-200 dark:border-medical-800 rounded-lg hover:bg-medical-100 dark:hover:bg-medical-950/50 transition-smooth">
              <Plus className="h-3.5 w-3.5" /> New
            </button>
            <button onClick={onEdit}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-claude-300 bg-gray-50 dark:bg-claude-800 border border-gray-200 dark:border-claude-600 rounded-lg hover:bg-gray-100 dark:hover:bg-claude-700 transition-smooth">
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-claude-950">
      <Sidebar />

      <div className="lg:pl-64 transition-all duration-300">
        {/* Top Bar */}
        <header className="bg-white dark:bg-claude-900 border-b border-gray-200 dark:border-claude-700 shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="lg:hidden w-10" />
              <div>
                <h1 className="text-lg font-semibold text-gray-800 dark:text-claude-50">
                  Airway Assessment
                </h1>
                <p className="text-xs text-gray-400 dark:text-claude-400 capitalize">
                  {user.role} · {user.username}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className="h-9 w-9 rounded-lg bg-gray-50 dark:bg-claude-800 border border-gray-200 dark:border-claude-600 flex items-center justify-center text-gray-500 dark:text-claude-300 hover:text-gray-700 dark:hover:text-claude-50 hover:bg-gray-100 dark:hover:bg-claude-700 transition-smooth"
                aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
              <button onClick={handleLogout}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm text-gray-500 dark:text-claude-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-smooth border border-transparent hover:border-red-200 dark:hover:border-red-800">
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-medical-400 to-medical-500 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
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

          {/* Vertical Stacked Layout — Form above, Results below */}
          {showForm ? (
            <div ref={formRef} id="assess-form">
              <PatientForm onSubmit={handleSubmit} loading={predicting} initialData={lastSubmittedPatient} />
            </div>
          ) : lastSubmittedPatient ? (
            <FormStatusBar patient={lastSubmittedPatient} onEdit={() => setShowForm(true)} onNew={handleNewAssessment} />
          ) : null}

          {/* Selected record indicator (results context) */}
          {selectedPrediction && activeRiskScore !== null && (
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg animate-fade-in">
              <span className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                Viewing record for <strong>{selectedPrediction.patient_id}</strong>
              </span>
              <div className="ml-auto flex items-center gap-2">
                <button onClick={handleNewAssessment}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 font-semibold underline">+ New</button>
                <button onClick={handleClearSelection}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 font-semibold underline">Clear</button>
              </div>
            </div>
          )}

          {/* Results section */}
          {activeRiskScore !== null ? (
            <div className="space-y-6">
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
            </div>
          ) : !showForm && (
            <div className="bg-white dark:bg-claude-900 rounded-xl border border-gray-200 dark:border-claude-600 p-5 flex items-center justify-center min-h-[200px]">
              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-gray-50 dark:bg-claude-800 border-2 border-dashed border-gray-200 dark:border-claude-600 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-gray-300 dark:text-claude-500">?</span>
                </div>
                <p className="text-sm text-gray-400 dark:text-claude-300 font-medium">No assessment results</p>
                <p className="text-xs text-gray-400 dark:text-claude-400 mt-1">Run an assessment to see the prediction</p>
              </div>
            </div>
          )}

          {/* Patient History — full width below */}
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
        </main>
      </div>
    </div>
  );
}
