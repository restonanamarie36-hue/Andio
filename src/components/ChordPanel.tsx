import { useState } from 'react';
import { Music } from 'lucide-react';
import { PRESET_CHORDS } from '../types';

const ROOT_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const OCTAVES = [2, 3, 4, 5];

interface Props {
  rootOctave: number;
  onInsertChord: (notes: { pitch: string; step: number; velocity: number }[]) => void;
  availableSteps: number;
  currentStep: number;
}

export default function ChordPanel({ rootOctave, onInsertChord, availableSteps, currentStep }: Props) {
  const [root, setRoot] = useState('C');
  const [octave, setOctave] = useState(rootOctave);

  const buildChordPitches = (intervals: string[]): string[] => {
    const startIndex = ROOT_NOTES.indexOf(root);
    return intervals.map(interval => {
      const intervalIndex = ROOT_NOTES.indexOf(interval.replace(/\d/g, ''));
      const targetOctave = octave + (intervalIndex < startIndex ? 1 : 0);
      return `${ROOT_NOTES[intervalIndex]}${targetOctave}`;
    });
  };

  const handleClick = (chordName: string) => {
    const intervals = PRESET_CHORDS[chordName];
    if (!intervals) return;
    const pitches = buildChordPitches(intervals);
    const notes = pitches.map(pitch => ({ pitch, step: currentStep, velocity: 0.8 }));
    onInsertChord(notes);
  };

  return (
    <div className="bg-[#111318] rounded-lg p-3">
      <div className="flex items-center gap-2 mb-3">
        <Music size={14} className="text-teal-400" />
        <span className="text-xs font-semibold text-white">Chord Presets</span>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <select value={root} onChange={e => setRoot(e.target.value)}
          className="px-2 py-1 bg-[#1a1d25] border border-white/10 rounded text-white text-xs outline-none">
          {ROOT_NOTES.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
        <select value={octave} onChange={e => setOctave(Number(e.target.value))}
          className="px-2 py-1 bg-[#1a1d25] border border-white/10 rounded text-white text-xs outline-none">
          {OCTAVES.map(o => <option key={o} value={o}>Octave {o}</option>)}
        </select>
        <span className="text-[10px] text-gray-500 ml-auto">at step {currentStep}</span>
      </div>

      <div className="grid grid-cols-5 gap-1">
        {Object.keys(PRESET_CHORDS).map(name => (
          <button key={name}
            onClick={() => handleClick(name)}
            className="px-2 py-1.5 bg-[#1a1d25] border border-white/10 rounded text-[10px] text-gray-400 hover:text-white hover:bg-white/5 hover:border-white/20 transition-all">
            {root}{name === 'Major' ? '' : name === 'Minor' ? 'm' : name.startsWith('Maj') ? 'maj7' : name === 'Dom7' ? '7' : name}
          </button>
        ))}
      </div>
    </div>
  );
}
