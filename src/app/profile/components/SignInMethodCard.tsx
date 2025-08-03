"use client";

import Button from "@/components/Button";
import { SignInMethod } from "../types/signInMethods";
import { TrashIcon } from "@heroicons/react/24/outline";
import { formatDate } from "@/utils/date";

interface SignInMethodCardProps {
  method: SignInMethod;
  onDelete: () => void;
}

/**
 * SignInMethodCard Component
 *
 * Displays a single sign-in method with its provider, last used timestamp, and a delete button.
 *
 * @param {SignInMethodCardProps} props - The component props
 * @returns {JSX.Element} A card displaying the sign-in method details
 */
export default function SignInMethodCard({
  method,
  onDelete,
}: SignInMethodCardProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-white rounded-lg border border-gray-200 gap-3">
      <div>
        <h3 className="font-medium text-secondary-900">
          {method.provider}{" "}
          {method.type === "password" ? "Password" : "Account"}
        </h3>
        <p className="text-sm text-secondary-600">
          Last used:{" "}
          {method.lastUsed === "Never" ? "Never" : formatDate(method.lastUsed)}
        </p>
      </div>
      <Button
        variant="text"
        size="sm"
        onClick={onDelete}
        className="text-red-600 hover:text-red-700 hover:bg-red-50 self-end sm:self-auto"
      >
        <TrashIcon className="w-5 h-5" />
        <span className="sr-only">Delete {method.provider} account</span>
      </Button>
    </div>
  );
}
