"use client";

import AccountSelector from "@/components/AccountSelector";
import Breadcrumb from "@/components/Breadcrumb";
import Header from "@/components/Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pt-20 sm:pt-22">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Breadcrumb />
          <div className="flex justify-center sm:justify-end">
            <AccountSelector />
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}
