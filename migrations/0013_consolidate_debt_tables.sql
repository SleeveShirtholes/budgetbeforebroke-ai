-- Migration: Consolidate debt_payment and debt_allocations tables
-- This migration implements Option 1 from the schema redesign

-- Step 1: Add new columns to debt_allocations table
ALTER TABLE debt_allocations 
ADD COLUMN payment_amount DECIMAL(10,2),
ADD COLUMN payment_date DATE,
ADD COLUMN is_paid BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN paid_at TIMESTAMP,
ADD COLUMN note TEXT;

-- Step 2: Migrate existing payment data from debt_payment to debt_allocations
-- We'll link payments to allocations based on debt_id and create new allocations if needed
INSERT INTO debt_allocations (
  id, 
  budget_account_id, 
  debt_id, 
  paycheck_id, 
  payment_amount, 
  payment_date, 
  is_paid, 
  paid_at, 
  note, 
  allocated_at, 
  user_id, 
  created_at, 
  updated_at
)
SELECT 
  gen_random_uuid() as id,
  d.budget_account_id,
  dp.debt_id,
  -- For existing payments without allocations, we'll use a default paycheck_id
  -- This will need to be updated by the application logic
  'legacy-migration' as paycheck_id,
  dp.amount as payment_amount,
  dp.date as payment_date,
  dp.is_paid,
  CASE WHEN dp.is_paid THEN dp.updated_at ELSE NULL END as paid_at,
  dp.note,
  dp.created_at as allocated_at,
  d.created_by_user_id as user_id,
  dp.created_at,
  dp.updated_at
FROM debt_payment dp
JOIN debts d ON dp.debt_id = d.id
WHERE NOT EXISTS (
  SELECT 1 FROM debt_allocations da 
  WHERE da.debt_id = dp.debt_id 
  AND da.payment_date = dp.date
);

-- Step 3: Update existing allocations with payment information if they have payments
UPDATE debt_allocations da
SET 
  payment_amount = dp.amount,
  payment_date = dp.date,
  is_paid = dp.is_paid,
  paid_at = CASE WHEN dp.is_paid THEN dp.updated_at ELSE NULL END,
  note = dp.note
FROM debt_payment dp
WHERE da.debt_id = dp.debt_id
AND da.payment_date IS NULL
AND dp.date = (
  SELECT MAX(dp2.date) 
  FROM debt_payment dp2 
  WHERE dp2.debt_id = da.debt_id
);

-- Step 4: Drop the debt_payment table
DROP TABLE debt_payment;

-- Step 5: Add constraints and indexes for better performance
CREATE INDEX idx_debt_allocations_debt_id ON debt_allocations(debt_id);
CREATE INDEX idx_debt_allocations_paycheck_id ON debt_allocations(paycheck_id);
CREATE INDEX idx_debt_allocations_payment_date ON debt_allocations(payment_date);
CREATE INDEX idx_debt_allocations_is_paid ON debt_allocations(is_paid);

-- Step 6: Add a constraint to ensure payment information is consistent
ALTER TABLE debt_allocations 
ADD CONSTRAINT check_payment_consistency 
CHECK (
  (payment_amount IS NULL AND payment_date IS NULL AND note IS NULL) OR
  (payment_amount IS NOT NULL AND payment_date IS NOT NULL)
);
