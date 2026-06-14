'use client';

import { useState, FormEvent, useEffect } from 'react';
import { Activity, User, Stethoscope, ClipboardList, AlertCircle, Info, FlaskConical, Shuffle } from 'lucide-react';
import type { PredictionInput } from '@/types';
import clsx from 'clsx';

interface PatientFormProps {
  onSubmit: (data: PredictionInput) => void;
  loading: boolean;
  initialData?: PredictionInput | null;
}

interface FormErrors {
  [key: string]: string;
}

const defaultFormData: PredictionInput = {
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
  beard: 'No',
  chest_size: 'Medium',
  neck_structure: 'Normal',
  jaw_movement: 'Normal',
  tissue_flexibility: 'Normal',
};

export default function PatientForm({ onSubmit, loading, initialData }: PatientFormProps) {
  const [formData, setFormData] = useState<PredictionInput>(defaultFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [activeSection, setActiveSection] = useState('demographics');

  useEffect(() => {
    setFormData(initialData ? { ...initialData } : { ...defaultFormData });
    setErrors({});
    setActiveSection('demographics');
  }, [initialData]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.patient_id.trim()) newErrors.patient_id = 'Patient ID is required';
    if (!formData.age || formData.age < 0 || formData.age > 120) newErrors.age = 'Age must be between 0 and 120';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.bmi || formData.bmi < 10 || formData.bmi > 60) newErrors.bmi = 'BMI must be between 10 and 60';
    if (!formData.mallampati_score || formData.mallampati_score < 1 || formData.mallampati_score > 4)
      newErrors.mallampati_score = 'Mallampati score must be 1\u20134';
    if (!formData.tmd || formData.tmd < 3 || formData.tmd > 12) newErrors.tmd = 'TMD must be between 3 and 12 cm';
    if (!formData.neck_circumference || formData.neck_circumference < 20 || formData.neck_circumference > 60)
      newErrors.neck_circumference = 'Neck circumference must be between 20 and 60 cm';
    if (formData.mouth_opening === undefined || formData.mouth_opening < 10 || formData.mouth_opening > 80)
      newErrors.mouth_opening = 'Mouth opening must be between 10 and 80 mm';
    if (formData.smd === undefined || formData.smd < 3 || formData.smd > 20)
      newErrors.smd = 'SMD must be between 3 and 20 cm';
    if (formData.neck_movement === undefined || formData.neck_movement < 30 || formData.neck_movement > 180)
      newErrors.neck_movement = 'Neck movement must be between 30 and 180\u00b0';
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
      'w-full px-3 py-2.5 text-sm border rounded-lg transition-smooth focus:outline-none focus:ring-2 bg-white dark:bg-claude-800',
      errors[field]
        ? 'border-danger-300 focus:ring-danger-200 dark:border-danger-600'
        : 'border-gray-200 dark:border-claude-600 focus:ring-medical-300 focus:border-medical-400 dark:focus:border-medical-400 hover:border-gray-300 dark:hover:border-claude-500'
    );

  const labelClass = 'block text-sm font-medium text-gray-600 dark:text-claude-300 mb-1.5';
  const sectionTab = (id: string, label: string, icon: React.ElementType) => {
    const Icon = icon;
    return (
      <button
        type="button"
        onClick={() => setActiveSection(id)}
        className={clsx(
          'flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-smooth border',
          activeSection === id
            ? 'bg-medical-50 dark:bg-medical-950/40 text-medical-700 dark:text-medical-400 border-medical-200 dark:border-medical-800'
            : 'text-gray-500 dark:text-claude-300 border-transparent hover:bg-gray-50 dark:hover:bg-claude-800'
        )}
      >
        <Icon className="h-4 w-4" />
        {label}
      </button>
    );
  };

  const yesNoSelect = (field: keyof PredictionInput, label: string) => (
    <div>
      <label className={labelClass}>{label}</label>
      <select value={formData[field] as string} onChange={(e) => handleChange(field, e.target.value)}
        className={inputClass(field as string)}>
        <option value="No">No</option>
        <option value="Yes">Yes</option>
      </select>
    </div>
  );

  const generateRandomData = (): PredictionInput => {
    const genders = ['Male', 'Female'];
    const gender = genders[Math.random() < 0.5 ? 0 : 1];
    const age = Math.round(30 + Math.random() * 40 + (Math.random() < 0.3 ? 10 : 0));
    const bmi = Math.round((18 + Math.random() * 30 + (Math.random() < 0.4 ? 5 : 0)) * 10) / 10;
    const neck_circ = Math.round((28 + bmi * 0.35 + (Math.random() - 0.5) * 4) * 10) / 10;
    const mallampati_raw = bmi < 25
      ? (Math.random() < 0.4 ? 1 : Math.random() < 0.6 ? 2 : Math.random() < 0.7 ? 3 : 4)
      : bmi < 30
      ? (Math.random() < 0.2 ? 1 : Math.random() < 0.5 ? 2 : Math.random() < 0.8 ? 3 : 4)
      : (Math.random() < 0.1 ? 1 : Math.random() < 0.3 ? 2 : Math.random() < 0.6 ? 3 : 4);
    const mallampati_score = Math.min(4, Math.max(1, mallampati_raw));
    const tmd = Math.round(Math.max(3.5, Math.min(11, 8.5 - mallampati_score * 0.5 + (Math.random() - 0.5) * 1.5)) * 10) / 10;
    const mouth_opening = Math.round((35 + Math.random() * 20 + (mallampati_score > 3 ? -5 : 0)) * 10) / 10;
    const smd = Math.round((12 + Math.random() * 5 + (tmd < 6 ? -1 : 0)) * 10) / 10;
    const neck_movement = Math.round((70 + Math.random() * 30 + (bmi > 30 ? -10 : 0)) * 10) / 10;
    const beard = gender === 'Male' ? (Math.random() < 0.35 ? 'Yes' : 'No') : 'No';
    const chest_size = bmi < 25 ? 'Small' : bmi < 30 ? 'Medium' : 'Large';
    const neck_structure = bmi < 25 ? 'Normal' : (Math.random() < 0.4 ? 'Normal' : 'Abnormal');
    const jaw_movement = Math.random() < 0.75 ? 'Normal' : 'Reduced';
    const tissue_flexibility = Math.random() < 0.65 ? 'Normal' : 'Reduced';
    return {
      patient_id: `RAND-${Math.floor(1000 + Math.random() * 9000)}`,
      age, gender, bmi, mallampati_score, tmd, neck_circumference: neck_circ,
      mouth_opening, smd, neck_movement,
      beard, chest_size, neck_structure, jaw_movement, tissue_flexibility,
    };
  };

  return (
    <div className="bg-white dark:bg-claude-900 rounded-xl border border-gray-200 dark:border-claude-600 shadow-sm card-gradient animate-fade-in">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 dark:border-claude-700">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-8 w-8 rounded-lg bg-medical-50 dark:bg-medical-950/30 flex items-center justify-center">
            <Activity className="h-4 w-4 text-medical-600 dark:text-medical-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-800 dark:text-claude-50">Patient Assessment</h2>
            <p className="text-xs text-gray-400 dark:text-claude-400">Enter patient data for airway risk evaluation</p>
          </div>
        </div>
        {/* Quick-fill test case buttons */}
        <div className="flex flex-wrap gap-1.5 mb-2">
          <button
            type="button"
            onClick={() => {
              const data: PredictionInput = {
                patient_id: 'TEST-EASY-001', age: 54, gender: 'Female', bmi: 23.7,
                mallampati_score: 1, tmd: 7.6, neck_circumference: 36.4,
                mouth_opening: 43.7, smd: 16.1, neck_movement: 96.4,
              };
              setFormData(data); setErrors({}); setActiveSection('demographics');
            }}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md border border-green-200 bg-green-50 text-green-700 hover:bg-green-100 transition-smooth"
          >
            <FlaskConical className="h-3 w-3" /> Easy
          </button>
          <button
            type="button"
            onClick={() => {
              const data: PredictionInput = {
                patient_id: 'TEST-MOD-001', age: 54, gender: 'Female', bmi: 32.9,
                mallampati_score: 4, tmd: 6.1, neck_circumference: 39.2,
                mouth_opening: 50.9, smd: 15.7, neck_movement: 93.2,
              };
              setFormData(data); setErrors({}); setActiveSection('demographics');
            }}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md border border-yellow-200 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 transition-smooth"
          >
            <FlaskConical className="h-3 w-3" /> Moderate
          </button>
          <button
            type="button"
            onClick={() => {
              const data: PredictionInput = {
                patient_id: 'TEST-DIFF-001', age: 58, gender: 'Female', bmi: 50.0,
                mallampati_score: 4, tmd: 5.7, neck_circumference: 46.8,
                mouth_opening: 40.0, smd: 18.4, neck_movement: 81.2,
              };
              setFormData(data); setErrors({}); setActiveSection('demographics');
            }}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 transition-smooth"
          >
            <FlaskConical className="h-3 w-3" /> Difficult
          </button>
          <button
            type="button"
            onClick={() => {
              setFormData(generateRandomData()); setErrors({}); setActiveSection('demographics');
            }}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-smooth"
          >
            <Shuffle className="h-3 w-3" /> Random
          </button>
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
                <Info className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300 dark:text-claude-500" />
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
                <option value="1">Class I \u2014 Soft palate, uvula, fauces visible</option>
                <option value="2">Class II \u2014 Soft palate, uvula visible</option>
                <option value="3">Class III \u2014 Soft palate, base of uvula visible</option>
                <option value="4">Class IV \u2014 Only hard palate visible</option>
              </select>
              {errors.mallampati_score && <p className="mt-1 text-xs text-danger-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.mallampati_score}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="tmd" className={labelClass}>
                  Thyromental Distance (cm) <span className="text-danger-500">*</span>
                  <span className="text-gray-400 dark:text-claude-400 font-normal ml-1">(TMD)</span>
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
                <label htmlFor="neck_movement" className={labelClass}>Neck Movement (&deg;)</label>
                <input id="neck_movement" type="number" min={30} max={180} step={1} placeholder="e.g. 85"
                  value={formData.neck_movement || ''} onChange={(e) => handleChange('neck_movement', e.target.value)}
                  className={inputClass('neck_movement')} />
                {errors.neck_movement && <p className="mt-1 text-xs text-danger-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.neck_movement}</p>}
              </div>
            </div>

            <div className="border-t border-gray-100 dark:border-claude-600 pt-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-claude-200 mb-3">Additional Exam Findings</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {yesNoSelect('beard', 'Beard')}
                <div>
                  <label className={labelClass}>Chest Size</label>
                  <select value={formData.chest_size} onChange={(e) => handleChange('chest_size', e.target.value)}
                    className={inputClass('chest_size')}>
                    <option value="Small">Small</option>
                    <option value="Medium">Medium</option>
                    <option value="Large">Large</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Neck Structure</label>
                  <select value={formData.neck_structure} onChange={(e) => handleChange('neck_structure', e.target.value)}
                    className={inputClass('neck_structure')}>
                    <option value="Normal">Normal</option>
                    <option value="Abnormal">Abnormal</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Jaw Movement</label>
                  <select value={formData.jaw_movement} onChange={(e) => handleChange('jaw_movement', e.target.value)}
                    className={inputClass('jaw_movement')}>
                    <option value="Normal">Normal</option>
                    <option value="Reduced">Reduced</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Tissue Flexibility</label>
                  <select value={formData.tissue_flexibility} onChange={(e) => handleChange('tissue_flexibility', e.target.value)}
                    className={inputClass('tissue_flexibility')}>
                    <option value="Normal">Normal</option>
                    <option value="Reduced">Reduced</option>
                  </select>
                </div>
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
                ? 'bg-medical-300 cursor-not-allowed'
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