import { NextResponse } from "next/server";
import { desc, eq, getTableColumns, sql } from "drizzle-orm";

import db from "../../../utils/dbConfig.js";
import { Budget, Expense } from "../../../utils/schema.js";
import { getAuthenticatedUserEmail } from "../../../lib/server-auth.js";

function getBudgetAmount(value) {
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0 ? amount : null;
}

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

  return NextResponse.json({ budgets });
}

export async function POST(request) {
  const email = await getAuthenticatedUserEmail();

  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, amount, icon } = await request.json();
  const trimmedName = name?.trim();
  const parsedAmount = getBudgetAmount(amount);

  if (!trimmedName || !parsedAmount) {
    return NextResponse.json(
      { error: "Budget name and amount are required" },
      { status: 400 }
    );
  }

  const [budget] = await db
    .insert(Budget)
    .values({
      name: trimmedName,
      amount: parsedAmount,
      icon: icon || "💰",
      createdBy: email,
    })
    .returning();

  return NextResponse.json({ budget }, { status: 201 });
}
