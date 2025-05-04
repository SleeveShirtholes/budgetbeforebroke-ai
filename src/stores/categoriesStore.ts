import { TransactionCategory } from "@/types/transaction";
import { create } from "zustand";

// Define the Category interface representing a transaction category
interface Category extends Record<string, unknown> {
  id: string; // Unique identifier for the category
  name: string; // Display name of the category
  description?: string; // Optional description of the category
  transactionCount: number; // Number of transactions using this category
}

// Define the state interface for the categories store
interface CategoriesState {
  // State properties
  categories: Category[]; // List of all categories
  isAddModalOpen: boolean; // Controls visibility of add category modal
  isEditModalOpen: boolean; // Controls visibility of edit category modal
  isDeleteModalOpen: boolean; // Controls visibility of delete category modal
  categoryToEdit: Category | null; // Currently selected category for editing
  categoryToDelete: Category | null; // Currently selected category for deletion
  selectedReplacementCategory: TransactionCategory | ""; // Category to replace deleted category's transactions
  form: { name: string; description: string }; // Form state for add/edit operations

  // Action methods
  setCategories: (categories: Category[]) => void; // Update the categories list
  openAddModal: () => void; // Open the add category modal
  closeAddModal: () => void; // Close the add category modal
  openEditModal: (category: Category) => void; // Open edit modal with selected category
  closeEditModal: () => void; // Close the edit category modal
  openDeleteModal: (category: Category) => void; // Open delete modal with selected category
  closeDeleteModal: () => void; // Close the delete category modal
  setForm: (form: { name: string; description: string }) => void; // Update form state
  setSelectedReplacementCategory: (category: TransactionCategory | "") => void; // Set replacement category

  // Business logic methods
  addCategory: () => void; // Add a new category
  editCategory: () => void; // Edit an existing category
  deleteCategory: () => void; // Delete a category
}

// Create the categories store using Zustand
const useCategoriesStore = create<CategoriesState>((set, get) => ({
  // Initial state with sample categories
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
    {
      id: "3",
      name: "Entertainment",
      description: "Movies, games, and activities",
      transactionCount: 15,
    },
  ],
  isAddModalOpen: false,
  isEditModalOpen: false,
  isDeleteModalOpen: false,
  categoryToEdit: null,
  categoryToDelete: null,
  selectedReplacementCategory: "",
  form: { name: "", description: "" },

  // Action implementations
  setCategories: (categories) => set({ categories }),

  // Modal control actions
  openAddModal: () => {
    set({
      isAddModalOpen: true,
      form: { name: "", description: "" },
    });
  },

  closeAddModal: () => set({ isAddModalOpen: false }),

  openEditModal: (category) => {
    set({
      isEditModalOpen: true,
      categoryToEdit: category,
      form: { name: category.name, description: category.description || "" },
    });
  },

  closeEditModal: () =>
    set({
      isEditModalOpen: false,
      categoryToEdit: null,
    }),

  openDeleteModal: (category) => {
    set({
      isDeleteModalOpen: true,
      categoryToDelete: category,
    });
  },

  closeDeleteModal: () =>
    set({
      isDeleteModalOpen: false,
      categoryToDelete: null,
      selectedReplacementCategory: "",
    }),

  setForm: (form) => set({ form }),

  setSelectedReplacementCategory: (category) =>
    set({ selectedReplacementCategory: category }),

  // Business logic implementations
  addCategory: () => {
    const { form, categories } = get();
    set({
      categories: [
        ...categories,
        {
          id: `cat-${Date.now()}`, // Generate unique ID using timestamp
          name: form.name,
          description: form.description,
          transactionCount: 0,
        },
      ],
      isAddModalOpen: false,
    });
  },

  editCategory: () => {
    const { categoryToEdit, form, categories } = get();
    if (!categoryToEdit) return;

    set({
      categories: categories.map((cat) =>
        cat.id === categoryToEdit.id
          ? { ...cat, name: form.name, description: form.description }
          : cat,
      ),
      isEditModalOpen: false,
      categoryToEdit: null,
    });
  },

  deleteCategory: () => {
    const { categoryToDelete, categories } = get();
    if (!categoryToDelete) return;

    // In a real app, this would make an API call to:
    // 1. Update transactions to use the new category if selected
    // 2. Delete the category
    console.log("Deleting category:", categoryToDelete);
    console.log("Replacement category:", get().selectedReplacementCategory);

    set({
      categories: categories.filter((cat) => cat.id !== categoryToDelete.id),
      isDeleteModalOpen: false,
      categoryToDelete: null,
      selectedReplacementCategory: "",
    });
  },
}));

export default useCategoriesStore;
