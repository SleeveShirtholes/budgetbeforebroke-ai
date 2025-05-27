"use client";

import Button from "@/components/Button";
import Modal from "@/components/Modal";
import { SignInMethod } from "../types/signInMethods";

/**
 * Props for the DeleteMethodModal component
 * @interface DeleteMethodModalProps
 * @property {SignInMethod | null} method - The sign-in method to be deleted, or null if modal should be closed
 * @property {boolean} isDeleting - Whether the deletion is in progress
 * @property {() => void} onClose - Callback when the modal should be closed
 * @property {() => void} onConfirm - Callback when deletion is confirmed
 */
interface DeleteMethodModalProps {
  method: SignInMethod | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

/**
 * DeleteMethodModal Component
 *
 * Displays a confirmation modal for deleting a sign-in method.
 *
 * @param {DeleteMethodModalProps} props - The component props
 * @returns {JSX.Element} A modal for confirming sign-in method deletion
 */
export default function DeleteMethodModal({
  method,
  isDeleting,
  onClose,
  onConfirm,
}: DeleteMethodModalProps) {
  return (
    <Modal isOpen={!!method} onClose={onClose} title="Remove Sign-in Method">
      <div className="space-y-4">
        <p>
          Are you sure you want to remove {method?.provider} as a sign-in
          method? You won&apos;t be able to sign in with this method anymore.
        </p>
        <div className="flex justify-end space-x-3">
          <Button variant="text" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} isLoading={isDeleting}>
            Remove
          </Button>
        </div>
      </div>
    </Modal>
  );
}
