import {
  User,
  ChildProfile,
  Exercise,
  ExerciseAssignment,
  SpeechAttempt,
  RepeatedErrorInsight,
  SpeechErrorType
} from '../types';

const STORAGE_KEYS = {
  USERS: 'speechplay_users',
  CURRENT_USER: 'speechplay_current_user',
  ACTIVE_CHILD_ID: 'speechplay_active_child_id',
  CHILDREN: 'speechplay_children',
  EXERCISES: 'speechplay_exercises',
  ASSIGNMENTS: 'speechplay_assignments',
  ATTEMPTS: 'speechplay_attempts',
};

// Standard Speech Therapy starter templates that therapists can use or customize
export const DEFAULT_EXERCISE_TEMPLATES: Omit<Exercise, 'id' | 'createdByTherapistId' | 'createdByName' | 'createdAt'>[] = [
  {
    title: 'Sun & Sky',
    type: 'sound_practice',
    difficulty: 'easy',
    category: 'S-Blend & Sibilants',
    instructions: 'Place your tongue behind your front teeth and make a clear hissing "S" sound!',
    description: 'Practice the initial /s/ sound with bright sunny words.',
    targetSound: 'S',
    targetWord: 'Sun',
    targetSentence: 'The sun shines in the sky.',
    phoneticGuide: '/sʌn/',
    hasCustomAudio: false,
  },
  {
    title: 'Roaring Rocket',
    type: 'listen_and_repeat',
    difficulty: 'medium',
    category: 'Rhotic /R/ Sounds',
    instructions: 'Curl your tongue back gently without touching the roof of your mouth. Say "Rrrocket"!',
    description: 'Targeting initial /r/ sound through fun space adventure words.',
    targetSound: 'R',
    targetWord: 'Rocket',
    targetSentence: 'The red rocket zooms to the moon.',
    phoneticGuide: '/ˈrɒkɪt/',
    hasCustomAudio: false,
  },
  {
    title: 'Little Lion',
    type: 'picture_naming',
    difficulty: 'easy',
    category: 'Liquid /L/ Sounds',
    instructions: 'Lift the tip of your tongue to touch right behind your top front teeth. Say "Lion"!',
    description: 'Mastering the liquid /l/ sound with safari animals.',
    targetSound: 'L',
    targetWord: 'Lion',
    targetSentence: 'The little lion plays in the grass.',
    phoneticGuide: '/ˈlaɪən/',
    hasCustomAudio: false,
  },
  {
    title: 'Thumbs Up!',
    type: 'sound_practice',
    difficulty: 'hard',
    category: 'Dental Fricative /TH/',
    instructions: 'Rest your tongue gently between your front teeth and blow a soft stream of air!',
    description: 'Voiceless /th/ sound practice for clearer conversational speech.',
    targetSound: 'TH',
    targetWord: 'Thumb',
    targetSentence: 'Give a big thumbs up for great effort.',
    phoneticGuide: '/θʌm/',
    hasCustomAudio: false,
  },
  {
    title: 'Cheery Chipmunk',
    type: 'sound_hunt',
    difficulty: 'medium',
    category: 'Affricate /CH/',
    instructions: 'Touch your tongue up then release with a quick puff of air: "Ch-ch-chipmunk"!',
    description: 'Fun forest adventure practicing the snappy /ch/ sound.',
    targetSound: 'CH',
    targetWord: 'Chipmunk',
    targetSentence: 'The cheerful chipmunk munches cherries.',
    phoneticGuide: '/ˈtʃɪpmʌŋk/',
    hasCustomAudio: false,
  }
];

class StorageService {
  private memoryFallback: Record<string, any> = {};

  constructor() {
    this.sanitizeStorage();
  }

  /**
   * Run startup sanitation to proactively strip bloated nested objects
   * and recover any saturated localStorage state from previous sessions.
   */
  private sanitizeStorage(): void {
    if (typeof window === 'undefined') return;
    try {
      // 1. Sanitize assignments if it contains heavy nested exercise objects
      const rawAssignments = localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS);
      if (
        rawAssignments &&
        (rawAssignments.includes('"imageUrl"') ||
          rawAssignments.includes('"audioUrl"') ||
          rawAssignments.includes('"exercise"'))
      ) {
        try {
          const parsed = JSON.parse(rawAssignments);
          if (Array.isArray(parsed)) {
            const stripped = parsed.map((a) => {
              const { exercise, ...rest } = a;
              return rest;
            });
            localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(stripped));
            console.info('Storage sanitized: stripped bloated exercises from assignments');
          }
        } catch {
          // ignore
        }
      }

      // 2. Sanitize attempts: keep at most 50 recent attempts
      const rawAttempts = localStorage.getItem(STORAGE_KEYS.ATTEMPTS);
      if (rawAttempts) {
        try {
          const parsed = JSON.parse(rawAttempts);
          if (Array.isArray(parsed) && parsed.length > 50) {
            const truncated = parsed.slice(0, 50);
            localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(truncated));
          }
        } catch {
          // ignore
        }
      }
    } catch (e) {
      console.warn('Storage initial sanitation notice:', e);
    }
  }

  // Load helpers with memory fallback
  private getItem<T>(key: string, defaultValue: T): T {
    if (typeof window === 'undefined') return defaultValue;
    if (this.memoryFallback[key] !== undefined) {
      return this.memoryFallback[key] as T;
    }
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private setItem<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
      // Keep memory fallback in sync
      this.memoryFallback[key] = value;
    } catch (e: any) {
      console.warn('Storage setItem quota alert for key:', key, e);
      this.recoverFromQuotaError(key, value);
    }
  }

  /**
   * Gracefully recover if localStorage quota limit is reached.
   * Purges redundant bloated keys, truncates logs, and falls back to memory if needed.
   */
  private recoverFromQuotaError<T>(failedKey: string, failedValue: T): void {
    try {
      // 1. Truncate attempts to 25
      const rawAttempts = localStorage.getItem(STORAGE_KEYS.ATTEMPTS);
      if (rawAttempts) {
        try {
          const parsed = JSON.parse(rawAttempts);
          if (Array.isArray(parsed) && parsed.length > 25) {
            localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(parsed.slice(0, 25)));
          }
        } catch {}
      }

      // 2. Strip any nested exercise objects from assignments in localStorage
      const rawAssignments = localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS);
      if (rawAssignments) {
        try {
          const parsed = JSON.parse(rawAssignments);
          if (Array.isArray(parsed)) {
            const stripped = parsed.map((a) => {
              const { exercise, ...rest } = a;
              return rest;
            });
            localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(stripped));
          }
        } catch {}
      }

      // 3. Retry setting failed item
      if (failedKey === STORAGE_KEYS.ASSIGNMENTS && Array.isArray(failedValue)) {
        const stripped = (failedValue as any[]).map((a) => {
          const { exercise, ...rest } = a;
          return rest;
        });
        localStorage.setItem(failedKey, JSON.stringify(stripped));
        this.memoryFallback[failedKey] = failedValue;
        return;
      }

      localStorage.setItem(failedKey, JSON.stringify(failedValue));
      this.memoryFallback[failedKey] = failedValue;
    } catch (retryErr) {
      console.warn('LocalStorage saturated, retaining state in memory:', failedKey);
      this.memoryFallback[failedKey] = failedValue;
    }
  }

  // --- USERS & AUTHENTICATION ---
  getAllUsers(): User[] {
    return this.getItem<User[]>(STORAGE_KEYS.USERS, []);
  }

  getCurrentUser(): User | null {
    return this.getItem<User | null>(STORAGE_KEYS.CURRENT_USER, null);
  }

  setCurrentUser(user: User | null): void {
    this.setItem(STORAGE_KEYS.CURRENT_USER, user);
    if (!user) {
      this.setItem(STORAGE_KEYS.ACTIVE_CHILD_ID, null);
    }
  }

  registerUser(params: {
    role: 'parent' | 'therapist';
    name: string;
    email: string;
    password?: string;
    clinicOrOrganization?: string;
  }): { success: boolean; user?: User; error?: string } {
    const users = this.getAllUsers();
    const existing = users.find(u => u.email.toLowerCase() === params.email.toLowerCase());
    if (existing) {
      return { success: false, error: 'An account with this email already exists.' };
    }

    const newUser: User = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
      role: params.role,
      name: params.name.trim(),
      email: params.email.trim().toLowerCase(),
      password: params.password,
      clinicOrOrganization: params.clinicOrOrganization?.trim(),
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    this.setItem(STORAGE_KEYS.USERS, users);
    this.setCurrentUser(newUser);

    // If therapist, seed standard templates authored by this therapist if they have none yet
    if (params.role === 'therapist') {
      this.seedTemplatesForTherapist(newUser.id, newUser.name);
    }

    return { success: true, user: newUser };
  }

  loginUser(email: string, password?: string, expectedRole?: 'parent' | 'therapist'): { success: boolean; user?: User; error?: string } {
    const users = this.getAllUsers();
    const user = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());

    if (!user) {
      return { success: false, error: 'Account not found. Please check your email or register.' };
    }

    if (password && user.password && user.password !== password) {
      return { success: false, error: 'Incorrect password. Please try again.' };
    }

    if (expectedRole && user.role !== expectedRole) {
      return {
        success: false,
        error: `This account is registered as a ${user.role}. Please log in via the ${user.role} portal.`
      };
    }

    this.setCurrentUser(user);
    return { success: true, user };
  }

  logout(): void {
    this.setCurrentUser(null);
    this.setItem(STORAGE_KEYS.ACTIVE_CHILD_ID, null);
  }

  // --- CHILD PROFILES ---
  getAllChildren(): ChildProfile[] {
    return this.getItem<ChildProfile[]>(STORAGE_KEYS.CHILDREN, []);
  }

  getChildrenForParent(parentId: string): ChildProfile[] {
    return this.getAllChildren().filter(c => c.parentId === parentId);
  }

  getChildById(childId: string): ChildProfile | null {
    return this.getAllChildren().find(c => c.id === childId) || null;
  }

  createChildProfile(data: {
    parentId: string;
    name: string;
    age: number;
    grade?: string;
    preferredLanguage: string;
    avatarIcon?: string;
    speechPracticeType?: string[];
    targetSounds?: string[];
    currentWords?: string[];
    parentGoals?: string;
    therapistId?: string;
    therapistName?: string;
    therapistClinic?: string;
  }): ChildProfile {
    const children = this.getAllChildren();
    const newChild: ChildProfile = {
      id: 'ch_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
      parentId: data.parentId,
      name: data.name.trim(),
      age: data.age,
      grade: data.grade?.trim(),
      preferredLanguage: data.preferredLanguage || 'English',
      avatarIcon: data.avatarIcon || '🦊',
      speechPracticeType: data.speechPracticeType || ['Articulation', 'Phonology'],
      targetSounds: data.targetSounds || ['S', 'R'],
      currentWords: data.currentWords || [],
      parentGoals: data.parentGoals,
      therapistId: data.therapistId,
      therapistName: data.therapistName,
      therapistClinic: data.therapistClinic,
      createdAt: new Date().toISOString(),
      stars: 10,
      xp: 40,
      streak: 1,
      hearts: 5,
      level: 1,
      completedQuestsCount: 0,
    };

    children.push(newChild);
    this.setItem(STORAGE_KEYS.CHILDREN, children);

    // Automatically assign starter quests matched to child's target sounds
    this.autoAssignStarterQuests(newChild);

    return newChild;
  }

  updateChildStats(childId: string, delta: {
    stars?: number;
    xp?: number;
    streak?: number;
    hearts?: number;
    quests?: number;
    levelUp?: boolean;
  }): ChildProfile | null {
    const children = this.getAllChildren();
    const index = children.findIndex(c => c.id === childId);
    if (index === -1) return null;

    const child = children[index];
    if (delta.stars !== undefined) child.stars = Math.max(0, child.stars + delta.stars);
    if (delta.xp !== undefined) {
      child.xp = Math.max(0, child.xp + delta.xp);
      // Auto level calculation every 100 XP
      child.level = Math.floor(child.xp / 100) + 1;
    }
    if (delta.streak !== undefined) child.streak = Math.max(0, child.streak + delta.streak);
    if (delta.hearts !== undefined) child.hearts = Math.max(0, Math.min(5, child.hearts + delta.hearts));
    if (delta.quests !== undefined) child.completedQuestsCount += delta.quests;

    children[index] = child;
    this.setItem(STORAGE_KEYS.CHILDREN, children);
    return child;
  }

  // --- CHILD MODE ACCESS SECURITY ---
  getActiveChild(): ChildProfile | null {
    const currentUser = this.getCurrentUser();
    if (!currentUser || currentUser.role !== 'parent') {
      return null;
    }
    const childId = this.getItem<string | null>(STORAGE_KEYS.ACTIVE_CHILD_ID, null);
    if (!childId) return null;

    // Security verify: child must belong to currently authenticated parent
    const child = this.getChildById(childId);
    if (!child || child.parentId !== currentUser.id) {
      this.setItem(STORAGE_KEYS.ACTIVE_CHILD_ID, null);
      return null;
    }
    return child;
  }

  enterChildMode(childId: string): boolean {
    const currentUser = this.getCurrentUser();
    if (!currentUser || currentUser.role !== 'parent') {
      return false;
    }
    const child = this.getChildById(childId);
    if (!child || child.parentId !== currentUser.id) {
      return false;
    }
    this.setItem(STORAGE_KEYS.ACTIVE_CHILD_ID, childId);
    return true;
  }

  exitChildMode(): void {
    this.setItem(STORAGE_KEYS.ACTIVE_CHILD_ID, null);
  }

  // --- EXERCISES ---
  getAllExercises(): Exercise[] {
    return this.getItem<Exercise[]>(STORAGE_KEYS.EXERCISES, []);
  }

  getExercisesForTherapist(therapistId: string): Exercise[] {
    return this.getAllExercises().filter(e => e.createdByTherapistId === therapistId);
  }

  createExercise(exerciseData: Omit<Exercise, 'id' | 'createdAt'>): Exercise {
    const exercises = this.getAllExercises();
    const newEx: Exercise = {
      ...exerciseData,
      id: 'ex_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
      createdAt: new Date().toISOString(),
    };
    exercises.unshift(newEx);
    this.setItem(STORAGE_KEYS.EXERCISES, exercises);
    return newEx;
  }

  deleteExercise(exerciseId: string): boolean {
    let exercises = this.getAllExercises();
    exercises = exercises.filter(e => e.id !== exerciseId);
    this.setItem(STORAGE_KEYS.EXERCISES, exercises);
    return true;
  }

  private seedTemplatesForTherapist(therapistId: string, therapistName: string) {
    const current = this.getExercisesForTherapist(therapistId);
    if (current.length > 0) return;

    DEFAULT_EXERCISE_TEMPLATES.forEach(tpl => {
      this.createExercise({
        ...tpl,
        createdByTherapistId: therapistId,
        createdByName: therapistName,
      });
    });
  }

  // --- EXERCISE ASSIGNMENTS ---
  getAllAssignments(): ExerciseAssignment[] {
    const rawList = this.getItem<any[]>(STORAGE_KEYS.ASSIGNMENTS, []);
    const exercises = this.getAllExercises();
    const exMap = new Map<string, Exercise>(exercises.map((e) => [e.id, e]));

    return rawList.map((item) => {
      let fullExercise: Exercise;
      const found = exMap.get(item.exerciseId);
      if (found) {
        fullExercise = found;
      } else if (item.exercise && typeof item.exercise === 'object') {
        fullExercise = item.exercise;
      } else {
        fullExercise = {
          id: item.exerciseId || 'fallback_ex',
          createdByTherapistId: item.assignedByTherapistId || 'system',
          createdByName: item.assignedByTherapistName || 'Therapist',
          title: item.exerciseTitle || 'Speech Practice',
          type: 'listen_and_repeat',
          difficulty: 'easy',
          instructions: 'Practice saying this target sound clearly and with confidence!',
          category: 'Speech Practice',
          targetSound: 'S',
          targetWord: item.exerciseTitle || 'Sound Practice',
          hasCustomAudio: false,
          createdAt: item.assignedAt || new Date().toISOString(),
        };
      }

      return {
        ...item,
        exercise: fullExercise,
        exerciseTitle: item.exerciseTitle || fullExercise.title,
      };
    });
  }

  // Persist assignments compactly without duplicating heavy exercise data
  private saveAssignments(assignments: ExerciseAssignment[]): void {
    const lean = assignments.map((a) => ({
      id: a.id,
      childId: a.childId,
      exerciseId: a.exerciseId,
      exerciseTitle: a.exerciseTitle || a.exercise?.title || 'Speech Practice',
      assignedByTherapistId: a.assignedByTherapistId,
      assignedByTherapistName: a.assignedByTherapistName,
      assignedAt: a.assignedAt,
      dueDate: a.dueDate,
      repetitionsRequired: a.repetitionsRequired,
      repetitionsCompleted: a.repetitionsCompleted,
      status: a.status,
      lastPracticedAt: a.lastPracticedAt,
      bestScore: a.bestScore,
    }));
    this.setItem(STORAGE_KEYS.ASSIGNMENTS, lean);
  }

  getAssignmentsForChild(childId: string): ExerciseAssignment[] {
    return this.getAllAssignments().filter((a) => a.childId === childId);
  }

  getAssignmentsForTherapist(therapistId: string): ExerciseAssignment[] {
    return this.getAllAssignments().filter((a) => a.assignedByTherapistId === therapistId);
  }

  assignExerciseToChild(params: {
    childId: string;
    exerciseId: string;
    therapistId: string;
    therapistName: string;
    repetitionsRequired?: number;
    dueDate?: string;
  }): ExerciseAssignment {
    const exercises = this.getAllExercises();
    const exercise = exercises.find((e) => e.id === params.exerciseId);
    if (!exercise) throw new Error('Exercise not found');

    const assignments = this.getAllAssignments();
    const newAssignment: ExerciseAssignment = {
      id: 'asgn_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
      childId: params.childId,
      exerciseId: params.exerciseId,
      exerciseTitle: exercise.title,
      exercise,
      assignedByTherapistId: params.therapistId,
      assignedByTherapistName: params.therapistName,
      assignedAt: new Date().toISOString(),
      dueDate: params.dueDate,
      repetitionsRequired: params.repetitionsRequired || 3,
      repetitionsCompleted: 0,
      status: 'pending',
    };

    assignments.unshift(newAssignment);
    this.saveAssignments(assignments);
    return newAssignment;
  }

  updateAssignmentProgress(assignmentId: string, repetitionsDelta = 1, score = 100): ExerciseAssignment | null {
    const assignments = this.getAllAssignments();
    const index = assignments.findIndex((a) => a.id === assignmentId);
    if (index === -1) return null;

    const asgn = assignments[index];
    asgn.repetitionsCompleted = Math.min(asgn.repetitionsRequired, asgn.repetitionsCompleted + repetitionsDelta);
    asgn.lastPracticedAt = new Date().toISOString();
    asgn.bestScore = Math.max(asgn.bestScore || 0, score);

    if (asgn.repetitionsCompleted >= asgn.repetitionsRequired) {
      asgn.status = 'completed';
    } else {
      asgn.status = 'in_progress';
    }

    assignments[index] = asgn;
    this.saveAssignments(assignments);
    return asgn;
  }

  private autoAssignStarterQuests(child: ChildProfile) {
    let exercises = this.getAllExercises();
    if (exercises.length === 0) {
      // Create system exercises for immediate fun practice
      DEFAULT_EXERCISE_TEMPLATES.forEach((tpl) => {
        this.createExercise({
          ...tpl,
          createdByTherapistId: 'system_slp',
          createdByName: 'Speech Play Certified Clinical Team',
        });
      });
      exercises = this.getAllExercises();
    }

    // Assign at least 2 relevant exercises to get started
    exercises.slice(0, 3).forEach((ex) => {
      this.assignExerciseToChild({
        childId: child.id,
        exerciseId: ex.id,
        therapistId: child.therapistId || 'system_slp',
        therapistName: child.therapistName || 'Speech Practice Guide',
        repetitionsRequired: 3,
      });
    });
  }

  // --- SPEECH ATTEMPTS & ERROR TRACKING ---
  getAllAttempts(): SpeechAttempt[] {
    return this.getItem<SpeechAttempt[]>(STORAGE_KEYS.ATTEMPTS, []);
  }

  getAttemptsForChild(childId: string): SpeechAttempt[] {
    return this.getAllAttempts().filter((a) => a.childId === childId);
  }

  getAttemptsForTherapist(therapistId: string): SpeechAttempt[] {
    const assignments = this.getAssignmentsForTherapist(therapistId);
    const childIds = new Set(assignments.map((a) => a.childId));
    return this.getAllAttempts().filter((a) => childIds.has(a.childId));
  }

  recordSpeechAttempt(attemptData: Omit<SpeechAttempt, 'id' | 'timestamp'>): SpeechAttempt {
    const attempts = this.getAllAttempts();
    const newAttempt: SpeechAttempt = {
      ...attemptData,
      id: 'att_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
      timestamp: new Date().toISOString(),
    };
    attempts.unshift(newAttempt);
    // Cap attempts at 80 items to prevent unbounded growth in localStorage
    if (attempts.length > 80) {
      attempts.splice(80);
    }
    this.setItem(STORAGE_KEYS.ATTEMPTS, attempts);
    return newAttempt;
  }

  // Insight Generator: Surfaces repeated difficulties factually without clinical diagnosis
  getRepeatedErrorInsights(childId: string): RepeatedErrorInsight[] {
    const attempts = this.getAttemptsForChild(childId);
    const soundErrorCounts: Record<string, {
      count: number;
      errorType: SpeechErrorType;
      lastDate: string;
      targets: Set<string>;
    }> = {};

    attempts.forEach(att => {
      if (!att.isCorrect && att.errorType) {
        const key = `${att.targetSound}_${att.errorType}`;
        if (!soundErrorCounts[key]) {
          soundErrorCounts[key] = {
            count: 0,
            errorType: att.errorType,
            lastDate: att.timestamp,
            targets: new Set<string>(),
          };
        }
        soundErrorCounts[key].count++;
        soundErrorCounts[key].targets.add(att.target);
      }
    });

    const insights: RepeatedErrorInsight[] = [];
    Object.entries(soundErrorCounts).forEach(([key, val]) => {
      if (val.count >= 2) {
        const [sound] = key.split('_');
        const readableType = val.errorType.replace('_', ' ');
        insights.push({
          targetSound: sound,
          errorType: val.errorType,
          frequency: val.count,
          lastDetected: val.lastDate,
          sampleTargets: Array.from(val.targets).slice(0, 3),
          observationSummary: `Repeated practice difficulty detected for target sound /${sound}/ with ${readableType} observed across ${val.count} attempts.`,
        });
      }
    });

    return insights;
  }

  // --- DEMO / QUICK START TOUR PREPARATION ---
  // A clean test setup that allows instant preview of all 3 roles (Parent, Child, Therapist) without hardcoded static display
  seedDemoEnvironment(): { parentEmail: string; therapistEmail: string } {
    // Check if test users exist
    const users = this.getAllUsers();
    let parent = users.find(u => u.email === 'sarah.parent@speechplay.demo');
    let therapist = users.find(u => u.email === 'dr.elena.slp@speechplay.demo');

    if (!parent) {
      const res = this.registerUser({
        role: 'parent',
        name: 'Sarah Mitchell',
        email: 'sarah.parent@speechplay.demo',
        password: 'password123',
      });
      parent = res.user!;

      // Add child for Sarah
      const child = this.createChildProfile({
        parentId: parent.id,
        name: 'Leo',
        age: 6,
        grade: '1st Grade',
        preferredLanguage: 'English',
        avatarIcon: '🦁',
        speechPracticeType: ['Articulation (/r/ & /s/)', 'Phonological awareness'],
        targetSounds: ['S', 'R', 'L'],
        currentWords: ['Sun', 'Rocket', 'Star', 'Lion'],
        parentGoals: 'Improve pronunciation of /s/ and /r/ blends during school speaking',
        therapistName: 'Dr. Elena Vance, CCC-SLP',
        therapistClinic: 'Sunny Hills Pediatric Speech Clinic',
      });

      // Seed 2 practice attempts to illustrate analytics
      this.recordSpeechAttempt({
        childId: child.id,
        childName: child.name,
        exerciseId: 'demo_ex1',
        exerciseTitle: 'Sun & Sky',
        target: 'Sun',
        targetSound: 'S',
        recognizedResponse: 'Thun',
        isCorrect: false,
        accuracyScore: 58,
        confidence: 0.88,
        errorType: 'sound_substitution',
        detectedSound: 'TH',
        attemptNumber: 1,
        verificationMethod: 'speech_verified',
      });

      this.recordSpeechAttempt({
        childId: child.id,
        childName: child.name,
        exerciseId: 'demo_ex1',
        exerciseTitle: 'Sun & Sky',
        target: 'Sun',
        targetSound: 'S',
        recognizedResponse: 'Sun',
        isCorrect: true,
        accuracyScore: 96,
        confidence: 0.94,
        attemptNumber: 2,
        verificationMethod: 'speech_verified',
      });
    }

    if (!therapist) {
      const res = this.registerUser({
        role: 'therapist',
        name: 'Dr. Elena Vance, CCC-SLP',
        email: 'dr.elena.slp@speechplay.demo',
        password: 'password123',
        clinicOrOrganization: 'Sunny Hills Pediatric Speech Clinic',
      });
      therapist = res.user!;
    }

    return {
      parentEmail: 'sarah.parent@speechplay.demo',
      therapistEmail: 'dr.elena.slp@speechplay.demo',
    };
  }
}

export const storage = new StorageService();
