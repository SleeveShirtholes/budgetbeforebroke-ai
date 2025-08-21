-- Migration: Update debt_allocations to reference monthly_debt_planning.id
-- This fixes the issue where multiple monthly instances of the same debt were treated as the same debt
-- by changing the foreign key reference from debts.id to monthly_debt_planning.id

-- Step 0: Create a backup table for safety
CREATE TABLE debt_allocations_backup AS SELECT * FROM debt_allocations;

-- Step 1: Add the new column for monthly_debt_planning_id
ALTER TABLE debt_allocations 
ADD COLUMN monthly_debt_planning_id TEXT;

-- Step 2: Create an index on the new column for performance
CREATE INDEX idx_debt_allocations_monthly_planning_id ON debt_allocations(monthly_debt_planning_id);

-- Step 3: Add foreign key constraint to monthly_debt_planning table
ALTER TABLE debt_allocations 
ADD CONSTRAINT fk_debt_allocations_monthly_planning 
FOREIGN KEY (monthly_debt_planning_id) 
REFERENCES monthly_debt_planning(id) ON DELETE CASCADE;

-- Step 4: Log the migration process
CREATE TEMP TABLE migration_log (
  step TEXT,
  records_processed INTEGER,
  records_updated INTEGER,
  records_failed INTEGER,
  details TEXT
);

-- Step 5: Migrate existing data with better matching logic
-- First, try to match by exact date match
UPDATE debt_allocations 
SET monthly_debt_planning_id = (
  SELECT mdp.id 
  FROM monthly_debt_planning mdp 
  WHERE mdp.debt_id = debt_allocations.debt_id 
    AND mdp.budget_account_id = debt_allocations.budget_account_id
    AND mdp.due_date = debt_allocations.payment_date
    AND mdp.is_active = true
  LIMIT 1
)
WHERE monthly_debt_planning_id IS NULL 
  AND payment_date IS NOT NULL;

-- Log the results
INSERT INTO migration_log (step, records_processed, records_updated, records_failed, details)
SELECT 
  'Exact date match',
  COUNT(*),
  COUNT(CASE WHEN monthly_debt_planning_id IS NOT NULL THEN 1 END),
  COUNT(CASE WHEN monthly_debt_planning_id IS NULL THEN 1 END),
  'Matched by exact payment_date = due_date'
FROM debt_allocations 
WHERE payment_date IS NOT NULL;

-- Step 6: For remaining allocations, try to match by year/month with better logic
UPDATE debt_allocations 
SET monthly_debt_planning_id = (
  SELECT mdp.id 
  FROM monthly_debt_planning mdp 
  WHERE mdp.debt_id = debt_allocations.debt_id 
    AND mdp.budget_account_id = debt_allocations.budget_account_id
    AND EXTRACT(YEAR FROM mdp.due_date) = EXTRACT(YEAR FROM COALESCE(debt_allocations.payment_date, debt_allocations.allocated_at))
    AND EXTRACT(MONTH FROM mdp.due_date) = EXTRACT(MONTH FROM COALESCE(debt_allocations.payment_date, debt_allocations.allocated_at))
    AND mdp.is_active = true
  ORDER BY mdp.due_date DESC  -- Prefer the most recent due date in the month
  LIMIT 1
)
WHERE monthly_debt_planning_id IS NULL;

-- Log the results
INSERT INTO migration_log (step, records_processed, records_updated, records_failed, details)
SELECT 
  'Year/month match',
  COUNT(*),
  COUNT(CASE WHEN monthly_debt_planning_id IS NOT NULL THEN 1 END),
  COUNT(CASE WHEN monthly_debt_planning_id IS NULL THEN 1 END),
  'Matched by year/month from payment_date or allocated_at'
FROM debt_allocations;

-- Step 7: Verify migration success
DO $$
DECLARE
  total_allocations INTEGER;
  migrated_allocations INTEGER;
  failed_allocations INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_allocations FROM debt_allocations;
  SELECT COUNT(*) INTO migrated_allocations FROM debt_allocations WHERE monthly_debt_planning_id IS NOT NULL;
  failed_allocations := total_allocations - migrated_allocations;
  
  -- Log the final results
  INSERT INTO migration_log (step, records_processed, records_updated, records_failed, details)
  VALUES ('Final verification', total_allocations, migrated_allocations, failed_allocations, 
          'Total allocations: ' || total_allocations || ', Migrated: ' || migrated_allocations || ', Failed: ' || failed_allocations);
  
  -- If any allocations failed to migrate, raise an error
  IF failed_allocations > 0 THEN
    RAISE EXCEPTION 'Migration failed: % allocations could not be linked to monthly_debt_planning records', failed_allocations;
  END IF;
END $$;

-- Step 8: Make the new column NOT NULL after successful data migration
ALTER TABLE debt_allocations 
ALTER COLUMN monthly_debt_planning_id SET NOT NULL;

-- Step 9: Drop the old foreign key constraint and column
ALTER TABLE debt_allocations 
DROP CONSTRAINT IF EXISTS debt_allocations_debt_id_debt_id_fk;

ALTER TABLE debt_allocations 
DROP COLUMN debt_id;

-- Step 10: Add constraints and indexes
ALTER TABLE debt_allocations 
ADD CONSTRAINT check_monthly_planning_required 
CHECK (monthly_debt_planning_id IS NOT NULL);

CREATE INDEX idx_debt_allocations_monthly_planning_budget_account 
ON debt_allocations(monthly_debt_planning_id, budget_account_id);

-- Step 11: Display migration results
SELECT * FROM migration_log ORDER BY step;

-- Step 12: Clean up
DROP TABLE migration_log;