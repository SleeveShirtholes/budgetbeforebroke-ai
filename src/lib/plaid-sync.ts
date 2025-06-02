import { plaidAccounts, plaidItems, transactions } from "@/db/schema";

import { db } from "@/db/config";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { plaidClient } from "./plaid";

export async function syncPlaidTransactions() {
  try {
    // Get all active Plaid items
    const plaidItemsList = await db
      .select()
      .from(plaidItems)
      .where(eq(plaidItems.status, "active"));

    for (const item of plaidItemsList) {
      try {
        // Get accounts for this item
        const accountsResponse = await plaidClient.accountsGet({
          access_token: item.plaidAccessToken,
        });

        // Store or update accounts
        for (const account of accountsResponse.data.accounts) {
          await db
            .insert(plaidAccounts)
            .values({
              id: nanoid(),
              plaidItemId: item.id,
              plaidAccountId: account.account_id,
              name: account.name,
              type: account.type,
              subtype: account.subtype ?? "",
              mask: account.mask,
            })
            .onConflictDoUpdate({
              target: plaidAccounts.plaidAccountId,
              set: {
                name: account.name,
                type: account.type,
                subtype: account.subtype ?? "",
                mask: account.mask,
                updatedAt: new Date(),
              },
            });
        }

        // Get transactions for the last 30 days
        const now = new Date();
        const thirtyDaysAgo = new Date(
          now.getTime() - 30 * 24 * 60 * 60 * 1000,
        );

        const transactionsResponse = await plaidClient.transactionsGet({
          access_token: item.plaidAccessToken,
          start_date: thirtyDaysAgo.toISOString().split("T")[0],
          end_date: now.toISOString().split("T")[0],
        });

        // Store transactions
        for (const transaction of transactionsResponse.data.transactions) {
          // Store the Plaid transaction
          await db
            .insert(transactions)
            .values({
              id: nanoid(),
              plaidItemId: item.id,
              plaidAccountId: transaction.account_id,
              plaidTransactionId: transaction.transaction_id,
              amount: transaction.amount.toString(),
              date: new Date(transaction.date),
              description: transaction.name,
              merchantName: transaction.merchant_name,
              plaidCategory: transaction.category?.[0],
              pending: transaction.pending,
              budgetAccountId: item.budgetAccountId,
              status: transaction.pending ? "pending" : "completed",
              createdByUserId: item.userId,
              type: transaction.amount > 0 ? "income" : "expense",
            })
            .onConflictDoUpdate({
              target: transactions.plaidTransactionId,
              set: {
                amount: transaction.amount.toString(),
                date: new Date(transaction.date),
                description: transaction.name,
                merchantName: transaction.merchant_name,
                plaidCategory: transaction.category?.[0],
                pending: transaction.pending,
                updatedAt: new Date(),
              },
            });

          // If the transaction is not pending, create or update our transaction
          if (!transaction.pending) {
            await db
              .insert(transactions)
              .values({
                id: nanoid(),
                budgetAccountId: item.budgetAccountId,
                amount: transaction.amount.toString(),
                description: transaction.name,
                date: new Date(transaction.date),
                type: transaction.amount > 0 ? "income" : "expense",
                status: "completed",
                createdByUserId: item.userId,
              })
              .onConflictDoUpdate({
                target: transactions.id,
                set: {
                  amount: transaction.amount.toString(),
                  description: transaction.name,
                  date: new Date(transaction.date),
                  type: transaction.amount > 0 ? "income" : "expense",
                  status: "completed",
                  updatedAt: new Date(),
                },
              });
          }
        }

        // Update last sync time
        await db
          .update(plaidItems)
          .set({
            lastSyncAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(plaidItems.id, item.id));
      } catch (error) {
        console.error(`Error syncing Plaid item ${item.id}:`, error);
        // Update item status to error
        await db
          .update(plaidItems)
          .set({
            status: "error",
            updatedAt: new Date(),
          })
          .where(eq(plaidItems.id, item.id));
      }
    }
  } catch (error) {
    console.error("Error in Plaid sync job:", error);
  }
}
