"use client";

import { PlusIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import useSWR, { mutate } from "swr";

import {
  createIncomeSource,
  deleteIncomeSource,
  getIncomeSources,
  updateIncomeSource,
  type IncomeSource,
} from "@/app/actions/income";
import Button from "@/components/Button";
import Spinner from "@/components/Spinner";
import { useToast } from "@/components/Toast";
import { DeleteIncomeSourceModal } from "./components/DeleteIncomeSourceModal";
import {
  IncomeSourceForm,
  type IncomeSourceFormData,
} from "./components/IncomeSourceForm";
import { IncomeSourceList } from "./components/IncomeSourceList";

export default function IncomePage() {
  const { data: incomeSources, isLoading } = useSWR<IncomeSource[]>(
    "income-sources",
    async () => {
      const sources = await getIncomeSources();
      return sources.map((source) => ({
        ...source,
        endDate: source.endDate || undefined,
        notes: source.notes || undefined,
      }));
    },
    {
      revalidateOnFocus: false,
    },
  );
  const [isAddingSource, setIsAddingSource] = useState(false);
  const [isEditingSource, setIsEditingSource] = useState<string | null>(null);
  const [isDeletingSource, setIsDeletingSource] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (data: IncomeSourceFormData) => {
    try {
      setIsSubmitting(true);
      if (isEditingSource) {
        await updateIncomeSource(isEditingSource, {
          name: data.name,
          amount: Number(data.amount),
          frequency: data.frequency,
          startDate: new Date(data.startDate),
          endDate: data.endDate ? new Date(data.endDate) : undefined,
          notes: data.notes,
        });
        showToast("Income source updated successfully", { type: "success" });
      } else {
        await createIncomeSource(
          data.name,
          Number(data.amount),
          data.frequency,
          new Date(data.startDate),
          data.endDate ? new Date(data.endDate) : undefined,
          data.notes,
        );
        showToast("Income source added successfully", { type: "success" });
      }

      mutate("income-sources");
      handleCloseModal();
    } catch (error) {
      console.error("Error saving income source:", error);
      showToast("Failed to save income source", { type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!isDeletingSource) return;

    try {
      setIsDeleting(true);
      await deleteIncomeSource(isDeletingSource);
      showToast("Income source deleted successfully", { type: "success" });
      mutate("income-sources");
    } catch (error) {
      console.error("Error deleting income source:", error);
      showToast("Failed to delete income source", { type: "error" });
    } finally {
      setIsDeleting(false);
      setIsDeletingSource(null);
    }
  };

  const handleEdit = (source: IncomeSource) => {
    setIsEditingSource(source.id);
    setIsAddingSource(true);
  };

  const handleCloseModal = () => {
    setIsAddingSource(false);
    setIsEditingSource(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  const editingSource = isEditingSource
    ? incomeSources?.find((source) => source.id === isEditingSource)
    : undefined;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-secondary-900">
          Income Sources
        </h1>
        <Button
          variant="primary"
          size="md"
          onClick={() => setIsAddingSource(true)}
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Add Income Source
        </Button>
      </div>

      <IncomeSourceList
        incomeSources={incomeSources || []}
        onEdit={handleEdit}
        onDelete={setIsDeletingSource}
        onAdd={() => setIsAddingSource(true)}
      />

      <IncomeSourceForm
        isOpen={isAddingSource}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        editingSource={editingSource}
      />

      <DeleteIncomeSourceModal
        isOpen={!!isDeletingSource}
        onClose={() => setIsDeletingSource(null)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
