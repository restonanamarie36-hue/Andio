import { useRef, useState } from 'react';
import { Track, AutomationType, AutomationPoint } from '../types';
import { STEP_WIDTH as STEP_W } from '../lib/constants';

let pointIdCtr = 0;
const genPointId = () => `ap-${Date.now()}-${pointIdCtr++}`;

interface Props {
  track: Track | null;
  totalSteps: number;
  onPointAdd: (trackId: string, type: AutomationType, point: AutomationPoint) => void;
  onPointRemove: (trackId: string, pointId: string) => void;
  onPointMove: (trackId: string, pointId: string, newStep: number, newValue: number) => void;
}

export default function AutomationView({
  track, totalSteps, onPointAdd, onPointRemove, onPointMove,
}: Props) {
  const [automationType, setAutomationType] = useState<AutomationType>('volume');
  const [value, setValue] = useState(75);
  const containerRef = useRef<HTMLDivElement>(null);

  if (!track) {
    return (
      <div className="flex flex-col h-48 bg-[#0a0c11] border-t border-white/10">
        <div className="flex items-center px-4 py-2 border-b border-white/10 shrink-0">
          <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Automation</span>
        </div>
        <div className="flex-1 flex items-center justify-center text-gray-600 text-xs">
          Select a track to edit automation
        </div>
      </div>
    );
  }

  const lane = track.automation?.find(a => a.type === automationType);
  const points = lane?.points ?? [];

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const step = Math.floor(x / STEP_W);
    const val = Math.max(0, Math.min(100, 100 - (y / rect.height) * 100));

    onPointAdd(track.id, automationType, {
      id: genPointId(),
      step: Math.max(0, Math.min(totalSteps - 1, step)),
      value: val,
    });
  };

  const handlePointMove = (e: React.MouseEvent, point: AutomationPoint) => {
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const startStep = point.step;
    const startVal = point.value;

    const onMove = (me: MouseEvent) => {
      const dx = me.clientX - startX;
      const dy = me.clientY - startY;
      const newStep = Math.max(0, Math.min(totalSteps - 1, startStep + Math.round(dx / STEP_W)));
      const newVal = Math.max(0, Math.min(100, startVal - (dy / 200) * 100));
      onPointMove(track.id, point.id, newStep, newVal);
    };

    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const getTypeLabel = (type: AutomationType) => {
    switch (type) {
      case 'volume': return 'Volume';
      case 'pan': return 'Pan';
      case 'filter': return 'Filter';
    }
  };

  const getTypeColor = (type: AutomationType) => {
    switch (type) {
      case 'volume': return '#22c55e';
      case 'pan': return '#3b82f6';
      case 'filter': return '#eab308';
    }
  };

  const currentPoints = points.filter(p => p.step >= 0 && p.step <= totalSteps - 1);
  // Build interpolated points for line drawing
  const linePoints: string[] = [];
  if (currentPoints.length > 0) {
    const sorted = [...currentPoints].sort((a, b) => a.step - b.step);
    linePoints.push(`0,${100 - (sorted[0].value / 100) * 100}`);
    for (const p of sorted) {
      linePoints.push(`${p.step * STEP_W},${100 - (p.value / 100) * 100}`);
    }
    linePoints.push(`${totalSteps * STEP_W},${100 - (sorted[sorted.length - 1].value / 100) * 100}`);
  }

  return (
    <div className="flex flex-col bg-[#0a0c11] border-t border-white/10 shrink-0" style={{ height: 192 }}>
      <div className="flex items-center gap-3 px-4 py-2 border-b border-white/10 shrink-0">
        <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Automation</span>
        <div className="flex items-center gap-1 bg-[#1a1d25] rounded-lg p-0.5">
          {(['volume', 'pan', 'filter'] as AutomationType[]).map(type => (
            <button
              key={type}
              onClick={() => setAutomationType(type)}
              className={`px-2 py-1 rounded text-[10px] transition-colors ${
                automationType === type ? 'text-white bg-white/10' : 'text-gray-500 hover:text-white'
              }`}
            >
              {getTypeLabel(type)}
            </button>
          ))}
        </div>
        <span className="text-[10px] text-gray-600 ml-auto">Click to add points, drag to move</span>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden relative">
        <div ref={containerRef}
          className="relative cursor-crosshair"
          style={{ width: totalSteps * STEP_W, height: '100%' }}
          onClick={handleClick}
        >
          {/* Grid */}
          {Array.from({ length: totalSteps + 1 }).map((_, i) => (
            <div key={i} className={`absolute top-0 bottom-0 w-px ${i % 16 === 0 ? 'bg-white/12' : i % 4 === 0 ? 'bg-white/6' : 'bg-white/2'}`}
              style={{ left: i * STEP_W }} />
          ))}
          {/* Horizontal lines */}
          {[0, 25, 50, 75, 100].map(pct => (
            <div key={pct} className="absolute left-0 right-0 h-px bg-white/5"
              style={{ top: `${pct}%` }} />
          ))}

          {/* Line connecting points */}
          {currentPoints.length > 1 && (
            <svg className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%' }}>
              <polyline
                points={linePoints.join(' ')}
                fill="none"
                stroke={getTypeColor(automationType)}
                strokeWidth={2}
                opacity={0.6}
              />
            </svg>
          )}

          {/* Points */}
          {currentPoints.map(point => (
            <div
              key={point.id}
              className={`absolute w-3 h-3 rounded-full cursor-move transform -translate-x-1/2 -translate-y-1/2 border-2 hover:scale-125 transition-transform`}
              style={{
                left: point.step * STEP_W,
                top: `${100 - (point.value / 100) * 100}%`,
                backgroundColor: getTypeColor(automationType),
                borderColor: 'white',
              }}
              onMouseDown={e => handlePointMove(e, point)}
              onDoubleClick={e => { e.stopPropagation(); onPointRemove(track.id, point.id); }}
              title={`${getTypeLabel(automationType)}: ${Math.round(point.value)}%
Double-click to delete`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
