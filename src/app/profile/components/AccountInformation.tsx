"use client";

/**
 * Props interface for the AccountInformation component
 * @interface AccountInformationProps
 * @property {string} accountCreated - The date when the account was created
 * @property {string} lastLogin - The date of the user's last login
 */
interface AccountInformationProps {
  accountCreated: string;
  lastLogin: string;
}

/**
 * AccountInformation Component
 *
 * Displays key account information including creation date and last login time
 * in a two-column grid layout.
 *
 * @param {AccountInformationProps} props - The component props
 * @returns {JSX.Element} A grid layout displaying account information
 */
export default function AccountInformation({
  accountCreated,
  lastLogin,
}: AccountInformationProps) {
  return (
    // Main container with vertical spacing
    <div className="space-y-4">
      {/* Two-column grid layout for account details */}
      <div className="grid grid-cols-2 gap-4">
        {/* Account creation date section */}
        <div>
          <p className="text-sm text-secondary-600">Account Created</p>
          <p className="text-secondary-900">{accountCreated}</p>
        </div>
        {/* Last login date section */}
        <div>
          <p className="text-sm text-secondary-600">Last Login</p>
          <p className="text-secondary-900">{lastLogin}</p>
        </div>
      </div>
    </div>
  );
}
