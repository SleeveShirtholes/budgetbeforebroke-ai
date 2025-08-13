ALTER TABLE "debt_payment" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "debt_payment" CASCADE;--> statement-breakpoint
ALTER TABLE "income_source" ALTER COLUMN "end_date" SET DATA TYPE date;--> statement-breakpoint
ALTER TABLE "debt_allocations" ADD COLUMN "payment_amount" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "debt_allocations" ADD COLUMN "payment_date" date;--> statement-breakpoint
ALTER TABLE "debt_allocations" ADD COLUMN "is_paid" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "debt_allocations" ADD COLUMN "paid_at" timestamp;--> statement-breakpoint
ALTER TABLE "debt_allocations" ADD COLUMN "note" text;--> statement-breakpoint
ALTER TABLE "debt_allocations" ADD CONSTRAINT "debt_allocations_debt_id_debt_id_fk" FOREIGN KEY ("debt_id") REFERENCES "public"."debt"("id") ON DELETE cascade ON UPDATE no action;