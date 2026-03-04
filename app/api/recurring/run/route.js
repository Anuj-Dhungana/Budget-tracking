import { NextResponse } from "next/server";

import { generateDueRecurringExpenses } from "../../../../lib/recurring-expenses.js";

export async function POST(request) {
  const configuredSecret = process.env.RECURRING_CRON_SECRET;
  const providedSecret = request.headers.get("x-recurring-secret");

  if (!configuredSecret) {
    return NextResponse.json(
      { error: "Recurring cron secret is not configured" },
      { status: 500 }
    );
  }

  if (!providedSecret || providedSecret !== configuredSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const generatedCount = await generateDueRecurringExpenses();

  return NextResponse.json({ success: true, generatedCount });
}
