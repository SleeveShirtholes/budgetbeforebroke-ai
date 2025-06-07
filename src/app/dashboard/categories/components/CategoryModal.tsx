/**
 * CategoryModal Component
 *
 * Modal dialog for adding or editing a category. Used for both add and edit flows in CategoriesPage.
 *
 * Props:
 * - isOpen: Whether the modal is open
 * - onClose: Function to close the modal
 * - onSave: Function to save the category (add or edit)
 * - defaultValues: Optional default values for the form
 * - mode: "add" or "edit" (default: "add")
 */
import Button from "@/components/Button";
import TextArea from "@/components/Forms/TextArea";
import TextField from "@/components/Forms/TextField";
import Modal from "@/components/Modal";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Form schema
const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

// Props for CategoryModal
interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CategoryFormData) => void;
  defaultValues?: CategoryFormData;
  mode?: "add" | "edit";
}

/**
 * CategoryModal renders a modal dialog for adding or editing a category.
 */
export default function CategoryModal({
  isOpen,
  onClose,
  onSave,
  defaultValues = { name: "", description: "" },
  mode = "add",
}: CategoryModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues,
  });

  const onSubmit = (data: CategoryFormData) => {
    onSave(data);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "add" ? "Add Category" : "Edit Category"}
      maxWidth="sm"
      footerButtons={
        <>
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" form="category-form">
            {mode === "add" ? "Add" : "Save"}
          </Button>
        </>
      }
    >
      <form
        id="category-form"
        data-testid="category-form"
        className="space-y-4"
        onSubmit={handleSubmit(onSubmit)}
      >
        <TextField
          id={`${mode}-name`}
          label="Name"
          error={errors.name?.message}
          {...register("name")}
        />
        <TextArea
          id={`${mode}-description`}
          label="Description"
          error={errors.description?.message}
          {...register("description")}
          rows={3}
        />
      </form>
    </Modal>
  );
}
