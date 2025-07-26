"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function NewUserPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to onboarding flow
    router.replace("/onboarding");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Welcome!</h2>
        <p className="text-gray-500">Setting up your experience...</p>
      </div>
    </div>
  );
}