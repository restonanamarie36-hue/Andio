import { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Headphones, Settings, Music } from 'lucide-react';
import { Track } from '../types';

interface Props {
  tracks: Track[];
  onVolumeChange: (trackId: string, volume: number) => void;
  onPanChange: (trackId: string, pan: number) => void;
  onMuteToggle: (trackId: string) => void;
  onSoloToggle: (trackId: string) => void;
  onTrackSelect: (trackId: string) => void;
  selectedTrackId: string | null;
  masterVolume: number;
  masterPan: number;
  onMasterVolumeChange: (volume: number) => void;
  onMasterPanChange: (pan: number) => void;
}

export default function MixerView({
  tracks, onVolumeChange, onPanChange, onMuteToggle, onSoloToggle, onTrackSelect, selectedTrackId,
  masterVolume, masterPan, onMasterVolumeChange, onMasterPanChange,
}: Props) {
  const [vuMeters, setVuMeters] = useState<Record<string, { left: number; right: number }>>({});
  const animationRef = useRef<number | null>(null);

  // Simulate VU meter animation
  useEffect(() => {
    const animate = () => {
      setVuMeters(prev => {
        const next = { ...prev };
        tracks.forEach(track => {
          const current = next[track.id] ?? { left: -60, right: -60 };
          if (!track.muted) {
            const noise = (Math.random() - 0.5) * 10;
            const base = track.volume > 0 ? -20 + (track.volume / 100) * 40 : -60;
            next[track.id] = {
              left: Math.max(-60, Math.min(0, base + noise - (track.soloed ? 0 : Math.random() * 5))),
              right: Math.max(-60, Math.min(0, base + noise - (track.soloed ? 0 : Math.random() * 5))),
            };
          } else {
            next[track.id] = { left: -60, right: -60 };
          }
        });
        return next;
      });
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
  }, [tracks]);

  const dbToHeight = (db: number) => {
    if (db <= -60) return 0;
    return Math.max(0, Math.min(100, ((db + 60) / 60) * 100));
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0c11]">
      <div className="flex items-center px-4 py-2 border-b border-white/10 shrink-0">
        <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Mixer</span>
      </div>

      <div className="flex-1 flex overflow-x-auto overflow-y-hidden">
        {/* Track channels */}
        {tracks.map(track => (
          <MixerChannel
            key={track.id}
            track={track}
            isSelected={track.id === selectedTrackId}
            vu={vuMeters[track.id] ?? { left: -60, right: -60 }}
            onVolumeChange={v => onVolumeChange(track.id, v)}
            onPanChange={p => onPanChange(track.id, p)}
            onMuteToggle={() => onMuteToggle(track.id)}
            onSoloToggle={() => onSoloToggle(track.id)}
            onSelect={() => onTrackSelect(track.id)}
            dbToHeight={dbToHeight}
          />
        ))}

        {/* Master channel */}
        <div className="flex flex-col w-24 bg-[#141720] border-l border-white/20 shrink-0">
          <div className="flex items-center justify-center py-2 border-b border-white/10">
            <Music size={14} className="text-cyan-400" />
            <span className="text-[10px] font-bold text-cyan-400 ml-1.5">MASTER</span>
          </div>

          {/* Master meters */}
          <div className="flex gap-0.5 justify-center py-4">
            <VUMeter level={dbToHeight(masterVolume > 0 ? -10 + (masterVolume / 100) * 20 : -60)} color="cyan" />
            <VUMeter level={dbToHeight(masterVolume > 0 ? -10 + (masterVolume / 100) * 20 : -60)} color="cyan" />
          </div>

          {/* Master fader */}
          <div className="flex-1 flex flex-col items-center px-2">
            <div className="relative flex-1 w-2 bg-[#1a1d25] rounded-full overflow-hidden">
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-cyan-500 via-cyan-400 to-cyan-300 rounded-full transition-all"
                style={{ height: `${masterVolume}%` }} />
              <input
                type="range" min={0} max={100} value={masterVolume}
                onChange={e => onMasterVolumeChange(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer rotated"
                style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
              />
            </div>
            <span className="text-[10px] text-gray-400 mt-2">{masterVolume}%</span>
          </div>

          {/* Master pan */}
          <div className="px-2 py-3 border-t border-white/10">
            <PanKnob value={masterPan} onChange={onMasterPanChange} size={28} />
          </div>
        </div>
      </div>
    </div>
  );
}

function MixerChannel({
  track, isSelected, vu, onVolumeChange, onPanChange, onMuteToggle, onSoloToggle, onSelect, dbToHeight,
}: {
  track: Track; isSelected: boolean;
  vu: { left: number; right: number };
  onVolumeChange: (v: number) => void; onPanChange: (p: number) => void;
  onMuteToggle: () => void; onSoloToggle: () => void; onSelect: () => void;
  dbToHeight: (db: number) => number;
}) {
  const [showVu, setShowVu] = useState(true);

  return (
    <div
      className={`flex flex-col w-20 border-r border-white/10 shrink-0 ${
        isSelected ? 'bg-cyan-500/10' : 'bg-[#111318] hover:bg-white/2'
      }`}
      onClick={onSelect}
    >
      {/* Track name */}
      <div className="flex items-center justify-center py-2 border-b border-white/10 cursor-pointer">
        <div className="w-2 h-2 rounded-full mr-1.5 shrink-0" style={{ backgroundColor: track.color }} />
        <span className="text-[10px] font-medium text-white truncate max-w-14">{track.name}</span>
      </div>

      {/* VU meters */}
      <div className="flex gap-0.5 justify-center py-3">
        <VUMeter level={dbToHeight(vu.left)} color={track.color} />
        <VUMeter level={dbToHeight(vu.right)} color={track.color} />
      </div>

      {/* Fader */}
      <div className="flex-1 flex flex-col items-center px-2">
        <div className="relative flex-1 w-3 bg-[#1a1d25] rounded-full overflow-hidden border border-white/10">
          <div className="absolute bottom-0 left-0 right-0 rounded-full transition-all"
            style={{
              height: `${track.volume}%`,
              backgroundColor: track.color,
              opacity: 0.7,
            }} />
          <input
            type="range" min={0} max={100} value={track.volume}
            onChange={e => onVolumeChange(Number(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
          />
          {/* Fader cap */}
          <div className="absolute left-1/2 -translate-x-1/2 w-5 h-2 bg-white rounded shadow-lg pointer-events-none"
            style={{ bottom: `calc(${track.volume}% - 4px)` }} />
        </div>
        <span className="text-[9px] text-gray-500 mt-1">{track.volume}%</span>
      </div>

      {/* Pan knob */}
      <div className="px-2 py-2 border-t border-white/10">
        <PanKnob value={track.pan ?? 0} onChange={onPanChange} size={24} />
      </div>

      {/* Mute / Solo */}
      <div className="flex justify-center gap-1 py-2 border-t border-white/10">
        <button
          onClick={e => { e.stopPropagation(); onMuteToggle(); }}
          className={`w-6 h-6 rounded text-[9px] font-bold border transition-colors ${
            track.muted ? 'bg-yellow-500/30 text-yellow-400 border-yellow-500/50' : 'bg-white/5 text-gray-500 border-white/10 hover:text-white'
          }`}>
          M
        </button>
        <button
          onClick={e => { e.stopPropagation(); onSoloToggle(); }}
          className={`w-6 h-6 rounded text-[9px] font-bold border transition-colors ${
            track.soloed ? 'bg-emerald-500/30 text-emerald-400 border-emerald-500/50' : 'bg-white/5 text-gray-500 border-white/10 hover:text-white'
          }`}>
          S
        </button>
      </div>
    </div>
  );
}

function VUMeter({ level, color }: { level: number; color: string }) {
  return (
    <div className="w-1.5 h-32 bg-[#1a1d25] rounded-full overflow-hidden relative">
      <div className="absolute bottom-0 left-0 right-0 transition-all duration-75 rounded-full"
        style={{ height: `${level}%`, backgroundColor: level > 85 ? '#ef4444' : level > 70 ? '#eab308' : color || '#22c55e' }} />
      {/* dB marks */}
      <div className="absolute inset-0 flex flex-col justify-between py-1 pointer-events-none">
        {[0, 20, 40, 60, 80, 100].map(mark => (
          <div key={mark} className="h-px bg-white/10" />
        ))}
      </div>
    </div>
  );
}

function PanKnob({ value, onChange, size = 24 }: { value: number; onChange: (v: number) => void; size?: number }) {
  const rotation = (value / 100) * 270 - 135; // -135° to +135°

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -5 : 5;
    onChange(Math.max(0, Math.min(100, value + delta)));
  };

  return (
    <div className="flex flex-col items-center">
      <div
        className={`rounded-full bg-[#1a1d25] border border-white/20 flex items-center justify-center cursor-pointer hover:border-white/40 transition-colors`}
        style={{ width: size, height: size }}
        onWheel={handleWheel}
        onClick={() => onChange(50)} // Click to center
      >
        <div className="w-1 h-2 bg-white rounded-full origin-bottom"
          style={{ transform: `rotate(${rotation}deg) translateY(-2px)` }} />
      </div>
      <span className="text-[8px] text-gray-600 mt-0.5">
        {value === 50 ? 'C' : value < 50 ? `L${50 - value}` : `R${value - 50}`}
      </span>
    </div>
  );
}
