import {
  decimal,
  integer,
  pgTableCreator,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

import { sql } from "drizzle-orm";
import { user } from "./auth-schema";

// Create a pgTable function that prefixes all table names with 'public'
const pgTable = pgTableCreator((name) => `public.${name}`);

// Budget Account Management
export const budgetAccounts = pgTable("budget_account", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
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
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  date: timestamp("date").notNull(),
  type: text("type").notNull(), // 'income' or 'expense'
  status: text("status").notNull(), // 'pending', 'completed', 'failed'
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
