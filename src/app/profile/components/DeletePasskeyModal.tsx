import Button from "@/components/Button";
import Modal from "@/components/Modal";

interface Passkey {
    id: string;
    name: string;
    deviceType: string;
    createdAt: Date | null;
}

interface DeletePasskeyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onDelete: () => Promise<void>;
    passkey: Passkey | null;
}

/**
 * Modal for confirming passkey deletion
 */
export default function DeletePasskeyModal({ isOpen, onClose, onDelete, passkey }: DeletePasskeyModalProps) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Delete Passkey"
            maxWidth="sm"
            footerButtons={
                <div className="flex gap-2">
                    <Button type="button" onClick={onClose} variant="outline" size="sm">
                        Cancel
                    </Button>
                    <Button type="button" onClick={onDelete} variant="danger" size="sm">
                        Delete
                    </Button>
                </div>
            }
        >
            <div className="space-y-4">
                <p className="text-gray-700">
                    Are you sure you want to delete this passkey? This action cannot be undone.
                </p>
                {passkey && (
                    <p className="text-sm text-gray-500">
                        You are deleting the passkey &quot;{passkey.name}&quot; from your {passkey.deviceType}.
                    </p>
                )}
            </div>
        </Modal>
    );
}
