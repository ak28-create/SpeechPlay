import React, { useState } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { ChildProfile, ExerciseAssignment } from '../../types';
import { VoiceTrainerModal } from './VoiceTrainerModal';
import { 
  Star, 
  Flame, 
  Zap, 
  Heart, 
  Play, 
  Award, 
  Sparkles, 
  CheckCircle2, 
  Lock, 
  Gift,
  Volume2,
  Mic,
  ArrowRight,
  RotateCcw,
  Trophy
} from 'lucide-react';
import { sounds } from '../../services/soundEffects';

interface ChildModeProps {
  child: ChildProfile;
  assignments: ExerciseAssignment[];
  onExitChildMode: () => void;
  onRefreshAssignments: () => void;
}

export const ChildMode: React.FC<ChildModeProps> = ({
  child,
  assignments,
  onExitChildMode,
  onRefreshAssignments,
}) => {
  const [selectedAssignment, setSelectedAssignment] = useState<ExerciseAssignment | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  // Duolingo-style winding path nodes
  const activeQuests = assignments;

  const handleOpenTrainer = (asgn: ExerciseAssignment) => {
    sounds.playClick();
    setSelectedAssignment(asgn);
  };

  const handleExerciseCompleted = (updated: ExerciseAssignment) => {
    onRefreshAssignments();
    if (updated.status === 'completed') {
      sounds.playFanfare();
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
      });
      setShowCelebration(true);
    }
  };

  return (
    <div className="min-h-[calc(100vh-65px)] bg-radial from-emerald-50 via-green-50/40 to-sky-50 text-slate-900 pb-20">
      <div className="max-w-4xl mx-auto px-4 pt-6 space-y-8">
        
        {/* Dynamic Child Welcome Header Banner (Mandatory Prompt Requirement) */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 sm:p-8 border-4 border-emerald-200 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden"
        >
          <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-emerald-100/60 rounded-full pointer-events-none" />
          
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-3xl bg-emerald-100 border-3 border-emerald-300 flex items-center justify-center text-5xl shadow-md select-none shrink-0">
              {child.avatarIcon || '🦊'}
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Level {child.level} Adventurer</span>
              </div>
              <h1 className="font-display font-black text-3xl sm:text-4xl text-slate-900 tracking-tight">
                Welcome, {child.name}!
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 font-bold mt-0.5">
                Ready for today's voice quest adventure? Speak loud and clear!
              </p>
            </div>
          </div>

          {/* Quick Practice CTA */}
          {activeQuests.length > 0 && (
            <button
              onClick={() => handleOpenTrainer(activeQuests[0])}
              className="btn-3d-green text-white font-black text-lg px-8 py-4 rounded-2xl shadow-lg flex items-center gap-3 cursor-pointer shrink-0"
            >
              <Play className="w-6 h-6 fill-white" />
              <span>Start Quest</span>
            </button>
          )}
        </motion.div>

        {/* TODAY'S QUEST FLOW GUIDE (Section 16 Requirement) */}
        <div className="bg-white rounded-3xl p-5 border-2 border-slate-200 shadow-xs">
          <div className="text-xs font-black uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
            <span>Today's Quest Flow</span>
            <div className="h-0.5 flex-1 bg-slate-100" />
          </div>

          <div className="grid grid-cols-5 gap-2 text-center text-2xs sm:text-xs font-extrabold">
            <div className="p-2.5 rounded-2xl bg-sky-50 border border-sky-200 text-sky-900">
              <span className="text-xl block mb-1">👂</span>
              <span>Listen</span>
            </div>
            <div className="p-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900">
              <span className="text-xl block mb-1">🗣️</span>
              <span>Say It</span>
            </div>
            <div className="p-2.5 rounded-2xl bg-yellow-50 border border-yellow-200 text-yellow-900">
              <span className="text-xl block mb-1">🎯</span>
              <span>Practice</span>
            </div>
            <div className="p-2.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900">
              <span className="text-xl block mb-1">⭐</span>
              <span>Earn Rewards</span>
            </div>
            <div className="p-2.5 rounded-2xl bg-purple-50 border border-purple-200 text-purple-900">
              <span className="text-xl block mb-1">🏆</span>
              <span>Complete</span>
            </div>
          </div>
        </div>

        {/* DUOLINGO-STYLE WINDING QUEST PATH */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-black text-2xl text-slate-900">
              Your Speech Quest Path
            </h2>
            <span className="text-xs font-bold text-slate-500">
              {activeQuests.filter(q => q.status === 'completed').length} / {activeQuests.length} Quests Mastered
            </span>
          </div>

          {activeQuests.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border-2 border-slate-200 p-8 space-y-3">
              <span className="text-5xl">🌟</span>
              <h3 className="font-display font-bold text-xl text-slate-800">No active quests right now!</h3>
              <p className="text-xs text-slate-500">
                Your parent or speech therapist can assign new target exercises for you anytime.
              </p>
            </div>
          ) : (
            <div className="relative py-8 flex flex-col items-center gap-8">
              {/* Stepped Winding Path layout */}
              {activeQuests.map((quest, index) => {
                const isCompleted = quest.status === 'completed';
                // Offset alternates left, center, right for playful Duolingo path feeling
                const offsetClass = index % 3 === 0 ? 'translate-x-0' : index % 3 === 1 ? 'sm:-translate-x-16' : 'sm:translate-x-16';

                return (
                  <div key={quest.id} className={`flex flex-col items-center relative ${offsetClass}`}>
                    {/* Connecting line to next node */}
                    {index < activeQuests.length - 1 && (
                      <div className="absolute top-20 w-3 h-12 bg-emerald-200/80 rounded-full pointer-events-none -z-0" />
                    )}

                    {/* Quest Circular 3D Node */}
                    <motion.button
                      whileHover={{ scale: 1.06 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleOpenTrainer(quest)}
                      className={`relative z-10 w-24 h-24 rounded-full flex flex-col items-center justify-center cursor-pointer shadow-xl transition-all border-b-6 active:border-b-0 active:translate-y-1.5 ${
                        isCompleted
                          ? 'bg-amber-400 border-amber-600 text-amber-950'
                          : 'bg-emerald-500 border-emerald-700 text-white'
                      }`}
                    >
                      <span className="text-3xl select-none mb-0.5">
                        {isCompleted ? '⭐' : quest.exercise.targetSound === 'S' ? '☀️' : quest.exercise.targetSound === 'R' ? '🚀' : '🎯'}
                      </span>
                      <span className="font-black text-xs uppercase tracking-wider">
                        /{quest.exercise.targetSound}/
                      </span>

                      {/* Stars badge over node */}
                      {isCompleted && (
                        <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-amber-300 border-2 border-white flex items-center justify-center text-xs font-black shadow-md">
                          ✓
                        </div>
                      )}
                    </motion.button>

                    {/* Quest Title Card below node */}
                    <div 
                      onClick={() => handleOpenTrainer(quest)}
                      className="mt-3 bg-white px-4 py-2 rounded-2xl border-2 border-slate-200 shadow-xs text-center cursor-pointer hover:border-emerald-400 transition-colors"
                    >
                      <div className="font-display font-extrabold text-sm text-slate-800">
                        {quest.exerciseTitle}
                      </div>
                      <div className="text-2xs font-bold text-slate-500">
                        Target: "{quest.exercise.targetWord}" • {quest.repetitionsCompleted}/{quest.repetitionsRequired} Reps
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Bonus Milestone Chest at end of path */}
              <div className="flex flex-col items-center pt-4">
                <div className="w-20 h-20 rounded-3xl bg-purple-500 border-b-6 border-purple-700 text-white flex items-center justify-center text-4xl shadow-lg cursor-pointer hover:scale-105 transition-transform">
                  🎁
                </div>
                <div className="mt-2 text-xs font-black text-purple-900 bg-purple-100 px-3 py-1 rounded-full">
                  Level {child.level} Milestone Reward
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Voice Trainer Modal */}
      {selectedAssignment && (
        <VoiceTrainerModal
          isOpen={!!selectedAssignment}
          childId={child.id}
          childName={child.name}
          assignment={selectedAssignment}
          onClose={() => setSelectedAssignment(null)}
          onExerciseCompleted={handleExerciseCompleted}
        />
      )}

      {/* Celebration Modal when completing a full quest */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-sm bg-white rounded-3xl p-6 text-center border-4 border-amber-300 shadow-2xl space-y-4"
          >
            <div className="text-6xl animate-bounce">🏆</div>
            <h2 className="font-display font-black text-3xl text-slate-900">
              Quest Complete!
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-bold">
              Super speech power unlocked! You earned +15 XP and +1 Star!
            </p>

            <div className="flex justify-center gap-4 py-2">
              <div className="bg-amber-100 text-amber-800 px-4 py-2 rounded-2xl font-black text-sm flex items-center gap-1.5">
                <Star className="w-4 h-4 fill-amber-500" />
                <span>+1 Star</span>
              </div>
              <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-2xl font-black text-sm flex items-center gap-1.5">
                <Zap className="w-4 h-4 fill-yellow-500" />
                <span>+15 XP</span>
              </div>
            </div>

            <button
              onClick={() => {
                sounds.playClick();
                setShowCelebration(false);
              }}
              className="w-full btn-3d-green text-white font-black text-base py-3.5 rounded-2xl cursor-pointer"
            >
              Awesome! Keep Going
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};
