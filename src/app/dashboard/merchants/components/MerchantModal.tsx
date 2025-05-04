import Button from "@/components/Button";
import TextField from "@/components/Forms/TextField";
import Modal from "@/components/Modal";
import React from "react";

interface MerchantForm {
  name: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

interface MerchantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  form: MerchantForm;
  setForm: (
    value: MerchantForm | ((prev: MerchantForm) => MerchantForm),
  ) => void;
  mode: "add" | "edit";
}

/**
 * MerchantModal Component
 *
 * Modal dialog for adding or editing merchants. Handles form state and validation.
 * Used in both add and edit modes with appropriate title and button text.
 */
const MerchantModal: React.FC<MerchantModalProps> = ({
  isOpen,
  onClose,
  onSave,
  form,
  setForm,
  mode,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "add" ? "Add New Merchant" : "Edit Merchant"}
      maxWidth="md"
      footerButtons={
        <>
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" form="merchant-form">
            {mode === "add" ? "Add Merchant" : "Save Changes"}
          </Button>
        </>
      }
    >
      <form id="merchant-form" onSubmit={handleSubmit} className="space-y-4">
        <TextField
          label="Merchant Name"
          value={form.name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setForm({ ...form, name: e.target.value })
          }
          required
          placeholder="Enter merchant name"
        />
        <TextField
          label="Street Address"
          value={form.streetAddress || ""}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setForm({ ...form, streetAddress: e.target.value })
          }
          placeholder="Enter street address"
        />
        <div className="grid grid-cols-2 gap-4">
          <TextField
            label="City"
            value={form.city || ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setForm({ ...form, city: e.target.value })
            }
            placeholder="Enter city"
          />
          <TextField
            label="State"
            value={form.state || ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setForm({ ...form, state: e.target.value })
            }
            placeholder="Enter state"
          />
        </div>
        <TextField
          label="ZIP Code"
          value={form.zipCode || ""}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setForm({ ...form, zipCode: e.target.value })
          }
          placeholder="Enter ZIP code"
        />
      </form>
    </Modal>
  );
};

export default MerchantModal;
