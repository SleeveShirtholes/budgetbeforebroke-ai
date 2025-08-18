import "./globals.css";

import Spinner from "@/components/Spinner";
import { ToastProvider } from "@/components/Toast";
import CookieConsentBanner from "@/components/CookieConsentBanner";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import { SWRConfig } from "swr";
import ConditionalFooter from "@/components/ConditionalFooter";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Budget Before Broke",
  description: "Budget First, Panic Never",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`bg-pastel-gradient ${inter.className}`}>
        <SWRConfig
          value={{
            revalidateOnFocus: false,
            revalidateOnReconnect: true,
            dedupingInterval: 2000,
          }}
        >
          <ToastProvider defaultPosition="top-center">
            <Suspense fallback={<Spinner size="md" />}>
              <main className="pt-0">{children}</main>
            </Suspense>
            <CookieConsentBanner />
            <ConditionalFooter />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: "#363636",
                  color: "#fff",
                },
                success: {
                  duration: 3000,
                  style: {
                    background: "#10B981",
                  },
                },
                error: {
                  duration: 5000,
                  style: {
                    background: "#EF4444",
                  },
                },
              }}
            />
          </ToastProvider>
        </SWRConfig>
      </body>
    </html>
  );
}
