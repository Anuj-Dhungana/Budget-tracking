import { NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";

import db from "../../../utils/dbConfig.js";
import { Budget, RecurringExpense } from "../../../utils/schema.js";
import { getAuthenticatedUserEmail } from "../../../lib/server-auth.js";
import {
  ensureOwnedBudget,
  generateDueRecurringExpenses,
  normalizeRecurringRuleInput,
  serializeRecurringRule,
} from "../../../lib/recurring-expenses.js";

function getBudgetId(value) {
  const budgetId = Number(value);
  return Number.isInteger(budgetId) && budgetId > 0 ? budgetId : null;
}

export async function GET(request) {
  const email = await getAuthenticatedUserEmail();

  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await generateDueRecurringExpenses({ email });

  const { searchParams } = new URL(request.url);
  const budgetIdParam = searchParams.get("budgetId");
  const conditions = [eq(RecurringExpense.createdBy, email)];

  if (budgetIdParam) {
    const budgetId = getBudgetId(budgetIdParam);

    if (!budgetId) {
      return NextResponse.json({ error: "Invalid budget id" }, { status: 400 });
    }

    conditions.push(eq(RecurringExpense.budgetId, budgetId));
  }

  const rules = await db
    .select({
      id: RecurringExpense.id,
      description: RecurringExpense.description,
      amount: RecurringExpense.amount,
      budgetId: RecurringExpense.budgetId,
      frequency: RecurringExpense.frequency,
      interval: RecurringExpense.interval,
      startDate: RecurringExpense.startDate,
      runTime: RecurringExpense.runTime,
      endDate: RecurringExpense.endDate,
      maxOccurrences: RecurringExpense.maxOccurrences,
      occurrencesGenerated: RecurringExpense.occurrencesGenerated,
      nextRunAt: RecurringExpense.nextRunAt,
      isActive: RecurringExpense.isActive,
      createdAt: RecurringExpense.createdAt,
      updatedAt: RecurringExpense.updatedAt,
      budgetName: Budget.name,
      budgetIcon: Budget.icon,
    })
    .from(RecurringExpense)
    .innerJoin(Budget, eq(Budget.id, RecurringExpense.budgetId))
    .where(and(...conditions))
    .orderBy(desc(RecurringExpense.createdAt));

  return NextResponse.json({
    rules: rules.map((rule) => serializeRecurringRule(rule)),
  });
}

export async function POST(request) {
  const email = await getAuthenticatedUserEmail();

  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json();
  const normalizedRule = normalizeRecurringRuleInput(payload);

  if (!normalizedRule) {
    return NextResponse.json(
      { error: "Recurring description, amount, schedule, and budget are required" },
      { status: 400 }
    );
  }

  const budget = await ensureOwnedBudget(email, normalizedRule.budgetId);

  if (!budget) {
    return NextResponse.json({ error: "Budget not found" }, { status: 404 });
  }

  const [rule] = await db
    .insert(RecurringExpense)
    .values({
      createdBy: email,
      budgetId: normalizedRule.budgetId,
      description: normalizedRule.description,
      amount: normalizedRule.amount,
      frequency: normalizedRule.frequency,
      interval: normalizedRule.interval,
      startDate: normalizedRule.startDate,
      runTime: normalizedRule.runTime,
      endDate: normalizedRule.endDate,
      maxOccurrences: normalizedRule.maxOccurrences,
      occurrencesGenerated: 0,
      nextRunAt: normalizedRule.startDate,
      isActive: normalizedRule.isActive,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  await generateDueRecurringExpenses({
    email,
    recurringId: rule.id,
  });

  const [savedRule] = await db
    .select({
      id: RecurringExpense.id,
      description: RecurringExpense.description,
      amount: RecurringExpense.amount,
      budgetId: RecurringExpense.budgetId,
      frequency: RecurringExpense.frequency,
      interval: RecurringExpense.interval,
      startDate: RecurringExpense.startDate,
      runTime: RecurringExpense.runTime,
      endDate: RecurringExpense.endDate,
      maxOccurrences: RecurringExpense.maxOccurrences,
      occurrencesGenerated: RecurringExpense.occurrencesGenerated,
      nextRunAt: RecurringExpense.nextRunAt,
      isActive: RecurringExpense.isActive,
      createdAt: RecurringExpense.createdAt,
      updatedAt: RecurringExpense.updatedAt,
      budgetName: Budget.name,
      budgetIcon: Budget.icon,
    })
    .from(RecurringExpense)
    .innerJoin(Budget, eq(Budget.id, RecurringExpense.budgetId))
    .where(eq(RecurringExpense.id, rule.id));

  return NextResponse.json(
    { rule: serializeRecurringRule(savedRule) },
    { status: 201 }
  );
}
