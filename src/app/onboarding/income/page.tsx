"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Card from "@/components/Card";
import Button from "@/components/Button";
import TextField from "@/components/Forms/TextField";
import DecimalInput from "@/components/Forms/DecimalInput";
import CustomSelect from "@/components/Forms/CustomSelect";
import DatePicker from "@/components/Forms/DatePicker";
import OnboardingProgress from "../components/OnboardingProgress";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { createIncomeSource } from "@/app/actions/income";

const incomeSchema = z.object({
  incomeSources: z.array(z.object({
    name: z.string().min(1, "Income source name is required"),
    amount: z.number().min(0.01, "Amount must be greater than 0"),
    frequency: z.enum(["weekly", "bi-weekly", "monthly"]),
    startDate: z.date(),
    notes: z.string().optional(),
  })).min(1, "At least one income source is required"),
});

type IncomeFormData = z.infer<typeof incomeSchema>;

const STEP_TITLES = ["Create Account", "Invite Others", "Add Income", "Add Bills"];

const FREQUENCY_OPTIONS = [
  { value: "weekly", label: "Weekly" },
  { value: "bi-weekly", label: "Bi-weekly (Every 2 weeks)" },
  { value: "monthly", label: "Monthly" },
];

export default function OnboardingIncomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<IncomeFormData>({
    resolver: zodResolver(incomeSchema),
    defaultValues: {
      incomeSources: [{
        name: "",
        amount: 0,
        frequency: "monthly",
        startDate: new Date(),
        notes: "",
      }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "incomeSources",
  });

  const onSubmit = async (data: IncomeFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      // Create all income sources
      const promises = data.incomeSources.map(income =>
        createIncomeSource(
          income.name,
          income.amount,
          income.frequency,
          income.startDate,
          undefined,
          income.notes
        )
      );

      await Promise.all(promises);

      // Save progress to localStorage
      const progress = JSON.parse(localStorage.getItem("onboardingProgress") || "[]");
      if (!progress.includes("income")) {
        progress.push("income");
        localStorage.setItem("onboardingProgress", JSON.stringify(progress));
      }

      // Redirect to next step
      router.push("/onboarding/bills");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create income sources");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    router.push("/onboarding/bills");
  };

  const handleBack = () => {
    router.push("/onboarding/invite");
  };

  const addIncomeSource = () => {
    append({
      name: "",
      amount: 0,
      frequency: "monthly",
      startDate: new Date(),
      notes: "",
    });
  };

  return (
    <div className="space-y-8">
      <OnboardingProgress 
        currentStep={3} 
        totalSteps={4} 
        stepTitles={STEP_TITLES}
      />

      <Card className="p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Add Your Income Sources</h1>
          <p className="mt-2 text-gray-600">
            Add your regular income sources like salary, freelance work, or other recurring income. 
            This helps create an accurate budget.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-6">
            {fields.map((field, index) => (
              <div key={field.id} className="p-6 border border-gray-200 rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">
                    Income Source {index + 1}
                  </h3>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => remove(index)}
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextField
                    label="Income Source Name"
                    placeholder="e.g., Salary, Freelance, Side Business"
                    error={errors.incomeSources?.[index]?.name?.message}
                    {...register(`incomeSources.${index}.name` as const)}
                  />

                  <DecimalInput
                    label="Amount"
                    placeholder="0.00"
                    error={errors.incomeSources?.[index]?.amount?.message}
                    value={watch(`incomeSources.${index}.amount`)?.toString() || ""}
                    onChange={(value) => setValue(`incomeSources.${index}.amount`, parseFloat(value) || 0)}
                  />

                  <CustomSelect
                    label="Frequency"
                    options={FREQUENCY_OPTIONS}
                    value={watch(`incomeSources.${index}.frequency`) || ""}
                    onChange={(value) => setValue(`incomeSources.${index}.frequency`, value as "weekly" | "bi-weekly" | "monthly")}
                    error={errors.incomeSources?.[index]?.frequency?.message}
                  />

                  <DatePicker
                    label="Start Date"
                    value={watch(`incomeSources.${index}.startDate`)?.toISOString().split('T')[0] || ""}
                    onChange={(e) => setValue(`incomeSources.${index}.startDate`, new Date(e.target.value))}
                    error={errors.incomeSources?.[index]?.startDate?.message}
                  />
                </div>

                <TextField
                  label="Notes (Optional)"
                  placeholder="Any additional notes about this income source"
                  error={errors.incomeSources?.[index]?.notes?.message}
                  {...register(`incomeSources.${index}.notes` as const)}
                />
              </div>
            ))}
          </div>

          {errors.incomeSources?.root && (
            <p className="text-red-600 text-sm">{errors.incomeSources.root.message}</p>
          )}

          <Button
            type="button"
            variant="outline"
            onClick={addIncomeSource}
            className="w-full"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Another Income Source
          </Button>

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
                Add Income Sources
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
}