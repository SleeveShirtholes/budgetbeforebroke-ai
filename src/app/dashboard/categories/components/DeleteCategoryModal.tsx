import { deleteCategory } from "@/app/actions/category";
import Button from "@/components/Button";
import CustomRadioGroup from "@/components/Forms/CustomRadioGroup";
import CustomSelect from "@/components/Forms/CustomSelect";
import Modal from "@/components/Modal";
import Spinner from "@/components/Spinner";
import { TRANSACTION_CATEGORIES } from "@/types/transaction";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
  // Initialize form with react-hook-form and zod validation
  const {
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<DeleteCategoryFormData>({
    resolver: zodResolver(deleteCategorySchema),
    defaultValues: {
      transactionHandling: "unassign",
    },
  });

  // Watch the transactionHandling field to conditionally render the replacement category select
  const transactionHandling = watch("transactionHandling");

  /**
   * Handles the category deletion process
   * @param {DeleteCategoryFormData} data - The validated form data
   */
  const handleDeleteCategory = async (data: DeleteCategoryFormData) => {
    if (!categoryToDelete) return;
    try {
      await deleteCategory({
        id: categoryToDelete.id,
        reassignToCategoryId:
          data.transactionHandling === "reassign"
            ? data.replacementCategory
            : undefined,
      });
      // Refresh the categories list after successful deletion
      await mutate(["categories", selectedAccountId]);
      onClose();
    } catch (error) {
      console.error("Failed to delete category:", error);
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
            onClick={handleSubmit(handleDeleteCategory)}
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
                value={transactionHandling}
                onChange={(value) => {
                  setValue(
                    "transactionHandling",
                    value as "unassign" | "reassign",
                  );
                  // Clear replacement category when switching to unassign
                  if (value === "unassign") {
                    setValue("replacementCategory", undefined);
                  }
                }}
                error={errors.transactionHandling?.message}
                name="transactionHandling"
              />

              {/* Conditional rendering of replacement category select */}
              {transactionHandling === "reassign" && (
                <div className="ml-7 mt-2">
                  <CustomSelect
                    value={watch("replacementCategory") || ""}
                    onChange={(value) => setValue("replacementCategory", value)}
                    options={TRANSACTION_CATEGORIES.map((cat) => ({
                      value: cat,
                      label: cat,
                    }))}
                    label="Select category"
                    placeholder="Choose a category"
                    error={errors.replacementCategory?.message}
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
