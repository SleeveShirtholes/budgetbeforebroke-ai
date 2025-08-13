ALTER TABLE "user"
ADD COLUMN "default_budget_account_id" text REFERENCES "budget_account" ("id");