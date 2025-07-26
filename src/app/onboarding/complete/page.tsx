"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Card from "@/components/Card";
import Button from "@/components/Button";
import { CheckCircleIcon, RocketLaunchIcon } from "@heroicons/react/24/outline";

export default function OnboardingCompletePage() {
  const router = useRouter();

  useEffect(() => {
    // Auto-redirect to dashboard after a delay
    const timer = setTimeout(() => {
      router.push("/dashboard");
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  const goToDashboard = () => {
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="max-w-md mx-auto text-center p-8">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircleIcon className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome to Budget Before Broke!
          </h1>
          <p className="text-gray-600">
            Your account is all set up and ready to go. You can now start managing your finances like a pro!
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex items-center space-x-3 text-left">
            <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
            <span className="text-gray-700">Budget account created</span>
          </div>
          <div className="flex items-center space-x-3 text-left">
            <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
            <span className="text-gray-700">Income sources configured</span>
          </div>
          <div className="flex items-center space-x-3 text-left">
            <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
            <span className="text-gray-700">Ready to track expenses</span>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            onClick={goToDashboard}
            className="w-full"
            size="lg"
          >
            <RocketLaunchIcon className="w-5 h-5 mr-2" />
            Go to Dashboard
          </Button>
          
          <p className="text-sm text-gray-500">
            Redirecting automatically in 5 seconds...
          </p>
        </div>
      </Card>
    </div>
  );
}