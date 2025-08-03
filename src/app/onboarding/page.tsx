"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Card from "@/components/Card";
import Button from "@/components/Button";
import { CheckIcon } from "@heroicons/react/24/outline";

// Define constants for step IDs to improve maintainability
const STEP_IDS = {
  ACCOUNT: "account",
  INVITE: "invite",
  INCOME: "income",
  CATEGORIES: "categories",
  BILLS: "bills",
} as const;

const REQUIRED_STEPS = [
  STEP_IDS.ACCOUNT,
  STEP_IDS.INCOME,
  STEP_IDS.CATEGORIES,
] as const;

const ONBOARDING_STEPS = [
  {
    id: STEP_IDS.ACCOUNT,
    title: "Create Budget Account",
    description: "Set up your first budget account",
    path: "/onboarding/account",
  },
  {
    id: STEP_IDS.INVITE,
    title: "Invite Others",
    description: "Add family members or partners (optional)",
    path: "/onboarding/invite",
  },
  {
    id: STEP_IDS.INCOME,
    title: "Add Income",
    description: "Set up your income sources",
    path: "/onboarding/income",
  },
  {
    id: STEP_IDS.CATEGORIES,
    title: "Set Up Categories",
    description: "Choose your budget categories",
    path: "/onboarding/categories",
  },
  {
    id: STEP_IDS.BILLS,
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

  const handleStepClick = (step: (typeof ONBOARDING_STEPS)[0]) => {
    router.push(step.path);
  };

  const handleSkipToEnd = () => {
    // Clear onboarding progress and go to dashboard
    localStorage.removeItem("onboardingProgress");
    router.push("/dashboard");
  };

  const isStepCompleted = (stepId: string) => completedSteps.has(stepId);
  const canSkip = completedSteps.has(STEP_IDS.ACCOUNT); // Must complete account creation first

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Clean Minimal Header */}
      <div className="text-center space-y-4 sm:space-y-6 px-4 sm:px-0">
        {/* Subtle accent line */}
        <div className="flex justify-center">
          <div className="w-16 h-1 bg-gradient-to-r from-transparent via-primary-400 to-transparent rounded-full"></div>
        </div>

        {/* Main title with elegant typography */}
        <div className="space-y-3 sm:space-y-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight px-4">
            Welcome to{" "}
            <span className="text-primary-600">Budget Before Broke</span>
          </h1>

          {/* Subtitle with better spacing */}
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed px-4">
            Let&apos;s get your financial management set up in just a few steps.
          </p>
        </div>

        {/* Simple progress dots */}
        <div className="flex justify-center items-center space-x-2 pt-2 sm:pt-4">
          {ONBOARDING_STEPS.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index < completedSteps.size
                  ? "bg-primary-500 scale-125"
                  : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      </div>

      <Card className="p-4 sm:p-6 md:p-8">
        <div className="space-y-4 sm:space-y-6">
          {ONBOARDING_STEPS.map((step, index) => {
            const isCompleted = isStepCompleted(step.id);
            const isRequired = REQUIRED_STEPS.includes(
              step.id as (typeof REQUIRED_STEPS)[number],
            );

            return (
              <div
                key={step.id}
                className={`flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border-2 transition-all cursor-pointer ${
                  isCompleted
                    ? "border-green-200 bg-green-50"
                    : "border-gray-200 bg-white hover:border-primary-300"
                }`}
                onClick={() => handleStepClick(step)}
              >
                <div className="flex items-center gap-3 sm:gap-4 flex-1">
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      isCompleted
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckIcon className="w-5 h-5" />
                    ) : (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <span className="truncate">{step.title}</span>
                      {isRequired && (
                        <span className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded-full self-start sm:self-auto">
                          Required
                        </span>
                      )}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 mt-1">
                      {step.description}
                    </p>
                  </div>
                </div>

                <div className="flex-shrink-0 self-end sm:self-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    className="sm:w-auto"
                  >
                    {isCompleted ? "Edit" : "Start"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row sm:justify-between gap-3 sm:gap-0">
          {canSkip && (
            <Button
              variant="text"
              onClick={handleSkipToEnd}
              fullWidth
              className="sm:w-auto order-2 sm:order-1"
            >
              Skip remaining and go to dashboard
            </Button>
          )}
          <div className="order-1 sm:order-2 sm:ml-auto">
            <Button
              onClick={() => router.push("/onboarding/account")}
              disabled={false}
              fullWidth
              className="sm:w-auto"
            >
              {completedSteps.size === 0 ? "Get Started" : "Continue Setup"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
