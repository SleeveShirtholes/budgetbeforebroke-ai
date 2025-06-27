"use client";

import { AsYouType, isValidPhoneNumber } from "libphonenumber-js";
import { Controller, useForm } from "react-hook-form";
import { EnvelopeIcon, PhoneIcon, UserIcon } from "@heroicons/react/24/outline";

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
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <UserIcon className="h-5 w-5 text-secondary-500" />
          <div className="flex-grow">
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
        </div>
        <div className="flex items-center space-x-3">
          <EnvelopeIcon className="h-5 w-5 text-secondary-500" />
          <div>
            <p className="text-sm text-secondary-600">Email Address</p>
            <p className="text-secondary-900">{email}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <PhoneIcon className="h-5 w-5 text-secondary-500" />
          <div className="flex-grow">
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
      </div>
      {isEditing && (
        <div className="mt-6 flex flex-col items-end space-y-2">
          <div className="flex space-x-3">
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading || !isDirty || !isValid}
              isLoading={isLoading}
            >
              Save Changes
            </Button>
          </div>
        </div>
      )}
    </form>
  );
}
