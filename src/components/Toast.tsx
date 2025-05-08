"use client";

import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

/**
 * Toast Component
 *
 * A flexible toast notification system that provides contextual feedback to users.
 * Features:
 * - Multiple toast types: success, error, info, warning
 * - Customizable positions: top/bottom, left/center/right
 * - Configurable duration and default settings
 * - Animated entrance and exit
 * - Accessible with ARIA attributes
 * - Responsive design with mobile-friendly layout
 *
 * Usage:
 * ```tsx
 * // Wrap your app with ToastProvider
 * <ToastProvider>
 *   <App />
 * </ToastProvider>
 *
 * // Use toast in any component
 * const { showToast } = useToast();
 * showToast("Operation successful!", { type: "success" });
 * ```
 */

// Toast types and positions
type ToastType = "success" | "error" | "info" | "warning";
type ToastPosition =
  | "top-center"
  | "top-left"
  | "top-right"
  | "bottom-center"
  | "bottom-left"
  | "bottom-right";

interface Toast {
  id: string;
  message: string;
  type?: ToastType;
  duration?: number;
  position?: ToastPosition;
}

interface ToastContextType {
  showToast: (
    message: string,
    options?: { type?: ToastType; duration?: number; position?: ToastPosition },
  ) => void;
}

interface ToastProviderProps {
  children: ReactNode;
  defaultType?: ToastType;
  defaultDuration?: number;
  defaultPosition?: ToastPosition;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}

// CSS classes for different toast positions
const positionClasses: Record<ToastPosition, string> = {
  "top-center": "top-6 left-1/2 -translate-x-1/2",
  "top-left": "top-6 left-6",
  "top-right": "top-6 right-6",
  "bottom-center": "bottom-6 left-1/2 -translate-x-1/2",
  "bottom-left": "bottom-6 left-6",
  "bottom-right": "bottom-6 right-6",
};

// Styling configuration for different toast types
const typeStyles: Record<
  ToastType,
  { border: string; icon: ReactNode; iconColor: string }
> = {
  success: {
    border: "border-green-500",
    icon: <CheckCircleIcon className="h-6 w-6 text-green-500" />,
    iconColor: "text-green-500",
  },
  error: {
    border: "border-red-500",
    icon: <ExclamationCircleIcon className="h-6 w-6 text-red-500" />,
    iconColor: "text-red-500",
  },
  info: {
    border: "border-blue-500",
    icon: <InformationCircleIcon className="h-6 w-6 text-blue-500" />,
    iconColor: "text-blue-500",
  },
  warning: {
    border: "border-yellow-500",
    icon: <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" />,
    iconColor: "text-yellow-500",
  },
};

export const ToastProvider = ({
  children,
  defaultType = "info",
  defaultDuration = 3000,
  defaultPosition = "top-center",
}: ToastProviderProps) => {
  // State to manage active toasts
  const [toasts, setToasts] = useState<Toast[]>([]);
  // Ref to store timeout IDs for auto-dismissing toasts
  const timers = useRef<Record<string, NodeJS.Timeout>>({});

  // Function to remove a toast and clear its timeout
  const removeToast = useCallback((id: string) => {
    setToasts((toasts) => toasts.filter((t) => t.id !== id));
    if (timers.current[id]) {
      clearTimeout(timers.current[id]);
      delete timers.current[id];
    }
  }, []);

  // Function to display a new toast notification
  const showToast = useCallback(
    (
      message: string,
      options?: {
        type?: ToastType;
        duration?: number;
        position?: ToastPosition;
      },
    ) => {
      const id = crypto.randomUUID();
      const toast: Toast = {
        id,
        message,
        type: options?.type || defaultType,
        duration: options?.duration ?? defaultDuration,
        position: options?.position || defaultPosition,
      };
      setToasts((toasts) => [...toasts, toast]);
      if (toast.duration && toast.duration > 0) {
        timers.current[id] = setTimeout(() => removeToast(id), toast.duration);
      }
    },
    [removeToast, defaultType, defaultDuration, defaultPosition],
  );

  // Cleanup function to clear all timeouts when component unmounts
  useEffect(() => {
    const currentTimers = timers.current;
    return () => {
      Object.values(currentTimers).forEach(clearTimeout);
    };
  }, []);

  // Group toasts by their position for organized rendering
  const grouped = toasts.reduce<Record<ToastPosition, Toast[]>>(
    (acc, toast) => {
      acc[toast.position || "top-center"] =
        acc[toast.position || "top-center"] || [];
      acc[toast.position || "top-center"].push(toast);
      return acc;
    },
    {
      "top-center": [],
      "top-left": [],
      "top-right": [],
      "bottom-center": [],
      "bottom-left": [],
      "bottom-right": [],
    },
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {Object.entries(grouped).map(([position, toasts]) =>
        toasts.length > 0 ? (
          <div
            key={position}
            className={`fixed z-50 flex flex-col gap-2 items-center ${positionClasses[position as ToastPosition]}`}
            style={{ pointerEvents: "none" }}
          >
            {toasts.map((toast) => {
              const style = typeStyles[toast.type || "info"];
              return (
                <div
                  key={toast.id}
                  className={`min-w-[260px] max-w-xs px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 border bg-white/80 ${style.border} animate-fade-in-up`}
                  style={{ pointerEvents: "auto" }}
                  role="alert"
                >
                  <span>{style.icon}</span>
                  <span className="flex-1 text-sm font-medium text-gray-900">
                    {toast.message}
                  </span>
                  <button
                    onClick={() => removeToast(toast.id)}
                    className="ml-2 text-gray-400 hover:text-gray-700 focus:outline-none"
                    aria-label="Dismiss"
                    style={{ pointerEvents: "auto" }}
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              );
            })}
          </div>
        ) : null,
      )}
      <style jsx global>{`
        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease;
        }
      `}</style>
    </ToastContext.Provider>
  );
};
