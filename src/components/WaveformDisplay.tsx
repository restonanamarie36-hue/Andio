import { useEffect, useRef, useState } from 'react';

interface WaveformDisplayProps {
  audioBuffer: AudioBuffer | null;
  color?: string;
  height?: number;
  width?: number;
}

export function WaveformDisplay({ audioBuffer, color = '#22c55e', height = 48, width }: WaveformDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [waveformData, setWaveformData] = useState<number[]>([]);

  useEffect(() => {
    if (!audioBuffer || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const channelData = audioBuffer.getChannelData(0);
    const samples = canvas.width * 2;
    const blockSize = Math.floor(channelData.length / samples);
    const waveform: number[] = [];

    for (let i = 0; i < samples; i++) {
      let sum = 0;
      for (let j = 0; j < blockSize; j++) {
        sum += Math.abs(channelData[i * blockSize + j] || 0);
      }
      waveform.push(sum / blockSize);
    }

    const max = Math.max(...waveform, 0.01);
    const normalized = waveform.map(v => v / max);
    setWaveformData(normalized);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = color;

    const barWidth = canvas.width / samples;
    const midY = canvas.height / 2;

    normalized.forEach((val, i) => {
      const barHeight = val * canvas.height * 0.8;
      const x = i * barWidth;
      ctx.fillRect(x, midY - barHeight / 2, Math.max(barWidth - 0.5, 0.5), barHeight);
    });

  }, [audioBuffer, color]);

  return (
    <canvas
      ref={canvasRef}
      width={width || 200}
      height={height}
      className="w-full h-full"
    />
  );
}

export async function decodeAudioFile(file: File): Promise<AudioBuffer | null> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const audioContext = new AudioContext();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    return audioBuffer;
  } catch (err) {
    console.error('Failed to decode audio file:', err);
    return null;
  }
}

export function extractWaveformData(
  audioBuffer: AudioBuffer,
  sampleCount: number = 200
): number[] {
  const channelData = audioBuffer.getChannelData(0);
  const blockSize = Math.floor(channelData.length / sampleCount);
  const waveform: number[] = [];

  for (let i = 0; i < sampleCount; i++) {
    let sum = 0;
    for (let j = 0; j < blockSize; j++) {
      sum += Math.abs(channelData[i * blockSize + j] || 0);
    }
    waveform.push(sum / blockSize);
  }

  const max = Math.max(...waveform, 0.01);
  return waveform.map(v => v / max);
}
