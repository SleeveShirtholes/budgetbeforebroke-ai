"use client";

import { AsYouType, isValidPhoneNumber } from "libphonenumber-js";
import { Controller, useForm } from "react-hook-form";

import Button from "@/components/Button";
import React from "react";
import TextField from "@/components/Forms/TextField";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const profileSchema = z.object({
  name: z
    .string()
    .min(2, "Full name must be at least 2 characters.")
    .regex(/^[A-Za-z ]+$/, "Full name can only contain letters and spaces."),
  phoneNumber: z
    .string()
    .refine((val) => val === "" || isValidPhoneNumber(val, "US"), {
      message:
        "Please enter a valid US phone number (e.g., (801) 673-1947 or +1 801-673-1947)",
    }),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileInformationProps {
  name: string;
  email: string;
  phoneNumber: string;
  isEditing: boolean;
  onSubmit: (values: ProfileFormValues) => void;
  onCancel: () => void;
  isLoading: boolean;
}

/**
 * ProfileInformation Component
 *
 * Displays and manages user profile information including name, email, and phone number.
 * Supports both view and edit modes for certain fields.
 */
export default function ProfileInformation({
  name,
  email,
  phoneNumber,
  isEditing,
  onSubmit,
  onCancel,
  isLoading,
}: ProfileInformationProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty, isValid },
    reset,
  } = useForm<ProfileFormValues>({
    mode: "onChange",
    defaultValues: { name, phoneNumber },
    resolver: zodResolver(profileSchema),
  });

  // Reset form when switching between edit/view or when data changes
  React.useEffect(() => {
    reset({ name, phoneNumber });
  }, [name, phoneNumber, isEditing, reset]);

  return (
    <form
      onSubmit={handleSubmit((data) => {
        onSubmit(data);
      })}
    >
      <div className="space-y-6">
        <div>
          <TextField
            label="Full Name"
            type="text"
            {...register("name")}
            placeholder="Enter your full name"
            disabled={!isEditing || isLoading}
            className={!isEditing ? "bg-secondary-50 cursor-not-allowed" : ""}
            error={errors.name?.message || ""}
            helperText={errors.name?.message}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Email Address
          </label>
          <p className="text-secondary-900 bg-secondary-50 px-3 py-2 rounded-md border border-secondary-200">
            {email}
          </p>
        </div>
        <div>
          <Controller
            name="phoneNumber"
            control={control}
            render={({ field }) => (
              <TextField
                label="Phone Number"
                type="tel"
                value={field.value}
                onChange={(e) => {
                  const formatter = new AsYouType("US");
                  const formatted = formatter.input(e.target.value);
                  field.onChange(formatted);
                }}
                placeholder="Enter phone number"
                disabled={!isEditing || isLoading}
                className={
                  !isEditing ? "bg-secondary-50 cursor-not-allowed" : ""
                }
                error={errors.phoneNumber?.message || ""}
                helperText={errors.phoneNumber?.message}
              />
            )}
          />
        </div>
      </div>
      {isEditing && (
        <div className="mt-8 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isLoading}
            fullWidth
            className="sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading || !isDirty || !isValid}
            isLoading={isLoading}
            fullWidth
            className="sm:w-auto"
          >
            Save Changes
          </Button>
        </div>
      )}
    </form>
  );
}
