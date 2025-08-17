import { redirect } from "next/navigation";
import { isCurrentUserGlobalAdmin } from "@/lib/auth-helpers";
import AdminSidebar from "./components/AdminSidebar";

/**
 * Admin layout component that provides the overall structure for admin pages
 * Includes authentication check and navigation sidebar
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if user is a global admin
  const isAdmin = await isCurrentUserGlobalAdmin();

  if (!isAdmin) {
    redirect("/dashboard?error=admin-access-required");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Admin Sidebar */}
        <AdminSidebar />

        {/* Main Content */}
        <main className="flex-1 lg:ml-64">
          <div className="px-4 sm:px-6 lg:px-8 py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
