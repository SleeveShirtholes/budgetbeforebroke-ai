ALTER TABLE "debt" RENAME COLUMN "balance" TO "payment_amount";--> statement-breakpoint
ALTER TABLE "debt" ADD COLUMN "has_balance" boolean DEFAULT false NOT NULL;