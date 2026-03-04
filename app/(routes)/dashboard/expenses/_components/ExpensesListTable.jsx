"use client";

import React, { useState } from "react";
import { Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "../../../../../components/ui/button";
import { Input } from "../../../../../components/ui/input";
import { apiRequest } from "../../../../../lib/api.js";

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
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function ExpensesListTable({ expensesList, refreshData }) {
  const [searchQuery, setSearchQuery] = useState("");
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredExpenses = normalizedQuery
    ? (expensesList || []).filter((expense) =>
        expense.description?.toLowerCase().includes(normalizedQuery)
      )
    : expensesList || [];
  const totalExpenses = (expensesList || []).reduce(
    (total, expense) => total + Number(expense.amount || 0),
    0
  );

  const deleteExpense = async (expenseId) => {
    try {
      await apiRequest(`/api/expenses/${expenseId}`, {
        method: "DELETE",
      });

      toast.success("Expense deleted");
      if (typeof refreshData === "function") {
        await refreshData();
      }
    } catch (error) {
      console.error("Error deleting expense:", error);
      toast.error(error.message || "Failed to delete expense");
    }
  };

  return (
    <div className="rounded-[28px] border border-border bg-card p-6 shadow-sm md:p-7">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-card-foreground">Expenses</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Review every transaction recorded under this budget.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-muted/60 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Total Expenses
            </p>
            <p className="mt-2 text-lg font-semibold text-card-foreground">
              {formatCurrency(totalExpenses)}
            </p>
          </div>
          <div className="rounded-2xl bg-muted/60 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Transactions
            </p>
            <p className="mt-2 text-lg font-semibold text-card-foreground">
              {expensesList?.length || 0}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 max-w-md">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search expense..."
            className="pl-9"
          />
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-border">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/60">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Description
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Date
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {filteredExpenses.length > 0 ? (
                filteredExpenses.map((expense) => (
                  <tr key={expense.id} className="transition hover:bg-muted/30">
                    <td className="px-4 py-4 text-sm font-medium text-card-foreground">
                      {expense.description}
                    </td>
                    <td className="px-4 py-4 text-sm text-card-foreground">
                      {formatCurrency(expense.amount)}
                    </td>
                    <td className="px-4 py-4 text-sm text-muted-foreground">
                      {formatDate(expense.createdAt)}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/40 dark:hover:text-red-300"
                        onClick={() => deleteExpense(expense.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="mx-auto max-w-md">
                      <h3 className="text-lg font-medium text-card-foreground">
                        No expenses added yet.
                      </h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Start tracking spending by adding your first expense.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ExpensesListTable;
