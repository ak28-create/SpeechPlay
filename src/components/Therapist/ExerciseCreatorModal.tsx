import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Exercise, ExerciseType, ExerciseDifficulty, ChildProfile } from '../../types';
import { speechService } from '../../services/speech';
import { storage } from '../../services/storage';
import { sounds } from '../../services/soundEffects';
import { compressImage } from '../../utils/imageCompressor';
import { 
  X, 
  Upload, 
  Mic, 
  Play, 
  Square, 
  Image as ImageIcon, 
  Volume2, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles,
  Eye,
  Trash2,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

interface ExerciseCreatorModalProps {
  isOpen: boolean;
  therapistId: string;
  therapistName: string;
  childrenList: ChildProfile[];
  onClose: () => void;
  onExerciseCreated: (exercise: Exercise) => void;
}

export const ExerciseCreatorModal: React.FC<ExerciseCreatorModalProps> = ({
  isOpen,
  therapistId,
  therapistName,
  childrenList,
  onClose,
  onExerciseCreated,
}) => {
  // Mode: 'form' | 'preview' | 'assign'
  const [currentView, setCurrentView] = useState<'form' | 'preview' | 'assign'>('form');

  // Basic Information
  const [title, setTitle] = useState('');
  const [type, setType] = useState<ExerciseType>('listen_and_repeat');
  const [difficulty, setDifficulty] = useState<ExerciseDifficulty>('easy');
  const [category, setCategory] = useState('Sibilants & Fricatives');
  const [instructions, setInstructions] = useState('');
  const [description, setDescription] = useState('');
  const [targetSound, setTargetSound] = useState('S');
  const [targetWord, setTargetWord] = useState('');
  const [targetSentence, setTargetSentence] = useState('');
  const [phoneticGuide, setPhoneticGuide] = useState('');

  // Media: Image
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  // Media: Audio (Upload or Record)
  const [audioUrl, setAudioUrl] = useState<string | undefined>(undefined);
  const audioInputRef = useRef<HTMLInputElement | null>(null);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);

  // Assign Step
  const [createdExercise, setCreatedExercise] = useState<Exercise | null>(null);
  const [selectedChildId, setSelectedChildId] = useState<string>(childrenList[0]?.id || '');
  const [repetitionsRequired, setRepetitionsRequired] = useState(3);
  const [formError, setFormError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Handle Image Upload with client-side compression to prevent storage quota exhaustion
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressedDataUrl = await compressImage(file, 400, 400, 0.8);
      setImageUrl(compressedDataUrl);
      sounds.playSuccess();
    } catch (err) {
      console.warn('Image compression fallback:', err);
      const reader = new FileReader();
      reader.onload = () => {
        setImageUrl(reader.result as string);
        sounds.playSuccess();
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Audio Upload with size safeguard
  const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Disallow files > 1MB to preserve storage budget
    if (file.size > 1024 * 1024) {
      setFormError('Audio file is too large (max 1MB). Please upload a shorter reference clip or record directly with the microphone.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAudioUrl(reader.result as string);
      sounds.playSuccess();
    };
    reader.readAsDataURL(file);
  };

  // Handle Browser Audio Recording
  const handleToggleRecordAudio = async () => {
    if (!isRecordingAudio) {
      try {
        await speechService.startRecordingAudio();
        setIsRecordingAudio(true);
        sounds.playClick();
      } catch (err) {
        setFormError('Microphone access denied or not supported for in-browser recording.');
      }
    } else {
      try {
        const recordedBase64 = await speechService.stopRecordingAudio();
        setIsRecordingAudio(false);
        setAudioUrl(recordedBase64);
        sounds.playSuccess();
      } catch (err) {
        setIsRecordingAudio(false);
        setFormError('Failed to save recorded audio.');
      }
    }
  };

  // Audio Playback
  const handlePlayAudio = () => {
    if (!audioUrl) return;
    if (isPlayingAudio) {
      if (activeAudioRef.current) {
        activeAudioRef.current.pause();
        setIsPlayingAudio(false);
      }
      return;
    }

    const audio = new Audio(audioUrl);
    activeAudioRef.current = audio;
    setIsPlayingAudio(true);
    audio.onended = () => setIsPlayingAudio(false);
    audio.onerror = () => setIsPlayingAudio(false);
    audio.play();
  };

  // Form Validation & Move to Preview
  const handleGoToPreview = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim()) {
      setFormError('Please enter an exercise title.');
      return;
    }
    if (!targetWord.trim()) {
      setFormError('Please enter the target practice word.');
      return;
    }
    if (!instructions.trim()) {
      setFormError('Please enter simple instructions for the child.');
      return;
    }

    sounds.playClick();
    setCurrentView('preview');
  };

  // Save Exercise
  const handleSaveExercise = () => {
    const newEx = storage.createExercise({
      createdByTherapistId: therapistId,
      createdByName: therapistName,
      title: title.trim(),
      type,
      difficulty,
      category: category.trim(),
      instructions: instructions.trim(),
      description: description.trim(),
      targetSound: targetSound.toUpperCase().trim(),
      targetWord: targetWord.trim(),
      targetSentence: targetSentence.trim() || undefined,
      phoneticGuide: phoneticGuide.trim() || undefined,
      imageUrl,
      audioUrl,
      hasCustomAudio: !!audioUrl,
    });

    setCreatedExercise(newEx);
    sounds.playFanfare();
    onExerciseCreated(newEx);

    // If children exist, offer immediate assignment
    if (childrenList.length > 0) {
      setCurrentView('assign');
    } else {
      onClose();
    }
  };

  // Assign to child
  const handleAssignToChild = () => {
    if (!createdExercise || !selectedChildId) {
      onClose();
      return;
    }

    storage.assignExerciseToChild({
      childId: selectedChildId,
      exerciseId: createdExercise.id,
      therapistId,
      therapistName,
      repetitionsRequired,
    });

    sounds.playSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/65 backdrop-blur-xs overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-blue-100 relative my-6"
      >
        {/* Close Button */}
        <button
          onClick={() => {
            sounds.playClick();
            onClose();
          }}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <span className="text-xs font-black uppercase tracking-wider text-blue-700 bg-blue-100 px-3 py-1 rounded-full">
            SLP Clinical Exercise Creator
          </span>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 mt-1">
            {currentView === 'form' && 'Create Practice Exercise'}
            {currentView === 'preview' && 'Preview Exercise (Child View)'}
            {currentView === 'assign' && 'Assign Exercise to Child'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            {currentView === 'form' && 'Set custom speech targets, instructions, images, and reference voice audio.'}
            {currentView === 'preview' && 'Review how this quest appears to children before saving.'}
            {currentView === 'assign' && 'Select an enrolled child to immediately assign this quest.'}
          </p>
        </div>

        {formError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* VIEW 1: MANUAL EXERCISE FORM */}
        {currentView === 'form' && (
          <form onSubmit={handleGoToPreview} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Exercise Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Sunny Day /S/ Practice"
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none text-sm font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Exercise Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as ExerciseType)}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none text-sm font-semibold text-slate-800"
                >
                  <option value="listen_and_repeat">Listen & Repeat</option>
                  <option value="picture_naming">Picture Naming</option>
                  <option value="sound_practice">Sound Practice</option>
                  <option value="sentence_practice">Sentence Practice</option>
                  <option value="sound_hunt">Sound Hunt</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Target Sound *
                </label>
                <input
                  type="text"
                  required
                  value={targetSound}
                  onChange={(e) => setTargetSound(e.target.value)}
                  placeholder="e.g. S, R, L, TH"
                  className="w-full px-4 py-2 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none text-sm font-black text-blue-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Target Word *
                </label>
                <input
                  type="text"
                  required
                  value={targetWord}
                  onChange={(e) => setTargetWord(e.target.value)}
                  placeholder="e.g. Sun"
                  className="w-full px-4 py-2 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none text-sm font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Difficulty
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as ExerciseDifficulty)}
                  className="w-full px-4 py-2 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none text-sm font-semibold text-slate-800"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Phonetic Guide (Optional)
                </label>
                <input
                  type="text"
                  value={phoneticGuide}
                  onChange={(e) => setPhoneticGuide(e.target.value)}
                  placeholder="e.g. /sʌn/"
                  className="w-full px-4 py-2 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none text-xs sm:text-sm text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Target Sentence (Optional)
                </label>
                <input
                  type="text"
                  value={targetSentence}
                  onChange={(e) => setTargetSentence(e.target.value)}
                  placeholder="e.g. The sun shines brightly."
                  className="w-full px-4 py-2 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none text-xs sm:text-sm text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Child Instructions *
              </label>
              <textarea
                rows={2}
                required
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="e.g. Place your tongue behind your top front teeth and say a bright hissing 'S'!"
                className="w-full px-4 py-2 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none text-xs sm:text-sm text-slate-800"
              />
            </div>

            {/* MEDIA UPLOAD SECTION: IMAGE & AUDIO */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <h4 className="font-display font-bold text-xs uppercase tracking-wider text-slate-700">
                Exercise Media (Image & Audio)
              </h4>

              {/* IMAGE UPLOAD */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">
                  Visual Image (Upload from device - JPG, PNG, WEBP)
                </label>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleImageFileChange}
                  className="hidden"
                />

                {imageUrl ? (
                  <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200">
                    <img src={imageUrl} alt="preview" className="w-12 h-12 rounded-lg object-cover" />
                    <span className="text-xs text-slate-700 font-semibold flex-1 truncate">
                      Custom Image Attached
                    </span>
                    <button
                      type="button"
                      onClick={() => imageInputRef.current?.click()}
                      className="text-xs font-bold text-blue-600 hover:underline"
                    >
                      Replace
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageUrl(undefined)}
                      className="text-xs font-bold text-rose-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-400 bg-white text-xs font-bold text-slate-600 flex items-center justify-center gap-2 cursor-pointer hover:bg-blue-50/30 transition-colors"
                  >
                    <Upload className="w-4 h-4 text-blue-500" />
                    <span>Upload Image from Device</span>
                  </button>
                )}
              </div>

              {/* AUDIO UPLOAD & RECORDING */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">
                  Reference Pronunciation Audio (Upload MP3/WAV or Record in browser)
                </label>
                <input
                  ref={audioInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioFileChange}
                  className="hidden"
                />

                {audioUrl ? (
                  <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200">
                    <button
                      type="button"
                      onClick={handlePlayAudio}
                      className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center cursor-pointer hover:bg-blue-200"
                    >
                      {isPlayingAudio ? <Square className="w-3.5 h-3.5 fill-blue-600" /> : <Play className="w-3.5 h-3.5 fill-blue-600 ml-0.5" />}
                    </button>
                    <span className="text-xs text-slate-700 font-semibold flex-1 truncate">
                      Custom Reference Audio Attached
                    </span>
                    <button
                      type="button"
                      onClick={() => audioInputRef.current?.click()}
                      className="text-xs font-bold text-blue-600 hover:underline"
                    >
                      Replace
                    </button>
                    <button
                      type="button"
                      onClick={() => setAudioUrl(undefined)}
                      className="text-xs font-bold text-rose-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => audioInputRef.current?.click()}
                      className="py-2.5 px-3 rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-400 bg-white text-xs font-bold text-slate-600 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Upload className="w-4 h-4 text-blue-500" />
                      <span>Upload Audio</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleToggleRecordAudio}
                      className={`py-2.5 px-3 rounded-xl border-2 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                        isRecordingAudio
                          ? 'border-rose-500 bg-rose-50 text-rose-700 animate-pulse'
                          : 'border-slate-300 bg-white text-slate-600 hover:border-rose-400'
                      }`}
                    >
                      <Mic className={`w-4 h-4 ${isRecordingAudio ? 'text-rose-600' : 'text-slate-500'}`} />
                      <span>{isRecordingAudio ? 'Stop Recording' : 'Record Audio'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="btn-3d-blue text-white font-extrabold text-sm px-6 py-3 rounded-2xl flex items-center gap-2 cursor-pointer"
              >
                <span>Preview Exercise</span>
                <Eye className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* VIEW 2: EXERCISE PREVIEW (CHILD VIEW) */}
        {currentView === 'preview' && (
          <div className="space-y-4">
            <div className="rounded-3xl bg-radial from-sky-50 to-blue-50/70 border-2 border-sky-100 p-6 text-center space-y-4 shadow-inner">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white text-blue-800 text-xs font-bold shadow-2xs">
                <span>Quest: {title}</span>
                <span>•</span>
                <span>Sound /{targetSound}/</span>
              </div>

              {imageUrl ? (
                <div className="w-28 h-28 mx-auto rounded-2xl overflow-hidden border-2 border-white shadow-md">
                  <img src={imageUrl} alt={targetWord} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="text-6xl select-none">🎯</div>
              )}

              <div>
                <h3 className="font-display font-black text-4xl text-slate-900 tracking-wide">
                  {targetWord}
                </h3>
                {phoneticGuide && (
                  <p className="text-xs font-bold text-sky-700 mt-0.5">{phoneticGuide}</p>
                )}
                {targetSentence && (
                  <p className="text-xs text-slate-600 italic mt-1">"{targetSentence}"</p>
                )}
              </div>

              <div className="p-3 rounded-2xl bg-white/80 border border-sky-100 text-xs text-slate-700 font-semibold max-w-md mx-auto">
                <span className="font-bold block text-sky-900 mb-0.5">Instructions:</span>
                {instructions}
              </div>

              {/* Sample audio player */}
              {audioUrl && (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100 text-blue-900 text-xs font-bold">
                  <Volume2 className="w-4 h-4" />
                  <span>Includes clinician reference pronunciation</span>
                </div>
              )}
            </div>

            <div className="pt-3 flex justify-between">
              <button
                type="button"
                onClick={() => setCurrentView('form')}
                className="btn-3d-neutral text-slate-700 font-bold text-xs sm:text-sm px-4 py-2.5 rounded-2xl flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Edit</span>
              </button>

              <button
                type="button"
                onClick={handleSaveExercise}
                className="btn-3d-blue text-white font-extrabold text-sm sm:text-base px-6 py-3 rounded-2xl flex items-center gap-2 cursor-pointer shadow-md"
              >
                <span>Save Exercise</span>
                <Check className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* VIEW 3: ASSIGN TO CHILD */}
        {currentView === 'assign' && createdExercise && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Exercise "{createdExercise.title}" saved successfully! Now assign it to a child.</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Select Child to Assign
              </label>
              <select
                value={selectedChildId}
                onChange={(e) => setSelectedChildId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none text-sm font-semibold text-slate-800"
              >
                {childrenList.map((ch) => (
                  <option key={ch.id} value={ch.id}>
                    {ch.avatarIcon} {ch.name} (Age {ch.age}) • Target Sounds: {ch.targetSounds?.join(', ')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Required Practice Repetitions
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={repetitionsRequired}
                onChange={(e) => setRepetitionsRequired(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none text-sm font-semibold text-slate-800"
              />
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={onClose}
                className="text-xs font-bold text-slate-500 hover:text-slate-700 cursor-pointer"
              >
                Skip Assignment for Now
              </button>

              <button
                type="button"
                onClick={handleAssignToChild}
                className="btn-3d-green text-white font-extrabold text-sm sm:text-base px-6 py-3 rounded-2xl flex items-center gap-2 cursor-pointer shadow-md"
              >
                <span>Assign to Child Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
