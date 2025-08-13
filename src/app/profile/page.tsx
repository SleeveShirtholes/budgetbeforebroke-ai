"use client";

import Breadcrumb from "@/components/Breadcrumb";
import Button from "@/components/Button";
import Card from "@/components/Card";
import PageInfo from "@/components/PageInfo";
import { useToast } from "@/components/Toast";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import useSWR from "swr";
import AccountInformation from "./components/AccountInformation";
import AccountSecurity from "./components/AccountSecurity";
import ProfileHeader from "./components/ProfileHeader";
import type { ProfileFormValues } from "./components/ProfileInformation";
import ProfileInformation from "./components/ProfileInformation";
import SignInMethods from "./components/SignInMethods";

// SWR fetcher using server action
const fetchProfile = async () => {
  const { getProfile } = await import("./actions");
  return getProfile();
};

/**
 * ProfilePage Component
 *
 * A comprehensive user profile management page that allows users to:
 * - View and update their profile photo
 * - Edit personal information (phone number, preferred name)
 * - Manage sign-in methods
 * - Configure account security settings
 * - View account information and activity
 *
 * The component uses mock data for demonstration purposes and should be
 * integrated with actual authentication and user data management systems.
 *
 * @returns {JSX.Element} A fully interactive profile management interface
 */
export default function ProfilePage() {
  const {
    data: profileData,
    error,
    isLoading,
    mutate,
  } = useSWR("/profile", fetchProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { showToast } = useToast();
  const { data: session } = authClient.useSession();

  // Handlers for form actions
  const handleCancel = () => setIsEditing(false);

  // RHF onSubmit handler
  const handleSubmit = async (values: ProfileFormValues) => {
    setIsSaving(true);
    try {
      const { updateProfile } = await import("./actions");
      await updateProfile({
        name: values.name.trim(),
        phoneNumber: values.phoneNumber.replace(/\D/g, ""),
      });
      mutate();
      setIsEditing(false);
      showToast("Profile updated successfully!", { type: "success" });
    } catch (error) {
      console.error("Error updating profile:", error);
      showToast("Failed to update profile", { type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-secondary-200 rounded w-1/4"></div>
          <div className="h-32 bg-secondary-200 rounded"></div>
        </div>
      </div>
    );
  }
  if (error) {
    return <div className="text-red-600">Failed to load profile data.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Navigation */}
      <div className="mb-6">
        <Breadcrumb />
      </div>

      {/* Profile Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        <ProfileHeader
          name={profileData?.name || session?.user?.name || "User"}
          email={
            profileData?.email || session?.user?.email || "user@example.com"
          }
          avatar={
            profileData?.image || session?.user?.image || "/default-avatar.png"
          }
          onAvatarChange={() => {}}
        />
        <div className="hidden lg:block">
          <PageInfo
            title="Profile Page Guide"
            content={
              <div className="text-sm text-secondary-700 space-y-4">
                <div>
                  <h4 className="font-semibold text-secondary-900 mb-2">
                    Profile Photo
                  </h4>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Click on your current avatar</li>
                    <li>Select a new image from your device</li>
                    <li>The photo will be automatically updated</li>
                  </ol>
                  <p className="text-secondary-600 text-xs mt-2">
                    Supported formats: JPG, PNG, GIF
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-secondary-900 mb-2">
                    Profile Information
                  </h4>
                  <p>Update your basic information:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>
                      Click &quot;Edit&quot; to modify your name and phone
                      number
                    </li>
                    <li>Use &quot;Save Changes&quot; to confirm updates</li>
                    <li>Click &quot;Cancel&quot; to discard changes</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-secondary-900 mb-2">
                    Sign-in Methods
                  </h4>
                  <p>Manage your account access:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>View your connected sign-in methods</li>
                    <li>
                      Click &quot;Manage&quot; to modify authentication settings
                    </li>
                    <li>Add or remove sign-in providers</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-secondary-900 mb-2">
                    Account Security
                  </h4>
                  <p>Enhance your account security:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Enable two-factor authentication</li>
                    <li>Change your password regularly</li>
                    <li>Review your account activity</li>
                  </ul>
                </div>
              </div>
            }
          />
        </div>
      </div>

      {/* Profile Information */}
      <Card variant="default" padding="lg">
        <h2 className="text-xl font-semibold text-secondary-900 mb-4">
          Profile Information
        </h2>
        <ProfileInformation
          name={
            (profileData && profileData.name) || session?.user?.name || "User"
          }
          email={
            (profileData && profileData.email) ||
            session?.user?.email ||
            "user@example.com"
          }
          phoneNumber={(profileData && profileData.phoneNumber) || ""}
          isEditing={isEditing}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isSaving}
        />
        {/* Show Edit button when not editing */}
        {!isEditing && (
          <div className="flex justify-end mt-4">
            <Button onClick={() => setIsEditing(true)} type="button">
              Edit
            </Button>
          </div>
        )}
      </Card>

      {/* Sign-in Methods */}
      <Card variant="default" padding="lg">
        <h2 className="text-xl font-semibold text-secondary-900 mb-4">
          Sign-in Methods
        </h2>
        <SignInMethods />
        {!session?.user?.emailVerified && (
          <div className="mt-6 text-sm text-yellow-600">
            Please verify your email to enable passkey sign-in.
          </div>
        )}
      </Card>

      {/* Account Security */}
      <Card variant="default" padding="lg">
        <h2 className="text-xl font-semibold text-secondary-900 mb-4">
          Account Security
        </h2>
        <AccountSecurity />
      </Card>

      {/* Account Information */}
      <Card variant="default" padding="lg">
        <h2 className="text-xl font-semibold text-secondary-900 mb-4">
          Account Information
        </h2>
        <AccountInformation />
      </Card>
    </div>
  );
}
