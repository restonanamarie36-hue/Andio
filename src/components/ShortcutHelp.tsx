import { useState, useEffect } from 'react';
import { X, Keyboard, Play, Square, Save, Undo2, Redo2, Trash2, Copy, Music2, Mic, Search } from 'lucide-react';

interface ShortcutHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Shortcut {
  keys: string[];
  description: string;
  icon?: typeof Play;
}

const SHORTCUT_GROUPS: { group: string; shortcuts: Shortcut[] }[] = [
  {
    group: 'Playback',
    shortcuts: [
      { keys: ['Space'], description: 'Play / Stop', icon: Play },
      { keys: ['R'], description: 'Stop & Rewind', icon: Square },
    ]
  },
  {
    group: 'Edit',
    shortcuts: [
      { keys: ['Ctrl', 'Z'], description: 'Undo', icon: Undo2 },
      { keys: ['Ctrl', 'Y'], description: 'Redo', icon: Redo2 },
      { keys: ['Ctrl', 'S'], description: 'Save Project', icon: Save },
      { keys: ['Ctrl', 'C'], description: 'Copy Selected Notes', icon: Copy },
      { keys: ['Ctrl', 'V'], description: 'Paste Notes', icon: Copy },
      { keys: ['Delete'], description: 'Delete Selected', icon: Trash2 },
      { keys: ['Q'], description: 'Quantize Selected Notes', icon: Music2 },
    ]
  },
  {
    group: 'Views',
    shortcuts: [
      { keys: ['1'], description: 'Arranger View', icon: null },
      { keys: ['2'], description: 'Mixer View', icon: null },
      { keys: ['3'], description: 'Automation View', icon: null },
    ]
  },
  {
    group: 'Audio',
    shortcuts: [
      { keys: ['Ctrl', 'R'], description: 'Record Audio', icon: Mic },
    ]
  },
];

export default function ShortcutHelp({ isOpen, onClose }: ShortcutHelpProps) {
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = filter
    ? SHORTCUT_GROUPS.map(g => ({
        ...g,
        shortcuts: g.shortcuts.filter(s =>
          s.description.toLowerCase().includes(filter.toLowerCase())
        )
      })).filter(g => g.shortcuts.length > 0)
    : SHORTCUT_GROUPS;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#141720] border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Keyboard size={18} className="text-cyan-400" />
            <h2 className="font-semibold text-white">Keyboard Shortcuts</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-4 border-b border-white/10">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={filter}
              onChange={e => setFilter(e.target.value)}
              placeholder="Search shortcuts..."
              className="w-full pl-9 pr-3 py-2 bg-[#1a1d25] border border-white/10 rounded-lg text-white text-sm placeholder-gray-600 outline-none focus:border-cyan-500/50"
              autoFocus
            />
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto p-4">
          {filtered.map(({ group, shortcuts }) => (
            <div key={group} className="mb-4 last:mb-0">
              <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-2">
                {group}
              </h3>
              <div className="space-y-1">
                {shortcuts.map((shortcut, i) => (
                  <div key={i}
                    className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-white/5 transition-colors">
                    <span className="text-sm text-gray-300">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, j) => (
                        <span key={j}>
                          <kbd className="px-2 py-0.5 bg-[#1a1d25] border border-white/20 rounded text-[10px] text-gray-400 font-mono">
                            {key}
                          </kbd>
                          {j < shortcut.keys.length - 1 && (
                            <span className="text-gray-600 mx-0.5">+</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <p className="text-center text-gray-500 text-sm py-8">
              No shortcuts found matching "{filter}"
            </p>
          )}
        </div>

        <div className="px-6 py-3 border-t border-white/10 bg-[#0d0f14]/50 text-center">
          <p className="text-[10px] text-gray-600">
            Press <kbd className="px-1.5 py-0.5 bg-[#1a1d25] border border-white/10 rounded text-[9px]">Esc</kbd> to close
          </p>
        </div>
      </div>
    </div>
  );
}
