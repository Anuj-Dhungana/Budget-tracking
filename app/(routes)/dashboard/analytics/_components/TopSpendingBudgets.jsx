import React from "react";
import { AlertTriangle, BadgeCheck, Sparkles } from "lucide-react";

import { formatCurrency } from "./analytics-utils";

function getBudgetHealth(progress) {
  if (progress >= 90) {
    return {
      barClass: "bg-red-500",
      messageClass: "text-red-600 dark:text-red-300",
      message: "Budget almost exhausted",
    };
  }

  if (progress >= 70) {
    return {
      barClass: "bg-amber-500",
      messageClass: "text-amber-600 dark:text-amber-300",
      message: "Spending is getting close to the limit",
    };
  }

  return {
    barClass: "bg-blue-500",
    messageClass: "text-blue-600 dark:text-blue-300",
    message: "Budget remains in a healthy range",
  };
}

function getInsightToneClasses(tone) {
  if (tone === "warning") {
    return {
      cardClass: "bg-amber-50 dark:bg-amber-950/30",
      textClass: "text-amber-700 dark:text-amber-300",
      Icon: AlertTriangle,
    };
  }

  if (tone === "success") {
    return {
      cardClass: "bg-emerald-50 dark:bg-emerald-950/30",
      textClass: "text-emerald-700 dark:text-emerald-300",
      Icon: BadgeCheck,
    };
  }

  return {
    cardClass: "bg-blue-50 dark:bg-blue-950/30",
    textClass: "text-blue-700 dark:text-blue-300",
    Icon: Sparkles,
  };
}

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
            {budgets.map((budget) => {
              const health = getBudgetHealth(budget.progress);

              return (
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
                      className={`h-full rounded-full ${health.barClass}`}
                      style={{ width: `${budget.progress}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {formatCurrency(budget.value)} / {formatCurrency(budget.budgetAmount || 0)}
                  </p>
                  <p className={`mt-2 text-xs font-medium ${health.messageClass}`}>
                    {health.message}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl bg-muted/40 px-6 py-10 text-center text-sm text-muted-foreground">
            No top spending budgets available for this period.
          </div>
        )}
      </div>

      <div className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-card-foreground">
            Financial Insights
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Helpful highlights that explain your recent financial behavior.
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
            {insights.map((insight) => {
              const tone = getInsightToneClasses(insight.tone);
              const Icon = tone.Icon;

              return (
                <div
                  key={`${insight.title}-${insight.message}`}
                  className={`rounded-2xl px-4 py-4 ${tone.cardClass}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`rounded-xl bg-background/80 p-2 ${tone.textClass}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className={`text-sm font-semibold ${tone.textClass}`}>
                        {insight.title}
                      </p>
                      <p className="mt-1 text-sm text-card-foreground">
                        {insight.message}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
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
