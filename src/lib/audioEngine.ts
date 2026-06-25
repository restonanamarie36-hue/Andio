import * as Tone from 'tone';
import { Track, InstrumentType, normalizeNote } from '../types';

const STEPS_PER_BAR = 16;

type AnyInstrument = Tone.MembraneSynth | Tone.NoiseSynth | Tone.MetalSynth | Tone.PolySynth | Tone.MonoSynth;

interface TrackNode {
  instrument: AnyInstrument;
  volumeNode: Tone.Volume;
}

class AudioEngine {
  private nodes = new Map<string, TrackNode>();
  private tracks: Track[] = [];
  private currentStep = 0;
  private totalSteps = 64;
  private schedulerId: number | null = null;
  private onStepCallback: ((step: number) => void) | null = null;

  private createInstrument(type: InstrumentType): AnyInstrument {
    switch (type) {
      case 'kick':
        return new Tone.MembraneSynth({ pitchDecay: 0.05, octaves: 6, envelope: { attack: 0.001, decay: 0.3, sustain: 0, release: 0.1 } });
      case 'snare':
        return new Tone.NoiseSynth({ noise: { type: 'white' }, envelope: { attack: 0.001, decay: 0.18, sustain: 0, release: 0.05 } });
      case 'hihat':
        return new Tone.MetalSynth({ frequency: 600, envelope: { attack: 0.001, decay: 0.08, release: 0.01 }, harmonicity: 5.1, modulationIndex: 32, resonance: 4000, octaves: 1.5 });
      case 'piano':
        return new Tone.PolySynth(Tone.Synth, { oscillator: { type: 'triangle' }, envelope: { attack: 0.02, decay: 0.8, sustain: 0.4, release: 1.4 } });
      case 'pluck':
        return new Tone.PolySynth(Tone.Synth, { oscillator: { type: 'sawtooth' }, envelope: { attack: 0.005, decay: 0.3, sustain: 0.1, release: 0.8 } });
      case 'bass':
        return new Tone.MonoSynth({ oscillator: { type: 'sawtooth' }, filter: { Q: 4, type: 'lowpass', rolloff: -24 }, envelope: { attack: 0.04, decay: 0.1, sustain: 0.5, release: 0.8 }, filterEnvelope: { attack: 0.06, decay: 0.1, sustain: 0.2, release: 1, baseFrequency: 200, octaves: 3 } });
      case 'sax':
        return new Tone.PolySynth(Tone.Synth, { oscillator: { type: 'sawtooth' }, envelope: { attack: 0.06, decay: 0.2, sustain: 0.7, release: 0.4 } });
      case 'guitar':
        return new Tone.PolySynth(Tone.Synth, { oscillator: { type: 'triangle' }, envelope: { attack: 0.005, decay: 0.5, sustain: 0.2, release: 0.6 } });
    }
  }

  private getOrCreateNode(track: Track): TrackNode {
    if (!this.nodes.has(track.id)) {
      const instrument = this.createInstrument(track.instrumentType);
      const volumeNode = new Tone.Volume(0).toDestination();
      instrument.connect(volumeNode);
      this.nodes.set(track.id, { instrument, volumeNode });
    }
    return this.nodes.get(track.id)!;
  }

  private triggerNote(track: Track, pitch: string, duration: number, velocity: number, time: number) {
    const { instrument } = this.getOrCreateNode(track);
    const durationSec = Tone.Time('16n').valueOf() * duration;
    const vel = Math.max(0, Math.min(1, velocity));

    if (track.instrumentType === 'kick') {
      (instrument as Tone.MembraneSynth).triggerAttackRelease('C1', durationSec, time, vel);
    } else if (track.instrumentType === 'snare') {
      (instrument as Tone.NoiseSynth).triggerAttackRelease(durationSec, time, vel);
    } else if (track.instrumentType === 'hihat') {
      (instrument as Tone.MetalSynth).triggerAttackRelease(durationSec, time, vel);
    } else {
      const normalized = normalizeNote(pitch);
      (instrument as Tone.PolySynth | Tone.MonoSynth).triggerAttackRelease(normalized, durationSec, time, vel);
    }
  }

  setOnStepCallback(cb: ((step: number) => void) | null) { this.onStepCallback = cb; }

  updateTracks(tracks: Track[]) {
    this.tracks = tracks;
    tracks.forEach(t => this.getOrCreateNode(t));
    this.applyVolumes();
  }

  applyVolumes() {
    const hasSoloed = this.tracks.some(t => t.soloed);
    this.tracks.forEach(track => {
      const node = this.nodes.get(track.id);
      if (!node) return;
      const effectiveMute = track.muted || (hasSoloed && !track.soloed);
      node.volumeNode.volume.value = effectiveMute ? -Infinity : ((track.volume / 100) * 40) - 40;
    });
  }

  setMasterVolume(db: number) { Tone.getDestination().volume.value = db; }

  async start(totalSteps: number) {
    await Tone.start();
    this.totalSteps = totalSteps;
    this.currentStep = 0;
    Tone.Transport.loop = true;
    Tone.Transport.loopStart = 0;
    Tone.Transport.loopEnd = `${totalSteps / STEPS_PER_BAR}m`;
    if (this.schedulerId !== null) Tone.Transport.clear(this.schedulerId);

    this.schedulerId = Tone.Transport.scheduleRepeat((time) => {
      const step = this.currentStep;
      const hasSoloed = this.tracks.some(t => t.soloed);
      this.tracks.forEach(track => {
        if (track.muted || (hasSoloed && !track.soloed)) return;
        track.clips.forEach(clip => {
          if (step < clip.startStep || step >= clip.startStep + clip.length) return;
          const localStep = step - clip.startStep;
          clip.notes.forEach(note => {
            if (note.step === localStep) {
              this.triggerNote(track, note.pitch, note.duration, note.velocity ?? 0.8, time);
            }
          });
        });
      });
      this.currentStep = (step + 1) % this.totalSteps;
      if (this.onStepCallback) {
        Tone.getDraw().schedule(() => { this.onStepCallback!(step); }, time);
      }
    }, '16n');
    Tone.Transport.start();
  }

  stop() {
    Tone.Transport.stop();
    if (this.schedulerId !== null) { Tone.Transport.clear(this.schedulerId); this.schedulerId = null; }
    this.currentStep = 0;
    if (this.onStepCallback) this.onStepCallback(-1);
  }

  setBpm(bpm: number) { Tone.Transport.bpm.value = bpm; }

  dispose() {
    this.stop();
    this.nodes.forEach(({ instrument, volumeNode }) => { instrument.dispose(); volumeNode.dispose(); });
    this.nodes.clear();
  }
}

export const audioEngine = new AudioEngine();
