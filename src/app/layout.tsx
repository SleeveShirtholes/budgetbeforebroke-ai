import "./globals.css";

import Header from "@/components/Header";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Budget Before Broke",
    description: "Take control of your finances",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    // In a real app, you would:
    // 1. Load navigation data from YAML file on the server
    // 2. Pass it to the Header component as props
    // 3. Remove the static import in the Header component
    // await getNavigationData(); // Example of server data loading

    return (
        <html lang="en">
            <body className={inter.className}>
                <Header />
                <main className="pt-16">{children}</main>
            </body>
        </html>
    );
}
