import React, { useState, useEffect, useCallback } from 'react';
import { User, ChildProfile, Exercise, ExerciseAssignment, SpeechAttempt } from './types';
import { storage } from './services/storage';
import { sounds } from './services/soundEffects';

// Components
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { ParentAuthModal } from './components/ParentAuthModal';
import { TherapistAuthModal } from './components/Therapist/TherapistAuthModal';
import { ChildEnquiryModal } from './components/ChildEnquiryModal';
import { ParentDashboard } from './components/ParentDashboard';
import { ChildMode } from './components/ChildMode/ChildMode';
import { TherapistDashboard } from './components/Therapist/TherapistDashboard';

export default function App() {
  // Core Application State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeChild, setActiveChild] = useState<ChildProfile | null>(null);
  const [childrenList, setChildrenList] = useState<ChildProfile[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [assignments, setAssignments] = useState<ExerciseAssignment[]>([]);
  const [attempts, setAttempts] = useState<SpeechAttempt[]>([]);

  // Modals & Flows
  const [isParentAuthOpen, setIsParentAuthOpen] = useState(false);
  const [parentAuthMode, setParentAuthMode] = useState<'login' | 'register'>('login');
  const [isTherapistAuthOpen, setIsTherapistAuthOpen] = useState(false);
  const [isChildEnquiryOpen, setIsChildEnquiryOpen] = useState(false);

  // Demo Tour banner or selector
  const [showDemoSelector, setShowDemoSelector] = useState(false);

  // Synchronize state from storage
  const reloadData = useCallback(() => {
    const user = storage.getCurrentUser();
    setCurrentUser(user);

    if (user?.role === 'parent') {
      const children = storage.getChildrenForParent(user.id);
      setChildrenList(children);

      // Verify or refresh active child
      const currentActiveChild = storage.getActiveChild();
      setActiveChild(currentActiveChild);

      if (children.length > 0 && !selectedChildId) {
        setSelectedChildId(children[0].id);
      }
    } else if (user?.role === 'therapist') {
      setActiveChild(null);
      // Therapist sees all registered children in clinic/system
      const allKids = storage.getAllChildren();
      setChildrenList(allKids);
    } else {
      setActiveChild(null);
      setChildrenList([]);
    }

    setExercises(storage.getAllExercises());
    setAssignments(storage.getAllAssignments());
    setAttempts(storage.getAllAttempts());
  }, [selectedChildId]);

  useEffect(() => {
    reloadData();
  }, [reloadData]);

  // --- ACTIONS ---

  // Handle Parent Authentication Success
  const handleParentAuthSuccess = (user: User, isNewRegistration: boolean) => {
    setIsParentAuthOpen(false);
    reloadData();

    if (isNewRegistration) {
      // Step into Child Pre-Registration Enquiry ("Let's Get to Know Your Child")
      setIsChildEnquiryOpen(true);
    } else {
      const kids = storage.getChildrenForParent(user.id);
      if (kids.length === 0) {
        setIsChildEnquiryOpen(true);
      }
    }
  };

  // Handle Therapist Authentication Success
  const handleTherapistAuthSuccess = (therapist: User) => {
    setIsTherapistAuthOpen(false);
    reloadData();
  };

  // Handle Child Profile Created from Enquiry
  const handleChildCreated = (newChild: ChildProfile) => {
    setIsChildEnquiryOpen(false);
    setSelectedChildId(newChild.id);
    reloadData();
  };

  // Enter Child Mode (Security Protected: requires authenticated parent session)
  const handleEnterChildMode = (childId: string) => {
    const ok = storage.enterChildMode(childId);
    if (ok) {
      const child = storage.getChildById(childId);
      setActiveChild(child);
      sounds.playSuccess();
    }
  };

  // Exit Child Mode
  const handleExitChildMode = () => {
    storage.exitChildMode();
    setActiveChild(null);
    reloadData();
  };

  // Logout
  const handleLogout = () => {
    storage.logout();
    setActiveChild(null);
    setCurrentUser(null);
    setSelectedChildId(null);
    reloadData();
  };

  // Guided Demo Tour Helper
  const handleLaunchDemoTour = () => {
    const creds = storage.seedDemoEnvironment();
    setShowDemoSelector(true);
  };

  const handleQuickDemoLogin = (role: 'parent' | 'child' | 'therapist') => {
    setShowDemoSelector(false);
    const creds = storage.seedDemoEnvironment();

    if (role === 'parent') {
      storage.loginUser(creds.parentEmail, 'password123', 'parent');
      storage.exitChildMode();
      reloadData();
    } else if (role === 'child') {
      storage.loginUser(creds.parentEmail, 'password123', 'parent');
      const kids = storage.getAllChildren();
      const demoChild = kids.find(k => k.name === 'Leo') || kids[0];
      if (demoChild) {
        storage.enterChildMode(demoChild.id);
      }
      reloadData();
    } else if (role === 'therapist') {
      storage.loginUser(creds.therapistEmail, 'password123', 'therapist');
      storage.exitChildMode();
      reloadData();
    }
    sounds.playFanfare();
  };

  // Determine current child for parent view
  const currentParentChild = childrenList.find(c => c.id === selectedChildId) || childrenList[0] || null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-200">
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        activeChild={activeChild}
        selectedChildId={selectedChildId}
        childrenList={childrenList}
        onSelectChild={(id) => {
          setSelectedChildId(id);
        }}
        onLogout={handleLogout}
        onExitChildMode={handleExitChildMode}
        onOpenParentEnquiry={() => setIsChildEnquiryOpen(true)}
        onOpenTherapistPortal={() => setIsTherapistAuthOpen(true)}
        onOpenParentPortal={() => {
          setParentAuthMode('login');
          setIsParentAuthOpen(true);
        }}
      />

      {/* Main Content Areas */}
      <main className="flex-1">
        {/* VIEW 1: CHILD MODE (When Parent has authenticated & entered child mode) */}
        {activeChild && currentUser?.role === 'parent' ? (
          <ChildMode
            child={activeChild}
            assignments={assignments.filter(a => a.childId === activeChild.id)}
            onExitChildMode={handleExitChildMode}
            onRefreshAssignments={reloadData}
          />
        ) : currentUser?.role === 'therapist' ? (
          /* VIEW 2: THERAPIST DASHBOARD */
          <TherapistDashboard
            currentUser={currentUser}
            childrenList={childrenList}
            exercises={exercises}
            assignments={assignments}
            attempts={attempts}
            onRefreshData={reloadData}
          />
        ) : currentUser?.role === 'parent' ? (
          /* VIEW 3: PARENT DASHBOARD */
          <ParentDashboard
            currentUser={currentUser}
            childrenList={childrenList}
            selectedChild={currentParentChild}
            onSelectChild={(id) => setSelectedChildId(id)}
            onAddNewChild={() => setIsChildEnquiryOpen(true)}
            onEnterChildMode={handleEnterChildMode}
            assignments={assignments}
            attempts={attempts}
          />
        ) : (
          /* VIEW 4: LANDING PAGE (Unauthenticated) */
          <LandingPage
            onOpenParentLogin={() => {
              setParentAuthMode('login');
              setIsParentAuthOpen(true);
            }}
            onOpenParentRegister={() => {
              setParentAuthMode('register');
              setIsParentAuthOpen(true);
            }}
            onOpenTherapistLogin={() => {
              setIsTherapistAuthOpen(true);
            }}
            onLaunchDemoTour={handleLaunchDemoTour}
          />
        )}
      </main>

      {/* Parent Auth Modal (Login & Register) */}
      <ParentAuthModal
        isOpen={isParentAuthOpen}
        initialMode={parentAuthMode}
        onClose={() => setIsParentAuthOpen(false)}
        onSuccess={handleParentAuthSuccess}
      />

      {/* Therapist Auth Modal */}
      <TherapistAuthModal
        isOpen={isTherapistAuthOpen}
        onClose={() => setIsTherapistAuthOpen(false)}
        onSuccess={handleTherapistAuthSuccess}
      />

      {/* Child Pre-Registration Enquiry ("Let's Get to Know Your Child" - Section 9) */}
      {currentUser && currentUser.role === 'parent' && (
        <ChildEnquiryModal
          isOpen={isChildEnquiryOpen}
          parentId={currentUser.id}
          onClose={() => setIsChildEnquiryOpen(false)}
          onChildCreated={handleChildCreated}
        />
      )}

      {/* Guided Demo Tour Quick Selector Modal */}
      {showDemoSelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-amber-300 relative text-center space-y-4">
            <span className="text-4xl">🚀</span>
            <h3 className="font-display font-black text-2xl text-slate-900">
              Interactive Live Demo Tour
            </h3>
            <p className="text-xs text-slate-600">
              Choose which experience you want to preview with connected dynamic data:
            </p>

            <div className="space-y-2.5 pt-2">
              <button
                onClick={() => handleQuickDemoLogin('child')}
                className="w-full btn-3d-green text-white font-extrabold text-sm py-3 px-4 rounded-2xl flex items-center justify-between cursor-pointer"
              >
                <span>🎮 1. Child Quest Experience (Voice Trainer)</span>
                <span>→</span>
              </button>

              <button
                onClick={() => handleQuickDemoLogin('parent')}
                className="w-full btn-3d-neutral text-slate-800 font-extrabold text-sm py-3 px-4 rounded-2xl flex items-center justify-between cursor-pointer"
              >
                <span>❤️ 2. Parent Dashboard & Child Gateway</span>
                <span>→</span>
              </button>

              <button
                onClick={() => handleQuickDemoLogin('therapist')}
                className="w-full btn-3d-blue text-white font-extrabold text-sm py-3 px-4 rounded-2xl flex items-center justify-between cursor-pointer"
              >
                <span>📊 3. Therapist Clinician Portal & Analytics</span>
                <span>→</span>
              </button>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setShowDemoSelector(false)}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                Cancel / Register Fresh Account Instead
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
