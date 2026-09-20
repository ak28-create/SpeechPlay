import React from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, 
  Mic, 
  Volume2, 
  ShieldCheck, 
  HeartHandshake, 
  Trophy, 
  Flame, 
  ArrowRight, 
  CheckCircle2, 
  Play,
  Activity,
  Users,
  Award
} from 'lucide-react';
import { sounds } from '../services/soundEffects';

interface LandingPageProps {
  onOpenParentLogin: () => void;
  onOpenParentRegister: () => void;
  onOpenTherapistLogin: () => void;
  onLaunchDemoTour: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenParentLogin,
  onOpenParentRegister,
  onOpenTherapistLogin,
  onLaunchDemoTour,
}) => {
  return (
    <div className="min-h-[calc(100vh-65px)] bg-radial from-emerald-50/50 via-white to-sky-50/40 text-slate-900 pb-16">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 pt-12 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Value Prop */}
          <motion.div 
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-7 space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs sm:text-sm font-extrabold shadow-2xs">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Speech Therapy Made Playful & Engaging</span>
            </div>

            <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-slate-900 tracking-tight leading-[1.15]">
              Make speech practice the <span className="text-emerald-500 underline decoration-emerald-300 decoration-wavy decoration-2">most fun part</span> of your child’s day.
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
              Speech Play bridges the gap between clinical speech therapy and home practice. Kids embark on colorful voice quests, parents monitor gentle progress, and speech-language pathologists create customized target exercises with real-time speech insights.
            </p>

            {/* Quick Interactive Demo Banner for Evaluators */}
            <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center font-black text-xl shrink-0">
                  ⚡
                </div>
                <div>
                  <h4 className="font-display font-bold text-sm text-amber-900">Want to test the full 3-role workflow instantly?</h4>
                  <p className="text-xs text-amber-700">Explore pre-configured Parent, Child Quest, and Therapist loops with 1-click.</p>
                </div>
              </div>
              <button
                onClick={() => {
                  sounds.playClick();
                  onLaunchDemoTour();
                }}
                className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider text-amber-900 bg-amber-300 hover:bg-amber-400 border-b-2 border-amber-500 active:translate-y-0.5 cursor-pointer shrink-0"
              >
                Launch Demo Tour
              </button>
            </div>

            {/* Main Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
              <button
                onClick={() => {
                  sounds.playClick();
                  onOpenParentRegister();
                }}
                className="btn-3d-green text-white font-extrabold text-base px-6 py-3.5 rounded-2xl shadow-md text-center cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Create Parent Account</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => {
                  sounds.playClick();
                  onOpenParentLogin();
                }}
                className="btn-3d-neutral text-slate-800 font-extrabold text-base px-6 py-3.5 rounded-2xl text-center cursor-pointer"
              >
                Parent Login
              </button>

              <button
                onClick={() => {
                  sounds.playClick();
                  onOpenTherapistLogin();
                }}
                className="btn-3d-blue text-white font-extrabold text-base px-6 py-3.5 rounded-2xl shadow-md text-center cursor-pointer flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-5 h-5" />
                <span>Therapist Portal</span>
              </button>
            </div>

            {/* Highlights */}
            <div className="pt-4 grid grid-cols-3 gap-4 border-t border-slate-200/80">
              <div>
                <div className="text-2xl font-display font-extrabold text-emerald-600">100%</div>
                <div className="text-xs font-bold text-slate-500">Child-Safe & Private</div>
              </div>
              <div>
                <div className="text-2xl font-display font-extrabold text-sky-600">SLP</div>
                <div className="text-xs font-bold text-slate-500">Therapist Created</div>
              </div>
              <div>
                <div className="text-2xl font-display font-extrabold text-amber-500">Voice AI</div>
                <div className="text-xs font-bold text-slate-500">Gentle Speech Analysis</div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Visual Preview of Duolingo-style Quest Experience */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="lg:col-span-5"
          >
            <div className="relative rounded-3xl bg-white p-6 shadow-xl border-2 border-emerald-100 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100/50 rounded-bl-full pointer-events-none" />

              {/* Mini App Simulation Card */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🦁</span>
                    <div>
                      <div className="font-display font-bold text-slate-800 text-sm">Today's Quest</div>
                      <div className="text-xs text-emerald-600 font-semibold">Sound Target: /S/</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center text-xs font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-md">
                      <Flame className="w-3.5 h-3.5 fill-amber-400 mr-1" /> 3d streak
                    </span>
                  </div>
                </div>

                {/* Target Word Interactive Card */}
                <div className="rounded-2xl bg-gradient-to-b from-sky-50 to-blue-50 border-2 border-sky-100 p-5 text-center space-y-3">
                  <div className="text-5xl select-none">☀️</div>
                  <div>
                    <h3 className="font-display font-extrabold text-3xl text-slate-900 tracking-wide">
                      Sun
                    </h3>
                    <p className="text-xs font-bold text-sky-700">/sʌn/ • Initial S-Sound</p>
                  </div>
                  <div className="flex justify-center gap-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-sky-600 font-bold text-xs shadow-2xs border border-sky-200">
                      <Volume2 className="w-4 h-4 text-sky-500" />
                      <span>Listen</span>
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 text-white font-bold text-xs shadow-2xs">
                      <Mic className="w-4 h-4 text-white animate-pulse" />
                      <span>Say It</span>
                    </div>
                  </div>
                </div>

                {/* Speech Analysis Sample */}
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-sm shrink-0">
                    ✓
                  </div>
                  <div className="text-xs text-slate-700">
                    <span className="font-bold text-emerald-800">Clear Initial /S/ Sound!</span>
                    <p className="text-slate-500">Recognized accurately with positive reinforcement.</p>
                  </div>
                </div>

                {/* Connected roles summary */}
                <div className="pt-2 flex items-center justify-between text-xs text-slate-500 font-semibold">
                  <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-slate-400" /> Parent Assisted</span>
                  <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-blue-500" /> SLP Verified</span>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>

      {/* Connected 3-Role Ecosystem Section */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <span className="text-xs font-extrabold tracking-wider uppercase text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full">
            Complete Connected Architecture
          </span>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900">
            How Speech Play Connects Everyone
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            No isolated exercises. A synchronized loop from clinical planning to playful practice.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Child Column */}
          <div className="bg-white rounded-3xl p-6 border-2 border-emerald-100 shadow-sm space-y-4 hover:border-emerald-300 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl font-bold">
              🎮
            </div>
            <h3 className="font-display font-bold text-xl text-slate-900">For The Child</h3>
            <p className="text-sm text-slate-600">
              Transform repetitive speech drills into quest adventures with stars, streaks, XP, encouraging mascots, and real-time voice recognition.
            </p>
            <ul className="space-y-2 text-xs font-semibold text-slate-600 pt-2 border-t border-slate-100">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Duolingo-style winding quest path</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Voice Trainer with Listen & Say It</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Never shaming, always encouraging</li>
            </ul>
          </div>

          {/* Parent Column */}
          <div className="bg-white rounded-3xl p-6 border-2 border-sky-100 shadow-sm space-y-4 hover:border-sky-300 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center text-2xl font-bold">
              ❤️
            </div>
            <h3 className="font-display font-bold text-xl text-slate-900">For The Parent</h3>
            <p className="text-sm text-slate-600">
              Peace of mind. Children never log in independently. Parents safely initiate Child Mode, track streaks, and review completed practice.
            </p>
            <ul className="space-y-2 text-xs font-semibold text-slate-600 pt-2 border-t border-slate-100">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-sky-500" /> Secure parent-gated child mode</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-sky-500" /> Multi-child profile support</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-sky-500" /> Simple progress tracking & streaks</li>
            </ul>
          </div>

          {/* Therapist Column */}
          <div className="bg-white rounded-3xl p-6 border-2 border-purple-100 shadow-sm space-y-4 hover:border-purple-300 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center text-2xl font-bold">
              📊
            </div>
            <h3 className="font-display font-bold text-xl text-slate-900">For The Therapist</h3>
            <p className="text-sm text-slate-600">
              Create custom exercises with uploaded images, recorded audio, and assign them directly to enrolled children with speech error observation trends.
            </p>
            <ul className="space-y-2 text-xs font-semibold text-slate-600 pt-2 border-t border-slate-100">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-500" /> Manual Exercise Creator + Media</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-500" /> In-browser reference voice recording</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-500" /> Repeated difficulty detection & logs</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
