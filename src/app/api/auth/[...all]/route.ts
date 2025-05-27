import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

// Add debug logging for errors
export const { GET, POST } = toNextJsHandler(async (req, ...args) => {
    try {
        // Call the original handler
        return await auth.handler(req, ...args);
    } catch (error) {
        // Log the error for debugging
        console.error("[Better Auth] Internal Server Error:", error);
        throw error;
    }
});
