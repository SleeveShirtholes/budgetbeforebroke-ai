import { relations } from "drizzle-orm/relations";
import {
  user,
  budgetAccountInvitation,
  budgetAccount,
  budgetAccountMember,
  account,
  category,
  contactSubmission,
  debtAllocations,
  debt,
  passkey,
  plaidItem,
  session,
  supportRequest,
  supportComment,
  transaction,
  plaidAccount,
  incomeSource,
} from "./schema";

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

export const userRelations = relations(user, ({ one, many }) => ({
  budgetAccountInvitations: many(budgetAccountInvitation),
  budgetAccountMembers: many(budgetAccountMember),
  accounts: many(account),
  contactSubmissions: many(contactSubmission),
  debtAllocations: many(debtAllocations),
  debts: many(debt),
  passkeys: many(passkey),
  plaidItems: many(plaidItem),
  sessions: many(session),
  supportRequests: many(supportRequest),
  supportComments: many(supportComment),
  transactions: many(transaction),
  incomeSources: many(incomeSource),
  budgetAccount: one(budgetAccount, {
    fields: [user.defaultBudgetAccountId],
    references: [budgetAccount.id],
  }),
}));

export const budgetAccountRelations = relations(budgetAccount, ({ many }) => ({
  budgetAccountInvitations: many(budgetAccountInvitation),
  budgetAccountMembers: many(budgetAccountMember),
  categories: many(category),
  debtAllocations: many(debtAllocations),
  debts: many(debt),
  plaidItems: many(plaidItem),
  transactions: many(transaction),
  users: many(user),
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

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const categoryRelations = relations(category, ({ one, many }) => ({
  budgetAccount: one(budgetAccount, {
    fields: [category.budgetAccountId],
    references: [budgetAccount.id],
  }),
  transactions: many(transaction),
  debts: many(debt),
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

export const debtAllocationsRelations = relations(
  debtAllocations,
  ({ one }) => ({
    budgetAccount: one(budgetAccount, {
      fields: [debtAllocations.budgetAccountId],
      references: [budgetAccount.id],
    }),
    debt: one(debt, {
      fields: [debtAllocations.debtId],
      references: [debt.id],
    }),
    user: one(user, {
      fields: [debtAllocations.userId],
      references: [user.id],
    }),
  }),
);

export const debtRelations = relations(debt, ({ one, many }) => ({
  debtAllocations: many(debtAllocations),
  transactions: many(transaction),
  budgetAccount: one(budgetAccount, {
    fields: [debt.budgetAccountId],
    references: [budgetAccount.id],
  }),
  category: one(category, {
    fields: [debt.categoryId],
    references: [category.id],
  }),
  user: one(user, {
    fields: [debt.createdByUserId],
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
  transactions: many(transaction),
  plaidAccounts: many(plaidAccount),
}));

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
  debt: one(debt, {
    fields: [transaction.debtId],
    references: [debt.id],
  }),
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

export const incomeSourceRelations = relations(incomeSource, ({ one }) => ({
  user: one(user, {
    fields: [incomeSource.userId],
    references: [user.id],
  }),
}));
