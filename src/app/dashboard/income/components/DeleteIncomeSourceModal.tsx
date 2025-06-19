import Button from "@/components/Button";
import Modal from "@/components/Modal/Modal";

/**
 * Props interface for the DeleteIncomeSourceModal component
 */
interface DeleteIncomeSourceModalProps {
    /** Whether the modal is currently open */
    isOpen: boolean;
    /** Callback function to close the modal */
    onClose: () => void;
    /** Async callback function to handle the deletion confirmation */
    onConfirm: () => Promise<void>;
    /** Whether the deletion operation is currently in progress */
    isDeleting: boolean;
}

/**
 * Modal component for confirming the deletion of an income source
 *
 * This component displays a confirmation dialog that asks the user to confirm
 * whether they want to delete an income source. It includes:
 * - A warning message about the deletion
 * - Cancel and Delete buttons with appropriate states
 * - Loading state handling during the deletion process
 *
 * @param props - The component props
 * @param props.isOpen - Controls whether the modal is visible
 * @param props.onClose - Function called when the modal should be closed
 * @param props.onConfirm - Async function called when deletion is confirmed
 * @param props.isDeleting - Indicates if deletion is in progress
 *
 * @returns A modal dialog for confirming income source deletion
 */
export function DeleteIncomeSourceModal({ isOpen, onClose, onConfirm, isDeleting }: DeleteIncomeSourceModalProps) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Delete Income Source">
            <div className="space-y-4">
                {/* Warning message to confirm deletion */}
                <p>Are you sure you want to delete this income source?</p>

                {/* Action buttons container */}
                <div className="flex justify-end space-x-2">
                    {/* Cancel button - disabled during deletion */}
                    <Button variant="secondary" onClick={onClose} disabled={isDeleting}>
                        Cancel
                    </Button>

                    {/* Delete button - shows loading state and is disabled during deletion */}
                    <Button variant="danger" onClick={onConfirm} isLoading={isDeleting} disabled={isDeleting}>
                        Delete
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
