"use client";

import Link from "next/link";
import React from "react";
import { ArrowRight, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "../../../../components/ui/button";
import { apiRequest } from "../../../../lib/api.js";

function formatCurrency(amount) {
  return `\u0930\u0941 ${new Intl.NumberFormat("en-NP", {
    maximumFractionDigits: 0,
  }).format(amount || 0)}`;
}

function formatDate(dateString) {
  if (!dateString) {
    return "";
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function RecentExpensesTable({ expenses = [], loading = false, refreshData }) {
  const deleteExpense = async (expenseId) => {
    try {
      await apiRequest(`/api/expenses/${expenseId}`, {
        method: "DELETE",
      });

      toast.success("Expense deleted");
      if (typeof refreshData === "function") {
        refreshData();
      }
    } catch (error) {
      console.error("Error deleting expense:", error);
      toast.error(error.message || "Failed to delete expense");
    }
  };

  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-card-foreground">Latest Expenses</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Keep track of your most recent spending activity.
          </p>
        </div>
        <Link
          href="/dashboard/expenses"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary"
        >
          View All Expenses
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-6">
        <div className="hidden rounded-2xl bg-muted px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground md:grid md:grid-cols-[2fr_1.2fr_1fr_1fr_auto] md:gap-4">
          <span>Description</span>
          <span>Budget</span>
          <span>Amount</span>
          <span>Date</span>
          <span className="text-right">Action</span>
        </div>

        <div className="mt-3 space-y-3">
          {loading
            ? [1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-[92px] animate-pulse rounded-2xl bg-muted"
                />
              ))
            : expenses.length > 0
              ? expenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="grid gap-4 rounded-2xl border border-border px-4 py-4 md:grid-cols-[2fr_1.2fr_1fr_1fr_auto] md:items-center"
                  >
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground md:hidden">
                        Description
                      </p>
                      <p className="font-medium text-card-foreground">{expense.description}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground md:hidden">
                        Budget
                      </p>
                      <p className="text-muted-foreground">{expense.budgetName || "Unassigned"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground md:hidden">
                        Amount
                      </p>
                      <p className="font-medium text-card-foreground">{formatCurrency(expense.amount)}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground md:hidden">
                        Date
                      </p>
                      <p className="text-muted-foreground">{formatDate(expense.createdAt)}</p>
                    </div>
                    <div className="md:justify-self-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteExpense(expense.id)}
                        className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/50 dark:hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              : (
                <div className="rounded-2xl border border-dashed border-border bg-muted/40 px-6 py-10 text-center">
                  <h3 className="text-lg font-medium text-card-foreground">No recent expenses yet</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Add your first expense from a budget to start building activity history.
                  </p>
                </div>
              )}
        </div>
      </div>
    </div>
  );
}

export default RecentExpensesTable;
