/**
 * Admin server actions for managing all database tables
 * Only accessible by global administrators
 */

"use server";

import { requireGlobalAdmin } from "@/lib/auth-helpers";
import { db } from "@/db/config";
import * as schema from "@/db/schema";
import { eq, desc, asc, count, sql } from "drizzle-orm";
import { z } from "zod";

// Define all table schemas with their editable fields
const TABLE_CONFIGS = {
  user: {
    table: schema.user,
    editableFields: [
      "name",
      "email",
      "phoneNumber",
      "isGlobalAdmin",
      "emailVerified",
    ],
    searchFields: ["name", "email"],
  },
  budgetAccounts: {
    table: schema.budgetAccounts,
    editableFields: ["name", "description", "accountNumber"],
    searchFields: ["name", "accountNumber"],
  },
  budgetAccountMembers: {
    table: schema.budgetAccountMembers,
    editableFields: ["role"],
    searchFields: ["role"],
  },
  budgetAccountInvitations: {
    table: schema.budgetAccountInvitations,
    editableFields: ["inviteeEmail", "role", "status"],
    searchFields: ["inviteeEmail", "role", "status"],
  },
  budgets: {
    table: schema.budgets,
    editableFields: ["name", "description", "year", "month", "totalBudget"],
    searchFields: ["name"],
  },
  categories: {
    table: schema.categories,
    editableFields: ["name", "description", "color", "icon"],
    searchFields: ["name"],
  },
  budgetCategories: {
    table: schema.budgetCategories,
    editableFields: ["amount"],
    searchFields: [],
  },
  transactions: {
    table: schema.transactions,
    editableFields: ["amount", "description", "type", "status", "merchantName"],
    searchFields: ["description", "merchantName", "type", "status"],
  },
  goals: {
    table: schema.goals,
    editableFields: [
      "name",
      "description",
      "targetAmount",
      "currentAmount",
      "status",
    ],
    searchFields: ["name", "status"],
  },
  plaidItems: {
    table: schema.plaidItems,
    editableFields: ["status"],
    searchFields: ["plaidInstitutionName", "status"],
  },
  plaidAccounts: {
    table: schema.plaidAccounts,
    editableFields: ["name", "type", "subtype"],
    searchFields: ["name", "type", "subtype"],
  },
  incomeSources: {
    table: schema.incomeSources,
    editableFields: ["name", "amount", "frequency", "isActive", "notes"],
    searchFields: ["name", "frequency"],
  },
  debts: {
    table: schema.debts,
    editableFields: ["name", "paymentAmount", "interestRate", "hasBalance"],
    searchFields: ["name"],
  },
  debtAllocations: {
    table: schema.debtAllocations,
    editableFields: ["paymentAmount", "isPaid", "note"],
    searchFields: ["note"],
  },
  monthlyDebtPlanning: {
    table: schema.monthlyDebtPlanning,
    editableFields: ["year", "month", "isActive"],
    searchFields: [],
  },
  supportRequests: {
    table: schema.supportRequests,
    editableFields: ["title", "description", "category", "status", "isPublic"],
    searchFields: ["title", "category", "status"],
  },
  supportComments: {
    table: schema.supportComments,
    editableFields: ["text"],
    searchFields: ["text"],
  },
  dismissedWarnings: {
    table: schema.dismissedWarnings,
    editableFields: ["warningType", "warningKey"],
    searchFields: ["warningType"],
  },
  contactSubmissions: {
    table: schema.contactSubmissions,
    editableFields: ["name", "email", "subject", "message", "status", "notes"],
    searchFields: ["name", "email", "subject", "status"],
  },
  emailConversations: {
    table: schema.emailConversations,
    editableFields: ["subject", "message", "messageType", "direction"],
    searchFields: ["subject", "messageType", "direction"],
  },
  session: {
    table: schema.session,
    editableFields: [],
    searchFields: ["ipAddress", "userAgent"],
  },
  account: {
    table: schema.account,
    editableFields: [],
    searchFields: ["providerId"],
  },
  verification: {
    table: schema.verification,
    editableFields: [],
    searchFields: ["identifier"],
  },
  passkey: {
    table: schema.passkey,
    editableFields: ["name", "deviceType"],
    searchFields: ["name", "deviceType"],
  },
};

export type TableName = keyof typeof TABLE_CONFIGS;

/**
 * Gets a list of all available tables for admin management
 */
export async function getAvailableTables() {
  await requireGlobalAdmin();

  return Object.keys(TABLE_CONFIGS).map((tableName) => ({
    name: tableName,
    displayName: tableName.replace(/([A-Z])/g, " $1").trim(),
    editableFields: TABLE_CONFIGS[tableName as TableName].editableFields,
    searchFields: TABLE_CONFIGS[tableName as TableName].searchFields,
  }));
}

/**
 * Gets table data with pagination and search
 */
export async function getTableData(
  tableName: TableName,
  page: number = 1,
  pageSize: number = 50,
  searchTerm?: string,
  sortField?: string,
  sortDirection: "asc" | "desc" = "desc",
) {
  await requireGlobalAdmin();

  const config = TABLE_CONFIGS[tableName];
  if (!config) {
    throw new Error(`Table ${tableName} not found`);
  }

  try {
    const offset = (page - 1) * pageSize;

    // Build base query
    let query = db.select().from(config.table);

    // Add search functionality if searchTerm is provided
    if (searchTerm && config.searchFields.length > 0) {
      const searchConditions = config.searchFields.map(
        (field) => sql`${config.table[field]} ILIKE ${`%${searchTerm}%`}`,
      );
      query = query.where(sql`${searchConditions.join(" OR ")}`);
    }

    // Add sorting
    if (sortField && config.table[sortField]) {
      const orderFn = sortDirection === "asc" ? asc : desc;
      query = query.orderBy(orderFn(config.table[sortField]));
    } else {
      // Default sort by createdAt if available, otherwise by id
      const defaultSortField = config.table.createdAt || config.table.id;
      query = query.orderBy(desc(defaultSortField));
    }

    // Add pagination
    query = query.limit(pageSize).offset(offset);

    // Execute query
    const data = await query;

    // Get total count for pagination
    const [countResult] = await db
      .select({ count: count() })
      .from(config.table);

    const totalItems = countResult.count;
    const totalPages = Math.ceil(totalItems / pageSize);

    return {
      success: true,
      data,
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  } catch (error) {
    console.error(`Error fetching data for table ${tableName}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Gets a single record from a table by ID
 */
export async function getTableRecord(tableName: TableName, id: string) {
  await requireGlobalAdmin();

  const config = TABLE_CONFIGS[tableName];
  if (!config) {
    throw new Error(`Table ${tableName} not found`);
  }

  try {
    const [record] = await db
      .select()
      .from(config.table)
      .where(eq(config.table.id, id));

    return {
      success: true,
      data: record || null,
    };
  } catch (error) {
    console.error(`Error fetching record from table ${tableName}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Updates a record in a table
 */
export async function updateTableRecord(
  tableName: TableName,
  id: string,
  data: Record<string, any>,
) {
  await requireGlobalAdmin();

  const config = TABLE_CONFIGS[tableName];
  if (!config) {
    throw new Error(`Table ${tableName} not found`);
  }

  try {
    // Filter data to only include editable fields
    const filteredData = Object.keys(data)
      .filter((key) => config.editableFields.includes(key))
      .reduce(
        (obj, key) => {
          obj[key] = data[key];
          return obj;
        },
        {} as Record<string, any>,
      );

    // Add updatedAt timestamp if the field exists
    if (config.table.updatedAt) {
      filteredData.updatedAt = new Date();
    }

    const [updatedRecord] = await db
      .update(config.table)
      .set(filteredData)
      .where(eq(config.table.id, id))
      .returning();

    if (!updatedRecord) {
      throw new Error("Record not found");
    }

    return {
      success: true,
      data: updatedRecord,
    };
  } catch (error) {
    console.error(`Error updating record in table ${tableName}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Deletes a record from a table
 */
export async function deleteTableRecord(tableName: TableName, id: string) {
  await requireGlobalAdmin();

  const config = TABLE_CONFIGS[tableName];
  if (!config) {
    throw new Error(`Table ${tableName} not found`);
  }

  try {
    const [deletedRecord] = await db
      .delete(config.table)
      .where(eq(config.table.id, id))
      .returning();

    if (!deletedRecord) {
      throw new Error("Record not found");
    }

    return {
      success: true,
      data: deletedRecord,
    };
  } catch (error) {
    console.error(`Error deleting record from table ${tableName}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Creates a new record in a table
 */
export async function createTableRecord(
  tableName: TableName,
  data: Record<string, any>,
) {
  await requireGlobalAdmin();

  const config = TABLE_CONFIGS[tableName];
  if (!config) {
    throw new Error(`Table ${tableName} not found`);
  }

  try {
    // Filter data to only include editable fields
    const filteredData = Object.keys(data)
      .filter((key) => config.editableFields.includes(key))
      .reduce(
        (obj, key) => {
          obj[key] = data[key];
          return obj;
        },
        {} as Record<string, any>,
      );

    // Add timestamps if the fields exist
    if (config.table.createdAt) {
      filteredData.createdAt = new Date();
    }
    if (config.table.updatedAt) {
      filteredData.updatedAt = new Date();
    }

    const [newRecord] = await db
      .insert(config.table)
      .values(filteredData)
      .returning();

    return {
      success: true,
      data: newRecord,
    };
  } catch (error) {
    console.error(`Error creating record in table ${tableName}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Gets table schema information for dynamic form generation
 */
export async function getTableSchema(tableName: TableName) {
  await requireGlobalAdmin();

  const config = TABLE_CONFIGS[tableName];
  if (!config) {
    throw new Error(`Table ${tableName} not found`);
  }

  // This is a simplified schema - in a real implementation you might want to
  // extract this from the Drizzle schema or database introspection
  const fieldTypes: Record<string, string> = {
    // Common string fields
    name: "string",
    email: "email",
    description: "text",
    subject: "string",
    message: "text",
    text: "text",
    notes: "text",
    note: "text",
    title: "string",

    // Number fields
    amount: "number",
    paymentAmount: "number",
    targetAmount: "number",
    currentAmount: "number",
    totalBudget: "number",
    interestRate: "number",
    year: "number",
    month: "number",
    upvotes: "number",
    downvotes: "number",

    // Boolean fields
    isGlobalAdmin: "boolean",
    emailVerified: "boolean",
    isActive: "boolean",
    isPaid: "boolean",
    isPublic: "boolean",
    hasBalance: "boolean",

    // Select fields
    status: "select",
    role: "select",
    type: "select",
    category: "select",
    frequency: "select",
    messageType: "select",
    direction: "select",
    warningType: "select",
    deviceType: "select",

    // Date fields
    dueDate: "date",
    startDate: "date",
    endDate: "date",
    targetDate: "date",
    paymentDate: "date",
  };

  const fields = config.editableFields.map((fieldName) => ({
    name: fieldName,
    type: fieldTypes[fieldName] || "string",
    required: false, // You could enhance this with actual schema information
  }));

  return {
    success: true,
    data: {
      tableName,
      fields,
      editableFields: config.editableFields,
      searchFields: config.searchFields,
    },
  };
}
