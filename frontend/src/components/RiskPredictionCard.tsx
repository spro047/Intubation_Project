'use client';

import clsx from 'clsx';

interface RiskPredictionCardProps {
  riskScore: number;
  prediction: string;
  confidence: number;
  probabilities: Record<string, number>;
}

export default function RiskPredictionCard({
  riskScore,
  prediction,
  confidence,
  probabilities,
}: RiskPredictionCardProps) {
  const p = prediction?.toLowerCase() || '';

  const colorClasses =
    p === 'easy'
      ? { border: 'border-success-500', bg: 'bg-success-50 dark:bg-success-900/20', text: 'text-success-700 dark:text-success-400', badge: 'bg-success-500', label: 'Easy Airway' }
      : p === 'moderate'
      ? { border: 'border-warning-500', bg: 'bg-warning-50 dark:bg-warning-900/20', text: 'text-warning-700 dark:text-warning-400', badge: 'bg-warning-500', label: 'Moderate Airway' }
      : p === 'difficult'
      ? { border: 'border-danger-500', bg: 'bg-danger-50 dark:bg-danger-900/20', text: 'text-danger-700 dark:text-danger-400', badge: 'bg-danger-500', label: 'Difficult Airway' }
      : { border: 'border-gray-300', bg: 'bg-gray-50 dark:bg-slate-800', text: 'text-gray-500', badge: 'bg-gray-400', label: 'Unknown' };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden animate-fade-in">
      {/* Color strip */}
      <div className={clsx('h-1.5 w-full', colorClasses.badge)} />

      <div className="p-5 space-y-5">
        {/* Risk Score */}
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Airway Risk Assessment
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold text-gray-900 dark:text-slate-100 tabular-nums">
              {riskScore.toFixed(2)}
            </span>
            <span className="text-sm text-gray-400 dark:text-slate-500 font-medium">/ 1.00</span>
          </div>
        </div>

        {/* Prediction badge */}
        <div className={clsx('rounded-lg border-2 p-4', colorClasses.border, colorClasses.bg)}>
          <p className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Prediction
          </p>
          <p className={clsx('text-xl font-bold', colorClasses.text)}>
            {colorClasses.label.toUpperCase()}
          </p>
        </div>

        {/* Confidence bar */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-gray-500 dark:text-slate-400">Confidence</span>
            <span className="text-sm font-bold text-gray-800 dark:text-slate-200 tabular-nums">
              {(confidence * 100).toFixed(1)}%
            </span>
          </div>
          <div className="h-2.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={clsx('h-full rounded-full transition-all duration-700', colorClasses.badge)}
              style={{ width: `${Math.min(100, confidence * 100)}%` }}
            />
          </div>
        </div>

        {/* Probability breakdown */}
        <div className="pt-3 border-t border-gray-100 dark:border-slate-800 space-y-2">
          {['Easy', 'Moderate', 'Difficult'].map((key) => {
            const val = probabilities?.[key] ?? 0;
            const barColor =
              key === 'Easy' ? 'bg-success-500' : key === 'Moderate' ? 'bg-warning-500' : 'bg-danger-500';
            return (
              <div key={key} className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-600 dark:text-slate-400 w-16">{key}</span>
                <div className="flex-1 h-2 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className={clsx('h-full rounded-full', barColor)} style={{ width: `${Math.min(100, val * 100)}%` }} />
                </div>
                <span className="text-xs font-semibold text-gray-700 dark:text-slate-300 w-11 text-right tabular-nums">
                  {(val * 100).toFixed(1)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
