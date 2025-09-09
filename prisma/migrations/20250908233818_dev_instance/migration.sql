-- CreateTable
CREATE TABLE "public"."user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "phone_number" TEXT,
    "is_global_admin" BOOLEAN NOT NULL DEFAULT false,
    "default_budget_account_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "password_changed_at" TIMESTAMP(3),

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."session" (
    "id" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."account" (
    "id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "access_token" TEXT,
    "refresh_token" TEXT,
    "id_token" TEXT,
    "access_token_expires_at" TIMESTAMP(3),
    "refresh_token_expires_at" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "password_changed_at" TIMESTAMP(3),

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."passkey" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "public_key" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "credential_i_d" TEXT NOT NULL,
    "counter" INTEGER NOT NULL,
    "device_type" TEXT NOT NULL,
    "backed_up" BOOLEAN NOT NULL,
    "transports" TEXT,
    "created_at" TIMESTAMP(3),

    CONSTRAINT "passkey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."budget_account" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "account_number" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "budget_account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."budget_account_member" (
    "id" TEXT NOT NULL,
    "budget_account_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "budget_account_member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."budget_account_invitation" (
    "id" TEXT NOT NULL,
    "budget_account_id" TEXT NOT NULL,
    "inviter_id" TEXT NOT NULL,
    "invitee_email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "budget_account_invitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."budget" (
    "id" TEXT NOT NULL,
    "budget_account_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "total_budget" DECIMAL(10,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "budget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."category" (
    "id" TEXT NOT NULL,
    "budget_account_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "icon" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."budget_category" (
    "id" TEXT NOT NULL,
    "budget_id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "budget_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."transaction" (
    "id" TEXT NOT NULL,
    "budget_account_id" TEXT NOT NULL,
    "category_id" TEXT,
    "created_by_user_id" TEXT NOT NULL,
    "plaid_item_id" TEXT,
    "plaid_account_id" TEXT,
    "plaid_transaction_id" TEXT,
    "debt_id" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "description" TEXT,
    "date" DATE NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "merchant_name" TEXT,
    "plaid_category" TEXT,
    "pending" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."goal" (
    "id" TEXT NOT NULL,
    "budget_account_id" TEXT NOT NULL,
    "created_by_user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "target_amount" DECIMAL(10,2) NOT NULL,
    "current_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "target_date" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "goal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."plaid_item" (
    "id" TEXT NOT NULL,
    "budget_account_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "plaid_item_id" TEXT NOT NULL,
    "plaid_access_token" TEXT NOT NULL,
    "plaid_institution_id" TEXT NOT NULL,
    "plaid_institution_name" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "last_sync_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plaid_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."plaid_account" (
    "id" TEXT NOT NULL,
    "plaid_item_id" TEXT NOT NULL,
    "plaid_account_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "subtype" TEXT NOT NULL,
    "mask" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plaid_account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."income_source" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "frequency" TEXT NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "income_source_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."debt" (
    "id" TEXT NOT NULL,
    "budget_account_id" TEXT NOT NULL,
    "created_by_user_id" TEXT NOT NULL,
    "category_id" TEXT,
    "name" TEXT NOT NULL,
    "payment_amount" DECIMAL(10,2) NOT NULL,
    "interest_rate" DECIMAL(5,2) NOT NULL,
    "due_date" DATE NOT NULL,
    "has_balance" BOOLEAN NOT NULL DEFAULT false,
    "last_payment_month" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "debt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."debt_allocations" (
    "id" TEXT NOT NULL,
    "budget_account_id" TEXT NOT NULL,
    "monthly_debt_planning_id" TEXT NOT NULL,
    "paycheck_id" TEXT NOT NULL,
    "payment_amount" DECIMAL(10,2),
    "payment_date" DATE,
    "is_paid" BOOLEAN NOT NULL DEFAULT false,
    "paid_at" TIMESTAMP(3),
    "note" TEXT,
    "allocated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "debt_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."monthly_debt_planning" (
    "id" TEXT NOT NULL,
    "budget_account_id" TEXT NOT NULL,
    "debt_id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "due_date" DATE NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "monthly_debt_planning_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."support_request" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "user_id" TEXT NOT NULL,
    "upvotes" INTEGER NOT NULL DEFAULT 0,
    "downvotes" INTEGER NOT NULL DEFAULT 0,
    "last_updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "support_request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."support_comment" (
    "id" TEXT NOT NULL,
    "request_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "support_comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."dismissed_warnings" (
    "id" TEXT NOT NULL,
    "budget_account_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "warning_type" TEXT NOT NULL,
    "warning_key" TEXT NOT NULL,
    "dismissed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dismissed_warnings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."contact_submission" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "status" TEXT NOT NULL DEFAULT 'new',
    "assigned_to" TEXT,
    "notes" TEXT,
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "last_user_message_at" TIMESTAMP(3),
    "last_support_message_at" TIMESTAMP(3),

    CONSTRAINT "contact_submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."email_conversation" (
    "id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "message_id" TEXT,
    "from_email" TEXT NOT NULL,
    "from_name" TEXT NOT NULL,
    "to_email" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "message_type" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "raw_email" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_conversation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "public"."user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "public"."session"("token");

-- CreateIndex
CREATE UNIQUE INDEX "budget_account_account_number_key" ON "public"."budget_account"("account_number");

-- CreateIndex
CREATE UNIQUE INDEX "budget_account_invitation_token_key" ON "public"."budget_account_invitation"("token");

-- CreateIndex
CREATE UNIQUE INDEX "budget_budget_account_id_year_month_key" ON "public"."budget"("budget_account_id", "year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "transaction_plaid_transaction_id_key" ON "public"."transaction"("plaid_transaction_id");

-- CreateIndex
CREATE UNIQUE INDEX "plaid_item_plaid_item_id_key" ON "public"."plaid_item"("plaid_item_id");

-- CreateIndex
CREATE UNIQUE INDEX "plaid_account_plaid_account_id_key" ON "public"."plaid_account"("plaid_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "monthly_debt_planning_budget_account_id_debt_id_year_month_key" ON "public"."monthly_debt_planning"("budget_account_id", "debt_id", "year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "contact_submission_conversation_id_key" ON "public"."contact_submission"("conversation_id");

-- AddForeignKey
ALTER TABLE "public"."session" ADD CONSTRAINT "session_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."account" ADD CONSTRAINT "account_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."passkey" ADD CONSTRAINT "passkey_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."budget_account_member" ADD CONSTRAINT "budget_account_member_budget_account_id_fkey" FOREIGN KEY ("budget_account_id") REFERENCES "public"."budget_account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."budget_account_member" ADD CONSTRAINT "budget_account_member_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."budget_account_invitation" ADD CONSTRAINT "budget_account_invitation_budget_account_id_fkey" FOREIGN KEY ("budget_account_id") REFERENCES "public"."budget_account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."budget_account_invitation" ADD CONSTRAINT "budget_account_invitation_inviter_id_fkey" FOREIGN KEY ("inviter_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."budget" ADD CONSTRAINT "budget_budget_account_id_fkey" FOREIGN KEY ("budget_account_id") REFERENCES "public"."budget_account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."category" ADD CONSTRAINT "category_budget_account_id_fkey" FOREIGN KEY ("budget_account_id") REFERENCES "public"."budget_account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."budget_category" ADD CONSTRAINT "budget_category_budget_id_fkey" FOREIGN KEY ("budget_id") REFERENCES "public"."budget"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."budget_category" ADD CONSTRAINT "budget_category_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transaction" ADD CONSTRAINT "transaction_budget_account_id_fkey" FOREIGN KEY ("budget_account_id") REFERENCES "public"."budget_account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transaction" ADD CONSTRAINT "transaction_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transaction" ADD CONSTRAINT "transaction_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transaction" ADD CONSTRAINT "transaction_plaid_item_id_fkey" FOREIGN KEY ("plaid_item_id") REFERENCES "public"."plaid_item"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transaction" ADD CONSTRAINT "transaction_plaid_account_id_fkey" FOREIGN KEY ("plaid_account_id") REFERENCES "public"."plaid_account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transaction" ADD CONSTRAINT "transaction_debt_id_fkey" FOREIGN KEY ("debt_id") REFERENCES "public"."debt"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."goal" ADD CONSTRAINT "goal_budget_account_id_fkey" FOREIGN KEY ("budget_account_id") REFERENCES "public"."budget_account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."goal" ADD CONSTRAINT "goal_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."plaid_item" ADD CONSTRAINT "plaid_item_budget_account_id_fkey" FOREIGN KEY ("budget_account_id") REFERENCES "public"."budget_account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."plaid_item" ADD CONSTRAINT "plaid_item_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."plaid_account" ADD CONSTRAINT "plaid_account_plaid_item_id_fkey" FOREIGN KEY ("plaid_item_id") REFERENCES "public"."plaid_item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."income_source" ADD CONSTRAINT "income_source_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."debt" ADD CONSTRAINT "debt_budget_account_id_fkey" FOREIGN KEY ("budget_account_id") REFERENCES "public"."budget_account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."debt" ADD CONSTRAINT "debt_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."debt" ADD CONSTRAINT "debt_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."debt_allocations" ADD CONSTRAINT "debt_allocations_budget_account_id_fkey" FOREIGN KEY ("budget_account_id") REFERENCES "public"."budget_account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."debt_allocations" ADD CONSTRAINT "debt_allocations_monthly_debt_planning_id_fkey" FOREIGN KEY ("monthly_debt_planning_id") REFERENCES "public"."monthly_debt_planning"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."debt_allocations" ADD CONSTRAINT "debt_allocations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."monthly_debt_planning" ADD CONSTRAINT "monthly_debt_planning_budget_account_id_fkey" FOREIGN KEY ("budget_account_id") REFERENCES "public"."budget_account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."monthly_debt_planning" ADD CONSTRAINT "monthly_debt_planning_debt_id_fkey" FOREIGN KEY ("debt_id") REFERENCES "public"."debt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."support_request" ADD CONSTRAINT "support_request_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."support_comment" ADD CONSTRAINT "support_comment_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "public"."support_request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."support_comment" ADD CONSTRAINT "support_comment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."dismissed_warnings" ADD CONSTRAINT "dismissed_warnings_budget_account_id_fkey" FOREIGN KEY ("budget_account_id") REFERENCES "public"."budget_account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."dismissed_warnings" ADD CONSTRAINT "dismissed_warnings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."contact_submission" ADD CONSTRAINT "contact_submission_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."email_conversation" ADD CONSTRAINT "email_conversation_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."contact_submission"("conversation_id") ON DELETE RESTRICT ON UPDATE CASCADE;
