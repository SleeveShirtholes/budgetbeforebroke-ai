"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { needsOnboarding } from "@/app/actions/onboarding";

export default function NewUserPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkOnboardingStatus() {
      try {
        const needsSetup = await needsOnboarding();
        
        if (needsSetup) {
          router.replace("/onboarding");
        } else {
          router.replace("/dashboard");
        }
      } catch (error) {
        console.error("Error checking onboarding status:", error);
        // Default to onboarding if there's an error
        router.replace("/onboarding");
      } finally {
        setChecking(false);
      }
    }

    checkOnboardingStatus();
  }, [router]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Welcome!</h2>
          <p className="text-gray-500">Setting up your experience...</p>
        </div>
      </div>
    );
  }

  return null;
}