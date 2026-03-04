CREATE TABLE "expense" (
	"id" serial PRIMARY KEY NOT NULL,
	"amount" integer NOT NULL,
	"description" varchar(255) NOT NULL,
	"budgetId" integer,
	"createdAt" timestamp DEFAULT now(),
	"createdBy" varchar(255)
);
--> statement-breakpoint
ALTER TABLE "expense" ADD CONSTRAINT "expense_budgetId_budget_id_fk" FOREIGN KEY ("budgetId") REFERENCES "public"."budget"("id") ON DELETE no action ON UPDATE no action;