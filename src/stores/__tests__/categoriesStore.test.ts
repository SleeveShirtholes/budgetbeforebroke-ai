import { TransactionCategory } from "@/types/transaction";
import { act } from "@testing-library/react";
import useCategoriesStore from "../categoriesStore";

// Helper function to get the current store state
const getStoreState = () => useCategoriesStore.getState();

describe("Categories Store", () => {
    beforeEach(() => {
        // Reset the store to its initial state before each test
        useCategoriesStore.setState({
            categories: [
                {
                    id: "1",
                    name: "Groceries",
                    description: "Weekly grocery shopping",
                    transactionCount: 45,
                },
                {
                    id: "2",
                    name: "Dining Out",
                    description: "Restaurants and takeout",
                    transactionCount: 28,
                },
            ],
            isAddModalOpen: false,
            isEditModalOpen: false,
            isDeleteModalOpen: false,
            categoryToEdit: null,
            categoryToDelete: null,
            selectedReplacementCategory: "",
            form: { name: "", description: "" },
        });
    });

    describe("Modal Controls", () => {
        it("should open and close the add modal", () => {
            const { openAddModal, closeAddModal } = getStoreState();

            act(() => {
                openAddModal();
            });
            expect(getStoreState().isAddModalOpen).toBe(true);

            act(() => {
                closeAddModal();
            });
            expect(getStoreState().isAddModalOpen).toBe(false);
        });

        it("should open and close the edit modal with correct category", () => {
            const { openEditModal, closeEditModal } = getStoreState();
            const categoryToEdit = getStoreState().categories[0];

            act(() => {
                openEditModal(categoryToEdit);
            });
            expect(getStoreState().isEditModalOpen).toBe(true);
            expect(getStoreState().categoryToEdit).toEqual(categoryToEdit);

            act(() => {
                closeEditModal();
            });
            expect(getStoreState().isEditModalOpen).toBe(false);
            expect(getStoreState().categoryToEdit).toBeNull();
        });

        it("should open and close the delete modal with correct category", () => {
            const { openDeleteModal, closeDeleteModal } = getStoreState();
            const categoryToDelete = getStoreState().categories[0];

            act(() => {
                openDeleteModal(categoryToDelete);
            });
            expect(getStoreState().isDeleteModalOpen).toBe(true);
            expect(getStoreState().categoryToDelete).toEqual(categoryToDelete);

            act(() => {
                closeDeleteModal();
            });
            expect(getStoreState().isDeleteModalOpen).toBe(false);
            expect(getStoreState().categoryToDelete).toBeNull();
        });
    });

    describe("Form Management", () => {
        it("should update form state", () => {
            const { setForm } = getStoreState();
            const newForm = { name: "New Category", description: "New Description" };

            act(() => {
                setForm(newForm);
            });

            expect(getStoreState().form).toEqual(newForm);
        });
    });

    describe("Category Management", () => {
        it("should add a new category", () => {
            const { setForm, addCategory } = getStoreState();
            const initialCategoryCount = getStoreState().categories.length;

            act(() => {
                setForm({ name: "New Category", description: "New Description" });
                addCategory();
            });

            const newState = getStoreState();
            expect(newState.categories.length).toBe(initialCategoryCount + 1);
            expect(newState.categories[newState.categories.length - 1]).toEqual(
                expect.objectContaining({
                    name: "New Category",
                    description: "New Description",
                    transactionCount: 0,
                })
            );
        });

        it("should edit an existing category", () => {
            const { openEditModal, setForm, editCategory } = getStoreState();
            const categoryToEdit = getStoreState().categories[0];

            act(() => {
                openEditModal(categoryToEdit);
                setForm({ name: "Updated Name", description: "Updated Description" });
                editCategory();
            });

            const updatedCategory = getStoreState().categories.find((c) => c.id === categoryToEdit.id);
            expect(updatedCategory).toEqual(
                expect.objectContaining({
                    name: "Updated Name",
                    description: "Updated Description",
                })
            );
        });

        it("should delete a category", () => {
            const { openDeleteModal, deleteCategory } = getStoreState();
            const categoryToDelete = getStoreState().categories[0];
            const initialCategoryCount = getStoreState().categories.length;

            act(() => {
                openDeleteModal(categoryToDelete);
                deleteCategory();
            });

            const newState = getStoreState();
            expect(newState.categories.length).toBe(initialCategoryCount - 1);
            expect(newState.categories.find((c) => c.id === categoryToDelete.id)).toBeUndefined();
        });

        it("should not delete a category if none is selected", () => {
            const { deleteCategory } = getStoreState();
            const initialCategoryCount = getStoreState().categories.length;

            act(() => {
                deleteCategory();
            });

            expect(getStoreState().categories.length).toBe(initialCategoryCount);
        });
    });

    describe("Replacement Category Selection", () => {
        it("should update the selected replacement category", () => {
            const { setSelectedReplacementCategory } = getStoreState();
            const newCategory: TransactionCategory = "Food";

            act(() => {
                setSelectedReplacementCategory(newCategory);
            });

            expect(getStoreState().selectedReplacementCategory).toBe(newCategory);
        });
    });
});
