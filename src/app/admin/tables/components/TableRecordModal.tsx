"use client";

import { useState, useTransition } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import Button from "@/components/Button";
import TextField from "@/components/Forms/TextField";
import TextArea from "@/components/Forms/TextArea";
import CustomSelect from "@/components/Forms/CustomSelect";
import NumberInput from "@/components/Forms/NumberInput";
import DecimalInput from "@/components/Forms/DecimalInput";
import DatePicker from "@/components/Forms/DatePicker";
import {
  createTableRecord,
  updateTableRecord,
  type TableName,
} from "@/app/actions/admin";
import { toast } from "react-hot-toast";

interface TableSchema {
  tableName: string;
  fields: Array<{
    name: string;
    type: string;
    required: boolean;
  }>;
  editableFields: string[];
  searchFields: string[];
}

interface Props {
  tableName: TableName;
  schema: TableSchema;
  record: Record<string, any> | null;
  mode: "view" | "edit" | "create";
  onClose: () => void;
}

// Define select options for various fields
const SELECT_OPTIONS: Record<string, string[]> = {
  status: [
    "new",
    "in_progress",
    "resolved",
    "closed",
    "pending",
    "completed",
    "failed",
    "active",
    "cancelled",
  ],
  role: ["owner", "admin", "member"],
  type: ["income", "expense", "depository", "credit", "loan", "investment"],
  category: ["Issue", "Feature Request", "Bug Report", "General"],
  frequency: ["weekly", "bi-weekly", "monthly"],
  messageType: ["user_reply", "support_response", "initial_contact"],
  direction: ["inbound", "outbound"],
  warningType: ["late_payment", "insufficient_funds", "system_alert"],
  deviceType: ["platform", "cross-platform", "security_key"],
};

/**
 * Modal component for viewing, creating, and editing table records
 */
export default function TableRecordModal({
  tableName,
  schema,
  record,
  mode,
  onClose,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    if (mode === "create") {
      // Initialize with empty values for create mode
      return schema.editableFields.reduce(
        (acc, field) => {
          acc[field] = "";
          return acc;
        },
        {} as Record<string, any>,
      );
    }

    // For view/edit mode, use existing record data
    return record || {};
  });

  const isViewMode = mode === "view";
  const isCreateMode = mode === "create";

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isViewMode) return;

    startTransition(async () => {
      try {
        let result;

        if (isCreateMode) {
          result = await createTableRecord(tableName, formData);
        } else {
          result = await updateTableRecord(tableName, record!.id, formData);
        }

        if (result.success) {
          toast.success(
            `Record ${isCreateMode ? "created" : "updated"} successfully`,
          );
          onClose();
        } else {
          toast.error(
            result.error ||
              `Failed to ${isCreateMode ? "create" : "update"} record`,
          );
        }
      } catch (error) {
        console.error(
          `Error ${isCreateMode ? "creating" : "updating"} record:`,
          error,
        );
        toast.error(`Failed to ${isCreateMode ? "create" : "update"} record`);
      }
    });
  };

  const renderField = (field: {
    name: string;
    type: string;
    required: boolean;
  }) => {
    const value = formData[field.name] ?? "";
    const isEditable =
      !isViewMode && schema.editableFields.includes(field.name);

    // For view mode or non-editable fields, show read-only display
    if (!isEditable) {
      let displayValue = value;

      if (value === null || value === undefined || value === "") {
        displayValue = <span className="text-gray-400 italic">null</span>;
      } else if (typeof value === "boolean") {
        displayValue = (
          <span
            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
              value ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}
          >
            {value ? "True" : "False"}
          </span>
        );
      } else if (value instanceof Date) {
        displayValue = value.toLocaleDateString();
      } else if (typeof value === "string" && value.length > 100) {
        displayValue = (
          <div className="max-h-32 overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm">{value}</pre>
          </div>
        );
      }

      return (
        <div key={field.name} className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            {field.name.replace(/([A-Z])/g, " $1").trim()}
          </label>
          <div className="text-sm text-gray-900 p-2 border border-gray-200 rounded-md bg-gray-50">
            {displayValue}
          </div>
        </div>
      );
    }

    // For editable fields, render appropriate input
    const commonProps = {
      label: field.name.replace(/([A-Z])/g, " $1").trim(),
      value: value,
      onChange: (newValue: any) => handleFieldChange(field.name, newValue),
      required: field.required,
      disabled: isPending,
    };

    switch (field.type) {
      case "boolean":
        return (
          <div key={field.name} className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              {commonProps.label}
            </label>
            <CustomSelect
              options={[
                { value: true, label: "True" },
                { value: false, label: "False" },
              ]}
              value={value}
              onChange={(newValue) => handleFieldChange(field.name, newValue)}
              disabled={isPending}
            />
          </div>
        );

      case "select":
        const options = SELECT_OPTIONS[field.name] || [];
        return (
          <div key={field.name} className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              {commonProps.label}
            </label>
            <CustomSelect
              options={options.map((opt) => ({ value: opt, label: opt }))}
              value={value}
              onChange={(newValue) => handleFieldChange(field.name, newValue)}
              disabled={isPending}
              placeholder={`Select ${commonProps.label.toLowerCase()}`}
            />
          </div>
        );

      case "number":
        return <NumberInput key={field.name} {...commonProps} />;

      case "decimal":
        return <DecimalInput key={field.name} {...commonProps} />;

      case "date":
        return (
          <DatePicker
            key={field.name}
            {...commonProps}
            value={value ? new Date(value) : null}
            onChange={(date) => handleFieldChange(field.name, date)}
          />
        );

      case "text":
        return <TextArea key={field.name} {...commonProps} rows={4} />;

      case "email":
        return <TextField key={field.name} {...commonProps} type="email" />;

      default:
        return <TextField key={field.name} {...commonProps} />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black bg-opacity-25"
          onClick={onClose}
        />

        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {mode === "create" && `Create ${tableName} Record`}
              {mode === "edit" && `Edit ${tableName} Record`}
              {mode === "view" && `View ${tableName} Record`}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-col max-h-[calc(90vh-120px)]"
          >
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Show all fields for view mode, only editable fields for create/edit */}
                {(isViewMode
                  ? Object.keys(record || {}).map((fieldName) => ({
                      name: fieldName,
                      type:
                        schema.fields.find((f) => f.name === fieldName)?.type ||
                        "string",
                      required: false,
                    }))
                  : schema.fields.filter((field) =>
                      schema.editableFields.includes(field.name),
                    )
                ).map((field) => renderField(field))}
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isPending}
              >
                {isViewMode ? "Close" : "Cancel"}
              </Button>

              {!isViewMode && (
                <Button
                  type="submit"
                  disabled={isPending}
                  className="min-w-[100px]"
                >
                  {isPending
                    ? "Saving..."
                    : isCreateMode
                      ? "Create"
                      : "Save Changes"}
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
