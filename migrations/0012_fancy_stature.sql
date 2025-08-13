CREATE TABLE "monthly_debt_planning" (
	"id" text PRIMARY KEY NOT NULL,
	"budget_account_id" text NOT NULL,
	"debt_id" text NOT NULL,
	"year" integer NOT NULL,
	"month" integer NOT NULL,
	"due_date" date NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "debt_payment" ALTER COLUMN "date" SET DATA TYPE date;--> statement-breakpoint
ALTER TABLE "debt_payment" ADD COLUMN "is_paid" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "monthly_debt_planning" ADD CONSTRAINT "monthly_debt_planning_budget_account_id_budget_account_id_fk" FOREIGN KEY ("budget_account_id") REFERENCES "public"."budget_account"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "monthly_debt_planning" ADD CONSTRAINT "monthly_debt_planning_debt_id_debt_id_fk" FOREIGN KEY ("debt_id") REFERENCES "public"."debt"("id") ON DELETE cascade ON UPDATE no action;