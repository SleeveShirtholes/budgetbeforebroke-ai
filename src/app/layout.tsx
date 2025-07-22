import "./globals.css";

import Spinner from "@/components/Spinner";
import { ToastProvider } from "@/components/Toast";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import { SWRConfig } from "swr";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Budget Before Broke",
  description: "Take control of your finances",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // In a real app, you would:
  // 1. Load navigation data from YAML file on the server
  // 2. Pass it to the Header component as props
  // 3. Remove the static import in the Header component
  // await getNavigationData(); // Example of server data loading

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
          </ToastProvider>
        </SWRConfig>
      </body>
    </html>
  );
}
