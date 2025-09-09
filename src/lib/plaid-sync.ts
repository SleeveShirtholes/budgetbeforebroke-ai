import { db } from "@/db/config";
import { nanoid } from "nanoid";
import { plaidClient } from "./plaid";

export async function syncPlaidTransactions() {
  try {
    // Get all active Plaid items
    const plaidItemsList = await db.plaidItem.findMany({
      where: {
        status: "active",
      },
    });

    for (const item of plaidItemsList) {
      try {
        // Get accounts for this item
        const accountsResponse = await plaidClient.accountsGet({
          access_token: item.plaidAccessToken,
        });

        // Store or update accounts
        for (const account of accountsResponse.data.accounts) {
          await db.plaidAccount.upsert({
            where: {
              plaidAccountId: account.account_id,
            },
            update: {
              name: account.name,
              type: account.type,
              subtype: account.subtype ?? "",
              mask: account.mask,
              updatedAt: new Date(),
            },
            create: {
              id: nanoid(),
              plaidItemId: item.id,
              plaidAccountId: account.account_id,
              name: account.name,
              type: account.type,
              subtype: account.subtype ?? "",
              mask: account.mask,
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
          await db.transaction.upsert({
            where: {
              plaidTransactionId: transaction.transaction_id,
            },
            update: {
              amount: transaction.amount.toString(),
              date: transaction.date,
              description: transaction.name,
              merchantName: transaction.merchant_name,
              plaidCategory: transaction.category?.[0],
              pending: transaction.pending,
              updatedAt: new Date(),
            },
            create: {
              id: nanoid(),
              plaidItemId: item.id,
              plaidAccountId: transaction.account_id,
              plaidTransactionId: transaction.transaction_id,
              amount: transaction.amount.toString(),
              date: transaction.date,
              description: transaction.name,
              merchantName: transaction.merchant_name,
              plaidCategory: transaction.category?.[0],
              pending: transaction.pending,
              budgetAccountId: item.budgetAccountId,
              status: transaction.pending ? "pending" : "completed",
              createdByUserId: item.userId,
              type: transaction.amount > 0 ? "income" : "expense",
            },
          });

          // If the transaction is not pending, create or update our transaction
          if (!transaction.pending) {
            await db.transaction.upsert({
              where: {
                id: nanoid(),
              },
              update: {
                amount: transaction.amount.toString(),
                description: transaction.name,
                date: transaction.date,
                type: transaction.amount > 0 ? "income" : "expense",
                status: "completed",
                updatedAt: new Date(),
              },
              create: {
                id: nanoid(),
                budgetAccountId: item.budgetAccountId,
                amount: transaction.amount.toString(),
                description: transaction.name,
                date: transaction.date,
                type: transaction.amount > 0 ? "income" : "expense",
                status: "completed",
                createdByUserId: item.userId,
              },
            });
          }
        }

        // Update last sync time
        await db.plaidItem.update({
          where: {
            id: item.id,
          },
          data: {
            lastSyncAt: new Date(),
            updatedAt: new Date(),
          },
        });
      } catch (error) {
        console.error(`Error syncing Plaid item ${item.id}:`, error);
        // Update item status to error
        await db.plaidItem.update({
          where: {
            id: item.id,
          },
          data: {
            status: "error",
            updatedAt: new Date(),
          },
        });
      }
    }
  } catch (error) {
    console.error("Error in Plaid sync job:", error);
  }
}
