import Button from "@/components/Button";
import Modal from "@/components/Modal/Modal";
import PaymentForm from "./PaymentForm";
import { DebtPaymentFormData } from "@/lib/schemas/debt";

interface PayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: DebtPaymentFormData) => void;
  isLoading?: boolean;
}

/**
 * Modal component for recording a payment on a debt.
 * Wraps the PaymentForm component with modal functionality.
 * Uses react-hook-form with Zod validation for form handling.
 */
export default function PayModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}: PayModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pay Debt"
      maxWidth="sm"
      footerButtons={
        <div className="flex gap-2">
          <Button
            type="button"
            onClick={onClose}
            variant="outline"
            size="sm"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="pay-form"
            variant="primary"
            size="sm"
            disabled={isLoading}
            isLoading={isLoading}
          >
            Record Payment
          </Button>
        </div>
      }
    >
      <PaymentForm onSubmit={onSubmit} isLoading={isLoading} />
    </Modal>
  );
}
