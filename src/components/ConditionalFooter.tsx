"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";

/**
 * Conditionally renders the footer based on the current route
 * Hides footer for admin routes to maintain clean admin panel design
 */
export default function ConditionalFooter() {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");

  // Don't render footer for admin routes
  if (isAdminRoute) {
    return null;
  }

  return <Footer />;
}
