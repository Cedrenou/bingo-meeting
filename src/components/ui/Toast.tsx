import clsx from 'clsx';
import type { Toast as ToastType } from '../../types';

interface ToastContainerProps {
  toasts: ToastType[];
  removeToast: (id: string) => void;
}

export function ToastContainer({ toasts, removeToast }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={clsx(
            'px-4 py-3 rounded-xl shadow-lg animate-slide-up flex items-center gap-3 cursor-pointer backdrop-blur-md border',
            {
              'bg-emerald-600/90 border-emerald-400/30': toast.type === 'success',
              'bg-red-600/90 border-red-400/30': toast.type === 'error',
              'bg-indigo-600/90 border-indigo-400/30': toast.type === 'info',
            }
          )}
          onClick={() => removeToast(toast.id)}
          role="alert"
        >
          <span className="text-lg">
            {toast.type === 'success' && '✓'}
            {toast.type === 'error' && '✕'}
            {toast.type === 'info' && 'ℹ'}
          </span>
          <p className="text-sm font-medium text-white">{toast.message}</p>
        </div>
      ))}
    </div>
  );
}
