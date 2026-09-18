import { toast as hotToast, ToastOptions } from 'react-hot-toast';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';

// Centralized toast utility wrapping react-hot-toast to ensure design system consistency

const defaultOptions: ToastOptions = {
  duration: 4000,
  position: 'top-right',
  style: {
    background: 'var(--color-surface-900)',
    color: 'var(--color-surface-50)',
    padding: '16px',
    borderRadius: '12px',
    fontSize: '14px',
    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  },
};

export const toast = {
  success: (message: string, options?: ToastOptions) =>
    hotToast.success(message, {
      ...defaultOptions,
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      ...options,
    }),
  error: (message: string, options?: ToastOptions) =>
    hotToast.error(message, {
      ...defaultOptions,
      icon: <XCircle className="h-5 w-5 text-red-500" />,
      ...options,
    }),
  info: (message: string, options?: ToastOptions) =>
    hotToast(message, {
      ...defaultOptions,
      icon: <Info className="h-5 w-5 text-blue-500" />,
      ...options,
    }),
  warning: (message: string, options?: ToastOptions) =>
    hotToast(message, {
      ...defaultOptions,
      icon: <AlertCircle className="h-5 w-5 text-yellow-500" />,
      ...options,
    }),
  dismiss: hotToast.dismiss,
};
