import Breadcrumb from "@/components/Breadcrumb";
import Header from "@/components/Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-secondary-50">
      <Header userAvatar="/default-avatar.png" userName="John Doe" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-6">
        <div className="mb-6">
          <Breadcrumb />
        </div>
        {children}
      </main>
    </div>
  );
}
