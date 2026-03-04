import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

import db from "../../../../utils/dbConfig.js";
import { Budget, Expense } from "../../../../utils/schema.js";
import { getAuthenticatedUserEmail } from "../../../../lib/server-auth.js";

function getExpenseId(params) {
  const expenseId = Number(params?.id);
  return Number.isInteger(expenseId) && expenseId > 0 ? expenseId : null;
}

function getExpenseAmount(value) {
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0 ? amount : null;
}

function getBudgetId(value) {
  const budgetId = Number(value);
  return Number.isInteger(budgetId) && budgetId > 0 ? budgetId : null;
}

function getExpenseDate(value) {
  if (!value) {
    return null;
  }

  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

async function getOwnedExpense(email, expenseId) {
  const [expense] = await db
    .select({
      id: Expense.id,
      budgetId: Expense.budgetId,
    })
    .from(Expense)
    .innerJoin(Budget, eq(Budget.id, Expense.budgetId))
    .where(and(eq(Expense.id, expenseId), eq(Budget.createdBy, email)));

  return expense ?? null;
}

export async function PATCH(request, context) {
  const email = await getAuthenticatedUserEmail();

  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const params = await Promise.resolve(context.params);
  const expenseId = getExpenseId(params);

  if (!expenseId) {
    return NextResponse.json({ error: "Invalid expense id" }, { status: 400 });
  }

  const { name, amount, budgetId, date } = await request.json();
  const trimmedName = name?.trim();
  const parsedAmount = getExpenseAmount(amount);
  const parsedBudgetId = getBudgetId(budgetId);
  const parsedDate = getExpenseDate(date);

  if (!trimmedName || !parsedAmount || !parsedBudgetId || !parsedDate) {
    return NextResponse.json(
      { error: "Expense name, amount, budget, and date are required" },
      { status: 400 }
    );
  }

  const ownedExpense = await getOwnedExpense(email, expenseId);

  if (!ownedExpense) {
    return NextResponse.json({ error: "Expense not found" }, { status: 404 });
  }

  const [budget] = await db
    .select({ id: Budget.id })
    .from(Budget)
    .where(and(eq(Budget.id, parsedBudgetId), eq(Budget.createdBy, email)));

  if (!budget) {
    return NextResponse.json({ error: "Budget not found" }, { status: 404 });
  }

  const [expense] = await db
    .update(Expense)
    .set({
      description: trimmedName,
      amount: parsedAmount,
      budgetId: parsedBudgetId,
      createdAt: parsedDate,
    })
    .where(eq(Expense.id, expenseId))
    .returning();

  return NextResponse.json({ expense });
}

export async function DELETE(_request, context) {
  const email = await getAuthenticatedUserEmail();

  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const params = await Promise.resolve(context.params);
  const expenseId = getExpenseId(params);

  if (!expenseId) {
    return NextResponse.json({ error: "Invalid expense id" }, { status: 400 });
  }

  const expense = await getOwnedExpense(email, expenseId);

  if (!expense) {
    return NextResponse.json({ error: "Expense not found" }, { status: 404 });
  }

  await db.delete(Expense).where(eq(Expense.id, expenseId));

  return NextResponse.json({ success: true });
}
