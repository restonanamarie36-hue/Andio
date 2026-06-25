import { useRef } from 'react';
import { Volume2, VolumeX, X } from 'lucide-react';
import { Track, Clip } from '../types';

const STEPS_PER_BAR = 16;
const BEATS_PER_BAR = 4;
const STEPS_PER_BEAT = 4;
const BEAT_W = 56;
const STEP_W = BEAT_W / STEPS_PER_BEAT;
const BAR_W = BEAT_W * BEATS_PER_BAR;
const TRACK_H = 68;
const HEADER_W = 200;
const RULER_H = 40;
const RESIZE_HANDLE_W = 8;

interface Props {
  tracks: Track[]; loopBars: number; selectedClipId: string | null; currentStep: number;
  onTrackVolumeChange: (trackId: string, vol: number) => void;
  onTrackMuteToggle: (trackId: string) => void;
  onTrackSoloToggle: (trackId: string) => void;
  onClipSelect: (trackId: string, clipId: string) => void;
  onClipAdd: (trackId: string, startStep: number) => void;
  onClipMove: (trackId: string, clipId: string, newStartStep: number) => void;
  onClipResize: (trackId: string, clipId: string, newLength: number) => void;
  onClipDelete: (trackId: string, clipId: string) => void;
}

export default function Arranger({ tracks, loopBars, selectedClipId, currentStep, onTrackVolumeChange, onTrackMuteToggle, onTrackSoloToggle, onClipSelect, onClipAdd, onClipMove, onClipResize, onClipDelete }: Props) {
  const TOTAL_STEPS = loopBars * STEPS_PER_BAR;
  const gridW = Math.max(TOTAL_STEPS * STEP_W, 560);
  const playheadLeft = currentStep >= 0 ? currentStep * STEP_W : -1;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center px-4 py-1.5 border-b border-white/10 shrink-0 bg-[#0d0f14]">
        <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Arranger / Timeline</span>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="shrink-0 flex flex-col" style={{ width: HEADER_W }}>
          <div className="shrink-0 border-b border-r border-white/10 bg-[#0a0c11]" style={{ height: RULER_H }} />
          <div className="flex-1 overflow-y-hidden">
            {tracks.map(track => (
              <TrackLabel key={track.id} track={track}
                onVolumeChange={v => onTrackVolumeChange(track.id, v)}
                onMuteToggle={() => onTrackMuteToggle(track.id)}
                onSoloToggle={() => onTrackSoloToggle(track.id)} />
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-x-auto overflow-y-hidden relative">
          <div style={{ width: gridW }}>
            <div className="relative border-b border-white/10 bg-[#0a0c11] shrink-0 select-none" style={{ height: RULER_H }}>
              {Array.from({ length: loopBars }).map((_, bar) => (
                <div key={bar} className="absolute top-0 h-full" style={{ left: bar * BAR_W, width: BAR_W }}>
                  <div className="absolute top-0 left-0 h-5 flex items-center px-1.5 border-l border-white/15">
                    <span className="text-[9px] font-semibold text-gray-500">Bar {bar + 1}</span>
                  </div>
                  {Array.from({ length: BEATS_PER_BAR }).map((_, beat) => (
                    <div key={beat} className="absolute bottom-0 h-5 flex items-center" style={{ left: beat * BEAT_W, width: BEAT_W }}>
                      <div className={`absolute left-0 top-0 bottom-0 w-px ${beat === 0 ? 'bg-white/15' : 'bg-white/6'}`} />
                      <span className="text-[9px] text-gray-600 pl-1">{beat + 1}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div className="relative">
              {tracks.map(track => (
                <TrackRow key={track.id} track={track} gridW={gridW} totalSteps={TOTAL_STEPS} selectedClipId={selectedClipId}
                  onClipSelect={clipId => onClipSelect(track.id, clipId)}
                  onClipAdd={step => onClipAdd(track.id, step)}
                  onClipMove={(clipId, step) => onClipMove(track.id, clipId, step)}
                  onClipResize={(clipId, len) => onClipResize(track.id, clipId, len)}
                  onClipDelete={clipId => onClipDelete(track.id, clipId)} />
              ))}
              {playheadLeft >= 0 && <div className="absolute top-0 bottom-0 w-0.5 bg-red-500/80 z-30 pointer-events-none" style={{ left: playheadLeft }} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TrackLabel({ track, onVolumeChange, onMuteToggle, onSoloToggle }: { track: Track; onVolumeChange: (v: number) => void; onMuteToggle: () => void; onSoloToggle: () => void }) {
  return (
    <div className="flex flex-col justify-center gap-1 px-2 py-1 border-b border-r border-white/8 bg-[#111318]" style={{ height: TRACK_H }}>
      <div className="flex items-center justify-between gap-1">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: track.color }} />
          <span className="text-xs font-medium text-white truncate leading-tight">{track.name}</span>
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          <button onClick={onMuteToggle} title="Mute"
            className={`w-5 h-5 rounded text-[9px] font-bold border transition-colors ${track.muted ? 'bg-yellow-500/30 text-yellow-400 border-yellow-500/50' : 'bg-white/5 text-gray-500 border-white/10 hover:text-white'}`}>M</button>
          <button onClick={onSoloToggle} title="Solo"
            className={`w-5 h-5 rounded text-[9px] font-bold border transition-colors ${track.soloed ? 'bg-emerald-500/30 text-emerald-400 border-emerald-500/50' : 'bg-white/5 text-gray-500 border-white/10 hover:text-white'}`}>S</button>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        {track.muted ? <VolumeX size={9} className="text-gray-600 shrink-0" /> : <Volume2 size={9} className="text-gray-500 shrink-0" />}
        <input type="range" min={0} max={100} value={track.volume} onChange={e => onVolumeChange(Number(e.target.value))}
          className="flex-1 h-0.5 cursor-pointer" style={{ accentColor: track.color }} />
        <span className="text-[9px] text-gray-600 w-7 text-right shrink-0">{track.volume}%</span>
      </div>
    </div>
  );
}

function TrackRow({ track, gridW, totalSteps, selectedClipId, onClipSelect, onClipAdd, onClipMove, onClipResize, onClipDelete }: {
  track: Track; gridW: number; totalSteps: number; selectedClipId: string | null;
  onClipSelect: (clipId: string) => void; onClipAdd: (step: number) => void;
  onClipMove: (clipId: string, step: number) => void; onClipResize: (clipId: string, len: number) => void; onClipDelete: (clipId: string) => void;
}) {
  const isDraggingRef = useRef(false);

  const handleRowClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDraggingRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const step = Math.floor(x / STEP_W);
    const hit = track.clips.find(c => step >= c.startStep && step < c.startStep + c.length);
    if (!hit) {
      const snapped = Math.floor(step / STEPS_PER_BEAT) * STEPS_PER_BEAT;
      const overlaps = track.clips.some(c => snapped < c.startStep + c.length && snapped + STEPS_PER_BAR > c.startStep);
      if (!overlaps) onClipAdd(snapped);
    }
  };

  const startDrag = (e: React.MouseEvent, clip: Clip) => {
    e.stopPropagation();
    const startX = e.clientX;
    const startStep = clip.startStep;
    isDraggingRef.current = false;

    const onMove = (me: MouseEvent) => {
      const dx = me.clientX - startX;
      if (Math.abs(dx) > 3) isDraggingRef.current = true;
      const delta = Math.round(dx / STEP_W);
      const newStart = Math.max(0, Math.min(totalSteps - clip.length, startStep + delta));
      const others = track.clips.filter(c => c.id !== clip.id);
      const blocked = others.some(c => newStart < c.startStep + c.length && newStart + clip.length > c.startStep);
      if (!blocked) onClipMove(clip.id, newStart);
    };
    const onUp = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); setTimeout(() => { isDraggingRef.current = false; }, 50); };
    window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp);
  };

  const startResize = (e: React.MouseEvent, clip: Clip) => {
    e.stopPropagation();
    const startX = e.clientX;
    const startLen = clip.length;
    isDraggingRef.current = true;
    const onMove = (me: MouseEvent) => { const dx = me.clientX - startX; const newLen = Math.max(STEPS_PER_BEAT, startLen + Math.round(dx / STEP_W)); onClipResize(clip.id, newLen); };
    const onUp = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); setTimeout(() => { isDraggingRef.current = false; }, 50); };
    window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp);
  };

  return (
    <div className="relative border-b border-white/6 cursor-pointer" style={{ height: TRACK_H, width: gridW }} onClick={handleRowClick}>
      {Array.from({ length: totalSteps }).map((_, i) => (
        <div key={i} className={`absolute top-0 bottom-0 w-px ${i % STEPS_PER_BAR === 0 ? 'bg-white/12' : i % STEPS_PER_BEAT === 0 ? 'bg-white/6' : 'bg-white/2'}`} style={{ left: i * STEP_W }} />
      ))}
      {track.clips.map(clip => {
        const left = clip.startStep * STEP_W;
        const width = clip.length * STEP_W;
        const isSelected = clip.id === selectedClipId;
        return (
          <div key={clip.id}
            className={`absolute top-2 bottom-2 rounded-md overflow-hidden border transition-all select-none ${isSelected ? 'border-white/50 z-10' : 'border-black/30 z-0 hover:border-white/20'}`}
            style={{ left, width, backgroundColor: track.color + (isSelected ? 'dd' : 'aa') }}
            onMouseDown={e => startDrag(e, clip)}
            onClick={e => { e.stopPropagation(); if (!isDraggingRef.current) onClipSelect(clip.id); }}>
            <div className="absolute inset-0 opacity-25 overflow-hidden">
              {clip.notes.slice(0, 30).map((n, i) => (
                <div key={i} className="absolute h-0.5 bg-white rounded-full"
                  style={{ left: `${(n.step / Math.max(clip.length, 1)) * 100}%`, width: `${Math.max((n.duration / Math.max(clip.length, 1)) * 100, 1)}%`, top: `${20 + (i % 6) * 10}%` }} />
              ))}
            </div>
            <span className="absolute bottom-1 left-1.5 text-[8px] text-white/50 font-medium pointer-events-none truncate">{track.name}</span>
            {isSelected && (
              <button className="absolute top-0.5 right-5 w-4 h-4 flex items-center justify-center text-white/40 hover:text-white/90 transition-colors z-20"
                onMouseDown={e => e.stopPropagation()} onClick={e => { e.stopPropagation(); onClipDelete(clip.id); }}><X size={9} /></button>
            )}
            <div className="absolute right-0 top-0 bottom-0 cursor-ew-resize hover:bg-white/20 transition-colors z-20" style={{ width: RESIZE_HANDLE_W }}
              onMouseDown={e => startResize(e, clip)} onClick={e => e.stopPropagation()} />
          </div>
        );
      })}
    </div>
  );
}
