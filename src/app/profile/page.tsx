"use client";

import Breadcrumb from "@/components/Breadcrumb";
import Card from "@/components/Card";
import PageInfo from "@/components/PageInfo";
import { useToast } from "@/components/Toast";
import { useState } from "react";
import AccountInformation from "./components/AccountInformation";
import AccountSecurity from "./components/AccountSecurity";
import ProfileHeader from "./components/ProfileHeader";
import ProfileInformation from "./components/ProfileInformation";
import SignInMethods from "./components/SignInMethods";

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
    // State management for editable profile fields
    const [phoneNumber, setPhoneNumber] = useState("(555) 123-4567");
    const [isEditing, setIsEditing] = useState(false);
    const [tempPhoneNumber, setTempPhoneNumber] = useState(phoneNumber);
    const [preferredName, setPreferredName] = useState("John");
    const [tempPreferredName, setTempPreferredName] = useState(preferredName);
    const { showToast } = useToast();

    // Mock user data - replace with actual user data from your auth system
    const [userData, setUserData] = useState({
        name: "John Doe",
        email: "john.doe@example.com",
        avatar: "/default-avatar.png",
        signInMethods: [
            { type: "email", provider: "Email", lastUsed: "2024-03-20" },
            { type: "google", provider: "Google", lastUsed: "2024-03-19" },
        ],
        accountCreated: "2024-01-01",
        lastLogin: "2024-03-20",
    });

    // Handlers for profile updates
    const handleAvatarChange = (previewUrl: string) => {
        setUserData((prev) => ({
            ...prev,
            avatar: previewUrl,
        }));
    };

    // Toggle edit mode and initialize temporary state
    const handleEdit = () => {
        setIsEditing(true);
        setTempPhoneNumber(phoneNumber);
        setTempPreferredName(preferredName);
    };

    // Save changes and update profile information
    const handleSave = () => {
        setPhoneNumber(tempPhoneNumber);
        setPreferredName(tempPreferredName);
        setIsEditing(false);
        // Here you would typically make an API call to update the phone number and preferred name
        console.log("Saving phone number:", tempPhoneNumber);
        console.log("Saving preferred name:", tempPreferredName);
        showToast("Profile updated successfully!", { type: "success" });
    };

    // Cancel editing and revert temporary changes
    const handleCancel = () => {
        setTempPhoneNumber(phoneNumber);
        setTempPreferredName(preferredName);
        setIsEditing(false);
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
            {/* Navigation */}
            <div className="mb-6">
                <Breadcrumb />
            </div>

            {/* Profile Header */}
            <div className="flex items-center justify-between">
                <ProfileHeader
                    name={userData.name}
                    email={userData.email}
                    avatar={userData.avatar}
                    onAvatarChange={handleAvatarChange}
                />
                <PageInfo
                    title="Profile Page Guide"
                    content={
                        <div className="text-sm text-secondary-700 space-y-4">
                            <div>
                                <h4 className="font-semibold text-secondary-900 mb-2">Profile Photo</h4>
                                <ol className="list-decimal list-inside space-y-1">
                                    <li>Click on your current avatar</li>
                                    <li>Select a new image from your device</li>
                                    <li>The photo will be automatically updated</li>
                                </ol>
                                <p className="text-secondary-600 text-xs mt-2">Supported formats: JPG, PNG, GIF</p>
                            </div>

                            <div>
                                <h4 className="font-semibold text-secondary-900 mb-2">Profile Information</h4>
                                <p>Update your basic information:</p>
                                <ul className="list-disc list-inside space-y-1">
                                    <li>Click &quot;Edit&quot; to modify your phone number</li>
                                    <li>Use &quot;Save Changes&quot; to confirm updates</li>
                                    <li>Click &quot;Cancel&quot; to discard changes</li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="font-semibold text-secondary-900 mb-2">Sign-in Methods</h4>
                                <p>Manage your account access:</p>
                                <ul className="list-disc list-inside space-y-1">
                                    <li>View your connected sign-in methods</li>
                                    <li>Click &quot;Manage&quot; to modify authentication settings</li>
                                    <li>Add or remove sign-in providers</li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="font-semibold text-secondary-900 mb-2">Account Security</h4>
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

            {/* Profile Information */}
            <Card variant="default" padding="lg">
                <h2 className="text-xl font-semibold text-secondary-900 mb-4">Profile Information</h2>
                <ProfileInformation
                    name={userData.name}
                    email={userData.email}
                    phoneNumber={phoneNumber}
                    preferredName={preferredName}
                    isEditing={isEditing}
                    tempPhoneNumber={tempPhoneNumber}
                    tempPreferredName={tempPreferredName}
                    onPhoneNumberChange={setTempPhoneNumber}
                    onPreferredNameChange={setTempPreferredName}
                />
                <div className="mt-6 flex justify-end space-x-3">
                    {isEditing ? (
                        <>
                            <button
                                onClick={handleCancel}
                                className="px-4 py-2 text-sm font-medium text-secondary-700 bg-white border border-secondary-300 rounded-md hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                            >
                                Save Changes
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={handleEdit}
                            className="px-4 py-2 text-sm font-medium text-primary-600 bg-white border border-primary-300 rounded-md hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                            Edit
                        </button>
                    )}
                </div>
            </Card>

            {/* Sign-in Methods */}
            <Card variant="default" padding="lg">
                <h2 className="text-xl font-semibold text-secondary-900 mb-4">Sign-in Methods</h2>
                <SignInMethods methods={userData.signInMethods} />
            </Card>

            {/* Account Security */}
            <Card variant="default" padding="lg">
                <h2 className="text-xl font-semibold text-secondary-900 mb-4">Account Security</h2>
                <AccountSecurity />
            </Card>

            {/* Account Information */}
            <Card variant="default" padding="lg">
                <h2 className="text-xl font-semibold text-secondary-900 mb-4">Account Information</h2>
                <AccountInformation accountCreated={userData.accountCreated} lastLogin={userData.lastLogin} />
            </Card>
        </div>
    );
}
