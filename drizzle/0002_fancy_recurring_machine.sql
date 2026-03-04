CREATE TABLE "recurring_expense" (
	"id" serial PRIMARY KEY NOT NULL,
	"createdBy" varchar(255) NOT NULL,
	"budgetId" integer NOT NULL,
	"description" varchar(255) NOT NULL,
	"amount" integer NOT NULL,
	"frequency" varchar(20) NOT NULL,
	"interval" integer DEFAULT 1 NOT NULL,
	"startDate" timestamp NOT NULL,
	"runTime" varchar(5) DEFAULT '09:00' NOT NULL,
	"endDate" timestamp,
	"maxOccurrences" integer,
	"occurrencesGenerated" integer DEFAULT 0 NOT NULL,
	"nextRunAt" timestamp NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "recurring_expense" ADD CONSTRAINT "recurring_expense_budgetId_budget_id_fk" FOREIGN KEY ("budgetId") REFERENCES "public"."budget"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "expense" ADD COLUMN "source" varchar(20) DEFAULT 'MANUAL' NOT NULL;
--> statement-breakpoint
ALTER TABLE "expense" ADD COLUMN "recurringId" integer;
--> statement-breakpoint
ALTER TABLE "expense" ADD CONSTRAINT "expense_recurringId_recurring_expense_id_fk" FOREIGN KEY ("recurringId") REFERENCES "public"."recurring_expense"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX "expense_recurring_run_unique" ON "expense" USING btree ("recurringId","createdAt");
