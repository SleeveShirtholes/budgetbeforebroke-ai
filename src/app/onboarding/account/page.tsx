"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Card from "@/components/Card";
import Button from "@/components/Button";
import TextField from "@/components/Forms/TextField";
import TextArea from "@/components/Forms/TextArea";
import OnboardingProgress from "../components/OnboardingProgress";
import { createAccount } from "@/app/actions/account";
import { updateUserDefaultAccount } from "@/app/actions/onboarding";

const accountSchema = z.object({
  name: z.string().min(1, "Account name is required"),
  description: z.string().optional(),
});

type AccountFormData = z.infer<typeof accountSchema>;

const STEP_TITLES = ["Create Account", "Invite Others", "Add Income", "Add Bills"];

export default function OnboardingAccountPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const onSubmit = async (data: AccountFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      // Create the budget account
      const result = await createAccount(data.name, data.description || "");
      
      // Update user's default account
      await updateUserDefaultAccount(result);

      // Save progress to localStorage
      const progress = JSON.parse(localStorage.getItem("onboardingProgress") || "[]");
      progress.push("account");
      localStorage.setItem("onboardingProgress", JSON.stringify(progress));

      // Redirect to next step
      router.push("/onboarding/invite");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    router.push("/onboarding/invite");
  };

  const handleBack = () => {
    router.push("/onboarding");
  };

  return (
    <div className="space-y-8">
      <OnboardingProgress 
        currentStep={1} 
        totalSteps={4} 
        stepTitles={STEP_TITLES}
      />

      <Card className="p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Create Your Budget Account</h1>
          <p className="mt-2 text-gray-600">
            Your budget account is the foundation for managing your finances. You can create additional accounts later.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <TextField
            label="Account Name"
            placeholder="e.g., Family Budget, Personal Finances"
            error={errors.name?.message}
            {...register("name")}
            required
          />

          <TextArea
            label="Description (Optional)"
            placeholder="Brief description of this budget account"
            rows={3}
            error={errors.description?.message}
            {...register("description")}
          />

          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={isLoading}
            >
              Back
            </Button>

            <div className="space-x-4">
              <Button
                type="button"
                variant="text"
                onClick={handleSkip}
                disabled={isLoading}
              >
                Skip for now
              </Button>
              
              <Button
                type="submit"
                disabled={isLoading}
                isLoading={isLoading}
              >
                Create Account
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
}