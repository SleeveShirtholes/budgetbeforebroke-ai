import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supportCategoriesOptions, supportStatusOptions } from "../types";
import Button from "@/components/Button";
import CustomSelect from "@/components/Forms/CustomSelect";
import Modal from "@/components/Modal";
import TextArea from "@/components/Forms/TextArea";
import TextField from "@/components/Forms/TextField";

/**
 * Zod schema for validating new support request form data
 */
const newRequestSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  category: z.enum(["Feature Request", "Issue", "General Question"]),
  status: z.enum(["Open", "In Progress", "Closed"]),
  isPublic: z.boolean(),
});

export type NewRequestFormData = z.infer<typeof newRequestSchema>;

/**
 * Props for the NewRequestModal component (react-hook-form version)
 * @interface NewRequestModalProps
 * @property {boolean} isOpen - Whether the modal is currently open
 * @property {() => void} onClose - Callback when the modal should close
 * @property {(data: NewRequestFormData) => Promise<void> | void} onSubmit - Callback when the form is submitted
 */
interface NewRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NewRequestFormData) => Promise<void> | void;
}

/**
 * NewRequestModal Component (react-hook-form + zod)
 *
 * A modal dialog for creating new support requests. The form includes:
 * - Title input
 * - Category selection (Feature Request, Issue, General Question)
 * - Status selection (Open, In Progress, Closed)
 * - Description text area
 * - Public/Private toggle
 *
 * The modal includes validation and proper form handling with submit/cancel actions.
 * Shows a loading state on submit.
 *
 * @param {NewRequestModalProps} props - The component props
 * @returns {JSX.Element} A modal dialog containing the new request form
 */
const NewRequestModal: React.FC<NewRequestModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  // Loading state for submit button
  const [loading, setLoading] = useState(false);

  // Initialize react-hook-form with zod validation
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<NewRequestFormData>({
    resolver: zodResolver(newRequestSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "Issue",
      status: "Open",
      isPublic: false,
    },
  });

  // Handle form submission
  const handleFormSubmit = async (data: NewRequestFormData) => {
    setLoading(true);
    try {
      await onSubmit(data);
      reset();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Support Request"
      maxWidth="lg"
      footerButtons={
        <div className="flex gap-2">
          <Button type="button" onClick={onClose} variant="outline">
            Cancel
          </Button>
          <Button
            type="submit"
            form="new-request-form"
            variant="primary"
            isLoading={loading}
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Request"}
          </Button>
        </div>
      }
    >
      <form
        className="space-y-4"
        id="new-request-form"
        data-testid="new-request-form"
        onSubmit={handleSubmit(handleFormSubmit)}
      >
        {/* Title field */}
        <TextField
          label="Title"
          id="request-title"
          placeholder="Briefly describe your issue"
          required
          error={errors.title?.message}
          {...register("title")}
        />
        {/* Category select */}
        <Controller
          name="category"
          control={control}
          render={({ field }) => (
            <CustomSelect
              label="Category"
              id="request-category"
              options={supportCategoriesOptions}
              value={field.value}
              onChange={field.onChange}
              required
              error={errors.category?.message}
            />
          )}
        />
        {/* Status select */}
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <CustomSelect
              label="Status"
              id="request-status"
              options={supportStatusOptions}
              value={field.value}
              onChange={field.onChange}
              required
              error={errors.status?.message}
            />
          )}
        />
        {/* Description field */}
        <TextArea
          label="Description"
          id="request-description"
          placeholder="Provide a detailed description of the problem or request..."
          required
          rows={5}
          error={errors.description?.message}
          {...register("description")}
        />
        {/* Public/Private toggle */}
        <Controller
          name="isPublic"
          control={control}
          render={({ field }) => (
            <div className="flex items-center mt-4">
              <input
                id="request-public"
                type="checkbox"
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
                className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <label
                htmlFor="request-public"
                className="ml-2 block text-sm text-gray-900"
              >
                Make this request public (visible to other users)
              </label>
            </div>
          )}
        />
      </form>
    </Modal>
  );
};

export default NewRequestModal;
