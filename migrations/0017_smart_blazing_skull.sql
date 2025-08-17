CREATE TABLE "budget_category" (
	"id" text PRIMARY KEY NOT NULL,
	"budget_id" text NOT NULL,
	"category_id" text NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "budget" (
	"id" text PRIMARY KEY NOT NULL,
	"budget_account_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"year" integer NOT NULL,
	"month" integer NOT NULL,
	"total_budget" numeric(10, 2),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "budget_budget_account_id_year_month_unique" UNIQUE("budget_account_id","year","month")
);
--> statement-breakpoint
CREATE TABLE "dismissed_warnings" (
	"id" text PRIMARY KEY NOT NULL,
	"budget_account_id" text NOT NULL,
	"user_id" text NOT NULL,
	"warning_type" text NOT NULL,
	"warning_key" text NOT NULL,
	"dismissed_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "goal" (
	"id" text PRIMARY KEY NOT NULL,
	"budget_account_id" text NOT NULL,
	"created_by_user_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"target_amount" numeric(10, 2) NOT NULL,
	"current_amount" numeric(10, 2) DEFAULT '0' NOT NULL,
	"target_date" timestamp,
	"status" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
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
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "budget_category" ADD CONSTRAINT "budget_category_budget_id_budget_id_fk" FOREIGN KEY ("budget_id") REFERENCES "public"."budget"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budget_category" ADD CONSTRAINT "budget_category_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budget" ADD CONSTRAINT "budget_budget_account_id_budget_account_id_fk" FOREIGN KEY ("budget_account_id") REFERENCES "public"."budget_account"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dismissed_warnings" ADD CONSTRAINT "dismissed_warnings_budget_account_id_budget_account_id_fk" FOREIGN KEY ("budget_account_id") REFERENCES "public"."budget_account"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dismissed_warnings" ADD CONSTRAINT "dismissed_warnings_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goal" ADD CONSTRAINT "goal_budget_account_id_budget_account_id_fk" FOREIGN KEY ("budget_account_id") REFERENCES "public"."budget_account"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goal" ADD CONSTRAINT "goal_created_by_user_id_user_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "monthly_debt_planning" ADD CONSTRAINT "monthly_debt_planning_budget_account_id_budget_account_id_fk" FOREIGN KEY ("budget_account_id") REFERENCES "public"."budget_account"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "monthly_debt_planning" ADD CONSTRAINT "monthly_debt_planning_debt_id_debt_id_fk" FOREIGN KEY ("debt_id") REFERENCES "public"."debt"("id") ON DELETE cascade ON UPDATE no action;