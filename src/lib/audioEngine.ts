import * as Tone from 'tone';
import { Track, InstrumentType, normalizeNote, LoopRegion, AutomationPoint } from '../types';

const STEPS_PER_BAR = 16;

type AnyInstrument = Tone.MembraneSynth | Tone.NoiseSynth | Tone.MetalSynth | Tone.PolySynth | Tone.MonoSynth;

interface TrackNode {
  instrument: AnyInstrument;
  volumeNode: Tone.Volume;
  panNode: Tone.PanVol;
  reverbSend: Tone.Gain;
  delaySend: Tone.Gain;
  distortionSend: Tone.Gain;
  filterNode: Tone.Filter;
}

class AudioEngine {
  private nodes = new Map<string, TrackNode>();
  private tracks: Track[] = [];
  private currentStep = 0;
  private totalSteps = 64;
  private schedulerId: number | null = null;
  private onStepCallback: ((step: number) => void) | null = null;
  private masterReverb: Tone.Reverb | null = null;
  private masterDelay: Tone.FeedbackDelay | null = null;
  private masterDistortion: Tone.Distortion | null = null;
  private metronomeSynth: Tone.MembraneSynth | null = null;
  private metronomeEnabled = false;
  private countInBars = 0;
  private countInStep = 0;
  private loopRegion: LoopRegion | null = null;

  constructor() {
    this.initEffects();
    this.initMetronome();
  }

  private initEffects() {
    this.masterReverb = new Tone.Reverb({ decay: 2.5, wet: 0.3 }).toDestination();
    this.masterDelay = new Tone.FeedbackDelay({ delayTime: '8n', feedback: 0.3, wet: 0.25 }).toDestination();
    this.masterDistortion = new Tone.Distortion({ distortion: 0.4, wet: 0.2 }).toDestination();
  }

  private initMetronome() {
    this.metronomeSynth = new Tone.MembraneSynth({
      pitchDecay: 0.01, octaves: 2,
      envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.05 },
    }).toDestination();
  }

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
      const panNode = new Tone.PanVol(0, 0);
      const volumeNode = new Tone.Volume(0).connect(panNode);
      const filterNode = new Tone.Filter({ type: 'lowpass', frequency: track.filterFreq ?? 2000, Q: 1 }).connect(volumeNode);
      const reverbSend = new Tone.Gain((track.reverbSend ?? 0) / 100).connect(this.masterReverb!);
      const delaySend = new Tone.Gain((track.delaySend ?? 0) / 100).connect(this.masterDelay!);
      const distortionSend = new Tone.Gain((track.distortionSend ?? 0) / 100).connect(this.masterDistortion!);

      instrument.connect(filterNode);
      instrument.connect(reverbSend);
      instrument.connect(delaySend);
      instrument.connect(distortionSend);
      panNode.connect(Tone.getDestination());

      this.nodes.set(track.id, { instrument, volumeNode, panNode, reverbSend, delaySend, distortionSend, filterNode });
    }
    return this.nodes.get(track.id)!;
  }

  private triggerNote(track: Track, pitch: string, duration: number, velocity: number, time: number) {
    const node = this.getOrCreateNode(track);
    const durationSec = Tone.Time('16n').valueOf() * duration;
    const vel = Math.max(0, Math.min(1, velocity));

    const inst = track.instrumentType;
    if (inst === 'kick') {
      (node.instrument as Tone.MembraneSynth).triggerAttackRelease('C1', durationSec, time, vel);
    } else if (inst === 'snare') {
      (node.instrument as Tone.NoiseSynth).triggerAttackRelease(durationSec, time, vel);
    } else if (inst === 'hihat') {
      (node.instrument as Tone.MetalSynth).triggerAttackRelease(durationSec, time, vel);
    } else {
      const normalized = normalizeNote(pitch);
      (node.instrument as Tone.PolySynth | Tone.MonoSynth).triggerAttackRelease(normalized, durationSec, time, vel);
    }
  }

  private triggerMetronome(downbeat: boolean, time: number) {
    if (!this.metronomeEnabled || !this.metronomeSynth) return;
    const pitch = downbeat ? 'C5' : 'G4';
    this.metronomeSynth.triggerAttackRelease(pitch, '32n', time, 0.6);
  }

  setOnStepCallback(cb: ((step: number) => void) | null) { this.onStepCallback = cb; }
  setMetronome(enabled: boolean) { this.metronomeEnabled = enabled; }
  setLoopRegion(region: LoopRegion | null) { this.loopRegion = region; }

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
      node.panNode.pan.value = ((track.pan ?? 50) / 50) - 1; // 0 = left, 50 = center, 100 = right
      node.reverbSend.gain.value = (track.reverbSend ?? 0) / 100;
      node.delaySend.gain.value = (track.delaySend ?? 0) / 100;
      node.distortionSend.gain.value = (track.distortionSend ?? 0) / 100;
      node.filterNode.frequency.value = track.filterFreq ?? 2000;
    });
  }

  setMasterVolume(db: number) { Tone.getDestination().volume.value = db; }

  playNote(track: Track, pitch: string, velocity = 0.8) {
    const node = this.getOrCreateNode(track);
    const inst = track.instrumentType;
    if (inst === 'kick') {
      (node.instrument as Tone.MembraneSynth).triggerAttackRelease('C1', '8n', undefined, velocity);
    } else if (inst === 'snare') {
      (node.instrument as Tone.NoiseSynth).triggerAttackRelease('8n', undefined, velocity);
    } else if (inst === 'hihat') {
      (node.instrument as Tone.MetalSynth).triggerAttackRelease('8n', undefined, velocity);
    } else {
      const normalized = normalizeNote(pitch);
      (node.instrument as Tone.PolySynth | Tone.MonoSynth).triggerAttackRelease(normalized, '8n', undefined, velocity);
    }
  }

  async start(totalSteps: number, countInBars = 0) {
    await Tone.start();
    this.totalSteps = totalSteps;
    this.currentStep = 0;
    this.countInBars = countInBars;
    this.countInStep = 0;

    Tone.Transport.loop = true;
    Tone.Transport.loopStart = 0;
    Tone.Transport.loopEnd = `${totalSteps / STEPS_PER_BAR}m`;
    if (this.schedulerId !== null) Tone.Transport.clear(this.schedulerId);

    const countInSteps = countInBars * STEPS_PER_BAR;
    if (countInSteps > 0) {
      for (let i = 0; i < countInSteps; i++) {
        const time = Tone.Transport.seconds + (i * Tone.Time('16n').valueOf());
        this.triggerMetronome(i % 16 === 0, time);
      }
    }

    this.schedulerId = Tone.Transport.scheduleRepeat((time) => {
      if (this.countInStep < countInSteps) {
        this.triggerMetronome(this.countInStep % 16 === 0, time);
        this.countInStep++;
        return;
      }

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

      if (this.metronomeEnabled) {
        this.triggerMetronome(step % 16 === 0, time);
      }

      const effectiveStep = this.loopRegion
        ? ((step - this.loopRegion.startStep) % (this.loopRegion.endStep - this.loopRegion.startStep)) + this.loopRegion.startStep
        : step;

      this.currentStep = (step + 1) % this.totalSteps;

      if (this.onStepCallback) {
        Tone.getDraw().schedule(() => {
          this.onStepCallback!(this.loopRegion ? effectiveStep : step);
        }, time);
      }
    }, '16n');

    Tone.Transport.start();
  }

  stop() {
    Tone.Transport.stop();
    if (this.schedulerId !== null) { Tone.Transport.clear(this.schedulerId); this.schedulerId = null; }
    this.currentStep = 0;
    this.countInStep = 0;
    if (this.onStepCallback) this.onStepCallback(-1);
  }

  setBpm(bpm: number) { Tone.Transport.bpm.value = bpm; }

  // Audio export
  async exportWav(durationBars: number, bpm: number): Promise<Blob | null> {
    const duration = durationBars * (60 / bpm) * 4;

    const offline = await Tone.Offline(async () => {
      for (let step = 0; step < durationBars * 16; step++) {
        const time = step * Tone.Time('16n').valueOf();
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
      }
    }, duration);

    const wavBuffer = offline.toWav();
    return new Blob([wavBuffer], { type: 'audio/wav' });
  }

  dispose() {
    this.stop();
    this.nodes.forEach(({ instrument, volumeNode, panNode, reverbSend, delaySend, distortionSend, filterNode }) => {
      instrument.dispose();
      volumeNode.dispose();
      panNode.dispose();
      reverbSend.dispose();
      delaySend.dispose();
      distortionSend.dispose();
      filterNode.dispose();
    });
    this.nodes.clear();
    this.masterReverb?.dispose();
    this.masterDelay?.dispose();
    this.masterDistortion?.dispose();
    this.metronomeSynth?.dispose();
  }
}

export const audioEngine = new AudioEngine();
