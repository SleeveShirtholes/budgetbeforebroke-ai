import { db } from "@/db/config";
import {
  user,
  transactions,
  categories,
  budgets,
  budgetCategories,
  budgetAccounts,
} from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { formatPhoneNumber } from "./twilio";
import { nanoid } from "nanoid";

export interface SmsData {
  From: string;
  To: string;
  Body: string;
  MessageSid: string;
}

export interface TransactionData {
  amount: number;
  description: string;
  category?: string;
  type: "expense" | "income";
}

export interface BudgetQueryResult {
  categoryName: string;
  allocated: number;
  spent: number;
  remaining: number;
}

/**
 * Process incoming SMS messages and return appropriate responses
 */
export async function processSmsMessage(smsData: SmsData): Promise<string> {
  const { From: phoneNumber, Body: message } = smsData;
  const formattedPhone = formatPhoneNumber(phoneNumber);

  // Find user by phone number
  const userData = await findUserByPhone(formattedPhone);
  if (!userData) {
    return "Sorry, I don't recognize this phone number. Please make sure your phone number is added to your account profile.";
  }

  const trimmedMessage = message.trim().toLowerCase();

  // Handle help command
  if (trimmedMessage === "help" || trimmedMessage === "?") {
    return getHelpMessage();
  }

  // Handle budget query commands
  if (
    trimmedMessage.startsWith("budget") ||
    trimmedMessage.startsWith("balance")
  ) {
    return await handleBudgetQuery(
      userData.id,
      userData.defaultBudgetAccountId,
      trimmedMessage,
    );
  }

  // Handle transaction commands
  if (
    trimmedMessage.startsWith("spent") ||
    trimmedMessage.startsWith("expense") ||
    trimmedMessage.startsWith("paid") ||
    trimmedMessage.startsWith("bought") ||
    trimmedMessage.startsWith("income") ||
    trimmedMessage.startsWith("earned") ||
    trimmedMessage.includes("$") ||
    trimmedMessage.match(/\d+(\.\d{2})?/)
  ) {
    return await handleTransactionCommand(
      userData.id,
      userData.defaultBudgetAccountId,
      message,
    );
  }

  // Default response for unrecognized commands
  return `I didn't understand that command. Send "help" for available commands.

Quick examples:
• Spent $25 on groceries
• Budget groceries
• Income $500 freelance work`;
}

/**
 * Find user by phone number
 */
async function findUserByPhone(phoneNumber: string) {
  try {
    const users = await db
      .select({
        id: user.id,
        name: user.name,
        defaultBudgetAccountId: user.defaultBudgetAccountId,
      })
      .from(user)
      .where(eq(user.phoneNumber, phoneNumber))
      .limit(1);

    return users[0] || null;
  } catch (error) {
    console.error("Error finding user by phone:", error);
    return null;
  }
}

/**
 * Handle transaction creation commands
 */
async function handleTransactionCommand(
  userId: string,
  budgetAccountId: string | null,
  message: string,
): Promise<string> {
  if (!budgetAccountId) {
    return "You need to set up a budget account first. Please log into your account and create a budget.";
  }

  const transactionData = parseTransactionMessage(message);
  if (!transactionData) {
    return `I couldn't parse that transaction. Please use formats like:
• Spent $25 on groceries
• Paid $50 for gas
• Income $500 freelance work
• Earned $100 side hustle`;
  }

  try {
    // Find or create category
    let categoryId = null;
    if (transactionData.category) {
      categoryId = await findOrCreateCategory(
        budgetAccountId,
        transactionData.category,
      );
    }

    // Create transaction
    const transactionId = nanoid();
    await db.insert(transactions).values({
      id: transactionId,
      budgetAccountId,
      categoryId,
      amount: transactionData.amount.toString(),
      description: transactionData.description,
      type: transactionData.type,
      date: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Get budget info for response
    const budgetInfo = categoryId
      ? await getBudgetRemainingForCategory(budgetAccountId, categoryId)
      : null;

    let response = `✅ ${transactionData.type === "expense" ? "Expense" : "Income"} recorded: $${transactionData.amount.toFixed(2)}`;
    if (transactionData.description) {
      response += ` - ${transactionData.description}`;
    }
    if (transactionData.category) {
      response += ` (${transactionData.category})`;
    }

    if (budgetInfo && transactionData.type === "expense") {
      const remaining = budgetInfo.allocated - budgetInfo.spent;
      if (remaining > 0) {
        response += `\n\n💰 ${transactionData.category} budget remaining: $${remaining.toFixed(2)}`;
      } else {
        response += `\n\n⚠️ ${transactionData.category} budget exceeded by $${Math.abs(remaining).toFixed(2)}`;
      }
    }

    return response;
  } catch (error) {
    console.error("Error creating transaction:", error);
    return "Sorry, I couldn't record that transaction. Please try again.";
  }
}

/**
 * Handle budget query commands
 */
async function handleBudgetQuery(
  userId: string,
  budgetAccountId: string | null,
  message: string,
): Promise<string> {
  if (!budgetAccountId) {
    return "You need to set up a budget account first. Please log into your account and create a budget.";
  }

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  try {
    // Check if asking for specific category
    const words = message.toLowerCase().split(" ");
    const budgetIndex = words.findIndex(
      (word) => word === "budget" || word === "balance",
    );
    const categoryName =
      budgetIndex >= 0 && words[budgetIndex + 1]
        ? words[budgetIndex + 1]
        : null;

    if (categoryName) {
      // Query specific category
      const categoryBudget = await getCategoryBudgetInfo(
        budgetAccountId,
        categoryName,
        currentYear,
        currentMonth,
      );
      if (!categoryBudget) {
        return `No budget found for "${categoryName}" this month. Available categories: ${await getAvailableCategories(budgetAccountId)}`;
      }

      const remaining = categoryBudget.allocated - categoryBudget.spent;
      return `💰 ${categoryBudget.categoryName} Budget:
Allocated: $${categoryBudget.allocated.toFixed(2)}
Spent: $${categoryBudget.spent.toFixed(2)}
Remaining: $${remaining.toFixed(2)}${remaining < 0 ? " (over budget)" : ""}`;
    } else {
      // Query all categories
      const allBudgets = await getAllCategoryBudgets(
        budgetAccountId,
        currentYear,
        currentMonth,
      );
      if (allBudgets.length === 0) {
        return "No budgets set up for this month. Please log into your account to create budget categories.";
      }

      let response = `📊 Budget Summary (${currentMonth}/${currentYear}):\n\n`;
      allBudgets.forEach((budget) => {
        const remaining = budget.allocated - budget.spent;
        response += `${budget.categoryName}: $${remaining.toFixed(2)} remaining\n`;
      });

      return response.trim();
    }
  } catch (error) {
    console.error("Error querying budget:", error);
    return "Sorry, I couldn't retrieve budget information. Please try again.";
  }
}

/**
 * Parse transaction message to extract amount, description, and category
 */
function parseTransactionMessage(message: string): TransactionData | null {
  const text = message.trim();

  // Check if it's income
  const isIncome = /\b(income|earned|received|got|deposit)\b/i.test(text);
  const type: "expense" | "income" = isIncome ? "income" : "expense";

  // Extract amount
  const amountMatch = text.match(/\$?(\d+(?:\.\d{2})?)/);
  if (!amountMatch) return null;

  const amount = parseFloat(amountMatch[1]);
  if (isNaN(amount) || amount <= 0) return null;

  // Extract description and category
  let description = text.replace(/\$?\d+(?:\.\d{2})?/, "").trim();

  // Remove common prefixes
  description = description
    .replace(
      /^(spent|paid|bought|expense|income|earned|received|got|deposit|on|for|at|from)\s*/i,
      "",
    )
    .trim();

  // Try to extract category (last word or phrase after "on", "for", "at")
  let category = "";
  const categoryMatch = description.match(/\b(?:on|for|at|from)\s+(.+)$/i);
  if (categoryMatch) {
    category = categoryMatch[1].trim();
    description = description.replace(/\b(?:on|for|at|from)\s+.+$/i, "").trim();
  } else if (description) {
    // Use the entire description as category if no specific preposition found
    const words = description.split(" ");
    if (words.length <= 2) {
      category = description;
    } else {
      // Take last 1-2 words as category
      category = words.slice(-2).join(" ");
      description = words.slice(0, -2).join(" ").trim();
    }
  }

  return {
    amount,
    description: description || `${type} via SMS`,
    category: category || undefined,
    type,
  };
}

/**
 * Find or create a category
 */
async function findOrCreateCategory(
  budgetAccountId: string,
  categoryName: string,
): Promise<string> {
  // First try to find existing category
  const existingCategories = await db
    .select({ id: categories.id })
    .from(categories)
    .where(
      and(
        eq(categories.budgetAccountId, budgetAccountId),
        sql`LOWER(${categories.name}) = LOWER(${categoryName})`,
      ),
    )
    .limit(1);

  if (existingCategories[0]) {
    return existingCategories[0].id;
  }

  // Create new category
  const categoryId = nanoid();
  await db.insert(categories).values({
    id: categoryId,
    budgetAccountId,
    name: categoryName,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return categoryId;
}

/**
 * Get budget remaining for a specific category
 */
async function getBudgetRemainingForCategory(
  budgetAccountId: string,
  categoryId: string,
) {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  const result = await db
    .select({
      allocated: budgetCategories.amount,
      spent: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'expense' THEN ${transactions.amount}::numeric ELSE 0 END), 0)`,
    })
    .from(budgetCategories)
    .innerJoin(budgets, eq(budgetCategories.budgetId, budgets.id))
    .leftJoin(
      transactions,
      and(
        eq(transactions.categoryId, categoryId),
        eq(transactions.budgetAccountId, budgetAccountId),
        sql`EXTRACT(YEAR FROM ${transactions.date}) = ${currentYear}`,
        sql`EXTRACT(MONTH FROM ${transactions.date}) = ${currentMonth}`,
      ),
    )
    .where(
      and(
        eq(budgetCategories.categoryId, categoryId),
        eq(budgets.budgetAccountId, budgetAccountId),
        eq(budgets.year, currentYear),
        eq(budgets.month, currentMonth),
      ),
    )
    .groupBy(budgetCategories.amount)
    .limit(1);

  return result[0] || null;
}

/**
 * Get budget info for a specific category
 */
async function getCategoryBudgetInfo(
  budgetAccountId: string,
  categoryName: string,
  year: number,
  month: number,
): Promise<BudgetQueryResult | null> {
  const result = await db
    .select({
      categoryName: categories.name,
      allocated: budgetCategories.amount,
      spent: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'expense' THEN ${transactions.amount}::numeric ELSE 0 END), 0)`,
    })
    .from(categories)
    .innerJoin(budgetCategories, eq(categories.id, budgetCategories.categoryId))
    .innerJoin(budgets, eq(budgetCategories.budgetId, budgets.id))
    .leftJoin(
      transactions,
      and(
        eq(transactions.categoryId, categories.id),
        eq(transactions.budgetAccountId, budgetAccountId),
        sql`EXTRACT(YEAR FROM ${transactions.date}) = ${year}`,
        sql`EXTRACT(MONTH FROM ${transactions.date}) = ${month}`,
      ),
    )
    .where(
      and(
        eq(categories.budgetAccountId, budgetAccountId),
        sql`LOWER(${categories.name}) = LOWER(${categoryName})`,
        eq(budgets.year, year),
        eq(budgets.month, month),
      ),
    )
    .groupBy(categories.name, budgetCategories.amount)
    .limit(1);

  if (!result[0]) return null;

  const { categoryName: name, allocated, spent } = result[0];
  return {
    categoryName: name,
    allocated: parseFloat(allocated),
    spent: spent,
    remaining: parseFloat(allocated) - spent,
  };
}

/**
 * Get all category budgets for current month
 */
async function getAllCategoryBudgets(
  budgetAccountId: string,
  year: number,
  month: number,
): Promise<BudgetQueryResult[]> {
  const results = await db
    .select({
      categoryName: categories.name,
      allocated: budgetCategories.amount,
      spent: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'expense' THEN ${transactions.amount}::numeric ELSE 0 END), 0)`,
    })
    .from(categories)
    .innerJoin(budgetCategories, eq(categories.id, budgetCategories.categoryId))
    .innerJoin(budgets, eq(budgetCategories.budgetId, budgets.id))
    .leftJoin(
      transactions,
      and(
        eq(transactions.categoryId, categories.id),
        eq(transactions.budgetAccountId, budgetAccountId),
        sql`EXTRACT(YEAR FROM ${transactions.date}) = ${year}`,
        sql`EXTRACT(MONTH FROM ${transactions.date}) = ${month}`,
      ),
    )
    .where(
      and(
        eq(categories.budgetAccountId, budgetAccountId),
        eq(budgets.year, year),
        eq(budgets.month, month),
      ),
    )
    .groupBy(categories.name, budgetCategories.amount)
    .orderBy(categories.name);

  return results.map((result) => ({
    categoryName: result.categoryName,
    allocated: parseFloat(result.allocated),
    spent: result.spent,
    remaining: parseFloat(result.allocated) - result.spent,
  }));
}

/**
 * Get available categories for the budget account
 */
async function getAvailableCategories(
  budgetAccountId: string,
): Promise<string> {
  const categoryList = await db
    .select({ name: categories.name })
    .from(categories)
    .where(eq(categories.budgetAccountId, budgetAccountId))
    .orderBy(categories.name)
    .limit(10);

  return categoryList.map((c) => c.name).join(", ") || "none";
}

/**
 * Get help message with available commands
 */
function getHelpMessage(): string {
  return `💡 SMS Budget Assistant Help

📝 RECORD TRANSACTIONS:
• "Spent $25 on groceries"
• "Paid $50 for gas"
• "Income $500 freelance work"
• "Bought $15 coffee"

💰 CHECK BUDGETS:
• "Budget groceries" - specific category
• "Budget" - all categories summary
• "Balance gas" - check gas category

🎯 TIPS:
• Use keywords: spent, paid, bought, income, earned
• Include $ amount and description
• Categories are auto-created if needed
• All amounts in USD

Questions? Reply "help" anytime!`;
}
