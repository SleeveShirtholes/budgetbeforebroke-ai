import { deleteCategory } from "@/app/actions/category";
import Button from "@/components/Button";
import CustomRadioGroup from "@/components/Forms/CustomRadioGroup";
import CustomSelect from "@/components/Forms/CustomSelect";
import Modal from "@/components/Modal";
import Spinner from "@/components/Spinner";
import { TRANSACTION_CATEGORIES } from "@/types/transaction";
import { useState } from "react";
import { mutate } from "swr";
import { z } from "zod";

/**
 * Schema for validating the delete category form data.
 * - transactionHandling: Must be either "unassign" or "reassign"
 * - replacementCategory: Optional string, but required if transactionHandling is "reassign"
 */
const deleteCategorySchema = z
  .object({
    transactionHandling: z.enum(["unassign", "reassign"]),
    replacementCategory: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.transactionHandling === "reassign") {
        return !!data.replacementCategory;
      }
      return true;
    },
    {
      message: "Please select a replacement category",
      path: ["replacementCategory"],
    },
  );

type DeleteCategoryFormData = z.infer<typeof deleteCategorySchema>;

interface DeleteCategoryModalProps {
  /** Whether the modal is currently open */
  isOpen: boolean;
  /** Callback function to close the modal */
  onClose: () => void;
  /** The category to be deleted, or null if no category is selected */
  categoryToDelete: {
    id: string;
    name: string;
    transactionCount: number;
  } | null;
  /** The ID of the currently selected account */
  selectedAccountId: string;
}

/**
 * A modal component for deleting a transaction category.
 *
 * This component provides a user interface for deleting a category and handling its associated transactions.
 * It offers two options for handling existing transactions:
 * 1. Leave them unassigned
 * 2. Reassign them to another category
 *
 * The component uses react-hook-form with zod validation to ensure proper form handling and validation.
 * It also provides visual feedback during the deletion process and handles errors appropriately.
 *
 * @param {DeleteCategoryModalProps} props - The component props
 * @returns {JSX.Element} The rendered modal component
 *
 * @example
 * ```tsx
 * <DeleteCategoryModal
 *   isOpen={isModalOpen}
 *   onClose={() => setIsModalOpen(false)}
 *   categoryToDelete={selectedCategory}
 *   selectedAccountId={currentAccountId}
 * />
 * ```
 */
export default function DeleteCategoryModal({
  isOpen,
  onClose,
  categoryToDelete,
  selectedAccountId,
}: DeleteCategoryModalProps) {
  const [formData, setFormData] = useState<DeleteCategoryFormData>({
    transactionHandling: "unassign",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof DeleteCategoryFormData, string>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTransactionHandlingChange = (value: string) => {
    const newFormData = {
      ...formData,
      transactionHandling: value as "unassign" | "reassign",
    };
    if (value === "unassign") {
      newFormData.replacementCategory = undefined;
    }
    setFormData(newFormData);
    validateForm(newFormData);
  };

  const handleReplacementCategoryChange = (value: string) => {
    const newFormData = {
      ...formData,
      replacementCategory: value,
    };
    setFormData(newFormData);
    validateForm(newFormData);
  };

  const validateForm = (data: DeleteCategoryFormData) => {
    try {
      deleteCategorySchema.parse(data);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof DeleteCategoryFormData, string>> =
          {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as keyof DeleteCategoryFormData] =
              err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;

    if (!validateForm(formData)) {
      return;
    }

    setIsSubmitting(true);
    try {
      await deleteCategory({
        id: categoryToDelete.id,
        reassignToCategoryId:
          formData.transactionHandling === "reassign"
            ? formData.replacementCategory
            : undefined,
      });
      await mutate(["categories", selectedAccountId]);
      onClose();
    } catch (error) {
      console.error("Failed to delete category:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Category"
      maxWidth="md"
      footerButtons={
        <>
          <Button
            variant="secondary"
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            type="button"
            onClick={handleDeleteCategory}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Deleting...
              </>
            ) : (
              "Delete Category"
            )}
          </Button>
        </>
      }
    >
      {categoryToDelete && (
        <div className="space-y-4">
          {categoryToDelete.transactionCount > 0 ? (
            <>
              {/* Warning message about the category and its transactions */}
              <p>
                You are about to delete the category{" "}
                <span className="font-semibold">{categoryToDelete.name}</span>.
                This category has {categoryToDelete.transactionCount}{" "}
                transactions assigned to it.
              </p>
              <p>What would you like to do with these transactions?</p>

              {/* Radio group for selecting transaction handling method */}
              <CustomRadioGroup
                label="Transaction Handling"
                options={[
                  { value: "unassign", label: "Leave transactions unassigned" },
                  { value: "reassign", label: "Assign to another category" },
                ]}
                value={formData.transactionHandling}
                onChange={handleTransactionHandlingChange}
                error={errors.transactionHandling}
                name="transactionHandling"
              />

              {/* Conditional rendering of replacement category select */}
              {formData.transactionHandling === "reassign" && (
                <div className="ml-7 mt-2">
                  <CustomSelect
                    value={formData.replacementCategory || ""}
                    onChange={handleReplacementCategoryChange}
                    options={TRANSACTION_CATEGORIES.map((cat) => ({
                      value: cat,
                      label: cat,
                    }))}
                    label="Select category"
                    placeholder="Choose a category"
                    error={errors.replacementCategory}
                  />
                </div>
              )}
            </>
          ) : (
            // Simple confirmation message for categories with no transactions
            <p>
              Are you sure you want to delete the category{" "}
              <span className="font-semibold">{categoryToDelete.name}</span>?
              This action cannot be undone.
            </p>
          )}
        </div>
      )}
    </Modal>
  );
}
