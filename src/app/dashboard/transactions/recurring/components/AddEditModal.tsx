import Button from "@/components/Button";
import Modal from "@/components/Modal/Modal";
import { RecurringDebt } from "@/types/debt";
import DebtForm from "./DebtForm";

interface AddEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent, addAnother?: boolean) => void;
  editingId: string | null;
  formData: Omit<RecurringDebt, "id">;
  onChange: (data: Omit<RecurringDebt, "id">) => void;
}

/**
 * Modal component for adding or editing a recurring debt.
 * Provides a form interface for creating new recurring debts or modifying existing ones.
 * Includes options to add another entry after submission when creating new debts.
 */
export default function AddEditModal({
  isOpen,
  onClose,
  onSubmit,
  editingId,
  formData,
  onChange,
}: AddEditModalProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(e, undefined);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingId ? "Edit Recurring" : "Add New Recurring"}
      maxWidth="md"
      footerButtons={
        <div className="flex gap-2">
          <Button type="button" onClick={onClose} variant="outline" size="sm">
            Cancel
          </Button>
          {!editingId && (
            <Button
              type="button"
              onClick={(e) => onSubmit(e, true)}
              variant="secondary"
              size="sm"
            >
              Add and Add Another
            </Button>
          )}
          <Button type="submit" form="debt-form" variant="primary" size="sm">
            {editingId ? "Save Changes" : "Add"}
          </Button>
        </div>
      }
    >
      <DebtForm
        formData={formData}
        onChange={onChange}
        onSubmit={handleSubmit}
      />
    </Modal>
  );
}
