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
    id: "categories",
    title: "Set Up Categories",
    description: "Choose your budget categories",
    path: "/onboarding/categories",
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

  const handleStepClick = (step: (typeof ONBOARDING_STEPS)[0]) => {
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
      {/* Clean Minimal Header */}
      <div className="text-center space-y-6">
        {/* Subtle accent line */}
        <div className="flex justify-center">
          <div className="w-16 h-1 bg-gradient-to-r from-transparent via-primary-400 to-transparent rounded-full"></div>
        </div>

        {/* Main title with elegant typography */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
            Welcome to{" "}
            <span className="text-primary-600">Budget Before Broke</span>
          </h1>

          {/* Subtitle with better spacing */}
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Let&apos;s get your financial management set up in just a few steps.
          </p>
        </div>

        {/* Simple progress dots */}
        <div className="flex justify-center items-center space-x-2 pt-4">
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

      <Card className="p-8">
        <div className="space-y-6">
          {ONBOARDING_STEPS.map((step, index) => {
            const isCompleted = isStepCompleted(step.id);
            const isRequired =
              step.id === "account" ||
              step.id === "income" ||
              step.id === "categories";

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
