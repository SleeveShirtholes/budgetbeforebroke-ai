CREATE TABLE "email_conversation" (
	"id" text PRIMARY KEY NOT NULL,
	"conversation_id" text NOT NULL,
	"message_id" text,
	"from_email" text NOT NULL,
	"from_name" text NOT NULL,
	"to_email" text NOT NULL,
	"subject" text NOT NULL,
	"message" text NOT NULL,
	"message_type" text NOT NULL,
	"direction" text NOT NULL,
	"raw_email" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "contact_submission" ADD COLUMN "conversation_id" text;--> statement-breakpoint
ALTER TABLE "contact_submission" ADD COLUMN "last_user_message_at" timestamp;--> statement-breakpoint
ALTER TABLE "contact_submission" ADD COLUMN "last_support_message_at" timestamp;