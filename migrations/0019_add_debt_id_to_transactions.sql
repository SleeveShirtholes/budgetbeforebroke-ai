-- Add debtId foreign key to transactions table
ALTER TABLE "transaction" ADD COLUMN "debt_id" text REFERENCES "debt"("id") ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX "transaction_debt_id_idx" ON "transaction"("debt_id");
