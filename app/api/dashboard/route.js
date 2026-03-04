import { NextResponse } from "next/server";
import { desc, eq, getTableColumns, sql } from "drizzle-orm";

import db from "../../../utils/dbConfig.js";
import { Budget, Expense } from "../../../utils/schema.js";
import { getAuthenticatedUserEmail } from "../../../lib/server-auth.js";

export async function GET() {
  const email = await getAuthenticatedUserEmail();

  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const budgets = await db
    .select({
      ...getTableColumns(Budget),
      totalSpend: sql`COALESCE(sum(${Expense.amount}), 0)`.mapWith(Number),
      totalItems: sql`count(${Expense.id})`.mapWith(Number),
    })
    .from(Budget)
    .leftJoin(Expense, eq(Budget.id, Expense.budgetId))
    .where(eq(Budget.createdBy, email))
    .groupBy(Budget.id)
    .orderBy(desc(Budget.id));

  const expenses = await db
    .select({
      id: Expense.id,
      description: Expense.description,
      amount: Expense.amount,
      createdAt: Expense.createdAt,
      budgetId: Expense.budgetId,
      budgetName: Budget.name,
    })
    .from(Expense)
    .innerJoin(Budget, eq(Budget.id, Expense.budgetId))
    .where(eq(Budget.createdBy, email))
    .orderBy(desc(Expense.createdAt))
    .limit(10);

  return NextResponse.json({ budgets, expenses });
}
