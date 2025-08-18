import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import TableRecordModal from "../TableRecordModal";
import type { TableSchema } from "@/types/admin";

// Mock the admin actions
jest.mock("@/app/actions/admin", () => ({
  createTableRecord: jest.fn().mockResolvedValue({ success: true, data: {} }),
  updateTableRecord: jest.fn().mockResolvedValue({ success: true, data: {} }),
}));

// Mock the toast
jest.mock("react-hot-toast", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockSchema: TableSchema = {
  tableName: "budgetAccounts",
  fields: [
    {
      name: "name",
      type: "string",
      required: true,
      defaultValue: "",
    },
    {
      name: "description",
      type: "text",
      required: false,
      defaultValue: "",
    },
    {
      name: "accountNumber",
      type: "string",
      required: true,
      defaultValue: "",
    },
  ],
  editableFields: ["name", "description", "accountNumber"],
  searchFields: ["name", "accountNumber"],
};

describe("TableRecordModal", () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    mode: "edit" as const,
    tableName: "budgetAccounts" as const,
    schema: mockSchema,
    record: null,
    onSave: jest.fn(),
  };

  describe("Object handling in edit mode", () => {
    it("should handle primitive values correctly", () => {
      const record = {
        id: "123",
        name: "Test Account",
        description: "Test Description",
        accountNumber: "ACC-123",
      };

      render(
        <TableRecordModal {...defaultProps} record={record} mode="edit" />,
      );

      expect(screen.getByDisplayValue("Test Account")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Test Description")).toBeInTheDocument();
      expect(screen.getByDisplayValue("ACC-123")).toBeInTheDocument();
    });

    it("should extract name property from objects", () => {
      const record = {
        id: "123",
        name: { name: "Test Account", id: "name-obj" },
        description: "Test Description",
        accountNumber: "ACC-123",
      };

      render(
        <TableRecordModal {...defaultProps} record={record} mode="edit" />,
      );

      expect(screen.getByDisplayValue("Test Account")).toBeInTheDocument();
    });

    it("should extract title property from objects", () => {
      const record = {
        id: "123",
        name: { title: "Test Account Title", id: "title-obj" },
        description: "Test Description",
        accountNumber: "ACC-123",
      };

      render(
        <TableRecordModal {...defaultProps} record={record} mode="edit" />,
      );

      expect(
        screen.getByDisplayValue("Test Account Title"),
      ).toBeInTheDocument();
    });

    it("should extract value property from objects", () => {
      const record = {
        id: "123",
        name: { value: "Test Account Value", id: "value-obj" },
        description: "Test Description",
        accountNumber: "ACC-123",
      };

      render(
        <TableRecordModal {...defaultProps} record={record} mode="edit" />,
      );

      expect(
        screen.getByDisplayValue("Test Account Value"),
      ).toBeInTheDocument();
    });

    it("should handle primitive values wrapped in single-property objects", () => {
      const record = {
        id: "123",
        name: { value: "Wrapped Value" },
        description: "Test Description",
        accountNumber: "ACC-123",
      };

      render(
        <TableRecordModal {...defaultProps} record={record} mode="edit" />,
      );

      expect(screen.getByDisplayValue("Wrapped Value")).toBeInTheDocument();
    });

    it("should handle arrays by joining with commas", () => {
      const record = {
        id: "123",
        name: [{ name: "Item 1" }, { name: "Item 2" }, "String Item"],
        description: "Test Description",
        accountNumber: "ACC-123",
      };

      render(
        <TableRecordModal {...defaultProps} record={record} mode="edit" />,
      );

      expect(
        screen.getByDisplayValue("Item 1, Item 2, String Item"),
      ).toBeInTheDocument();
    });

    it("should handle [object Object] string values", () => {
      const record = {
        id: "123",
        name: "[object Object]",
        description: "Test Description",
        accountNumber: "ACC-123",
      };

      render(
        <TableRecordModal {...defaultProps} record={record} mode="edit" />,
      );

      // Should show empty string for [object Object]
      const nameInput = screen.getByRole("textbox", { name: /name/i });
      expect(nameInput).toHaveValue("");
    });

    it("should extract string properties from complex objects", () => {
      const record = {
        id: "123",
        name: {
          complex: "data",
          nested: { level: "deep" },
          metadata: "important info",
        },
        description: "Test Description",
        accountNumber: "ACC-123",
      };

      render(
        <TableRecordModal {...defaultProps} record={record} mode="edit" />,
      );

      // Should show extracted string properties - the component extracts primitive values
      expect(
        screen.getByDisplayValue("data, important info"),
      ).toBeInTheDocument();
    });

    it("should handle empty objects gracefully", () => {
      const record = {
        id: "123",
        name: {},
        description: "Test Description",
        accountNumber: "ACC-123",
      };

      render(
        <TableRecordModal {...defaultProps} record={record} mode="edit" />,
      );

      const nameInput = screen.getByRole("textbox", { name: /name/i });
      expect(nameInput).toHaveValue("Object with keys: ");
    });
  });

  describe("Form submission", () => {
    it("should call onSave when form is submitted in edit mode", async () => {
      const record = {
        id: "123",
        name: "Test Account",
        description: "Test Description",
        accountNumber: "ACC-123",
      };

      const onSave = jest.fn();

      render(
        <TableRecordModal
          {...defaultProps}
          record={record}
          mode="edit"
          onSave={onSave}
        />,
      );

      const saveButton = screen.getByText("Save Changes");
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(onSave).toHaveBeenCalled();
      });
    });
  });
});
