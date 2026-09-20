import React from 'react';
import { User, ChildProfile } from '../types';
import { Sparkles, LogOut, ShieldCheck, Heart, Flame, Star, Zap, UserCheck, ArrowLeft } from 'lucide-react';
import { sounds } from '../services/soundEffects';

interface NavbarProps {
  currentUser: User | null;
  activeChild: ChildProfile | null;
  selectedChildId?: string | null;
  childrenList: ChildProfile[];
  onSelectChild: (childId: string) => void;
  onLogout: () => void;
  onExitChildMode: () => void;
  onOpenParentEnquiry: () => void;
  onOpenTherapistPortal: () => void;
  onOpenParentPortal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeChild,
  selectedChildId,
  childrenList,
  onSelectChild,
  onLogout,
  onExitChildMode,
  onOpenParentEnquiry,
  onOpenTherapistPortal,
  onOpenParentPortal,
}) => {
  // In Child Mode: Playful, distraction-free gamified topbar
  if (activeChild) {
    return (
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-2 border-emerald-100 px-4 py-3 shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                sounds.playClick();
                onExitChildMode();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              title="Return to Parent Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Parent Exit</span>
            </button>
            <div className="flex items-center gap-2">
              <span className="text-2xl select-none">{activeChild.avatarIcon || '🦊'}</span>
              <div>
                <span className="font-display font-bold text-lg text-slate-800 tracking-tight">
                  {activeChild.name}
                </span>
                <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                  Lvl {activeChild.level}
                </span>
              </div>
            </div>
          </div>

          {/* Gamified Stat Counters (Duolingo style) */}
          <div className="flex items-center gap-3 sm:gap-5">
            <div className="flex items-center gap-1 text-orange-500 font-extrabold text-sm sm:text-base bg-orange-50 px-2.5 py-1 rounded-xl border border-orange-200">
              <Flame className="w-4 h-4 fill-orange-500" />
              <span>{activeChild.streak}d</span>
            </div>

            <div className="flex items-center gap-1 text-amber-500 font-extrabold text-sm sm:text-base bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200">
              <Star className="w-4 h-4 fill-amber-400" />
              <span>{activeChild.stars}</span>
            </div>

            <div className="flex items-center gap-1 text-yellow-600 font-extrabold text-sm sm:text-base bg-yellow-50 px-2.5 py-1 rounded-xl border border-yellow-200">
              <Zap className="w-4 h-4 fill-yellow-400" />
              <span>{activeChild.xp} XP</span>
            </div>

            <div className="flex items-center gap-1 text-rose-500 font-extrabold text-sm sm:text-base bg-rose-50 px-2.5 py-1 rounded-xl border border-rose-200">
              <Heart className="w-4 h-4 fill-rose-500" />
              <span>{activeChild.hearts}</span>
            </div>
          </div>
        </div>
      </header>
    );
  }

  // Parent & Therapist standard navigation
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 shadow-xs">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-green-400 flex items-center justify-center text-white font-extrabold text-xl shadow-sm">
            🦜
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-extrabold text-xl tracking-tight text-slate-900">
                Speech Play
              </span>
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Kids & SLP
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Gamified speech therapy & practice connecting children, parents & therapists
            </p>
          </div>
        </div>

        {/* User state / Controls */}
        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-3">
              {/* Role badge */}
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">
                {currentUser.role === 'therapist' ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    <span>Therapist Portal</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Parent: {currentUser.name}</span>
                  </>
                )}
              </div>

              {currentUser.role === 'parent' && childrenList.length > 0 && (
                <div className="relative hidden md:block">
                  <select
                    value={selectedChildId || ''}
                    onChange={(e) => onSelectChild(e.target.value)}
                    className="text-xs font-bold bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="" disabled>Select child profile</option>
                    {childrenList.map((ch) => (
                      <option key={ch.id} value={ch.id}>
                        {ch.avatarIcon} {ch.name} (Age {ch.age})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {currentUser.role === 'parent' && (
                <button
                  onClick={() => {
                    sounds.playClick();
                    onOpenParentEnquiry();
                  }}
                  className="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  + Add Child
                </button>
              )}

              <button
                onClick={() => {
                  sounds.playClick();
                  onLogout();
                }}
                className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-rose-600 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                title="Log out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Log out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  sounds.playClick();
                  onOpenParentPortal();
                }}
                className="px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Parent Login
              </button>
              <button
                onClick={() => {
                  sounds.playClick();
                  onOpenTherapistPortal();
                }}
                className="px-3.5 py-1.5 rounded-xl font-bold text-xs sm:text-sm text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer"
              >
                Therapist Portal
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
