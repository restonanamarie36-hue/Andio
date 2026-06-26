import { Play, Square, ChevronUp, ChevronDown, Save, FolderOpen, Undo2, Redo2, Volume2, Download, Repeat } from 'lucide-react';
import { BeatPosition, SnapResolution, LoopRegion } from '../types';
import * as Tone from 'tone';
import Metronome from './Metronome';
import Logo from './Logo';

interface Props {
  isPlaying: boolean; bpm: number; projectName: string; beatPosition: BeatPosition; loopBars: number; masterVolume: number;
  canUndo: boolean; canRedo: boolean; metronomeEnabled: boolean; countInBars: number;
  snapResolution: SnapResolution; loopRegion: LoopRegion | null; hasUnsavedChanges: boolean;
  onPlay: () => void; onStop: () => void; onBpmChange: (bpm: number) => void;
  onProjectNameChange: (name: string) => void; onSave: () => void; onLoopBarsChange: (bars: number) => void;
  onMasterVolumeChange: (vol: number) => void; onUndo: () => void; onRedo: () => void; isSaving: boolean;
  onMetronomeToggle: () => void; onCountInChange: (bars: number) => void;
  onSnapChange: (snap: SnapResolution) => void; onLoopRegionChange: (region: LoopRegion | null) => void;
  onExport: () => void;
}

export default function Header({
  isPlaying, bpm, projectName, beatPosition, loopBars, masterVolume, canUndo, canRedo,
  metronomeEnabled, countInBars, snapResolution, loopRegion, hasUnsavedChanges,
  onPlay, onStop, onBpmChange, onProjectNameChange, onSave, onLoopBarsChange,
  onMasterVolumeChange, onUndo, onRedo, isSaving,
  onMetronomeToggle, onCountInChange, onSnapChange, onLoopRegionChange, onExport,
}: Props) {
  const handleMasterVolChange = (val: number) => {
    onMasterVolumeChange(val);
    const db = val === 0 ? -Infinity : ((val / 100) * 40) - 40;
    Tone.getDestination().volume.value = db;
  };

  return (
    <header className="flex items-center gap-2 px-3 py-2 bg-[#16181c] border-b border-white/10 select-none shrink-0 flex-wrap">
      <div className="mr-2">
        <Logo size={18} showText={false} />
      </div>

      <div className="flex items-center gap-1">
        <button onClick={isPlaying ? onStop : onPlay} title={isPlaying ? 'Stop (Space)' : 'Play (Space)'}
          className={`flex items-center justify-center w-8 h-8 rounded-lg border transition-all ${
            isPlaying ? 'bg-red-500/20 border-red-500/40 text-red-400 hover:bg-red-500/30' : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/30'}`}>
          {isPlaying ? <Square size={13} fill="currentColor" /> : <Play size={13} fill="currentColor" />}
        </button>
        <button onClick={onStop} title="Stop & Rewind" className="flex items-center justify-center w-8 h-8 rounded-lg border border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-all">
          <Square size={12} fill="currentColor" />
        </button>
      </div>

      <div className="flex items-center gap-0.5 px-2.5 py-1 bg-[#22252b] border border-white/10 rounded-lg min-w-[80px]">
        <span className="font-mono text-sm font-bold text-teal-400">{isPlaying ? `${beatPosition.bar}.${beatPosition.beat}.${beatPosition.sub}` : '—'}</span>
      </div>

      <div className="flex items-center gap-1.5 px-2 py-1 bg-[#22252b] border border-white/10 rounded-lg">
        <span className="text-[10px] text-gray-500 uppercase tracking-widest">BPM</span>
        <input type="number" value={bpm} min={40} max={240} onChange={e => onBpmChange(Number(e.target.value))}
          className="w-10 bg-transparent text-center text-white font-mono font-bold text-sm outline-none" />
        <div className="flex flex-col">
          <button onClick={() => onBpmChange(Math.min(240, bpm + 1))} className="text-gray-500 hover:text-white transition-colors leading-none"><ChevronUp size={10} /></button>
          <button onClick={() => onBpmChange(Math.max(40, bpm - 1))} className="text-gray-500 hover:text-white transition-colors leading-none"><ChevronDown size={10} /></button>
        </div>
      </div>

      <div className="flex items-center gap-1.5 px-2 py-1 bg-[#22252b] border border-white/10 rounded-lg">
        <span className="text-[10px] text-gray-500 uppercase tracking-widest">Snap</span>
        <select value={snapResolution} onChange={e => onSnapChange(e.target.value as any)}
          className="bg-transparent text-white text-xs font-medium outline-none cursor-pointer">
          <option value="4n">1/4</option><option value="8n">1/8</option><option value="16n">1/16</option><option value="32n">1/32</option>
        </select>
      </div>

      <Metronome enabled={metronomeEnabled} countInBars={countInBars} onToggle={onMetronomeToggle} onCountInChange={onCountInChange} />

      <button onClick={onExport} title="Export Audio"
        className="flex items-center gap-1 px-2 py-1.5 bg-amber-500/20 border border-amber-500/40 text-amber-400 hover:bg-amber-500/30 rounded-lg text-xs transition-colors">
        <Download size={12} />
      </button>

      <div className="flex items-center gap-1.5 px-2 py-1 bg-[#22252b] border border-white/10 rounded-lg">
        <Volume2 size={12} className="text-gray-500 shrink-0" />
        <input type="range" min={0} max={100} value={masterVolume} onChange={e => handleMasterVolChange(Number(e.target.value))} className="w-16 accent-teal-400 h-1" />
        <span className="text-[10px] text-gray-500 w-6 text-right">{masterVolume}%</span>
      </div>

      <input type="text" value={projectName} onChange={e => onProjectNameChange(e.target.value)}
        className="flex-1 min-w-0 max-w-[160px] bg-[#22252b] border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-xs outline-none focus:border-teal-500/50 transition-colors" />

      {hasUnsavedChanges && <span className="text-[10px] text-amber-400">Unsaved</span>}

      <div className="flex items-center gap-1 shrink-0 ml-auto">
        <button onClick={onUndo} disabled={!canUndo} title="Undo (Ctrl+Z)" className="p-1.5 rounded text-gray-500 hover:text-white hover:bg-white/8 disabled:opacity-25 transition-colors"><Undo2 size={14} /></button>
        <button onClick={onRedo} disabled={!canRedo} title="Redo (Ctrl+Y)" className="p-1.5 rounded text-gray-500 hover:text-white hover:bg-white/8 disabled:opacity-25 transition-colors"><Redo2 size={14} /></button>
        <button onClick={onSave} disabled={isSaving} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-teal-500/40 bg-teal-500/10 text-teal-400 hover:bg-teal-500/20 text-xs transition-all disabled:opacity-50">
          <Save size={12} /> {isSaving ? 'Saving…' : 'Save'}
        </button>
        <button onClick={() => window.location.href = '/dashboard'} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white text-xs transition-all">
          <FolderOpen size={12} /> Projects
        </button>
      </div>
    </header>
  );
}
