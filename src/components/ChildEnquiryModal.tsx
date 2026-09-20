import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { storage } from '../services/storage';
import { ChildProfile } from '../types';
import { 
  X, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Sparkles, 
  Heart, 
  ShieldCheck, 
  Volume2, 
  HelpCircle,
  Edit2
} from 'lucide-react';
import { sounds } from '../services/soundEffects';

interface ChildEnquiryModalProps {
  isOpen: boolean;
  parentId: string;
  onClose: () => void;
  onChildCreated: (child: ChildProfile) => void;
}

const AVATAR_OPTIONS = ['🦁', '🦊', '🐼', '🐯', '🐰', '🐨', '🦄', '🦖'];

const TARGET_SOUND_OPTIONS = [
  { sound: 'S', label: '/S/ (Sun, Star)' },
  { sound: 'R', label: '/R/ (Rocket, Red)' },
  { sound: 'L', label: '/L/ (Lion, Leaf)' },
  { sound: 'TH', label: '/TH/ (Thumb, Three)' },
  { sound: 'CH', label: '/CH/ (Chipmunk, Chair)' },
  { sound: 'SH', label: '/SH/ (Ship, Shoe)' },
  { sound: 'K', label: '/K/ (Kite, Cat)' },
  { sound: 'G', label: '/G/ (Goat, Green)' },
  { sound: 'F', label: '/F/ (Fish, Five)' },
];

const PRACTICE_TYPE_OPTIONS = [
  'Articulation (clear speech sounds)',
  'Phonological Awareness',
  'Fluency / Rhythm / Pacing',
  'Language Expansion & Vocabulary',
  'Sentence Structure & Clarity',
];

export const ChildEnquiryModal: React.FC<ChildEnquiryModalProps> = ({
  isOpen,
  parentId,
  onClose,
  onChildCreated,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Details
  const [name, setName] = useState('');
  const [age, setAge] = useState<number>(6);
  const [grade, setGrade] = useState('1st Grade');
  const [preferredLanguage, setPreferredLanguage] = useState('English');
  const [avatarIcon, setAvatarIcon] = useState('🦁');

  // Step 2: Speech Practice Info
  const [selectedPracticeTypes, setSelectedPracticeTypes] = useState<string[]>([
    'Articulation (clear speech sounds)',
  ]);
  const [selectedTargetSounds, setSelectedTargetSounds] = useState<string[]>(['S', 'R']);
  const [currentWords, setCurrentWords] = useState('');
  const [hasTherapist, setHasTherapist] = useState<'yes' | 'no'>('no');
  const [parentGoals, setParentGoals] = useState('');

  // Step 3: Therapist Info
  const [therapistName, setTherapistName] = useState('');
  const [therapistClinic, setTherapistClinic] = useState('');

  // Form Validation errors
  const [stepError, setStepError] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleSound = (sound: string) => {
    if (selectedTargetSounds.includes(sound)) {
      setSelectedTargetSounds(selectedTargetSounds.filter(s => s !== sound));
    } else {
      setSelectedTargetSounds([...selectedTargetSounds, sound]);
    }
  };

  const togglePracticeType = (t: string) => {
    if (selectedPracticeTypes.includes(t)) {
      setSelectedPracticeTypes(selectedPracticeTypes.filter(item => item !== t));
    } else {
      setSelectedPracticeTypes([...selectedPracticeTypes, t]);
    }
  };

  const handleNextFromStep1 = () => {
    if (!name.trim()) {
      setStepError("Please enter your child's name.");
      return;
    }
    setStepError(null);
    sounds.playClick();
    setStep(2);
  };

  const handleNextFromStep2 = () => {
    if (selectedTargetSounds.length === 0) {
      setStepError("Please select at least one target speech sound to practice.");
      return;
    }
    setStepError(null);
    sounds.playClick();
    setStep(3);
  };

  const handleNextFromStep3 = () => {
    setStepError(null);
    sounds.playClick();
    setStep(4);
  };

  const handleFinalSubmit = () => {
    const wordList = currentWords
      .split(',')
      .map(w => w.trim())
      .filter(w => w.length > 0);

    const child = storage.createChildProfile({
      parentId,
      name: name.trim(),
      age: Number(age) || 6,
      grade: grade.trim(),
      preferredLanguage,
      avatarIcon,
      speechPracticeType: selectedPracticeTypes,
      targetSounds: selectedTargetSounds,
      currentWords: wordList,
      parentGoals: parentGoals.trim(),
      therapistName: hasTherapist === 'yes' ? therapistName.trim() : undefined,
      therapistClinic: hasTherapist === 'yes' ? therapistClinic.trim() : undefined,
    });

    sounds.playFanfare();
    onChildCreated(child);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-emerald-100 relative my-8"
      >
        {/* Close Button */}
        <button
          onClick={() => {
            sounds.playClick();
            onClose();
          }}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === step
                  ? 'w-8 bg-emerald-500'
                  : i < step
                  ? 'w-4 bg-emerald-300'
                  : 'w-4 bg-slate-200'
              }`}
            />
          ))}
        </div>

        {/* Header (Mandatory Prompt Requirement) */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Step {step} of 4</span>
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900">
            Let's Get to Know Your Child
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            "This information helps personalize the Speech Play experience."
          </p>
        </div>

        {stepError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
            {stepError}
          </div>
        )}

        {/* STEP 1: CHILD DETAILS */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <h3 className="font-display font-bold text-base text-slate-800 border-b pb-2">
              Child Details
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Child's First Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Leo, Maya, Lucas"
                className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-emerald-500 focus:outline-none text-sm font-semibold text-slate-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Age (Years)
                </label>
                <input
                  type="number"
                  min="2"
                  max="16"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-emerald-500 focus:outline-none text-sm font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Grade / Class
                </label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-emerald-500 focus:outline-none text-sm font-semibold text-slate-800"
                >
                  <option value="Toddler / Early Intervention">Toddler / Early Intervention</option>
                  <option value="Preschool">Preschool</option>
                  <option value="Kindergarten">Kindergarten</option>
                  <option value="1st Grade">1st Grade</option>
                  <option value="2nd Grade">2nd Grade</option>
                  <option value="3rd Grade">3rd Grade</option>
                  <option value="4th Grade & Above">4th Grade & Above</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Preferred Language
              </label>
              <select
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-emerald-500 focus:outline-none text-sm font-semibold text-slate-800"
              >
                <option value="English">English (US)</option>
                <option value="English (UK)">English (UK)</option>
                <option value="Spanish">Spanish</option>
                <option value="Bilingual">Bilingual (English / Spanish)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Choose a Friendly Mascot Avatar
              </label>
              <div className="flex flex-wrap gap-2.5">
                {AVATAR_OPTIONS.map((av) => (
                  <button
                    key={av}
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setAvatarIcon(av);
                    }}
                    className={`w-12 h-12 text-2xl rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
                      avatarIcon === av
                        ? 'bg-emerald-100 border-2 border-emerald-500 scale-110 shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={handleNextFromStep1}
                className="btn-3d-green text-white font-extrabold text-sm px-6 py-3 rounded-2xl flex items-center gap-2 cursor-pointer"
              >
                <span>Continue to Practice Info</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 2: SPEECH PRACTICE INFORMATION */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <h3 className="font-display font-bold text-base text-slate-800 border-b pb-2">
              Speech Practice Information
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Target Sounds to Practice (Select all that apply)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {TARGET_SOUND_OPTIONS.map(({ sound, label }) => {
                  const isSelected = selectedTargetSounds.includes(sound);
                  return (
                    <button
                      key={sound}
                      type="button"
                      onClick={() => toggleSound(sound)}
                      className={`p-2.5 rounded-xl text-left text-xs font-bold transition-all cursor-pointer flex items-center justify-between border ${
                        isSelected
                          ? 'bg-emerald-50 border-emerald-400 text-emerald-900 shadow-2xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{label}</span>
                      {isSelected && <Check className="w-4 h-4 text-emerald-600" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Practice Focus Areas
              </label>
              <div className="space-y-1.5">
                {PRACTICE_TYPE_OPTIONS.map((t) => {
                  const isChecked = selectedPracticeTypes.includes(t);
                  return (
                    <label
                      key={t}
                      className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 cursor-pointer text-xs font-semibold text-slate-700"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => togglePracticeType(t)}
                        className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                      />
                      <span>{t}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Words Currently Practicing (Optional, comma-separated)
              </label>
              <input
                type="text"
                value={currentWords}
                onChange={(e) => setCurrentWords(e.target.value)}
                placeholder="e.g. Sun, Star, Soup, Rocket, Run"
                className="w-full px-4 py-2 rounded-xl border-2 border-slate-200 focus:border-emerald-500 focus:outline-none text-xs sm:text-sm text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Parent Goals or Specific Notes
              </label>
              <textarea
                rows={2}
                value={parentGoals}
                onChange={(e) => setParentGoals(e.target.value)}
                placeholder="e.g. Building confidence speaking in complete sentences at kindergarten."
                className="w-full px-4 py-2 rounded-xl border-2 border-slate-200 focus:border-emerald-500 focus:outline-none text-xs sm:text-sm text-slate-800"
              />
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn-3d-neutral text-slate-700 font-bold text-xs sm:text-sm px-4 py-2.5 rounded-2xl flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={handleNextFromStep2}
                className="btn-3d-green text-white font-extrabold text-xs sm:text-sm px-6 py-2.5 rounded-2xl flex items-center gap-2 cursor-pointer"
              >
                <span>Continue to Therapist Info</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 3: THERAPIST INFORMATION */}
        {step === 3 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <h3 className="font-display font-bold text-base text-slate-800 border-b pb-2">
              Therapist Information (Optional)
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Does your child currently work with a Speech-Language Pathologist?
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setHasTherapist('yes')}
                  className={`py-3 px-4 rounded-xl text-center font-bold text-sm transition-all cursor-pointer border ${
                    hasTherapist === 'yes'
                      ? 'bg-blue-50 border-blue-400 text-blue-900 shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Yes, has a therapist
                </button>
                <button
                  type="button"
                  onClick={() => setHasTherapist('no')}
                  className={`py-3 px-4 rounded-xl text-center font-bold text-sm transition-all cursor-pointer border ${
                    hasTherapist === 'no'
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-900 shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  No / Home practice only
                </button>
              </div>
            </div>

            {hasTherapist === 'yes' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-3 pt-2">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800">
                  Entering your therapist's name lets them coordinate practice targets. (This does not automatically create an account).
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Therapist Name
                  </label>
                  <input
                    type="text"
                    value={therapistName}
                    onChange={(e) => setTherapistName(e.target.value)}
                    placeholder="e.g. Dr. Elena Vance, CCC-SLP"
                    className="w-full px-4 py-2 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none text-xs sm:text-sm text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Clinic / Practice / School
                  </label>
                  <input
                    type="text"
                    value={therapistClinic}
                    onChange={(e) => setTherapistClinic(e.target.value)}
                    placeholder="e.g. Sunny Hills Pediatric Speech Clinic"
                    className="w-full px-4 py-2 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none text-xs sm:text-sm text-slate-800"
                  />
                </div>
              </motion.div>
            )}

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="btn-3d-neutral text-slate-700 font-bold text-xs sm:text-sm px-4 py-2.5 rounded-2xl flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={handleNextFromStep3}
                className="btn-3d-green text-white font-extrabold text-xs sm:text-sm px-6 py-2.5 rounded-2xl flex items-center gap-2 cursor-pointer"
              >
                <span>Review Details</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 4: REVIEW & CREATE */}
        {step === 4 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-display font-bold text-base text-slate-800">
                Review Profile Information
              </h3>
              <span className="text-xs text-slate-500">Check everything before creating</span>
            </div>

            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 space-y-3 text-xs sm:text-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{avatarIcon}</span>
                  <div>
                    <h4 className="font-display font-bold text-base text-slate-900">{name}</h4>
                    <p className="text-slate-500">Age {age} • {grade} • {preferredLanguage}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
              </div>

              <div className="pt-2 border-t border-slate-200">
                <span className="font-bold text-slate-700 block mb-1">Target Sounds:</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedTargetSounds.map(s => (
                    <span key={s} className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-xs">
                      /{s}/
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200">
                <span className="font-bold text-slate-700 block mb-1">Practice Areas:</span>
                <p className="text-slate-600 text-xs">{selectedPracticeTypes.join(', ')}</p>
              </div>

              {hasTherapist === 'yes' && therapistName && (
                <div className="pt-2 border-t border-slate-200">
                  <span className="font-bold text-slate-700 block mb-1">Assigned Speech Therapist:</span>
                  <p className="text-slate-600 text-xs">{therapistName} {therapistClinic ? `(${therapistClinic})` : ''}</p>
                </div>
              )}
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>We'll automatically prepare initial starter quests based on these target sounds!</span>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="btn-3d-neutral text-slate-700 font-bold text-xs sm:text-sm px-4 py-2.5 rounded-2xl flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                className="btn-3d-green text-white font-extrabold text-sm sm:text-base px-6 py-3 rounded-2xl flex items-center gap-2 cursor-pointer shadow-md"
              >
                <span>Create Child Profile & Start</span>
                <Sparkles className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};
