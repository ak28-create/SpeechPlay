import { SpeechErrorType } from '../types';

export interface SpeechAnalysisResult {
  recognizedText: string;
  isCorrect: boolean;
  accuracyScore: number; // 0 - 100
  confidence: number;
  errorType?: SpeechErrorType;
  targetSound: string;
  detectedSound?: string;
  feedbackMessage: string;
  verificationMethod: 'speech_verified' | 'manual_practice';
}

// Levenshtein distance algorithm for phonetic/string distance
function calculateLevenshtein(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

class SpeechService {
  private currentAudio: HTMLAudioElement | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];

  // Check Web Speech Recognition support
  isSpeechRecognitionSupported(): boolean {
    if (typeof window === 'undefined') return false;
    const win = window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown };
    return !!(win.SpeechRecognition || win.webkitSpeechRecognition);
  }

  // --- AUDIO PLAYBACK (LISTEN STEP) ---
  playPronunciation(
    text: string,
    customAudioUrl?: string,
    onEnd?: () => void
  ): { stop: () => void } {
    this.stopPlayback();

    if (customAudioUrl && customAudioUrl.length > 20) {
      // Play custom therapist uploaded or recorded audio
      const audio = new Audio(customAudioUrl);
      this.currentAudio = audio;
      audio.onended = () => {
        this.currentAudio = null;
        if (onEnd) onEnd();
      };
      audio.onerror = () => {
        console.warn('Audio URL playback failed, falling back to speech synthesis');
        this.speakSynthesis(text, onEnd);
      };
      audio.play().catch(e => {
        console.warn('Audio play error, falling back:', e);
        this.speakSynthesis(text, onEnd);
      });

      return {
        stop: () => this.stopPlayback()
      };
    } else {
      // Browser Web Speech Synthesis fallback
      this.speakSynthesis(text, onEnd);
      return {
        stop: () => this.stopPlayback()
      };
    }
  }

  private speakSynthesis(text: string, onEnd?: () => void) {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      if (onEnd) setTimeout(onEnd, 1000);
      return;
    }
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.85; // Slightly slower, child-friendly cadence
    utterance.pitch = 1.1; // Friendly, slightly higher educational pitch

    // Try selecting friendly English voice
    const voices = window.speechSynthesis.getVoices();
    const friendlyVoice = voices.find(v => 
      v.lang.startsWith('en') && (v.name.includes('Samantha') || v.name.includes('Google') || v.name.includes('Natural'))
    );
    if (friendlyVoice) {
      utterance.voice = friendlyVoice;
    }

    utterance.onend = () => {
      if (onEnd) onEnd();
    };
    utterance.onerror = () => {
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
  }

  stopPlayback() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }

  // --- AUDIO RECORDER (FOR THERAPISTS CREATING EXERCISES) ---
  async startRecordingAudio(): Promise<MediaStream> {
    this.recordedChunks = [];
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    let options: MediaRecorderOptions | undefined;
    if (typeof MediaRecorder !== 'undefined') {
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        options = { mimeType: 'audio/webm;codecs=opus', audioBitsPerSecond: 32000 };
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        options = { mimeType: 'audio/mp4', audioBitsPerSecond: 32000 };
      }
    }

    this.mediaRecorder = options ? new MediaRecorder(stream, options) : new MediaRecorder(stream);

    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        this.recordedChunks.push(e.data);
      }
    };

    this.mediaRecorder.start();
    return stream;
  }

  stopRecordingAudio(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No recording in progress'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.recordedChunks, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          resolve(base64Audio);
        };
        reader.onerror = (err) => reject(err);

        // Stop all audio tracks
        if (this.mediaRecorder && this.mediaRecorder.stream) {
          this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
        }
      };

      this.mediaRecorder.stop();
    });
  }

  // --- CHILD SPEECH RECOGNITION & ANALYSIS ---
  startChildSpeechRecognition(params: {
    target: string;
    targetSound: string;
    language?: string;
    onInterim?: (interim: string) => void;
    onVolumeChange?: (volume: number) => void;
    onResult: (result: SpeechAnalysisResult) => void;
    onError: (errorMessage: string) => void;
  }): { stop: () => void } {
    const { target, targetSound, language = 'en-US', onInterim, onResult, onError } = params;

    const win = window as unknown as {
      SpeechRecognition?: any;
      webkitSpeechRecognition?: any;
    };
    const SpeechRecognitionAPI = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      onError('Speech recognition is not supported in this browser. You can still practice and complete manually!');
      return { stop: () => {} };
    }

    let recognition: any;
    try {
      recognition = new SpeechRecognitionAPI();
    } catch (e) {
      onError('Unable to start speech recognition. Please check microphone permissions.');
      return { stop: () => {} };
    }

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = language;
    recognition.maxAlternatives = 3;

    let finalSpokenText = '';
    let highestConfidence = 0.85;

    recognition.onresult = (event: any) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const item = event.results[i][0];
        if (event.results[i].isFinal) {
          finalSpokenText = item.transcript;
          highestConfidence = item.confidence || 0.85;
        } else {
          interim += item.transcript;
        }
      }
      if (onInterim && interim) {
        onInterim(interim);
      }
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition event error:', event.error);
      if (event.error === 'not-allowed') {
        onError("Microphone permission was denied. Please allow microphone access in your browser, or tap 'Practice Without Mic'.");
      } else if (event.error === 'no-speech') {
        // Handled in onend
      } else {
        onError(`Speech recognition notice: ${event.error}. You can try again!`);
      }
    };

    recognition.onend = () => {
      const cleanRecognized = finalSpokenText.trim();
      const analysis = this.analyzePronunciation(cleanRecognized, target, targetSound, highestConfidence);
      onResult(analysis);
    };

    try {
      recognition.start();
    } catch (e) {
      onError('Microphone was already listening or active. Please try again.');
    }

    return {
      stop: () => {
        try {
          recognition.stop();
        } catch {
          // ignore
        }
      }
    };
  }

  // Pure logic analyzer comparing target vs spoken utterance
  analyzePronunciation(
    spoken: string,
    target: string,
    targetSound: string,
    confidence: number
  ): SpeechAnalysisResult {
    const normSpoken = spoken.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '').trim();
    const normTarget = target.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '').trim();

    if (!normSpoken) {
      return {
        recognizedText: '',
        isCorrect: false,
        accuracyScore: 0,
        confidence: 0,
        errorType: 'no_speech_detected',
        targetSound,
        feedbackMessage: "We didn't hear you clearly. Let's try saying it together!",
        verificationMethod: 'speech_verified',
      };
    }

    const distance = calculateLevenshtein(normSpoken, normTarget);
    const maxLength = Math.max(normSpoken.length, normTarget.length);
    const similarity = Math.max(0, 1 - distance / maxLength);
    const accuracyScore = Math.round(similarity * 100);

    // Phonetic & sound substitution inspection
    let detectedSound: string | undefined = undefined;
    let errorType: SpeechErrorType | undefined = undefined;

    // Check common substitution patterns
    const cleanSound = targetSound.toUpperCase();
    if (cleanSound === 'S' && (normSpoken.startsWith('th') || normSpoken.includes('th'))) {
      detectedSound = 'TH';
      errorType = 'sound_substitution';
    } else if (cleanSound === 'R' && (normSpoken.startsWith('w') || normSpoken.includes('w'))) {
      detectedSound = 'W';
      errorType = 'sound_substitution';
    } else if (cleanSound === 'L' && (normSpoken.startsWith('y') || normSpoken.startsWith('w'))) {
      detectedSound = 'Y';
      errorType = 'sound_substitution';
    } else if (cleanSound === 'TH' && (normSpoken.startsWith('f') || normSpoken.startsWith('s') || normSpoken.startsWith('d'))) {
      detectedSound = normSpoken.substring(0, 1).toUpperCase();
      errorType = 'sound_substitution';
    } else if (cleanSound === 'CH' && normSpoken.startsWith('sh')) {
      detectedSound = 'SH';
      errorType = 'sound_substitution';
    } else if (normSpoken.length < normTarget.length * 0.6) {
      errorType = 'incomplete_response';
    } else if (normSpoken.length > normTarget.length * 1.6) {
      errorType = 'extra_sound';
    } else if (accuracyScore < 70) {
      errorType = 'incorrect_word';
    }

    const isCorrect = accuracyScore >= 75 || normSpoken === normTarget;

    let feedbackMessage = '';
    if (isCorrect) {
      const positivePraisings = [
        '🎉 Fantastic job! Clear and bright sound!',
        '⭐ Super star! That was wonderful pronunciation!',
        '✨ You did it! Keep up the brilliant practice!',
        '🌟 High five! Your sound is getting so strong!',
      ];
      feedbackMessage = positivePraisings[Math.floor(Math.random() * positivePraisings.length)];
    } else {
      const gentleEncouragements = [
        '🌱 Almost there! Listen closely and let’s give it another go!',
        '💪 Great try! You are getting closer every time!',
        '👂 Nice effort! Press Listen once more, then say it together!',
        '🌈 You’re doing great! Let’s practice that sound one more time!',
      ];
      feedbackMessage = gentleEncouragements[Math.floor(Math.random() * gentleEncouragements.length)];
    }

    return {
      recognizedText: spoken,
      isCorrect,
      accuracyScore,
      confidence,
      errorType: isCorrect ? undefined : (errorType || 'sound_substitution'),
      targetSound,
      detectedSound,
      feedbackMessage,
      verificationMethod: 'speech_verified',
    };
  }

  // Create manual practice completion record
  createManualResult(target: string, targetSound: string): SpeechAnalysisResult {
    return {
      recognizedText: target,
      isCorrect: true,
      accuracyScore: 85,
      confidence: 1.0,
      targetSound,
      feedbackMessage: '🎉 Great practice! Every repetition builds your speech confidence!',
      verificationMethod: 'manual_practice',
    };
  }
}

export const speechService = new SpeechService();
