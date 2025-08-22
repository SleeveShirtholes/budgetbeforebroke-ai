-- Migration: Add unique constraint to monthly_debt_planning table
-- This prevents duplicate monthly planning records for the same debt and month

-- Add unique constraint to ensure one record per debt per month per budget account
ALTER TABLE monthly_debt_planning 
ADD CONSTRAINT unique_monthly_debt_planning 
UNIQUE (budget_account_id, debt_id, year, month);

-- Create an index to support the unique constraint efficiently
CREATE INDEX idx_monthly_debt_planning_unique 
ON monthly_debt_planning (budget_account_id, debt_id, year, month);

-- Log the migration
DO $$
BEGIN
  RAISE NOTICE 'Added unique constraint to monthly_debt_planning table';
  RAISE NOTICE 'Constraint: unique_monthly_debt_planning (budget_account_id, debt_id, year, month)';
END $$;
