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
      ? { strip: 'bg-success-500', label: 'Easy Airway', labelColor: 'text-success-700 dark:text-success-400', badgeBg: 'bg-success-50 dark:bg-success-900/20', badgeBorder: 'border-success-200 dark:border-success-800' }
      : p === 'moderate'
      ? { strip: 'bg-warning-500', label: 'Moderate Airway', labelColor: 'text-warning-700 dark:text-warning-400', badgeBg: 'bg-warning-50 dark:bg-warning-900/20', badgeBorder: 'border-warning-200 dark:border-warning-800' }
      : p === 'difficult'
      ? { strip: 'bg-danger-500', label: 'Difficult Airway', labelColor: 'text-danger-700 dark:text-danger-400', badgeBg: 'bg-danger-50 dark:bg-danger-900/20', badgeBorder: 'border-danger-200 dark:border-danger-800' }
      : { strip: 'bg-neutral-400', label: 'Unknown', labelColor: 'text-neutral-500', badgeBg: 'bg-neutral-50 dark:bg-neutral-800', badgeBorder: 'border-neutral-200 dark:border-neutral-700' };

  const order = ['Easy', 'Moderate', 'Difficult'];

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm overflow-hidden animate-scale-in">
      <div className={clsx('h-2 w-full', colorClasses.strip)} />

      <div className="p-6 space-y-6">
        {/* Hero risk score */}
        <div className="text-center">
          <p className="text-[10px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-[0.15em] mb-2">
            Airway Risk Score
          </p>
          <div className="font-display text-7xl font-bold text-neutral-900 dark:text-neutral-50 leading-none tabular-nums tracking-tight animate-count-up">
            {(riskScore * 100).toFixed(0)}
            <span className="text-3xl font-display text-neutral-400 dark:text-neutral-500 align-top ml-0.5">%</span>
          </div>
        </div>

        {/* Prediction label */}
        <div className={clsx('rounded-lg border-2 px-4 py-3 text-center', colorClasses.badgeBg, colorClasses.badgeBorder)}>
          <p className={clsx('text-base font-bold tracking-wide', colorClasses.labelColor)}>
            {colorClasses.label}
          </p>
        </div>

        {/* Confidence bar */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
              Confidence
            </span>
            <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-200 tabular-nums font-mono">
              {(confidence * 100).toFixed(1)}%
            </span>
          </div>
          <div className="h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
            <div
              className={clsx('h-full rounded-full transition-all duration-700 ease-out', colorClasses.strip)}
              style={{ width: `${Math.min(100, confidence * 100)}%` }}
            />
          </div>
        </div>

        {/* Stacked probability bar */}
        <div className="space-y-2">
          <p className="text-[10px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
            Probability Distribution
          </p>
          {/* Segmented bar */}
          <div className="h-3 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden flex">
            {order.map((key) => {
              const val = probabilities?.[key] ?? 0;
              const barColor =
                key === 'Easy' ? 'bg-success-500' : key === 'Moderate' ? 'bg-warning-500' : 'bg-danger-500';
              const widthPct = Math.max(1, Math.min(100, val * 100));
              return (
                <div
                  key={key}
                  className={clsx('h-full first:rounded-l-full last:rounded-r-full transition-all duration-700 ease-out', barColor)}
                  style={{ width: `${widthPct}%` }}
                />
              );
            })}
          </div>
          {/* Legend */}
          <div className="flex justify-between">
            {order.map((key) => {
              const val = probabilities?.[key] ?? 0;
              const dotColor =
                key === 'Easy' ? 'bg-success-500' : key === 'Moderate' ? 'bg-warning-500' : 'bg-danger-500';
              return (
                <div key={key} className="flex items-center gap-1.5">
                  <span className={clsx('h-2 w-2 rounded-full', dotColor)} />
                  <span className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400">{key}</span>
                  <span className="text-[10px] font-semibold text-neutral-700 dark:text-neutral-200 tabular-nums font-mono">
                    {(val * 100).toFixed(1)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
