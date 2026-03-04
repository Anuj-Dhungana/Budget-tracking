import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

import db from "../../../../utils/dbConfig.js";
import { Budget, RecurringExpense } from "../../../../utils/schema.js";
import { getAuthenticatedUserEmail } from "../../../../lib/server-auth.js";
import {
  ensureOwnedBudget,
  generateDueRecurringExpenses,
  getRescheduledNextRunAt,
  normalizeRecurringRuleInput,
  serializeRecurringRule,
} from "../../../../lib/recurring-expenses.js";

function getRecurringId(params) {
  const recurringId = Number(params?.id);
  return Number.isInteger(recurringId) && recurringId > 0 ? recurringId : null;
}

async function getOwnedRule(email, recurringId) {
  const [rule] = await db
    .select()
    .from(RecurringExpense)
    .where(and(eq(RecurringExpense.id, recurringId), eq(RecurringExpense.createdBy, email)));

  return rule ?? null;
}

export async function PATCH(request, context) {
  const email = await getAuthenticatedUserEmail();

  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const params = await Promise.resolve(context.params);
  const recurringId = getRecurringId(params);

  if (!recurringId) {
    return NextResponse.json({ error: "Invalid recurring rule id" }, { status: 400 });
  }

  const existingRule = await getOwnedRule(email, recurringId);

  if (!existingRule) {
    return NextResponse.json({ error: "Recurring rule not found" }, { status: 404 });
  }

  const payload = await request.json();

  if (Object.keys(payload).length === 1 && typeof payload.isActive === "boolean") {
    const nextRunAt =
      payload.isActive
        ? getRescheduledNextRunAt(existingRule, existingRule, new Date())
        : existingRule.nextRunAt;

    const [updatedRule] = await db
      .update(RecurringExpense)
      .set({
        isActive: payload.isActive,
        nextRunAt,
        updatedAt: new Date(),
      })
      .where(eq(RecurringExpense.id, recurringId))
      .returning();

    return NextResponse.json({ rule: serializeRecurringRule(updatedRule) });
  }

  const normalizedRule = normalizeRecurringRuleInput(payload, {
    description: existingRule.description,
    amount: existingRule.amount,
    budgetId: existingRule.budgetId,
    frequency: existingRule.frequency,
    interval: existingRule.interval,
    startDateInput: serializeRecurringRule(existingRule).startDateInput,
    runTime: existingRule.runTime,
    endType: existingRule.endDate ? "onDate" : existingRule.maxOccurrences ? "after" : "never",
    endDateInput: serializeRecurringRule(existingRule).endDateInput,
    maxOccurrences: existingRule.maxOccurrences,
    isActive: existingRule.isActive,
  });

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

  const nextRunAt = normalizedRule.isActive
    ? getRescheduledNextRunAt(existingRule, normalizedRule, new Date())
    : existingRule.nextRunAt;

  const [updatedRule] = await db
    .update(RecurringExpense)
    .set({
      budgetId: normalizedRule.budgetId,
      description: normalizedRule.description,
      amount: normalizedRule.amount,
      frequency: normalizedRule.frequency,
      interval: normalizedRule.interval,
      startDate: normalizedRule.startDate,
      runTime: normalizedRule.runTime,
      endDate: normalizedRule.endDate,
      maxOccurrences: normalizedRule.maxOccurrences,
      isActive: normalizedRule.isActive,
      nextRunAt,
      updatedAt: new Date(),
    })
    .where(eq(RecurringExpense.id, recurringId))
    .returning();

  await generateDueRecurringExpenses({
    email,
    recurringId,
  });

  return NextResponse.json({ rule: serializeRecurringRule(updatedRule) });
}

export async function DELETE(_request, context) {
  const email = await getAuthenticatedUserEmail();

  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const params = await Promise.resolve(context.params);
  const recurringId = getRecurringId(params);

  if (!recurringId) {
    return NextResponse.json({ error: "Invalid recurring rule id" }, { status: 400 });
  }

  const rule = await getOwnedRule(email, recurringId);

  if (!rule) {
    return NextResponse.json({ error: "Recurring rule not found" }, { status: 404 });
  }

  await db.delete(RecurringExpense).where(eq(RecurringExpense.id, recurringId));

  return NextResponse.json({ success: true });
}
