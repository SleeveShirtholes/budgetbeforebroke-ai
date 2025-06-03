ALTER TABLE "user" ADD COLUMN "default_budget_account_id" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "password_changed_at" timestamp;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_default_budget_account_id_budget_account_id_fk" FOREIGN KEY ("default_budget_account_id") REFERENCES "public"."budget_account"("id") ON DELETE no action ON UPDATE no action;