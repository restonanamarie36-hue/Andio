import { Clip, Note } from '../types';

interface Props {
  clip: Clip;
  trackColor: string;
  onVelocityChange: (noteId: string, velocity: number) => void;
  notes: Note[];
}

export default function VelocityLane({ clip, trackColor, onVelocityChange, notes }: Props) {
  const HEIGHT = 48;
  const steps = clip.length;
  const colW = 100 / steps;

  const handleMouseDown = (e: React.MouseEvent, note: Note) => {
    e.preventDefault();
    const startY = e.clientY;
    const startVel = note.velocity * 100;

    const onMove = (me: MouseEvent) => {
      const dy = startY - me.clientY;
      const newVel = Math.max(10, Math.min(100, startVel + dy));
      onVelocityChange(note.id, newVel / 100);
    };

    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  return (
    <div className="border-t border-white/10 shrink-0 bg-[#0a0c11]" style={{ height: HEIGHT }}>
      <div className="flex items-center px-3 h-6 border-b border-white/5">
        <span className="text-[9px] text-gray-600 uppercase tracking-wider">Velocity</span>
      </div>
      <div className="relative h-[calc(100%-24px)]">
        {Array.from({ length: steps + 1 }).map((_, i) => (
          <div key={i} className="absolute top-0 bottom-0 w-px bg-white/5" style={{ left: `${i * colW}%` }} />
        ))}
        {notes.map(note => {
          const left = (note.step / steps) * 100;
          const heightPct = note.velocity * 100;
          const widthPct = Math.max((note.duration / steps) * 100, (steps / 128));
          return (
            <button key={note.id}
              className="absolute bottom-0 cursor-ns-resize group"
              style={{ left: `${left}%`, width: `${widthPct}%` }}
              onMouseDown={e => handleMouseDown(e, note)}>
              <div className="w-full rounded-t-sm transition-all group-hover:opacity-80"
                style={{
                  height: `${heightPct}%`,
                  backgroundColor: trackColor,
                  opacity: 0.5 + note.velocity * 0.5,
                }} />
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[8px] text-gray-500 opacity-0 group-hover:opacity-100">
                {Math.round(note.velocity * 127)}
              </span>
            </button>
          );
        })}
        {notes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-[10px] text-gray-600">No notes</div>
        )}
      </div>
    </div>
  );
}
