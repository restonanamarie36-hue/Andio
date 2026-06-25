interface MetronomeProps {
  enabled: boolean;
  countInBars: number;
  onToggle: () => void;
  onCountInChange: (bars: number) => void;
}

export default function Metronome({ enabled, countInBars, onToggle, onCountInChange }: MetronomeProps) {
  return (
    <div className="flex items-center gap-1.5 px-2 py-1 bg-[#1a1d25] border border-white/10 rounded-lg">
      <button onClick={onToggle}
        className={`text-xs font-bold px-1.5 py-0.5 rounded transition-colors ${
          enabled ? 'bg-emerald-500/30 text-emerald-400' : 'bg-white/5 text-gray-500 hover:text-white'
        }`}>
        MET
      </button>
      {enabled && (
        <select value={countInBars} onChange={e => onCountInChange(Number(e.target.value))}
          className="bg-transparent text-white text-xs outline-none cursor-pointer">
          <option value={0}>No Count-in</option>
          <option value={1}>1 bar count-in</option>
          <option value={2}>2 bars count-in</option>
        </select>
      )}
    </div>
  );
}
