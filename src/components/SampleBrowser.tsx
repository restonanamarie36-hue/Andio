import { useState, useRef } from 'react';
import { Folder, Music, Headphones, Volume2, Upload, Play, Square, Search, Grid, List } from 'lucide-react';
import { BUILT_IN_SAMPLES, SampleFile } from '../types';

interface Props {
  onDrop: (fileId: string, step: number) => void;
  onFileUpload: (file: File) => Promise<string>;
}

const categoryIcons: Record<string, typeof Music> = {
  drums: Volume2,
  melodic: Music,
  fx: Headphones,
  vocals: Headphones,
};

export default function SampleBrowser({ onDrop, onFileUpload }: Props) {
  const [category, setCategory] = useState<'all' | 'drums' | 'melodic' | 'fx' | 'vocals'>('all');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [customSamples, setCustomSamples] = useState<SampleFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const filteredSamples = [...BUILT_IN_SAMPLES, ...customSamples].filter(s => {
    if (category !== 'all' && s.category !== category) return false;
    if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handlePlay = async (sample: SampleFile) => {
    if (playingId === sample.id) {
      audioRef.current?.pause();
      setPlayingId(null);
      return;
    }

    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.onended = () => setPlayingId(null);
    }

    // Generate a simple oscillator sound for built-in samples
    if (sample.id.startsWith('kick') || sample.id.startsWith('snare') || sample.id.startsWith('hihat') ||
        sample.id.startsWith('clap') || sample.id.startsWith('rim')) {
      try {
        const audioCtx = new AudioContext();
        const oscillator = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        oscillator.connect(gain);
        gain.connect(audioCtx.destination);

        oscillator.frequency.value = sample.id.includes('kick') ? 60 :
                                       sample.id.includes('snare') ? 200 :
                                       sample.id.includes('hihat') ? 400 :
                                       sample.id.includes('clap') ? 800 : 400;
        oscillator.type = sample.id.includes('kick') ? 'sine' :
                          sample.id.includes('snare') ? 'triangle' :
                          sample.id.includes('hihat') ? 'square' : 'sawtooth';

        gain.gain.setValueAtTime(0.5, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + sample.duration);

        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + sample.duration);

        setPlayingId(sample.id);
        setTimeout(() => setPlayingId(null), sample.duration * 1000);
      } catch (e) {
        console.error('Audio play failed', e);
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      if (file.type.startsWith('audio/')) {
        const id = await onFileUpload(file);
        const newSample: SampleFile = {
          id,
          name: file.name.replace(/\.[^/.]+$/, ''),
          category: 'melodic',
          duration: 2,
          waveformData: [],
        };
        setCustomSamples(prev => [...prev, newSample]);
      }
    }
  };

  const handleDragStart = (e: React.DragEvent, sampleId: string) => {
    e.dataTransfer.setData('sampleId', sampleId);
  };

  return (
    <aside className="w-64 bg-[#111318] border-r border-white/10 flex flex-col shrink-0">
      <div className="px-3 py-2 border-b border-white/10 shrink-0">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Samples</span>
          <div className="flex gap-0.5">
            <button onClick={() => setViewMode('grid')}
              className={`p-1 rounded transition-colors ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}>
              <Grid size={12} />
            </button>
            <button onClick={() => setViewMode('list')}
              className={`p-1 rounded transition-colors ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}>
              <List size={12} />
            </button>
          </div>
        </div>
        <div className="relative">
          <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-600" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search samples..."
            className="w-full pl-7 pr-2 py-1.5 bg-[#1a1d25] border border-white/10 rounded-lg text-white text-xs placeholder-gray-600 outline-none focus:border-cyan-500/50"
          />
        </div>
      </div>

      {/* Category filters */}
      <div className="flex gap-1 px-3 py-2 border-b border-white/5 shrink-0 overflow-x-auto">
        {(['all', 'drums', 'melodic', 'fx', 'vocals']).map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat as any)}
            className={`px-2 py-1 rounded text-[10px] font-medium whitespace-nowrap transition-colors ${
              category === cat ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'border border-white/10 text-gray-500 hover:text-white'
            }`}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* Sample list */}
      <div className="flex-1 overflow-y-auto p-2">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-2 gap-2">
            {filteredSamples.map(sample => (
              <SampleCard
                key={sample.id}
                sample={sample}
                isPlaying={playingId === sample.id}
                onPlay={() => handlePlay(sample)}
                onDragStart={e => handleDragStart(e, sample.id)}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {filteredSamples.map(sample => (
              <SampleRow
                key={sample.id}
                sample={sample}
                isPlaying={playingId === sample.id}
                onPlay={() => handlePlay(sample)}
                onDragStart={e => handleDragStart(e, sample.id)}
              />
            ))}
          </div>
        )}

        {filteredSamples.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-gray-600 text-xs">
            <Folder size={24} className="mb-2 opacity-50" />
            <span>No samples found</span>
          </div>
        )}
      </div>

      {/* Upload button */}
      <div className="px-3 py-2 border-t border-white/10 shrink-0">
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          multiple
          className="hidden"
          onChange={handleFileUpload}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex items-center justify-center gap-2 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-white/8 transition-colors"
        >
          <Upload size={12} />
          Import Audio
        </button>
        <p className="text-[9px] text-gray-600 text-center mt-1.5">
          Drop onto timeline to add
        </p>
      </div>
    </aside>
  );
}

function SampleCard({ sample, isPlaying, onPlay, onDragStart }: {
  sample: SampleFile; isPlaying: boolean; onPlay: () => void; onDragStart: (e: React.DragEvent) => void;
}) {
  return (
    <div
      className="relative bg-[#1a1d25] border border-white/10 rounded-lg overflow-hidden hover:border-white/20 transition-all group cursor-grab active:cursor-grabbing"
      draggable
      onDragStart={onDragStart}
    >
      {/* Waveform placeholder */}
      <div className="h-16 bg-gradient-to-b from-white/5 to-transparent relative overflow-hidden">
        {sample.waveformData?.length > 0 ? (
          <div className="flex items-end justify-center h-full gap-px px-2">
            {sample.waveformData.map((h, i) => (
              <div key={i} className="w-1 bg-cyan-400/40 rounded-t" style={{ height: `${h * 100}%` }} />
            ))}
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Music size={20} className="text-gray-600" />
          </div>
        )}
        <button
          onClick={e => { e.stopPropagation(); onPlay(); }}
          className="absolute top-2 right-2 p-1 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
        >
          {isPlaying ? <Square size={10} className="text-red-400" fill="currentColor" /> : <Play size={10} className="text-white" fill="currentColor" />}
        </button>
      </div>
      <div className="px-2 py-1.5">
        <p className="text-[10px] font-medium text-gray-300 truncate">{sample.name}</p>
        <p className="text-[9px] text-gray-600">{sample.duration.toFixed(1)}s</p>
      </div>
    </div>
  );
}

function SampleRow({ sample, isPlaying, onPlay, onDragStart }: {
  sample: SampleFile; isPlaying: boolean; onPlay: () => void; onDragStart: (e: React.DragEvent) => void;
}) {
  const Icon = categoryIcons[sample.category] ?? Music;
  return (
    <div
      className="flex items-center gap-2 px-2 py-1.5 bg-[#1a1d25] border border-white/10 rounded hover:border-white/20 transition-all cursor-grab active:cursor-grabbing"
      draggable
      onDragStart={onDragStart}
      onDoubleClick={onPlay}
    >
      <Icon size={12} className="text-gray-500 shrink-0" />
      <span className="flex-1 text-[10px] text-gray-300 truncate">{sample.name}</span>
      <span className="text-[9px] text-gray-600">{sample.duration.toFixed(1)}s</span>
      <button
        onClick={e => { e.stopPropagation(); onPlay(); }}
        className="p-1 hover:bg-white/10 rounded transition-colors"
      >
        {isPlaying ? <Square size={10} className="text-red-400" /> : <Play size={10} className="text-gray-400" />}
      </button>
    </div>
  );
}
