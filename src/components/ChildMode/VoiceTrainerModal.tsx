import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Exercise, ExerciseAssignment, SpeechAttempt, SpeechErrorType } from '../../types';
import { speechService, SpeechAnalysisResult } from '../../services/speech';
import { sounds } from '../../services/soundEffects';
import { storage } from '../../services/storage';
import { 
  X, 
  Volume2, 
  Mic, 
  Square, 
  Sparkles, 
  Star, 
  Zap, 
  ArrowRight, 
  RotateCcw, 
  Check, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';

interface VoiceTrainerModalProps {
  isOpen: boolean;
  childId: string;
  childName: string;
  assignment: ExerciseAssignment;
  onClose: () => void;
  onExerciseCompleted: (updatedAssignment: ExerciseAssignment) => void;
}

export const VoiceTrainerModal: React.FC<VoiceTrainerModalProps> = ({
  isOpen,
  childId,
  childName,
  assignment,
  onClose,
  onExerciseCompleted,
}) => {
  const { exercise } = assignment;

  // Voice Trainer States: 'target' | 'listening' | 'recording' | 'analyzing' | 'feedback'
  const [trainerState, setTrainerState] = useState<'target' | 'listening' | 'recording' | 'analyzing' | 'feedback'>('target');
  const [audioPlaybackActive, setAudioPlaybackActive] = useState(false);
  const [interimSpoken, setInterimSpoken] = useState('');
  const [analysisResult, setAnalysisResult] = useState<SpeechAnalysisResult | null>(null);
  const [micErrorMessage, setMicErrorMessage] = useState<string | null>(null);
  const [attemptCount, setAttemptCount] = useState(1);

  const activeRecognitionRef = useRef<{ stop: () => void } | null>(null);
  const activePlaybackRef = useRef<{ stop: () => void } | null>(null);

  useEffect(() => {
    // Reset state on open
    if (isOpen) {
      setTrainerState('target');
      setAudioPlaybackActive(false);
      setInterimSpoken('');
      setAnalysisResult(null);
      setMicErrorMessage(null);
      setAttemptCount(1);
    }
    return () => {
      if (activeRecognitionRef.current) activeRecognitionRef.current.stop();
      if (activePlaybackRef.current) activePlaybackRef.current.stop();
      speechService.stopPlayback();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // STEP 2: LISTEN (Pronounce reference)
  const handleListen = () => {
    sounds.playClick();
    setAudioPlaybackActive(true);
    setTrainerState('listening');

    const playback = speechService.playPronunciation(
      exercise.targetWord,
      exercise.audioUrl,
      () => {
        setAudioPlaybackActive(false);
        setTrainerState('target');
      }
    );
    activePlaybackRef.current = playback;
  };

  // STEP 3: SPEAK (Say It)
  const handleStartSpeaking = () => {
    sounds.playClick();
    setMicErrorMessage(null);
    setInterimSpoken('');
    setTrainerState('recording');

    const recognition = speechService.startChildSpeechRecognition({
      target: exercise.targetWord,
      targetSound: exercise.targetSound,
      onInterim: (interim) => {
        setInterimSpoken(interim);
      },
      onResult: (res) => {
        setTrainerState('analyzing');
        setTimeout(() => {
          handleProcessResult(res);
        }, 600);
      },
      onError: (err) => {
        setMicErrorMessage(err);
        setTrainerState('target');
      }
    });

    activeRecognitionRef.current = recognition;
  };

  const handleStopSpeaking = () => {
    if (activeRecognitionRef.current) {
      activeRecognitionRef.current.stop();
    }
  };

  // Fallback: Manual Practice without mic
  const handleManualPractice = () => {
    sounds.playClick();
    const manualResult = speechService.createManualResult(exercise.targetWord, exercise.targetSound);
    handleProcessResult(manualResult);
  };

  // Process & Record Speech Result
  const handleProcessResult = (result: SpeechAnalysisResult) => {
    setAnalysisResult(result);
    setTrainerState('feedback');

    // Record into persistent database
    storage.recordSpeechAttempt({
      childId,
      childName,
      assignmentId: assignment.id,
      exerciseId: exercise.id,
      exerciseTitle: exercise.title,
      target: exercise.targetWord,
      targetSound: exercise.targetSound,
      recognizedResponse: result.recognizedText,
      isCorrect: result.isCorrect,
      accuracyScore: result.accuracyScore,
      confidence: result.confidence,
      errorType: result.errorType,
      detectedSound: result.detectedSound,
      attemptNumber: attemptCount,
      verificationMethod: result.verificationMethod,
    });

    if (result.isCorrect) {
      sounds.playSuccess();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });

      // Update child gamification stats (XP +15, Star +1)
      storage.updateChildStats(childId, {
        xp: 15,
        stars: 1,
        streak: 0,
      });

      // Update assignment repetition
      const updated = storage.updateAssignmentProgress(assignment.id, 1, result.accuracyScore);
      if (updated && updated.status === 'completed') {
        storage.updateChildStats(childId, { quests: 1 });
      }
    } else {
      sounds.playEncourage();
    }
  };

  const handleTryAgain = () => {
    sounds.playClick();
    setAttemptCount(prev => prev + 1);
    setAnalysisResult(null);
    setInterimSpoken('');
    setTrainerState('target');
  };

  const handleFinish = () => {
    sounds.playClick();
    const updatedAssignments = storage.getAssignmentsForChild(childId);
    const curr = updatedAssignments.find(a => a.id === assignment.id) || assignment;
    onExerciseCompleted(curr);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/65 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 15 }}
        className="w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-emerald-300 relative overflow-hidden"
      >
        {/* Top Progress & Exit */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
              Quest: {exercise.title}
            </span>
            <span className="text-xs font-bold text-slate-500">
              Target Sound: /{exercise.targetSound}/
            </span>
          </div>

          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Instructions */}
        <p className="text-xs sm:text-sm text-slate-600 font-semibold mb-4 text-center">
          {exercise.instructions}
        </p>

        {/* Mic Error Banner if any */}
        {micErrorMessage && (
          <div className="mb-4 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{micErrorMessage}</span>
            </div>
            <button
              onClick={handleManualPractice}
              className="text-xs font-black text-amber-800 bg-amber-200 hover:bg-amber-300 px-3 py-1 rounded-lg shrink-0 cursor-pointer"
            >
              Practice Without Mic
            </button>
          </div>
        )}

        {/* TARGET DISPLAY CARD (Duolingo Card Style) */}
        <div className="rounded-3xl bg-radial from-sky-50 to-blue-50/70 border-2 border-sky-100 p-6 sm:p-8 text-center space-y-4 mb-6 shadow-inner">
          {/* Exercise Image if available */}
          {exercise.imageUrl ? (
            <div className="w-32 h-32 mx-auto rounded-2xl overflow-hidden border-2 border-white shadow-md bg-white">
              <img
                src={exercise.imageUrl}
                alt={exercise.targetWord}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          ) : (
            <div className="text-6xl sm:text-7xl select-none animate-bounce">
              {exercise.targetSound === 'S' ? '☀️' : 
               exercise.targetSound === 'R' ? '🚀' : 
               exercise.targetSound === 'L' ? '🦁' : 
               exercise.targetSound === 'TH' ? '👍' : 
               exercise.targetSound === 'CH' ? '🐿️' : '🎯'}
            </div>
          )}

          <div>
            <h2 className="font-display font-extrabold text-4xl sm:text-5xl text-slate-900 tracking-wide">
              {exercise.targetWord}
            </h2>
            {exercise.phoneticGuide && (
              <p className="text-sm font-bold text-sky-700 mt-1">
                {exercise.phoneticGuide}
              </p>
            )}
            {exercise.targetSentence && (
              <p className="text-xs sm:text-sm text-slate-600 italic mt-2">
                "{exercise.targetSentence}"
              </p>
            )}
          </div>
        </div>

        {/* FEEDBACK STATE */}
        {trainerState === 'feedback' && analysisResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-5 rounded-3xl mb-6 text-center border-2 ${
              analysisResult.isCorrect
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                : 'bg-amber-50 border-amber-300 text-amber-950'
            }`}
          >
            <div className="text-3xl mb-1">
              {analysisResult.isCorrect ? '🎉' : '🌱'}
            </div>
            <h3 className="font-display font-extrabold text-xl">
              {analysisResult.feedbackMessage}
            </h3>

            {/* Analysis details */}
            <div className="mt-3 flex items-center justify-center gap-3 text-xs font-bold">
              <span className="bg-white/80 px-2.5 py-1 rounded-xl shadow-2xs">
                You said: "{analysisResult.recognizedText || '...'}"
              </span>
              <span className="bg-white/80 px-2.5 py-1 rounded-xl shadow-2xs">
                Accuracy: {analysisResult.accuracyScore}%
              </span>
              {analysisResult.isCorrect && (
                <span className="bg-amber-100 text-amber-800 px-2.5 py-1 rounded-xl flex items-center gap-1 shadow-2xs">
                  <Star className="w-3.5 h-3.5 fill-amber-400" /> +1 Star
                </span>
              )}
            </div>
          </motion.div>
        )}

        {/* RECORDING STATE INTERIM DISPLAY */}
        {trainerState === 'recording' && (
          <div className="text-center mb-6 py-2">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-100 text-rose-700 font-extrabold text-xs animate-pulse">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
              <span>Listening to your voice...</span>
            </div>
            {interimSpoken && (
              <p className="font-display text-lg text-slate-800 mt-2">
                "{interimSpoken}"
              </p>
            )}
          </div>
        )}

        {/* ANALYZING STATE */}
        {trainerState === 'analyzing' && (
          <div className="text-center mb-6 py-3">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-100 text-sky-800 font-bold text-sm">
              <Sparkles className="w-4 h-4 text-sky-600 animate-spin" />
              <span>Checking your voice...</span>
            </div>
          </div>
        )}

        {/* INTERACTIVE ACTION BUTTONS */}
        <div className="space-y-3">
          {trainerState !== 'feedback' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* LISTEN BUTTON */}
              <button
                type="button"
                onClick={handleListen}
                disabled={audioPlaybackActive || trainerState === 'recording'}
                className="btn-3d-blue text-white font-extrabold text-base py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
              >
                <Volume2 className={`w-5 h-5 ${audioPlaybackActive ? 'animate-bounce' : ''}`} />
                <span>{audioPlaybackActive ? 'Listening...' : 'Listen (Hear It)'}</span>
              </button>

              {/* SPEAK BUTTON */}
              {trainerState === 'recording' ? (
                <button
                  type="button"
                  onClick={handleStopSpeaking}
                  className="btn-3d-coral text-white font-extrabold text-base py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <Square className="w-5 h-5 fill-white" />
                  <span>Done Speaking</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStartSpeaking}
                  disabled={audioPlaybackActive}
                  className="btn-3d-green text-white font-extrabold text-base py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                >
                  <Mic className="w-5 h-5" />
                  <span>Say It (Speak)</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleTryAgain}
                className="btn-3d-neutral text-slate-800 font-extrabold text-base py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Practice Again</span>
              </button>

              <button
                type="button"
                onClick={handleFinish}
                className="btn-3d-green text-white font-extrabold text-base py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <span>Continue Quest</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Quick Fallback button */}
          {trainerState !== 'feedback' && (
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={handleManualPractice}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 underline cursor-pointer"
              >
                Can't speak right now? Complete practice manually
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
