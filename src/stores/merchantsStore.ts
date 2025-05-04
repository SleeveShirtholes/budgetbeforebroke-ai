import { create } from "zustand";

export interface Merchant extends Record<string, unknown> {
  id: string;
  name: string;
  description?: string;
  transactionCount: number;
}

interface MerchantForm {
  name: string;
  description?: string;
}

interface MerchantsStore {
  merchants: Merchant[];
  isAddModalOpen: boolean;
  isEditModalOpen: boolean;
  isDeleteModalOpen: boolean;
  merchantToEdit: Merchant | null;
  merchantToDelete: Merchant | null;
  form: MerchantForm;
  openAddModal: () => void;
  closeAddModal: () => void;
  openEditModal: (merchant: Merchant) => void;
  closeEditModal: () => void;
  openDeleteModal: (merchant: Merchant) => void;
  closeDeleteModal: () => void;
  setForm: (
    value: MerchantForm | ((prev: MerchantForm) => MerchantForm),
  ) => void;
  addMerchant: () => void;
  editMerchant: () => void;
  deleteMerchant: () => void;
}

const useMerchantsStore = create<MerchantsStore>((set) => ({
  merchants: [],
  isAddModalOpen: false,
  isEditModalOpen: false,
  isDeleteModalOpen: false,
  merchantToEdit: null,
  merchantToDelete: null,
  form: {
    name: "",
    description: "",
  },
  openAddModal: () =>
    set({ isAddModalOpen: true, form: { name: "", description: "" } }),
  closeAddModal: () => set({ isAddModalOpen: false }),
  openEditModal: (merchant) =>
    set({
      isEditModalOpen: true,
      merchantToEdit: merchant,
      form: {
        name: merchant.name,
        description: merchant.description || "",
      },
    }),
  closeEditModal: () => set({ isEditModalOpen: false, merchantToEdit: null }),
  openDeleteModal: (merchant) =>
    set({ isDeleteModalOpen: true, merchantToDelete: merchant }),
  closeDeleteModal: () =>
    set({ isDeleteModalOpen: false, merchantToDelete: null }),
  setForm: (value) =>
    set((state) => ({
      form: typeof value === "function" ? value(state.form) : value,
    })),
  addMerchant: () =>
    set((state) => {
      const newMerchant: Merchant = {
        id: Math.random().toString(36).substr(2, 9),
        name: state.form.name,
        description: state.form.description,
        transactionCount: 0,
      };
      return {
        merchants: [...state.merchants, newMerchant],
        isAddModalOpen: false,
        form: { name: "", description: "" },
      };
    }),
  editMerchant: () =>
    set((state) => {
      if (!state.merchantToEdit) return state;
      return {
        merchants: state.merchants.map((merchant) =>
          merchant.id === state.merchantToEdit?.id
            ? {
                ...merchant,
                name: state.form.name,
                description: state.form.description,
              }
            : merchant,
        ),
        isEditModalOpen: false,
        merchantToEdit: null,
        form: { name: "", description: "" },
      };
    }),
  deleteMerchant: () =>
    set((state) => {
      if (!state.merchantToDelete) return state;
      return {
        merchants: state.merchants.filter(
          (merchant) => merchant.id !== state.merchantToDelete?.id,
        ),
        isDeleteModalOpen: false,
        merchantToDelete: null,
      };
    }),
}));

export default useMerchantsStore;
