/**
 * CategoryModal Component
 *
 * Modal dialog for adding or editing a category. Used for both add and edit flows in CategoriesPage.
 * Memoized for performance.
 *
 * Props:
 * - isOpen: Whether the modal is open
 * - onClose: Function to close the modal
 * - onSave: Function to save the category (add or edit)
 * - form: The form state (name, description)
 * - setForm: Setter for the form state
 * - mode: "add" or "edit" (default: "add")
 */
import Button from "@/components/Button";
import TextArea from "@/components/Forms/TextArea";
import TextField from "@/components/Forms/TextField";
import Modal from "@/components/Modal";
import React from "react";

// Props for CategoryModal
interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  form: { name: string; description: string };
  setForm: React.Dispatch<
    React.SetStateAction<{ name: string; description: string }>
  >;
  mode?: "add" | "edit";
}

/**
 * CategoryModal renders a modal dialog for adding or editing a category.
 */
const CategoryModal: React.FC<CategoryModalProps> = React.memo(
  ({ isOpen, onClose, onSave, form, setForm, mode = "add" }) => {
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
            <Button
              variant="primary"
              type="button"
              onClick={onSave}
              disabled={!form.name.trim()}
            >
              {mode === "add" ? "Add" : "Save"}
            </Button>
          </>
        }
      >
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            onSave();
          }}
        >
          <TextField
            id={`${mode}-name`}
            name="name"
            label="Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
          <TextArea
            id={`${mode}-description`}
            name="description"
            label="Description"
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            rows={3}
          />
        </form>
      </Modal>
    );
  },
);
CategoryModal.displayName = "CategoryModal";

export default CategoryModal;
