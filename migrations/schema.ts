import {
  pgTable,
  foreignKey,
  unique,
  text,
  timestamp,
  numeric,
  date,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const budgetAccountInvitation = pgTable(
  "budget_account_invitation",
  {
    id: text().primaryKey().notNull(),
    budgetAccountId: text("budget_account_id").notNull(),
    inviterId: text("inviter_id").notNull(),
    inviteeEmail: text("invitee_email").notNull(),
    role: text().notNull(),
    status: text().notNull(),
    token: text().notNull(),
    expiresAt: timestamp("expires_at", { mode: "string" }).notNull(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.inviterId],
      foreignColumns: [user.id],
      name: "budget_account_invitation_inviter_id_user_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.budgetAccountId],
      foreignColumns: [budgetAccount.id],
      name: "budget_account_invitation_budget_account_id_budget_account_id_f",
    }).onDelete("cascade"),
    unique("budget_account_invitation_token_unique").on(table.token),
  ],
);

export const budgetAccountMember = pgTable(
  "budget_account_member",
  {
    id: text().primaryKey().notNull(),
    budgetAccountId: text("budget_account_id").notNull(),
    userId: text("user_id").notNull(),
    role: text().notNull(),
    joinedAt: timestamp("joined_at", { mode: "string" }).defaultNow().notNull(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.budgetAccountId],
      foreignColumns: [budgetAccount.id],
      name: "budget_account_member_budget_account_id_budget_account_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "budget_account_member_user_id_user_id_fk",
    }).onDelete("cascade"),
  ],
);

export const account = pgTable(
  "account",
  {
    id: text().primaryKey().notNull(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id").notNull(),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", {
      mode: "string",
    }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
      mode: "string",
    }),
    scope: text(),
    password: text(),
    createdAt: timestamp("created_at", { mode: "string" }).notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" }).notNull(),
    passwordChangedAt: timestamp("password_changed_at", { mode: "string" }),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "account_user_id_user_id_fk",
    }).onDelete("cascade"),
  ],
);

export const category = pgTable(
  "category",
  {
    id: text().primaryKey().notNull(),
    budgetAccountId: text("budget_account_id").notNull(),
    name: text().notNull(),
    description: text(),
    color: text(),
    icon: text(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.budgetAccountId],
      foreignColumns: [budgetAccount.id],
      name: "category_budget_account_id_budget_account_id_fk",
    }).onDelete("cascade"),
  ],
);

export const contactSubmission = pgTable(
  "contact_submission",
  {
    id: text().primaryKey().notNull(),
    name: text().notNull(),
    email: text().notNull(),
    subject: text().notNull(),
    message: text().notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    status: text().default("new").notNull(),
    assignedTo: text("assigned_to"),
    notes: text(),
    resolvedAt: timestamp("resolved_at", { mode: "string" }),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    conversationId: text("conversation_id"),
    lastUserMessageAt: timestamp("last_user_message_at", { mode: "string" }),
    lastSupportMessageAt: timestamp("last_support_message_at", {
      mode: "string",
    }),
  },
  (table) => [
    foreignKey({
      columns: [table.assignedTo],
      foreignColumns: [user.id],
      name: "contact_submission_assigned_to_user_id_fk",
    }),
  ],
);

export const debtAllocations = pgTable(
  "debt_allocations",
  {
    id: text().primaryKey().notNull(),
    budgetAccountId: text("budget_account_id").notNull(),
    debtId: text("debt_id").notNull(),
    paycheckId: text("paycheck_id").notNull(),
    paymentAmount: numeric("payment_amount", { precision: 10, scale: 2 }),
    paymentDate: date("payment_date"),
    isPaid: boolean("is_paid").default(false).notNull(),
    paidAt: timestamp("paid_at", { mode: "string" }),
    note: text(),
    allocatedAt: timestamp("allocated_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    userId: text("user_id").notNull(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.budgetAccountId],
      foreignColumns: [budgetAccount.id],
      name: "debt_allocations_budget_account_id_budget_account_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.debtId],
      foreignColumns: [debt.id],
      name: "debt_allocations_debt_id_debt_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "debt_allocations_user_id_user_id_fk",
    }).onDelete("cascade"),
  ],
);

export const debt = pgTable(
  "debt",
  {
    id: text().primaryKey().notNull(),
    budgetAccountId: text("budget_account_id").notNull(),
    createdByUserId: text("created_by_user_id").notNull(),
    categoryId: text("category_id"),
    name: text().notNull(),
    paymentAmount: numeric("payment_amount", {
      precision: 10,
      scale: 2,
    }).notNull(),
    interestRate: numeric("interest_rate", {
      precision: 5,
      scale: 2,
    }).notNull(),
    dueDate: date("due_date").notNull(),
    hasBalance: boolean("has_balance").default(false).notNull(),
    lastPaymentMonth: timestamp("last_payment_month", { mode: "string" }),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.budgetAccountId],
      foreignColumns: [budgetAccount.id],
      name: "debt_budget_account_id_budget_account_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.categoryId],
      foreignColumns: [category.id],
      name: "debt_category_id_category_id_fk",
    }).onDelete("set null"),
    foreignKey({
      columns: [table.createdByUserId],
      foreignColumns: [user.id],
      name: "debt_created_by_user_id_user_id_fk",
    }).onDelete("cascade"),
  ],
);

export const emailConversation = pgTable("email_conversation", {
  id: text().primaryKey().notNull(),
  conversationId: text("conversation_id").notNull(),
  messageId: text("message_id"),
  fromEmail: text("from_email").notNull(),
  fromName: text("from_name").notNull(),
  toEmail: text("to_email").notNull(),
  subject: text().notNull(),
  message: text().notNull(),
  messageType: text("message_type").notNull(),
  direction: text().notNull(),
  rawEmail: text("raw_email"),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
});

export const budgetAccount = pgTable(
  "budget_account",
  {
    id: text().primaryKey().notNull(),
    name: text().notNull(),
    description: text(),
    accountNumber: text("account_number").notNull(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    unique("budget_account_account_number_unique").on(table.accountNumber),
  ],
);

export const passkey = pgTable(
  "passkey",
  {
    id: text().primaryKey().notNull(),
    name: text(),
    publicKey: text("public_key").notNull(),
    userId: text("user_id").notNull(),
    credentialID: text("credential_i_d").notNull(),
    counter: integer().notNull(),
    deviceType: text("device_type").notNull(),
    backedUp: boolean("backed_up").notNull(),
    transports: text(),
    createdAt: timestamp("created_at", { mode: "string" }),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "passkey_user_id_user_id_fk",
    }).onDelete("cascade"),
  ],
);

export const plaidItem = pgTable(
  "plaid_item",
  {
    id: text().primaryKey().notNull(),
    budgetAccountId: text("budget_account_id").notNull(),
    userId: text("user_id").notNull(),
    plaidItemId: text("plaid_item_id").notNull(),
    plaidAccessToken: text("plaid_access_token").notNull(),
    plaidInstitutionId: text("plaid_institution_id").notNull(),
    plaidInstitutionName: text("plaid_institution_name").notNull(),
    status: text().notNull(),
    lastSyncAt: timestamp("last_sync_at", { mode: "string" }),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.budgetAccountId],
      foreignColumns: [budgetAccount.id],
      name: "plaid_item_budget_account_id_budget_account_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "plaid_item_user_id_user_id_fk",
    }).onDelete("cascade"),
    unique("plaid_item_plaid_item_id_unique").on(table.plaidItemId),
  ],
);

export const session = pgTable(
  "session",
  {
    id: text().primaryKey().notNull(),
    expiresAt: timestamp("expires_at", { mode: "string" }).notNull(),
    token: text().notNull(),
    createdAt: timestamp("created_at", { mode: "string" }).notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" }).notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id").notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "session_user_id_user_id_fk",
    }).onDelete("cascade"),
    unique("session_token_unique").on(table.token),
  ],
);

export const supportRequest = pgTable(
  "support_request",
  {
    id: text().primaryKey().notNull(),
    title: text().notNull(),
    description: text().notNull(),
    category: text().notNull(),
    status: text().notNull(),
    isPublic: boolean("is_public").default(false).notNull(),
    userId: text("user_id").notNull(),
    upvotes: integer().default(0).notNull(),
    downvotes: integer().default(0).notNull(),
    lastUpdated: timestamp("last_updated", { mode: "string" })
      .defaultNow()
      .notNull(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "support_request_user_id_user_id_fk",
    }).onDelete("cascade"),
  ],
);

export const supportComment = pgTable(
  "support_comment",
  {
    id: text().primaryKey().notNull(),
    requestId: text("request_id").notNull(),
    userId: text("user_id").notNull(),
    text: text().notNull(),
    timestamp: timestamp({ mode: "string" }).defaultNow().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.requestId],
      foreignColumns: [supportRequest.id],
      name: "support_comment_request_id_support_request_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "support_comment_user_id_user_id_fk",
    }).onDelete("cascade"),
  ],
);

export const transaction = pgTable(
  "transaction",
  {
    id: text().primaryKey().notNull(),
    budgetAccountId: text("budget_account_id").notNull(),
    categoryId: text("category_id"),
    createdByUserId: text("created_by_user_id").notNull(),
    plaidItemId: text("plaid_item_id"),
    plaidAccountId: text("plaid_account_id"),
    plaidTransactionId: text("plaid_transaction_id"),
    debtId: text("debt_id"),
    amount: numeric({ precision: 10, scale: 2 }).notNull(),
    description: text(),
    date: timestamp({ mode: "string" }).notNull(),
    type: text().notNull(),
    status: text().notNull(),
    merchantName: text("merchant_name"),
    plaidCategory: text("plaid_category"),
    pending: boolean().default(false).notNull(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.budgetAccountId],
      foreignColumns: [budgetAccount.id],
      name: "transaction_budget_account_id_budget_account_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.categoryId],
      foreignColumns: [category.id],
      name: "transaction_category_id_category_id_fk",
    }).onDelete("set null"),
    foreignKey({
      columns: [table.createdByUserId],
      foreignColumns: [user.id],
      name: "transaction_created_by_user_id_user_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.plaidItemId],
      foreignColumns: [plaidItem.id],
      name: "transaction_plaid_item_id_plaid_item_id_fk",
    }).onDelete("set null"),
    foreignKey({
      columns: [table.plaidAccountId],
      foreignColumns: [plaidAccount.id],
      name: "transaction_plaid_account_id_plaid_account_id_fk",
    }).onDelete("set null"),
    foreignKey({
      columns: [table.debtId],
      foreignColumns: [debt.id],
      name: "transaction_debt_id_debt_id_fk",
    }).onDelete("set null"),
    unique("transaction_plaid_transaction_id_unique").on(
      table.plaidTransactionId,
    ),
  ],
);

export const incomeSource = pgTable(
  "income_source",
  {
    id: text().primaryKey().notNull(),
    userId: text("user_id").notNull(),
    name: text().notNull(),
    amount: numeric({ precision: 10, scale: 2 }).notNull(),
    frequency: text().notNull(),
    startDate: date("start_date").notNull(),
    endDate: date("end_date"),
    isActive: boolean("is_active").default(true).notNull(),
    notes: text(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "income_source_user_id_user_id_fk",
    }).onDelete("cascade"),
  ],
);

export const user = pgTable(
  "user",
  {
    id: text().primaryKey().notNull(),
    name: text().notNull(),
    email: text().notNull(),
    emailVerified: boolean("email_verified").notNull(),
    image: text(),
    phoneNumber: text("phone_number"),
    defaultBudgetAccountId: text("default_budget_account_id"),
    createdAt: timestamp("created_at", { mode: "string" }).notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" }).notNull(),
    passwordChangedAt: timestamp("password_changed_at", { mode: "string" }),
  },
  (table) => [
    foreignKey({
      columns: [table.defaultBudgetAccountId],
      foreignColumns: [budgetAccount.id],
      name: "user_default_budget_account_id_budget_account_id_fk",
    }),
    unique("user_email_unique").on(table.email),
  ],
);

export const plaidAccount = pgTable(
  "plaid_account",
  {
    id: text().primaryKey().notNull(),
    plaidItemId: text("plaid_item_id").notNull(),
    plaidAccountId: text("plaid_account_id").notNull(),
    name: text().notNull(),
    type: text().notNull(),
    subtype: text().notNull(),
    mask: text(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.plaidItemId],
      foreignColumns: [plaidItem.id],
      name: "plaid_account_plaid_item_id_plaid_item_id_fk",
    }).onDelete("cascade"),
    unique("plaid_account_plaid_account_id_unique").on(table.plaidAccountId),
  ],
);
