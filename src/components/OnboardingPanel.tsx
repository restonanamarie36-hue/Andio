import { useState, useEffect } from 'react';
import { HelpCircle, X, ArrowRight, Sparkles, Music, Headphones, Mic, Keyboard } from 'lucide-react';

interface OnboardingHint {
  id: string;
  title: string;
  description: string;
  icon: typeof Sparkles;
  action?: string;
}

const ONBOARDING_STEPS: OnboardingHint[] = [
  {
    id: 'welcome',
    title: 'Welcome to Andio',
    description: 'A browser-based digital audio workstation. Create beats, compose melodies, and mix tracks - all in your browser.',
    icon: Sparkles,
  },
  {
    id: 'playback',
    title: 'Start Making Music',
    description: 'Press Space to play/stop. Use the BPM control to set your tempo. Click any clip to edit notes.',
    icon: Music,
    action: 'Press Space to try it',
  },
  {
    id: 'mixer',
    title: 'Mix Your Track',
    description: 'Press 2 to open the mixer. Adjust volume, pan, and effects for each track.',
    icon: Headphones,
  },
  {
    id: 'record',
    title: 'Record Audio',
    description: 'Press Ctrl+R to record from your microphone. Great for capturing vocal ideas or live instruments.',
    icon: Mic,
  },
  {
    id: 'shortcuts',
    title: 'Learn Shortcuts',
    description: 'Press ? to see all keyboard shortcuts. Speed up your workflow with hotkeys.',
    icon: Keyboard,
  },
];

const ONBOARDING_KEY = 'groovegrid_onboarding_seen';

export default function OnboardingPanel() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const seen = localStorage.getItem(ONBOARDING_KEY);
    if (!seen) {
      setIsVisible(true);
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?') {
        e.preventDefault();
        setIsVisible(true);
        setCurrentIndex(0);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(ONBOARDING_KEY, 'true');
  };

  const handleNext = () => {
    if (currentIndex < ONBOARDING_STEPS.length - 1) {
      setCurrentIndex(i => i + 1);
    } else {
      handleDismiss();
    }
  };

  const handleSkip = () => {
    handleDismiss();
  };

  if (!isVisible) return null;

  const currentStep = ONBOARDING_STEPS[currentIndex];
  const Icon = currentStep.icon;
  const isLast = currentIndex === ONBOARDING_STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#141720] border border-white/10 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center mx-auto mb-4">
            <Icon size={24} className="text-teal-400" />
          </div>

          <h3 className="text-lg font-semibold text-white mb-2">{currentStep.title}</h3>
          <p className="text-sm text-gray-400 mb-4">{currentStep.description}</p>

          {currentStep.action && (
            <div className="px-3 py-2 bg-teal-500/10 border border-teal-500/20 rounded-lg mb-4">
              <span className="text-xs text-teal-400">{currentStep.action}</span>
            </div>
          )}

          {/* Progress dots */}
          <div className="flex justify-center gap-1.5 mb-6">
            {ONBOARDING_STEPS.map((step, i) => (
              <button
                key={step.id}
                onClick={() => setCurrentIndex(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === currentIndex ? 'bg-teal-400 w-4' : i < currentIndex ? 'bg-teal-500/30' : 'bg-white/20'
                }`}
              />
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSkip}
              className="flex-1 py-2.5 border border-white/10 rounded-lg text-sm text-gray-500 hover:text-white hover:bg-white/5 transition-colors">
              Skip
            </button>
            <button
              onClick={handleNext}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-teal-500 hover:bg-teal-400 text-black font-semibold rounded-lg text-sm transition-colors">
              {isLast ? 'Get Started' : 'Next'}
              {!isLast && <ArrowRight size={14} />}
            </button>
          </div>
        </div>

        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 text-gray-600 hover:text-white transition-colors">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

// Hook to check if onboarding was seen
export function useOnboardingSeen() {
  const [seen, setSeen] = useState(true);
  useEffect(() => {
    const value = localStorage.getItem(ONBOARDING_KEY);
    setSeen(!!value);
  }, []);
  return seen;
}
