import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, ChildProfile, Exercise, ExerciseAssignment, SpeechAttempt } from '../../types';
import { storage } from '../../services/storage';
import { ExerciseCreatorModal } from './ExerciseCreatorModal';
import { sounds } from '../../services/soundEffects';
import { 
  ShieldCheck, 
  Plus, 
  Users, 
  Activity, 
  TrendingUp, 
  AlertTriangle, 
  Volume2, 
  CheckCircle2, 
  Clock, 
  Filter, 
  Play, 
  Eye, 
  Sparkles,
  Calendar,
  Share2,
  FileText,
  Info
} from 'lucide-react';

interface TherapistDashboardProps {
  currentUser: User;
  childrenList: ChildProfile[];
  exercises: Exercise[];
  assignments: ExerciseAssignment[];
  attempts: SpeechAttempt[];
  onRefreshData: () => void;
}

export const TherapistDashboard: React.FC<TherapistDashboardProps> = ({
  currentUser,
  childrenList,
  exercises,
  assignments,
  attempts,
  onRefreshData,
}) => {
  const [activeTab, setActiveTab] = useState<'children' | 'exercises' | 'insights' | 'attempts'>('children');
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [selectedChildFilter, setSelectedChildFilter] = useState<string>('all');
  const [selectedChildForDetail, setSelectedChildForDetail] = useState<ChildProfile | null>(null);

  // Filtered lists
  const myExercises = exercises.filter(e => e.createdByTherapistId === currentUser.id || e.createdByTherapistId === 'system_slp');
  const filteredAttempts = selectedChildFilter === 'all' 
    ? attempts 
    : attempts.filter(a => a.childId === selectedChildFilter);

  // Practice Analytics Calculations
  const totalAttemptsCount = attempts.length;
  const correctAttemptsCount = attempts.filter(a => a.isCorrect).length;
  const overallSuccessRate = totalAttemptsCount > 0 
    ? Math.round((correctAttemptsCount / totalAttemptsCount) * 100) 
    : 0;

  // Aggregate repeated error insights across all enrolled children
  const allInsights = childrenList.flatMap(c => storage.getRepeatedErrorInsights(c.id));

  // Quick exercise assignment helper
  const [quickAssignExerciseId, setQuickAssignExerciseId] = useState<string | null>(null);
  const [quickAssignChildId, setQuickAssignChildId] = useState<string>(childrenList[0]?.id || '');

  const handleQuickAssign = (exerciseId: string) => {
    if (!quickAssignChildId) return;
    storage.assignExerciseToChild({
      childId: quickAssignChildId,
      exerciseId,
      therapistId: currentUser.id,
      therapistName: currentUser.name,
      repetitionsRequired: 3,
    });
    sounds.playSuccess();
    setQuickAssignExerciseId(null);
    onRefreshData();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Clinician Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-blue-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Certified Clinician Portal</span>
            </span>
            {currentUser.clinicOrOrganization && (
              <span className="text-xs text-slate-500 font-semibold">
                • {currentUser.clinicOrOrganization}
              </span>
            )}
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900">
            {currentUser.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Clinical management of exercises, enrolled patient progress, and speech observation analytics.
          </p>
        </div>

        <button
          onClick={() => {
            sounds.playClick();
            setIsCreatorOpen(true);
          }}
          className="btn-3d-blue text-white font-extrabold text-sm sm:text-base px-6 py-3.5 rounded-2xl shadow-md flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-5 h-5" />
          <span>Create Exercise</span>
        </button>
      </div>

      {/* Analytics Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-2">
            <span>Enrolled Children</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="font-display font-black text-3xl text-slate-900">
            {childrenList.length}
          </div>
          <p className="text-2xs text-slate-400 mt-1">Actively practicing at home</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-2">
            <span>Total Practice Attempts</span>
            <Activity className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="font-display font-black text-3xl text-slate-900">
            {totalAttemptsCount}
          </div>
          <p className="text-2xs text-slate-400 mt-1">Spoken voice drills recorded</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-2">
            <span>Overall Success Rate</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="font-display font-black text-3xl text-emerald-600">
            {overallSuccessRate}%
          </div>
          <p className="text-2xs text-slate-400 mt-1">First-attempt pronunciation accuracy</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-2">
            <span>Active Quests</span>
            <FileText className="w-4 h-4 text-purple-500" />
          </div>
          <div className="font-display font-black text-3xl text-slate-900">
            {assignments.length}
          </div>
          <p className="text-2xs text-slate-400 mt-1">Assigned practice modules</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab('children')}
          className={`pb-3 text-sm font-extrabold transition-colors cursor-pointer border-b-2 -mb-[2px] ${
            activeTab === 'children'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Enrolled Children ({childrenList.length})
        </button>
        <button
          onClick={() => setActiveTab('exercises')}
          className={`pb-3 text-sm font-extrabold transition-colors cursor-pointer border-b-2 -mb-[2px] ${
            activeTab === 'exercises'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Exercise Library ({myExercises.length})
        </button>
        <button
          onClick={() => setActiveTab('insights')}
          className={`pb-3 text-sm font-extrabold transition-colors cursor-pointer border-b-2 -mb-[2px] flex items-center gap-1.5 ${
            activeTab === 'insights'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Speech Insights & Observations</span>
          {allInsights.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-500" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('attempts')}
          className={`pb-3 text-sm font-extrabold transition-colors cursor-pointer border-b-2 -mb-[2px] ${
            activeTab === 'attempts'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Speech Logs ({attempts.length})
        </button>
      </div>

      {/* TAB 1: ENROLLED CHILDREN */}
      {activeTab === 'children' && (
        <div className="space-y-4">
          {childrenList.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
              <Users className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-display font-bold text-lg text-slate-800">No Enrolled Children Yet</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                When parents create child profiles and list your name or clinic, their practice progress and speech logs will appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {childrenList.map((child) => {
                const childAsgns = assignments.filter(a => a.childId === child.id);
                const childAtts = attempts.filter(a => a.childId === child.id);
                const childInsights = storage.getRepeatedErrorInsights(child.id);

                return (
                  <div
                    key={child.id}
                    className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-4xl">{child.avatarIcon || '🦊'}</span>
                        <div>
                          <h3 className="font-display font-bold text-lg text-slate-900">
                            {child.name}
                          </h3>
                          <p className="text-xs text-slate-500">
                            Age {child.age} • {child.grade || 'Preschool'}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div>
                          <span className="font-bold text-slate-600 block mb-1">Target Sounds:</span>
                          <div className="flex flex-wrap gap-1">
                            {child.targetSounds?.map(s => (
                              <span key={s} className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 font-bold">
                                /{s}/
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between font-semibold text-slate-600">
                          <span>Quests Assigned:</span>
                          <span className="font-bold text-slate-900">{childAsgns.length}</span>
                        </div>

                        <div className="flex items-center justify-between font-semibold text-slate-600">
                          <span>Recorded Attempts:</span>
                          <span className="font-bold text-slate-900">{childAtts.length}</span>
                        </div>

                        {childInsights.length > 0 && (
                          <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-2xs font-semibold flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>{childInsights.length} practice pattern notice</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <button
                        onClick={() => {
                          sounds.playClick();
                          setSelectedChildFilter(child.id);
                          setActiveTab('attempts');
                        }}
                        className="text-xs font-bold text-blue-600 hover:underline"
                      >
                        View Speech Logs
                      </button>

                      <button
                        onClick={() => {
                          sounds.playClick();
                          setQuickAssignChildId(child.id);
                          setActiveTab('exercises');
                        }}
                        className="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                      >
                        + Assign Quest
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: EXERCISE LIBRARY */}
      {activeTab === 'exercises' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-lg text-slate-900">
                Exercise Library
              </h3>
              <p className="text-xs text-slate-500">
                Custom speech modules created for pronunciation, articulation, and voice practice.
              </p>
            </div>
            <button
              onClick={() => {
                sounds.playClick();
                setIsCreatorOpen(true);
              }}
              className="text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-3.5 py-2 rounded-xl border border-blue-200 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Exercise</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myExercises.map((ex) => (
              <div
                key={ex.id}
                className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      Sound: /{ex.targetSound}/
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 uppercase">
                      {ex.difficulty}
                    </span>
                  </div>

                  <div className="flex items-start gap-3">
                    {ex.imageUrl ? (
                      <img src={ex.imageUrl} alt={ex.targetWord} className="w-14 h-14 rounded-2xl object-cover border shrink-0" />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-display font-extrabold text-2xl shrink-0">
                        {ex.targetSound}
                      </div>
                    )}
                    <div>
                      <h4 className="font-display font-bold text-lg text-slate-900">
                        {ex.title}
                      </h4>
                      <p className="text-xs text-blue-700 font-bold">
                        Target Word: "{ex.targetWord}" {ex.phoneticGuide ? `(${ex.phoneticGuide})` : ''}
                      </p>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {ex.instructions}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {ex.hasCustomAudio && (
                      <span className="text-2xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Volume2 className="w-3 h-3" /> Voice Attached
                      </span>
                    )}
                  </div>

                  {childrenList.length > 0 && (
                    <div className="flex items-center gap-2">
                      {quickAssignExerciseId === ex.id ? (
                        <div className="flex items-center gap-2">
                          <select
                            value={quickAssignChildId}
                            onChange={(e) => setQuickAssignChildId(e.target.value)}
                            className="text-xs font-bold bg-slate-50 border rounded-lg p-1"
                          >
                            {childrenList.map(c => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleQuickAssign(ex.id)}
                            className="text-xs font-black bg-emerald-600 text-white px-2.5 py-1 rounded-lg cursor-pointer"
                          >
                            Assign
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setQuickAssignExerciseId(ex.id)}
                          className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-xl cursor-pointer"
                        >
                          Assign to Child
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: REPEATED ERROR DETECTION & CLINICAL INSIGHTS */}
      {activeTab === 'insights' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-lg text-slate-900">
                  Repeated Practice Difficulty Detection
                </h3>
                <p className="text-xs text-slate-500">
                  Surfaces repeated difficulties factually based on practice logs (Section 34 guideline: practice observations, not medical diagnosis).
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-50 px-3 py-1.5 rounded-xl border">
                <Info className="w-4 h-4 text-slate-500" />
                <span>Practice observations for clinical planning</span>
              </div>
            </div>

            {allInsights.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <p className="font-bold text-slate-700">No repeated difficulty patterns observed!</p>
                <p className="text-xs text-slate-400">
                  When a child experiences repeated substitutions or omissions across multiple attempts, they will be surfaced here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {allInsights.map((insight, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-black px-2.5 py-0.5 rounded-md bg-amber-200 text-amber-900">
                          Target Sound /{insight.targetSound}/
                        </span>
                        <span className="font-bold text-slate-700">
                          Observed {insight.frequency} times
                        </span>
                      </div>
                      <p className="font-medium text-slate-700">
                        {insight.observationSummary}
                      </p>
                      <p className="text-slate-500 text-2xs">
                        Sample words practiced: {insight.sampleTargets.join(', ')}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        sounds.playClick();
                        setIsCreatorOpen(true);
                      }}
                      className="text-xs font-bold text-blue-700 bg-white border border-blue-200 px-3 py-1.5 rounded-xl hover:bg-blue-50 shrink-0 cursor-pointer"
                    >
                      Create Target Quest
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: SPEECH ATTEMPTS LOGS */}
      {activeTab === 'attempts' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-display font-bold text-lg text-slate-900">
                Detailed Speech Attempt Records
              </h3>
              <p className="text-xs text-slate-500">
                Real speech verification logs, recognized response strings, and confidence metrics.
              </p>
            </div>

            {/* Child Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={selectedChildFilter}
                onChange={(e) => setSelectedChildFilter(e.target.value)}
                className="text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-slate-700 focus:outline-none"
              >
                <option value="all">All Children</option>
                {childrenList.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {filteredAttempts.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              No speech attempts recorded for this selection yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-extrabold">
                    <th className="py-3 px-2">Child</th>
                    <th className="py-3 px-2">Target</th>
                    <th className="py-3 px-2">Spoken Response</th>
                    <th className="py-3 px-2">Result</th>
                    <th className="py-3 px-2">Accuracy</th>
                    <th className="py-3 px-2">Method</th>
                    <th className="py-3 px-2">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAttempts.map((att) => (
                    <tr key={att.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-2 font-bold text-slate-800">
                        {att.childName}
                      </td>
                      <td className="py-3 px-2 font-black text-blue-700">
                        "{att.target}" (/{att.targetSound}/)
                      </td>
                      <td className="py-3 px-2 text-slate-600 font-mono">
                        "{att.recognizedResponse || '<None>'}"
                      </td>
                      <td className="py-3 px-2">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-2xs ${
                            att.isCorrect
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {att.isCorrect ? 'Correct' : att.errorType?.replace('_', ' ') || 'Needs practice'}
                        </span>
                      </td>
                      <td className="py-3 px-2 font-bold text-slate-700">
                        {att.accuracyScore}%
                      </td>
                      <td className="py-3 px-2 text-slate-500 font-medium">
                        {att.verificationMethod === 'speech_verified' ? 'Microphone Verified' : 'Manual Practice'}
                      </td>
                      <td className="py-3 px-2 text-slate-400">
                        {new Date(att.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Manual Exercise Creator Modal */}
      {isCreatorOpen && (
        <ExerciseCreatorModal
          isOpen={isCreatorOpen}
          therapistId={currentUser.id}
          therapistName={currentUser.name}
          childrenList={childrenList}
          onClose={() => setIsCreatorOpen(false)}
          onExerciseCreated={() => {
            onRefreshData();
          }}
        />
      )}
    </div>
  );
};
