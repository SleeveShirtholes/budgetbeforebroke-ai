import * as schema from "./schema";

import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

// Get the database URL from environment variables
const sql = neon(process.env.DATABASE_URL!);

// Create the database instance with schema
export const db = drizzle(sql, { schema });
