import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, ChildProfile, ExerciseAssignment, SpeechAttempt } from '../types';
import { 
  Play, 
  Flame, 
  Star, 
  Zap, 
  ShieldCheck, 
  Plus, 
  CheckCircle2, 
  Clock, 
  ChevronRight,
  TrendingUp,
  Volume2,
  Calendar,
  Sparkles,
  Info
} from 'lucide-react';
import { sounds } from '../services/soundEffects';

interface ParentDashboardProps {
  currentUser: User;
  childrenList: ChildProfile[];
  selectedChild: ChildProfile | null;
  onSelectChild: (childId: string) => void;
  onAddNewChild: () => void;
  onEnterChildMode: (childId: string) => void;
  assignments: ExerciseAssignment[];
  attempts: SpeechAttempt[];
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({
  currentUser,
  childrenList,
  selectedChild,
  onSelectChild,
  onAddNewChild,
  onEnterChildMode,
  assignments,
  attempts,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'assignments' | 'history'>('overview');

  if (!selectedChild && childrenList.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="p-8 bg-white rounded-3xl border-2 border-emerald-100 shadow-xl space-y-4">
          <span className="text-5xl">🌱</span>
          <h2 className="font-display font-extrabold text-2xl text-slate-900">
            Welcome, {currentUser.name}!
          </h2>
          <p className="text-slate-600 text-sm">
            You don't have any child profiles set up yet. Let's create your child's profile to start custom speech practice quests!
          </p>
          <button
            onClick={() => {
              sounds.playClick();
              onAddNewChild();
            }}
            className="btn-3d-green text-white font-extrabold text-base px-6 py-3.5 rounded-2xl cursor-pointer inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add Child Profile</span>
          </button>
        </div>
      </div>
    );
  }

  const currentChild = selectedChild || childrenList[0];
  const childAssignments = assignments.filter(a => a.childId === currentChild?.id);
  const childAttempts = attempts.filter(a => a.childId === currentChild?.id);

  const completedCount = childAssignments.filter(a => a.status === 'completed').length;
  const inProgressCount = childAssignments.filter(a => a.status !== 'completed').length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Top Welcome Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
              Parent Guardian Portal
            </span>
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900">
            Hello, {currentUser.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Monitor speech practice, review therapist assignments, and launch your child's gamified practice.
          </p>
        </div>

        {/* Enter Child Mode CTA - Primary Action */}
        {currentChild && (
          <button
            onClick={() => {
              sounds.playClick();
              onEnterChildMode(currentChild.id);
            }}
            className="btn-3d-green text-white font-extrabold text-base sm:text-lg px-8 py-4 rounded-2xl shadow-lg flex items-center justify-center gap-3 cursor-pointer shrink-0"
          >
            <span className="text-2xl">{currentChild.avatarIcon || '🎮'}</span>
            <div className="text-left">
              <div className="leading-tight">Enter Child Mode</div>
              <div className="text-xs font-semibold text-emerald-100 opacity-90">
                Start quests for {currentChild.name}
              </div>
            </div>
            <Play className="w-5 h-5 fill-white" />
          </button>
        )}
      </div>

      {/* Children Selector Roster */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-lg text-slate-800">
            Your Children ({childrenList.length})
          </h2>
          <button
            onClick={() => {
              sounds.playClick();
              onAddNewChild();
            }}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Another Child</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {childrenList.map((ch) => {
            const isSelected = ch.id === currentChild?.id;
            return (
              <div
                key={ch.id}
                onClick={() => {
                  sounds.playClick();
                  onSelectChild(ch.id);
                }}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
                  isSelected
                    ? 'bg-emerald-50/70 border-emerald-500 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <span className="text-4xl select-none">{ch.avatarIcon || '🦊'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display font-bold text-base text-slate-900 truncate">
                        {ch.name}
                      </h3>
                      {isSelected && (
                        <span className="text-2xs font-extrabold uppercase bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">
                      Age {ch.age} • Level {ch.level}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-xs font-bold">
                      <span className="text-orange-500 flex items-center gap-0.5">
                        <Flame className="w-3 h-3 fill-orange-400" /> {ch.streak}d
                      </span>
                      <span className="text-amber-500 flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-amber-400" /> {ch.stars}
                      </span>
                      <span className="text-yellow-600 flex items-center gap-0.5">
                        <Zap className="w-3 h-3 fill-yellow-400" /> {ch.xp}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Child Overview & Quests */}
      {currentChild && (
        <div className="space-y-6">
          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200 gap-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-3 text-sm font-extrabold transition-colors cursor-pointer border-b-2 -mb-[2px] ${
                activeTab === 'overview'
                  ? 'border-emerald-500 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Practice Overview
            </button>
            <button
              onClick={() => setActiveTab('assignments')}
              className={`pb-3 text-sm font-extrabold transition-colors cursor-pointer border-b-2 -mb-[2px] ${
                activeTab === 'assignments'
                  ? 'border-emerald-500 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Assigned Quests ({childAssignments.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`pb-3 text-sm font-extrabold transition-colors cursor-pointer border-b-2 -mb-[2px] ${
                activeTab === 'history'
                  ? 'border-emerald-500 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Speech Observations ({childAttempts.length})
            </button>
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Cols: Target Sounds & Streaks */}
              <div className="lg:col-span-2 space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs text-center">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-2">
                      <Flame className="w-5 h-5 fill-orange-500" />
                    </div>
                    <div className="font-display font-extrabold text-2xl text-slate-900">
                      {currentChild.streak} Days
                    </div>
                    <div className="text-xs font-bold text-slate-500">Practice Streak</div>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs text-center">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-2">
                      <Star className="w-5 h-5 fill-amber-400" />
                    </div>
                    <div className="font-display font-extrabold text-2xl text-slate-900">
                      {currentChild.stars}
                    </div>
                    <div className="text-xs font-bold text-slate-500">Stars Earned</div>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs text-center">
                    <div className="w-10 h-10 rounded-xl bg-yellow-100 text-yellow-600 flex items-center justify-center mx-auto mb-2">
                      <Zap className="w-5 h-5 fill-yellow-500" />
                    </div>
                    <div className="font-display font-extrabold text-2xl text-slate-900">
                      {currentChild.xp}
                    </div>
                    <div className="text-xs font-bold text-slate-500">Total XP</div>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs text-center">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="font-display font-extrabold text-2xl text-slate-900">
                      {completedCount}
                    </div>
                    <div className="text-xs font-bold text-slate-500">Quests Finished</div>
                  </div>
                </div>

                {/* Target sounds & focus */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-bold text-base text-slate-900">
                      Target Practice Focus for {currentChild.name}
                    </h3>
                    <span className="text-xs font-semibold text-slate-500">
                      {currentChild.grade}
                    </span>
                  </div>

                  <div>
                    <span className="text-xs font-bold text-slate-600 block mb-2">
                      Target Sounds:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {(currentChild.targetSounds || ['S', 'R']).map((s) => (
                        <div
                          key={s}
                          className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-extrabold text-sm flex items-center gap-1.5"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                          <span>/{s}/ sound</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {currentChild.parentGoals && (
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
                      <span className="font-bold text-slate-800 block">Personal Goals:</span>
                      <p>{currentChild.parentGoals}</p>
                    </div>
                  )}

                  {/* Ready to practice banner */}
                  <div className="pt-2 flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 text-white">
                    <div>
                      <h4 className="font-display font-extrabold text-base">Ready for Today's Quest?</h4>
                      <p className="text-xs text-emerald-100">
                        {inProgressCount > 0
                          ? `${inProgressCount} quests waiting to be practiced!`
                          : 'All daily quests completed! Feel free to practice extra.'}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        sounds.playClick();
                        onEnterChildMode(currentChild.id);
                      }}
                      className="px-4 py-2 bg-white text-emerald-700 font-extrabold text-xs rounded-xl shadow-sm hover:bg-emerald-50 cursor-pointer"
                    >
                      Start Practice
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Col: Therapist Connection */}
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-blue-600" />
                    <h3 className="font-display font-bold text-base text-slate-900">
                      Speech Therapist
                    </h3>
                  </div>

                  {currentChild.therapistName ? (
                    <div className="space-y-2">
                      <div className="p-3 rounded-2xl bg-blue-50/80 border border-blue-200">
                        <div className="font-bold text-sm text-blue-900">
                          {currentChild.therapistName}
                        </div>
                        {currentChild.therapistClinic && (
                          <div className="text-xs text-blue-700">
                            {currentChild.therapistClinic}
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Your child's assigned exercises and speech practice observations sync securely with their therapist.
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-4 space-y-2">
                      <p className="text-xs text-slate-500">
                        No speech therapist linked yet. You can still practice all standard certified exercises.
                      </p>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>Child Mode Protection</span>
                    <span className="text-emerald-600 font-bold">Active & Secured</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ASSIGNED QUESTS */}
          {activeTab === 'assignments' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {childAssignments.map((asgn) => {
                  const isDone = asgn.status === 'completed';
                  return (
                    <div
                      key={asgn.id}
                      className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between gap-4"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                            Sound: /{asgn.exercise.targetSound}/
                          </span>
                          <span
                            className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                              isDone
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {isDone ? 'Completed' : 'In Progress'}
                          </span>
                        </div>

                        <h4 className="font-display font-extrabold text-lg text-slate-900">
                          {asgn.exerciseTitle}
                        </h4>
                        <p className="text-xs text-slate-600">
                          {asgn.exercise.instructions}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500">
                          Repetitions: {asgn.repetitionsCompleted} / {asgn.repetitionsRequired}
                        </span>
                        <button
                          onClick={() => {
                            sounds.playClick();
                            onEnterChildMode(currentChild.id);
                          }}
                          className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                        >
                          <span>Practice Quest</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: OBSERVATIONS / HISTORY */}
          {activeTab === 'history' && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-lg text-slate-900">
                    Speech Practice Log
                  </h3>
                  <p className="text-xs text-slate-500">
                    Factual records of voice attempts and speech practice observations.
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <Info className="w-3.5 h-3.5" />
                  <span>Observations, not medical diagnoses</span>
                </div>
              </div>

              {childAttempts.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-sm">
                  No practice attempts recorded yet. Launch Child Mode to practice your first quest!
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {childAttempts.map((att) => (
                    <div key={att.id} className="py-3.5 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                            att.isCorrect
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {att.isCorrect ? '✓' : '•'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-display font-bold text-sm text-slate-800">
                              "{att.target}"
                            </span>
                            <span className="text-xs text-slate-500">
                              (Spoken: "{att.recognizedResponse || 'No speech'}")
                            </span>
                          </div>
                          <div className="text-xs text-slate-400">
                            Target sound /{att.targetSound}/ • Accuracy: {att.accuracyScore}% •{' '}
                            {att.verificationMethod === 'speech_verified' ? 'Microphone verified' : 'Manual practice'}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-slate-400 whitespace-nowrap">
                        {new Date(att.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
