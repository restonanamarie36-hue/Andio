export type TrackCategory = 'DRUMS' | 'MELODIC' | 'JAZZ';
export type InstrumentType = 'kick' | 'snare' | 'hihat' | 'piano' | 'pluck' | 'bass' | 'sax' | 'guitar';
export type EditorTool = 'pencil' | 'eraser' | 'select';

export interface Note {
  id: string;
  pitch: string;
  step: number;
  duration: number;
  velocity: number;
}

export interface Clip {
  id: string;
  startStep: number;
  length: number;
  notes: Note[];
}

export interface Track {
  id: string;
  name: string;
  category: TrackCategory;
  instrumentType: InstrumentType;
  color: string;
  volume: number;
  muted: boolean;
  soloed: boolean;
  clips: Clip[];
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
