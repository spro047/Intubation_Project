'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Brain,
  Cpu,
  Database,
  FlaskConical,
  ArrowLeft,
  BarChart3,
  Sparkles,
  Layers,
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { getToken, getUser } from '@/lib/api';
import clsx from 'clsx';

const mlModels = [
  {
    name: 'TabTransformer',
    type: 'Deep Learning (Transformer)',
    accuracy: '85.9%',
    auc: '0.970',
    params: '22 categorical + 7 numerical features',
    embed_dim: 64,
    layers: '3× Transformer blocks',
    file: 'tabular_best.pt',
  },
  {
    name: 'XGBoost',
    type: 'Gradient Boosted Trees',
    accuracy: '84.5%',
    auc: '0.962',
    params: 'All 30 tabular features',
    estimators: 200,
    max_depth: 8,
    file: 'xgboost_best.json',
  },
  {
    name: 'Random Forest',
    type: 'Ensemble of Decision Trees',
    accuracy: '81.3%',
    auc: '0.953',
    params: 'All 30 tabular features',
    estimators: 300,
    max_depth: 12,
    file: 'randomforest_best.pkl',
  },
];

const llmInfo = {
  provider: 'OpenRouter (API)',
  model: 'Qwen 2.5 72B Instruct (via OpenRouter)',
  endpoint: 'https://openrouter.ai/api/v1',
  temperature: 0.3,
  maxTokens: 512,
  purpose:
    'Generates clinical summaries and actionable recommendations based on prediction results and patient profile.',
};

const architecture = [
  { layer: 'Frontend', tech: 'Next.js 14, Tailwind CSS, Recharts', icon: Layers },
  { layer: 'Backend', tech: 'FastAPI, Motor (async MongoDB)', icon: Database },
  { layer: 'ML Engine', tech: 'PyTorch TabTransformer (tabular_best.pt)', icon: Brain },
  { layer: 'LLM Service', tech: 'OpenRouter API + Qwen 2.5 72B', icon: Sparkles },
  { layer: 'Database', tech: 'MongoDB Atlas (cloud)', icon: Cpu },
];

export default function AboutPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ username: string; role: string } | null>(
    null
  );

  useEffect(() => {
    if (!getToken()) {
      router.replace('/login');
      return;
    }
    const u = getUser();
    if (u) setUser(u);
  }, [router]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />

      <div className="lg:pl-80 transition-all duration-300">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="h-8 w-8 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-smooth"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div>
                <h1 className="text-lg font-semibold text-gray-800">About</h1>
                <p className="text-xs text-gray-400">
                  System architecture & model information
                </p>
              </div>
            </div>
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-medical-400 to-medical-600 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
              {user.username.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8 space-y-8">
          {/* ML Models Section */}
          <section>
            <div className="flex items-center gap-3 mb-5">
              <div className="h-8 w-8 rounded-lg bg-medical-50 flex items-center justify-center">
                <Brain className="h-4 w-4 text-medical-600" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-800">
                  Machine Learning Models
                </h2>
                <p className="text-xs text-gray-400">
                  Three-class classification: Easy / Moderate / Difficult
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {mlModels.map((model) => (
                <div
                  key={model.name}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 card-gradient hover:shadow-md transition-smooth"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-gray-800">
                      {model.name}
                    </h3>
                    <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider bg-gray-100 px-2 py-0.5 rounded-full">
                      {model.type.split(' ')[0]}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-4">{model.type}</p>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Accuracy</span>
                      <span className="text-sm font-bold text-medical-700">
                        {model.accuracy}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">AUC-ROC</span>
                      <span className="text-sm font-bold text-success-600">
                        {model.auc}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Features</span>
                      <span className="text-xs font-medium text-gray-700 text-right">
                        {model.params}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-100 text-[10px] text-gray-400 font-mono">
                    {model.file}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* LLM Section */}
          <section>
            <div className="flex items-center gap-3 mb-5">
              <div className="h-8 w-8 rounded-lg bg-purple-50 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-800">
                  LLM Assistant
                </h2>
                <p className="text-xs text-gray-400">
                  AI-powered clinical decision support
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 card-gradient">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Provider</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {llmInfo.provider}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Model</p>
                  <p className="text-sm font-semibold text-gray-800 font-mono">
                    {llmInfo.model}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Temperature</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {llmInfo.temperature}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Max Tokens</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {llmInfo.maxTokens}
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400 mb-1">Purpose</p>
                <p className="text-sm text-gray-700">{llmInfo.purpose}</p>
              </div>
            </div>
          </section>

          {/* Architecture Section */}
          <section>
            <div className="flex items-center gap-3 mb-5">
              <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center">
                <Layers className="h-4 w-4 text-gray-600" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-800">
                  System Architecture
                </h2>
                <p className="text-xs text-gray-400">
                  End-to-end technology stack
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-100">
              {architecture.map((layer, i) => {
                const Icon = layer.icon;
                return (
                  <div
                    key={layer.layer}
                    className="flex items-center gap-4 px-5 py-4"
                  >
                    <div
                      className={clsx(
                        'h-8 w-8 rounded-lg flex items-center justify-center',
                        i === 0
                          ? 'bg-medical-50 text-medical-600'
                          : i === 1
                          ? 'bg-green-50 text-green-600'
                          : i === 2
                          ? 'bg-purple-50 text-purple-600'
                          : i === 3
                          ? 'bg-amber-50 text-amber-600'
                          : 'bg-blue-50 text-blue-600'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800">
                        {layer.layer}
                      </p>
                      <p className="text-xs text-gray-500">{layer.tech}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
