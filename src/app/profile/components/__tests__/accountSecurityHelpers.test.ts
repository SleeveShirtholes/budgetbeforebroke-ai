import { Passkey } from "@/lib/auth-types";
import { authClient } from "@/lib/auth-client";
import { handleDeletePasskeyFn } from "../accountSecurityHelpers";

// Mock the authClient
jest.mock("@/lib/auth-client", () => ({
  authClient: {
    passkey: {
      deletePasskey: jest.fn(),
    },
  },
}));

describe("accountSecurityHelpers", () => {
  const mockPasskey: Passkey = {
    id: "test-id",
    name: "Test Passkey",
    deviceType: "iPhone",
    createdAt: new Date("2024-03-20"),
  };

  const mockShowToast = jest.fn();
  const mockMutatePasskeys = jest.fn();
  const mockSetIsDeletePasskeyModalOpen = jest.fn();
  const mockSetPasskeyToDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("handleDeletePasskeyFn", () => {
    it("successfully deletes a passkey", async () => {
      (authClient.passkey.deletePasskey as jest.Mock).mockResolvedValueOnce({});

      await handleDeletePasskeyFn(
        mockPasskey,
        mockShowToast,
        mockMutatePasskeys,
        mockSetIsDeletePasskeyModalOpen,
        mockSetPasskeyToDelete,
        authClient,
      );

      expect(authClient.passkey.deletePasskey).toHaveBeenCalledWith({
        id: mockPasskey.id,
      });
      expect(mockShowToast).toHaveBeenCalledWith(
        "Passkey deleted successfully",
        { type: "success" },
      );
      expect(mockMutatePasskeys).toHaveBeenCalled();
      expect(mockSetIsDeletePasskeyModalOpen).toHaveBeenCalledWith(false);
      expect(mockSetPasskeyToDelete).toHaveBeenCalledWith(null);
    });

    it("handles error when deleting passkey", async () => {
      const error = new Error("Failed to delete passkey");
      (authClient.passkey.deletePasskey as jest.Mock).mockRejectedValueOnce(
        error,
      );

      await handleDeletePasskeyFn(
        mockPasskey,
        mockShowToast,
        mockMutatePasskeys,
        mockSetIsDeletePasskeyModalOpen,
        mockSetPasskeyToDelete,
        authClient,
      );

      expect(authClient.passkey.deletePasskey).toHaveBeenCalledWith({
        id: mockPasskey.id,
      });
      expect(mockShowToast).toHaveBeenCalledWith("Failed to delete passkey", {
        type: "error",
      });
      expect(mockMutatePasskeys).not.toHaveBeenCalled();
      expect(mockSetIsDeletePasskeyModalOpen).not.toHaveBeenCalled();
      expect(mockSetPasskeyToDelete).not.toHaveBeenCalled();
    });

    it("handles null passkey", async () => {
      await handleDeletePasskeyFn(
        null,
        mockShowToast,
        mockMutatePasskeys,
        mockSetIsDeletePasskeyModalOpen,
        mockSetPasskeyToDelete,
        authClient,
      );

      expect(authClient.passkey.deletePasskey).not.toHaveBeenCalled();
      expect(mockShowToast).toHaveBeenCalledWith("No passkey selected", {
        type: "error",
      });
      expect(mockMutatePasskeys).not.toHaveBeenCalled();
      expect(mockSetIsDeletePasskeyModalOpen).not.toHaveBeenCalled();
      expect(mockSetPasskeyToDelete).not.toHaveBeenCalled();
    });
  });
});
