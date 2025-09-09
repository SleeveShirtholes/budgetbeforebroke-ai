/**
 * Admin server actions for managing all database tables
 * Only accessible by global administrators
 */

"use server";

import { requireGlobalAdmin } from "@/lib/auth-helpers";
import { db } from "@/db/config";

// Define all table schemas with their editable fields
const TABLE_CONFIGS = {
  user: {
    model: db.user,
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
    model: db.budgetAccount,
    editableFields: ["name", "description", "accountNumber"],
    searchFields: ["name", "accountNumber"],
  },
  budgetAccountMembers: {
    model: db.budgetAccountMember,
    editableFields: ["role"],
    searchFields: ["role"],
  },
  budgetAccountInvitations: {
    model: db.budgetAccountInvitation,
    editableFields: ["inviteeEmail", "role", "status"],
    searchFields: ["inviteeEmail", "role", "status"],
  },
  budgets: {
    model: db.budget,
    editableFields: ["name", "description", "year", "month", "totalBudget"],
    searchFields: ["name"],
  },
  categories: {
    model: db.category,
    editableFields: ["name", "description", "color", "icon"],
    searchFields: ["name"],
  },
  budgetCategories: {
    model: db.budgetCategory,
    editableFields: ["amount"],
    searchFields: [],
  },
  transactions: {
    model: db.transaction,
    editableFields: ["amount", "description", "type", "status", "merchantName"],
    searchFields: ["description", "merchantName", "type", "status"],
  },
  goals: {
    model: db.goal,
    editableFields: [
      "name",
      "description",
      "targetAmount",
      "currentAmount",
      "targetDate",
      "status",
    ],
    searchFields: ["name"],
  },
  plaidItems: {
    model: db.plaidItem,
    editableFields: ["plaidInstitutionName", "status", "lastSyncAt"],
    searchFields: ["plaidInstitutionName"],
  },
  plaidAccounts: {
    model: db.plaidAccount,
    editableFields: ["name", "type", "subtype", "mask"],
    searchFields: ["name"],
  },
  incomeSources: {
    model: db.incomeSource,
    editableFields: [
      "name",
      "amount",
      "frequency",
      "startDate",
      "endDate",
      "isActive",
      "notes",
    ],
    searchFields: ["name"],
  },
  debts: {
    model: db.debt,
    editableFields: [
      "name",
      "paymentAmount",
      "interestRate",
      "dueDate",
      "hasBalance",
    ],
    searchFields: ["name"],
  },
  debtAllocations: {
    model: db.debtAllocation,
    editableFields: [
      "paymentAmount",
      "paymentDate",
      "isPaid",
      "paidAt",
      "note",
    ],
    searchFields: ["note"],
  },
  monthlyDebtPlanning: {
    model: db.monthlyDebtPlanning,
    editableFields: ["year", "month", "dueDate", "isActive"],
    searchFields: [],
  },
  supportRequests: {
    model: db.supportRequest,
    editableFields: [
      "title",
      "description",
      "category",
      "status",
      "isPublic",
      "upvotes",
      "downvotes",
    ],
    searchFields: ["title", "description", "category"],
  },
  supportComments: {
    model: db.supportComment,
    editableFields: ["text"],
    searchFields: ["text"],
  },
  dismissedWarnings: {
    model: db.dismissedWarning,
    editableFields: ["warningType", "warningKey"],
    searchFields: ["warningType", "warningKey"],
  },
  contactSubmissions: {
    model: db.contactSubmission,
    editableFields: [
      "name",
      "email",
      "subject",
      "message",
      "status",
      "assignedTo",
      "notes",
    ],
    searchFields: ["name", "email", "subject"],
  },
  emailConversations: {
    model: db.emailConversation,
    editableFields: [
      "fromEmail",
      "fromName",
      "toEmail",
      "subject",
      "message",
      "messageType",
      "direction",
    ],
    searchFields: ["fromEmail", "fromName", "subject"],
  },
};

export type TableName = keyof typeof TABLE_CONFIGS;

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
    throw new Error(`Unknown table: ${tableName}`);
  }

  try {
    const offset = (page - 1) * pageSize;

    // Build where clause for search
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let whereClause: any = {};
    if (searchTerm && config.searchFields.length > 0) {
      const searchConditions = config.searchFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive" as const,
        },
      }));

      if (searchConditions.length === 1) {
        whereClause = searchConditions[0];
      } else {
        whereClause = {
          OR: searchConditions,
        };
      }
    }

    // Build orderBy clause
    let orderBy: Record<string, string> = {};
    if (sortField && config.editableFields.includes(sortField)) {
      orderBy[sortField] = sortDirection;
    } else {
      // Default sort by createdAt if available, otherwise by id
      orderBy = { createdAt: "desc" };
    }

    // Execute query
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await (config.model as any).findMany({
      where: whereClause,
      orderBy,
      skip: offset,
      take: pageSize,
    });

    // Get total count for pagination
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const totalItems = await (config.model as any).count({
      where: whereClause,
    });

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
    console.error(`Error fetching ${tableName} data:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      data: [],
      pagination: {
        page: 1,
        pageSize: 50,
        totalItems: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      },
    };
  }
}

/**
 * Updates a record in the specified table
 */
export async function updateTableRecord(
  tableName: TableName,
  id: string,
  data: Record<string, unknown>,
) {
  await requireGlobalAdmin();

  const config = TABLE_CONFIGS[tableName];
  if (!config) {
    throw new Error(`Unknown table: ${tableName}`);
  }

  try {
    // Filter data to only include editable fields
    const editableData: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      if (config.editableFields.includes(key)) {
        editableData[key] = value;
      }
    }

    // Add updatedAt timestamp
    editableData.updatedAt = new Date();

    // Update the record
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (config.model as any).update({
      where: { id },
      data: editableData,
    });

    return { success: true };
  } catch (error) {
    console.error(`Error updating ${tableName} record:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Deletes a record from the specified table
 */
export async function deleteTableRecord(tableName: TableName, id: string) {
  await requireGlobalAdmin();

  const config = TABLE_CONFIGS[tableName];
  if (!config) {
    throw new Error(`Unknown table: ${tableName}`);
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (config.model as any).delete({
      where: { id },
    });

    return { success: true };
  } catch (error) {
    console.error(`Error deleting ${tableName} record:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Creates a new record in the specified table
 */
export async function createTableRecord(
  tableName: TableName,
  data: Record<string, unknown>,
) {
  await requireGlobalAdmin();

  const config = TABLE_CONFIGS[tableName];
  if (!config) {
    throw new Error(`Unknown table: ${tableName}`);
  }

  try {
    // Filter data to only include editable fields
    const editableData: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      if (config.editableFields.includes(key)) {
        editableData[key] = value;
      }
    }

    // Add timestamps
    editableData.createdAt = new Date();
    editableData.updatedAt = new Date();

    // Create the record
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const newRecord = await (config.model as any).create({
      data: editableData,
    });

    return { success: true, data: newRecord };
  } catch (error) {
    console.error(`Error creating ${tableName} record:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Gets table statistics
 */
export async function getTableStats() {
  await requireGlobalAdmin();

  try {
    const stats = await Promise.all(
      Object.entries(TABLE_CONFIGS).map(async ([tableName, config]) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const count = await (config.model as any).count();
        return {
          tableName,
          count,
        };
      }),
    );

    return {
      success: true,
      data: stats,
    };
  } catch (error) {
    console.error("Error fetching table stats:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      data: [],
    };
  }
}

/**
 * Get available tables for admin interface
 */
export async function getAvailableTables() {
  await requireGlobalAdmin();

  try {
    const tables = Object.keys(TABLE_CONFIGS).map((tableName) => ({
      tablename: tableName,
      schemaname: "public",
      tableowner: "postgres",
    }));

    return { success: true, data: tables };
  } catch (error) {
    console.error("Error fetching available tables:", error);
    return { success: false, error: "Failed to fetch available tables" };
  }
}

/**
 * Get table schema information
 */
export async function getTableSchema() {
  await requireGlobalAdmin();

  try {
    // For now, return a basic schema structure
    // In a real implementation, you might want to query the actual database schema
    const schema = [
      {
        column_name: "id",
        data_type: "text",
        is_nullable: "NO",
        column_default: null,
        character_maximum_length: null,
      },
      {
        column_name: "createdAt",
        data_type: "timestamp",
        is_nullable: "NO",
        column_default: "now()",
        character_maximum_length: null,
      },
      {
        column_name: "updatedAt",
        data_type: "timestamp",
        is_nullable: "NO",
        column_default: "now()",
        character_maximum_length: null,
      },
    ];

    return { success: true, data: schema };
  } catch (error) {
    console.error("Error fetching table schema:", error);
    return { success: false, error: "Failed to fetch table schema" };
  }
}
