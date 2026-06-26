import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextValue {
  showToast: (type: ToastType, message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let toastId = 0;
const generateToastId = () => `toast-${Date.now()}-${toastId++}`;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((type: ToastType, message: string, duration = 5000) => {
    const id = generateToastId();
    setToasts(prev => [...prev, { id, type, message, duration }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast, index) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            index={index}
            onDismiss={() => dismissToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, index, onDismiss }: { toast: Toast; index: number; onDismiss: () => void }) {
  useEffect(() => {
    if (toast.duration) {
      const timer = setTimeout(onDismiss, toast.duration);
      return () => clearTimeout(timer);
    }
  }, [toast.duration, onDismiss]);

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
    warning: AlertTriangle,
  };

  const colors = {
    success: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400',
    error: 'bg-red-500/20 border-red-500/40 text-red-400',
    info: 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400',
    warning: 'bg-amber-500/20 border-amber-500/40 text-amber-400',
  };

  const Icon = icons[toast.type];

  return (
    <div
      className={`flex items-center gap-2.5 px-4 py-3 rounded-lg border backdrop-blur-sm pointer-events-auto animate-in slide-in-from-right-5 ${colors[toast.type]}`}
      style={{ marginBottom: index * 4 }}
    >
      <Icon size={16} />
      <span className="text-sm font-medium">{toast.message}</span>
      <button
        onClick={onDismiss}
        className="ml-2 opacity-60 hover:opacity-100 transition-opacity"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
