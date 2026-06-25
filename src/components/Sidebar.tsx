import { useState } from 'react';
import { Search, ChevronDown, ChevronRight, Drum, Piano, Music, Guitar, Mic2, Radio, Waves, Plus, Keyboard } from 'lucide-react';
import { TrackCategory, InstrumentType } from '../types';

interface InstrumentDef {
  type: InstrumentType;
  name: string;
  category: TrackCategory;
  Icon: typeof Drum;
}

const instruments: InstrumentDef[] = [
  { type: 'kick', name: 'Kick Drum', category: 'DRUMS', Icon: Drum },
  { type: 'snare', name: 'Snare', category: 'DRUMS', Icon: Drum },
  { type: 'hihat', name: 'Hi-Hat', category: 'DRUMS', Icon: Waves },
  { type: 'piano', name: 'Piano', category: 'MELODIC', Icon: Piano },
  { type: 'pluck', name: 'Synth Pluck', category: 'MELODIC', Icon: Radio },
  { type: 'bass', name: 'Bass', category: 'JAZZ', Icon: Guitar },
  { type: 'sax', name: 'Saxophone', category: 'JAZZ', Icon: Mic2 },
  { type: 'guitar', name: 'Guitar', category: 'JAZZ', Icon: Music },
];

const categoryColors: Record<TrackCategory, string> = {
  DRUMS: 'text-red-400',
  MELODIC: 'text-blue-400',
  JAZZ: 'text-emerald-400',
};

const categoryBg: Record<TrackCategory, string> = {
  DRUMS: 'bg-red-500/8 border-red-500/20 hover:bg-red-500/15',
  MELODIC: 'bg-blue-500/8 border-blue-500/20 hover:bg-blue-500/15',
  JAZZ: 'bg-emerald-500/8 border-emerald-500/20 hover:bg-emerald-500/15',
};

const iconColor: Record<TrackCategory, string> = {
  DRUMS: 'text-red-400/70',
  MELODIC: 'text-blue-400/70',
  JAZZ: 'text-emerald-400/70',
};

interface Props {
  onTrackAdd: (instrumentType: InstrumentType, category: TrackCategory) => void;
}

export default function Sidebar({ onTrackAdd }: Props) {
  const [search, setSearch] = useState('');
  const [collapsed, setCollapsed] = useState<Record<TrackCategory, boolean>>({
    DRUMS: false, MELODIC: false, JAZZ: false,
  });
  const [midiMode, setMidiMode] = useState(false);

  const filtered = instruments.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  const categories: TrackCategory[] = ['DRUMS', 'MELODIC', 'JAZZ'];

  return (
    <aside className="w-56 shrink-0 bg-[#111318] border-r border-white/10 flex flex-col overflow-hidden">
      <div className="px-3 py-3 border-b border-white/10">
        <p className="text-xs font-semibold text-gray-300 uppercase tracking-widest mb-2">
          Instruments
        </p>
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search sounds..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-[#1a1d25] border border-white/10 rounded-lg text-xs text-white placeholder-gray-600 outline-none focus:border-white/20"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-2 space-y-1">
        {categories.map(cat => {
          const items = filtered.filter(i => i.category === cat);
          if (items.length === 0) return null;
          const isCollapsed = collapsed[cat];

          return (
            <div key={cat} className="px-2">
              <button
                onClick={() => setCollapsed(c => ({ ...c, [cat]: !c[cat] }))}
                className="flex items-center justify-between w-full px-2 py-1.5 rounded-md hover:bg-white/5 transition-colors group"
              >
                <span className={`text-xs font-bold tracking-widest ${categoryColors[cat]}`}>
                  {cat}
                </span>
                {isCollapsed ? (
                  <ChevronRight size={12} className="text-gray-600 group-hover:text-gray-400" />
                ) : (
                  <ChevronDown size={12} className="text-gray-600 group-hover:text-gray-400" />
                )}
              </button>

              {!isCollapsed && (
                <div className="mt-0.5 space-y-0.5">
                  {items.map(({ type, name, Icon, category }) => (
                    <button
                      key={type}
                      onClick={() => onTrackAdd(type, category)}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md border transition-colors group ${categoryBg[cat]}`}
                      draggable
                      onDragStart={e => e.dataTransfer.setData('instrument', type)}>
                      <Icon size={12} className={iconColor[cat]} />
                      <span className="flex-1 text-left text-xs text-gray-300 truncate">{name}</span>
                      <Plus size={10} className="opacity-0 group-hover:opacity-50 text-gray-400" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="px-3 py-2 border-t border-white/10 shrink-0 space-y-2">
        <button
          onClick={() => setMidiMode(m => !m)}
          className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-colors ${
            midiMode ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'border border-white/10 text-gray-500 hover:text-white'
          }`}>
          <Keyboard size={12} />
          MIDI Input
          {midiMode && <span className="ml-auto text-[9px] bg-emerald-500/30 px-1.5 py-0.5 rounded">Active</span>}
        </button>
      </div>
    </aside>
  );
}
