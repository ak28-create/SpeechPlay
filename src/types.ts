export type UserRole = 'parent' | 'therapist' | 'child';

export interface User {
  id: string;
  role: 'parent' | 'therapist';
  email: string;
  name: string;
  password?: string;
  clinicOrOrganization?: string;
  createdAt: string;
}

export interface ChildProfile {
  id: string;
  parentId: string;
  name: string;
  age: number;
  grade?: string;
  preferredLanguage: string;
  avatarIcon: string;
  speechPracticeType?: string[];
  targetSounds?: string[];
  currentWords?: string[];
  parentGoals?: string;
  therapistId?: string;
  therapistName?: string;
  therapistClinic?: string;
  createdAt: string;
  // Gamification stats
  stars: number;
  xp: number;
  streak: number;
  hearts: number;
  level: number;
  completedQuestsCount: number;
}

export type ExerciseType = 
  | 'listen_and_repeat'
  | 'picture_naming'
  | 'sound_practice'
  | 'sentence_practice'
  | 'sound_hunt';

export type ExerciseDifficulty = 'easy' | 'medium' | 'hard';

export interface Exercise {
  id: string;
  createdByTherapistId: string;
  createdByName: string;
  title: string;
  type: ExerciseType;
  difficulty: ExerciseDifficulty;
  instructions: string;
  description?: string;
  category: string;
  targetSound: string;
  targetWord: string;
  targetSentence?: string;
  phoneticGuide?: string;
  imageUrl?: string;
  audioUrl?: string; // Reference pronunciation (uploaded or recorded)
  hasCustomAudio: boolean;
  createdAt: string;
}

export interface ExerciseAssignment {
  id: string;
  childId: string;
  exerciseId: string;
  exerciseTitle: string;
  exercise: Exercise;
  assignedByTherapistId: string;
  assignedByTherapistName: string;
  assignedAt: string;
  dueDate?: string;
  repetitionsRequired: number;
  repetitionsCompleted: number;
  status: 'pending' | 'in_progress' | 'completed';
  lastPracticedAt?: string;
  bestScore?: number;
}

export type SpeechErrorType =
  | 'sound_substitution'
  | 'sound_omission'
  | 'extra_sound'
  | 'incorrect_word'
  | 'missing_word'
  | 'incomplete_response'
  | 'low_confidence'
  | 'no_speech_detected';

export interface SpeechAttempt {
  id: string;
  childId: string;
  childName: string;
  assignmentId?: string;
  exerciseId: string;
  exerciseTitle: string;
  target: string;
  targetSound: string;
  recognizedResponse: string;
  isCorrect: boolean;
  accuracyScore: number; // 0-100
  confidence: number; // 0-1
  errorType?: SpeechErrorType;
  detectedSound?: string;
  attemptNumber: number;
  verificationMethod: 'speech_verified' | 'manual_practice';
  timestamp: string;
  therapistNotes?: string;
}

export interface RepeatedErrorInsight {
  targetSound: string;
  errorType: SpeechErrorType;
  frequency: number;
  lastDetected: string;
  sampleTargets: string[];
  observationSummary: string;
}
