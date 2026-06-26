import { useState } from 'react';
import { Music, Music2, FileAudio, Play, HelpCircle, Sparkles } from 'lucide-react';

interface EmptyStateProps {
  type: 'timeline' | 'piano-roll' | 'mixer' | 'samples' | 'projects';
  onAction?: () => void;
  actionLabel?: string;
}

const EMPTY_STATES: Record<string, { icon: typeof Music; title: string; description: string; tip: string }> = {
  'timeline': {
    icon: Music2,
    title: 'No clips yet',
    description: 'Double-click on a track to create a clip and start composing.',
    tip: 'Tip: Press Space to play/stop playback'
  },
  'piano-roll': {
    icon: Play,
    title: 'Select a clip to edit',
    description: 'Click on any clip in the timeline to view and edit its notes here.',
    tip: 'Tip: Hold Shift and drag to select multiple notes'
  },
  'mixer': {
    icon: Music,
    title: 'No tracks to mix',
    description: 'Add tracks from the sidebar to start mixing.',
    tip: 'Tip: Press M to mute, S to solo a track'
  },
  'samples': {
    icon: FileAudio,
    title: 'Your samples will appear here',
    description: 'Upload audio files or use the built-in drum samples to get started.',
    tip: 'Drag samples onto the timeline to create audio clips'
  },
  'projects': {
    icon: Sparkles,
    title: 'Create your first project',
    description: 'Start a new project to begin making music in your browser.',
    tip: 'Choose from templates to get started quickly'
  }
};

export default function EmptyState({ type, onAction, actionLabel }: EmptyStateProps) {
  const [showTip, setShowTip] = useState(false);
  const state = EMPTY_STATES[type];
  const Icon = state.icon;

  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#1a1d25] border border-white/10 flex items-center justify-center mb-4">
        <Icon size={28} className="text-gray-600" />
      </div>
      <h3 className="text-base font-semibold text-white mb-1">{state.title}</h3>
      <p className="text-sm text-gray-500 max-w-xs mb-4">{state.description}</p>

      {onAction && (
        <button
          onClick={onAction}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-lg text-sm transition-colors mb-4"
        >
          {actionLabel || 'Get Started'}
        </button>
      )}

      <button
        onClick={() => setShowTip(!showTip)}
        className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-500 transition-colors group"
      >
        <HelpCircle size={12} className="group-hover:text-cyan-500" />
        {showTip ? state.tip : 'Show tip'}
      </button>
    </div>
  );
}

// Skeleton loader for loading states
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-white/10 rounded ${className}`} />
  );
}

export function TimelineSkeleton() {
  return (
    <div className="space-y-3 p-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex gap-3">
          <Skeleton className="w-48 h-10" />
          <Skeleton className="flex-1 h-10" />
        </div>
      ))}
    </div>
  );
}

export function PianoRollSkeleton() {
  return (
    <div className="flex h-full">
      <Skeleton className="w-12" />
      <div className="flex-1 space-y-1 p-2">
        {[...Array(12)].map((_, i) => (
          <Skeleton key={i} className="h-3 w-full" />
        ))}
      </div>
    </div>
  );
}
