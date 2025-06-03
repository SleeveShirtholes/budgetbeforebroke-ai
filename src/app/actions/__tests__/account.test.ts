import {
  createAccount,
  deleteInvitation,
  getAccount,
  getAccounts,
  getDefaultAccount,
  inviteUser,
  removeUser,
  resendInvite,
  updateAccountName,
  updateDefaultAccount,
  updateUserRole,
} from "../account";

import { db } from "@/db/config";
import { auth } from "@/lib/auth";
import { sendAccountInvite } from "@/lib/email";

// Mock dependencies
jest.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: jest.fn(),
    },
  },
}));

jest.mock("@/db/config", () => ({
  db: {
    query: {
      budgetAccounts: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
      },
      budgetAccountMembers: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
      },
      budgetAccountInvitations: {
        findFirst: jest.fn(),
      },
      user: {
        findFirst: jest.fn(),
      },
    },
    insert: jest.fn().mockReturnValue({
      values: jest.fn().mockResolvedValue(undefined),
    }),
    update: jest.fn().mockReturnValue({
      set: jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue(undefined),
      }),
    }),
    delete: jest.fn().mockReturnValue({
      where: jest.fn().mockResolvedValue(undefined),
    }),
  },
}));

jest.mock("@/lib/email", () => ({
  sendAccountInvite: jest.fn(),
}));

jest.mock("next/headers", () => ({
  headers: () => new Headers(),
}));

describe("Account Actions", () => {
  const mockUser = {
    id: "user-1",
    name: "Test User",
    email: "test@example.com",
  };

  const mockAccount = {
    id: "account-1",
    name: "Test Account",
    description: "Test Description",
    accountNumber: "TEST-1234",
    members: [
      {
        id: "member-1",
        userId: "user-1",
        role: "owner",
        user: {
          name: "Test User",
          email: "test@example.com",
          image: null,
        },
      },
    ],
    invitations: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (auth.api.getSession as jest.Mock).mockResolvedValue({ user: mockUser });
  });

  describe("getAccounts", () => {
    it("should return accounts for authenticated user", async () => {
      (db.query.budgetAccountMembers.findMany as jest.Mock).mockResolvedValue([
        {
          budgetAccount: mockAccount,
        },
      ]);

      const accounts = await getAccounts();
      expect(accounts).toHaveLength(1);
      expect(accounts[0]).toEqual(mockAccount);
    });

    it("should throw error if not authenticated", async () => {
      (auth.api.getSession as jest.Mock).mockResolvedValue(null);
      await expect(getAccounts()).rejects.toThrow("Not authenticated");
    });
  });

  describe("getAccount", () => {
    it("should return account by id", async () => {
      (db.query.budgetAccounts.findFirst as jest.Mock).mockResolvedValue(
        mockAccount,
      );

      const account = await getAccount("account-1");
      expect(account).toEqual(mockAccount);
    });

    it("should return null if account not found", async () => {
      (db.query.budgetAccounts.findFirst as jest.Mock).mockResolvedValue(null);

      const account = await getAccount("non-existent");
      expect(account).toBeNull();
    });

    it("should throw error if not authenticated", async () => {
      (auth.api.getSession as jest.Mock).mockResolvedValue(null);
      await expect(getAccount("account-1")).rejects.toThrow(
        "Not authenticated",
      );
    });
  });

  describe("updateAccountName", () => {
    it("should update account name for owner", async () => {
      (db.query.budgetAccountMembers.findFirst as jest.Mock).mockResolvedValue({
        role: "owner",
      });

      await updateAccountName("account-1", "New Name");
      expect(db.update).toHaveBeenCalled();
    });

    it("should throw error if not owner", async () => {
      (db.query.budgetAccountMembers.findFirst as jest.Mock).mockResolvedValue(
        null,
      );

      await expect(updateAccountName("account-1", "New Name")).rejects.toThrow(
        "Not authorized",
      );
    });
  });

  describe("inviteUser", () => {
    it("should create invitation for new user", async () => {
      (db.query.budgetAccountMembers.findFirst as jest.Mock).mockResolvedValue({
        role: "owner",
      });
      (db.query.budgetAccounts.findFirst as jest.Mock).mockResolvedValue(
        mockAccount,
      );
      (db.query.user.findFirst as jest.Mock)
        .mockResolvedValueOnce(null) // invitee lookup
        .mockResolvedValueOnce(mockUser); // inviter lookup
      (
        db.query.budgetAccountInvitations.findFirst as jest.Mock
      ).mockResolvedValue(null);

      await inviteUser("account-1", "new@example.com");
      expect(db.insert).toHaveBeenCalled();
      expect(sendAccountInvite).toHaveBeenCalled();
    });

    it("should throw error if invitation already exists", async () => {
      (db.query.budgetAccountMembers.findFirst as jest.Mock).mockResolvedValue({
        role: "owner",
      });
      (db.query.budgetAccounts.findFirst as jest.Mock).mockResolvedValue(
        mockAccount,
      );
      (db.query.user.findFirst as jest.Mock).mockResolvedValue(null);
      (
        db.query.budgetAccountInvitations.findFirst as jest.Mock
      ).mockResolvedValue({
        status: "pending",
      });

      await expect(
        inviteUser("account-1", "existing@example.com"),
      ).rejects.toThrow("An invitation is already pending for this email");
    });

    it("should throw error if user is already a member", async () => {
      (db.query.budgetAccountMembers.findFirst as jest.Mock).mockResolvedValue({
        role: "owner",
      });
      (db.query.budgetAccounts.findFirst as jest.Mock).mockResolvedValue(
        mockAccount,
      );
      (db.query.user.findFirst as jest.Mock).mockResolvedValue({
        id: "existing-user",
      });
      (db.query.budgetAccountMembers.findFirst as jest.Mock)
        .mockResolvedValueOnce({ role: "owner" }) // owner check
        .mockResolvedValueOnce({ id: "existing-member" }); // existing member check

      await expect(
        inviteUser("account-1", "existing@example.com"),
      ).rejects.toThrow("This user is already a member of this account");
    });

    it("should throw error if account not found", async () => {
      (db.query.budgetAccountMembers.findFirst as jest.Mock).mockResolvedValue({
        role: "owner",
      });
      (db.query.budgetAccounts.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(
        inviteUser("non-existent", "new@example.com"),
      ).rejects.toThrow("Account not found");
    });

    it("should throw error if inviter not found", async () => {
      (db.query.budgetAccountMembers.findFirst as jest.Mock).mockResolvedValue({
        role: "owner",
      });
      (db.query.budgetAccounts.findFirst as jest.Mock).mockResolvedValue(
        mockAccount,
      );
      (db.query.user.findFirst as jest.Mock)
        .mockResolvedValueOnce(null) // invitee lookup
        .mockResolvedValueOnce(null); // inviter lookup
      (
        db.query.budgetAccountInvitations.findFirst as jest.Mock
      ).mockResolvedValue(null);

      await expect(inviteUser("account-1", "new@example.com")).rejects.toThrow(
        "Inviter not found",
      );
    });
  });

  describe("removeUser", () => {
    it("should remove user if caller is owner", async () => {
      (db.query.budgetAccountMembers.findFirst as jest.Mock).mockResolvedValue({
        role: "owner",
      });

      await removeUser("account-1", "user-2");
      expect(db.delete).toHaveBeenCalled();
    });

    it("should throw error if not owner", async () => {
      (db.query.budgetAccountMembers.findFirst as jest.Mock).mockResolvedValue(
        null,
      );

      await expect(removeUser("account-1", "user-2")).rejects.toThrow(
        "Not authorized",
      );
    });
  });

  describe("updateUserRole", () => {
    it("should update user role if caller is owner", async () => {
      (db.query.budgetAccountMembers.findFirst as jest.Mock).mockResolvedValue({
        role: "owner",
      });

      await updateUserRole("account-1", "user-2", "member");
      expect(db.update).toHaveBeenCalled();
    });

    it("should throw error if not owner", async () => {
      (db.query.budgetAccountMembers.findFirst as jest.Mock).mockResolvedValue(
        null,
      );

      await expect(
        updateUserRole("account-1", "user-2", "member"),
      ).rejects.toThrow("Not authorized");
    });
  });

  describe("resendInvite", () => {
    const mockInvitation = {
      id: "invite-1",
      inviteeEmail: "new@example.com",
      budgetAccount: {
        id: "account-1",
        name: "Test Account",
        members: [{ userId: "user-1", role: "owner" }],
      },
    };

    it("should resend invitation if caller is owner", async () => {
      (
        db.query.budgetAccountInvitations.findFirst as jest.Mock
      ).mockResolvedValue(mockInvitation);

      await resendInvite("invite-1");
      expect(db.update).toHaveBeenCalled();
      expect(sendAccountInvite).toHaveBeenCalled();
    });

    it("should throw error if invitation not found", async () => {
      (
        db.query.budgetAccountInvitations.findFirst as jest.Mock
      ).mockResolvedValue(null);

      await expect(resendInvite("non-existent")).rejects.toThrow(
        "Invitation not found",
      );
    });

    it("should throw error if not owner", async () => {
      (
        db.query.budgetAccountInvitations.findFirst as jest.Mock
      ).mockResolvedValue({
        ...mockInvitation,
        budgetAccount: {
          ...mockInvitation.budgetAccount,
          members: [{ userId: "user-1", role: "member" }],
        },
      });

      await expect(resendInvite("invite-1")).rejects.toThrow("Not authorized");
    });
  });

  describe("createAccount", () => {
    it("should create new account and add user as owner", async () => {
      const accountId = await createAccount("New Account", "Description");
      expect(accountId).toBeDefined();
      expect(db.insert).toHaveBeenCalledTimes(2); // Once for account, once for member
    });

    it("should throw error if not authenticated", async () => {
      (auth.api.getSession as jest.Mock).mockResolvedValue(null);
      await expect(createAccount("New Account")).rejects.toThrow(
        "Not authenticated",
      );
    });
  });

  describe("deleteInvitation", () => {
    const mockInvitation = {
      id: "invite-1",
      budgetAccount: {
        id: "account-1",
        members: [{ userId: "user-1", role: "owner" }],
      },
    };

    it("should delete invitation if caller is owner", async () => {
      (
        db.query.budgetAccountInvitations.findFirst as jest.Mock
      ).mockResolvedValue(mockInvitation);

      await deleteInvitation("invite-1");
      expect(db.delete).toHaveBeenCalled();
    });

    it("should throw error if invitation not found", async () => {
      (
        db.query.budgetAccountInvitations.findFirst as jest.Mock
      ).mockResolvedValue(null);

      await expect(deleteInvitation("non-existent")).rejects.toThrow(
        "Invitation not found",
      );
    });

    it("should throw error if not owner", async () => {
      (
        db.query.budgetAccountInvitations.findFirst as jest.Mock
      ).mockResolvedValue({
        ...mockInvitation,
        budgetAccount: {
          ...mockInvitation.budgetAccount,
          members: [{ userId: "user-1", role: "member" }],
        },
      });

      await expect(deleteInvitation("invite-1")).rejects.toThrow(
        "Not authorized",
      );
    });
  });

  describe("getDefaultAccount", () => {
    it("should return default account ID if set", async () => {
      (db.query.user.findFirst as jest.Mock).mockResolvedValue({
        defaultBudgetAccountId: "account-1",
      });

      const defaultAccountId = await getDefaultAccount();
      expect(defaultAccountId).toBe("account-1");
    });

    it("should return null if no default account set", async () => {
      (db.query.user.findFirst as jest.Mock).mockResolvedValue({
        defaultBudgetAccountId: null,
      });

      const defaultAccountId = await getDefaultAccount();
      expect(defaultAccountId).toBeNull();
    });

    it("should throw error if not authenticated", async () => {
      (auth.api.getSession as jest.Mock).mockResolvedValue(null);
      await expect(getDefaultAccount()).rejects.toThrow("Not authenticated");
    });
  });

  describe("updateDefaultAccount", () => {
    it("should update default account ID", async () => {
      await updateDefaultAccount("account-1");
      expect(db.update).toHaveBeenCalled();
    });

    it("should throw error if not authenticated", async () => {
      (auth.api.getSession as jest.Mock).mockResolvedValue(null);
      await expect(updateDefaultAccount("account-1")).rejects.toThrow(
        "Not authenticated",
      );
    });
  });
});
