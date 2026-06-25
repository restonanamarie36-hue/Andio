import { useState, useRef, useCallback } from 'react';
import { X, Pencil, Eraser, MousePointer } from 'lucide-react';
import { Track, Clip, Note, EditorTool } from '../types';

const SHARP_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const PITCHES: string[] = [];
for (let oct = 5; oct >= 2; oct--) { for (let n = SHARP_NOTES.length - 1; n >= 0; n--) { PITCHES.push(`${SHARP_NOTES[n]}${oct}`); } }
const PIANO_PITCHES = PITCHES.slice(PITCHES.indexOf('E5'), PITCHES.indexOf('C2') + 1);

const ROW_H = 13;
const KEY_W = 46;
const BASE_COL_W = 32;
const isBlack = (p: string) => p.includes('#');
const isC = (p: string) => p.match(/^C\d$/) !== null;

let noteIdCtr = 0;
const genId = () => `n-${Date.now()}-${noteIdCtr++}`;

interface Props {
  track: Track | null; clip: Clip | null; onClose: () => void;
  onNoteAdd: (trackId: string, clipId: string, note: Note) => void;
  onNoteRemove: (trackId: string, clipId: string, noteId: string) => void;
  onNoteResize: (trackId: string, clipId: string, noteId: string, duration: number) => void;
  onNoteMove: (trackId: string, clipId: string, noteId: string, step: number, pitch: string) => void;
}

export default function DetailEditor({ track, clip, onClose, onNoteAdd, onNoteRemove, onNoteResize, onNoteMove }: Props) {
  const [tool, setTool] = useState<EditorTool>('pencil');
  const [zoom, setZoom] = useState(1);
  const [selectedNoteIds, setSelectedNoteIds] = useState<Set<string>>(new Set());
  const gridRef = useRef<HTMLDivElement>(null);
  const interactRef = useRef<'none' | 'drawing' | 'dragging' | 'resizing'>('none');

  const colW = BASE_COL_W * zoom;
  const steps = clip ? clip.length : 16;
  const gridW = steps * colW;
  const gridH = PIANO_PITCHES.length * ROW_H;

  const getPosFromEvent = useCallback((e: React.MouseEvent | MouseEvent, el: HTMLElement) => {
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const step = Math.max(0, Math.min(steps - 1, Math.floor(x / colW)));
    const pitchIdx = Math.max(0, Math.min(PIANO_PITCHES.length - 1, Math.floor(y / ROW_H)));
    return { step, pitch: PIANO_PITCHES[pitchIdx], pitchIdx };
  }, [steps, colW]);

  const handleGridMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!track || !clip || !gridRef.current || e.button !== 0) return;
    const { step, pitch } = getPosFromEvent(e, e.currentTarget);
    const existing = clip.notes.find(n => n.pitch === pitch && step >= n.step && step < n.step + n.duration);

    if (tool === 'eraser') { if (existing) onNoteRemove(track.id, clip.id, existing.id); return; }
    if (tool === 'select') {
      if (existing) {
        setSelectedNoteIds(prev => {
          const next = new Set(prev);
          if (e.shiftKey) { if (next.has(existing.id)) next.delete(existing.id); else next.add(existing.id); }
          else { if (next.has(existing.id) && next.size === 1) next.clear(); else { next.clear(); next.add(existing.id); } }
          return next;
        });
      } else if (!e.shiftKey) { setSelectedNoteIds(new Set()); }
      return;
    }
    // Pencil
    if (existing) {
      interactRef.current = 'dragging';
      const startX = e.clientX; const startY = e.clientY;
      const startStep = existing.step; const startPitchIdx = PIANO_PITCHES.indexOf(existing.pitch);
      const onMove = (me: MouseEvent) => {
        const dStep = Math.round((me.clientX - startX) / colW);
        const dPitch = Math.round((me.clientY - startY) / ROW_H);
        const ns = Math.max(0, Math.min(steps - existing.duration, startStep + dStep));
        const np = Math.max(0, Math.min(PIANO_PITCHES.length - 1, startPitchIdx + dPitch));
        onNoteMove(track.id, clip.id, existing.id, ns, PIANO_PITCHES[np]);
      };
      const onUp = () => { interactRef.current = 'none'; window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
      window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp);
    } else {
      interactRef.current = 'drawing';
      const newNote: Note = { id: genId(), pitch, step, duration: 1, velocity: 0.8 };
      onNoteAdd(track.id, clip.id, newNote);
      const onMove = (me: MouseEvent) => {
        if (!gridRef.current) return;
        const rect = gridRef.current.getBoundingClientRect();
        const nx = me.clientX - rect.left;
        const endStep = Math.max(0, Math.min(steps - 1, Math.floor(nx / colW)));
        const newDur = Math.max(1, endStep - newNote.step + 1);
        onNoteResize(track.id, clip.id, newNote.id, newDur);
      };
      const onUp = () => { interactRef.current = 'none'; window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
      window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp);
    }
  }, [track, clip, tool, colW, steps, getPosFromEvent, onNoteAdd, onNoteRemove, onNoteMove, onNoteResize]);

  const handleNoteResizeStart = (e: React.MouseEvent, note: Note) => {
    if (!track || !clip) return;
    e.stopPropagation();
    interactRef.current = 'resizing';
    const startX = e.clientX; const startDur = note.duration;
    const onMove = (me: MouseEvent) => { const newDur = Math.max(1, Math.min(steps - note.step, startDur + Math.round((me.clientX - startX) / colW))); onNoteResize(track.id, clip.id, note.id, newDur); };
    const onUp = () => { interactRef.current = 'none'; window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
    window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp);
  };

  const tools: { id: EditorTool; Icon: typeof Pencil; label: string }[] = [
    { id: 'pencil', Icon: Pencil, label: 'Pencil' }, { id: 'eraser', Icon: Eraser, label: 'Eraser' }, { id: 'select', Icon: MousePointer, label: 'Select' },
  ];

  return (
    <div className="flex flex-col bg-[#0a0c11] border-t border-white/10 shrink-0" style={{ height: 250 }}>
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-white/10 shrink-0">
        <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">
          Piano Roll{track && <span className="normal-case text-gray-600 ml-1.5">— {track.name}</span>}
        </span>
        <div className="flex items-center gap-0.5 bg-[#1a1d25] rounded-lg p-0.5 ml-2">
          {tools.map(({ id, Icon, label }) => (
            <button key={id} onClick={() => setTool(id)} title={label}
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-all ${tool === id ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}>
              <Icon size={11} /><span className="hidden sm:block">{label}</span>
            </button>
          ))}
        </div>
        {tool === 'select' && selectedNoteIds.size > 0 && (
          <button onClick={() => { if (!track || !clip) return; selectedNoteIds.forEach(id => onNoteRemove(track.id, clip.id, id)); setSelectedNoteIds(new Set()); }}
            className="px-2 py-1 text-xs text-red-400 hover:text-red-300 border border-red-500/30 rounded-md transition-colors">
            Delete {selectedNoteIds.size} selected
          </button>
        )}
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-[10px] text-gray-600">Zoom</span>
          <input type="range" min={0.5} max={3} step={0.25} value={zoom} onChange={e => setZoom(Number(e.target.value))} className="w-20 accent-cyan-400 h-0.5" />
        </div>
        <button onClick={onClose} className="ml-1 text-gray-600 hover:text-white transition-colors"><X size={14} /></button>
      </div>
      {!track || !clip ? (
        <div className="flex-1 flex items-center justify-center text-gray-700 text-xs">Click a clip in the arranger to edit notes</div>
      ) : (
        <div className="flex flex-1 overflow-hidden">
          <div className="shrink-0 overflow-y-auto overflow-x-hidden" style={{ width: KEY_W }}>
            {PIANO_PITCHES.map((p, i) => (
              <div key={i}
                className={`flex items-center justify-end pr-1 border-b select-none ${isBlack(p) ? 'bg-[#252830] border-black/50 text-gray-600' : 'bg-[#363a44] border-black/30 text-gray-500'}`}
                style={{ height: ROW_H }}>
                {isC(p) && <span className="text-[8px] font-mono mr-0.5">{p}</span>}
              </div>
            ))}
          </div>
          <div className="flex-1 overflow-auto">
            <div ref={gridRef} className="relative select-none" style={{ width: gridW, height: gridH, cursor: tool === 'pencil' ? 'crosshair' : tool === 'eraser' ? 'cell' : 'default' }}
              onMouseDown={handleGridMouseDown}>
              {PIANO_PITCHES.map((p, i) => (
                <div key={i} className={`absolute left-0 right-0 border-b ${isBlack(p) ? 'bg-[#161820] border-black/25' : 'bg-[#1c1f26] border-black/15'}`}
                  style={{ top: i * ROW_H, height: ROW_H }} />
              ))}
              {Array.from({ length: steps + 1 }).map((_, i) => (
                <div key={i} className={`absolute top-0 bottom-0 w-px pointer-events-none ${i % 16 === 0 ? 'bg-white/15' : i % 4 === 0 ? 'bg-white/8' : 'bg-white/3'}`}
                  style={{ left: i * colW }} />
              ))}
              {clip.notes.map(note => {
                const pitchIdx = PIANO_PITCHES.indexOf(note.pitch);
                if (pitchIdx < 0) return null;
                const isSelected = selectedNoteIds.has(note.id);
                const alpha = Math.round((note.velocity ?? 0.8) * 255).toString(16).padStart(2, '0');
                return (
                  <div key={note.id}
                    className={`absolute rounded-sm z-10 group flex items-stretch cursor-grab active:cursor-grabbing ${isSelected ? 'ring-1 ring-white/60' : ''}`}
                    style={{ left: note.step * colW + 1, top: pitchIdx * ROW_H + 1, width: Math.max(note.duration * colW - 2, 4), height: ROW_H - 2, backgroundColor: `${track.color}${alpha}` }}
                    onClick={e => { if (tool === 'eraser') { e.stopPropagation(); onNoteRemove(track.id, clip.id, note.id); } }}>
                    <div className="flex-1 min-w-0" />
                    <div className="w-1.5 h-full bg-black/20 hover:bg-black/40 cursor-ew-resize shrink-0 rounded-r-sm"
                      onMouseDown={e => handleNoteResizeStart(e, note)} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      <div className="px-3 py-0.5 border-t border-white/5 shrink-0">
        <span className="text-[9px] text-gray-700">
          {clip ? `${clip.notes.length} notes · Pencil: click to draw, drag to move · Eraser: click to delete · Select: click+Shift, Delete key` : 'Click a clip in the arranger to edit notes here'}
        </span>
      </div>
    </div>
  );
}
