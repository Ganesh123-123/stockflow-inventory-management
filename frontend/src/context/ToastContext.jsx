import { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, X, XCircle } from 'lucide-react';

const ToastContext = createContext(() => {});

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const toast = useCallback((message, type = 'success') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((items) => [...items, { id, message, type }]);
    window.setTimeout(() => setToasts((items) => items.filter((item) => item.id !== id)), 4000);
  }, []);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed right-4 top-4 z-[70] flex w-[min(92vw,380px)] flex-col gap-2" aria-live="polite">
        {toasts.map((item) => (
          <div key={item.id} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xl">
            {item.type === 'error'
              ? <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />
              : <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />}
            <p className="flex-1 text-sm font-medium text-slate-700">{item.message}</p>
            <button type="button" onClick={() => setToasts((items) => items.filter((toastItem) => toastItem.id !== item.id))} aria-label="Dismiss notification">
              <X className="h-4 w-4 text-slate-400" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
