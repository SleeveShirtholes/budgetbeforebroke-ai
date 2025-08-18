"use client";

import { useState, useTransition } from "react";
import { toast } from "react-hot-toast";
import { XMarkIcon } from "@heroicons/react/24/outline";
import Button from "@/components/Button";
import TextField from "@/components/Forms/TextField";
import TextArea from "@/components/Forms/TextArea";
import NumberInput from "@/components/Forms/NumberInput";
import DecimalInput from "@/components/Forms/DecimalInput";
import CustomSelect from "@/components/Forms/CustomSelect";
import CustomDatePicker from "@/components/Forms/CustomDatePicker";
// import type { TableSchema } from "@/lib/types";
import {
  createTableRecord,
  updateTableRecord,
  type TableName,
} from "@/app/actions/admin";
import type { TableSchema } from "@/types/admin";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  mode: "view" | "edit" | "create";
  tableName: TableName;
  schema: TableSchema;
  record: Record<string, unknown> | null;
  onSave: () => void;
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
 * Utility function to convert complex objects to meaningful string representations
 */
function objectToString(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string") return item;
        if (typeof item === "object" && item !== null) {
          if ("name" in item && typeof item.name === "string") return item.name;
          if ("title" in item && typeof item.title === "string")
            return item.title;
          if ("id" in item && typeof item.id === "string") return item.id;
        }
        return String(item);
      })
      .join(", ");
  }

  if (typeof value === "object" && value !== null) {
    // Check if the object has a property with the same name as the field
    if ("value" in value && typeof value.value === "string") {
      return value.value;
    }
    if ("name" in value && typeof value.name === "string") {
      return value.name;
    }
    if ("title" in value && typeof value.title === "string") {
      return value.title;
    }
    if ("text" in value && typeof value.text === "string") {
      return value.text;
    }
    if ("label" in value && typeof value.label === "string") {
      return value.label;
    }
    if ("id" in value && typeof value.id === "string") {
      return value.id;
    }

    // Try to find any string property
    const stringProps = Object.entries(value)
      .filter(([, val]) => typeof val === "string" && val.length > 0)
      .map(([, val]) => `${val}`)
      .join(", ");

    if (stringProps) {
      return stringProps;
    }

    // Try to find any primitive property that might be useful
    const primitiveProps = Object.entries(value)
      .filter(
        ([, val]) =>
          typeof val === "string" ||
          typeof val === "number" ||
          typeof val === "boolean",
      )
      .map(([key, val]) => `${key}: ${val}`)
      .join(", ");

    if (primitiveProps) {
      return primitiveProps;
    }

    // Check if it's an empty object
    if (Object.keys(value).length === 0) {
      return "Object with keys: ";
    }

    // Last resort: try JSON.stringify but limit length
    try {
      const jsonStr = JSON.stringify(value);
      return jsonStr.length > 100 ? jsonStr.substring(0, 100) + "..." : jsonStr;
    } catch {
      const keys = Object.keys(value);
      return keys.length > 0
        ? `Object with keys: ${keys.join(", ")}`
        : "[Empty Object]";
    }
  }

  return String(value);
}

/**
 * Modal component for viewing, creating, and editing table records
 */
export default function TableRecordModal({
  tableName,
  schema,
  record,
  mode,
  onClose,
  onSave,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState<Record<string, unknown>>(() => {
    if (mode === "create" || !record) {
      // Initialize with empty values for create mode
      return schema.fields.reduce(
        (acc, field) => {
          acc[field.name] = field.defaultValue || "";
          return acc;
        },
        {} as Record<string, unknown>,
      );
    }

    // For edit mode, process the record data to handle complex types
    const processedData: Record<string, unknown> = {};

    for (const field of schema.fields) {
      const rawValue = record[field.name];

      if (rawValue === null || rawValue === undefined) {
        processedData[field.name] = "";
      } else if (field.type === "date" && rawValue instanceof Date) {
        processedData[field.name] = rawValue;
      } else if (field.type === "boolean") {
        processedData[field.name] = Boolean(rawValue);
      } else if (field.type === "number" || field.type === "decimal") {
        processedData[field.name] = Number(rawValue) || 0;
      } else if (
        typeof rawValue === "string" &&
        rawValue === "[object Object]"
      ) {
        // Handle the case where the value is literally the string "[object Object]"
        processedData[field.name] = "";
      } else if (typeof rawValue === "object" && rawValue !== null) {
        processedData[field.name] = objectToString(rawValue);
      } else {
        processedData[field.name] = rawValue;
      }
    }

    return processedData;
  });

  const isViewMode = mode === "view";
  const isCreateMode = mode === "create";

  const handleFieldChange = (fieldName: string, value: unknown) => {
    // Get the original field type to handle conversions properly
    const field = schema.fields.find((f) => f.name === fieldName);

    let processedValue = value;

    // Handle type-specific conversions
    if (field) {
      switch (field.type) {
        case "boolean":
          processedValue = value === "true" || value === true;
          break;
        case "number":
        case "decimal":
          processedValue =
            typeof value === "string"
              ? parseFloat(value) || 0
              : Number(value) || 0;
          break;
        case "date":
          processedValue = value ? new Date(value as string) : null;
          break;
        case "string":
        case "text":
        case "email":
        case "select":
          // For string fields, ensure we always have a string value
          processedValue =
            value === null || value === undefined ? "" : String(value);
          break;
        default:
          processedValue = value;
      }
    }

    setFormData((prev) => ({
      ...prev,
      [fieldName]: processedValue,
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
          const recordId = record?.id;
          if (typeof recordId !== "string") {
            toast.error("Invalid record ID");
            return;
          }
          result = await updateTableRecord(tableName, recordId, formData);
        }

        if (result.success) {
          toast.success(
            `Record ${isCreateMode ? "created" : "updated"} successfully`,
          );
          onSave(); // Call onSave callback as expected by tests
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
      let displayValue: React.ReactNode;

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
      } else {
        // Convert any other value to string
        displayValue = String(value);
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
      id: field.name,
      label: field.name.replace(/([A-Z])/g, " $1").trim(),
      value: String(value || ""),
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
                { value: "true", label: "True" },
                { value: "false", label: "False" },
              ]}
              value={String(value)}
              onChange={(newValue) =>
                handleFieldChange(field.name, newValue === "true")
              }
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
              value={String(value)}
              onChange={(newValue) => handleFieldChange(field.name, newValue)}
              disabled={isPending}
              placeholder={`Select ${commonProps.label.toLowerCase()}`}
            />
          </div>
        );

      case "number":
        return (
          <NumberInput
            key={field.name}
            {...commonProps}
            onChange={(value) => handleFieldChange(field.name, value)}
          />
        );

      case "decimal":
        return (
          <DecimalInput
            key={field.name}
            {...commonProps}
            onChange={(value) => handleFieldChange(field.name, value)}
          />
        );

      case "date":
        return (
          <CustomDatePicker
            key={field.name}
            {...commonProps}
            value={value ? String(value) : undefined}
            onChange={(date) => handleFieldChange(field.name, date)}
          />
        );

      case "text":
        return (
          <TextArea
            key={field.name}
            {...commonProps}
            rows={4}
            onChange={(event) =>
              handleFieldChange(field.name, event.target.value)
            }
          />
        );

      case "email":
        return (
          <TextField
            key={field.name}
            {...commonProps}
            type="email"
            onChange={(event) =>
              handleFieldChange(field.name, event.target.value)
            }
          />
        );

      default:
        return (
          <TextField
            key={field.name}
            {...commonProps}
            onChange={(event) =>
              handleFieldChange(field.name, event.target.value)
            }
          />
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 transition-opacity"
          style={{ backgroundColor: "rgba(17, 24, 39, 0.5)" }}
          onClick={onClose}
        />

        {/* Modal Content */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden z-10 transform transition-all">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {mode === "create" && `Create ${tableName} Record`}
              {mode === "edit" && `Edit ${tableName} Record`}
              {mode === "view" && `View ${tableName} Record`}
            </h2>
            <button
              onClick={onClose}
              disabled={isPending}
              className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title={isPending ? "Please wait..." : "Close"}
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
                className="min-w-[100px]"
              >
                {isViewMode ? "Close" : "Cancel"}
              </Button>

              {!isViewMode && (
                <Button
                  type="submit"
                  disabled={isPending}
                  className="min-w-[100px] flex items-center justify-center gap-2"
                >
                  {isPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {isCreateMode ? "Creating..." : "Saving..."}
                    </>
                  ) : (
                    <>{isCreateMode ? "Create" : "Save Changes"}</>
                  )}
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
