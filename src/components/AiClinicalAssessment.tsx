'use client';

import { Sparkles, Stethoscope, Lightbulb, AlertTriangle, Clock } from 'lucide-react';
import clsx from 'clsx';

interface AiClinicalAssessmentProps {
  summary: string;
  recommendations: string;
  loading: boolean;
  prediction?: string;
}

function parseBullets(text: string): string[] {
  if (!text) return [];
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .map((l) => (l.startsWith('-') ? l.slice(1).trim() : l));
}

export default function AiClinicalAssessment({
  summary,
  recommendations,
  loading,
  prediction,
}: AiClinicalAssessmentProps) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-claude-900 rounded-xl border border-gray-200 dark:border-claude-600 p-5 card-gradient animate-fade-in">
        <div className="flex items-center gap-3 mb-4">
          <div className="skeleton h-8 w-8 rounded-lg" />
          <div className="space-y-1.5 flex-1">
            <div className="skeleton h-4 w-40" />
            <div className="skeleton h-3 w-24" />
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-4 w-full" />
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-claude-700">
          <div className="skeleton h-5 w-48 mb-3" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-4 w-full mb-2" />
          ))}
        </div>
      </div>
    );
  }

  if (!summary && !recommendations) {
    return (
      <div className="bg-white dark:bg-claude-900 rounded-xl border border-gray-200 dark:border-claude-600 p-5 card-gradient animate-fade-in">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-8 w-8 rounded-lg bg-medical-50 dark:bg-medical-950/30 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-medical-600 dark:text-medical-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-claude-50">AI Clinical Assessment</h3>
            <p className="text-xs text-gray-400 dark:text-claude-400">Powered by Ollama qvac/medpsy</p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Stethoscope className="h-10 w-10 text-gray-300 dark:text-claude-500 mb-3" />
          <p className="text-sm text-gray-400 dark:text-claude-400">
            Run a patient assessment to see the AI-generated clinical analysis and recommendations.
          </p>
        </div>
      </div>
    );
  }

  const summaryBullets = parseBullets(summary);
  const recBullets = parseBullets(recommendations);

  const urgencyLevel = prediction?.toLowerCase() === 'difficult' ? 'High' : prediction?.toLowerCase() === 'moderate' ? 'Moderate' : 'Low';
  const urgencyColor =
    urgencyLevel === 'High' ? 'bg-danger-500' : urgencyLevel === 'Moderate' ? 'bg-warning-500' : 'bg-success-500';

  return (
    <div className="bg-white dark:bg-claude-900 rounded-xl border border-gray-200 dark:border-claude-600 card-gradient animate-fade-in overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 dark:border-claude-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-medical-50 dark:bg-medical-950/30 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-medical-600 dark:text-medical-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-claude-50">
              AI Clinical Assessment
            </h3>
            <p className="text-xs text-gray-400 dark:text-claude-400">
              Powered by Ollama · qvac/medpsy
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-gray-400" />
          <span className="text-xs text-gray-400 dark:text-claude-400">Real-time</span>
          <span className={clsx('ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold text-white', urgencyColor)}>
            {urgencyLevel} Urgency
          </span>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Clinical Summary */}
        <div className="p-4 rounded-lg bg-medical-50 dark:bg-medical-900/20 border border-medical-100 dark:border-medical-800">
          <div className="flex items-center gap-2 mb-3">
            <Stethoscope className="h-4 w-4 text-medical-600 dark:text-medical-400" />
            <span className="text-sm font-semibold text-medical-800 dark:text-medical-300">
              Clinical Summary
            </span>
          </div>
          {summaryBullets.length > 0 ? (
            <ul className="space-y-2">
              {summaryBullets.map((bullet, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-claude-200 leading-relaxed">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-medical-400 flex-shrink-0" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-700 dark:text-claude-200 whitespace-pre-wrap">{summary}</p>
          )}
        </div>

        {/* Recommendations */}
        <div className="p-4 rounded-lg bg-success-50 dark:bg-blue-900/40 border border-success-100 dark:border-blue-800">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="h-4 w-4 text-success-600 dark:text-blue-300" />
            <span className="text-sm font-semibold text-success-800 dark:text-blue-200">
              Recommendations
            </span>
          </div>
          {recBullets.length > 0 ? (
            <ul className="space-y-2">
              {recBullets.map((bullet, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-blue-100 leading-relaxed">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-success-400 dark:bg-blue-400 flex-shrink-0" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-700 dark:text-blue-100 whitespace-pre-wrap">{recommendations}</p>
          )}
        </div>

        {/* Risk Factors Banner */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800">
          <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />
          <p className="text-xs text-amber-800 dark:text-amber-300 font-medium">
            {prediction?.toLowerCase() === 'difficult'
              ? 'Difficult airway anticipated — ensure difficult airway cart and experienced clinician available.'
              : prediction?.toLowerCase() === 'moderate'
              ? 'Moderate risk — prepare alternative airway devices and have backup plan ready.'
              : 'Low risk — standard intubation protocol is likely sufficient.'}
          </p>
        </div>
      </div>
    </div>
  );
}
