import {
  boolean,
  integer,
  pgTable,
  serial,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

export const Budget = pgTable("budget", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  amount: integer("amount").notNull(),
  icon: varchar("icon"),
  createdBy: varchar("createdBy", { length: 255 }).notNull(),
});

export const RecurringExpense = pgTable("recurring_expense", {
  id: serial("id").primaryKey(),
  createdBy: varchar("createdBy", { length: 255 }).notNull(),
  budgetId: integer("budgetId")
    .references(() => Budget.id)
    .notNull(),
  description: varchar("description", { length: 255 }).notNull(),
  amount: integer("amount").notNull(),
  frequency: varchar("frequency", { length: 20 }).notNull(),
  interval: integer("interval").default(1).notNull(),
  startDate: timestamp("startDate").notNull(),
  runTime: varchar("runTime", { length: 5 }).default("09:00").notNull(),
  endDate: timestamp("endDate"),
  maxOccurrences: integer("maxOccurrences"),
  occurrencesGenerated: integer("occurrencesGenerated").default(0).notNull(),
  nextRunAt: timestamp("nextRunAt").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const Expense = pgTable(
  "expense",
  {
    id: serial("id").primaryKey(),
    amount: integer("amount").notNull(),
    description: varchar("description", { length: 255 }).notNull(),
    budgetId: integer("budgetId").references(() => Budget.id),
    createdAt: timestamp("createdAt").defaultNow(),
    createdBy: varchar("createdBy", { length: 255 }),
    source: varchar("source", { length: 20 }).default("MANUAL").notNull(),
    recurringId: integer("recurringId").references(() => RecurringExpense.id),
  },
  (table) => ({
    recurringRunUnique: uniqueIndex("expense_recurring_run_unique").on(
      table.recurringId,
      table.createdAt
    ),
  })
);
