# 🗣️ Speech Play — Gamified Speech Therapy Platform

> A playful, Duolingo-inspired speech therapy application designed for children, parents, and Speech-Language Pathologists (SLPs). Features real-time voice recognition, phonetic pronunciation feedback, custom clinician exercise creation, and an engaging reward system.

---

## 🌟 Overview

**Speech Play** transforms repetitive speech and articulation drills into an exciting daily quest. Inspired by Duolingo's friendly gamification mechanics (3D pushable buttons, streak counters, XP points, star milestones, and confetti celebrations), the application provides a safe, connected ecosystem for three distinct roles:

1. **Parents**: Oversee their children's progress, configure profiles via a structured onboarding enquiry, and securely manage access to Child Mode.
2. **Children**: Embark on interactive voice quests along a winding path, practicing target sounds through an encouraging *Listen → Say It → Practice → Earn Rewards* loop.
3. **Therapists (SLPs)**: Access a clinical dashboard, analyze practice logs and repeated pronunciation difficulties, create custom exercises with visual and audio references, and assign tailored homework.

---

## ✨ Key Features

### 🎮 1. Child Mode & Quest Experience
- **Winding Quest Path**: Duolingo-style stepped path with unlocked/completed nodes, difficulty indicators, and milestone chests.
- **5-Step Practice Loop**:
  - 👂 **Listen**: Hear crisp reference pronunciations (speech synthesis or custom clinician voice recordings).
  - 🗣️ **Say It**: Real-time microphone listening with animated sound wave pulses and live transcript feedback.
  - 🎯 **Analyze**: Phonetic matching and Levenshtein distance analysis comparing spoken audio with the target word.
  - ⭐ **Earn Rewards**: Immediate XP gains, stars, streak maintenance, and animated confetti bursts.
  - 🏆 **Complete**: Gentle, growth-oriented feedback (*"🎉 Great job!"* or *"🌱 Almost there! Let's try again"*).
- **Safe & Distraction-Free**: Children have no independent passwords or external browsing; access is safely unlocked through the authenticated parent portal.

### 👨‍👩‍👧 2. Parent Gateway & Enquiry Onboarding
- **Multi-Child Roster**: Manage multiple children under a single parent account.
- **"Let's Get to Know Your Child" Enquiry**: A 4-step onboarding flow capturing:
  - Child details (name, age, grade, language, avatar mascot).
  - Speech focus (articulation, fluency, phonology, target sounds, parent goals).
  - Linked clinician / speech clinic (optional).
  - Instant starter quest assignment.
- **Parental Insights**: High-level practice history, accuracy statistics, and recent speech logs.

### 🩺 3. Clinician Portal & Manual Exercise Creator
- **Dedicated SLP Dashboard**: Overview of enrolled children, total attempts, overall success rates, and detailed practice attempt logs.
- **Repeated Practice Difficulty Detection**: Factually flags consistent substitution or omission patterns across sessions (e.g., */s/* replaced with *th*) to assist clinical planning without automated diagnostic labeling.
- **Manual Exercise Creator**:
  - Custom target sound, word, sentence, instructions, and phonetic guide.
  - **Image Upload**: Upload device images with automatic client-side canvas compression (<30KB) to prevent storage bloat.
  - **Audio Upload**: Attach reference MP3/WAV files (with 1MB safeguard).
  - **Browser Voice Recording**: Clinicians can record reference audio directly in their browser using their microphone.
  - **Live Preview & Quick Assignment**: Preview the exact child quest view and assign immediately to enrolled children.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| **Build Tool** | [Vite](https://vitejs.dev/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) + Custom 3D Button Utility Classes |
| **Animations** | [Motion](https://motion.dev/) + [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Speech Audio** | Web Speech API (`SpeechRecognition` & `SpeechSynthesis`) + Web Audio API |
| **Typography** | Google Fonts (*Fredoka* for display, *Nunito* for body readability) |
| **Persistence** | LocalStorage with lean relational indexing, quota recovery, and memory fallback |

---

## 📁 Project Structure

```text
/
├── public/                     # Static assets
├── src/
│   ├── components/
│   │   ├── ChildMode/
│   │   │   ├── ChildMode.tsx          # Winding quest path & adventurer dashboard
│   │   │   └── VoiceTrainerModal.tsx  # Interactive mic recording & feedback loop
│   │   ├── Therapist/
│   │   │   ├── ExerciseCreatorModal.tsx # Manual exercise builder (media upload/record)
│   │   │   ├── TherapistAuthModal.tsx   # Clinician registration & login
│   │   │   └── TherapistDashboard.tsx   # Practice analytics & difficulty detection
│   │   ├── ChildEnquiryModal.tsx      # "Let's Get to Know Your Child" onboarding
│   │   ├── LandingPage.tsx            # Welcome screen & quick demo selector
│   │   ├── Navbar.tsx                 # Adaptive navigation & child/parent switch
│   │   ├── ParentAuthModal.tsx        # Parent login & registration
│   │   └── ParentDashboard.tsx        # Parent overview & Child Mode launcher
│   ├── services/
│   │   ├── soundEffects.ts            # Web Audio synthesized chime & fanfare sounds
│   │   ├── speech.ts                  # Web Speech API & phonetic similarity engine
│   │   └── storage.ts                 # Persistence service & quota recovery
│   ├── utils/
│   │   └── imageCompressor.ts         # Client-side HTML5 canvas image optimizer
│   ├── types.ts                       # Shared TypeScript interfaces & enums
│   ├── App.tsx                        # Root orchestrator & role-based routing
│   ├── main.tsx                       # React application entry point
│   └── index.css                      # Tailwind styles & 3D button utility classes
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18.0 or higher recommended)
- A modern web browser supporting microphone access and the Web Speech API (Chrome, Edge, or Safari).

### Installation

1. **Clone or navigate to the repository**:
   ```bash
   cd speech-play
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open in your browser**:
   Navigate to `http://localhost:3000` (or the URL printed in your terminal).

---

## 🧪 Interactive Demo Tour

For quick evaluation without manual registration, tap **"Launch Guided Tour"** on the landing page to load a connected demo environment:
- **Child Quest Experience**: Jump directly into Leo's active quest path with voice practice.
- **Parent Dashboard**: Review Leo's streaks, assigned speech goals, and child switching.
- **Therapist Clinician Portal**: Explore Dr. Vance's clinical logs, sound difficulty metrics, and custom exercise creation.

---

## 🎙️ Speech Recognition Notes & Permissions

- **Microphone Permission**: The browser will prompt for microphone access during speech practice or voice recording. Please allow permission for live recognition.
- **Offline / Fallback Support**: If microphone access is unavailable or unsupported in the current browser, the app automatically offers a graceful manual practice fallback to ensure children can continue practicing without interruption.

---

## 📄 License

This project is a hackathon prototype developed for educational and demonstration purposes.
