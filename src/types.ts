export type TrackCategory = 'DRUMS' | 'MELODIC' | 'JAZZ';
export type InstrumentType = 'kick' | 'snare' | 'hihat' | 'piano' | 'pluck' | 'bass' | 'sax' | 'guitar';
export type EditorTool = 'pencil' | 'eraser' | 'select';
export type SnapResolution = '4n' | '8n' | '16n' | '32n';
export type AutomationType = 'volume' | 'pan' | 'filter';
export type ViewMode = 'arranger' | 'mixer' | 'automation';

export interface Note {
  id: string;
  pitch: string;
  step: number;
  duration: number;
  velocity: number;
}

export interface AudioClip {
  id: string;
  startStep: number;
  duration: number;
  fileId: string;
  fileName: string;
  volume: number;
  reversed: boolean;
  waveformData?: number[];
}

export interface Clip {
  id: string;
  startStep: number;
  length: number;
  notes: Note[];
}

export interface AutomationPoint {
  id: string;
  step: number;
  value: number;
}

export interface AutomationLane {
  type: AutomationType;
  points: AutomationPoint[];
}

export interface Track {
  id: string;
  name: string;
  category: TrackCategory;
  instrumentType: InstrumentType;
  color: string;
  volume: number;
  pan: number;
  muted: boolean;
  soloed: boolean;
  clips: Clip[];
  audioClips: AudioClip[];
  reverbSend: number;
  delaySend: number;
  distortionSend: number;
  attack: number;
  release: number;
  filterFreq: number;
  automation: AutomationLane[];
}

export interface Project {
  id?: string;
  name: string;
  bpm: number;
  loopBars: number;
  tracks: Track[];
}

export interface SavedProject {
  id: string;
  name: string;
  bpm: number;
  data: { tracks: Track[]; loopBars?: number };
  created_at: string;
  updated_at: string;
}

export interface BeatPosition {
  bar: number;
  beat: number;
  sub: number;
}

export interface LoopRegion {
  startStep: number;
  endStep: number;
}

export interface SampleFile {
  id: string;
  name: string;
  category: 'drums' | 'melodic' | 'fx' | 'vocals';
  duration: number;
  waveformData: number[];
  url?: string;
}

export interface MixerChannel {
  trackId: string;
  volume: number;
  pan: number;
  muted: boolean;
  soloed: boolean;
  vuLeft: number;
  vuRight: number;
}

export function stepToBeatPosition(step: number): BeatPosition {
  const bar = Math.floor(step / 16) + 1;
  const beat = Math.floor((step % 16) / 4) + 1;
  const sub = (step % 4) + 1;
  return { bar, beat, sub };
}

export function normalizeNote(pitch: string): string {
  const map: Record<string, string> = {
    Bb: 'A#', Eb: 'D#', Ab: 'G#', Db: 'C#', Gb: 'F#',
  };
  const m = pitch.match(/^([A-G]b?)(\d+)$/);
  if (!m) return pitch;
  return `${map[m[1]] ?? m[1]}${m[2]}`;
}

export const SNAP_DENOM: Record<SnapResolution, number> = {
  '4n': 16,
  '8n': 8,
  '16n': 4,
  '32n': 2,
};

export function snapStepToResolution(step: number, resolution: SnapResolution): number {
  const denom = SNAP_DENOM[resolution];
  return Math.round(step / denom) * denom;
}

export const TRACK_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#06b6d4', '#3b82f6', '#a855f7', '#ec4899',
  '#14b8a6', '#f43f5e', '#8b5cf6', '#0ea5e9',
];

export const PRESET_CHORDS: Record<string, string[]> = {
  'Major': ['C', 'E', 'G'],
  'Minor': ['C', 'D#', 'G'],
  'Dim': ['C', 'D#', 'F#'],
  'Aug': ['C', 'E', 'G#'],
  'Maj7': ['C', 'E', 'G', 'B'],
  'Min7': ['C', 'D#', 'G', 'A#'],
  'Dom7': ['C', 'E', 'G', 'A#'],
  'Sus2': ['C', 'D', 'G'],
  'Sus4': ['C', 'F', 'G'],
  'Add9': ['C', 'E', 'G', 'D'],
};

export const BUILT_IN_SAMPLES: SampleFile[] = [
  { id: 'kick-808', name: '808 Kick', category: 'drums', duration: 0.5, waveformData: [] },
  { id: 'kick-acoustic', name: 'Acoustic Kick', category: 'drums', duration: 0.4, waveformData: [] },
  { id: 'snare-808', name: '808 Snare', category: 'drums', duration: 0.3, waveformData: [] },
  { id: 'snare-tight', name: 'Tight Snare', category: 'drums', duration: 0.2, waveformData: [] },
  { id: 'hihat-closed', name: 'Closed HiHat', category: 'drums', duration: 0.1, waveformData: [] },
  { id: 'hihat-open', name: 'Open HiHat', category: 'drums', duration: 0.4, waveformData: [] },
  { id: 'clap', name: 'Clap', category: 'drums', duration: 0.3, waveformData: [] },
  { id: 'rim', name: 'Rimshot', category: 'drums', duration: 0.15, waveformData: [] },
];
