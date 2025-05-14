"use client";

import { KeyIcon } from "@heroicons/react/24/outline";

/**
 * Interface representing a sign-in method used by a user
 * @interface SignInMethod
 * @property {string} type - The type of sign-in method (e.g., 'password', 'oauth')
 * @property {string} provider - The provider of the sign-in method (e.g., 'Google', 'Email')
 * @property {string} lastUsed - The timestamp of when this method was last used
 */
interface SignInMethod {
  type: string;
  provider: string;
  lastUsed: string;
}

/**
 * Props interface for the SignInMethods component
 * @interface SignInMethodsProps
 * @property {SignInMethod[]} methods - Array of sign-in methods to display
 */
interface SignInMethodsProps {
  methods: SignInMethod[];
}

/**
 * SignInMethods Component
 *
 * Displays a list of user's sign-in methods with their providers and last used timestamps.
 * Each method is displayed in a card format with a manage button.
 *
 * @component
 * @param {SignInMethodsProps} props - Component props
 * @returns {JSX.Element} A list of sign-in method cards
 */
export default function SignInMethods({ methods }: SignInMethodsProps) {
  return (
    <div role="list" className="space-y-4">
      {methods.map((method) => (
        <div
          key={method.type}
          role="listitem"
          className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg"
        >
          <div className="flex items-center space-x-3">
            <KeyIcon className="h-5 w-5 text-secondary-500" />
            <div>
              <p className="font-medium text-secondary-900">
                {method.provider}
              </p>
              <p className="text-sm text-secondary-600">
                Last used: {method.lastUsed}
              </p>
            </div>
          </div>
          <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            Manage
          </button>
        </div>
      ))}
    </div>
  );
}
