"use client";

import Breadcrumb from "@/components/Breadcrumb";
import Header from "@/components/Header";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen">
            <Header />

            <main className="max-w-7xl mx-auto py-8 pt-22">
                <div className="px-4 sm:px-6 lg:px-8">
                    <Breadcrumb />
                </div>
                <div className="px-4 sm:px-6 lg:px-8">{children}</div>
            </main>
        </div>
    );
}
