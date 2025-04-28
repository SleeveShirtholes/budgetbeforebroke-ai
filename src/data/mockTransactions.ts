import { Transaction, TransactionCategory } from "@/types/transaction";

const merchants = {
    Food: [
        { name: "Whole Foods Market", location: "San Francisco, CA" },
        { name: "Trader Joe's", location: "Berkeley, CA" },
        { name: "Chipotle", location: "Oakland, CA" },
        { name: "Sweetgreen", location: "San Francisco, CA" },
        { name: "In-N-Out Burger", location: "Daly City, CA" },
    ],
    Transportation: [
        { name: "Shell Gas Station", location: "San Francisco, CA" },
        { name: "Chevron", location: "Oakland, CA" },
        { name: "BART", location: "San Francisco, CA" },
        { name: "Uber", location: "San Francisco, CA" },
        { name: "Lyft", location: "San Francisco, CA" },
    ],
    Utilities: [
        { name: "PG&E", location: "San Francisco, CA" },
        { name: "Comcast", location: "California" },
        { name: "AT&T", location: "California" },
        { name: "Verizon", location: "California" },
        { name: "San Francisco Water", location: "San Francisco, CA" },
    ],
    Entertainment: [
        { name: "Netflix", location: "Los Gatos, CA" },
        { name: "AMC Theaters", location: "San Francisco, CA" },
        { name: "Spotify", location: "New York, NY" },
        { name: "Apple", location: "Cupertino, CA" },
        { name: "Steam Games", location: "Bellevue, WA" },
    ],
    Shopping: [
        { name: "Amazon", location: "Seattle, WA" },
        { name: "Target", location: "San Francisco, CA" },
        { name: "Best Buy", location: "San Francisco, CA" },
        { name: "Nike", location: "San Francisco, CA" },
        { name: "Apple Store", location: "San Francisco, CA" },
    ],
    Income: [
        { name: "Tech Corp Inc", location: "San Francisco, CA" },
        { name: "Freelance Client", location: "Remote" },
        { name: "Investment Dividend", location: "New York, NY" },
        { name: "Side Gig LLC", location: "Remote" },
        { name: "Consulting Work", location: "San Francisco, CA" },
    ],
};

function getMerchantForCategory(category: TransactionCategory): { name: string; location: string } {
    const categoryMerchants = merchants[category as keyof typeof merchants] || merchants.Shopping;
    return categoryMerchants[Math.floor(Math.random() * categoryMerchants.length)];
}

function generateMockTransactions(count: number): Transaction[] {
    const transactions: Transaction[] = [];
    const categories: TransactionCategory[] = [
        "Housing",
        "Transportation",
        "Food",
        "Utilities",
        "Insurance",
        "Healthcare",
        "Savings",
        "Personal",
        "Entertainment",
        "Debt",
        "Income",
        "Other",
    ];

    for (let i = 0; i < count; i++) {
        const isIncome = Math.random() < 0.2; // 20% chance of being income
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 30)); // Random date within last 30 days

        const category = isIncome ? "Income" : categories[Math.floor(Math.random() * (categories.length - 1))];
        const merchant = getMerchantForCategory(category);

        const transaction: Transaction = {
            id: `tr-${i + 1}`,
            date: date.toISOString(),
            description: `Payment to ${merchant.name}`,
            merchant: merchant.name,
            merchantLocation: merchant.location,
            amount: isIncome
                ? Math.floor(Math.random() * 3000) + 2000 // Income: $2000-5000
                : Math.floor(Math.random() * 200) + 10, // Expense: $10-210
            type: isIncome ? "income" : "expense",
            category,
            createdAt: date.toISOString(),
            updatedAt: date.toISOString(),
        };

        transactions.push(transaction);
    }

    // Sort by date descending (most recent first)
    return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export const mockTransactions = generateMockTransactions(100);
