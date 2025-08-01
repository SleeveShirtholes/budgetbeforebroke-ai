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
import DatePicker from "@/components/Forms/DatePicker";
import OnboardingProgress from "../components/OnboardingProgress";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { createDebt } from "@/app/actions/debt";
import { completeOnboarding } from "@/app/actions/onboarding";

const billsSchema = z.object({
  bills: z
    .array(
      z.object({
        name: z.string().min(1, "Bill name is required"),
        balance: z.number().min(0, "Balance must be 0 or greater"),
        interestRate: z.string().optional(),
        dueDate: z.date(),
      }),
    )
    .optional(),
});

type BillsFormData = z.infer<typeof billsSchema>;

const STEP_TITLES = [
  "Create Account",
  "Invite Others",
  "Add Income",
  "Set Up Categories",
  "Add Bills",
];

export default function OnboardingBillsPage() {
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
  } = useForm<BillsFormData>({
    resolver: zodResolver(billsSchema),
    defaultValues: {
      bills: [
        {
          name: "",
          balance: 0,
          interestRate: "",
          dueDate: new Date(),
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "bills",
  });

  const onSubmit = async (data: BillsFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      // Create all bills/debts if any are provided
      if (data.bills && data.bills.length > 0) {
        const validBills = data.bills.filter((bill) => bill.name.trim());

        if (validBills.length > 0) {
          const promises = validBills.map((bill) =>
            createDebt({
              name: bill.name,
              balance: bill.balance,
              interestRate: bill.interestRate
                ? parseFloat(bill.interestRate)
                : 0,
              dueDate: bill.dueDate.toISOString().split("T")[0],
            }),
          );
          await Promise.all(promises);
        }
      }

      // Save progress to localStorage
      const progress = JSON.parse(
        localStorage.getItem("onboardingProgress") || "[]",
      );
      if (!progress.includes("bills")) {
        progress.push("bills");
        localStorage.setItem("onboardingProgress", JSON.stringify(progress));
      }

      // Complete onboarding
      await completeOnboarding();

      // Clear onboarding progress
      localStorage.removeItem("onboardingProgress");

      // Redirect to completion page
      router.push("/onboarding/complete");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create bills");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    try {
      setIsLoading(true);

      // Complete onboarding without adding bills
      await completeOnboarding();

      // Clear onboarding progress
      localStorage.removeItem("onboardingProgress");

      // Redirect to completion page
      router.push("/onboarding/complete");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to complete onboarding",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.push("/onboarding/categories");
  };

  const addBill = () => {
    append({
      name: "",
      balance: 0,
      interestRate: "",
      dueDate: new Date(),
    });
  };

  const watchedBills = watch("bills");
  const hasValidBills = watchedBills?.some((bill) => bill.name.trim()) || false;

  return (
    <div className="space-y-8">
      <OnboardingProgress
        currentStep={5}
        totalSteps={5}
        stepTitles={STEP_TITLES}
      />

      <Card className="p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Add Recurring Bills (Optional)
          </h1>
          <p className="mt-2 text-gray-600">
            Add your regular bills and debts like credit cards, loans,
            utilities, and subscriptions. This helps track your recurring
            expenses and debt payments.
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
              <div
                key={field.id}
                className="p-6 border border-gray-200 rounded-lg space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">
                    Bill/Debt {index + 1}
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
                    label="Bill/Debt Name"
                    placeholder="e.g., Credit Card, Car Loan, Rent, Netflix"
                    error={errors.bills?.[index]?.name?.message}
                    {...register(`bills.${index}.name` as const)}
                  />

                  <DecimalInput
                    label="Current Balance/Amount"
                    placeholder="0.00"
                    error={errors.bills?.[index]?.balance?.message}
                    value={watch(`bills.${index}.balance`)?.toString() || ""}
                    onChange={(value) =>
                      setValue(`bills.${index}.balance`, parseFloat(value) || 0)
                    }
                  />

                  <DecimalInput
                    label="Interest Rate (%) - Optional"
                    placeholder="0.00"
                    error={errors.bills?.[index]?.interestRate?.message}
                    value={watch(`bills.${index}.interestRate`) || ""}
                    onChange={(value) =>
                      setValue(`bills.${index}.interestRate`, value)
                    }
                  />

                  <DatePicker
                    label="Due Date"
                    value={
                      watch(`bills.${index}.dueDate`)
                        ?.toISOString()
                        .split("T")[0] || ""
                    }
                    onChange={(e) =>
                      setValue(
                        `bills.${index}.dueDate`,
                        new Date(e.target.value),
                      )
                    }
                    error={errors.bills?.[index]?.dueDate?.message}
                  />
                </div>
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={addBill}
            className="w-full"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Another Bill/Debt
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
                Skip and finish
              </Button>

              <Button
                type="submit"
                disabled={isLoading || !hasValidBills}
                isLoading={isLoading}
              >
                Add Bills & Complete Setup
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
}
