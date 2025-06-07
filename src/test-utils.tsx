import { ToastProvider } from "@/components/Toast";
import { ReactNode } from "react";

// Mock crypto.randomUUID for tests
if (typeof window !== "undefined") {
  window.crypto = {
    ...window.crypto,
    randomUUID: () => "00000000-0000-0000-0000-000000000000",
  };
}

export function TestWrapper({ children }: { children: ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}
