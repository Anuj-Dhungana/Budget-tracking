import React from "react";

import { formatCurrency } from "./analytics-utils";

function SummaryCard({ title, value, subtitle }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <h3 className="mt-3 text-3xl font-semibold tracking-tight text-card-foreground">
        {value}
      </h3>
      <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
    </div>
  );
}

function SummaryCardSkeleton() {
  return (
    <div className="h-[150px] rounded-3xl border border-border bg-card p-5 shadow-sm">
      <div className="h-full animate-pulse rounded-2xl bg-muted" />
    </div>
  );
}

function AnalyticsSummaryCards({ summary, loading = false }) {
  const largestExpenseSubtitle = summary?.largestExpense?.description
    ? summary.largestExpense.description
    : "No expenses in this range";

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <SummaryCardSkeleton key={item} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <SummaryCard
        title="Total Spent"
        value={formatCurrency(summary?.totalSpent || 0)}
        subtitle="Money spent in the selected period"
      />
      <SummaryCard
        title="Average Expense"
        value={formatCurrency(summary?.averageExpense || 0)}
        subtitle="Typical transaction size"
      />
      <SummaryCard
        title="Largest Expense"
        value={formatCurrency(summary?.largestExpense?.amount || 0)}
        subtitle={largestExpenseSubtitle}
      />
    </div>
  );
}

export default AnalyticsSummaryCards;
