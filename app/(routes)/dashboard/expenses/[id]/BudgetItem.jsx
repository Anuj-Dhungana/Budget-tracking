import React from "react";

function formatCurrency(amount) {
  return `\u0930\u0941 ${new Intl.NumberFormat("en-NP", {
    maximumFractionDigits: 0,
  }).format(amount || 0)}`;
}

function getBudgetHealth(progress) {
  if (progress >= 90) {
    return {
      barClass: "bg-red-500",
      badgeClass: "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300",
      iconClass: "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300",
    };
  }

  if (progress >= 70) {
    return {
      barClass: "bg-amber-500",
      badgeClass:
        "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
      iconClass:
        "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300",
    };
  }

  return {
    barClass: "bg-blue-500",
    badgeClass: "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300",
    iconClass: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300",
  };
}

function BudgetItem({ budget }) {
  const totalBudget = Number(budget?.amount ?? 0);
  const totalSpend = Number(budget?.totalSpend ?? 0);
  const remainingAmount = Math.max(totalBudget - totalSpend, 0);
  const progress = totalBudget > 0 ? Math.min((totalSpend / totalBudget) * 100, 100) : 0;
  const health = getBudgetHealth(progress);

  return (
    <div className="rounded-[28px] border border-border bg-card p-6 shadow-sm md:p-7">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-4">
          <div
            className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl text-3xl ${health.iconClass}`}
          >
            {budget?.icon || "\u{1F4B0}"}
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-card-foreground">
              {budget?.name}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {formatCurrency(totalSpend)} spent / {formatCurrency(totalBudget)} budget
            </p>
          </div>
        </div>

        <span
          className={`inline-flex w-fit rounded-full px-3 py-1 text-sm font-semibold ${health.badgeClass}`}
        >
          {Math.round(progress)}% used
        </span>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium text-card-foreground">
            Budget health
          </span>
          <span className="text-sm text-muted-foreground">
            {formatCurrency(remainingAmount)} remaining
          </span>
        </div>

        <div className="mt-3 h-3 overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full ${health.barClass}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="rounded-2xl bg-muted/60 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Total Budget
          </p>
          <p className="mt-2 text-xl font-semibold text-card-foreground">
            {formatCurrency(totalBudget)}
          </p>
        </div>

        <div className="rounded-2xl bg-muted/60 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Spent
          </p>
          <p className="mt-2 text-xl font-semibold text-card-foreground">
            {formatCurrency(totalSpend)}
          </p>
        </div>

        <div className="rounded-2xl bg-muted/60 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Remaining
          </p>
          <p className="mt-2 text-xl font-semibold text-card-foreground">
            {formatCurrency(remainingAmount)}
          </p>
        </div>
      </div>
    </div>
  );
}

export default BudgetItem;
