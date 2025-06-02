import * as z from "zod";

import Button from "@/components/Button";
import TextArea from "@/components/Forms/TextArea";
import TextField from "@/components/Forms/TextField";
import Modal from "@/components/Modal";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

/**
 * Schema for validating account creation form data
 * Requires a name field and makes description optional
 */
const createAccountSchema = z.object({
  name: z.string().min(1, "Account name is required"),
  description: z.string().optional(),
});

type CreateAccountFormData = z.infer<typeof createAccountSchema>;

interface CreateAccountModalProps {
  /** Controls whether the modal is visible */
  isOpen: boolean;
  /** Callback function when modal is closed */
  onClose: () => void;
  /** Callback function when form is submitted with account details */
  onSave: (name: string, description: string | null) => void;
}

/**
 * CreateAccountModal Component
 *
 * A modal dialog that allows users to create a new account by providing
 * a name and optional description. The form uses react-hook-form with zod
 * validation to ensure data integrity.
 *
 * @param props - Component props
 * @param props.isOpen - Controls modal visibility
 * @param props.onClose - Callback when modal is closed
 * @param props.onSave - Callback when form is submitted
 */
export default function CreateAccountModal({
  isOpen,
  onClose,
  onSave,
}: CreateAccountModalProps) {
  // Initialize form with zod validation
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateAccountFormData>({
    resolver: zodResolver(createAccountSchema),
  });

  // Handle form submission
  const onSubmit = (data: CreateAccountFormData) => {
    onSave(data.name, data.description || null);
    reset();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Account">
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Account name input field */}
        <div className="mb-4">
          <TextField
            label="Account Name"
            id="name"
            {...register("name")}
            error={errors.name?.message}
          />
        </div>
        {/* Optional description text area */}
        <div className="mb-4">
          <TextArea
            label="Description (Optional)"
            id="description"
            {...register("description")}
            error={errors.description?.message}
          />
        </div>
        {/* Form action buttons */}
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Create
          </Button>
        </div>
      </form>
    </Modal>
  );
}
