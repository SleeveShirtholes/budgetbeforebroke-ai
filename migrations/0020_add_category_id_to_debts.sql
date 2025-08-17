-- Add categoryId foreign key to debts table
ALTER TABLE "debt" ADD COLUMN "category_id" text REFERENCES "category"("id") ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX "debt_category_id_idx" ON "debt"("category_id");
