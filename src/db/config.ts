import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";

// Global variable to store the Prisma client instance
const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

// Helper function to create the Prisma client with Accelerate
const createPrismaClient = () => new PrismaClient().$extends(withAccelerate());

// Create a singleton instance of PrismaClient with Accelerate
export const db = globalForPrisma.prisma ?? createPrismaClient();

// In development, store the client on the global object to prevent multiple instances
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
