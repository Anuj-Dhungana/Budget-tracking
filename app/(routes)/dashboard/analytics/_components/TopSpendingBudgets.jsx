import React from "react";

import { formatCurrency } from "./analytics-utils";

function TopSpendingBudgets({ budgets = [], insights = [], loading = false }) {
  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-card-foreground">
            Top Spending Budgets
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Quickly identify the categories with the highest spend.
          </p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-[96px] animate-pulse rounded-2xl bg-muted"
              />
            ))}
          </div>
        ) : budgets.length > 0 ? (
          <div className="space-y-3">
            {budgets.map((budget) => (
              <div key={budget.id} className="rounded-2xl bg-muted/40 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-background text-xl shadow-sm">
                      {budget.icon}
                    </div>
                    <div>
                      <p className="font-medium text-card-foreground">{budget.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(budget.value)} spent
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">
                    {Math.round(budget.progress)}%
                  </span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-background">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${budget.progress}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {formatCurrency(budget.value)} / {formatCurrency(budget.budgetAmount || 0)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl bg-muted/40 px-6 py-10 text-center text-sm text-muted-foreground">
            No top spending budgets available for this period.
          </div>
        )}
      </div>

      <div className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-card-foreground">Insights</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Helpful highlights from your spending patterns.
          </p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-12 animate-pulse rounded-2xl bg-muted"
              />
            ))}
          </div>
        ) : insights.length > 0 ? (
          <div className="space-y-3">
            {insights.map((insight) => (
              <div
                key={insight}
                className="rounded-2xl bg-muted/40 px-4 py-3 text-sm text-card-foreground"
              >
                {insight}
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl bg-muted/40 px-6 py-10 text-center text-sm text-muted-foreground">
            Add more expenses to unlock deeper insights.
          </div>
        )}
      </div>
    </div>
  );
}

export default TopSpendingBudgets;
