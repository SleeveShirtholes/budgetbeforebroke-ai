import {
  getPublicSupportRequests,
  getMySupportRequests,
  createSupportRequest,
  upvoteSupportRequest,
  downvoteSupportRequest,
  updateSupportRequestStatus,
  getAllSupportRequestsForAdmin,
  canEditSupportRequest,
  updateSupportRequest,
} from "../supportRequests";
import { db } from "@/db/config";
import { getCurrentUserWithAdmin } from "@/lib/auth-helpers";

// Mock the database with both Prisma-style and Drizzle-style methods
jest.mock("@/db/config", () => ({
  db: {
    supportRequest: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    user: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    // Add Drizzle-style methods that the test is trying to use
    select: jest.fn(),
    from: jest.fn(),
    where: jest.fn(),
    orderBy: jest.fn(),
    limit: jest.fn(),
    insert: jest.fn(),
    values: jest.fn(),
    update: jest.fn(),
    set: jest.fn(),
  },
}));

// Mock auth helpers
jest.mock("@/lib/auth-helpers", () => ({
  getCurrentUserWithAdmin: jest.fn(),
}));

const mockDb = db as jest.Mocked<typeof db>;

// Helper function to create a mock update that returns the set values
// const createMockUpdate = () => {
//   const mockWhere = jest.fn().mockResolvedValue(undefined);
//   const mockSet = jest.fn().mockReturnValue({
//     where: mockWhere,
//   });

//   // Store the values passed to set() so we can access them in tests
//   mockSet.mockImplementation((values) => {
//     mockSet.lastCallValues = values;
//     return mockSet;
//   });

//   const mockUpdate = {
//     set: mockSet,
//   };
//   mockDb.update.mockReturnValue(mockUpdate as unknown as ReturnType<typeof mockDb.update>);
//   return mockUpdate;
// };

describe("SupportRequests Actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup select mock chain
    const mockSelect = {
      from: jest.fn().mockReturnValue({
        leftJoin: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            orderBy: jest.fn().mockResolvedValue([]),
          }),
        }),
      }),
    };
    mockDb.select.mockReturnValue(
      mockSelect as unknown as ReturnType<typeof mockDb.select>,
    );

    // Setup insert mock chain
    const mockInsert = {
      values: jest.fn().mockResolvedValue(undefined),
    };
    mockDb.insert.mockReturnValue(
      mockInsert as unknown as ReturnType<typeof mockDb.insert>,
    );

    // Setup default update mock chain (can be overridden by specific tests)
    const mockUpdate = {
      set: jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue(undefined),
      }),
    };
    mockDb.update.mockReturnValue(
      mockUpdate as unknown as ReturnType<typeof mockDb.update>,
    );
  });

  describe("getPublicSupportRequests", () => {
    it("should fetch public support requests", async () => {
      const mockRequests = [
        {
          id: "req-1",
          title: "Test Request",
          description: "Test Description",
          category: "Issue",
          status: "Open",
          isPublic: true,
          userId: "user-1",
          upvotes: 0,
          downvotes: 0,
          lastUpdated: new Date(),
          createdAt: new Date(),
          user: { name: "Test User" }, // Include user relationship
        },
      ];

      // Mock the Prisma method that the function actually uses
      mockDb.supportRequest.findMany.mockResolvedValue(mockRequests);

      const result = await getPublicSupportRequests();
      expect(result).toEqual([
        {
          id: "req-1",
          title: "Test Request",
          description: "Test Description",
          category: "Issue",
          status: "Open",
          isPublic: true,
          userId: "user-1",
          upvotes: 0,
          downvotes: 0,
          lastUpdated: expect.any(Date),
          createdAt: expect.any(Date),
          user: "Test User", // Processed by the function
        },
      ]);
    });

    it("should filter by status when provided", async () => {
      const mockRequests = [
        {
          id: "req-1",
          title: "Test Request",
          description: "Test Description",
          category: "Issue",
          status: "Closed",
          isPublic: true,
          userId: "user-1",
          upvotes: 0,
          downvotes: 0,
          lastUpdated: new Date(),
          createdAt: new Date(),
          user: { name: "Test User" }, // Include user relationship
        },
      ];

      // Mock the Prisma method that the function actually uses
      mockDb.supportRequest.findMany.mockResolvedValue(mockRequests);

      const result = await getPublicSupportRequests("Closed");
      expect(result).toEqual([
        {
          id: "req-1",
          title: "Test Request",
          description: "Test Description",
          category: "Issue",
          status: "Closed",
          isPublic: true,
          userId: "user-1",
          upvotes: 0,
          downvotes: 0,
          lastUpdated: expect.any(Date),
          createdAt: expect.any(Date),
          user: "Test User", // Processed by the function
        },
      ]);
    });
  });

  describe("getMySupportRequests", () => {
    it("should fetch user's support requests", async () => {
      const mockRequests = [
        {
          id: "req-1",
          title: "My Request",
          description: "My Description",
          category: "Feature Request",
          status: "Open",
          isPublic: false,
          userId: "user-1",
          upvotes: 0,
          downvotes: 0,
          lastUpdated: new Date(),
          createdAt: new Date(),
          user: { name: "My User" }, // Include user relationship
        },
      ];

      // Mock the Prisma method that the function actually uses
      mockDb.supportRequest.findMany.mockResolvedValue(mockRequests);

      const result = await getMySupportRequests("user-1");
      expect(result).toEqual([
        {
          id: "req-1",
          title: "My Request",
          description: "My Description",
          category: "Feature Request",
          status: "Open",
          isPublic: false,
          userId: "user-1",
          upvotes: 0,
          downvotes: 0,
          lastUpdated: expect.any(Date),
          createdAt: expect.any(Date),
          user: "My User", // Processed by the function
        },
      ]);
    });

    it("should return empty array for invalid userId", async () => {
      const result = await getMySupportRequests("");
      expect(result).toEqual([]);
    });

    it("should filter by status when provided", async () => {
      const mockRequests = [
        {
          id: "req-1",
          title: "My Request",
          description: "My Description",
          category: "Feature Request",
          status: "Closed",
          isPublic: false,
          userId: "user-1",
          upvotes: 0,
          downvotes: 0,
          lastUpdated: new Date(),
          createdAt: new Date(),
          user: { name: "My User" }, // Include user relationship
        },
      ];

      // Mock the Prisma method that the function actually uses
      mockDb.supportRequest.findMany.mockResolvedValue(mockRequests);

      const result = await getMySupportRequests("user-1", "Closed");
      expect(result).toEqual([
        {
          id: "req-1",
          title: "My Request",
          description: "My Description",
          category: "Feature Request",
          status: "Closed",
          isPublic: false,
          userId: "user-1",
          upvotes: 0,
          downvotes: 0,
          lastUpdated: expect.any(Date),
          createdAt: expect.any(Date),
          user: "My User", // Processed by the function
        },
      ]);
    });
  });

  describe("getAllSupportRequestsForAdmin", () => {
    it("should fetch all support requests for admin", async () => {
      (getCurrentUserWithAdmin as jest.Mock).mockResolvedValue({
        id: "admin-1",
        isGlobalAdmin: true,
      });

      const mockRequests = [
        {
          id: "req-1",
          title: "Admin Request",
          description: "Admin Description",
          category: "General Question",
          status: "Open",
          isPublic: true,
          userId: "user-1",
          upvotes: 0,
          downvotes: 0,
          lastUpdated: new Date(),
          createdAt: new Date(),
          user: "Admin User",
        },
      ];

      // Mock the Prisma method that the function actually uses
      mockDb.supportRequest.findMany.mockResolvedValue(
        mockRequests.map((req) => ({
          ...req,
          user: { name: req.user }, // Convert user string back to object
        })),
      );

      const result = await getAllSupportRequestsForAdmin();
      expect(result).toEqual(mockRequests);
    });

    it("should throw error for non-admin users", async () => {
      (getCurrentUserWithAdmin as jest.Mock).mockResolvedValue({
        id: "user-1",
        isGlobalAdmin: false,
      });

      await expect(getAllSupportRequestsForAdmin()).rejects.toThrow(
        "Global admin access required",
      );
    });
  });

  describe("canEditSupportRequest", () => {
    it("should return true for global admin", async () => {
      (getCurrentUserWithAdmin as jest.Mock).mockResolvedValue({
        id: "admin-1",
        isGlobalAdmin: true,
      });

      const result = await canEditSupportRequest("req-1");
      expect(result).toBe(true);
    });

    it("should return true for request creator", async () => {
      (getCurrentUserWithAdmin as jest.Mock).mockResolvedValue({
        id: "user-1",
        isGlobalAdmin: false,
      });

      // Mock the Prisma method that the function actually uses
      mockDb.supportRequest.findFirst.mockResolvedValue({ userId: "user-1" });

      const result = await canEditSupportRequest("req-1");
      expect(result).toBe(true);
    });

    it("should return false for non-creator non-admin", async () => {
      (getCurrentUserWithAdmin as jest.Mock).mockResolvedValue({
        id: "user-2",
        isGlobalAdmin: false,
      });

      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([{ userId: "user-1" }]),
        }),
      } as unknown as ReturnType<typeof mockDb.select>);

      const result = await canEditSupportRequest("req-1");
      expect(result).toBe(false);
    });

    it("should return false for unauthenticated user", async () => {
      (getCurrentUserWithAdmin as jest.Mock).mockResolvedValue(null);

      const result = await canEditSupportRequest("req-1");
      expect(result).toBe(false);
    });
  });

  describe("createSupportRequest", () => {
    it("should create a new support request", async () => {
      const requestData = {
        title: "New Request",
        description: "New Description",
        category: "Issue",
        isPublic: true,
        userId: "user-1",
      };

      // Mock the Prisma method that the function actually uses
      mockDb.supportRequest.create.mockResolvedValue({
        id: "new-request-id",
        ...requestData,
        status: "Open",
      });

      const result = await createSupportRequest(requestData);

      expect(result).toEqual({
        id: "new-request-id",
        ...requestData,
        status: "Open",
      });
      expect(mockDb.supportRequest.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: "New Request",
          description: "New Description",
          category: "Issue",
          isPublic: true,
          userId: "user-1",
          status: "Open",
        }),
      });
    });

    it("should throw error for missing userId", async () => {
      const requestData = {
        title: "New Request",
        description: "New Description",
        category: "Issue",
        isPublic: true,
        userId: "",
      };

      await expect(createSupportRequest(requestData)).rejects.toThrow(
        "Authentication required to create support request",
      );
    });
  });

  describe("upvoteSupportRequest", () => {
    it("should increment upvotes", async () => {
      // Mock the Prisma method that the function actually uses
      mockDb.supportRequest.update.mockResolvedValue({
        id: "req-1",
        upvotes: 1,
      });

      await upvoteSupportRequest("req-1");

      expect(mockDb.supportRequest.update).toHaveBeenCalledWith({
        where: { id: "req-1" },
        data: { upvotes: { increment: 1 } },
      });
    });
  });

  describe("downvoteSupportRequest", () => {
    it("should increment downvotes", async () => {
      // Mock the Prisma method that the function actually uses
      mockDb.supportRequest.update.mockResolvedValue({
        id: "req-1",
        downvotes: 1,
      });

      await downvoteSupportRequest("req-1");

      expect(mockDb.supportRequest.update).toHaveBeenCalledWith({
        where: { id: "req-1" },
        data: { downvotes: { increment: 1 } },
      });
    });
  });

  describe("updateSupportRequestStatus", () => {
    it("should update status for authorized user", async () => {
      (getCurrentUserWithAdmin as jest.Mock).mockResolvedValue({
        id: "admin-1",
        isGlobalAdmin: true,
      });

      // Mock the Prisma method that the function actually uses
      mockDb.supportRequest.update.mockResolvedValue({
        id: "req-1",
        status: "Closed",
      });

      await updateSupportRequestStatus("req-1", "Closed");

      expect(mockDb.supportRequest.update).toHaveBeenCalledWith({
        where: { id: "req-1" },
        data: {
          status: "Closed",
          lastUpdated: expect.any(Date),
        },
      });
    });

    it("should throw error for unauthorized user", async () => {
      (getCurrentUserWithAdmin as jest.Mock).mockResolvedValue({
        id: "user-2",
        isGlobalAdmin: false,
      });

      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([{ userId: "user-1" }]),
        }),
      } as unknown as ReturnType<typeof mockDb.select>);

      await expect(
        updateSupportRequestStatus("req-1", "Closed"),
      ).rejects.toThrow("You don't have permission to edit this request");
    });
  });

  describe("updateSupportRequest", () => {
    it("should update request for authorized user", async () => {
      (getCurrentUserWithAdmin as jest.Mock).mockResolvedValue({
        id: "admin-1",
        isGlobalAdmin: true,
      });

      const updates = {
        title: "Updated Title",
        description: "Updated Description",
      };

      // Mock the Prisma method that the function actually uses
      mockDb.supportRequest.update.mockResolvedValue({
        id: "req-1",
        ...updates,
      });

      await updateSupportRequest("req-1", updates);

      expect(mockDb.supportRequest.update).toHaveBeenCalledWith({
        where: { id: "req-1" },
        data: {
          title: "Updated Title",
          description: "Updated Description",
          lastUpdated: expect.any(Date),
        },
      });
    });

    it("should throw error for unauthorized user", async () => {
      (getCurrentUserWithAdmin as jest.Mock).mockResolvedValue({
        id: "user-2",
        isGlobalAdmin: false,
      });

      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([{ userId: "user-1" }]),
        }),
      } as unknown as ReturnType<typeof mockDb.select>);

      await expect(
        updateSupportRequest("req-1", { title: "New Title" }),
      ).rejects.toThrow("You don't have permission to edit this request");
    });
  });
});
