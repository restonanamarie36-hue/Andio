import { useEffect, useState, useCallback, useRef } from 'react';
import { Track } from '../types';

interface MIDIInput {
  isActive: boolean;
  startListening: () => void;
  stopListening: () => void;
}

export function useMIDIInput(track: Track | null, onNote: (pitch: string, velocity: number) => void): MIDIInput {
  const [isActive, setIsActive] = useState(false);
  const accessRef = useRef<MIDIAccess | null>(null);

  const midiToNote = (midi: number): string => {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octave = Math.floor(midi / 12) - 1;
    const note = notes[midi % 12];
    return `${note}${octave}`;
  };

  const handleMIDIMessage = useCallback((event: MIDIMessageEvent) => {
    const [status, note, velocity] = event.data;
    const command = status >> 4;

    if (command === 9 && velocity > 0) {
      const pitch = midiToNote(note);
      onNote(pitch, velocity / 127);
    }
  }, [onNote]);

  const startListening = useCallback(async () => {
    try {
      const access = await navigator.requestMIDIAccess();
      accessRef.current = access;

      access.inputs.forEach(input => {
        input.onmidimessage = handleMIDIMessage;
      });

      access.onstatechange = (e) => {
        if (e.port instanceof MIDIInput) {
          e.port.onmidimessage = handleMIDIMessage;
        }
      };

      setIsActive(true);
    } catch (err) {
      console.warn('MIDI input not supported or denied:', err);
      setIsActive(false);
    }
  }, [handleMIDIMessage]);

  const stopListening = useCallback(() => {
    if (accessRef.current) {
      accessRef.current.inputs.forEach(input => {
        input.onmidimessage = null;
      });
    }
    setIsActive(false);
  }, []);

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  return { isActive, startListening, stopListening };
}
