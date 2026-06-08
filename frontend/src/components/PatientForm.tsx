'use client';

import { useState, FormEvent } from 'react';
import { Activity, User, Stethoscope, ClipboardList, AlertCircle, Info } from 'lucide-react';
import type { PredictionInput } from '@/types';
import clsx from 'clsx';

interface PatientFormProps {
  onSubmit: (data: PredictionInput) => void;
  loading: boolean;
}

interface FormErrors {
  [key: string]: string;
}

export default function PatientForm({ onSubmit, loading }: PatientFormProps) {
  const [formData, setFormData] = useState<PredictionInput>({
    patient_id: '',
    age: 0,
    gender: '',
    bmi: 0,
    mallampati_score: 0,
    tmd: 0,
    neck_circumference: 0,
    mouth_opening: 40,
    smd: 14,
    neck_movement: 85,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [activeSection, setActiveSection] = useState('demographics');

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.patient_id.trim()) newErrors.patient_id = 'Patient ID is required';
    if (!formData.age || formData.age < 0 || formData.age > 120) newErrors.age = 'Age must be between 0 and 120';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.bmi || formData.bmi < 10 || formData.bmi > 60) newErrors.bmi = 'BMI must be between 10 and 60';
    if (!formData.mallampati_score || formData.mallampati_score < 1 || formData.mallampati_score > 4)
      newErrors.mallampati_score = 'Mallampati score must be 1–4';
    if (!formData.tmd || formData.tmd < 3 || formData.tmd > 12) newErrors.tmd = 'TMD must be between 3 and 12 cm';
    if (!formData.neck_circumference || formData.neck_circumference < 20 || formData.neck_circumference > 60)
      newErrors.neck_circumference = 'Neck circumference must be between 20 and 60 cm';
    if (formData.mouth_opening === undefined || formData.mouth_opening < 10 || formData.mouth_opening > 80)
      newErrors.mouth_opening = 'Mouth opening must be between 10 and 80 mm';
    if (formData.smd === undefined || formData.smd < 3 || formData.smd > 20)
      newErrors.smd = 'SMD must be between 3 and 20 cm';
    if (formData.neck_movement === undefined || formData.neck_movement < 30 || formData.neck_movement > 180)
      newErrors.neck_movement = 'Neck movement must be between 30 and 180°';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        ...formData,
        age: Number(formData.age),
        bmi: Number(formData.bmi),
        mallampati_score: Number(formData.mallampati_score),
        tmd: Number(formData.tmd),
        neck_circumference: Number(formData.neck_circumference),
        mouth_opening: Number(formData.mouth_opening),
        smd: Number(formData.smd),
        neck_movement: Number(formData.neck_movement),
      });
    }
  };

  const handleChange = (field: keyof PredictionInput, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
  };

  const inputClass = (field: string) =>
    clsx(
      'w-full px-3 py-2.5 text-sm border rounded-lg transition-smooth focus:outline-none focus:ring-2 bg-white dark:bg-slate-800',
      errors[field]
        ? 'border-danger-300 focus:ring-danger-200 dark:border-danger-600'
        : 'border-gray-200 dark:border-slate-700 focus:ring-medical-200 focus:border-medical-400 dark:focus:border-medical-500 hover:border-gray-300 dark:hover:border-slate-600'
    );

  const labelClass = 'block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1.5';
  const sectionTab = (id: string, label: string, icon: React.ElementType) => {
    const Icon = icon;
    return (
      <button
        type="button"
        onClick={() => setActiveSection(id)}
        className={clsx(
          'flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-smooth border',
          activeSection === id
            ? 'bg-medical-50 dark:bg-medical-900/30 text-medical-700 dark:text-medical-400 border-medical-200 dark:border-medical-800'
            : 'text-gray-500 dark:text-slate-400 border-transparent hover:bg-gray-50 dark:hover:bg-slate-800'
        )}
      >
        <Icon className="h-4 w-4" />
        {label}
      </button>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm card-gradient animate-fade-in">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 dark:border-slate-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-8 w-8 rounded-lg bg-medical-50 dark:bg-medical-900/30 flex items-center justify-center">
            <Activity className="h-4 w-4 text-medical-600 dark:text-medical-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-800 dark:text-slate-100">Patient Assessment</h2>
            <p className="text-xs text-gray-400 dark:text-slate-500">Enter patient data for airway risk evaluation</p>
          </div>
        </div>
        {/* Section tabs */}
        <div className="flex gap-1 overflow-x-auto">
          {sectionTab('demographics', 'Demographics', User)}
          {sectionTab('airway', 'Airway Evaluation', Stethoscope)}
          {sectionTab('physical', 'Physical Exam', ClipboardList)}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-5">
        {/* Demographics Section */}
        {activeSection === 'demographics' && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <label htmlFor="patient_id" className={labelClass}>
                Patient ID <span className="text-danger-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="patient_id" type="text" placeholder="e.g. P-2024-0001"
                  value={formData.patient_id}
                  onChange={(e) => handleChange('patient_id', e.target.value)}
                  className={inputClass('patient_id')}
                />
                <Info className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300 dark:text-slate-600" />
              </div>
              {errors.patient_id && <p className="mt-1 text-xs text-danger-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.patient_id}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="age" className={labelClass}>Age <span className="text-danger-500">*</span></label>
                <input id="age" type="number" min={0} max={120} placeholder="e.g. 45"
                  value={formData.age || ''} onChange={(e) => handleChange('age', e.target.value)}
                  className={inputClass('age')} />
                {errors.age && <p className="mt-1 text-xs text-danger-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.age}</p>}
              </div>
              <div>
                <label htmlFor="gender" className={labelClass}>Gender <span className="text-danger-500">*</span></label>
                <select id="gender" value={formData.gender} onChange={(e) => handleChange('gender', e.target.value)}
                  className={inputClass('gender')}>
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
                {errors.gender && <p className="mt-1 text-xs text-danger-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.gender}</p>}
              </div>
              <div>
                <label htmlFor="bmi" className={labelClass}>BMI <span className="text-danger-500">*</span></label>
                <input id="bmi" type="number" min={10} max={60} step={0.1} placeholder="e.g. 28.5"
                  value={formData.bmi || ''} onChange={(e) => handleChange('bmi', e.target.value)}
                  className={inputClass('bmi')} />
                {errors.bmi && <p className="mt-1 text-xs text-danger-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.bmi}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Airway Evaluation Section */}
        {activeSection === 'airway' && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <label htmlFor="mallampati" className={labelClass}>Mallampati Score <span className="text-danger-500">*</span></label>
              <select id="mallampati" value={formData.mallampati_score || ''}
                onChange={(e) => handleChange('mallampati_score', e.target.value)}
                className={inputClass('mallampati_score')}>
                <option value="">Select score</option>
                <option value="1">Class I — Soft palate, uvula, fauces visible</option>
                <option value="2">Class II — Soft palate, uvula visible</option>
                <option value="3">Class III — Soft palate, base of uvula visible</option>
                <option value="4">Class IV — Only hard palate visible</option>
              </select>
              {errors.mallampati_score && <p className="mt-1 text-xs text-danger-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.mallampati_score}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="tmd" className={labelClass}>
                  Thyromental Distance (cm) <span className="text-danger-500">*</span>
                  <span className="text-gray-400 dark:text-slate-500 font-normal ml-1">(TMD)</span>
                </label>
                <input id="tmd" type="number" min={3} max={12} step={0.1} placeholder="e.g. 6.5"
                  value={formData.tmd || ''} onChange={(e) => handleChange('tmd', e.target.value)}
                  className={inputClass('tmd')} />
                {errors.tmd && <p className="mt-1 text-xs text-danger-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.tmd}</p>}
              </div>
              <div>
                <label htmlFor="smd" className={labelClass}>Sternomental Distance (cm) <span className="text-gray-400 font-normal">(SMD)</span></label>
                <input id="smd" type="number" min={3} max={20} step={0.1} placeholder="e.g. 14.0"
                  value={formData.smd || ''} onChange={(e) => handleChange('smd', e.target.value)}
                  className={inputClass('smd')} />
                {errors.smd && <p className="mt-1 text-xs text-danger-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.smd}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Physical Examination Section */}
        {activeSection === 'physical' && (
          <div className="space-y-4 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="neck" className={labelClass}>
                  Neck Circumference (cm) <span className="text-danger-500">*</span>
                </label>
                <input id="neck" type="number" min={20} max={60} step={0.1} placeholder="e.g. 38.0"
                  value={formData.neck_circumference || ''}
                  onChange={(e) => handleChange('neck_circumference', e.target.value)}
                  className={inputClass('neck_circumference')} />
                {errors.neck_circumference && <p className="mt-1 text-xs text-danger-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.neck_circumference}</p>}
              </div>
              <div>
                <label htmlFor="mouth_opening" className={labelClass}>Mouth Opening (mm)</label>
                <input id="mouth_opening" type="number" min={10} max={80} step={0.5} placeholder="e.g. 40.0"
                  value={formData.mouth_opening || ''} onChange={(e) => handleChange('mouth_opening', e.target.value)}
                  className={inputClass('mouth_opening')} />
                {errors.mouth_opening && <p className="mt-1 text-xs text-danger-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.mouth_opening}</p>}
              </div>
              <div>
                <label htmlFor="neck_movement" className={labelClass}>Neck Movement (°)</label>
                <input id="neck_movement" type="number" min={30} max={180} step={1} placeholder="e.g. 85"
                  value={formData.neck_movement || ''} onChange={(e) => handleChange('neck_movement', e.target.value)}
                  className={inputClass('neck_movement')} />
                {errors.neck_movement && <p className="mt-1 text-xs text-danger-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.neck_movement}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Error summary */}
        {Object.keys(errors).length > 0 && (
          <div className="mt-4 p-2.5 bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-lg">
            <p className="text-xs text-danger-600 dark:text-danger-400 flex items-center gap-1">
              <AlertCircle className="h-3.5 w-3.5" />
              Please fix the validation errors above before submitting.
            </p>
          </div>
        )}

        {/* Submit */}
        <div className="mt-5">
          <button
            type="submit"
            disabled={loading}
            className={clsx(
              'w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-white transition-smooth shadow-sm',
              loading
                ? 'bg-medical-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-medical-600 to-medical-500 hover:from-medical-700 hover:to-medical-600 hover:shadow-md active:scale-[0.98]'
            )}
          >
            {loading && (
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {loading ? 'Running Prediction...' : 'Run Assessment'}
            {!loading && <Activity className="h-4 w-4" />}
          </button>
        </div>
      </form>
    </div>
  );
}
