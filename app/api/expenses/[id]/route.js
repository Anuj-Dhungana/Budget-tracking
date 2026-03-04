import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

import db from "../../../../utils/dbConfig.js";
import { Budget, Expense } from "../../../../utils/schema.js";
import { getAuthenticatedUserEmail } from "../../../../lib/server-auth.js";

function getExpenseId(params) {
  const expenseId = Number(params?.id);
  return Number.isInteger(expenseId) && expenseId > 0 ? expenseId : null;
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

  const [expense] = await db
    .select({ id: Expense.id })
    .from(Expense)
    .innerJoin(Budget, eq(Budget.id, Expense.budgetId))
    .where(and(eq(Expense.id, expenseId), eq(Budget.createdBy, email)));

  if (!expense) {
    return NextResponse.json({ error: "Expense not found" }, { status: 404 });
  }

  await db.delete(Expense).where(eq(Expense.id, expenseId));

  return NextResponse.json({ success: true });
}
