import Button from "@/components/Button";
import Modal from "@/components/Modal";

/**
 * Props for the ChangeRoleConfirmationModal component
 * @interface ChangeRoleConfirmationModalProps
 * @property {boolean} isOpen - Controls the visibility of the modal
 * @property {() => void} onClose - Callback function when modal is closed
 * @property {() => void} onConfirm - Callback function when role change is confirmed
 * @property {"owner" | "member"} newRole - The new role to assign to the user
 * @property {string} userEmail - Email of the user whose role is being changed
 */
interface ChangeRoleConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  newRole: "owner" | "member";
  userEmail: string;
}

/**
 * A modal component that confirms role changes for users in the account.
 * Displays different messages and button styles based on whether the user
 * is being promoted to owner or demoted to member.
 *
 * @param {ChangeRoleConfirmationModalProps} props - Component props
 * @returns {JSX.Element} The rendered modal component
 */
export default function ChangeRoleConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  newRole,
  userEmail,
}: ChangeRoleConfirmationModalProps) {
  // Determine if this is a promotion to owner or demotion to member
  const isPromotingToOwner = newRole === "owner";

  // Set modal title based on role change type
  const title = isPromotingToOwner ? "Promote to Owner" : "Change to Member";

  // Set warning message based on role change type
  const message = isPromotingToOwner
    ? `Are you sure you want to promote ${userEmail} to owner? They will have full control over the account, including the ability to manage users and change account settings.`
    : `Are you sure you want to change ${userEmail}'s role to member? They will lose account ownership privileges and will no longer be able to manage users or change account settings.`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="sm"
      footerButtons={
        <div className="flex gap-2">
          <Button type="button" onClick={onClose} variant="outline" size="sm">
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            variant={isPromotingToOwner ? "primary" : "danger"}
            size="sm"
          >
            Confirm
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <p className="text-gray-700">{message}</p>
      </div>
    </Modal>
  );
}
