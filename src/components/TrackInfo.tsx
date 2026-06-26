import { useState } from 'react';
import { X, Trash2, Edit2, Check, Copy, Palette, Settings, Volume2 } from 'lucide-react';
import { Track, TRACK_COLORS, InstrumentType, TrackCategory } from '../types';

interface Props {
  track: Track;
  onClose: () => void;
  onUpdate: (updates: Partial<Track>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

const INSTRUMENT_OPTIONS: { type: InstrumentType; name: string; category: TrackCategory }[] = [
  { type: 'kick', name: 'Kick Drum', category: 'DRUMS' },
  { type: 'snare', name: 'Snare', category: 'DRUMS' },
  { type: 'hihat', name: 'Hi-Hat', category: 'DRUMS' },
  { type: 'piano', name: 'Piano', category: 'MELODIC' },
  { type: 'pluck', name: 'Synth Pluck', category: 'MELODIC' },
  { type: 'bass', name: 'Bass', category: 'JAZZ' },
  { type: 'sax', name: 'Saxophone', category: 'JAZZ' },
  { type: 'guitar', name: 'Guitar', category: 'JAZZ' },
];

export default function TrackInfo({ track, onClose, onUpdate, onDelete, onDuplicate }: Props) {
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(track.name);
  const [tab, setTab] = useState<'general' | 'effects' | 'color'>('general');

  const handleSaveName = () => {
    onUpdate({ name: nameInput.trim() || track.name });
    setEditingName(false);
  };

  return (
    <div className="absolute right-0 top-0 bottom-0 w-72 bg-[#22252b] border-l border-white/10 flex flex-col z-20 overflow-y-auto">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
        <h3 className="text-xs font-semibold text-white">Track Settings</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors"><X size={14} /></button>
      </div>

      <div className="px-4 py-3 border-b border-white/5">
        {editingName ? (
          <div className="flex items-center gap-2">
            <input type="text" value={nameInput} onChange={e => setNameInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') setEditingName(false); }}
              className="flex-1 px-2 py-1.5 bg-[#1a1c20] border border-white/10 rounded text-white text-xs outline-none focus:border-teal-500/50"
              autoFocus />
            <button onClick={handleSaveName} className="text-cyan-400 hover:text-cyan-300"><Check size={14} /></button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: track.color }} />
            <span className="flex-1 text-sm text-white font-medium">{track.name}</span>
            <button onClick={() => setEditingName(true)} className="text-gray-500 hover:text-white transition-colors"><Edit2 size={12} /></button>
          </div>
        )}
      </div>

      <div className="flex border-b border-white/10 shrink-0">
        {(['general', 'effects', 'color'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 text-[10px] font-semibold uppercase tracking-wider transition-colors ${
              tab === t ? 'text-teal-400 border-b-2 border-teal-400 bg-teal-400/5' : 'text-gray-500 hover:text-gray-300'
            }`}>
            {t}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {tab === 'general' && (
          <>
            <div>
              <label className="block text-[10px] text-gray-400 mb-1.5 font-medium">Instrument</label>
              <select value={track.instrumentType}
                onChange={e => {
                  const opt = INSTRUMENT_OPTIONS.find(o => o.type === e.target.value);
                  if (opt) onUpdate({ instrumentType: opt.type, category: opt.category });
                }}
                className="w-full px-2 py-1.5 bg-[#1a1c20] border border-white/10 rounded text-white text-xs outline-none focus:border-teal-500/50">
                {INSTRUMENT_OPTIONS.map(opt => <option key={opt.type} value={opt.type}>{opt.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-gray-400 mb-1.5 font-medium">Volume</label>
              <div className="flex items-center gap-2">
                <Volume2 size={12} className="text-gray-500" />
                <input type="range" min={0} max={100} value={track.volume}
                  onChange={e => onUpdate({ volume: Number(e.target.value) })}
                  className="flex-1 h-1" style={{ accentColor: track.color }} />
                <span className="text-[10px] text-gray-500 w-6 text-right">{track.volume}%</span>
              </div>
            </div>
            <div>
              <label className="block text-[10px] text-gray-400 mb-1.5 font-medium">Pan</label>
              <div className="flex items-center gap-2">
                <span className="text-[9px] text-gray-500">L</span>
                <input type="range" min={0} max={100} value={track.pan ?? 50}
                  onChange={e => onUpdate({ pan: Number(e.target.value) })}
                  className="flex-1 h-1 accent-teal-400" />
                <span className="text-[9px] text-gray-500">R</span>
              </div>
            </div>
          </>
        )}

        {tab === 'effects' && (
          <>
            <div>
              <label className="block text-[10px] text-gray-400 mb-1.5 font-medium">Reverb Send</label>
              <input type="range" min={0} max={100} value={track.reverbSend ?? 0}
                onChange={e => onUpdate({ reverbSend: Number(e.target.value) })}
                className="w-full h-1 accent-cyan-400" />
              <span className="text-[10px] text-gray-500">{track.reverbSend ?? 0}%</span>
            </div>
            <div>
              <label className="block text-[10px] text-gray-400 mb-1.5 font-medium">Delay Send</label>
              <input type="range" min={0} max={100} value={track.delaySend ?? 0}
                onChange={e => onUpdate({ delaySend: Number(e.target.value) })}
                className="w-full h-1 accent-violet-400" />
              <span className="text-[10px] text-gray-500">{track.delaySend ?? 0}%</span>
            </div>
            <div>
              <label className="block text-[10px] text-gray-400 mb-1.5 font-medium">Distortion</label>
              <input type="range" min={0} max={100} value={track.distortionSend ?? 0}
                onChange={e => onUpdate({ distortionSend: Number(e.target.value) })}
                className="w-full h-1 accent-orange-400" />
              <span className="text-[10px] text-gray-500">{track.distortionSend ?? 0}%</span>
            </div>
            <div>
              <label className="block text-[10px] text-gray-400 mb-1.5 font-medium">Filter Frequency</label>
              <input type="range" min={100} max={8000} value={track.filterFreq ?? 2000}
                onChange={e => onUpdate({ filterFreq: Number(e.target.value) })}
                className="w-full h-1 accent-emerald-400" />
              <span className="text-[10px] text-gray-500">{track.filterFreq ?? 2000} Hz</span>
            </div>
          </>
        )}

        {tab === 'color' && (
          <div className="grid grid-cols-4 gap-2">
            {TRACK_COLORS.map(color => (
              <button key={color} onClick={() => onUpdate({ color })}
                className={`w-10 h-10 rounded-lg border-2 transition-all ${track.color === color ? 'border-white scale-105' : 'border-transparent hover:border-white/30'}`}
                style={{ backgroundColor: color }} />
            ))}
            <input type="color" value={track.color} onChange={e => onUpdate({ color: e.target.value })}
              className="w-10 h-10 rounded-lg cursor-pointer border border-white/10 bg-transparent" />
          </div>
        )}
      </div>

      <div className="px-4 py-3 border-t border-white/10 shrink-0 space-y-2">
        <button onClick={onDuplicate}
          className="w-full flex items-center justify-center gap-2 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 text-xs transition-colors">
          <Copy size={12} /> Duplicate Track
        </button>
        <button onClick={onDelete}
          className="w-full flex items-center justify-center gap-2 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/20 text-xs transition-colors">
          <Trash2 size={12} /> Delete Track
        </button>
      </div>
    </div>
  );
}
