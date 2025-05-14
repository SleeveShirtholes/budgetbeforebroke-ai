"use client";

import { KeyIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";

/**
 * AccountSecurity Component
 *
 * A component that displays security-related settings for the user's account.
 * Currently includes options for:
 * - Two-Factor Authentication (2FA) setup
 * - Password change functionality
 *
 * Each security option is displayed in a card format with an icon, description,
 * and an action button.
 */
export default function AccountSecurity() {
    return (
        <div className="space-y-4">
            {/* Two-Factor Authentication Card */}
            <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
                <div className="flex items-center space-x-3">
                    <ShieldCheckIcon className="h-5 w-5 text-secondary-500" />
                    <div>
                        <p className="font-medium text-secondary-900">Two-Factor Authentication</p>
                        <p className="text-sm text-secondary-600">Add an extra layer of security to your account</p>
                    </div>
                </div>
                <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">Enable</button>
            </div>
            {/* Password Change Card */}
            <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
                <div className="flex items-center space-x-3">
                    <KeyIcon className="h-5 w-5 text-secondary-500" />
                    <div>
                        <p className="font-medium text-secondary-900">Change Password</p>
                        <p className="text-sm text-secondary-600">Last changed: 30 days ago</p>
                    </div>
                </div>
                <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">Change</button>
            </div>
        </div>
    );
}
