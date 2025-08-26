ALTER TABLE "debt_allocations" RENAME COLUMN "debt_id" TO "monthly_debt_planning_id";--> statement-breakpoint
ALTER TABLE "debt_allocations" DROP CONSTRAINT "debt_allocations_debt_id_debt_id_fk";
--> statement-breakpoint
ALTER TABLE "debt" ADD COLUMN "category_id" text;--> statement-breakpoint
ALTER TABLE "transaction" ADD COLUMN "debt_id" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "is_global_admin" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "debt_allocations" ADD CONSTRAINT "debt_allocations_monthly_debt_planning_id_monthly_debt_planning_id_fk" FOREIGN KEY ("monthly_debt_planning_id") REFERENCES "public"."monthly_debt_planning"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "debt" ADD CONSTRAINT "debt_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_debt_id_debt_id_fk" FOREIGN KEY ("debt_id") REFERENCES "public"."debt"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "monthly_debt_planning" ADD CONSTRAINT "monthly_debt_planning_budget_account_id_debt_id_year_month_unique" UNIQUE("budget_account_id","debt_id","year","month");