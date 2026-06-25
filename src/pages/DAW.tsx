import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, LayoutGrid, SlidersHorizontal, Activity, Music2, Mic } from 'lucide-react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Arranger from '../components/Arranger';
import DetailEditor from '../components/DetailEditor';
import TrackInfo from '../components/TrackInfo';
import ExportModal from '../components/ExportModal';
import MixerView from '../components/MixerView';
import AutomationView from '../components/AutomationView';
import SampleBrowser from '../components/SampleBrowser';
import AudioRecorder from '../components/AudioRecorder';
import { Track, Clip, Note, BeatPosition, stepToBeatPosition, SnapResolution, LoopRegion, ViewMode, AutomationPoint, AutomationType, AudioClip, AudioFileRef } from '../types';
import { createDefaultTracks, createEmptyTrack, createAudioTrack } from '../lib/defaultProject';
import { audioEngine } from '../lib/audioEngine';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useUndoRedo } from '../hooks/useUndoRedo';
import { decodeAudioFile, extractWaveformData } from '../components/WaveformDisplay';

const STEPS_PER_BAR = 16;
const STEP_DURATION = (bpm: number) => 60 / bpm / 4;

let clipIdCtr = 0; const genClipId = () => `clip-${Date.now()}-${clipIdCtr++}`;
let noteIdCtr = 0; const genNoteId = () => `n-${Date.now()}-${noteIdCtr++}`;
let audioFileIdCtr = 0; const genAudioFileId = () => `audio-${Date.now()}-${audioFileIdCtr++}`;

export default function DAW() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loadingProject, setLoadingProject] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(120);
  const [loopBars, setLoopBars] = useState(4);
  const [projectName, setProjectName] = useState('Untitled Project');
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(-1);
  const [beatPosition, setBeatPosition] = useState<BeatPosition>({ bar: 1, beat: 1, sub: 1 });
  const [isSaving, setIsSaving] = useState(false);
  const [masterVolume, setMasterVolume] = useState(80);
  const [masterPan, setMasterPan] = useState(50);
  const [metronomeEnabled, setMetronomeEnabled] = useState(false);
  const [countInBars, setCountInBars] = useState(0);
  const [snapResolution, setSnapResolution] = useState<SnapResolution>('16n');
  const [loopRegion, setLoopRegion] = useState<LoopRegion | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showVelocityLane, setShowVelocityLane] = useState(true);
  const [showChordPanel, setShowChordPanel] = useState(true);
  const [pianoRollStep, setPianoRollStep] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>('arranger');
  const [showSampleBrowser, setShowSampleBrowser] = useState(false);
  const [showRecorder, setShowRecorder] = useState(false);
  const [audioFiles, setAudioFiles] = useState<Map<string, AudioFileRef>>(new Map());

  const { tracks, pushTracks, undo, redo, canUndo, canRedo, reset } = useUndoRedo(createDefaultTracks());
  const initialLoadRef = useRef(false);

  const selectedTrack = tracks.find(t => t.id === selectedTrackId) ?? null;

  useEffect(() => {
    if (!id) { setLoadingProject(false); return; }
    supabase.from('projects').select('*').eq('id', id).single().then(({ data, error }) => {
      if (!error && data) {
        setProjectName(data.name); setBpm(data.bpm);
        const loaded = data.data?.tracks;
        const loadedLoop = data.data?.loopBars ?? 4;
        setLoopBars(loadedLoop);
        if (loaded && loaded.length > 0) reset(loaded);
        else reset(createDefaultTracks());
      }
      setLoadingProject(false);
      initialLoadRef.current = true;
    });
  }, [id]);

  useEffect(() => {
    if (!initialLoadRef.current) return;
    setHasUnsavedChanges(true);
  }, [tracks, projectName, bpm, loopBars]);

  const saveProject = async () => {
    if (!id || !user) return;
    setIsSaving(true);
    await supabase.from('projects').update({
      name: projectName, bpm, data: { tracks, loopBars }, updated_at: new Date().toISOString()
    }).eq('id', id);
    setHasUnsavedChanges(false);
    setIsSaving(false);
  };

  useEffect(() => { audioEngine.updateTracks(tracks); }, [tracks]);
  useEffect(() => {
    audioEngine.setOnStepCallback((step) => {
      setCurrentStep(step);
      setPianoRollStep(step);
      if (step >= 0) setBeatPosition(stepToBeatPosition(step));
    });
    return () => audioEngine.setOnStepCallback(null);
  }, []);
  useEffect(() => { audioEngine.setBpm(bpm); }, [bpm]);
  useEffect(() => { audioEngine.setMetronome(metronomeEnabled); }, [metronomeEnabled]);
  useEffect(() => { audioEngine.setLoopRegion(loopRegion); }, [loopRegion]);
  useEffect(() => { return () => { audioEngine.dispose(); }; }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const inInput = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement;
      if (inInput) return;
      if (e.code === 'Space') { e.preventDefault(); isPlaying ? handleStop() : handlePlay(); }
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.code === 'KeyZ') { e.preventDefault(); undo(); }
      if ((e.metaKey || e.ctrlKey) && (e.code === 'KeyY' || (e.shiftKey && e.code === 'KeyZ'))) { e.preventDefault(); redo(); }
      if ((e.code === 'Delete' || e.code === 'Backspace') && selectedClipId) {
        const t = tracks.find(t => t.clips.some(c => c.id === selectedClipId));
        if (t) handleClipDelete(t.id, selectedClipId);
      }
      if (e.code === 'KeyS' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); saveProject(); }
      if (e.code === 'Digit1') setViewMode('arranger');
      if (e.code === 'Digit2') setViewMode('mixer');
      if (e.code === 'Digit3') setViewMode('automation');
      if (e.code === 'KeyR' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); setShowRecorder(true); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isPlaying, undo, redo, selectedClipId, tracks, hasUnsavedChanges]);

  const handlePlay = async () => {
    await audioEngine.start(loopBars * STEPS_PER_BAR, countInBars);
    setIsPlaying(true);
  };
  const handleStop = () => {
    audioEngine.stop();
    setIsPlaying(false);
    setCurrentStep(-1);
    setBeatPosition({ bar: 1, beat: 1, sub: 1 });
  };
  const handleBpmChange = (val: number) => setBpm(Math.max(40, Math.min(240, val)));
  const handleLoopBarsChange = (bars: number) => { setLoopBars(bars); if (isPlaying) { audioEngine.stop(); setIsPlaying(false); } };

  const handleTrackVolumeChange = useCallback((trackId: string, volume: number) => {
    pushTracks(tracks.map(t => t.id === trackId ? { ...t, volume } : t));
  }, [tracks, pushTracks]);

  const handleTrackPanChange = useCallback((trackId: string, pan: number) => {
    pushTracks(tracks.map(t => t.id === trackId ? { ...t, pan } : t));
  }, [tracks, pushTracks]);

  const handleTrackMuteToggle = useCallback((trackId: string) => {
    pushTracks(tracks.map(t => t.id === trackId ? { ...t, muted: !t.muted } : t));
  }, [tracks, pushTracks]);

  const handleTrackSoloToggle = useCallback((trackId: string) => {
    pushTracks(tracks.map(t => t.id === trackId ? { ...t, soloed: !t.soloed } : t));
  }, [tracks, pushTracks]);

  const handleTrackUpdate = useCallback((trackId: string, updates: Partial<Track>) => {
    pushTracks(tracks.map(t => t.id === trackId ? { ...t, ...updates } : t));
  }, [tracks, pushTracks]);

  const handleTrackDelete = useCallback((trackId: string) => {
    if (tracks.length <= 1) return;
    pushTracks(tracks.filter(t => t.id !== trackId));
    if (selectedTrackId === trackId) { setSelectedTrackId(null); setSelectedClipId(null); }
  }, [tracks, pushTracks, selectedTrackId]);

  const handleTrackDuplicate = useCallback((trackId: string) => {
    const track = tracks.find(t => t.id === trackId);
    if (!track) return;
    const newTrack: Track = { ...track, id: `track-${Date.now()}`, name: `${track.name} (copy)` };
    pushTracks([...tracks, newTrack]);
  }, [tracks, pushTracks]);

  const handleTrackAdd = useCallback((instrumentType: Track['instrumentType'], category: Track['category']) => {
    const names: Record<string, string> = {
      kick: 'Kick', snare: 'Snare', hihat: 'Hi-Hat',
      piano: 'Piano', pluck: 'Pluck', bass: 'Bass', sax: 'Sax', guitar: 'Guitar',
    };
    const newTrack = createEmptyTrack(names[instrumentType] ?? 'Track', instrumentType, category);
    pushTracks([...tracks, newTrack]);
    setSelectedTrackId(newTrack.id);
  }, [tracks, pushTracks]);

  const handleClipSelect = useCallback((trackId: string, clipId: string) => {
    setSelectedTrackId(trackId);
    setSelectedClipId(clipId);
    const clip = tracks.find(t => t.id === trackId)?.clips.find(c => c.id === clipId);
    if (clip) setPianoRollStep(clip.startStep);
  }, [tracks]);

  const handleClipAdd = useCallback((trackId: string, startStep: number) => {
    const newClip: Clip = { id: genClipId(), startStep, length: STEPS_PER_BAR, notes: [] };
    pushTracks(tracks.map(t => t.id === trackId ? { ...t, clips: [...t.clips, newClip] } : t));
    setSelectedTrackId(trackId);
    setSelectedClipId(newClip.id);
    setPianoRollStep(startStep);
  }, [tracks, pushTracks]);

  const handleClipMove = useCallback((trackId: string, clipId: string, newStartStep: number) => {
    pushTracks(tracks.map(t => t.id === trackId ? { ...t, clips: t.clips.map(c => c.id === clipId ? { ...c, startStep: newStartStep } : c) } : t));
  }, [tracks, pushTracks]);

  const handleClipResize = useCallback((trackId: string, clipId: string, newLength: number) => {
    pushTracks(tracks.map(t => t.id === trackId ? { ...t, clips: t.clips.map(c => c.id === clipId ? { ...c, length: newLength } : c) } : t));
  }, [tracks, pushTracks]);

  const handleClipDelete = useCallback((trackId: string, clipId: string) => {
    pushTracks(tracks.map(t => t.id === trackId ? { ...t, clips: t.clips.filter(c => c.id !== clipId) } : t));
    if (selectedClipId === clipId) { setSelectedClipId(null); }
  }, [tracks, pushTracks, selectedClipId]);

  const handleClipDuplicate = useCallback((trackId: string, clipId: string) => {
    const track = tracks.find(t => t.id === trackId);
    const clip = track?.clips.find(c => c.id === clipId);
    if (!track || !clip) return;
    const newClip: Clip = {
      id: genClipId(), startStep: clip.startStep + clip.length,
      length: clip.length, notes: clip.notes.map(n => ({ ...n, id: genNoteId() })),
    };
    pushTracks(tracks.map(t => t.id === trackId ? { ...t, clips: [...t.clips, newClip] } : t));
  }, [tracks, pushTracks]);

  const handleNoteAdd = useCallback((trackId: string, clipId: string, note: Note) => {
    pushTracks(tracks.map(t => t.id === trackId ? { ...t, clips: t.clips.map(c => c.id === clipId ? { ...c, notes: [...c.notes, note] } : c) } : t));
  }, [tracks, pushTracks]);

  const handleNotesAdd = useCallback((trackId: string, clipId: string, notes: Note[]) => {
    pushTracks(tracks.map(t => t.id === trackId ? { ...t, clips: t.clips.map(c => c.id === clipId ? { ...c, notes: [...c.notes, ...notes] } : c) } : t));
  }, [tracks, pushTracks]);

  const handleNoteRemove = useCallback((trackId: string, clipId: string, noteId: string) => {
    pushTracks(tracks.map(t => t.id === trackId ? { ...t, clips: t.clips.map(c => c.id === clipId ? { ...c, notes: c.notes.filter(n => n.id !== noteId) } : c) } : t));
  }, [tracks, pushTracks]);

  const handleNoteResize = useCallback((trackId: string, clipId: string, noteId: string, duration: number) => {
    pushTracks(tracks.map(t => t.id === trackId ? { ...t, clips: t.clips.map(c => c.id === clipId ? { ...c, notes: c.notes.map(n => n.id === noteId ? { ...n, duration } : n) } : c) } : t));
  }, [tracks, pushTracks]);

  const handleNoteMove = useCallback((trackId: string, clipId: string, noteId: string, step: number, pitch: string) => {
    pushTracks(tracks.map(t => t.id === trackId ? { ...t, clips: t.clips.map(c => c.id === clipId ? { ...c, notes: c.notes.map(n => n.id === noteId ? { ...n, step, pitch } : n) } : c) } : t));
  }, [tracks, pushTracks]);

  const handleNoteVelocityChange = useCallback((trackId: string, clipId: string, noteId: string, velocity: number) => {
    pushTracks(tracks.map(t => t.id === trackId ? { ...t, clips: t.clips.map(c => c.id === clipId ? { ...c, notes: c.notes.map(n => n.id === noteId ? { ...n, velocity } : n) } : c) } : t));
  }, [tracks, pushTracks]);

  const handleAutomationPointAdd = useCallback((trackId: string, type: AutomationType, point: AutomationPoint) => {
    pushTracks(tracks.map(t => {
      if (t.id !== trackId) return t;
      const currentAuto = t.automation ?? [];
      const existing = currentAuto.find(a => a.type === type);
      if (existing) {
        const newPoints = [...existing.points.filter(p => p.step !== point.step), point];
        return { ...t, automation: currentAuto.map(a => a.type === type ? { ...a, points: newPoints } : a) };
      }
      return { ...t, automation: [...currentAuto, { type, points: [point] }] };
    }));
  }, [tracks, pushTracks]);

  const handleAutomationPointRemove = useCallback((trackId: string, pointId: string) => {
    pushTracks(tracks.map(t => {
      if (t.id !== trackId) return t;
      return {
        ...t,
        automation: (t.automation ?? []).map(a => ({
          ...a,
          points: a.points.filter(p => p.id !== pointId),
        })),
      };
    }));
  }, [tracks, pushTracks]);

  const handleAutomationPointMove = useCallback((trackId: string, pointId: string, newStep: number, newValue: number) => {
    pushTracks(tracks.map(t => {
      if (t.id !== trackId) return t;
      return {
        ...t,
        automation: (t.automation ?? []).map(a => ({
          ...a,
          points: a.points.map(p => p.id === pointId ? { ...p, step: newStep, value: newValue } : p),
        })),
      };
    }));
  }, [tracks, pushTracks]);

  // Audio file handling
  const handleRecordComplete = useCallback(async (blob: Blob, name: string) => {
    const file = new File([blob], name, { type: blob.type });
    const id = await handleFileUpload(file);
    if (id) {
      const audioTrack = createAudioTrack('Recorded', '#ef4444');
      const stepsDuration = Math.ceil((blob.size / 1000) / (STEP_DURATION(bpm) * 1000));
      const audioClip: AudioClip = {
        id: genClipId(),
        startStep: 0,
        duration: Math.max(16, stepsDuration),
        fileId: id,
        fileName: name,
        volume: 100,
        reversed: false,
        playbackRate: 1,
      };
      pushTracks([...tracks, { ...audioTrack, audioClips: [audioClip] }]);
      setSelectedTrackId(audioTrack.id);
    }
  }, [tracks, pushTracks, bpm]);

  const handleFileUpload = useCallback(async (file: File): Promise<string> => {
    const fileId = genAudioFileId();
    const buffer = await decodeAudioFile(file);
    const waveformData = buffer ? extractWaveformData(buffer, 100) : [];
    const blobUrl = URL.createObjectURL(file);

    setAudioFiles(prev => {
      const next = new Map(prev);
      next.set(fileId, {
        id: fileId,
        name: file.name,
        blob: file,
        blobUrl,
        buffer: buffer ?? undefined,
        waveformData,
        duration: buffer?.duration ?? 2,
      });
      return next;
    });

    return fileId;
  }, []);

  const handleSampleDrop = useCallback((fileId: string, step: number) => {
    const audioRef = audioFiles.get(fileId);
    if (!audioRef) return;

    const audioClip: AudioClip = {
      id: genClipId(),
      startStep: step,
      duration: Math.ceil(audioRef.duration / STEP_DURATION(bpm)),
      fileId,
      fileName: audioRef.name,
      volume: 100,
      reversed: false,
      playbackRate: 1,
      waveformData: audioRef.waveformData,
    };

    const audioTrack = tracks.find(t => t.isAudio) ?? createAudioTrack('Audio', '#f97316');
    const newTrack = { ...audioTrack, audioClips: [...audioTrack.audioClips, audioClip] };

    if (!tracks.find(t => t.isAudio)) {
      pushTracks([...tracks, newTrack]);
      setSelectedTrackId(newTrack.id);
    } else {
      pushTracks(tracks.map(t => t.id === audioTrack.id ? newTrack : t));
    }
  }, [audioFiles, tracks, pushTracks, bpm]);

  const selectedClip = selectedTrack?.clips.find(c => c.id === selectedClipId) ?? null;

  if (loadingProject) {
    return <div className="h-screen bg-[#0a0c11] flex items-center justify-center"><Loader2 size={28} className="text-gray-600 animate-spin" /></div>;
  }

  return (
    <div className="flex flex-col h-screen bg-[#0d0f14] text-white overflow-hidden">
      <Header
        isPlaying={isPlaying} bpm={bpm} projectName={projectName} beatPosition={beatPosition} loopBars={loopBars}
        masterVolume={masterVolume} canUndo={canUndo} canRedo={canRedo}
        metronomeEnabled={metronomeEnabled} countInBars={countInBars}
        snapResolution={snapResolution} loopRegion={loopRegion} hasUnsavedChanges={hasUnsavedChanges}
        onPlay={handlePlay} onStop={handleStop} onBpmChange={handleBpmChange}
        onProjectNameChange={setProjectName} onSave={saveProject}
        onLoopBarsChange={handleLoopBarsChange} onMasterVolumeChange={setMasterVolume}
        onUndo={undo} onRedo={redo} isSaving={isSaving}
        onMetronomeToggle={() => setMetronomeEnabled(e => !e)} onCountInChange={setCountInBars}
        onSnapChange={setSnapResolution} onLoopRegionChange={setLoopRegion}
        onExport={() => setShowExportModal(true)} />

      <div className="flex items-center gap-1 px-4 py-1.5 bg-[#0a0c11] border-b border-white/10 shrink-0">
        {([
          { id: 'arranger', icon: LayoutGrid, label: 'Arranger' },
          { id: 'mixer', icon: SlidersHorizontal, label: 'Mixer' },
          { id: 'automation', icon: Activity, label: 'Automation' },
        ] as const).map(({ id, icon: Icon, label }) => (
          <button key={id}
            onClick={() => setViewMode(id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors ${
              viewMode === id ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-500 hover:text-white hover:bg-white/5'
            }`}>
            <Icon size={14} />
            <span className="text-xs font-medium">{label}</span>
          </button>
        ))}
        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={() => setShowRecorder(true)}
            className="flex items-center gap-1.5 px-2 py-1 rounded text-xs text-red-400 hover:text-red-300 transition-colors"
            title="Record Audio (Ctrl+R)">
            <Mic size={12} />
            Record
          </button>
          <button
            onClick={() => setShowSampleBrowser(s => !s)}
            className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-colors ${
              showSampleBrowser ? 'bg-violet-500/20 text-violet-400' : 'text-gray-500 hover:text-white'
            }`}>
            <Music2 size={12} />
            Samples
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {showSampleBrowser ? (
          <SampleBrowser onDrop={handleSampleDrop} onFileUpload={handleFileUpload} />
        ) : (
          <Sidebar onTrackAdd={handleTrackAdd} />
        )}

        <main className="flex flex-col flex-1 overflow-hidden">
          {viewMode === 'arranger' && (
            <>
              <div className="flex-1 overflow-hidden min-h-0 relative">
                <Arranger
                  tracks={tracks} loopBars={loopBars} selectedClipId={selectedClipId} currentStep={currentStep}
                  loopRegion={loopRegion} selectedTrackId={selectedTrackId}
                  onTrackVolumeChange={handleTrackVolumeChange}
                  onTrackMuteToggle={handleTrackMuteToggle}
                  onTrackSoloToggle={handleTrackSoloToggle}
                  onClipSelect={handleClipSelect}
                  onClipAdd={handleClipAdd}
                  onClipMove={handleClipMove}
                  onClipResize={handleClipResize}
                  onClipDelete={handleClipDelete}
                  onClipDuplicate={handleClipDuplicate}
                  onTrackSelect={setSelectedTrackId}
                  onLoopRegionChange={setLoopRegion} />

                {selectedTrackId && (
                  <TrackInfo
                    track={tracks.find(t => t.id === selectedTrackId)!}
                    onClose={() => setSelectedTrackId(null)}
                    onUpdate={updates => handleTrackUpdate(selectedTrackId, updates)}
                    onDelete={() => handleTrackDelete(selectedTrackId)}
                    onDuplicate={() => handleTrackDuplicate(selectedTrackId)} />
                )}
              </div>

              <DetailEditor
                track={selectedTrack}
                clip={selectedClip}
                onClose={() => { setSelectedClipId(null); }}
                onNoteAdd={handleNoteAdd}
                onNotesAdd={handleNotesAdd}
                onNoteRemove={handleNoteRemove}
                onNoteResize={handleNoteResize}
                onNoteMove={handleNoteMove}
                onNoteVelocityChange={handleNoteVelocityChange}
                snapResolution={snapResolution}
                showVelocityLane={showVelocityLane}
                showChordPanel={showChordPanel} />
            </>
          )}

          {viewMode === 'mixer' && (
            <MixerView
              tracks={tracks}
              onVolumeChange={handleTrackVolumeChange}
              onPanChange={handleTrackPanChange}
              onMuteToggle={handleTrackMuteToggle}
              onSoloToggle={handleTrackSoloToggle}
              onTrackSelect={setSelectedTrackId}
              selectedTrackId={selectedTrackId}
              masterVolume={masterVolume}
              masterPan={masterPan}
              onMasterVolumeChange={setMasterVolume}
              onMasterPanChange={setMasterPan} />
          )}

          {viewMode === 'automation' && (
            <>
              <AutomationView
                track={selectedTrack}
                totalSteps={loopBars * STEPS_PER_BAR}
                onPointAdd={handleAutomationPointAdd}
                onPointRemove={handleAutomationPointRemove}
                onPointMove={handleAutomationPointMove} />
              <div className="flex-1 overflow-hidden min-h-0">
                <Arranger
                  tracks={tracks} loopBars={loopBars} selectedClipId={selectedClipId} currentStep={currentStep}
                  loopRegion={loopRegion} selectedTrackId={selectedTrackId}
                  onTrackVolumeChange={handleTrackVolumeChange}
                  onTrackMuteToggle={handleTrackMuteToggle}
                  onTrackSoloToggle={handleTrackSoloToggle}
                  onClipSelect={handleClipSelect}
                  onClipAdd={handleClipAdd}
                  onClipMove={handleClipMove}
                  onClipResize={handleClipResize}
                  onClipDelete={handleClipDelete}
                  onClipDuplicate={handleClipDuplicate}
                  onTrackSelect={setSelectedTrackId}
                  onLoopRegionChange={setLoopRegion} />
              </div>
            </>
          )}
        </main>
      </div>

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        projectName={projectName}
        totalSteps={loopBars * STEPS_PER_BAR}
        bpm={bpm} />

      {showRecorder && (
        <AudioRecorder
          onClose={() => setShowRecorder(false)}
          onRecordComplete={handleRecordComplete} />
      )}
    </div>
  );
}
