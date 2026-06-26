import { Track } from '../types';
import { generateTrackId, generateClipId, generateNoteId } from './idGenerator';
import { STEPS_PER_BAR, DEFAULT_BPM, DEFAULT_LOOP_BARS } from './constants';

const note = (pitch: string, step: number, duration = 1, velocity = 0.8) => ({
  id: generateNoteId(), pitch, step, duration, velocity
});

const clip = (startStep: number, length: number, notes: ReturnType<typeof note>[]) => ({
  id: generateClipId(), startStep, length, notes
});

const defaultTrackEffects = {
  reverbSend: 0, delaySend: 0, distortionSend: 0,
  attack: 0.01, release: 0.5, filterFreq: 2000,
  pan: 50, audioClips: [], automation: [],
};

export const INSTRUMENT_COLORS: Record<string, string> = {
  kick: '#ef4444', snare: '#f97316', hihat: '#eab308',
  piano: '#3b82f6', pluck: '#06b6d4', bass: '#a855f7', sax: '#f59e0b', guitar: '#10b981',
};

export function createDefaultTracks(): Track[] {
  return [
    { id: generateTrackId(), name: 'Basic Kick', category: 'DRUMS', instrumentType: 'kick', color: INSTRUMENT_COLORS.kick, volume: 80, muted: false, soloed: false,
      ...defaultTrackEffects, clips: [clip(0, 64, [note('C1', 0), note('C1', 4), note('C1', 8), note('C1', 12), note('C1', 16), note('C1', 20), note('C1', 24), note('C1', 28), note('C1', 32), note('C1', 36), note('C1', 40), note('C1', 44), note('C1', 48), note('C1', 52), note('C1', 56), note('C1', 60)])] },
    { id: generateTrackId(), name: 'Snare 1', category: 'DRUMS', instrumentType: 'snare', color: INSTRUMENT_COLORS.snare, volume: 70, muted: false, soloed: false,
      ...defaultTrackEffects, clips: [clip(0, 64, [note('C2', 4), note('C2', 12), note('C2', 20), note('C2', 28), note('C2', 36), note('C2', 44), note('C2', 52), note('C2', 60)])] },
    { id: generateTrackId(), name: 'Closed HiHat', category: 'DRUMS', instrumentType: 'hihat', color: INSTRUMENT_COLORS.hihat, volume: 60, muted: false, soloed: false,
      ...defaultTrackEffects, clips: [clip(0, 64, Array.from({ length: 32 }, (_, i) => note('C3', i * 2, 1, 0.6)))] },
    { id: generateTrackId(), name: 'Grand Piano', category: 'MELODIC', instrumentType: 'piano', color: INSTRUMENT_COLORS.piano, volume: 75, muted: false, soloed: false,
      ...defaultTrackEffects, clips: [clip(0, 32, [note('C3', 0, 4), note('E3', 0, 4), note('G3', 0, 4), note('C3', 8, 4), note('F3', 8, 4), note('A3', 8, 4), note('G3', 16, 4), note('B3', 16, 4), note('D4', 16, 4), note('C3', 24, 4), note('E3', 24, 4), note('G3', 24, 4)]),
              clip(32, 32, [note('A2', 0, 4), note('C3', 0, 4), note('E3', 0, 4), note('F2', 8, 4), note('A2', 8, 4), note('C3', 8, 4), note('G2', 16, 4), note('B2', 16, 4), note('D3', 16, 4), note('C3', 24, 4), note('E3', 24, 4), note('G3', 24, 4)])] },
    { id: generateTrackId(), name: 'Synth Pluck', category: 'MELODIC', instrumentType: 'pluck', color: INSTRUMENT_COLORS.pluck, volume: 65, muted: false, soloed: false,
      ...defaultTrackEffects, clips: [clip(16, 48, [note('C4', 0, 2), note('E4', 2, 2), note('G4', 4, 2), note('E4', 6, 2), note('C4', 8, 2), note('D4', 10, 2), note('F4', 12, 2), note('A4', 14, 2), note('G4', 16, 2), note('B4', 18, 2), note('G4', 20, 2), note('E4', 22, 2), note('C4', 24, 2), note('E4', 26, 2), note('G4', 28, 2), note('C5', 30, 2)])] },
    { id: generateTrackId(), name: 'Acoustic Bass', category: 'JAZZ', instrumentType: 'bass', color: INSTRUMENT_COLORS.bass, volume: 70, muted: false, soloed: false,
      ...defaultTrackEffects, clips: [clip(0, 64, [note('C2', 0, 3), note('G2', 3, 1), note('A2', 4, 3), note('E2', 7, 1), note('F2', 8, 3), note('C2', 11, 1), note('G2', 12, 4), note('C2', 16, 3), note('E2', 19, 1), note('F2', 20, 3), note('A2', 23, 1), note('G2', 24, 3), note('B2', 27, 1), note('C3', 28, 4), note('C2', 32, 3), note('G2', 35, 1), note('A2', 36, 3), note('E2', 39, 1), note('F2', 40, 3), note('C2', 43, 1), note('G2', 44, 4), note('C2', 48, 3), note('E2', 51, 1), note('F2', 52, 3), note('A2', 55, 1), note('G2', 56, 3), note('B2', 59, 1), note('C3', 60, 4)])] },
    { id: generateTrackId(), name: 'Tenor Sax Alto', category: 'JAZZ', instrumentType: 'sax', color: INSTRUMENT_COLORS.sax, volume: 68, muted: false, soloed: false,
      ...defaultTrackEffects, reverbSend: 15, clips: [clip(8, 24, [note('G4', 0, 3), note('A4', 4, 2), note('A#4', 6, 2), note('G4', 8, 4), note('E4', 12, 3), note('D4', 16, 2), note('C4', 18, 2), note('D4', 20, 4)]),
              clip(40, 24, [note('G4', 0, 3), note('A4', 4, 2), note('A#4', 6, 2), note('G4', 8, 4), note('E4', 12, 3), note('F4', 16, 2), note('G4', 18, 2), note('C5', 20, 4)])] },
    { id: generateTrackId(), name: 'Jazz Guitar', category: 'JAZZ', instrumentType: 'guitar', color: INSTRUMENT_COLORS.guitar, volume: 65, muted: false, soloed: false,
      ...defaultTrackEffects, clips: [clip(24, 16, [note('C3', 0, 2), note('E3', 0, 2), note('G3', 0, 2), note('C3', 4, 2), note('F3', 4, 2), note('A3', 4, 2), note('G3', 8, 2), note('B3', 8, 2), note('D4', 8, 2), note('C3', 12, 2), note('E3', 12, 2), note('G3', 12, 2)]),
              clip(48, 16, [note('A2', 0, 2), note('C3', 0, 2), note('E3', 0, 2), note('F2', 4, 2), note('A2', 4, 2), note('C3', 4, 2), note('G2', 8, 2), note('B2', 8, 2), note('D3', 8, 2), note('C3', 12, 2), note('E3', 12, 2), note('G3', 12, 2)])] },
  ];
}

export function createEmptyTrack(name: string, instrumentType: Track['instrumentType'], category: Track['category']): Track {
  return {
    id: generateTrackId(),
    name,
    category,
    instrumentType,
    color: INSTRUMENT_COLORS[instrumentType] ?? '#3b82f6',
    volume: 75,
    pan: 50,
    muted: false,
    soloed: false,
    reverbSend: 0,
    delaySend: 0,
    distortionSend: 0,
    attack: 0.01,
    release: 0.5,
    filterFreq: 2000,
    audioClips: [],
    automation: [],
    clips: [],
  };
}

export function createAudioTrack(name: string, color: string): Track {
  return {
    id: generateTrackId(),
    name,
    category: 'MELODIC',
    instrumentType: 'piano',
    isAudio: true,
    color,
    volume: 75,
    pan: 50,
    muted: false,
    soloed: false,
    ...defaultTrackEffects,
    clips: [],
  };
}

export function createBeatTemplate(): Track[] {
  const templateTypes: { type: Track['instrumentType']; name: string }[] = [
    { type: 'kick', name: 'Kick' },
    { type: 'snare', name: 'Snare' },
    { type: 'hihat', name: 'Hi-Hat Closed' },
    { type: 'hihat', name: 'Hi-Hat Open' },
    { type: 'snare', name: 'Clap' },
    { type: 'bass', name: '808 Bass' },
  ];
  return templateTypes.map((t, i) => ({
    ...createEmptyTrack(t.name, t.type, 'DRUMS'),
    color: [INSTRUMENT_COLORS.kick, INSTRUMENT_COLORS.snare, INSTRUMENT_COLORS.hihat, '#22c55e', '#06b6d4', INSTRUMENT_COLORS.bass][i],
  }));
}

export function createSynthTemplate(): Track[] {
  return [
    { ...createEmptyTrack('Pad 1', 'pluck', 'MELODIC'), reverbSend: 40 },
    { ...createEmptyTrack('Pad 2', 'piano', 'MELODIC'), reverbSend: 30, delaySend: 20 },
    { ...createEmptyTrack('Lead', 'pluck', 'MELODIC'), delaySend: 25 },
    { ...createEmptyTrack('Arp', 'pluck', 'MELODIC') },
    { ...createEmptyTrack('Drums', 'kick', 'DRUMS') },
    { ...createEmptyTrack('Bass', 'bass', 'JAZZ') },
  ];
}

export function createVocalDemoTemplate(): Track[] {
  return [
    { ...createEmptyTrack('Piano', 'piano', 'MELODIC'), reverbSend: 25 },
    { ...createEmptyTrack('Strings', 'piano', 'MELODIC'), reverbSend: 40 },
    { ...createEmptyTrack('Bass', 'bass', 'JAZZ') },
    createAudioTrack('Vocalist', INSTRUMENT_COLORS.kick),
  ];
}

export function tracksFromTemplate(template: string): Track[] {
  switch (template) {
    case 'default': return createDefaultTracks();
    case 'empty': return [];
    case 'beat': return createBeatTemplate();
    case 'synth': return createSynthTemplate();
    case 'vocal-demo': return createVocalDemoTemplate();
    default: return createDefaultTracks();
  }
}
