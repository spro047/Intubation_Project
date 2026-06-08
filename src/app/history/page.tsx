'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import PatientHistory from '@/components/PatientHistory';
import { getToken, getUser } from '@/lib/api';
import { getPredictions } from '@/lib/api';
import type { PredictionHistory as PredictionHistoryType } from '@/types';

export default function HistoryPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ username: string; role: string } | null>(
    null
  );
  const [predictions, setPredictions] = useState<PredictionHistoryType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getToken()) {
      router.replace('/login');
      return;
    }
    const u = getUser();
    if (u) setUser(u);
  }, [router]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getPredictions();
        setPredictions(data);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    if (getToken()) {
      fetchData();
    }
  }, []);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />

      <div className="lg:pl-80 transition-all duration-300">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="lg:hidden w-10" />
              <div>
                <div className="flex items-center gap-3">
                  <Link
                    href="/dashboard"
                    className="h-8 w-8 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-smooth"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                  <div>
                    <h1 className="text-lg font-semibold text-gray-800">
                      Prediction History
                    </h1>
                    <p className="text-xs text-gray-400">
                      View all previous airway assessments
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-medical-400 to-medical-600 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
              {user.username.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <PatientHistory predictions={predictions} loading={loading} />
        </main>
      </div>
    </div>
  );
}
