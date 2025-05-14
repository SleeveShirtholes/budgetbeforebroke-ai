"use client";

import Avatar from "@/components/Avatar";
import { CameraIcon } from "@heroicons/react/24/outline";
import { useRef } from "react";

interface ProfileHeaderProps {
  name: string;
  email: string;
  avatar: string;
  onAvatarChange: (previewUrl: string) => void;
}

/**
 * ProfileHeader Component
 *
 * A component that displays a user's profile information including their avatar, name, and email.
 * Provides functionality to change the user's avatar through a file upload interface.
 *
 * @param {string} name - The user's full name
 * @param {string} email - The user's email address
 * @param {string} avatar - URL or base64 string of the user's avatar image
 * @param {function} onAvatarChange - Callback function triggered when a new avatar is selected
 * @returns {JSX.Element} A profile header component with avatar and user information
 */
export default function ProfileHeader({
  name,
  email,
  avatar,
  onAvatarChange,
}: ProfileHeaderProps) {
  // Reference to the hidden file input element
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Trigger file input click when avatar is clicked
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  // Handle file selection and create preview URL
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      onAvatarChange(previewUrl);
    }
  };

  return (
    <div className="flex items-center space-x-6">
      {/* Avatar container with hover effects */}
      <div className="relative group">
        <Avatar
          src={avatar}
          name={name}
          size={120}
          className="border-4 border-white shadow-lg cursor-pointer transition-transform group-hover:scale-105"
          onClick={handleAvatarClick}
        />
        {/* Camera icon overlay that appears on hover */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
          <CameraIcon
            className="h-8 w-8 text-white"
            data-testid="camera-icon"
          />
        </div>
        {/* Hidden file input for avatar upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
      {/* User information display */}
      <div>
        <h1 className="text-3xl font-bold text-secondary-900">{name}</h1>
        <p className="text-secondary-600">{email}</p>
      </div>
    </div>
  );
}
