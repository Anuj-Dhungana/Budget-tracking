import { NextResponse } from "next/server";
import { and, desc, eq, getTableColumns, sql } from "drizzle-orm";

import db from "../../../../utils/dbConfig.js";
import { Budget, Expense, RecurringExpense } from "../../../../utils/schema.js";
import { generateDueRecurringExpenses } from "../../../../lib/recurring-expenses.js";
import { getAuthenticatedUserEmail } from "../../../../lib/server-auth.js";

function getBudgetId(params) {
  const budgetId = Number(params?.id);
  return Number.isInteger(budgetId) && budgetId > 0 ? budgetId : null;
}

function getBudgetAmount(value) {
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0 ? amount : null;
}

async function getOwnedBudget(email, budgetId) {
  const [budget] = await db
    .select({
      ...getTableColumns(Budget),
      totalSpend: sql`COALESCE(sum(${Expense.amount}), 0)`.mapWith(Number),
      totalItems: sql`count(${Expense.id})`.mapWith(Number),
    })
    .from(Budget)
    .leftJoin(Expense, eq(Budget.id, Expense.budgetId))
    .where(and(eq(Budget.createdBy, email), eq(Budget.id, budgetId)))
    .groupBy(Budget.id);

  return budget ?? null;
}

export async function GET(_request, context) {
  const email = await getAuthenticatedUserEmail();

  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await generateDueRecurringExpenses({ email });

  const params = await Promise.resolve(context.params);
  const budgetId = getBudgetId(params);

  if (!budgetId) {
    return NextResponse.json({ error: "Invalid budget id" }, { status: 400 });
  }

  const budget = await getOwnedBudget(email, budgetId);

  if (!budget) {
    return NextResponse.json({ error: "Budget not found" }, { status: 404 });
  }

  const expenses = await db
    .select({
      id: Expense.id,
      amount: Expense.amount,
      description: Expense.description,
      budgetId: Expense.budgetId,
      createdAt: Expense.createdAt,
      source: Expense.source,
      recurringId: Expense.recurringId,
    })
    .from(Expense)
    .where(eq(Expense.budgetId, budgetId))
    .orderBy(desc(Expense.createdAt));

  return NextResponse.json({ budget, expenses });
}

export async function PATCH(request, context) {
  const email = await getAuthenticatedUserEmail();

  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const params = await Promise.resolve(context.params);
  const budgetId = getBudgetId(params);

  if (!budgetId) {
    return NextResponse.json({ error: "Invalid budget id" }, { status: 400 });
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
    .update(Budget)
    .set({
      name: trimmedName,
      amount: parsedAmount,
      icon: icon || "💰",
    })
    .where(and(eq(Budget.id, budgetId), eq(Budget.createdBy, email)))
    .returning();

  if (!budget) {
    return NextResponse.json({ error: "Budget not found" }, { status: 404 });
  }

  return NextResponse.json({ budget });
}

export async function DELETE(_request, context) {
  const email = await getAuthenticatedUserEmail();

  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const params = await Promise.resolve(context.params);
  const budgetId = getBudgetId(params);

  if (!budgetId) {
    return NextResponse.json({ error: "Invalid budget id" }, { status: 400 });
  }

  const budget = await getOwnedBudget(email, budgetId);

  if (!budget) {
    return NextResponse.json({ error: "Budget not found" }, { status: 404 });
  }

  await db.delete(Expense).where(eq(Expense.budgetId, budgetId));
  await db.delete(RecurringExpense).where(eq(RecurringExpense.budgetId, budgetId));
  await db
    .delete(Budget)
    .where(and(eq(Budget.id, budgetId), eq(Budget.createdBy, email)));

  return NextResponse.json({ success: true });
}
