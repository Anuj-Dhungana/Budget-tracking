import { NextResponse } from "next/server";
import { and, desc, eq, like } from "drizzle-orm";

import db from "../../../utils/dbConfig.js";
import { Budget, Expense } from "../../../utils/schema.js";
import { getAuthenticatedUserEmail } from "../../../lib/server-auth.js";

function buildWhereClause(conditions) {
  if (conditions.length === 0) {
    return undefined;
  }

  if (conditions.length === 1) {
    return conditions[0];
  }

  return and(...conditions);
}

function getExpenseAmount(value) {
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0 ? amount : null;
}

function getBudgetId(value) {
  const budgetId = Number(value);
  return Number.isInteger(budgetId) && budgetId > 0 ? budgetId : null;
}

export async function GET(request) {
  const email = await getAuthenticatedUserEmail();

  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.trim();
  const budgetIdParam = searchParams.get("budgetId");
  const limitParam = searchParams.get("limit");

  const conditions = [eq(Budget.createdBy, email)];

  if (search) {
    conditions.push(like(Expense.description, `%${search}%`));
  }

  if (budgetIdParam && budgetIdParam !== "all") {
    const budgetId = getBudgetId(budgetIdParam);

    if (!budgetId) {
      return NextResponse.json(
        { error: "Invalid budget filter" },
        { status: 400 }
      );
    }

    conditions.push(eq(Expense.budgetId, budgetId));
  }

  let query = db
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
    .where(buildWhereClause(conditions))
    .orderBy(desc(Expense.createdAt));

  const limit = Number(limitParam);

  if (Number.isInteger(limit) && limit > 0) {
    query = query.limit(limit);
  }

  const expenses = await query;

  return NextResponse.json({ expenses });
}

export async function POST(request) {
  const email = await getAuthenticatedUserEmail();

  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, amount, budgetId } = await request.json();
  const trimmedName = name?.trim();
  const parsedAmount = getExpenseAmount(amount);
  const parsedBudgetId = getBudgetId(budgetId);

  if (!trimmedName || !parsedAmount || !parsedBudgetId) {
    return NextResponse.json(
      { error: "Expense name, amount, and budget are required" },
      { status: 400 }
    );
  }

  const [budget] = await db
    .select({ id: Budget.id })
    .from(Budget)
    .where(and(eq(Budget.id, parsedBudgetId), eq(Budget.createdBy, email)));

  if (!budget) {
    return NextResponse.json({ error: "Budget not found" }, { status: 404 });
  }

  const [expense] = await db
    .insert(Expense)
    .values({
      description: trimmedName,
      amount: parsedAmount,
      budgetId: parsedBudgetId,
      createdAt: new Date(),
      createdBy: email,
    })
    .returning();

  return NextResponse.json({ expense }, { status: 201 });
}
