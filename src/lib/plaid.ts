import { Configuration, PlaidApi, PlaidEnvironments } from "plaid";

if (!process.env.PLAID_CLIENT_ID) {
  throw new Error("PLAID_CLIENT_ID is not set");
}

if (!process.env.PLAID_SECRET) {
  throw new Error("PLAID_SECRET is not set");
}

const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV || "sandbox"],
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID,
      "PLAID-SECRET": process.env.PLAID_SECRET,
    },
  },
});

export const plaidClient = new PlaidApi(configuration);

export type PlaidEnvironment = "sandbox" | "development" | "production";
