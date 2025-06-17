"use client";

import { PlusIcon } from "@heroicons/react/24/outline";
import { format } from "date-fns";
import { useState } from "react";
import { useForm } from "react-hook-form";
import useSWR, { mutate } from "swr";
import { z } from "zod";

import {
  createIncomeSource,
  deleteIncomeSource,
  getIncomeSources,
  updateIncomeSource,
  type IncomeSource,
} from "@/app/actions/income";
import Button from "@/components/Button";
import Card from "@/components/Card";
import CustomDatePicker from "@/components/Forms/CustomDatePicker";
import CustomSelect from "@/components/Forms/CustomSelect";
import NumberInput from "@/components/Forms/NumberInput";
import TextArea from "@/components/Forms/TextArea";
import TextField from "@/components/Forms/TextField";
import Modal from "@/components/Modal/Modal";
import Spinner from "@/components/Spinner";
import { useToast } from "@/components/Toast";

const incomeSourceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  amount: z.string().refine((val) => {
    const amount = parseFloat(val);
    return !isNaN(amount) && amount > 0;
  }, "Amount must be a positive number"),
  frequency: z.enum(["weekly", "bi-weekly", "monthly"]),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  notes: z.string().optional(),
});

type IncomeSourceForm = z.infer<typeof incomeSourceSchema>;

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
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<IncomeSourceForm>({
    defaultValues: {
      name: "",
      amount: "",
      frequency: "monthly",
      startDate: format(new Date(), "yyyy-MM-dd"),
    },
  });

  const onSubmit = async (data: IncomeSourceForm) => {
    try {
      // Validate with zod
      const result = incomeSourceSchema.safeParse(data);
      if (!result.success) {
        // Handle validation errors
        const fieldErrors = result.error.flatten().fieldErrors;
        Object.entries(fieldErrors).forEach(([field, errors]) => {
          if (errors[0]) {
            setValue(
              field as keyof IncomeSourceForm,
              data[field as keyof IncomeSourceForm],
              {
                shouldValidate: true,
                shouldDirty: true,
              },
            );
          }
        });
        return;
      }

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

  const handleDelete = async (id: string) => {
    try {
      await deleteIncomeSource(id);
      showToast("Income source deleted successfully", { type: "success" });
      mutate("income-sources");
    } catch (error) {
      console.error("Error deleting income source:", error);
      showToast("Failed to delete income source", { type: "error" });
    } finally {
      setIsDeletingSource(null);
    }
  };

  const handleEdit = (source: IncomeSource) => {
    setIsEditingSource(source.id);
    setValue("name", source.name);
    setValue("amount", source.amount.toString());
    setValue("frequency", source.frequency);
    setValue("startDate", format(source.startDate, "yyyy-MM-dd"));
    if (source.endDate) {
      setValue("endDate", format(source.endDate, "yyyy-MM-dd"));
    }
    if (source.notes) {
      setValue("notes", source.notes);
    }
    setIsAddingSource(true);
  };

  const handleCloseModal = () => {
    setIsAddingSource(false);
    setIsEditingSource(null);
    reset();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

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

      <Card>
        <div className="divide-y divide-gray-200">
          {incomeSources?.map((source) => (
            <div
              key={source.id}
              className="py-4 flex items-center justify-between"
            >
              <div>
                <h3 className="text-lg font-medium text-secondary-900">
                  {source.name}
                </h3>
                <p className="text-sm text-secondary-500">
                  {source.frequency.charAt(0).toUpperCase() +
                    source.frequency.slice(1)}{" "}
                  income of ${source.amount}
                </p>
                {source.notes && (
                  <p className="text-sm text-secondary-500 mt-1">
                    {source.notes}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleEdit(source)}
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setIsDeletingSource(source.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
          {incomeSources?.length === 0 && (
            <div className="py-8 text-center text-secondary-500">
              No income sources added yet. Click the button above to add one.
            </div>
          )}
        </div>
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isAddingSource}
        onClose={handleCloseModal}
        title={isEditingSource ? "Edit Income Source" : "Add Income Source"}
        maxWidth="md"
        footerButtons={
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCloseModal}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              form="income-source-form"
              isLoading={isSubmitting}
            >
              {isEditingSource ? "Save Changes" : "Add Income Source"}
            </Button>
          </div>
        }
      >
        <form
          id="income-source-form"
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <TextField
            label="Name"
            id="name"
            {...register("name")}
            error={errors.name?.message}
            required
          />

          <NumberInput
            label="Amount"
            value={watch("amount")}
            onChange={(value) => setValue("amount", value)}
            error={errors.amount?.message}
            required
            leftIcon={<span className="text-gray-500">$</span>}
          />

          <CustomSelect
            label="Frequency"
            value={watch("frequency")}
            onChange={(value) =>
              setValue("frequency", value as "weekly" | "bi-weekly" | "monthly")
            }
            options={[
              { value: "weekly", label: "Weekly" },
              { value: "bi-weekly", label: "Bi-weekly" },
              { value: "monthly", label: "Monthly" },
            ]}
            error={errors.frequency?.message}
          />

          <CustomDatePicker
            label="Start Date"
            value={watch("startDate")}
            onChange={(date) => setValue("startDate", date)}
            error={errors.startDate?.message}
            required
          />

          <CustomDatePicker
            label="End Date (Optional)"
            value={watch("endDate")}
            onChange={(date) => setValue("endDate", date)}
            error={errors.endDate?.message}
          />

          <TextArea
            label="Notes (Optional)"
            id="notes"
            {...register("notes")}
            rows={3}
          />
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!isDeletingSource}
        onClose={() => setIsDeletingSource(null)}
        title="Delete Income Source"
        maxWidth="sm"
        footerButtons={
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsDeletingSource(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={() => isDeletingSource && handleDelete(isDeletingSource)}
            >
              Delete
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p>Are you sure you want to delete this income source?</p>
        </div>
      </Modal>
    </div>
  );
}
