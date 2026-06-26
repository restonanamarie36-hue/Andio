import { useState, useRef, useCallback } from 'react';
import { Mic, Square, RefreshCw, Check, X } from 'lucide-react';

interface AudioRecorderProps {
  onRecordComplete: (blob: Blob, name: string) => void;
  onClose: () => void;
}

export default function AudioRecorder({ onRecordComplete, onClose }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedBlob(blob);
        setRecordedUrl(url);

        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);

      timerRef.current = window.setInterval(() => {
        setDuration(d => d + 1);
      }, 1000);

    } catch (err) {
      setError('Could not access microphone. Please grant permission.');
      console.error('Recording failed:', err);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [isRecording]);

  const discardRecording = useCallback(() => {
    if (recordedUrl) {
      URL.revokeObjectURL(recordedUrl);
    }
    setRecordedBlob(null);
    setRecordedUrl(null);
    setDuration(0);
  }, [recordedUrl]);

  const handleSave = useCallback(() => {
    if (recordedBlob) {
      const name = `Recording_${new Date().toISOString().slice(0, 16).replace('T', '_')}.webm`;
      onRecordComplete(recordedBlob, name);
      onClose();
    }
  }, [recordedBlob, onRecordComplete, onClose]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#22252b] border border-white/10 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="font-semibold text-white">Record Audio</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 px-3 py-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Recording indicator */}
          <div className="flex flex-col items-center py-8">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${
              isRecording ? 'bg-red-500/20 animate-pulse' : 'bg-white/5'
            }`}>
              {isRecording ? (
                <div className="w-8 h-8 rounded-sm bg-red-500" />
              ) : (
                <Mic size={32} className="text-gray-400" />
              )}
            </div>

            {isRecording && (
              <div className="text-center mb-4">
                <span className="text-3xl font-mono text-red-400">{formatDuration(duration)}</span>
                <p className="text-xs text-gray-500 mt-1">Recording...</p>
              </div>
            )}

            {!isRecording && !recordedBlob && (
              <p className="text-sm text-gray-500 text-center">
                Click the button below to start recording from your microphone.
              </p>
            )}

            {!isRecording && recordedBlob && recordedUrl && (
              <>
                <audio src={recordedUrl} controls className="w-full mb-4" />
                <p className="text-sm text-gray-500 text-center">
                  Duration: {formatDuration(duration)}
                </p>
              </>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-center">
            {!isRecording && !recordedBlob && (
              <button onClick={startRecording}
                className="flex items-center gap-2 px-6 py-2.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-400 rounded-lg text-sm transition-colors">
                <Mic size={16} />
                Start Recording
              </button>
            )}

            {isRecording && (
              <button onClick={stopRecording}
                className="flex items-center gap-2 px-6 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg text-sm transition-colors">
                <Square size={16} fill="currentColor" />
                Stop Recording
              </button>
            )}

            {!isRecording && recordedBlob && (
              <>
                <button onClick={discardRecording}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-gray-400 hover:text-white text-sm transition-colors">
                  <RefreshCw size={14} />
                  Re-record
                </button>
                <button onClick={handleSave}
                  className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-400 rounded-lg text-sm transition-colors">
                  <Check size={16} />
                  Use Recording
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
