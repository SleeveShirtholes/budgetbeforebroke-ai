"use client";

import { EnvelopeIcon, PhoneIcon, UserIcon } from "@heroicons/react/24/outline";

import TextField from "@/components/Forms/TextField";

interface ProfileInformationProps {
    name: string;
    email: string;
    phoneNumber: string;
    preferredName: string;
    isEditing: boolean;
    tempPhoneNumber: string;
    tempPreferredName: string;
    onPhoneNumberChange: (value: string) => void;
    onPreferredNameChange: (value: string) => void;
}

/**
 * ProfileInformation Component
 *
 * Displays and manages user profile information including name, email, preferred name, and phone number.
 * Supports both view and edit modes for certain fields.
 *
 * @param {string} name - User's full name (read-only)
 * @param {string} email - User's email address (read-only)
 * @param {string} phoneNumber - User's current phone number
 * @param {string} preferredName - User's current preferred name
 * @param {boolean} isEditing - Whether the component is in edit mode
 * @param {string} tempPhoneNumber - Temporary phone number value during editing
 * @param {string} tempPreferredName - Temporary preferred name value during editing
 * @param {function} onPhoneNumberChange - Callback for phone number changes
 * @param {function} onPreferredNameChange - Callback for preferred name changes
 */
export default function ProfileInformation({
    name,
    email,
    phoneNumber,
    preferredName,
    isEditing,
    tempPhoneNumber,
    tempPreferredName,
    onPhoneNumberChange,
    onPreferredNameChange,
}: ProfileInformationProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center space-x-3">
                <UserIcon className="h-5 w-5 text-secondary-500" />
                <div>
                    <p className="text-sm text-secondary-600">Full Name</p>
                    <p className="text-secondary-900">{name}</p>
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
                <UserIcon className="h-5 w-5 text-secondary-500" />
                <div className="flex-grow">
                    <TextField
                        label="Preferred Name"
                        type="text"
                        value={isEditing ? tempPreferredName : preferredName}
                        onChange={(e) => onPreferredNameChange(e.target.value)}
                        placeholder="Enter your preferred name"
                        disabled={!isEditing}
                        className={!isEditing ? "bg-secondary-50 cursor-not-allowed" : ""}
                    />
                </div>
            </div>
            <div className="flex items-center space-x-3">
                <PhoneIcon className="h-5 w-5 text-secondary-500" />
                <div className="flex-grow">
                    <TextField
                        label="Phone Number"
                        type="tel"
                        value={isEditing ? tempPhoneNumber : phoneNumber}
                        onChange={(e) => onPhoneNumberChange(e.target.value)}
                        placeholder="Enter phone number"
                        disabled={!isEditing}
                        className={!isEditing ? "bg-secondary-50 cursor-not-allowed" : ""}
                    />
                </div>
            </div>
        </div>
    );
}
