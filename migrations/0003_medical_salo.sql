CREATE TABLE "plaid_account" (
	"id" text PRIMARY KEY NOT NULL,
	"plaid_item_id" text NOT NULL,
	"plaid_account_id" text NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"subtype" text NOT NULL,
	"mask" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "plaid_account_plaid_account_id_unique" UNIQUE("plaid_account_id")
);
--> statement-breakpoint
CREATE TABLE "plaid_item" (
	"id" text PRIMARY KEY NOT NULL,
	"budget_account_id" text NOT NULL,
	"user_id" text NOT NULL,
	"plaid_item_id" text NOT NULL,
	"plaid_access_token" text NOT NULL,
	"plaid_institution_id" text NOT NULL,
	"plaid_institution_name" text NOT NULL,
	"status" text NOT NULL,
	"last_sync_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "plaid_item_plaid_item_id_unique" UNIQUE("plaid_item_id")
);
--> statement-breakpoint
ALTER TABLE "budget_account" ADD COLUMN "account_number" text NOT NULL;--> statement-breakpoint
ALTER TABLE "transaction" ADD COLUMN "plaid_item_id" text;--> statement-breakpoint
ALTER TABLE "transaction" ADD COLUMN "plaid_account_id" text;--> statement-breakpoint
ALTER TABLE "transaction" ADD COLUMN "plaid_transaction_id" text;--> statement-breakpoint
ALTER TABLE "transaction" ADD COLUMN "merchant_name" text;--> statement-breakpoint
ALTER TABLE "transaction" ADD COLUMN "plaid_category" text;--> statement-breakpoint
ALTER TABLE "transaction" ADD COLUMN "pending" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "plaid_account" ADD CONSTRAINT "plaid_account_plaid_item_id_plaid_item_id_fk" FOREIGN KEY ("plaid_item_id") REFERENCES "public"."plaid_item"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plaid_item" ADD CONSTRAINT "plaid_item_budget_account_id_budget_account_id_fk" FOREIGN KEY ("budget_account_id") REFERENCES "public"."budget_account"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plaid_item" ADD CONSTRAINT "plaid_item_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_plaid_item_id_plaid_item_id_fk" FOREIGN KEY ("plaid_item_id") REFERENCES "public"."plaid_item"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_plaid_account_id_plaid_account_id_fk" FOREIGN KEY ("plaid_account_id") REFERENCES "public"."plaid_account"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budget_account" ADD CONSTRAINT "budget_account_account_number_unique" UNIQUE("account_number");--> statement-breakpoint
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_plaid_transaction_id_unique" UNIQUE("plaid_transaction_id");