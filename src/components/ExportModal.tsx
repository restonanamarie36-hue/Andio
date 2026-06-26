import { useState } from 'react';
import { Download, Loader2, X, CheckCircle } from 'lucide-react';
import { audioEngine } from '../lib/audioEngine';
import { useToast } from './Toast';
import { sanitizeFilename } from '../lib/utils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
  totalSteps: number;
  bpm: number;
}

export default function ExportModal({ isOpen, onClose, projectName, totalSteps, bpm }: Props) {
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleExport = async () => {
    setExporting(true);
    setProgress(0);

    try {
      const interval = setInterval(() => setProgress(p => Math.min(p + 10, 90)), 200);

      const bars = totalSteps / 16;
      const blob = await audioEngine.exportWav(bars, bpm);

      clearInterval(interval);
      setProgress(100);

      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${sanitizeFilename(projectName)}.wav`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('success', 'Export complete');
      }

      setTimeout(() => {
        setExporting(false);
        onClose();
      }, 500);
    } catch (err) {
      console.error('Export failed', err);
      setExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#22252b] border border-white/10 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="font-semibold text-white">Export Audio</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors" disabled={exporting}>
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <p className="text-sm text-gray-400">
            Render your project to a WAV file. This will export {Math.ceil(totalSteps / 16)} bars at {bpm} BPM.
          </p>

          {exporting && (
            <div className="space-y-2">
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-teal-500 transition-all duration-200" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-xs text-gray-500 text-center">{progress}% rendered</p>
            </div>
          )}

          {!exporting && (
            <button onClick={handleExport}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-teal-500 hover:bg-teal-400 text-black font-semibold rounded-lg text-sm transition-colors">
              <Download size={14} />
              Export WAV
            </button>
          )}

          {exporting && (
            <button disabled
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-gray-600 text-gray-300 rounded-lg text-sm cursor-not-allowed">
              <Loader2 size={14} className="animate-spin" />
              Rendering...
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
