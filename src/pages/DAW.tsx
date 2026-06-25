import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Arranger from '../components/Arranger';
import DetailEditor from '../components/DetailEditor';
import { Track, Clip, Note, BeatPosition, stepToBeatPosition } from '../types';
import { createDefaultTracks } from '../lib/defaultProject';
import { audioEngine } from '../lib/audioEngine';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useUndoRedo } from '../hooks/useUndoRedo';

const STEPS_PER_BAR = 16;
let clipIdCtr = 0;
const genClipId = () => `clip-${Date.now()}-${clipIdCtr++}`;

export default function DAW() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
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

  const { tracks, pushTracks, undo, redo, canUndo, canRedo, reset } = useUndoRedo(createDefaultTracks());

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
    });
  }, [id]);

  useEffect(() => { audioEngine.updateTracks(tracks); }, [tracks]);
  useEffect(() => {
    audioEngine.setOnStepCallback((step) => {
      setCurrentStep(step);
      if (step >= 0) setBeatPosition(stepToBeatPosition(step));
    });
    return () => audioEngine.setOnStepCallback(null);
  }, []);
  useEffect(() => { audioEngine.setBpm(bpm); }, [bpm]);
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
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isPlaying, undo, redo, selectedClipId, tracks]);

  const handlePlay = async () => { await audioEngine.start(loopBars * STEPS_PER_BAR); setIsPlaying(true); };
  const handleStop = () => { audioEngine.stop(); setIsPlaying(false); setCurrentStep(-1); setBeatPosition({ bar: 1, beat: 1, sub: 1 }); };
  const handleBpmChange = (val: number) => setBpm(Math.max(40, Math.min(240, val)));
  const handleLoopBarsChange = (bars: number) => { setLoopBars(bars); if (isPlaying) { audioEngine.stop(); setIsPlaying(false); } };

  const handleTrackVolumeChange = useCallback((trackId: string, volume: number) => {
    pushTracks(tracks.map(t => t.id === trackId ? { ...t, volume } : t));
  }, [tracks, pushTracks]);

  const handleTrackMuteToggle = useCallback((trackId: string) => {
    pushTracks(tracks.map(t => t.id === trackId ? { ...t, muted: !t.muted } : t));
  }, [tracks, pushTracks]);

  const handleTrackSoloToggle = useCallback((trackId: string) => {
    pushTracks(tracks.map(t => t.id === trackId ? { ...t, soloed: !t.soloed } : t));
  }, [tracks, pushTracks]);

  const handleClipSelect = useCallback((trackId: string, clipId: string) => {
    setSelectedTrackId(trackId); setSelectedClipId(clipId);
  }, []);

  const handleClipAdd = useCallback((trackId: string, startStep: number) => {
    const newClip: Clip = { id: genClipId(), startStep, length: STEPS_PER_BAR, notes: [] };
    pushTracks(tracks.map(t => t.id === trackId ? { ...t, clips: [...t.clips, newClip] } : t));
    setSelectedTrackId(trackId); setSelectedClipId(newClip.id);
  }, [tracks, pushTracks]);

  const handleClipMove = useCallback((trackId: string, clipId: string, newStartStep: number) => {
    pushTracks(tracks.map(t => t.id === trackId ? { ...t, clips: t.clips.map(c => c.id === clipId ? { ...c, startStep: newStartStep } : c) } : t));
  }, [tracks, pushTracks]);

  const handleClipResize = useCallback((trackId: string, clipId: string, newLength: number) => {
    pushTracks(tracks.map(t => t.id === trackId ? { ...t, clips: t.clips.map(c => c.id === clipId ? { ...c, length: newLength } : c) } : t));
  }, [tracks, pushTracks]);

  const handleClipDelete = useCallback((trackId: string, clipId: string) => {
    pushTracks(tracks.map(t => t.id === trackId ? { ...t, clips: t.clips.filter(c => c.id !== clipId) } : t));
    if (selectedClipId === clipId) { setSelectedClipId(null); setSelectedTrackId(null); }
  }, [tracks, pushTracks, selectedClipId]);

  const handleNoteAdd = useCallback((trackId: string, clipId: string, note: Note) => {
    pushTracks(tracks.map(t => t.id === trackId ? { ...t, clips: t.clips.map(c => c.id === clipId ? { ...c, notes: [...c.notes, note] } : c) } : t));
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

  const handleSave = async () => {
    if (!id || !user) return;
    setIsSaving(true);
    await supabase.from('projects').update({ name: projectName, bpm, data: { tracks, loopBars }, updated_at: new Date().toISOString() }).eq('id', id);
    setIsSaving(false);
  };

  const selectedTrack = tracks.find(t => t.id === selectedTrackId) ?? null;
  const selectedClip = selectedTrack?.clips.find(c => c.id === selectedClipId) ?? null;

  if (loadingProject) {
    return <div className="h-screen bg-[#0a0c11] flex items-center justify-center"><Loader2 size={28} className="text-gray-600 animate-spin" /></div>;
  }

  return (
    <div className="flex flex-col h-screen bg-[#0d0f14] text-white overflow-hidden">
      <Header isPlaying={isPlaying} bpm={bpm} projectName={projectName} beatPosition={beatPosition} loopBars={loopBars}
        masterVolume={masterVolume} canUndo={canUndo} canRedo={canRedo} onPlay={handlePlay} onStop={handleStop}
        onBpmChange={handleBpmChange} onProjectNameChange={setProjectName} onSave={handleSave}
        onLoopBarsChange={handleLoopBarsChange} onMasterVolumeChange={setMasterVolume}
        onUndo={undo} onRedo={redo} isSaving={isSaving} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-hidden min-h-0">
            <Arranger tracks={tracks} loopBars={loopBars} selectedClipId={selectedClipId} currentStep={currentStep}
              onTrackVolumeChange={handleTrackVolumeChange} onTrackMuteToggle={handleTrackMuteToggle}
              onTrackSoloToggle={handleTrackSoloToggle} onClipSelect={handleClipSelect} onClipAdd={handleClipAdd}
              onClipMove={handleClipMove} onClipResize={handleClipResize} onClipDelete={handleClipDelete} />
          </div>
          <DetailEditor track={selectedTrack} clip={selectedClip} onClose={() => { setSelectedClipId(null); setSelectedTrackId(null); }}
            onNoteAdd={handleNoteAdd} onNoteRemove={handleNoteRemove} onNoteResize={handleNoteResize} onNoteMove={handleNoteMove} />
        </main>
      </div>
    </div>
  );
}
