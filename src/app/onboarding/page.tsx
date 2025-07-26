"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Card from "@/components/Card";
import Button from "@/components/Button";
import { CheckIcon } from "@heroicons/react/24/outline";

const ONBOARDING_STEPS = [
  {
    id: "account",
    title: "Create Budget Account",
    description: "Set up your first budget account",
    path: "/onboarding/account",
  },
  {
    id: "invite",
    title: "Invite Others",
    description: "Add family members or partners (optional)",
    path: "/onboarding/invite",
  },
  {
    id: "income",
    title: "Add Income",
    description: "Set up your income sources",
    path: "/onboarding/income",
  },
  {
    id: "bills",
    title: "Add Recurring Bills",
    description: "Track your regular expenses",
    path: "/onboarding/bills",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Load completed steps from localStorage
    const saved = localStorage.getItem("onboardingProgress");
    if (saved) {
      setCompletedSteps(new Set(JSON.parse(saved)));
    }
  }, []);

  const handleStepClick = (step: typeof ONBOARDING_STEPS[0]) => {
    router.push(step.path);
  };

  const handleSkipToEnd = () => {
    // Clear onboarding progress and go to dashboard
    localStorage.removeItem("onboardingProgress");
    router.push("/dashboard");
  };

  const isStepCompleted = (stepId: string) => completedSteps.has(stepId);
  const canSkip = completedSteps.has("account"); // Must complete account creation first

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Welcome to Budget Before Broke!</h1>
        <p className="mt-4 text-lg text-gray-600">
          Let&apos;s get your financial management set up in just a few steps.
        </p>
      </div>

      <Card className="p-8">
        <div className="space-y-6">
          {ONBOARDING_STEPS.map((step, index) => {
            const isCompleted = isStepCompleted(step.id);
            const isRequired = step.id === "account" || step.id === "income";
            
            return (
              <div
                key={step.id}
                className={`flex items-center space-x-4 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                  isCompleted
                    ? "border-green-200 bg-green-50"
                    : "border-gray-200 bg-white hover:border-primary-300"
                }`}
                onClick={() => handleStepClick(step)}
              >
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  isCompleted
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}>
                  {isCompleted ? (
                    <CheckIcon className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                
                <div className="flex-grow">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                    {step.title}
                    {isRequired && (
                      <span className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded-full">
                        Required
                      </span>
                    )}
                  </h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>

                <div className="flex-shrink-0">
                  <Button variant="outline" size="sm">
                    {isCompleted ? "Edit" : "Start"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex justify-between">
          {canSkip && (
            <Button variant="text" onClick={handleSkipToEnd}>
              Skip remaining and go to dashboard
            </Button>
          )}
          <div className="ml-auto">
            <Button
              onClick={() => router.push("/onboarding/account")}
              disabled={isStepCompleted("account") && isStepCompleted("income")}
            >
              {completedSteps.size === 0 ? "Get Started" : "Continue Setup"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}