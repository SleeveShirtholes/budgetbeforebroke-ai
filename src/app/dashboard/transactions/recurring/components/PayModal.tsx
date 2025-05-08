import Button from "@/components/Button";
import Modal from "@/components/Modal/Modal";
import PaymentForm from "./PaymentForm";

interface PayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  amount: string;
  date: string;
  note: string;
  onAmountChange: (value: string) => void;
  onDateChange: (date: string) => void;
  onNoteChange: (value: string) => void;
}

/**
 * Modal component for recording a payment on a recurring debt.
 * Wraps the PaymentForm component with modal functionality.
 * Provides cancel and submit actions for the payment process.
 */
export default function PayModal({
  isOpen,
  onClose,
  onSubmit,
  amount,
  date,
  note,
  onAmountChange,
  onDateChange,
  onNoteChange,
}: PayModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pay Recurring"
      maxWidth="sm"
      footerButtons={
        <div className="flex gap-2">
          <Button type="button" onClick={onClose} variant="outline" size="sm">
            Cancel
          </Button>
          <Button type="submit" form="pay-form" variant="primary" size="sm">
            Pay
          </Button>
        </div>
      }
    >
      <PaymentForm
        amount={amount}
        date={date}
        note={note}
        onAmountChange={onAmountChange}
        onDateChange={onDateChange}
        onNoteChange={onNoteChange}
        onSubmit={onSubmit}
      />
    </Modal>
  );
}
