import React from "react";
import { Repeat } from "lucide-react";

export function isRecurringExpense(expense) {
  return expense?.source === "RECURRING" || Boolean(expense?.recurringId);
}

function RecurringExpenseBadge({ expense }) {
  if (!isRecurringExpense(expense)) {
    return null;
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary">
      <Repeat className="h-3 w-3" />
      Recurring
    </span>
  );
}

export default RecurringExpenseBadge;
