/**
 * @jest-environment node
 */

import {
  getCurrentUser,
  getCurrentUserWithAdmin,
  isCurrentUserGlobalAdmin,
  requireAuth,
  requireGlobalAdmin,
} from "../auth-helpers";
import { auth } from "../auth";
import { db } from "@/db/config";

// Mock the auth module
jest.mock("../auth", () => ({
  auth: {
    api: {
      getSession: jest.fn(),
    },
  },
}));

// Mock the database
jest.mock("@/db/config", () => ({
  db: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

// Mock headers
jest.mock("next/headers", () => ({
  headers: jest.fn(() => Promise.resolve({})),
}));

const mockAuth = auth as jest.Mocked<typeof auth>;
const mockDb = db as jest.Mocked<typeof db>;

describe("Auth Helpers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getCurrentUser", () => {
    it("returns user when session is valid", async () => {
      const mockUser = {
        id: "user-1",
        email: "test@example.com",
        name: "Test User",
      };
      mockAuth.api.getSession.mockResolvedValue({ user: mockUser });

      const result = await getCurrentUser();

      expect(result).toEqual(mockUser);
    });

    it("returns null when session is invalid", async () => {
      mockAuth.api.getSession.mockResolvedValue({ error: "Invalid session" });

      const result = await getCurrentUser();

      expect(result).toBeNull();
    });

    it("returns null when no user in session", async () => {
      mockAuth.api.getSession.mockResolvedValue({});

      const result = await getCurrentUser();

      expect(result).toBeNull();
    });

    it("returns null when auth throws error", async () => {
      mockAuth.api.getSession.mockRejectedValue(new Error("Auth error"));

      const result = await getCurrentUser();

      expect(result).toBeNull();
    });
  });

  describe("getCurrentUserWithAdmin", () => {
    it("returns user with admin status when session is valid", async () => {
      const mockSessionUser = {
        id: "user-1",
        email: "test@example.com",
        name: "Test User",
      };
      const mockDbUser = {
        id: "user-1",
        email: "test@example.com",
        name: "Test User",
        isGlobalAdmin: true,
      };

      mockAuth.api.getSession.mockResolvedValue({ user: mockSessionUser });
      mockDb.user.findUnique.mockResolvedValue(mockDbUser);

      const result = await getCurrentUserWithAdmin();

      expect(result).toEqual(mockDbUser);
    });

    it("returns null when no session user", async () => {
      mockAuth.api.getSession.mockResolvedValue({});

      const result = await getCurrentUserWithAdmin();

      expect(result).toBeNull();
    });

    it("returns null when database query fails", async () => {
      const mockSessionUser = {
        id: "user-1",
        email: "test@example.com",
        name: "Test User",
      };
      mockAuth.api.getSession.mockResolvedValue({ user: mockSessionUser });
      mockDb.user.findUnique.mockRejectedValue(new Error("DB error"));

      const result = await getCurrentUserWithAdmin();

      expect(result).toBeNull();
    });
  });

  describe("isCurrentUserGlobalAdmin", () => {
    it("returns true when user is global admin", async () => {
      const mockSessionUser = {
        id: "user-1",
        email: "test@example.com",
        name: "Test User",
      };
      const mockDbUser = {
        id: "user-1",
        isGlobalAdmin: true,
      };

      mockAuth.api.getSession.mockResolvedValue({ user: mockSessionUser });
      mockDb.user.findUnique.mockResolvedValue(mockDbUser);

      const result = await isCurrentUserGlobalAdmin();

      expect(result).toBe(true);
    });

    it("returns false when user is not global admin", async () => {
      const mockSessionUser = {
        id: "user-1",
        email: "test@example.com",
        name: "Test User",
      };
      const mockDbUser = {
        id: "user-1",
        isGlobalAdmin: false,
      };

      mockAuth.api.getSession.mockResolvedValue({ user: mockSessionUser });
      mockDb.user.findUnique.mockResolvedValue(mockDbUser);

      const result = await isCurrentUserGlobalAdmin();

      expect(result).toBe(false);
    });

    it("returns false when no user found", async () => {
      mockAuth.api.getSession.mockResolvedValue({});

      const result = await isCurrentUserGlobalAdmin();

      expect(result).toBe(false);
    });

    it("returns false when error occurs", async () => {
      mockAuth.api.getSession.mockRejectedValue(new Error("Auth error"));

      const result = await isCurrentUserGlobalAdmin();

      expect(result).toBe(false);
    });
  });

  describe("requireAuth", () => {
    it("returns user when authenticated", async () => {
      const mockUser = {
        id: "user-1",
        email: "test@example.com",
        name: "Test User",
      };
      mockAuth.api.getSession.mockResolvedValue({ user: mockUser });

      const result = await requireAuth();

      expect(result).toEqual(mockUser);
    });

    it("throws error when not authenticated", async () => {
      mockAuth.api.getSession.mockResolvedValue({});

      await expect(requireAuth()).rejects.toThrow("Authentication required");
    });
  });

  describe("requireGlobalAdmin", () => {
    it("returns user when user is global admin", async () => {
      const mockSessionUser = {
        id: "user-1",
        email: "test@example.com",
        name: "Test User",
      };
      const mockDbUser = {
        id: "user-1",
        email: "test@example.com",
        name: "Test User",
        isGlobalAdmin: true,
      };

      mockAuth.api.getSession.mockResolvedValue({ user: mockSessionUser });
      mockDb.user.findUnique.mockResolvedValue(mockDbUser);

      const result = await requireGlobalAdmin();

      expect(result).toEqual(mockDbUser);
    });

    it("throws error when not authenticated", async () => {
      mockAuth.api.getSession.mockResolvedValue({});

      await expect(requireGlobalAdmin()).rejects.toThrow(
        "Authentication required",
      );
    });

    it("throws error when not global admin", async () => {
      const mockSessionUser = {
        id: "user-1",
        email: "test@example.com",
        name: "Test User",
      };
      const mockDbUser = {
        id: "user-1",
        isGlobalAdmin: false,
      };

      mockAuth.api.getSession.mockResolvedValue({ user: mockSessionUser });
      mockDb.user.findUnique.mockResolvedValue(mockDbUser);

      await expect(requireGlobalAdmin()).rejects.toThrow(
        "Global admin access required",
      );
    });
  });
});
