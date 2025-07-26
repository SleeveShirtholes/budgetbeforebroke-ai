"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Card from "@/components/Card";
import Button from "@/components/Button";
import TextField from "@/components/Forms/TextField";
import CustomSelect from "@/components/Forms/CustomSelect";
import OnboardingProgress from "../components/OnboardingProgress";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { inviteToAccount } from "@/app/actions/account";

const inviteSchema = z.object({
  invites: z.array(z.object({
    email: z.string().email("Please enter a valid email address"),
    role: z.enum(["member", "admin"]),
  })).optional(),
});

type InviteFormData = z.infer<typeof inviteSchema>;

const STEP_TITLES = ["Create Account", "Invite Others", "Add Income", "Add Bills"];

const ROLE_OPTIONS = [
  { value: "member", label: "Member - Can view and add transactions" },
  { value: "admin", label: "Admin - Can manage the account and invite others" },
];

export default function OnboardingInvitePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      invites: [{ email: "", role: "member" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "invites",
  });

  const onSubmit = async (data: InviteFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      if (data.invites && data.invites.length > 0) {
        // Send invitations
        const promises = data.invites
          .filter(invite => invite.email.trim())
          .map(invite => inviteToAccount(invite.email, invite.role));
        
        await Promise.all(promises);
        setSuccess(`Sent ${promises.length} invitation(s) successfully!`);
      }

      // Save progress to localStorage
      const progress = JSON.parse(localStorage.getItem("onboardingProgress") || "[]");
      if (!progress.includes("invite")) {
        progress.push("invite");
        localStorage.setItem("onboardingProgress", JSON.stringify(progress));
      }

      // Wait a moment to show success message, then redirect
      setTimeout(() => {
        router.push("/onboarding/income");
      }, 1500);

    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send invitations");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    // Save progress to localStorage
    const progress = JSON.parse(localStorage.getItem("onboardingProgress") || "[]");
    if (!progress.includes("invite")) {
      progress.push("invite");
      localStorage.setItem("onboardingProgress", JSON.stringify(progress));
    }
    router.push("/onboarding/income");
  };

  const handleBack = () => {
    router.push("/onboarding/account");
  };

  const addInvite = () => {
    append({ email: "", role: "member" });
  };

  return (
    <div className="space-y-8">
      <OnboardingProgress 
        currentStep={2} 
        totalSteps={4} 
        stepTitles={STEP_TITLES}
      />

      <Card className="p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Invite Others (Optional)</h1>
          <p className="mt-2 text-gray-600">
            Invite family members, partners, or anyone else you want to share your budget with. 
            You can always invite people later.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-600 text-sm">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg">
                <div className="flex-grow space-y-4">
                  <TextField
                    label={`Email Address ${index + 1}`}
                    placeholder="friend@example.com"
                    error={errors.invites?.[index]?.email?.message}
                    {...register(`invites.${index}.email` as const)}
                  />
                  
                  <CustomSelect
                    label="Role"
                    options={ROLE_OPTIONS}
                    value={watch(`invites.${index}.role`) || ""}
                    onChange={(value) => setValue(`invites.${index}.role`, value as "member" | "admin")}
                    error={errors.invites?.[index]?.role?.message}
                  />
                </div>

                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => remove(index)}
                    className="mt-7"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={addInvite}
            className="w-full"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Another Person
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
                Send Invitations
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
}