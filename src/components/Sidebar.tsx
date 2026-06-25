import { Search, ChevronDown, ChevronRight, Drum, Piano, Music, Guitar, Mic2, Radio, Waves } from 'lucide-react';
import { useState } from 'react';
import { TrackCategory } from '../types';

interface InstrumentDef {
  name: string;
  category: TrackCategory;
  Icon: typeof Drum;
}

const instruments: InstrumentDef[] = [
  { name: 'Basic Kick', category: 'DRUMS', Icon: Drum },
  { name: 'Snare 1', category: 'DRUMS', Icon: Drum },
  { name: 'Closed HiHat', category: 'DRUMS', Icon: Waves },
  { name: 'Grand Piano', category: 'MELODIC', Icon: Piano },
  { name: 'Synth Pluck', category: 'MELODIC', Icon: Radio },
  { name: 'Acoustic Bass', category: 'JAZZ', Icon: Guitar },
  { name: 'Tenor Sax Alto', category: 'JAZZ', Icon: Mic2 },
  { name: 'Jazz Guitar', category: 'JAZZ', Icon: Music },
];

const categoryColors: Record<TrackCategory, string> = {
  DRUMS: 'text-red-400',
  MELODIC: 'text-blue-400',
  JAZZ: 'text-amber-400',
};

const categoryBg: Record<TrackCategory, string> = {
  DRUMS: 'bg-red-500/8 border-red-500/20 hover:bg-red-500/15',
  MELODIC: 'bg-blue-500/8 border-blue-500/20 hover:bg-blue-500/15',
  JAZZ: 'bg-amber-500/8 border-amber-500/20 hover:bg-amber-500/15',
};

const iconColor: Record<TrackCategory, string> = {
  DRUMS: 'text-red-400/70',
  MELODIC: 'text-blue-400/70',
  JAZZ: 'text-amber-400/70',
};

export default function Sidebar() {
  const [search, setSearch] = useState('');
  const [collapsed, setCollapsed] = useState<Record<TrackCategory, boolean>>({
    DRUMS: false,
    MELODIC: false,
    JAZZ: false,
  });

  const filtered = instruments.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  const categories: TrackCategory[] = ['DRUMS', 'MELODIC', 'JAZZ'];

  return (
    <aside className="w-56 shrink-0 bg-[#111318] border-r border-white/10 flex flex-col overflow-hidden">
      <div className="px-3 py-3 border-b border-white/10">
        <p className="text-xs font-semibold text-gray-300 uppercase tracking-widest mb-2">
          Instruments & Library
        </p>
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search sounds…"
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
                  {items.map(({ name, Icon }) => (
                    <div
                      key={name}
                      draggable
                      className={`flex items-center gap-2 px-2 py-1.5 rounded-md border cursor-grab active:cursor-grabbing transition-colors ${categoryBg[cat]}`}
                    >
                      <Icon size={12} className={iconColor[cat]} />
                      <span className="text-xs text-gray-300 truncate">{name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
