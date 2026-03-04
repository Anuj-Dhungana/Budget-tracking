import Link from "next/link";
import React from "react";
import { ArrowRight } from "lucide-react";

const MAX_VISIBLE_BUDGETS = 3;

function formatCurrency(amount) {
  return `रु ${new Intl.NumberFormat("en-NP", {
    maximumFractionDigits: 0,
  }).format(amount || 0)}`;
}

function BudgetOverview({ budgets = [], loading = false }) {
  const visibleBudgets = budgets.slice(0, MAX_VISIBLE_BUDGETS);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Budget Overview</h2>
          <p className="mt-1 text-sm text-slate-500">
            Your latest 3 budgets at a glance.
          </p>
        </div>
        <Link
          href="/dashboard/budgets"
          className="hidden items-center gap-1 text-sm font-medium text-primary sm:inline-flex"
        >
          View all
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-6 space-y-4">
        {loading
          ? [1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-[88px] animate-pulse rounded-2xl bg-slate-100"
              />
            ))
          : visibleBudgets.map((budget) => {
              const totalSpend = Number(budget.totalSpend ?? 0);
              const amount = Number(budget.amount ?? 0);
              const progress = amount > 0 ? Math.min((totalSpend / amount) * 100, 100) : 0;

              return (
                <Link
                  key={budget.id}
                  href={`/dashboard/expenses/${budget.id}`}
                  className="block rounded-2xl border border-slate-200 p-4 transition hover:border-primary/30 hover:bg-slate-50"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-xl">
                        {budget.icon || "💼"}
                      </div>
                      <div>
                        <h3 className="font-medium text-slate-900">{budget.name}</h3>
                        <p className="text-sm text-slate-500">
                          {formatCurrency(totalSpend)} / {formatCurrency(amount)} used
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-slate-500">
                      {Math.round(progress)}%
                    </span>
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </Link>
              );
            })}
      </div>

      {!loading && budgets.length > MAX_VISIBLE_BUDGETS ? (
        <Link
          href="/dashboard/budgets"
          className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-primary sm:hidden"
        >
          View all budgets
          <ArrowRight className="h-4 w-4" />
        </Link>
      ) : null}
    </div>
  );
}

export default BudgetOverview;
