import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { storage } from '../../services/storage';
import { User } from '../../types';
import { X, Mail, Lock, User as UserIcon, ShieldCheck, Building2, ArrowRight, AlertCircle } from 'lucide-react';
import { sounds } from '../../services/soundEffects';

interface TherapistAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (therapist: User) => void;
}

export const TherapistAuthModal: React.FC<TherapistAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [clinic, setClinic] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'register') {
      if (!name.trim()) {
        setError('Please enter your full professional name.');
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        setError('Please provide a valid clinic/professional email.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }

      setLoading(true);
      const res = storage.registerUser({
        role: 'therapist',
        name: name.trim(),
        email: email.trim(),
        password,
        clinicOrOrganization: clinic.trim() || 'Pediatric Speech Clinic',
      });
      setLoading(false);

      if (!res.success || !res.user) {
        setError(res.error || 'Registration failed.');
        return;
      }

      sounds.playSuccess();
      onSuccess(res.user);
    } else {
      // Login
      if (!email.trim() || !password) {
        setError('Please enter your therapist email and password.');
        return;
      }

      setLoading(true);
      const res = storage.loginUser(email.trim(), password, 'therapist');
      setLoading(false);

      if (!res.success || !res.user) {
        setError(res.error || 'Invalid credentials.');
        return;
      }

      sounds.playSuccess();
      onSuccess(res.user);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-blue-100 relative"
        >
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-3 shadow-2xs">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h2 className="font-display font-extrabold text-2xl text-slate-900">
              {mode === 'register' ? 'Therapist Registration' : 'Therapist Portal Login'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {mode === 'register'
                ? 'Create a clinician account to create customized sound exercises & track progress'
                : 'Secure access for Speech-Language Pathologists (SLP)'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Full Name & Credentials *
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Dr. Elena Vance, CCC-SLP"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none text-sm font-semibold text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Clinic, Hospital, or School Practice
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={clinic}
                      onChange={(e) => setClinic(e.target.value)}
                      placeholder="e.g. Sunny Hills Pediatric Speech Clinic"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none text-sm font-semibold text-slate-800"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Professional Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="therapist@clinic.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none text-sm font-semibold text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none text-sm font-semibold text-slate-800"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-3d-blue text-white font-extrabold text-sm sm:text-base py-3 rounded-2xl shadow-sm mt-4 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{mode === 'register' ? 'Create Therapist Account' : 'Access Clinician Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-5 text-center text-xs text-slate-600 font-semibold">
            {mode === 'register' ? (
              <span>
                Already registered as a therapist?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setMode('login');
                  }}
                  className="text-blue-600 font-extrabold hover:underline cursor-pointer"
                >
                  Log in here
                </button>
              </span>
            ) : (
              <span>
                New Speech-Language Pathologist?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setMode('register');
                  }}
                  className="text-blue-600 font-extrabold hover:underline cursor-pointer"
                >
                  Register Account
                </button>
              </span>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
