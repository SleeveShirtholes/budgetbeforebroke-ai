import { relations } from "drizzle-orm/relations";
import {
  user,
  session,
  passkey,
  account,
  budgetAccount,
  budget,
  recurringTransaction,
  category,
  budgetAccountInvitation,
  debt,
  debtAllocations,
  transaction,
  plaidItem,
  plaidAccount,
  supportRequest,
  supportComment,
  dismissedWarnings,
  budgetAccountMember,
  goal,
  budgetCategory,
  incomeSource,
  monthlyDebtPlanning,
} from "./schema";

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const userRelations = relations(user, ({ one, many }) => ({
  sessions: many(session),
  passkeys: many(passkey),
  accounts: many(account),
  budgetAccount: one(budgetAccount, {
    fields: [user.defaultBudgetAccountId],
    references: [budgetAccount.id],
  }),
  recurringTransactions: many(recurringTransaction),
  budgetAccountInvitations: many(budgetAccountInvitation),
  debtAllocations: many(debtAllocations),
  transactions: many(transaction),
  debts: many(debt),
  supportRequests: many(supportRequest),
  supportComments: many(supportComment),
  dismissedWarnings: many(dismissedWarnings),
  budgetAccountMembers: many(budgetAccountMember),
  goals: many(goal),
  plaidItems: many(plaidItem),
  incomeSources: many(incomeSource),
}));

export const passkeyRelations = relations(passkey, ({ one }) => ({
  user: one(user, {
    fields: [passkey.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const budgetAccountRelations = relations(budgetAccount, ({ many }) => ({
  users: many(user),
  budgets: many(budget),
  recurringTransactions: many(recurringTransaction),
  budgetAccountInvitations: many(budgetAccountInvitation),
  debtAllocations: many(debtAllocations),
  transactions: many(transaction),
  debts: many(debt),
  dismissedWarnings: many(dismissedWarnings),
  budgetAccountMembers: many(budgetAccountMember),
  categories: many(category),
  goals: many(goal),
  plaidItems: many(plaidItem),
  monthlyDebtPlannings: many(monthlyDebtPlanning),
}));

export const budgetRelations = relations(budget, ({ one, many }) => ({
  budgetAccount: one(budgetAccount, {
    fields: [budget.budgetAccountId],
    references: [budgetAccount.id],
  }),
  budgetCategories: many(budgetCategory),
}));

export const recurringTransactionRelations = relations(
  recurringTransaction,
  ({ one }) => ({
    budgetAccount: one(budgetAccount, {
      fields: [recurringTransaction.budgetAccountId],
      references: [budgetAccount.id],
    }),
    category: one(category, {
      fields: [recurringTransaction.categoryId],
      references: [category.id],
    }),
    user: one(user, {
      fields: [recurringTransaction.createdByUserId],
      references: [user.id],
    }),
  }),
);

export const categoryRelations = relations(category, ({ one, many }) => ({
  recurringTransactions: many(recurringTransaction),
  transactions: many(transaction),
  budgetAccount: one(budgetAccount, {
    fields: [category.budgetAccountId],
    references: [budgetAccount.id],
  }),
  budgetCategories: many(budgetCategory),
}));

export const budgetAccountInvitationRelations = relations(
  budgetAccountInvitation,
  ({ one }) => ({
    user: one(user, {
      fields: [budgetAccountInvitation.inviterId],
      references: [user.id],
    }),
    budgetAccount: one(budgetAccount, {
      fields: [budgetAccountInvitation.budgetAccountId],
      references: [budgetAccount.id],
    }),
  }),
);

export const debtAllocationsRelations = relations(
  debtAllocations,
  ({ one }) => ({
    debt: one(debt, {
      fields: [debtAllocations.debtId],
      references: [debt.id],
    }),
    budgetAccount: one(budgetAccount, {
      fields: [debtAllocations.budgetAccountId],
      references: [budgetAccount.id],
    }),
    user: one(user, {
      fields: [debtAllocations.userId],
      references: [user.id],
    }),
  }),
);

export const debtRelations = relations(debt, ({ one, many }) => ({
  debtAllocations: many(debtAllocations),
  budgetAccount: one(budgetAccount, {
    fields: [debt.budgetAccountId],
    references: [budgetAccount.id],
  }),
  user: one(user, {
    fields: [debt.createdByUserId],
    references: [user.id],
  }),
  monthlyDebtPlannings: many(monthlyDebtPlanning),
}));

export const transactionRelations = relations(transaction, ({ one }) => ({
  budgetAccount: one(budgetAccount, {
    fields: [transaction.budgetAccountId],
    references: [budgetAccount.id],
  }),
  category: one(category, {
    fields: [transaction.categoryId],
    references: [category.id],
  }),
  user: one(user, {
    fields: [transaction.createdByUserId],
    references: [user.id],
  }),
  plaidItem: one(plaidItem, {
    fields: [transaction.plaidItemId],
    references: [plaidItem.id],
  }),
  plaidAccount: one(plaidAccount, {
    fields: [transaction.plaidAccountId],
    references: [plaidAccount.id],
  }),
}));

export const plaidItemRelations = relations(plaidItem, ({ one, many }) => ({
  transactions: many(transaction),
  budgetAccount: one(budgetAccount, {
    fields: [plaidItem.budgetAccountId],
    references: [budgetAccount.id],
  }),
  user: one(user, {
    fields: [plaidItem.userId],
    references: [user.id],
  }),
  plaidAccounts: many(plaidAccount),
}));

export const plaidAccountRelations = relations(
  plaidAccount,
  ({ one, many }) => ({
    transactions: many(transaction),
    plaidItem: one(plaidItem, {
      fields: [plaidAccount.plaidItemId],
      references: [plaidItem.id],
    }),
  }),
);

export const supportRequestRelations = relations(
  supportRequest,
  ({ one, many }) => ({
    user: one(user, {
      fields: [supportRequest.userId],
      references: [user.id],
    }),
    supportComments: many(supportComment),
  }),
);

export const supportCommentRelations = relations(supportComment, ({ one }) => ({
  supportRequest: one(supportRequest, {
    fields: [supportComment.requestId],
    references: [supportRequest.id],
  }),
  user: one(user, {
    fields: [supportComment.userId],
    references: [user.id],
  }),
}));

export const dismissedWarningsRelations = relations(
  dismissedWarnings,
  ({ one }) => ({
    budgetAccount: one(budgetAccount, {
      fields: [dismissedWarnings.budgetAccountId],
      references: [budgetAccount.id],
    }),
    user: one(user, {
      fields: [dismissedWarnings.userId],
      references: [user.id],
    }),
  }),
);

export const budgetAccountMemberRelations = relations(
  budgetAccountMember,
  ({ one }) => ({
    budgetAccount: one(budgetAccount, {
      fields: [budgetAccountMember.budgetAccountId],
      references: [budgetAccount.id],
    }),
    user: one(user, {
      fields: [budgetAccountMember.userId],
      references: [user.id],
    }),
  }),
);

export const goalRelations = relations(goal, ({ one }) => ({
  budgetAccount: one(budgetAccount, {
    fields: [goal.budgetAccountId],
    references: [budgetAccount.id],
  }),
  user: one(user, {
    fields: [goal.createdByUserId],
    references: [user.id],
  }),
}));

export const budgetCategoryRelations = relations(budgetCategory, ({ one }) => ({
  budget: one(budget, {
    fields: [budgetCategory.budgetId],
    references: [budget.id],
  }),
  category: one(category, {
    fields: [budgetCategory.categoryId],
    references: [category.id],
  }),
}));

export const incomeSourceRelations = relations(incomeSource, ({ one }) => ({
  user: one(user, {
    fields: [incomeSource.userId],
    references: [user.id],
  }),
}));

export const monthlyDebtPlanningRelations = relations(
  monthlyDebtPlanning,
  ({ one }) => ({
    budgetAccount: one(budgetAccount, {
      fields: [monthlyDebtPlanning.budgetAccountId],
      references: [budgetAccount.id],
    }),
    debt: one(debt, {
      fields: [monthlyDebtPlanning.debtId],
      references: [debt.id],
    }),
  }),
);
