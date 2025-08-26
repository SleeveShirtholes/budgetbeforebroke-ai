import { relations } from "drizzle-orm/relations";
import {
  monthlyDebtPlanning,
  debtAllocations,
  budgetAccount,
  user,
  budgetAccountMember,
  budget,
  budgetCategory,
  category,
  contactSubmission,
  account,
  debt,
  dismissedWarnings,
  goal,
  incomeSource,
  passkey,
  plaidItem,
  budgetAccountInvitation,
  plaidAccount,
  session,
  supportRequest,
  supportComment,
  transaction,
} from "./schema";

export const debtAllocationsRelations = relations(
  debtAllocations,
  ({ one }) => ({
    monthlyDebtPlanning: one(monthlyDebtPlanning, {
      fields: [debtAllocations.monthlyDebtPlanningId],
      references: [monthlyDebtPlanning.id],
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

export const monthlyDebtPlanningRelations = relations(
  monthlyDebtPlanning,
  ({ one, many }) => ({
    debtAllocations: many(debtAllocations),
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

export const budgetAccountRelations = relations(budgetAccount, ({ many }) => ({
  debtAllocations: many(debtAllocations),
  budgetAccountMembers: many(budgetAccountMember),
  budgets: many(budget),
  categories: many(category),
  monthlyDebtPlannings: many(monthlyDebtPlanning),
  dismissedWarnings: many(dismissedWarnings),
  goals: many(goal),
  plaidItems: many(plaidItem),
  debts: many(debt),
  budgetAccountInvitations: many(budgetAccountInvitation),
  users: many(user),
  transactions: many(transaction),
}));

export const userRelations = relations(user, ({ one, many }) => ({
  debtAllocations: many(debtAllocations),
  budgetAccountMembers: many(budgetAccountMember),
  contactSubmissions: many(contactSubmission),
  accounts: many(account),
  dismissedWarnings: many(dismissedWarnings),
  goals: many(goal),
  incomeSources: many(incomeSource),
  passkeys: many(passkey),
  plaidItems: many(plaidItem),
  debts: many(debt),
  budgetAccountInvitations: many(budgetAccountInvitation),
  sessions: many(session),
  supportRequests: many(supportRequest),
  supportComments: many(supportComment),
  budgetAccount: one(budgetAccount, {
    fields: [user.defaultBudgetAccountId],
    references: [budgetAccount.id],
  }),
  transactions: many(transaction),
}));

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

export const budgetRelations = relations(budget, ({ one, many }) => ({
  budgetAccount: one(budgetAccount, {
    fields: [budget.budgetAccountId],
    references: [budgetAccount.id],
  }),
  budgetCategories: many(budgetCategory),
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

export const categoryRelations = relations(category, ({ one, many }) => ({
  budgetCategories: many(budgetCategory),
  budgetAccount: one(budgetAccount, {
    fields: [category.budgetAccountId],
    references: [budgetAccount.id],
  }),
  debts: many(debt),
  transactions: many(transaction),
}));

export const contactSubmissionRelations = relations(
  contactSubmission,
  ({ one }) => ({
    user: one(user, {
      fields: [contactSubmission.assignedTo],
      references: [user.id],
    }),
  }),
);

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const debtRelations = relations(debt, ({ one, many }) => ({
  monthlyDebtPlannings: many(monthlyDebtPlanning),
  category: one(category, {
    fields: [debt.categoryId],
    references: [category.id],
  }),
  budgetAccount: one(budgetAccount, {
    fields: [debt.budgetAccountId],
    references: [budgetAccount.id],
  }),
  user: one(user, {
    fields: [debt.createdByUserId],
    references: [user.id],
  }),
  transactions: many(transaction),
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

export const incomeSourceRelations = relations(incomeSource, ({ one }) => ({
  user: one(user, {
    fields: [incomeSource.userId],
    references: [user.id],
  }),
}));

export const passkeyRelations = relations(passkey, ({ one }) => ({
  user: one(user, {
    fields: [passkey.userId],
    references: [user.id],
  }),
}));

export const plaidItemRelations = relations(plaidItem, ({ one, many }) => ({
  budgetAccount: one(budgetAccount, {
    fields: [plaidItem.budgetAccountId],
    references: [budgetAccount.id],
  }),
  user: one(user, {
    fields: [plaidItem.userId],
    references: [user.id],
  }),
  plaidAccounts: many(plaidAccount),
  transactions: many(transaction),
}));

export const budgetAccountInvitationRelations = relations(
  budgetAccountInvitation,
  ({ one }) => ({
    budgetAccount: one(budgetAccount, {
      fields: [budgetAccountInvitation.budgetAccountId],
      references: [budgetAccount.id],
    }),
    user: one(user, {
      fields: [budgetAccountInvitation.inviterId],
      references: [user.id],
    }),
  }),
);

export const plaidAccountRelations = relations(
  plaidAccount,
  ({ one, many }) => ({
    plaidItem: one(plaidItem, {
      fields: [plaidAccount.plaidItemId],
      references: [plaidItem.id],
    }),
    transactions: many(transaction),
  }),
);

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

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

export const transactionRelations = relations(transaction, ({ one }) => ({
  debt: one(debt, {
    fields: [transaction.debtId],
    references: [debt.id],
  }),
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
