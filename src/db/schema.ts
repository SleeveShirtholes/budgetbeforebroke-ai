import { relations, sql } from "drizzle-orm";
import {
  boolean,
  decimal,
  integer,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

import { pgTable } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified")
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  phoneNumber: text("phone_number"),
  defaultBudgetAccountId: text("default_budget_account_id").references(
    () => budgetAccounts.id,
  ),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  passwordChangedAt: timestamp("password_changed_at"),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  passwordChangedAt: timestamp("password_changed_at"),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").$defaultFn(
    () => /* @__PURE__ */ new Date(),
  ),
  updatedAt: timestamp("updated_at").$defaultFn(
    () => /* @__PURE__ */ new Date(),
  ),
});

export const passkey = pgTable("passkey", {
  id: text("id").primaryKey(),
  name: text("name"),
  publicKey: text("public_key").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  credentialID: text("credential_i_d").notNull(),
  counter: integer("counter").notNull(),
  deviceType: text("device_type").notNull(),
  backedUp: boolean("backed_up").notNull(),
  transports: text("transports"),
  createdAt: timestamp("created_at"),
});

// Budget Account Management
export const budgetAccounts = pgTable("budget_account", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  accountNumber: text("account_number").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Budget Account Members
export const budgetAccountMembers = pgTable("budget_account_member", {
  id: text("id").primaryKey(),
  budgetAccountId: text("budget_account_id")
    .notNull()
    .references(() => budgetAccounts.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  role: text("role").notNull(), // 'owner', 'admin', 'member'
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Budget Account Invitations
export const budgetAccountInvitations = pgTable("budget_account_invitation", {
  id: text("id").primaryKey(),
  budgetAccountId: text("budget_account_id")
    .notNull()
    .references(() => budgetAccounts.id, { onDelete: "cascade" }),
  inviterId: text("inviter_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  inviteeEmail: text("invitee_email").notNull(),
  role: text("role").notNull(), // 'admin', 'member'
  status: text("status").notNull(), // 'pending', 'accepted', 'declined', 'expired'
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Define relations
export const budgetAccountsRelations = relations(
  budgetAccounts,
  ({ many }) => ({
    members: many(budgetAccountMembers),
    invitations: many(budgetAccountInvitations),
    budgets: many(budgets),
    categories: many(categories),
  }),
);

export const budgetAccountMembersRelations = relations(
  budgetAccountMembers,
  ({ one }) => ({
    budgetAccount: one(budgetAccounts, {
      fields: [budgetAccountMembers.budgetAccountId],
      references: [budgetAccounts.id],
    }),
    user: one(user, {
      fields: [budgetAccountMembers.userId],
      references: [user.id],
    }),
  }),
);

export const budgetAccountInvitationsRelations = relations(
  budgetAccountInvitations,
  ({ one }) => ({
    budgetAccount: one(budgetAccounts, {
      fields: [budgetAccountInvitations.budgetAccountId],
      references: [budgetAccounts.id],
    }),
    inviter: one(user, {
      fields: [budgetAccountInvitations.inviterId],
      references: [user.id],
    }),
  }),
);

// Budget Management
export const budgets = pgTable(
  "budget",
  {
    id: text("id").primaryKey(),
    budgetAccountId: text("budget_account_id")
      .notNull()
      .references(() => budgetAccounts.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    year: integer("year").notNull(),
    month: integer("month").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    yearMonthUnique: unique().on(
      table.budgetAccountId,
      table.year,
      table.month,
    ),
  }),
);

export const budgetsRelations = relations(budgets, ({ one, many }) => ({
  budgetAccount: one(budgetAccounts, {
    fields: [budgets.budgetAccountId],
    references: [budgetAccounts.id],
  }),
  categories: many(budgetCategories),
}));

// Category Management
export const categories = pgTable("category", {
  id: text("id").primaryKey(),
  budgetAccountId: text("budget_account_id")
    .notNull()
    .references(() => budgetAccounts.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  color: text("color"),
  icon: text("icon"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  budgetAccount: one(budgetAccounts, {
    fields: [categories.budgetAccountId],
    references: [budgetAccounts.id],
  }),
  budgetCategories: many(budgetCategories),
}));

// Budget Category Allocation
export const budgetCategories = pgTable("budget_category", {
  id: text("id").primaryKey(),
  budgetId: text("budget_id")
    .notNull()
    .references(() => budgets.id, { onDelete: "cascade" }),
  categoryId: text("category_id")
    .notNull()
    .references(() => categories.id, { onDelete: "cascade" }),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const budgetCategoriesRelations = relations(
  budgetCategories,
  ({ one }) => ({
    budget: one(budgets, {
      fields: [budgetCategories.budgetId],
      references: [budgets.id],
    }),
    category: one(categories, {
      fields: [budgetCategories.categoryId],
      references: [categories.id],
    }),
  }),
);

// Transaction Management
export const transactions = pgTable("transaction", {
  id: text("id").primaryKey(),
  budgetAccountId: text("budget_account_id")
    .notNull()
    .references(() => budgetAccounts.id, { onDelete: "cascade" }),
  categoryId: text("category_id").references(() => categories.id, {
    onDelete: "set null",
  }),
  createdByUserId: text("created_by_user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  // Plaid specific fields
  plaidItemId: text("plaid_item_id").references(() => plaidItems.id, {
    onDelete: "set null",
  }),
  plaidAccountId: text("plaid_account_id").references(() => plaidAccounts.id, {
    onDelete: "set null",
  }),
  plaidTransactionId: text("plaid_transaction_id").unique(),
  // Common fields
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  date: timestamp("date").notNull(),
  type: text("type").notNull(), // 'income' or 'expense'
  status: text("status").notNull(), // 'pending', 'completed', 'failed'
  // Additional Plaid fields
  merchantName: text("merchant_name"),
  plaidCategory: text("plaid_category"),
  pending: boolean("pending").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Financial Goals
export const goals = pgTable("goal", {
  id: text("id").primaryKey(),
  budgetAccountId: text("budget_account_id")
    .notNull()
    .references(() => budgetAccounts.id, { onDelete: "cascade" }),
  createdByUserId: text("created_by_user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  targetAmount: decimal("target_amount", { precision: 10, scale: 2 }).notNull(),
  currentAmount: decimal("current_amount", { precision: 10, scale: 2 })
    .notNull()
    .default("0"),
  targetDate: timestamp("target_date"),
  status: text("status").notNull(), // 'active', 'completed', 'cancelled'
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Recurring Transactions
export const recurringTransactions = pgTable("recurring_transaction", {
  id: text("id").primaryKey(),
  budgetAccountId: text("budget_account_id")
    .notNull()
    .references(() => budgetAccounts.id, { onDelete: "cascade" }),
  categoryId: text("category_id")
    .notNull()
    .references(() => categories.id, { onDelete: "cascade" }),
  createdByUserId: text("created_by_user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  frequency: text("frequency").notNull(), // 'daily', 'weekly', 'monthly', 'yearly'
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  lastProcessed: timestamp("last_processed"),
  status: text("status").notNull(), // 'active', 'paused', 'completed'
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Plaid Integration
export const plaidItems = pgTable("plaid_item", {
  id: text("id").primaryKey(),
  budgetAccountId: text("budget_account_id")
    .notNull()
    .references(() => budgetAccounts.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  plaidItemId: text("plaid_item_id").notNull().unique(),
  plaidAccessToken: text("plaid_access_token").notNull(),
  plaidInstitutionId: text("plaid_institution_id").notNull(),
  plaidInstitutionName: text("plaid_institution_name").notNull(),
  status: text("status").notNull(), // 'active', 'error', 'pending'
  lastSyncAt: timestamp("last_sync_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const plaidAccounts = pgTable("plaid_account", {
  id: text("id").primaryKey(),
  plaidItemId: text("plaid_item_id")
    .notNull()
    .references(() => plaidItems.id, { onDelete: "cascade" }),
  plaidAccountId: text("plaid_account_id").notNull().unique(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'depository', 'credit', 'loan', 'investment'
  subtype: text("subtype").notNull(), // 'checking', 'savings', 'credit card', etc.
  mask: text("mask"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Budget Transaction View
export const budgetTransactionView = sql<{
  id: string;
  budgetAccountId: string;
  categoryId: string | null;
  createdByUserId: string;
  amount: number;
  description: string | null;
  date: Date;
  type: string;
  status: string;
  budgetId: string;
  budgetName: string;
  budgetYear: number;
  budgetMonth: number;
}>`
  CREATE VIEW budget_transaction_view AS
  SELECT 
    t.*,
    b.id as budget_id,
    b.name as budget_name,
    b.year as budget_year,
    b.month as budget_month
  FROM transaction t
  JOIN budget b ON 
    EXTRACT(YEAR FROM t.date) = b.year AND 
    EXTRACT(MONTH FROM t.date) = b.month
  WHERE t.budget_account_id = b.budget_account_id
`;
