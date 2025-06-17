CREATE TABLE "income_source" (
    "id" text PRIMARY KEY,
    "user_id" text NOT NULL REFERENCES "user" ("id") ON DELETE CASCADE,
    "name" text NOT NULL,
    "amount" decimal(10, 2) NOT NULL,
    "frequency" text NOT NULL CHECK (
        frequency IN (
            'weekly',
            'bi-weekly',
            'monthly'
        )
    ),
    "start_date" timestamp NOT NULL,
    "end_date" timestamp,
    "is_active" boolean NOT NULL DEFAULT true,
    "notes" text,
    "created_at" timestamp NOT NULL DEFAULT now(),
    "updated_at" timestamp NOT NULL DEFAULT now()
);
